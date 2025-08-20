export interface BaseFilters {
  page: number;
  limit: number;
}

export interface BaseRepository<
  T,
  ID = string,
  F extends BaseFilters = BaseFilters,
> {
  findById(id: ID): Promise<T | null>;
  findAll(filterOptions: F): Promise<{ data: T[]; total: number }>;
  create(entity: T): Promise<T>;
  update(id: ID, entity: Partial<T>): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
}
