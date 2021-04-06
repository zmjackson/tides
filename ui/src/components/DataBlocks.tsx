import React, { useState, useEffect } from "react";
import { StationMetaData } from "../types/Stations";
import { Granularity } from "./DataBlock";
import { Line } from "react-chartjs-2";

type BasicChartProps = {
  station: StationMetaData;
  start: Date;
  end: Date;
  granularity: Granularity;
};

export function BasicChart({
  station,
  start,
  end,
  granularity,
}: BasicChartProps): JSX.Element {
  const [labels, setLabels] = useState<string[]>([]);
  const [levels, setLevels] = useState<number[]>([]);

  useEffect(() => {
    fetch(
      // prettier-ignore
      `/basic_range?begin_date=${start.toISOString().replaceAll("-", "").split("T")[0]
                  }&end_date=${end.toISOString().replaceAll("-", "").split("T")[0]
                  }&station_id=${station.id
                  }&product=${granularity}`
    )
      .then((res) => res.json())
      .then((res) => {
        setLabels(res["data"]["timestamps"]);
        setLevels(res["data"]["levels"]);
      });
  }, [start, end, granularity]);

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Water Level Data",
        data: levels,
        borderColor: ["rgba(32, 143, 217, 0.2)"],
        backgroundColor: ["rgba(32, 143, 217, 0.2)"],
        pointBackgroundColor: ["rgba(243, 241, 149, 0.2)"],
        pointBorderColor: ["rgba(243, 241, 149, 0.2)"],
      },
    ],
  };
  const options = {
    scales: {
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: "Water Level (ft)",
          },
        },
      ],
      xAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: "date",
          },
        },
      ],
    },
    elements: { point: { radius: 0, hitRadius: 10, hoverRadius: 5 } },
  };
  return <Line data={data} options={options} />;
}

type FloodsProps = {
  station: StationMetaData;
  start: Date;
  end: Date;
  granularity: Granularity;
};
export function Floods({
  station,
  start,
  end,
  granularity,
}: FloodsProps): JSX.Element {
  const [threshold, setThreshold] = useState<number>(0.025);
  const [floods, setFloods] = useState<string[]>([]);

  useEffect(() => {
    fetch(
      // prettier-ignore
      `/floods?begin_date=${start.toISOString().replaceAll("-", "").split("T")[0]
                  }&end_date=${end.toISOString().replaceAll("-", "").split("T")[0]
                  }&station_id=${station.id
                  }&product=${granularity
                  }&threshold=${threshold}`
    )
      .then((res) => res.json())
      .then((res) => {
        console.log(res["data"]);
        setFloods(res["data"]);
      });
  }, [start, end, granularity, threshold]);

  const onThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setThreshold(parseFloat(e.target.value));
  };

  return (
    <div>
      <p>Threshold:</p>
      <input
        type="number"
        step="0.001"
        min="0"
        value={threshold}
        onChange={onThresholdChange}
      />
      <p>Floods:</p>
      <ol>
        {" "}
        {floods.map((date, i) => (
          <li key={i}>{date}</li>
        ))}
      </ol>
    </div>
  );
}
