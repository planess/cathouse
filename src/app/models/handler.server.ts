import { ServerActionResponse } from './server-action-response.server';

export type Handler<T> = (
  data: T,
) => ServerActionResponse | Promise<ServerActionResponse>;
