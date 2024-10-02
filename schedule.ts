import puppeteer from "puppeteer";
import * as cheerio from "cheerio";

// This script scrapes regular season schedule data from espn.com
// Input: year
// Output:
//   [
//      { away: <team>, home: <team>, date: string},
//      { away: <team>, home: <team>, date: string},
//      ...
//   ]

async function scrapeSchedule(year: number) {
  let week = 1;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let gameData = [];
  try {
    while (true) {
      const url = `https://www.espn.com/nfl/schedule/_/week/${week}/year/${year}/seasontype/2`;
      await page.goto(url, { waitUntil: "networkidle0" });
      if ((await page.$('[class*="EmptyTable"')) !== null) {
        break;
      }
      await Bun.write(Bun.stdout, `extracting Week ${week}...`);
      const html = await page.content();
      const $ = cheerio.load(html);
      gameData.push(...extractGameData($));
      await Bun.write(Bun.stdout, "done.\n");
      week++;
    }
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    await browser.close();
  }

  return gameData;
}

type Game = {
  away: string;
  home: string;
  date: string;
};

function extractGameData($: cheerio.CheerioAPI) {
  const games: Game[] = [];

  $(".ScheduleTables").each((_, scheduleTable) => {
    const date = $(scheduleTable).find(".Table__Title").text().trim();

    $(scheduleTable)
      .find(".Table__TBODY .Table__TR")
      .each((_, row) => {
        const $row = $(row);
        const awayTeam = $row.find(".Table__Team.away a").last().text().trim();
        const homeTeam = $row
          .find(".Table__Team:not(.away) a")
          .last()
          .text()
          .trim();

        games.push({
          away: awayTeam,
          home: homeTeam,
          date: date,
        });
      });
  });

  return games;
}

const games = await scrapeSchedule(2024);

await Bun.write(Bun.file("schedule.json"), JSON.stringify(games));
