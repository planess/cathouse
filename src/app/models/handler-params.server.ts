import { Handler } from './handler.server';

export interface HandlerParams<T> {
  handler: Handler<T>;
}
