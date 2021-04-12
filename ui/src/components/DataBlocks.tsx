import React, { useState, useEffect } from "react";
import { StationMetaData } from "../types/Stations";
import { Granularity } from "./Dashboard";
import { Line } from "react-chartjs-2";

type BasicDataProps = {
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
}: BasicDataProps): JSX.Element {
  const [labels, setLabels] = useState<string[]>([]);
  const [levels, setLevels] = useState<number[]>([]);

  useEffect(() => {
    fetch(
      // prettier-ignore
      `/getFloodLevelData?start_date=${start.toISOString().replaceAll("-", "").split("T")[0]
                  }&end_date=${end.toISOString().replaceAll("-", "").split("T")[0]
                  }&station_id=${station.id
                  }&product=${granularity
                  }&floodThreshold=${0}`
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
  return (
    <div className="data-block-container">
      <Line data={data} options={options} />
    </div>
  );
}

export function Floods({
  station,
  start,
  end,
  granularity,
}: BasicDataProps): JSX.Element {
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
    <div className="data-block-container">
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
