import React, {useState, useEffect} from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import logo from './logo.svg';
import './App.css';

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

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit whyyyy<code>src/App.tsx</code> and save to reload.
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
      <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
    <TileLayer
      attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <Marker position={[51.505, -0.09]}>
      <Popup>
        A pretty CSS3 popup. <br /> Easily customizable.
      </Popup>
    </Marker>
  </MapContainer>
    </div>
  );
}

export default App;
