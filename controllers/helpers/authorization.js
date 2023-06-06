import { jwtVerify } from "./jwt.js";

export function getToken(req) {
  let token = req.headers['authorization'];
  if (token) token = token.replace('Bearer ', '');
  return token;
}

export function checkToken(req, token) {
  return getToken(req) === token;
}

export function authorize(req) {
  const token = getToken(req);
  if (!token) {
    return null;
  }
  let tokenPayload;
  try {
    tokenPayload = jwtVerify(token);
  } catch (err) {
    return null;      
  }
  return tokenPayload;
}