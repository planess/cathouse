import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

export async function getEmailAssets(
  names: string | string[],
): Promise<({ filename: string; data: Buffer } | null)[]> {
  names = Array.isArray(names) ? names : [names];

  return Promise.all(
    names.map((name) =>
      readFile(`src/email-template/assets/${name}`).then(
        (value) => ({
          name,
          data: value,
        }),
        () => null,
      ),
    ),
  ).then((files) =>
    files.map((file) =>
      file ? { filename: basename(file.name), data: file.data } : null,
    ),
  );
}
