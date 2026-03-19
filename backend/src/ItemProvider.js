
import { getEnvVar } from "./getEnvVar.js";

export class ItemProvider {
  constructor(mongoClient) {
    this.mongoClient = mongoClient;

    const dbName = getEnvVar("DB_NAME");
    const collectionName = getEnvVar("ITEMS_COLLECTION_NAME");

    this.collection = this.mongoClient.db(dbName).collection(collectionName);
  }

  async ensureIndexes() {
    await this.collection.createIndex({ id: 1 }, { unique: true });
  }

  getAllItems() {
    return this.collection
      .find({}, { projection: { _id: 0 } })
      .sort({ name: 1, id: 1 })
      .toArray();
  }

  async saveItem(nextItem) {
    const existingItem = await this.collection.findOne(
      { id: nextItem.id },
      { projection: { _id: 0 } },
    );

    if (!existingItem) {
      await this.collection.insertOne(nextItem);
      return { item: nextItem, created: true };
    }

    const mergedItem = {
      ...existingItem,
      ...nextItem,
      qty: Math.max(0, Number(existingItem.qty || 0) + Number(nextItem.qty || 0)),
    };

    await this.collection.updateOne({ id: nextItem.id }, { $set: mergedItem });

    return { item: mergedItem, created: false };
  }

  async adjustQty(itemId, delta) {
    const existingItem = await this.collection.findOne(
      { id: itemId },
      { projection: { _id: 0 } },
    );

    if (!existingItem) return null;

    const updatedItem = {
      ...existingItem,
      qty: Math.max(0, Number(existingItem.qty || 0) + Number(delta || 0)),
    };

    await this.collection.updateOne({ id: itemId }, { $set: { qty: updatedItem.qty } });

    return updatedItem;
  }

  async deleteItem(itemId) {
    const result = await this.collection.deleteOne({ id: itemId });
    return result.deletedCount > 0;
  }
}