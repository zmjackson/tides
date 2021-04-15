import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { StationMetaData } from "../types/Stations";

type Props = {
  stations: StationMetaData[];
  addStation: (station: StationMetaData) => void;
};

export default function StationMap({
  stations,
  addStation,
}: Props): JSX.Element {
  const position: LatLngExpression = [39.135, -98.0317];

  const zoom = 3;

  const icon: L.DivIcon = L.divIcon({
    className: "station-icon",
    iconSize: [8, 8],
    iconAnchor: [0, 0],
    popupAnchor: [0, 0],
  });

  return (
    <MapContainer
      center={position}
      zoom={zoom}
      scrollWheelZoom={true}
      minZoom={3}
    >
      <TileLayer
        attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stations.map((station) => (
        <Marker
          icon={icon}
          key={station.id}
          position={[station.lat, station.lon]}
        >
          <Tooltip direction="top" offset={[15, 0]}>
            {station.name}
          </Tooltip>
          <Popup>
            <strong>Station Name: {station.name}</strong>
            <br />
            <strong>Station ID: {station.id}</strong>
            <br />
            <button>
              <button onClick={() => addStation({ ...station })}>Select</button>
            </button>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
