import { ResponseStatusError } from './response-status-error.server';
import { StatusOK as ResponseStatusOK } from './response-status-ok.server';

export type ServerActionResponse = ResponseStatusOK | ResponseStatusError;
