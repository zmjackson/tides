import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { StationMetaData } from "../types/Stations";
import { BasicChart, Floods } from "./DataBlocks";

export type Granularity =
  | "water_level"
  | "hourly_height"
  | "daily_mean"
  | "monthly_mean";

export type Datum =
  | "STND"
  | "MHHW"
  | "MHW"
  | "MTL"
  | "MSL"
  | "MLW"
  | "MLLW"
  | "NAVD";

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
  const [datum, setDatum] = useState<Datum>("STND");

  const onSelectGranularity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGranularity(e.target.value as Granularity);
  };

  const onSelectDatum = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDatum(e.target.value as Datum);
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
        <span>and datum:</span>
        <select value={datum} onChange={onSelectDatum}>
          <option value="STND">STND</option>
          <option value="MHHW">MHHW</option>
          <option value="MHW">MHW</option>
          <option value="MTL">MTL</option>
          <option value="MSL">MSL</option>
          <option value="MLW">MLW</option>
          <option value="MLLW">MLLW</option>
          <option value="NAVD">NAVD</option>
        </select>
      </div>
      <div className="dashboard-row">
        <BasicChart
          station={station}
          start={startDate}
          end={endDate}
          granularity={granularity}
          datum={datum}
        />
        <Floods
          station={station}
          start={startDate}
          end={endDate}
          granularity={granularity}
          datum={datum}
        />
      </div>
    </div>
  );
}
