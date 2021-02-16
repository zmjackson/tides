import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L, { LatLngExpression } from "leaflet";
import { Button, Modal, TextField } from '@material-ui/core';
import "leaflet/dist/leaflet.css";
import './App.css';

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { ENGINE_METHOD_RAND } from 'constants';

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

  useEffect(() => {
    fetch('/station_metadata')
      .then(res => res.json())
      .then(res => setMetaData(res));
  }, []);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  function handleSubmit() {
    console.log(startDate); 
    console.log(endDate);
    console.log(parseFloat(floodThreshold));
    console.log(props.id);
}

  const position: LatLngExpression = [39.1350, -98.0317];
  const zoom: number = 3;

  const icon: L.DivIcon = L.divIcon({
    className: "station-icon",
    iconSize: [30, 30],
    iconAnchor: [0, 0],
    popupAnchor: [15, 0]
  });

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={() => setOpen(true)}>
        View Additional Details
      </Button>
      <Dialog onClose={handleClose} open={open} fullWidth={true}>
        <div className = "dialogDiv">
        <DialogTitle id="simple-dialog-title">{props.name}</DialogTitle>
        <form className= {"hello"} noValidate>
          <TextField
            id="StartDate"
            label="Start Date"
            type="date"
            value={startDate}
            onInput={ e=>setStartDate((e.target as HTMLInputElement).value)}
            InputLabelProps={{
              shrink: true,
            }}
          /><br /><br />
          <TextField
            id="EndDateate"
            label="End Date"
            type="date"
            value={endDate}
            onInput={ e=>setEndDate((e.target as HTMLInputElement).value)}
            InputLabelProps={{
              shrink: true,
            }}
          /><br /><br />
          <TextField
            id="FloodThreshold"
            label="Flood Threshold"
            type="number"
            value={floodThreshold}
            onInput={ e=>setFloodThreshold((e.target as HTMLInputElement).value)}
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
      </Dialog>
    </div>
  );
}
