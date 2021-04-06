import React, { useState, useEffect } from "react";
import "./App.css";
import { StationMetaData } from "./types/Stations";
import { StationsDropdown } from "./components/StationsDropdown";
import StationDataView from "./components/DataView";

export default function App(): JSX.Element {
  const [metaData, setMetaData] = useState<StationMetaData[]>([]);
  const [currentStations, setCurrentStations] = useState<StationMetaData[]>([]);

  useEffect(() => {
    fetch("/station_metadata")
      .then((res) => res.json())
      .then((res) => setMetaData(res));
  }, []);

  const addStation = (station: StationMetaData) =>
    setCurrentStations([...currentStations, station]);

  return (
    <div className="box">
      <div className="top-ribbon">
        <StationsDropdown stations={metaData} addStation={addStation} />
      </div>
      <div className="content">
        <StationDataView currentStations={currentStations} />
      </div>
    </div>
  );
}
