export interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T | null;
}

export interface ApiListResponse<T, M = unknown> {
  status: number;
  message: string;
  data: T[];
  meta: M;
}
