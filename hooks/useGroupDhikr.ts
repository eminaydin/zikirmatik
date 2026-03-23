import { useState, useEffect, useRef } from "react";
import { ref, set, onValue, off, runTransaction } from "firebase/database";
import { db } from "../services/firebase";
import { GroupRoom, GroupMember } from "../types/zikir";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function useGroupDhikr() {
  const router = useRouter();
  const [room, setRoom] = useState<GroupRoom | null>(null);
  const [myMemberId, setMyMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const roomListenerRef = useRef<(() => void) | null>(null);

  const subscribeToRoom = (roomId: string, memberId: string) => {
    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoom(data as GroupRoom);
      }
    });
    roomListenerRef.current = () => off(roomRef);
    setMyMemberId(memberId);
  };

  const createRoom = async (params: {
    dhikrText: string;
    dhikrArabic: string;
    totalTarget: number;
    partCount: number;
    myName: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const roomId = generateRoomCode();
      const perPersonTarget = Math.floor(params.totalTarget / params.partCount);
      const memberId = "member_" + Date.now();

      const myMember: GroupMember = {
        name: params.myName,
        target: perPersonTarget,
        count: 0,
        isFinished: false,
      };

      const newRoom: GroupRoom = {
        id: roomId,
        dhikrText: params.dhikrText,
        dhikrArabic: params.dhikrArabic,
        totalTarget: params.totalTarget,
        createdAt: Date.now(),
        members: { [memberId]: myMember },
      };

      await set(ref(db, `rooms/${roomId}`), newRoom);
      subscribeToRoom(roomId, memberId);

      router.push({
        pathname: "/group-counter",
        params: { roomId, memberId },
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (roomId: string, myName: string) => {
    setLoading(true);
    setError(null);
    try {
      const roomRef = ref(db, `rooms/${roomId.toUpperCase()}`);
      let existingRoom: GroupRoom | null = null;

      // Read once to verify room exists
      await new Promise<void>((resolve, reject) => {
        onValue(
          roomRef,
          (snapshot) => {
            const data = snapshot.val();
            if (data) {
              existingRoom = data as GroupRoom;
              resolve();
            } else {
              reject(new Error("ROOM_NOT_FOUND"));
            }
          },
          { onlyOnce: true },
        );
      });

      if (!existingRoom) throw new Error("ROOM_NOT_FOUND");

      // Calculate target for this new member (use same as existing members)
      const existingMemberCount = Object.keys(existingRoom!.members).length;
      const totalMembers = existingMemberCount + 1;
      const perPersonTarget = Math.floor(
        existingRoom!.totalTarget / totalMembers,
      );

      const memberId = "member_" + Date.now();
      const newMember: GroupMember = {
        name: myName,
        target: perPersonTarget,
        count: 0,
        isFinished: false,
      };

      const memberRef = ref(
        db,
        `rooms/${roomId.toUpperCase()}/members/${memberId}`,
      );
      await set(memberRef, newMember);

      subscribeToRoom(roomId.toUpperCase(), memberId);
      router.push({
        pathname: "/group-counter",
        params: { roomId: roomId.toUpperCase(), memberId },
      });
    } catch (e: any) {
      if (e.message === "ROOM_NOT_FOUND") {
        setError("ROOM_NOT_FOUND");
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const increment = async (
    roomId: string,
    memberId: string,
    memberTarget: number,
  ) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const countRef = ref(db, `rooms/${roomId}/members/${memberId}/count`);
    const finishedRef = ref(
      db,
      `rooms/${roomId}/members/${memberId}/isFinished`,
    );

    await runTransaction(countRef, (currentCount) => {
      return (currentCount || 0) + 1;
    }).then(async (result) => {
      if (result.snapshot.val() >= memberTarget) {
        await set(finishedRef, true);
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      }
    });
  };

  const leaveRoom = () => {
    if (roomListenerRef.current) {
      roomListenerRef.current();
      roomListenerRef.current = null;
    }
    setRoom(null);
    setMyMemberId(null);
    router.back();
  };

  useEffect(() => {
    return () => {
      if (roomListenerRef.current) {
        roomListenerRef.current();
      }
    };
  }, []);

  const totalCount = room
    ? Object.values(room.members).reduce((sum, m) => sum + (m.count || 0), 0)
    : 0;

  const allFinished =
    room && Object.values(room.members).every((m) => m.isFinished);

  return {
    room,
    myMemberId,
    loading,
    error,
    setError,
    createRoom,
    joinRoom,
    increment,
    leaveRoom,
    subscribeToRoom,
    totalCount,
    allFinished,
  };
}
