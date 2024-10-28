import { UsersInfo, UserMetadata } from '../../types';

export class UsersDB {
  private _users: UsersInfo = {};

  private _nextUserIdx = -1;

  addUser(username: string, user: UserMetadata): void {
    this._users[username] = user;
  }

  getNextUserIdx(): number {
    this._nextUserIdx += 1;

    return this._nextUserIdx;
  }

  getUserMetadata(username: string): UserMetadata {
    return this._users[username]!;
  }

  getUserNameByIdx(idx: number): string {
    for (const username in this._users) {
      const user = this._users[username];

      if (user?.socketIdx === idx) return username;
    }

    return 'unknown';
  }

  getUserIdx(username: string): number {
    return this._users[username]!.userIdx;
  }

  getUserRoomIdx(username: string): number {
    return this._users[username]!.roomIdx;
  }

  getUserGameIdx(username: string): number {
    return this._users[username]!.gameIdx;
  }

  updateUserRoomIdx(username: string, roomIdx: number): void {
    this._users[username]!.roomIdx = roomIdx;
  }

  updateUserGameIdx(username: string, gameIdx: number): void {
    this._users[username]!.gameIdx = gameIdx;
  }

  isNewUser(username: string): boolean {
    for (const name in this._users) {
      if (name === username) return false;
    }

    return true;
  }

  isPasswordValid(username: string, password: string): boolean {
    return this._users[username]!.password === password;
  }

  isUserInRoom(username: string): boolean {
    return this._users[username]!.roomIdx >= 0;
  }

  isUserInGame(username: string): boolean {
    return this._users[username]!.gameIdx >= 0;
  }
}
