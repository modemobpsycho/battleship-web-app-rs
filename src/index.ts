import { createHttpFrontEndServer } from './frontend-server/index';
import { createHttpBackEndServer } from './backend-server/index';
import { Side } from './types';

try {
  const frontend = createHttpFrontEndServer();
  const backend = createHttpBackEndServer();

  process.on('SIGINT', (signal) => {
    if (signal === 'SIGINT') {
      frontend.close();
      backend.close();

      process.exit();
    }
  });
} catch (err) {
  console.error(`${Side.MainProgram} Something went wrong: %O`, err);

  process.exit(1);
}
