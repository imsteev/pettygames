const puppeteer = require("puppeteer");
import * as cheerio from "cheerio";

type Trade = {
  player: string;
  previousTeam: string;
  newTeam: string;
  date: string;
};
function extractTradeData($: cheerio.CheerioAPI) {
  const tradeData: Trade[] = [];

  $(".tradetable").each((_, table) => {
    const date = $(table).find(".daterow h3").text().trim();
    const tradeItems = $(table).find(".tradeitem");

    const tradeTeams: string[] = [];
    tradeItems.each((_, item) => {
      const team = $(item)
        .find(".tradelabel")
        .text()
        .replace(" acquires", "")
        .trim();
      tradeTeams.push(team);
    });

    tradeItems.each((index, item) => {
      const currentTeam = tradeTeams[index];
      const previousTeam = tradeTeams[1 - index]; // This works for two-team trades

      $(item)
        .find(".tradeplayer")
        .each((_, playerElement) => {
          const playerName = $(playerElement).text().trim();
          const isActivePlayer = $(playerElement).find("a").length > 0;

          if (playerName && !$(playerElement).hasClass("inline")) {
            if (isActivePlayer) {
              tradeData.push({
                date,
                // Extract just the player name by removing everything after the first parenthesis
                player: playerName.split("(")[0].trim(),
                previousTeam,
                newTeam: currentTeam,
              });
            }
          }
        });
    });
  });

  return tradeData;
}

async function scrapeTrades(url: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let tradeData: Trade[] = [];
  try {
    await page.goto(url, { waitUntil: "networkidle0" });
    const html = await page.content();

    const $ = cheerio.load(html);
    console.log($);
    tradeData = extractTradeData($);

    // console.log(JSON.stringify(tradeData, null, 2));
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    await browser.close();
  }

  return tradeData;
}

const url =
  "https://www.spotrac.com/nfl/transactions/trade/_/start/2024-01-01/end/2024-12-31";

console.log("analyzing...");
const trades = await scrapeTrades(url);

await Bun.write(Bun.file("trades.json"), JSON.stringify(trades));
