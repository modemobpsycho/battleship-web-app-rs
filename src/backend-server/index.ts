import { RequestType, Side, WebSocketWithIdx } from '../types';
import { WebSocketServer } from 'ws';
import {
  gamesDB,
  notifyAnotherUsersAboutRoomsUpdate,
  notifyUsersAboutWinnersUpdate,
  roomsDB,
  sockets,
  usersDB,
  winners,
} from '../helpers';
import { handleLoginRequest } from './controllers/login.controller';
import { handleAddUserToRoomRequest, handleCreateRoomRequest } from './controllers/rooms.controller';
import { handleAddShipsRequest } from './controllers/ships.controller';
import { handleAttackRequest } from './controllers/attack.controller';
import { handleRandomAttackRequest } from './controllers/random.controller';

type RequestBody = {
  type: RequestType;
  data: string;
  id: number;
};

const BACKEND_PORT = 3000;

export const createHttpBackEndServer = (): WebSocketServer => {
  const ws = new WebSocketServer({
    host: 'localhost',
    port: BACKEND_PORT,
  });

  ws.on('listening', () => {
    console.log(`${Side.BackEnd} Start ws server on the ws://localhost:${BACKEND_PORT}`);
  });

  ws.on('error', (err) => {
    console.error(`${Side.BackEnd} Something went wrong: %O`, err);
  });

  ws.on('connection', (socket: WebSocketWithIdx) => {
    socket.on('message', (data) => {
      const requestBody: RequestBody = JSON.parse(String(data));

      if (requestBody.type === RequestType.RegistrationLogin) {
        handleLoginRequest(socket, requestBody.data);
      }

      if (requestBody.type === RequestType.CreateRoom) {
        handleCreateRoomRequest(socket);
      }

      if (requestBody.type === RequestType.AddUserToRoom) {
        handleAddUserToRoomRequest(socket, requestBody.data);
      }

      if (requestBody.type === RequestType.AddShips) {
        handleAddShipsRequest(requestBody.data);
      }

      if (requestBody.type === RequestType.Attack) {
        handleAttackRequest(requestBody.data);
      }

      if (requestBody.type === RequestType.RandomAttack) {
        handleRandomAttackRequest(requestBody.data);
      }
    });

    socket.on('close', () => {
      const username = usersDB.getUserNameByIdx(socket.idx);

      if (username === 'unknown') return;

      const roomIdx = usersDB.getUserRoomIdx(username);

      roomsDB.removeUserFromTheRoom(username, roomIdx);

      const isUserInGame = usersDB.isUserInGame(username);

      if (isUserInGame) {
        const gameIdx = usersDB.getUserGameIdx(username);
        const gameUsers = gamesDB.getGameUsers(gameIdx);
        const winUser = gameUsers.find((u) => u.username !== username)!;
        const userSocket = sockets[winUser.userIdx]!;

        userSocket.send(
          JSON.stringify({
            type: RequestType.Finish,
            data: JSON.stringify({
              winPlayer: winUser.userIdx,
            }),
            id: 0,
          }),
        );

        gameUsers.forEach((u) => {
          usersDB.updateUserGameIdx(u.username, -1);
        });

        if (winners[username]) {
          winners[username]!.wins += 1;
        } else {
          winners[username] = {
            wins: 1,
          };
        }
      }

      notifyAnotherUsersAboutRoomsUpdate();
      notifyUsersAboutWinnersUpdate();
    });
  });

  return ws;
};
