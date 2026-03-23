export interface ZikirData {
  id: string; // Dynamic session ID
  text: string;
  arabic?: string;
  target: number;
  count: number;
  isGroup?: boolean;
  groupRoomId?: string;
  memberId?: string;
}

export interface HistoryItem extends ZikirData {
  date: string;
  isFinished: boolean;
  isGroup?: boolean;
  groupRoomId?: string;
  memberId?: string;
  totalTarget?: number;
  roomCode?: string;
}

export interface StatsData {
  totalCount: number;
  completedGoals: number;
  totalSessions: number;
  totalGroupCount: number;
  completedGroupGoals: number;
  totalGroupSessions: number;
  dailyData: { date: string; count: number }[];
}

export interface GroupMember {
  name: string;
  target: number;
  count: number;
  isFinished: boolean;
}

export interface GroupRoom {
  id: string;
  dhikrText: string;
  dhikrArabic: string;
  totalTarget: number;
  createdAt: number;
  members: Record<string, GroupMember>;
}
