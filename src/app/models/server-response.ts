import { ServerStatusError } from './server-status-error';
import { ServerStatusOK } from './server-status-ok';

export type ServerResponse = ServerStatusOK | ServerStatusError;
