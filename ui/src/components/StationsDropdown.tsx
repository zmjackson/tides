import React, { useEffect, useRef, useState } from "react";
import { StationMetaData } from "../types/Stations";
import DetectOutsideClick from "./DetectOutsideClick";
import StationMap from "./Map";
import StyleSheet from "../types/StyleSheet";

type StationListingProps = {
  station: StationMetaData;
  addStation: (station: StationMetaData) => void;
};

const StationListing = ({
  station,
  addStation,
}: StationListingProps): JSX.Element => (
  <li style={{ display: "flex", justifyContent: "space-between" }}>
    <p>
      <span style={{ color: "white", marginRight: "0.5em", fontSize: "12px" }}>
        {station.name}
      </span>
      <span style={{ color: "gray", fontSize: "12px" }}>{station.id}</span>
    </p>
    <button onClick={() => addStation({ ...station })}>+</button>
  </li>
);

type DropDownProps = {
  stations: StationMetaData[];
  addStation: (station: StationMetaData) => void;
};

const DropdownContent = ({
  stations,
  addStation,
}: DropDownProps): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<StationMetaData[]>([]);
  const searchBoxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const results = stations.filter(
      (station) =>
        station.name.toLowerCase().includes(searchTerm) ||
        station.id.toString().includes(searchTerm)
    );
    setSearchResults(results);
  }, [searchTerm]);

  useEffect(() => {
    if (searchBoxRef.current !== null) {
      searchBoxRef.current.focus();
    }
  });

  const updateSearchTerm = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div>
      <h3 style={{ color: "white" }}>Stations</h3>
      <input
        type="text"
        placeholder="Search by name or ID..."
        value={searchTerm}
        onChange={updateSearchTerm}
        ref={searchBoxRef}
        style={styles.searchBox}
      />
      <ul style={styles.stationList}>
        {searchTerm.length > 0 &&
          searchResults.map((station) => (
            <StationListing
              station={station}
              addStation={addStation}
              key={station.id}
            />
          ))}
      </ul>
    </div>
  );
};

const styles: StyleSheet = {
  dropBtn: {
    width: "100px",
    height: "30px",
    backgroundColor: "#ffc800",
    borderRadius: "4px",
    padding: "5px",
    border: "1px solid #ffee57",
  },
  drop: {
    zIndex: 99,
    maxHeight: "30em",
    width: "70em",
    position: "absolute",
    top: "40px",
    backgroundColor: "#132f3d",
    borderRadius: "8px",
    boxShadow: "0px 3px 10px 0px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "row",
  },
  stationList: {
    overflowY: "scroll",
    listStyle: "none",
    maxHeight: "23em",
  },
  left: {
    flex: "1",
  },
  right: {
    flex: "2",
  },
  searchBox: {
    width: "80%",
    color: "white",
    backgroundColor: "#0e232e",
    padding: "5px",
    border: "1px solid lightblue",
    borderRadius: "2px",
  },
};

export const StationsDropdown = ({
  stations,
  addStation,
}: DropDownProps): JSX.Element => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={styles.dropBtn}>
        Add Station
      </button>
      {open && (
        <DetectOutsideClick onOutsideClick={() => setOpen(false)}>
          <div style={styles.drop}>
            <div style={styles.left}>
              <DropdownContent stations={stations} addStation={addStation} />
            </div>
            <div style={styles.right}>
              <StationMap stations={stations} />
            </div>
          </div>
        </DetectOutsideClick>
      )}
    </div>
  );
};
