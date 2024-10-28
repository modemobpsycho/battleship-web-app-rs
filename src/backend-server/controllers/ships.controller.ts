import { AddShipsReqData, RequestType, ShipPositionWithStatus, ShipsInfo } from '../../types';
import { gamesDB, sockets } from '../../helpers';

export const handleAddShipsRequest = (data: string) => {
  const { gameId, ships, indexPlayer } = JSON.parse(data) as AddShipsReqData;

  const shipsWithPositions: ShipsInfo[] = ships.map((shipInfo) => {
    const positions: ShipPositionWithStatus[] = [];

    for (let i = 0; i < shipInfo.length; i++) {
      const { x, y } = shipInfo.position;

      positions.push({
        x: shipInfo.direction ? x : x + i,
        y: shipInfo.direction ? y + i : y,
        status: 'alive',
      });
    }

    return {
      ...shipInfo,
      positions,
    };
  });

  gamesDB.updateGameUserShips(gameId, indexPlayer, shipsWithPositions);

  if (gamesDB.isUsersReadyForGameStart(gameId)) {
    const gameUsers = gamesDB.getGameUsers(gameId);
    const currentPlayerIndex = gamesDB.generateCurrentPlayerIndex(gameId);

    gamesDB.updateCurrentPlayerIndex(gameId, currentPlayerIndex);

    gameUsers.forEach((u) => {
      const userSocket = sockets[u.userIdx]!;

      userSocket.send(
        JSON.stringify({
          type: RequestType.StartGame,
          data: JSON.stringify({
            ships: u.ships,
            currentPlayerIndex,
          }),
          id: 0,
        }),
      );

      userSocket.send(
        JSON.stringify({
          type: RequestType.Turn,
          data: JSON.stringify({
            currentPlayer: currentPlayerIndex,
          }),
          id: 0,
        }),
      );
    });
  }
};
