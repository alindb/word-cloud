import { createServer } from "node:http";
import { IncomingMessage, ServerResponse } from "node:http";
import { removeStopwords, eng, swe } from "stopword";
import RSSParser from "rss-parser";

createServer(router).listen(8126, () => {
  console.log("Listening on http://localhost:8126");
});

enum HttpStatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

class BadRequest {
  timestamp: string;
  status = HttpStatusCode.BAD_REQUEST;
  error = "Bad Request";
  message: string;

  constructor(message: string) {
    this.timestamp = new Date().toISOString();
    this.message = message;
  }
}

async function router(req: IncomingMessage, res: ServerResponse) {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers["host"]}`);

    switch (`${req.method} ${url.pathname}`) {
      case "GET /api/rss":
        if (!url.searchParams.has("url")) {
          res.writeHead(HttpStatusCode.BAD_REQUEST, {
            "Content-Type": "application/json",
          });
          res.write(
            JSON.stringify(
              new BadRequest(
                "Required query parameter 'url' is missing. Please ensure that you include the necessary parameter(s)."
              )
            )
          );
          return;
        }

        let wordLimit = 300;
        if (url.searchParams.has("word-limit")) {
          wordLimit = parseInt(url.searchParams.get("word-limit")!);
        }

        const rssParser = new RSSParser();

        const feed = await rssParser.parseURL(url.searchParams.get("url")!);

        const wordCount = new Map<string, number>();
        const words = feed.items
          .map((item) => item.content)
          .filter((content): content is string => content !== null)
          .flatMap((content) =>
            content
              .replace(/[^0-9a-ö\s\-]/gi, "")
              .trim()
              .split(" ")
          );

        removeStopwords(words, [...eng, ...swe])
          .filter((word) => word.length > 1 && !word.match(/^[0-9]+$/))
          .forEach((word) => {
            const count = wordCount.get(word);
            if (count) {
              wordCount.set(word, count + 1);
            } else {
              wordCount.set(word, 1);
            }
          });

        const array = Array.from(wordCount, ([text, size]) => ({ text, size }))
          .sort(({ size: a }, { size: b }) => b - a)
          .slice(0, wordLimit);

        res.writeHead(HttpStatusCode.OK, {
          "Content-Type": "application/json",
        });
        res.write(JSON.stringify(array));
        break;
      default:
        res.writeHead(HttpStatusCode.NOT_FOUND);
        res.write("Not Found");
        break;
    }
  } catch (e) {
    console.error(e);
    res.writeHead(HttpStatusCode.INTERNAL_SERVER_ERROR);
    res.write("Something went wrong! Check the console...");
  } finally {
    res.end();
  }
}
