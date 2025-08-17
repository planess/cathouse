import { StatusOK as ResponseStatusOK } from './response-status-ok.server';
import { ResponseStatusError } from './status-error.server';

export type ServerActionResponse = ResponseStatusOK | ResponseStatusError;
