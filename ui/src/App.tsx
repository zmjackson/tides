import React, {useState, useEffect} from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import * as data from './response.json';

import logo from './logo.svg';
import './App.css';
import { toEditorSettings } from 'typescript';


interface StationsData {
  stationName: string,
  stationID: number,
  lat: number,
  lon: number,
  t: string;
  v: number;
  s: number;
  f: string;
};

interface StationMetaData {
  readonly id: number;
  readonly latitude: number;
  readonly longitude: number;
  readonly name: string;
  readonly t: string;
  readonly v: number;
  readonly s: number;
  readonly f: string;
}

// interface WaterLevel {
//   readonly time: string;
//   readonly value: number;
//   readonly sigma: number;
//   readonly flags: string;
//   readonly qualityAssurance: string;
// }

// interface StationData {
//   data: WaterLevel[];
//   metadata: StationMetaData;  
// }

function App() {
  const [metaData, setMetaData] = useState<StationMetaData>({
    id: 0, 
    latitude: 0, 
    longitude: 0, 
    name: '', 
    t:'',
    v: 0,
    s: 0,
    f: ''
  });

  useEffect(() => {
    fetch('/basic_test')
    .then(res => res.json())
    .then(res => {
      setMetaData({
        id: res.metadata.id, 
        latitude: res.metadata.lat, 
        longitude: res.metadata.lon, 
        name: res.metadata.name,
        t: "exapletime",
        v: 0,
        s: 0,
        f: ''
      });
    });
  }, []);

  const position : LatLngExpression = [39.1350, -98.0317];
    const zoom : number = 3;

    const icon : L.DivIcon = L.divIcon({
        className: "station-icon",
        iconSize: [30, 30],
        iconAnchor: [0, 0],
        popupAnchor: [15, 0]
    });

    const list : StationsData[] = [];


const siteArray: any[] = Array.of(data);
let innerArray = siteArray[0].default;

for (let i = 0; i < innerArray.length; i++)
{
  if(innerArray[i].hasOwnProperty('metadata'))
  {
    list.push({stationName: innerArray[i].metadata.name,
    stationID: +innerArray[i].metadata.id,
    lat: +innerArray[i].metadata.lat, 
    lon: +innerArray[i].metadata.lon, 
    t: innerArray[i].data[0].t, 
    v: +innerArray[i].data[0].v,
    s: +innerArray[i].data[0].s, 
    f: innerArray[i].data[0].f})
  }
}


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit {Object.keys(data).length} <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <p>{metaData.name} has coordinates: {metaData.latitude}, {metaData.longitude}.</p>
      </header>
      <div>
      <MapContainer center={position} zoom={zoom} scrollWheelZoom={true}>
            <TileLayer
            attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {list.map((item, index) => 
    <Marker icon={icon} key={index} position={[item.lat, item.lon]}>
      <Tooltip direction="top" offset={[15, 0]}>
       {item.stationName}
     </Tooltip>
        <Popup>
            <strong>Station Name: {item.stationName}</strong><br />
            <strong>Station ID: {item.stationID}</strong><br />
            <strong>Last Updated: {item.t}</strong><br />
            <strong>V: {item.v}</strong><br />
            <strong>S: {item.s}</strong><br />
            <strong>F: {item.f}</strong><br />
        </Popup>
    </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;