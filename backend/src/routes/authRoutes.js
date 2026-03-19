import jwt from "jsonwebtoken";
import { getEnvVar } from "../getEnvVar.js";

/**
 * Creates a Promise for a JWT token, with a specified email embedded inside.
 *
 * @param email the email to embed in the JWT token
 * @return a Promise for a JWT
 */
function generateAuthToken(email) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { email },
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
    const name = req.body?.name;
    const email = req.body?.email;
    const password = req.body?.password;

    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
      res.status(400).send({
        error: "Bad request",
        message: "Missing name, email, or password",
      });
      return;
    }

    try {
      const ok = await credentialsProvider.registerUser(name, email, password);

      if (!ok) {
        res.status(409).send({
          error: "Conflict",
          message: "Email already taken",
        });
        return;
      }

      const token = await generateAuthToken(email.trim().toLowerCase());
      res.status(201).json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).end();
    }
  });

  app.post("/api/auth/tokens", async (req, res) => {
    const email = req.body?.email;
    const password = req.body?.password;

    if (typeof email !== "string" || typeof password !== "string") {
      res.status(400).send({
        error: "Bad request",
        message: "Missing email or password",
      });
      return;
    }

    try {
      const ok = await credentialsProvider.verifyPassword(email, password);

      if (!ok) {
        res.status(401).send({
          error: "Unauthorized",
          message: "Invalid email or password",
        });
        return;
      }

      const token = await generateAuthToken(email.trim().toLowerCase());
      res.status(200).json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).end();
    }
  });
}