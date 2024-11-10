import { dirname } from 'path';
import { fileURLToPath } from 'url';

export const getFileInfoFromURL = (url: string): [__dirname: string, __filename: string] => {
  const __filename = fileURLToPath(url);
  const __dirname = dirname(__filename);

  return [__dirname, __filename];
};
