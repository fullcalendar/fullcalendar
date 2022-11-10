
export interface EventSourceApi {
  id: string
  url: string
  format: string
  remove(): void
  refetch(): void
}
