import React, { useState, useEffect } from "react";
import { StationMetaData } from "../types/Stations";
import { Granularity } from "./DataBlock";
import { Line } from "react-chartjs-2";

export function BasicChart(
  station: StationMetaData,
  start: Date,
  end: Date,
  granularity: Granularity
): JSX.Element {
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
  }, []);

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
