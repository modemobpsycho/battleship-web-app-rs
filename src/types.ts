import WebSocket from 'ws';

export const enum RequestType {
  RegistrationLogin = 'reg',
  CreateRoom = 'create_room',
  AddUserToRoom = 'add_user_to_room',
  UpdateRoom = 'update_room',
  CreateGame = 'create_game',
  AddShips = 'add_ships',
  StartGame = 'start_game',
  Turn = 'turn',
  Attack = 'attack',
  RandomAttack = 'randomAttack',
  Finish = 'finish',
  UpdateWinners = 'update_winners',
}

export const enum Side {
  FrontEnd = '[FrontEnd]',
  BackEnd = '[BackEnd]',
  MainProgram = '[MainProgram]',
}

export type ShipPosition = {
  x: number;
  y: number;
};

export type ShipPositionWithStatus = {
  x: number;
  y: number;
  status: 'alive' | 'killed';
};

export type ShipsInfo = {
  position: ShipPosition;
  positions?: ShipPositionWithStatus[];
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
};

export type GameUserInfo = {
  username: string;
  userIdx: number;
  ships: ShipsInfo[];
  missedShoots: ShipPosition[];
};

export type WebSocketsMap = {
  [idx: string]: WebSocketWithIdx;
};

export interface WebSocketWithIdx extends WebSocket {
  idx: number;
}

export type UserInTheRoom = {
  index: number;
  name: string;
};

export type RoomInfo = {
  roomUsers: UserInTheRoom[];
};

export type RoomsInfo = {
  [roomId: string]: RoomInfo;
};

export type UserMetadata = {
  password: string;
  userIdx: number;
  socketIdx: number;
  roomIdx: number;
  gameIdx: number;
};

export type UsersInfo = {
  [username: string]: UserMetadata;
};

export type LoginReqData = {
  name: string;
  password: string;
};

export type LoginResData = {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
};

export type AddUserToRoomReqData = {
  indexRoom: number;
};

export type AddShipsReqData = {
  gameId: number;
  ships: ShipsInfo[];
  indexPlayer: number;
};

export type GamesInfo = {
  [gameId: string]: {
    gameUsers: GameUserInfo[];
    currentPlayerIndex?: number;
  };
};

export type WinnersMap = {
  [name: string]: {
    wins: number;
  };
};
