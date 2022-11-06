export const httpResponse = (statusCode: number, body: any) => {
  return {
    statusCode: statusCode,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body,
  }
}
