import { Sex } from '../sex';

import { DB } from './db';

export interface Profile extends DB {
  firstName: string;
  lastName: string;
  sex: Sex;
}
