import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { Line } from "react-chartjs-2";
import { FloodData } from "./Dashboard";

type BasicChartProps = {
  levels: string[];
  labels: string[];
  prediction_levels: string[];
  MHHW_levels: string[];
  MLLW_levels: string[];
  MHW_levels: string[];
  MLW_levels: string[];
};

export function BasicChart({ levels, labels, prediction_levels, MHHW_levels, MLLW_levels, MHW_levels, MLW_levels }: BasicChartProps): JSX.Element {
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Water Level Data",
        data: levels,
        borderColor: ["rgba(32, 143, 217, 0.5)"],
        backgroundColor: ["rgba(32, 143, 217, 0.5)"],
        pointBackgroundColor: ["rgba(243, 241, 149, 0.2)"],
        pointBorderColor: ["rgba(243, 241, 149, 0.2)"],
        fill: false
      },
      {
        label: "Predictions",
        data: prediction_levels,
        borderColor: ["rgba(248, 88, 88, 0.5)"],
        backgroundColor: ["rgba(248, 88, 88, 0.5)"],
        pointBackgroundColor: ["rgba(243, 241, 149, 0.2)"],
        pointBorderColor: ["rgba(243, 241, 149, 0.2)"],
        fill: false
      },
      {
        label: "MHHW",
        data: MHHW_levels,
        borderColor: ["rgba(213, 239, 15, 0.5)"],
        backgroundColor: ["rgba(213, 239, 15, 0.5)"],
        pointBackgroundColor: ["rgba(243, 241, 149, 0.2)"],
        pointBorderColor: ["rgba(243, 241, 149, 0.2)"],
        fill: false
      },
      {
        label: "MLLW",
        data: MLLW_levels,
        borderColor: ["rgba(239, 153, 15, 0.5)"],
        backgroundColor: ["rgba(239, 153, 15, 0.5)"],
        pointBackgroundColor: ["rgba(243, 241, 149, 0.2)"],
        pointBorderColor: ["rgba(243, 241, 149, 0.2)"],
        fill: false
      },
      {
        label: "MHW",
        data: MHW_levels,
        borderColor: ["rgba(41, 15, 239, 0.5)"],
        backgroundColor: ["rgba(41, 15, 239, 0.5)"],
        pointBackgroundColor: ["rgba(243, 241, 149, 0.2)"],
        pointBorderColor: ["rgba(243, 241, 149, 0.2)"],
        fill: false
      },
      {
        label: "MLW",
        data: MLW_levels,
        borderColor: ["rgba(15, 239, 153, 0.5)"],
        backgroundColor: ["rgba(15, 239, 153, 0.5)"],
        pointBackgroundColor: ["rgba(243, 241, 149, 0.2)"],
        pointBorderColor: ["rgba(243, 241, 149, 0.2)"],
        fill: false
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
};

export function Floods({
  data,
  threshold,
  onSetThreshold,
}: FloodsProps): JSX.Element {
  const onThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newThreshold = parseFloat(e.target.value);
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
