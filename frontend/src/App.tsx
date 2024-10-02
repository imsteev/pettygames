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

  const pettyGames = useMemo(() => {
    if (!highlightedTrade) {
      return [];
    }
    return schedule.filter(
      (game) =>
        [game.away, game.home].sort().toString() ==
        [highlightedTrade.previousTeam, highlightedTrade.newTeam]
          .sort()
          .toString()
    );
  }, [highlightedTrade, schedule]);

  // TODO: fix this
  const pettyGamesToday = useMemo(() => {
    const gamesToday = schedule.filter((game) => {
      const parsedDate = parse(game.date, "EEEE, MMMM d, yyyy", new Date());
      return parsedDate.toDateString() == new Date().toDateString();
    });
    return gamesToday;
  }, [schedule]);

  return (
    <div className="md:max-w-7xl m-auto">
      <h1>NFL Petty Games</h1>
      <div className="flex flex-col gap-4 my-4">
        <h2>Today</h2>
        <p>{pettyGamesToday.length ? "Petty games" : "No petty games"}</p>
        {pettyGamesToday.map((game) => (
          <div className="border border-gray-400 shadow-md">
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
            <p>{pettyGames.length ? "Petty games" : "No petty games"}</p>
            {pettyGames.map((game) => (
              <div className="p-4 border border-gray-400 shadow-md">
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
          This app is powered by data from nfl.com and espn.com
        </p>
      </footer>
    </div>
  );
}

export default App;
