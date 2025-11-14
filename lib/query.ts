export type SortDirection = "asc" | "desc" | undefined;

export const buildOrderBy = (
  sortBy?: string,
  sortDir?: SortDirection,
  mapping?: Record<string, { field: string; relation?: string }>
) => {
  if (!sortBy || !sortDir || !mapping) return undefined;

  const map = mapping[sortBy];
  if (!map) return undefined;

  if (map.relation) {
    return { [map.relation]: { orderBy: { [map.field]: sortDir } } } as any;
  }

  return { [map.field]: sortDir } as any;
};