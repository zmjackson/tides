import React, {useState, useEffect} from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import FavoritesMap from "./components/FavoritesMap";

import logo from './logo.svg';
import './App.css';
import L from 'leaflet';

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
      <FavoritesMap />
      </div>
    </div>
  );
}

export default App;