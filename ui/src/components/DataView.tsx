import React, { useEffect, useState } from "react";
import { StationMetaData } from "../types/Stations";
import RLDD from "react-list-drag-and-drop/lib/RLDD";
import SiteView from "./SiteView";
import StyleSheet from "../types/StyleSheet";

type DataViewProps = { station: StationMetaData };

function DataView({ station }: DataViewProps): JSX.Element {
  return (
    <div style={styles.dataViewContainer}>
      <div style={styles.dataViewHeader}>
        <div>
          <span style={{ marginRight: "1em" }}>
            <b>{station.name}</b>
          </span>
          <span style={{ color: "gray" }}>{station.id}</span>
        </div>
      </div>
      <SiteView station={station} />
    </div>
  );
}

function RenderDataView(item: StationMetaData): JSX.Element {
  return <DataView station={item} />;
}

type DataViewsContainerProps = { currentStations: StationMetaData[] };

export default function DataViewsContainer({
  currentStations,
}: DataViewsContainerProps): JSX.Element {
  const [dataViews, setDataViews] = useState<StationMetaData[]>([]);

  useEffect(() => {
    setDataViews(currentStations);
  }, [currentStations]);

  return (
    <div>
      <RLDD
        items={dataViews}
        itemRenderer={RenderDataView}
        layout="horizontal"
        onChange={(reordered) => setDataViews(reordered as StationMetaData[])}
      />
    </div>
  );
}

const styles: StyleSheet = {
  dataViewContainer: {
    border: "1px solid lightblue",
    borderRadius: "10px",
    height: "100%",
    margin: "1em",
  },

  stationsContainer: {
    display: "flex",
    justifyContent: "space-evenly",
  },

  dataViewHeader: {
    backgroundColor: "lightblue",
    borderRadius: "10px 10px 0px 0px",
    borderBottom: "1px solid lightblue",
    padding: "1em",
  },
};
