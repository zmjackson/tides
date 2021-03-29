import React, { useState } from "react";
import ChartComponent from "./Chart";
import { StationMetaData } from "../types/Stations";

type SiteViewProps = { station: StationMetaData };

export default function SiteView({ station }: SiteViewProps): JSX.Element {
  const [startDate, setStartDate] = useState("2021-01-01");
  const [endDate, setEndDate] = useState("2021-01-02");
  const [floodThreshold, setFloodThreshold] = useState("0");
  const [numFloods, setNumFloods] = useState(0);
  const [overallAverage, setOverallAverage] = useState(0);
  const [allWaterLevels, setAllWaterLevels] = useState([]);
  const [allWaterLevelDates, setAllWaterLevelDates] = useState([]);
  const [chartResolution, setChartResolution] = useState("6 mins");
  const [normalorAverage, setNormalorAverage] = useState("Normal");
  //const [floodList, setFloodList] = React.useState([{"start_date": " ", "end_date": " ", "duration": " ", "average": " "}]);
  const [displayRows, setdisplayRows] = useState([
    { start: "", end: "", duration: "", average: "" },
  ]);
  let rows = [{ start: "", end: "", duration: "", average: "" }];
  let floodList = [
    { start_date: " ", end_date: " ", duration: " ", average: " " },
  ];

  function handleSubmit() {
    console.log(startDate);
    console.log(endDate);
    console.log(parseFloat(floodThreshold));
    console.log(station.id);

    const startString = startDate.replace("-", "").replace("-", "");
    console.log(startString);

    fetch(
      "/getFloodLevelData/" +
        floodThreshold +
        "/" +
        station.id +
        "/" +
        startDate.replace("-", "").replace("-", "") +
        "/" +
        endDate.replace("-", "").replace("-", "")
    )
      .then((res) => res.json())
      .then((res) => {
        setNumFloods(res.metadata.num_of_floods);
        setOverallAverage(res.metadata.overallAverage);
        setAllWaterLevels(res.metadata.all_water_levels);
        setAllWaterLevelDates(res.metadata.all_water_level_dates);
        floodList = res.data;
      })
      .then((res) => {
        rows = [];
        for (let i = 0; i < floodList.length; i++) {
          rows.push({
            start: floodList[i].start_date,
            end: floodList[i].end_date,
            duration: floodList[i].duration,
            average: floodList[i].average,
          });
        }
        setdisplayRows([]);
        setdisplayRows(rows);
        console.log(displayRows);
      });
  }

  return (
    <div>
      <div className="linechart">
        <ChartComponent
          data={allWaterLevels}
          labels={allWaterLevelDates}
          resolution={chartResolution}
          normalorAverage={normalorAverage}
        />
      </div>
    </div>
  );
}
