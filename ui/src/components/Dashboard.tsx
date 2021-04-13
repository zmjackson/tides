import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { StationMetaData } from "../types/Stations";
import { BasicChart, Floods } from "./DataBlocks";

export type Granularity =
  | "water_level"
  | "hourly_height"
  | "monthly_mean";

export type FloodData = {
  start_date: string;
  end_date: string;
  duration: string;
  average: string;
  flood_levels: string[];
};

export type PredictionData = {
  all_prediction_levels: string[];
  all_prediction_level_dates: string[];
}

export type MeanData = {
  all_MHHW_levels: string[];
  all_MLLW_levels: string[];
  all_MHW_levels: string[];
  all_MLW_levels: string[];
}

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

export type AllPredictionData = {
  data: PredictionData;
}

export type AllMeanData = {
  data: MeanData;
}

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
  const [threshold, setThreshold] = useState<number>(0);
  const [datum, setDatum] = useState<Datum>("STND");
  const [allData, setAllData] = useState<AllData>();
  const [allPredictions, setAllPredictions] = useState<AllPredictionData>();
  const [allMeans, setAllMeanData] = useState<AllMeanData>();

  useEffect(() => {
    fetch(
      // prettier-ignore
      `/getFloodLevelData?floodThreshold=${threshold
                        }&start_date=${startDate.toISOString().replaceAll("-", "").split("T")[0]
                        }&end_date=${endDate.toISOString().replaceAll("-", "").split("T")[0]
                        }&station_id=${station.id
                        }&product=${granularity
                        }&datum=${datum}`
    )
      .then((res) => res.json())
      .then((res) => {
        setAllData(res);
      });

      fetch(
        // prettier-ignore
        `/getPredictions?floodThreshold=${threshold
                          }&start_date=${startDate.toISOString().replaceAll("-", "").split("T")[0]
                          }&end_date=${endDate.toISOString().replaceAll("-", "").split("T")[0]
                          }&station_id=${station.id
                          }&datum=${datum}`
      )
        .then((res) => res.json())
        .then((res) => {
          setAllPredictions(res);
        });

        fetch(
          // prettier-ignore
          `/getMeanData?start_date=${startDate.toISOString().replaceAll("-", "").split("T")[0]
                            }&end_date=${endDate.toISOString().replaceAll("-", "").split("T")[0]
                            }&station_id=${station.id
                            }&product=${granularity
                            }&datum=${datum}`
        )
          .then((res) => res.json())
          .then((res) => {
            setAllMeanData(res);
          });
  }, [station, startDate, endDate, granularity, threshold, datum]);

  const onSelectGranularity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGranularity(e.target.value as Granularity);
  };

  const onSelectDatum = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDatum(e.target.value as Datum);
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
          <option value="monthly_mean">1 month</option>
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
          levels={allData ? allData.metadata.all_water_levels : []}
          labels={allData ? allData.metadata.all_water_level_dates : []}
          prediction_levels={((granularity === "water_level") && allPredictions) ? allPredictions.data.all_prediction_levels : []}
          MHHW_levels={((granularity === "water_level") && allMeans) ? allMeans.data.all_MHHW_levels: []}
          MLLW_levels={((granularity === "water_level") && allMeans) ? allMeans.data.all_MLLW_levels: []}
          MHW_levels={((granularity === "water_level") && allMeans) ? allMeans.data.all_MHW_levels: []}
          MLW_levels={((granularity === "water_level") && allMeans) ? allMeans.data.all_MLW_levels: []}
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
