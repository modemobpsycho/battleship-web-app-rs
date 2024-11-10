import { WebSocketWithIdx, LoginResData, RequestType, LoginReqData } from 'types';
import { sendRoomsUpdateToTheUser, sockets, usersDB } from '../../helpers';

const sendResData = (socket: WebSocketWithIdx, data: LoginResData): void => {
  socket.send(
    JSON.stringify({
      type: RequestType.RegistrationLogin,
      data: JSON.stringify(data),
      id: 0,
    }),
  );
};

export const handleLoginRequest = (socket: WebSocketWithIdx, data: string): void => {
  const { password, name } = JSON.parse(data) as LoginReqData;
  const isUserDoesNotExists = usersDB.isNewUser(name);

  if (isUserDoesNotExists) {
    const idx = usersDB.getNextUserIdx();

    sendResData(socket, {
      name,
      index: idx,
      error: false,
      errorText: '',
    });

    usersDB.addUser(name, {
      userIdx: idx,
      password,
      socketIdx: idx,
      gameIdx: -1,
      roomIdx: -1,
    });

    socket.idx = idx;

    sockets[idx] = socket;

    sendRoomsUpdateToTheUser(socket);

    return;
  }

  const userIdx = usersDB.getUserIdx(name);
  const isUserPasswordValid = usersDB.isPasswordValid(name, password);

  if (isUserPasswordValid) {
    sendResData(socket, {
      name,
      index: userIdx,
      error: false,
      errorText: '',
    });

    socket.idx = userIdx;

    sockets[userIdx] = socket;

    sendRoomsUpdateToTheUser(socket);

    return;
  }

  sendResData(socket, {
    name,
    index: userIdx,
    error: true,
    errorText: 'Your password is wrong, please, try again!',
  });
};
