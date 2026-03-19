import jwt from "jsonwebtoken";
import { getEnvVar } from "../getEnvVar.js";

export function verifyAuthToken(req, res, next) {
  const authHeader = req.get("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).end();
    return;
  }

  jwt.verify(token, getEnvVar("JWT_SECRET"), (error, decodedToken) => {
    if (decodedToken) {
      req.userInfo = decodedToken;
      next();
    } else {
      res.status(401).end();
    }
  });
}