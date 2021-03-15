import React from 'react'
import { Line } from 'react-chartjs-2'
// import Chart from 'chart.js'
// import  ChartAnnotation from 'chartjs-plugin-annotation';

// Chart.plugins.register([ChartAnnotation]); // Global

const sixMinsToHours = 10;
const sixMinsToDay = 240;
interface chartMetaData {
   chartData: number[]
   labels: string[]
   resolution?: string
   normalorAverage?: string
   level?: number[]
 }

export default function ChartComponent(props: chartMetaData) {
   let chartDataTemp: number[] = [];
   let tempLabels = [];
   let unitConversion: number = 0;

   if(props.resolution === '6 mins') {
      //default
      chartDataTemp = props.chartData.slice(0);
      tempLabels = props.labels.slice(0);
   }
   else if(props.resolution === '1 hour') {
      unitConversion = sixMinsToHours;
      let j = 0;
      for(let i = 0; i < props.chartData.length; i = i + unitConversion){
         chartDataTemp[j] = props.chartData[i]; 
         tempLabels[j] = props.labels[i];
         j++;
      }
      // props.chartData = chartDataTemp.slice(0);
   }
   else if(props.resolution === '1 day') {
      unitConversion = sixMinsToDay;
      let j = 0;
      // alert(props.chartData.length);
      for(let i = 0; i < props.chartData.length; i = i + unitConversion){
         chartDataTemp[j] = props.chartData[i]; 
         tempLabels[j] = props.labels[i];
         j++;
      }
      // props.chartData = chartDataTemp.slice(0);
   }

   if(props.normalorAverage === 'Normal') {
      
   }
   else if(props.normalorAverage === 'Average') {
      // alert(unitConversion);
      let average: number = 0;
      let sum: number = 0;
      let j = 0;
      for(let i = 0; i < props.chartData.length; ) {
         let k = 0;
         for(; k < unitConversion; k++){
            sum = sum + +props.chartData[k + i];
         }
         i = i + k;
         average = sum/unitConversion;
         chartDataTemp[j] = average;
         tempLabels[j] = tempLabels[j].split(" ")[0];
         sum = 0;
         average = 0;
         j++;
      }
   }


   const data = {
      labels: tempLabels,
      datasets: [
         {
            label: 'Water Level Data',
            data: chartDataTemp,
            borderColor: ['rgba(32, 143, 217, 0.2)'],
            backgroundColor: ['rgba(32, 143, 217, 0.2)'],
            pointBackgroundColor: ['rgba(243, 241, 149, 0.2)'],
            pointBorderColor: ['rgba(243, 241, 149, 0.2)'],
         }
      ]
   }
   const options = {
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Water Level (ft)'
          }
        }],
        xAxes: [{
           scaleLabel: {
              display: true,
              labelString: 'date'
           }
        }]
      }     
    }
    const annotation = {
      annotations: [{
         type: 'line',
         mode: 'horizontal',
         scaleID: 'y-axis-0',
         value: 5,
         borderColor: 'rgb(75, 192, 192)',
         borderWidth: 4,
         label: {
           enabled: false,
           content: 'Test label'
         }
       }]
    }
   
   return (
     <Line data={data} options = {options}/>
   )
}