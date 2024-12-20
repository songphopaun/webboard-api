export interface PostResponse<T = any> {
  statusCode: number;
  message: string;
  data?: T;
}
