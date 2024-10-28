import { WebSocketWithIdx, AddUserToRoomReqData, GameUserInfo, RequestType } from '../../types';
import {
  gamesDB,
  notifyAnotherUsersAboutRoomsUpdate,
  roomsDB,
  sendUpdateRoomResData,
  sockets,
  usersDB,
} from '../../helpers';

export const handleCreateRoomRequest = (socket: WebSocketWithIdx): void => {
  const username = usersDB.getUserNameByIdx(socket.idx);

  if (usersDB.isUserInRoom(username)) return;

  const roomIdx = roomsDB.getNextRoomIdx();

  sendUpdateRoomResData(socket, {
    [roomIdx]: {
      roomUsers: [
        {
          index: socket.idx,
          name: username,
        },
      ],
    },
  });

  roomsDB.createRoom(roomIdx, username);
  usersDB.updateUserRoomIdx(username, roomIdx);

  notifyAnotherUsersAboutRoomsUpdate();
};

export const handleAddUserToRoomRequest = (socket: WebSocketWithIdx, data: string): void => {
  const { indexRoom } = JSON.parse(data) as AddUserToRoomReqData;
  const username = usersDB.getUserNameByIdx(socket.idx);
  const roomIdx = usersDB.getUserRoomIdx(username);

  if (indexRoom === roomIdx) return;
  if (roomsDB.getUsersCountInTheRoom(indexRoom) === 2) return;

  if (usersDB.isUserInRoom(username)) {
    roomsDB.removeUserFromTheRoom(username, roomIdx);
  }

  roomsDB.addUserToTheRoom(indexRoom, username);

  if (roomsDB.getUsersCountInTheRoom(indexRoom) === 2) {
    const { roomUsers } = roomsDB.getRoomByIdx(indexRoom);
    const gameIdx = gamesDB.getNextGameIdx();
    const gameUsers: GameUserInfo[] = [];

    roomUsers.forEach((user) => {
      const userSocket = sockets[user.index]!;

      userSocket.send(
        JSON.stringify({
          type: RequestType.CreateGame,
          data: JSON.stringify({
            idGame: gameIdx,
            idPlayer: user.index,
          }),
          id: 0,
        }),
      );

      gameUsers.push({
        ships: [],
        userIdx: user.index,
        username: user.name,
        missedShoots: [],
      });
    });

    gamesDB.addUsersToTheGame(gameIdx, gameUsers);
    roomsDB.removeRoom(indexRoom);
  }

  notifyAnotherUsersAboutRoomsUpdate();
};
