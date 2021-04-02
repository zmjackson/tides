import React, { useEffect, useState } from "react";
import { StationMetaData } from "../types/Stations";
import DataBlock, { Granularity } from "./DataBlock";
import SiteView from "./SiteView";
import { BasicChart } from "./DataBlocks";

type DataViewProps = { station: StationMetaData };

const contentTest = (
  station: StationMetaData,
  start: Date,
  end: Date,
  granularity: Granularity
): JSX.Element => <SiteView station={station} />;

function DataView({ station }: DataViewProps): JSX.Element {
  return (
    <div className="data-view">
      <div className="data-view-header">
        <div>
          <span className="text-primay-dark">{station.name}</span>
          <span className="text-secondary-dark">{station.id}</span>
        </div>
      </div>
      <DataBlock
        station={station}
        contents={{ title: "Basic Info", render: BasicChart }}
      />
    </div>
  );
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
    <div className="data-views-container">
      {dataViews.map((view) => (
        <DataView station={view} key={view.id} />
      ))}
    </div>
  );
}
