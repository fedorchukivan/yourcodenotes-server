import jwt from "jsonwebtoken";
import { serverConfig } from "../../config.js";

export function jwtSign(payload) {
  return jwt.sign(payload, serverConfig.jwt_secret);
}

export function jwtVerify(token) {
  return jwt.verify(token, serverConfig.jwt_secret);
}