import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SiteView from "./SiteView";
import { StationMetaData } from "../types/Stations";

type DataBlockProps = { title: string; station: StationMetaData };

export function DataBlock({ title, station }: DataBlockProps): JSX.Element {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  return (
    <div className="data-block">
      <div className="data-block-header">
        <div>
          <span className="text-primary-dark">{title}</span>
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
          <select name="granularity" id="granularity">
            <option value="6 mins">6 mins</option>
            <option value="1 hour">1 hour</option>
            <option value="1 day">1 day</option>
            <option value="1 week">1 week</option>
          </select>
        </div>
      </div>
      <div className="data-block-body">
        <SiteView station={station} />
      </div>
    </div>
  );
}
