import { ResponseErrors } from './response-errors.server';

export interface ResponseStatusError {
  status: 'error' | 'declined';
  errors?: ResponseErrors;
}
