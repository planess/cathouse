import { ObjectId } from 'mongodb';

export function toObjectId(value?: string): ObjectId | null {
  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  return ObjectId.isValid(value) ? new ObjectId(value) : null;
}
