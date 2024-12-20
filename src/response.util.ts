import { PostResponse } from './interface/response.interface';

export function standardResponse(
  statusCode: number,
  message: string,
  data?: any,
): PostResponse {
  return {
    statusCode,
    message,
    data,
  };
}
