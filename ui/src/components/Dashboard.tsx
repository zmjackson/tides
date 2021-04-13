import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { StationMetaData } from "../types/Stations";
import { BasicChart, Floods } from "./DataBlocks";

export type Granularity =
  | "water_level"
  | "hourly_height"
  | "daily_mean"
  | "monthly_mean";

export type FloodData = {
  start_date: string;
  end_date: string;
  duration: string;
  average: string;
  flood_levels: string[];
};

export type FloodMetadata = {
  num_of_floods: number;
  overall_average: string;
  all_water_levels: string[];
  all_water_level_dates: string[];
  missing_water_level_dates: string[];
};

export type AllData = {
  data: FloodData[];
  metadata: FloodMetadata;
};

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
  const [threshold, setThreshold] = useState<number>(0);
  const [allData, setAllData] = useState<AllData>();

  useEffect(() => {
    fetch(
      // prettier-ignore
      `/getFloodLevelData?floodThreshold=${threshold
                        }&start_date=${startDate.toISOString().replaceAll("-", "").split("T")[0]
                        }&end_date=${endDate.toISOString().replaceAll("-", "").split("T")[0]
                        }&station_id=${station.id
                        }&product=${granularity}`
    )
      .then((res) => res.json())
      .then((res) => {
        setAllData(res);
      });
  }, [startDate, endDate, granularity, threshold]);

  const onSelectGranularity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGranularity(e.target.value as Granularity);
  };

  return (
    <div>
      <div className="dashboard-header">
        <span className="station-name">{station.name}</span>
        <span className="station-id">{station.id}</span>
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
          data={allData ? allData.data : []}
          threshold={threshold}
          onSetThreshold={(threshold) => setThreshold(threshold)}
        />
      </div>
    </div>
  );
}
