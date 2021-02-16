import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L, { LatLngExpression } from "leaflet";
import { Button, Modal, TextField } from '@material-ui/core';
import "leaflet/dist/leaflet.css";
import './App.css';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { ENGINE_METHOD_RAND } from 'constants';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

interface StationMetaData {
  readonly id: number;
  readonly name: string;
  readonly lat: number;
  readonly lon: number;
}

export default function SiteView(props: StationMetaData) {
  const [metaData, setMetaData] = useState<StationMetaData[]>([]);
  const [open, setOpen] = React.useState(false);
  const [startDate, setStartDate] = React.useState("1969-04-20");
  const [endDate, setEndDate] = React.useState("1969-04-20");
  const [floodThreshold, setFloodThreshold] = React.useState("0");
  const [numFloods, setNumFloods] = React.useState(0);
  const [overallAverage, setOverallAverage] = React.useState(0);
  //const [floodList, setFloodList] = React.useState([{"start_date": " ", "end_date": " ", "duration": " ", "average": " "}]);
  const [displayRows, setdisplayRows] = React.useState([{ "start": "", "end": "", "duration": "", "average": ""}]);
  var rows = [{ "start": "", "end": "", "duration": "", "average": ""}];
  var floodList = [{"start_date": " ", "end_date": " ", "duration": " ", "average": " "}];

  function handleSubmit() {
    console.log(startDate);
    console.log(endDate);
    console.log(parseFloat(floodThreshold));
    console.log(props.id);

    var startString = startDate.replace("-", "").replace("-", "");
    console.log(startString);

    fetch('/getFloodLevelData/' + floodThreshold + '/' + props.id + '/' + startDate.replace("-", "").replace("-", "") + '/' + endDate.replace("-", "").replace("-", ""))
      .then(res => res.json())
      .then(res => {
        setNumFloods(res.metadata.num_of_floods);
        setOverallAverage(res.metadata.overallAverage);
        floodList = res.data;
      })
      .then(res => {
        console.log(res);
        console.log("this should have worked")
        
        rows = [];
        for (let i = 0; i < floodList.length; i++) {
          rows.push({ "start": floodList[i].start_date, "end": floodList[i].end_date, "duration": floodList[i].duration, "average": floodList[i].average});
        }
        setdisplayRows([]);
        setdisplayRows(rows);
        console.log(displayRows);
      });
  }

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={() => setOpen(true)}>
        View Additional Details
      </Button>
      <Dialog onClose={() => setOpen(false)} open={open} fullWidth={false} maxWidth={'lg'}>
        <div className="dialogSideBySide">
        <div className="dialogDiv">
          <DialogTitle id="simple-dialog-title">{props.name}</DialogTitle>
          <form className={"hello"} noValidate>
            <TextField
              id="StartDate"
              label="Start Date"
              type="date"
              value={startDate}
              onInput={e => setStartDate((e.target as HTMLInputElement).value)}
              InputLabelProps={{
                shrink: true,
              }}
            /><br /><br />
            <TextField
              id="EndDateate"
              label="End Date"
              type="date"
              value={endDate}
              onInput={e => setEndDate((e.target as HTMLInputElement).value)}
              InputLabelProps={{
                shrink: true,
              }}
            /><br /><br />
            <TextField
              id="FloodThreshold"
              label="Flood Threshold"
              type="number"
              value={floodThreshold}
              onInput={e => setFloodThreshold((e.target as HTMLInputElement).value)}
              InputLabelProps={{
                shrink: true,
              }}
            /><br /><br />
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
        <br />
        <br />
      </Dialog>
    </div>
  );
}
