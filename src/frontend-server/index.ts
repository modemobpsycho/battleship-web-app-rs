import { readFile } from 'fs/promises';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { resolve } from 'path';
import { Side } from '../types';
import { getFileInfoFromURL } from '../utils/paths';

const handleError = (res: ServerResponse, err: unknown, statusCode: number): void => {
  const errorInfo = JSON.stringify(err);

  res.writeHead(statusCode);
  res.end(errorInfo);
};

const handleRequest = async (filePath: string, res: ServerResponse): Promise<void> => {
  try {
    const fileData = await readFile(filePath);

    res.writeHead(200);
    res.end(fileData);
  } catch (err) {
    handleError(res, err, 404);
  }
};

const requestsHandler = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  try {
    const [__dirname] = getFileInfoFromURL(import.meta.url);
    const relativeFilePath = `../../front${req.url === '/' ? '/index.html' : req.url}`;
    const fullFilePath = resolve(__dirname, relativeFilePath);

    await handleRequest(fullFilePath, res);
  } catch (err) {
    handleError(res, err, 500);
  }
};

const FRONTEND_PORT = 8181;

export const createHttpFrontEndServer = () => {
  const server = createServer(requestsHandler);

  server.listen(FRONTEND_PORT, () => {
    console.log(`${Side.FrontEnd} Start http server on the http://localhost:${FRONTEND_PORT}`);
  });

  server.on('error', (err) => {
    console.error(`${Side.FrontEnd} Something went wrong: %O`, err);
  });

  return server;
};
