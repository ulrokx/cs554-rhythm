import { Collection } from "mongodb";
import { dbConnection } from "./mongoConnection.js";

/**
 *
 * @param {string} collection
 * @returns {() => Promise<Collection>}
 */
const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

export const levels = getCollectionFn("levels");
export const users = getCollectionFn("users");
