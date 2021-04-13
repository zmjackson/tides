import React, { useState, useEffect } from "react";
import { StationMetaData } from "../types/Stations";
import { Granularity, FloodData } from "./Dashboard";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
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
      `/getFloodLevelData?floodThreshold=${6.0
                        }&start_date=${start.toISOString().replaceAll("-", "").split("T")[0]
                        }&end_date=${end.toISOString().replaceAll("-", "").split("T")[0]
                        }&station_id=${station.id
                        }&product=${granularity}`
    )
      .then((res) => res.json())
      .then((res) => {
        setLabels(res["metadata"]["all_water_level_dates"]);
        setLevels(res["metadata"]["all_water_levels"]);
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
    <div className="data-block-container chart-block">
      <Line data={data} options={options} />
    </div>
  );
}

type FloodsProps = {
  data: FloodData[];
  threshold: number;
  onSetThreshold: (threshold: number) => void;
}

export function Floods({
  data, threshold, onSetThreshold
}: FloodsProps): JSX.Element {
  const onThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newThreshold = parseFloat(e.target.value)
    console.log(newThreshold);
    onSetThreshold(newThreshold);
  };

  return (
    <div className="data-block-container floods-block">
      <p>Threshold:</p>
      <input
        type="number"
        step="0.1"
        min="0"
        value={threshold}
        onChange={onThresholdChange}
      />
      <p>Floods:</p>
      <TableContainer component={Paper}>
          <Table size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>StartDate</TableCell>
                <TableCell align="right">EndDate</TableCell>
                <TableCell align="right">Duration</TableCell>
                <TableCell align="right">Average</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((flood) => (
                <TableRow key={flood.start_date}>
                  <TableCell component="th" scope="row">
                    {flood.start_date}
                  </TableCell>
                  <TableCell align="right">{flood.end_date}</TableCell>
                  <TableCell align="right">{flood.duration}</TableCell>
                  <TableCell align="right">{flood.average}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

    </div>
  );
}
