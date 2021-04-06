import React, { useEffect, useState } from "react";
import { StationMetaData } from "../types/Stations";
import DataBlock, { Granularity } from "./DataBlock";
import { BasicChart } from "./DataBlocks";

type DataViewProps = { station: StationMetaData };

function DataView({ station }: DataViewProps): JSX.Element {
  return (
    <div className="data-view">
      <div className="data-view-header">
        <div>
          <span className="text-primay-dark">{station.name}</span>
          <span className="text-secondary-dark">{station.id}</span>
        </div>
      </div>
      <DataBlock station={station} title={"Basic Info"} />
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
