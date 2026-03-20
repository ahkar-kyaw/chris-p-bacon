import jwt from "jsonwebtoken";
import { getEnvVar } from "../getEnvVar.js";

/**
 * Creates a Promise for a JWT token, with a specified username embedded inside.
 *
 * @param username the username to embed in the JWT token
 * @return a Promise for a JWT
 */
function generateAuthToken(username) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { username },
      getEnvVar("JWT_SECRET"),
      { expiresIn: "1d" },
      (error, token) => {
        if (error) reject(error);
        else resolve(token);
      },
    );
  });
}

export function registerAuthRoutes(app, credentialsProvider) {
  app.post("/api/users", async (req, res) => {
    const username = req.body?.username;
    const name = req.body?.name;
    const email = req.body?.email;
    const password = req.body?.password;

    if (
      typeof username !== "string" ||
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).send({
        error: "Bad request",
        message: "Missing username, name, email, or password",
      });
      return;
    }

    try {
      const ok = await credentialsProvider.registerUser(username, name, email, password);

      if (!ok) {
        res.status(409).send({
          error: "Conflict",
          message: "Username already taken",
        });
        return;
      }

      const token = await generateAuthToken(username.trim());
      res.status(201).json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).end();
    }
  });

  app.post("/api/auth/tokens", async (req, res) => {
    const username = req.body?.username;
    const password = req.body?.password;

    if (typeof username !== "string" || typeof password !== "string") {
      res.status(400).send({
        error: "Bad request",
        message: "Missing username or password",
      });
      return;
    }

    try {
      const ok = await credentialsProvider.verifyPassword(username, password);

      if (!ok) {
        res.status(401).send({
          error: "Unauthorized",
          message: "Invalid username or password",
        });
        return;
      }

      const token = await generateAuthToken(username.trim());
      res.status(200).json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).end();
    }
  });
}