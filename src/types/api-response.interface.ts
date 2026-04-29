export interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T | null;
}

export interface PaginationMeta {
  totalItems: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface ApiListResponse<T, M = PaginationMeta> {
  status: number;
  message: string;
  data: T[];
  meta: M;
}
