import React, { useState, useEffect } from "react";
import "./App.css";
import { StationMetaData } from "./types/Stations";
import { StationsDropdown } from "./components/StationsDropdown";
import { SiteView } from "./components/SiteView";
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

  useEffect(() => {
    fetch("/station_metadata")
      .then((res) => res.json())
      .then((res) => setMetaData(res));
  }, []);

  return (
    <div className="App">
      <div style={styles.topBar}>
        <StationsDropdown stations={metaData} />
      </div>
      <div>
        <SiteView id={69420} name={"test"} lat={0} lon={0} />
      </div>
    </div>
  );
}
