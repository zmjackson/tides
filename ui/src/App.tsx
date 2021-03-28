import React, { useState, useEffect } from "react";
import "./App.css";
import { StationMetaData } from "./types/Stations";
import { StationsDropdown } from "./components/StationsDropdown";
import SiteView from "./components/SiteView";
import StationDataView from "./components/StationDataView";
import StyleSheet from "./types/StyleSheet";

const styles: StyleSheet = {
  topBar: {
    display: "flex",
    height: "3em",
    backgroundColor: "#132f3d",
    alignItems: "center",
  },
};

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
    <div className="App">
      <div style={styles.topBar}>
        <StationsDropdown stations={metaData} addStation={addStation} />
      </div>
      <div>
        <StationDataView currentStations={currentStations} />
      </div>
    </div>
  );
}
