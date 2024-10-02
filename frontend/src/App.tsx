import { useEffect, useMemo, useState } from "react";
import { parse } from "date-fns";

import "./App.css";

type Trade = {
  player: string;
  previousTeam: string;
  newTeam: string;
  date: string;
};

type Game = {
  home: string;
  away: string;
  date: string;
};
function App() {
  const [schedule, setSchedule] = useState<Game[]>([]);
  // note: trades aren't the only way players switch teams.
  // perhaps the abstraction here is "TeamChange"
  const [trades, setTrades] = useState<Trade[]>([]);
  const [highlightedTrade, setHighlightedTrade] = useState<Trade>();

  useEffect(() => {
    fetch("http://localhost:3000/schedule")
      .then((res) => res.json())
      .then((sched) => setSchedule(sched));
    fetch("http://localhost:3000/trades")
      .then((res) => res.json())
      .then((t) => setTrades(t));
  }, []);

  const pettyGamesByPlayer = useMemo(() => {
    const gamesByPlayer: Record<string, { trade: Trade; games: Game[] }> = {};
    for (const player of trades) {
      gamesByPlayer[player.player] = {
        trade: player,
        games: schedule.filter(
          (game) =>
            [game.away, game.home].sort().toString() ==
            [player.previousTeam, player.newTeam].sort().toString()
        ),
      };
    }
    return gamesByPlayer;
  }, [schedule, trades]);

  // TODO: make sure games are after player got traded.
  const pettyGamesToday = useMemo(() => {
    const today = [];
    for (const [player, pettyGames] of Object.entries(pettyGamesByPlayer)) {
      const game = pettyGames.games.find((game) => {
        const parsedDate = parse(game.date, "EEEE, MMMM d, yyyy", new Date());
        const fakeDate = parse(
          "Sunday, November 10, 2024",
          "EEEE, MMMM d, yyyy",
          new Date()
        );
        return parsedDate.toDateString() == fakeDate.toDateString();
      });
      if (game) {
        today.push({ player, game });
      }
    }
    // group by game?
    return today;
  }, [pettyGamesByPlayer]);

  return (
    <div className="md:max-w-7xl m-auto">
      <h1>NFL Petty Games</h1>
      <div className="flex flex-col gap-2 mt-4 mb-10">
        <h2>Today</h2>
        <p>{pettyGamesToday.length ? "" : "None"}</p>
        {pettyGamesToday.map(({ player, game }) => (
          <div className="border border-gray-400 shadow-md p-2 w-full md:w-[512px]">
            {game.away} @ {game.home} on{" "}
            <b>
              <a
                href={`https://www.google.com/search?q=nfl+${game.away}+${
                  game.home
                }+${encodeURIComponent(game.date)}`}
                target="_blank"
              >
                {game.date}
              </a>
            </b>
          </div>
        ))}
      </div>
      <p className="italic">
        Click a player to view their petty games this year.
      </p>
      <div className="grid grid-cols-2 mt-4">
        <table className="table-auto">
          <thead>
            <th className="text-left">Player</th>
            <th className="text-left">Date traded</th>
            <th className="text-left">From</th>
            <th className="text-left">To</th>
          </thead>
          <tbody>
            {trades.map((player) => (
              <tr
                onClick={() => setHighlightedTrade(player)}
                className="hover:cursor-pointer hover:bg-yellow-300"
              >
                <td>{player.player}</td>
                <td>{player.date}</td>
                <td>{player.previousTeam}</td>
                <td>{player.newTeam}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!!highlightedTrade && (
          <div className="flex flex-col gap-4 mx-2">
            <h2>{highlightedTrade.player}</h2>
            <p className="italic">
              {highlightedTrade.previousTeam} to {highlightedTrade.newTeam} on{" "}
              {highlightedTrade.date}
            </p>
            <p>
              {!pettyGamesByPlayer[highlightedTrade.player].games.length &&
                "None"}
            </p>
            {pettyGamesByPlayer[highlightedTrade.player].games.map((game) => (
              <div className="p-2 border border-gray-400 shadow-md">
                {game.away} @ {game.home} on{" "}
                <b>
                  <a
                    href={`https://www.google.com/search?q=nfl+${game.away}+${
                      game.home
                    }+${encodeURIComponent(game.date)}`}
                    target="_blank"
                  >
                    {game.date}
                  </a>
                </b>
              </div>
            ))}
          </div>
        )}
      </div>
      <footer className="mt-4">
        <p className="font-thin text-zinc-700">
          This app is powered by data from nfl.com and espn.com.
        </p>
      </footer>
    </div>
  );
}

export default App;
