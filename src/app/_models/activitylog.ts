export interface ActivityLog {
  id?: number;
  userId?: number;
  username: string;
  action: string;
  ipAddress?: string;
  createdAt?: string;
}

export interface ActivityLogResponse {
  logs: ActivityLog[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}
