import { RequestType, ShipPosition } from '../../types';
import {
  gamesDB,
  notifyAnotherUsersAboutRoomsUpdate,
  notifyUsersAboutWinnersUpdate,
  sockets,
  usersDB,
  winners,
} from '../../helpers';

type RandomAttackReqData = {
  gameId: number;
  indexPlayer: number;
};

type RandomAttackResData = {
  position: {
    x: number;
    y: number;
  };
  currentPlayer: number;
  status: 'miss' | 'killed' | 'shot';
};

export const handleRandomAttackRequest = (data: string) => {
  const { gameId, indexPlayer } = JSON.parse(data) as RandomAttackReqData;

  if (gamesDB.getCurrentPlayerIndex(gameId) === indexPlayer) {
    const gameUsers = gamesDB.getGameUsers(gameId);
    const nextUser = gameUsers.filter((u) => u.userIdx !== indexPlayer).pop();
    const shotResult = gamesDB.getRandomShootResult(gameId);
    const { position, status } = shotResult;

    let missPositionsAroundShip: ShipPosition[] = [];
    let isUserWinGame = false;

    if (status === 'killed') {
      const positionsAroundShip = gamesDB.getPositionsAroundShip(shotResult.positions!, shotResult.direction!);

      const attackSimulationResults = positionsAroundShip.map((p) => {
        const shotRes = gamesDB.getShootResult(gameId, p, false);

        if (shotRes && shotRes.status === 'miss') {
          return p;
        }

        return null;
      });

      missPositionsAroundShip = attackSimulationResults.filter((p) => p) as ShipPosition[];
      isUserWinGame = gamesDB.isUserWinGame(gameId, nextUser!.userIdx);
    }

    const nextCurrentPlayer = status === 'miss' ? nextUser!.userIdx : indexPlayer;

    gamesDB.updateCurrentPlayerIndex(gameId, nextCurrentPlayer);

    gameUsers.forEach((u) => {
      const userSocket = sockets[u.userIdx]!;

      userSocket.send(
        JSON.stringify({
          type: RequestType.Attack,
          data: JSON.stringify({
            currentPlayer: indexPlayer,
            ...{
              position,
              status,
            },
          } as RandomAttackResData),
          id: 0,
        }),
      );

      if (status === 'killed') {
        missPositionsAroundShip.forEach((p) => {
          userSocket.send(
            JSON.stringify({
              type: RequestType.Attack,
              data: JSON.stringify({
                currentPlayer: indexPlayer,
                ...{
                  position: p,
                  status: 'miss',
                },
              } as RandomAttackResData),
              id: 0,
            }),
          );
        });

        if (isUserWinGame) {
          userSocket.send(
            JSON.stringify({
              type: RequestType.Finish,
              data: JSON.stringify({
                winPlayer: indexPlayer,
              }),
              id: 0,
            }),
          );
        }

        gameUsers.forEach((u) => {
          usersDB.updateUserGameIdx(u.username, -1);
        });

        const username = usersDB.getUserNameByIdx(indexPlayer);

        if (winners[username]) {
          winners[username]!.wins += 1;
        } else {
          winners[username] = {
            wins: 1,
          };
        }

        notifyAnotherUsersAboutRoomsUpdate();
        notifyUsersAboutWinnersUpdate();
      }

      if (isUserWinGame) return;

      userSocket.send(
        JSON.stringify({
          type: RequestType.Turn,
          data: JSON.stringify({
            currentPlayer: nextCurrentPlayer,
          }),
          id: 0,
        }),
      );
    });
  }
};
