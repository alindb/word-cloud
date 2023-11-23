import { useEffect } from "react";
import * as d3 from "d3";
import d3Cloud from "d3-cloud";
import { Data } from "./App";

const config = {
  width: 960,
  height: 720,
  fontFamily: "Montserrat",
  fontScale: 20,
  padding: 5,
};

export default function WordCloud({ data }: { data: Data[] }) {
  const randomOrientation = () => (Math.random() > 0.75 ? -90 : 0);

  const randomColor = () => `hsl(${Math.floor(360 * Math.random())}, 70%, 60%)`;

  const createWordCloud = async () => {
    const { width, height, padding, fontFamily, fontScale } = config;

    const svg = d3
      .create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("font-family", fontFamily)
      .attr("text-anchor", "middle")
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    const g = svg.append("g");

    const words = data.map(({ text, size }) => ({ text, size: size ** 2 }));
    const scale = 1 / (words.at(-1)?.size || 1);

    const cloud = d3Cloud()
      .size([width, height])
      .words(words)
      .padding(padding)
      .rotate(randomOrientation)
      .font(fontFamily)
      .fontSize((d) => Math.sqrt(d.size! * scale) * fontScale)
      .on("word", ({ size, x, y, rotate, text }) => {
        g.append("text")
          .attr("font-size", size!)
          .attr("font-weight", 600)
          .attr("letter-spacing", 1)
          .attr("fill", randomColor)
          .attr("transform", `translate(${x},${y}) rotate(${rotate})`)
          .text(text!);
      });

    cloud.start();
    const graphContainer = d3.select(".wordcloud-container");
    graphContainer.selectAll("*").remove();
    graphContainer.append(() => svg.node());
  };

  useEffect(() => {
    if (data.length > 0) {
      createWordCloud();
    }
  }, [data]);

  return <div className="wordcloud-container" />;
}
