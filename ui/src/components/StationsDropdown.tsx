import React, { useEffect, useRef, useState } from "react";
import { StationMetaData } from "../types/Stations";
import DetectOutsideClick from "../components/DetectOutsideClick";
import StyleSheet from "../types/StyleSheet";

type StationListingProps = { name: string; id: number };

const StationListing = ({ name, id }: StationListingProps): JSX.Element => (
  <li>{name + " " + id}</li>
);

type DropDownProps = { stations: StationMetaData[] };

const DropdownContent = ({ stations }: DropDownProps): JSX.Element => {
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
      <h3>Add Station</h3>
      <br />
      <button>Use Map</button>
      <br />
      <input
        type="text"
        placeholder="Search by name or ID..."
        value={searchTerm}
        onChange={updateSearchTerm}
        ref={searchBoxRef}
      />
      <ul style={styles.stationList}>
        {searchResults.map((station) => (
          <StationListing
            name={station.name}
            id={station.id}
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
  },
  drop: {
    zIndex: 99,
    width: "20em",
    maxHeight: "30em",
    position: "absolute",
    top: "40px",
    backgroundColor: "white",
    border: "1px solid #cfcfcf",
    borderRadius: "8px",
    boxShadow: "0px 3px 10px 0px rgba(0,0,0,0.1)",
  },
  stationList: {
    overflowY: "scroll",
    listStyle: "none",
    maxHeight: "20rem",
  },
};

export const StationsDropdown = ({ stations }: DropDownProps): JSX.Element => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={styles.dropBtn}>
        Add Station
      </button>
      {open && (
        <div style={styles.drop}>
          <DetectOutsideClick onOutsideClick={() => setOpen(false)}>
            <DropdownContent stations={stations} />
          </DetectOutsideClick>
        </div>
      )}
    </div>
  );
};
