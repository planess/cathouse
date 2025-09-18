import { ServerResponse } from './server-response';

export type ServerHandler<T> = (
  data: T,
) => ServerResponse | Promise<ServerResponse>;
