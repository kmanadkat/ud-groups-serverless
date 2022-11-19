import { decode } from "jsonwebtoken";

import { JwtToken } from "./JwtToken";


export function getUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtToken
  const userId = decodedJwt.sub
  return userId
}