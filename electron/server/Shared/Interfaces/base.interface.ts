
export type IResponse<T> = {
  message: string
  results?: T
}
export interface IBaseRepository<
  TEntity,
  TCreate,
  TUpdate
> {
  create(data: TCreate): IResponse<string>
  update(id: string | number, data: TUpdate): IResponse<TEntity | null>
  delete(id: string | number): IResponse<string>
  getById(id: string | number): IResponse<TEntity | null>
  getAll(): IResponse<TEntity[] | []>
}
