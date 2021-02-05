import React, {useState, useEffect} from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

import logo from './logo.svg';
import './App.css';

interface StationsData {
  stationName: string,
  stationID: number,
  lat: number,
  lon: number,
};

interface StationMetaData {
  readonly id: number;
  readonly latitude: number;
  readonly longitude: number;
  readonly name: string;
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
    name: ''
  });

  useEffect(() => {
    fetch('/basic_test')
    .then(res => res.json())
    .then(res => {
      setMetaData({
        id: res.metadata.id, 
        latitude: res.metadata.lat, 
        longitude: res.metadata.lon, 
        name: res.metadata.name
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

    const list : StationsData[] = [
        {
            stationName: "California Dreamin",
            stationID: 123456,
            lat: 40.91088362120013, 
            lon: -125.752799203777597
        },
        {
            stationName: metaData.name,
            stationID: metaData.id,
            lat: metaData.latitude, 
            lon: metaData.longitude
        }
    ];

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit whyyy<code>src/App.tsx</code> and save to reload.
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
            <strong>{item.stationName} at {item.stationID}</strong><br />
        </Popup>
    </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;