export class MailgunReceiveRouteError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly publicMessage = message,
  ) {
    super(message);
    this.name = 'MailgunReceiveRouteError';
  }
}
