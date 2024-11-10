import { UsersDB } from './backend-server/db/users.db';
import { RoomsDB } from './backend-server/db/rooms.db';
import { GamesDB } from './backend-server/db/games.db';
import { WebSocketsMap, WebSocketWithIdx, RequestType, RoomsInfo, WinnersMap } from './types';

export const sockets: WebSocketsMap = {};
export const winners: WinnersMap = {};

export const usersDB = new UsersDB();
export const roomsDB = new RoomsDB(usersDB);
export const gamesDB = new GamesDB(usersDB);

export const sendUpdateRoomResData = (socket: WebSocketWithIdx, data: RoomsInfo): void => {
  const rooms = Object.entries(data);

  socket.send(
    JSON.stringify({
      type: RequestType.UpdateRoom,
      data: JSON.stringify(
        rooms.map(([roomId, { roomUsers }]) => ({
          roomId: Number(roomId),
          roomUsers,
        })),
      ),
      id: 0,
    }),
  );
};

export const notifyAnotherUsersAboutRoomsUpdate = (): void => {
  for (const idx in sockets) {
    const socket = sockets[idx]!;
    const username = usersDB.getUserNameByIdx(Number(idx));

    if (!usersDB.isUserInGame(username)) {
      sendRoomsUpdateToTheUser(socket);
    }
  }
};

export const notifyUsersAboutWinnersUpdate = (): void => {
  for (const idx in sockets) {
    const socket = sockets[idx]!;

    const winnersList: {
      name: string;
      wins: number;
    }[] = [];

    Object.entries(winners).forEach(([name, { wins }]) => {
      winnersList.push({ name, wins });
    });

    socket.send(
      JSON.stringify({
        type: RequestType.UpdateWinners,
        data: JSON.stringify(winnersList),
        id: 0,
      }),
    );
  }
};

export const sendRoomsUpdateToTheUser = (socket: WebSocketWithIdx) => {
  const rooms = roomsDB.getRooms();

  sendUpdateRoomResData(socket, rooms);
};
