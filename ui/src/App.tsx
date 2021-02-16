import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import './App.css';
import SiteView from './SiteView'

interface StationMetaData {
  readonly id: number;
  readonly name: string;
  readonly lat: number;
  readonly lon: number;
}

export default function App() {
  const [metaData, setMetaData] = useState<StationMetaData[]>([]);

  useEffect(() => {
    fetch('/station_metadata')
      .then(res => res.json())
      .then(res => setMetaData(res));
  }, []);

  const position: LatLngExpression = [39.1350, -98.0317];
  const zoom: number = 3;

  const icon: L.DivIcon = L.divIcon({
    className: "station-icon",
    iconSize: [30, 30],
    iconAnchor: [0, 0],
    popupAnchor: [15, 0]
  });

  return (
    <div className="App">
      <div>
        <MapContainer center={position} zoom={zoom} scrollWheelZoom={true}>
          <TileLayer
            attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {metaData.map((station, index) =>
            <Marker icon={icon} key={index} position={[station.lat, station.lon]}>
              <Tooltip direction="top" offset={[15, 0]}>
                {station.name}
              </Tooltip>
              <Popup>
                <strong>Station Name: {station.name}</strong><br />
                <strong>Station ID: {station.id}</strong><br />
                <SiteView name = {station.name} id = {station.id} lat = {station.lat} lon = {station.lon} ></SiteView>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
