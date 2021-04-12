import React, { useState, useEffect } from "react";
import "./App.css";
import { StationMetaData } from "./types/Stations";
import { StationsDropdown } from "./components/StationsDropdown";
import StationDataView from "./components/Dashboard";

export default function App(): JSX.Element {
  const [metaData, setMetaData] = useState<StationMetaData[]>([]);
  const [station, setStation] = useState<StationMetaData>();

  useEffect(() => {
    fetch("/station_metadata")
      .then((res) => res.json())
      .then((res) => setMetaData(res));
  }, []);

  return (
    <div className="box">
      <div className="top-ribbon">
        <StationsDropdown
          stations={metaData}
          addStation={(station) => setStation(station)}
        />
      </div>
      <div className="content">
        {station && <StationDataView station={station} />}
      </div>
    </div>
  );
}
