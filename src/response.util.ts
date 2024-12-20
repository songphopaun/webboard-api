export function standardResponse(
  statusCode: number,
  message: string,
  data: any,
) {
  return {
    statusCode,
    message,
    data,
  };
}
