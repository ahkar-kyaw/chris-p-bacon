import { MongoClient } from "mongodb";
import { getEnvVar } from "./getEnvVar.js";

/**
 * Returns a new MongoClient instance with connection configured by the current environment variables.
 */
export function connectMongo() {
  const MONGO_USER = getEnvVar("MONGO_USER");
  const MONGO_PWD = getEnvVar("MONGO_PWD");
  const MONGO_CLUSTER = getEnvVar("MONGO_CLUSTER");
  const DB_NAME = getEnvVar("DB_NAME");

  const connectionStringRedacted = `mongodb+srv://${MONGO_USER}:<password>@${MONGO_CLUSTER}/${DB_NAME}`;
  const connectionString = `mongodb+srv://${MONGO_USER}:${MONGO_PWD}@${MONGO_CLUSTER}/${DB_NAME}`;

  console.log("Attempting Mongo connection at " + connectionStringRedacted);

  return new MongoClient(connectionString);
}