export interface ZikirData {
    id: string; // Dynamic session ID
    text: string;
    arabic?: string;
    target: number;
    count: number;
}

export interface HistoryItem extends ZikirData {
    date: string;
    isFinished: boolean;
}

export interface StatsData {
    totalCount: number;
    completedGoals: number;
    totalSessions: number;
    dailyData: { date: string; count: number }[];
}
