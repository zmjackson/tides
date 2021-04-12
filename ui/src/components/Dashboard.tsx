import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { StationMetaData } from "../types/Stations";
import { BasicChart, Floods } from "./DataBlocks";

export type Granularity =
  | "water_level"
  | "hourly_height"
  | "daily_mean"
  | "monthly_mean";

const yesterday = (): Date => {
  const today = new Date();
  const y = new Date();
  y.setDate(today.getDate() - 1);
  return y;
};

type DashboardProps = { station: StationMetaData };

export default function Dashboard({ station }: DashboardProps): JSX.Element {
  const [startDate, setStartDate] = useState<Date>(yesterday());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [granularity, setGranularity] = useState<Granularity>("water_level");

  const onSelectGranularity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGranularity(e.target.value as Granularity);
  };

  return (
    <div className="data-block-header">
      <div>
        <h1>{station.name}</h1>
      </div>
      <div className="data-block-options">
        <span>From</span>
        <DatePicker
          selected={startDate}
          onChange={(date: Date) => setStartDate(date)}
        />
        <span>to</span>
        <DatePicker
          selected={endDate}
          onChange={(date: Date) => setEndDate(date)}
        />
        <span>with granularity:</span>
        <select value={granularity} onChange={onSelectGranularity}>
          <option value="water_level">6 mins</option>
          <option value="hourly_height">1 hour</option>
          <option value="daily_mean">1 day</option>
          <option value="monthly_mean">1 week</option>
        </select>
      </div>
      <div className="dashboard-row">
        <BasicChart
          station={station}
          start={startDate}
          end={endDate}
          granularity={granularity}
        />
        <Floods
          station={station}
          start={startDate}
          end={endDate}
          granularity={granularity}
        />
      </div>
    </div>
  );
}
