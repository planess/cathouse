import { ServerHandler } from './server-handler';

export interface ServerHandlerParams<T> {
  handler: ServerHandler<T>;
}
