import React, { useState } from "react";
import {
  Button,
  Checkbox,
  Modal,
  RadioGroup,
  TextField,
  FormControlLabel,
  Radio,
} from "@material-ui/core";
import "leaflet/dist/leaflet.css";
import "../App.css";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import ChartComponent from "./Chart";

import { StationMetaData } from "../types/Stations";

type SiteViewProps = { station: StationMetaData };

export default function SiteView({ station }: SiteViewProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("2021-01-01");
  const [endDate, setEndDate] = useState("2021-01-02");
  const [floodThreshold, setFloodThreshold] = useState("0");
  const [numFloods, setNumFloods] = useState(0);
  const [overallAverage, setOverallAverage] = useState(0);
  const [allWaterLevels, setAllWaterLevels] = useState([]);
  const [allWaterLevelDates, setAllWaterLevelDates] = useState([]);
  const [chartResolution, setChartResolution] = useState("6 mins");
  const [normalorAverage, setNormalorAverage] = useState("Normal");
  //const [floodList, setFloodList] = React.useState([{"start_date": " ", "end_date": " ", "duration": " ", "average": " "}]);
  const [displayRows, setdisplayRows] = useState([
    { start: "", end: "", duration: "", average: "" },
  ]);
  let rows = [{ start: "", end: "", duration: "", average: "" }];
  let floodList = [
    { start_date: " ", end_date: " ", duration: " ", average: " " },
  ];

  function handleSubmit() {
    console.log(startDate);
    console.log(endDate);
    console.log(parseFloat(floodThreshold));
    console.log(station.id);

    const startString = startDate.replace("-", "").replace("-", "");
    console.log(startString);

    fetch(
      "/getFloodLevelData/" +
        floodThreshold +
        "/" +
        station.id +
        "/" +
        startDate.replace("-", "").replace("-", "") +
        "/" +
        endDate.replace("-", "").replace("-", "")
    )
      .then((res) => res.json())
      .then((res) => {
        setNumFloods(res.metadata.num_of_floods);
        setOverallAverage(res.metadata.overallAverage);
        setAllWaterLevels(res.metadata.all_water_levels);
        setAllWaterLevelDates(res.metadata.all_water_level_dates);
        floodList = res.data;
      })
      .then((res) => {
        console.log(res);
        console.log("this should have worked");

        rows = [];
        for (let i = 0; i < floodList.length; i++) {
          rows.push({
            start: floodList[i].start_date,
            end: floodList[i].end_date,
            duration: floodList[i].duration,
            average: floodList[i].average,
          });
        }
        setdisplayRows([]);
        setdisplayRows(rows);
        console.log(displayRows);
      });
  }

  return (
    <div>
      <div className="dialogSideBySide">
        <div className="dialogDiv">
          <DialogTitle id="simple-dialog-title">{station.name}</DialogTitle>
          <form className={"hello"} noValidate>
            <TextField
              id="StartDate"
              label="Start Date"
              type="date"
              value={startDate}
              onInput={(e) =>
                setStartDate((e.target as HTMLInputElement).value)
              }
              InputLabelProps={{
                shrink: true,
              }}
            />
            <br />
            <br />
            <TextField
              id="EndDateate"
              label="End Date"
              type="date"
              value={endDate}
              onInput={(e) => setEndDate((e.target as HTMLInputElement).value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <br />
            <br />
            <TextField
              id="FloodThreshold"
              label="Flood Threshold"
              type="number"
              value={floodThreshold}
              onInput={(e) =>
                setFloodThreshold((e.target as HTMLInputElement).value)
              }
              InputLabelProps={{
                shrink: true,
              }}
            />
            <br />
            <br />
            <Button variant="outlined" color="primary" onClick={handleSubmit}>
              Get Data
            </Button>
          </form>
          <br />
          <strong>Number of Floods: {numFloods}</strong>
        </div>
        <div className="dialogDiv">
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
                {displayRows.map((displayRows) => (
                  <TableRow key={displayRows.start}>
                    <TableCell component="th" scope="row">
                      {displayRows.start}
                    </TableCell>
                    <TableCell align="right">{displayRows.end}</TableCell>
                    <TableCell align="right">{displayRows.duration}</TableCell>
                    <TableCell align="right">{displayRows.average}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
      <div className="linechart">
        <ChartComponent
          data={allWaterLevels}
          labels={allWaterLevelDates}
          resolution={chartResolution}
          normalorAverage={normalorAverage}
        />
        <RadioGroup
          row
          aria-label="timeResolution"
          name="timeResolution"
          onChange={(e) => setChartResolution(e.target.value)}
          value={chartResolution}
        >
          <FormControlLabel value="6 mins" control={<Radio />} label="6 mins" />
          <FormControlLabel value="1 hour" control={<Radio />} label="1 hour" />
          <FormControlLabel value="1 day" control={<Radio />} label="1 day" />
          <FormControlLabel value="1 week" control={<Radio />} label="1 week" />
        </RadioGroup>
        <RadioGroup
          row
          aria-label="NormalorAverage"
          name="NormalorAverage"
          onChange={(e) => setNormalorAverage(e.target.value)}
          value={normalorAverage}
        >
          <FormControlLabel value="Normal" control={<Radio />} label="Normal" />
          <FormControlLabel
            value="Average"
            control={<Radio />}
            label="Average"
          />
        </RadioGroup>
      </div>
      <br />
      <br />
    </div>
  );
}
