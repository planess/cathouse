import { ServerErrors } from './server-errors';

export interface ServerStatusError {
  status: 'error';
  errors?: ServerErrors;
}
