import { UsersDB } from './users.db';
import { RoomInfo, RoomsInfo } from '../../types';

export class RoomsDB {
  private _rooms: RoomsInfo = {};
  private _nextRoomIdx = -1;

  constructor(private _usersDB: UsersDB) {}

  createRoom(roomIdx: number, username: string): void {
    const userIdx = this._usersDB.getUserIdx(username);

    this._usersDB.updateUserRoomIdx(username, roomIdx);

    this._rooms[roomIdx] = {
      roomUsers: [
        {
          index: userIdx,
          name: username,
        },
      ],
    };
  }

  addUserToTheRoom(roomIdx: number, username: string): void {
    const userIdx = this._usersDB.getUserIdx(username);

    this._usersDB.updateUserRoomIdx(username, roomIdx);

    this._rooms[roomIdx]!.roomUsers.push({
      index: userIdx,
      name: username,
    });
  }

  removeRoom(roomIdx: number): void {
    this._rooms[roomIdx]!.roomUsers.forEach((u) => {
      this._usersDB.updateUserRoomIdx(u.name, -1);
    });

    delete this._rooms[roomIdx];
  }

  removeUserFromTheRoom(username: string, roomIdx: number): void {
    if (roomIdx < 0) return;

    const roomUsersAfterRemove = this._rooms[roomIdx]!.roomUsers.filter((u) => u.name !== username);

    if (roomUsersAfterRemove.length === 0) {
      this.removeRoom(roomIdx);
    } else {
      this._rooms[roomIdx]!.roomUsers = roomUsersAfterRemove;
    }
  }

  getNextRoomIdx(): number {
    this._nextRoomIdx += 1;

    return this._nextRoomIdx;
  }

  getRoomByIdx(roomIdx: number): RoomInfo {
    return this._rooms[roomIdx]!;
  }

  getUsersCountInTheRoom(roomIdx: number): number {
    return this._rooms[roomIdx]!.roomUsers.length;
  }

  getRooms(): RoomsInfo {
    return this._rooms;
  }
}
