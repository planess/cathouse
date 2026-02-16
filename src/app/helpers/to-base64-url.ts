export function toBase64URL(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replaceAll(/=+$/g, '')
    .replaceAll('+', '-')
    .replaceAll('/', '_');
}
