export interface PaginatedResult<T> { items: T[]; total: number; page: number; pageSize: number; totalPages: number; hasNext: boolean; hasPrev: boolean; }
export function paginate<T>(items: T[], page: number = 1, pageSize: number = 20): PaginatedResult<T> {
  const total = items.length, totalPages = Math.ceil(total / pageSize);
  const cur = Math.max(1, Math.min(page, totalPages || 1)), start = (cur - 1) * pageSize;
  return { items: items.slice(start, Math.min(start + pageSize, total)), total, page: cur, pageSize, totalPages, hasNext: cur < totalPages, hasPrev: cur > 1 };
}
