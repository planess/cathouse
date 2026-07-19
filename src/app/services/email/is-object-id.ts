import { ObjectId } from 'mongodb';

export function isObjectId(value: unknown): value is ObjectId {
  return value instanceof ObjectId;
}
