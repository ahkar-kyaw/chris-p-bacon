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
    await this.usersCollection.createIndex({ email: 1 }, { unique: true });
    await this.credsCollection.createIndex({ email: 1 }, { unique: true });
  }

  async registerUser(name, email, password) {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const existingCreds = await this.credsCollection.findOne({ email: normalizedEmail });
    if (existingCreds) return false;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.credsCollection.insertOne({
      email: normalizedEmail,
      password: hashedPassword,
    });

    const existingUser = await this.usersCollection.findOne({ email: normalizedEmail });
    if (!existingUser) {
      await this.usersCollection.insertOne({
        name: normalizedName,
        email: normalizedEmail,
      });
    }

    return true;
  }

  async verifyPassword(email, plaintextPassword) {
    const normalizedEmail = email.trim().toLowerCase();
    const creds = await this.credsCollection.findOne({ email: normalizedEmail });

    if (!creds) return false;

    return bcrypt.compare(plaintextPassword, creds.password);
  }
}