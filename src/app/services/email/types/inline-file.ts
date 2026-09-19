/** File sent as an inline MIME part of an email. */
export type InlineFile = {
  /** Binary file contents. */
  data: Buffer;
  /** Filename used as the inline attachment content ID. */
  filename: string;
  /** MIME content type of the inline file. */
  contentType?: string;
};
