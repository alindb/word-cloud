import { useState } from "react";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import WordCloud from "./WordCloud";
import "./App.css";

export interface Data {
  text: string;
  size: number;
}

interface Example {
  title: string;
  url: string;
}

const examples: Example[] = [
  {
    title: "Aftonbladet [SE]",
    url: "https://rss.aftonbladet.se/rss2/small/pages/sections/senastenytt/",
  },
  {
    title: "Sportbladet - Hockey [SE]",
    url: "https://rss.aftonbladet.se/rss2/small/pages/sections/sportbladet/hockey/",
  },
  {
    title: "Sportbladet - Fotboll [SE]",
    url: "https://rss.aftonbladet.se/rss2/small/pages/sections/sportbladet/fotboll/",
  },
  {
    title: "New York Times - U.S.",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/US.xml",
  },
  {
    title: "New York Times - Sports",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml",
  },
  {
    title: "Fox News - World",
    url: "https://moxie.foxnews.com/google-publisher/world.xml",
  },
  {
    title: "Fox News - Sports",
    url: "https://moxie.foxnews.com/google-publisher/sports.xml",
  },
  {
    title: "Fox News - Tech",
    url: "https://moxie.foxnews.com/google-publisher/tech.xml",
  },
];

const getRandomFeed = () =>
  examples[Math.floor(Math.random() * examples.length)];

const wordLimit = 50;

export function App() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const [data, setData] = useState<Data[]>([]);

  if (error != null) {
    console.error(error);
    return <div>Error! Check console...</div>;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement> | null) => {
    if (!url) {
      fetchRandomFeed();
    } else {
      fetchData(url);
    }
    event?.preventDefault();
  };

  const fetchData = (rssUrl: string) => {
    setIsLoading(true);
    fetch(`/api/rss?url=${rssUrl}&word-limit=${wordLimit}`)
      .then((response) => response.json())
      .then((json) => {
        if (json.error) {
          throw new Error(json.message);
        }
        return json;
      })
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const exampleClick = (example: Example) => {
    setUrl(example.url);
    fetchData(example.url);
  };

  const fetchRandomFeed = () => {
    const randomFeed = getRandomFeed();
    setUrl(randomFeed.url);
    fetchData(randomFeed.url);
  };

  return (
    <div className="App">
      <h1>💬 Word Cloud</h1>
      <Form onSubmit={handleSubmit} className="input-container mb-3">
        <Form.Group className="flex-grow-1">
          <Form.Label htmlFor="rss-url-input" className="mb-0">
            RSS Feed URL
          </Form.Label>
          <Form.Control
            id="rss-url-input"
            placeholder="Insert URL"
            value={url}
            onChange={handleChange}
            type="text"
          />
        </Form.Group>
        <Form.Group className="flex-grow-1 d-flex gap-10">
          <Button disabled={isLoading} variant="secondary" type="submit">
            Fetch feed
          </Button>
          <Button
            disabled={isLoading}
            variant="secondary"
            onClick={fetchRandomFeed}
            className="ml-auto"
          >
            🎲 Random
          </Button>
          <Dropdown>
            <Dropdown.Toggle disabled={isLoading} variant="secondary">
              Examples
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {examples.map((example) => (
                <Dropdown.Item
                  key={example.title}
                  onClick={() => exampleClick(example)}
                >
                  {example.title}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Form.Group>
      </Form>
      {isLoading ? (
        <Spinner animation="border" role="status" />
      ) : (
        <WordCloud data={data} />
      )}
    </div>
  );
}
