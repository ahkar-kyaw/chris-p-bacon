import bcrypt from "bcrypt";
import { getEnvVar } from "./getEnvVar.js";

export class CredentialsProvider {
  constructor(mongoClient) {
    const dbName = getEnvVar("DB_NAME");
    const usersCollectionName = getEnvVar("USERS_COLLECTION_NAME");
    const credsCollectionName = getEnvVar("CREDS_COLLECTION_NAME");

    const db = mongoClient.db(dbName);
    this.usersCollection = db.collection(usersCollectionName);
    this.credsCollection = db.collection(credsCollectionName);
  }

  async ensureIndexes() {
    await this.usersCollection.createIndex({ username: 1 }, { unique: true });
    await this.credsCollection.createIndex({ username: 1 }, { unique: true });
  }

  async registerUser(username, name, email, password) {
    const normalizedUsername = username.trim();
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const existingCreds = await this.credsCollection.findOne({
      username: normalizedUsername,
    });
    if (existingCreds) return false;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.credsCollection.insertOne({
      username: normalizedUsername,
      password: hashedPassword,
    });

    const existingUser = await this.usersCollection.findOne({
      username: normalizedUsername,
    });

    if (!existingUser) {
      await this.usersCollection.insertOne({
        username: normalizedUsername,
        name: normalizedName,
        email: normalizedEmail,
      });
    }

    return true;
  }

  async verifyPassword(username, plaintextPassword) {
    const normalizedUsername = username.trim();

    const creds = await this.credsCollection.findOne({
      username: normalizedUsername,
    });

    if (!creds) return false;

    return bcrypt.compare(plaintextPassword, creds.password);
  }
}