import { ObjectId } from 'mongodb';

export interface Sterilized {
  date: Date;
  method?: string;
  clinic?: ObjectId;
}
