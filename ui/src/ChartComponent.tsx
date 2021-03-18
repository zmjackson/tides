import React from 'react'
import { Line } from 'react-chartjs-2'
// import Chart from 'chart.js'
// import  ChartAnnotation from 'chartjs-plugin-annotation';

// Chart.plugins.register([ChartAnnotation]); // Global

const sixMinsToHours = 10;
const sixMinsToDay = 240;
const sixMinsToWeek = 1680; //(60mins/hour*24hours/day*7day/week)/(6mins)/week
interface chartMetaData {
   chartData: number[]
   labels: string[]
   resolution?: string
   normalorAverage?: string
   threshold?: number
 }

export default function ChartComponent(props: chartMetaData) {
   let chartDataTemp: number[] = [];
   let tempLabels: string[] = [];
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
   }
   else if(props.resolution === '1 day') {
      unitConversion = sixMinsToDay;
      let j = 0;
      for(let i = 0; i < props.chartData.length; i = i + unitConversion){
         chartDataTemp[j] = props.chartData[i]; 
         tempLabels[j] = props.labels[i];
         j++;
      }
   }
   else if(props.resolution === '1 week' && props.normalorAverage === 'Normal') {
      unitConversion = sixMinsToWeek;
      let j = 0;
      for(let i = 0; i < props.chartData.length; i = i + unitConversion) {
            // console.log(props.labels.length);
            // console.log(i);
            chartDataTemp[j] = props.chartData[i];
            tempLabels[j] = props.labels[i];
            j++;
         if(props.chartData.length - i <= unitConversion && props.chartData.length - i !== sixMinsToDay && props.chartData.length > sixMinsToWeek) {
            i  = props.chartData.length - sixMinsToDay;
            chartDataTemp[j] = props.chartData[i];
            tempLabels[j] = props.labels[i];
            i = props.chartData.length;
            j++;
         }
      }
   }
   else if(props.resolution === '1 week' && props.normalorAverage === 'Average') {
      unitConversion = sixMinsToWeek;
      let sum: number = 0;
      let average: number = 0;
      let j = 0;
      let count = 0;
      let newStartDate: string = '';
      let numOfDays = props.chartData.length/sixMinsToDay;
      console.log(numOfDays);
      for(let i = 0; i < props.chartData.length; i++) {
         count++;
         sum = sum + +props.chartData[i];
         if(i % unitConversion === 0 && i !== 0) {
            console.log("mod");
            console.log(props.chartData.length);
            console.log(i);
            average = sum/count;
            chartDataTemp[j] = +average.toFixed(3);
            sum = 0;
            count = 0;
            average = 0;
            if(props.labels[i - sixMinsToWeek] !== undefined && props.labels[i - 1] !== undefined && props.labels[i]) {
               tempLabels[j] = props.labels[i - sixMinsToWeek].split(" ")[0] + '--' + props.labels[i - 1].split(" ")[0];
               newStartDate = props.labels[i].split(" ")[0];
            }
            j++;
            numOfDays -= 7;
         }
         else if(numOfDays <= 7) {
            console.log("else");
            console.log(props.chartData.length);
            console.log(i);
            while(i < props.chartData.length - 1) {
               i++;
               sum = sum + +props.chartData[i];
               count++;
            }
            average = sum/count;
            console.log(+average.toFixed(3));
            chartDataTemp[j] = +average.toFixed(3);
            sum = 0;
            count = 0;
            average = 0;
            if(tempLabels[j-1] !== undefined && props.labels[i - 1] !== undefined) {
               tempLabels[j] = newStartDate + '--' + props.labels[i - 1].split(" ")[0];
            }
            console.log(i);
            console.log(props.labels[0]);
            console.log(props.labels[i - 1]);
            if(props.chartData.length <= sixMinsToWeek && props.labels[0] !== undefined && props.labels[i - 1] !== undefined) {
               tempLabels[j] = props.labels[0].split(" ")[0] + '---' + props.labels[i - 1].split(" ")[0];
            }
            i = props.chartData.length;
            j++;
         }
      }
      
   }

   if(props.normalorAverage === 'Normal' || props.resolution === '6 mins') {

   }
   else if(props.normalorAverage === 'Average' && props.resolution !== '6 mins' && props.resolution !== '1 week') {
      let average: number = 0;
      let sum: number = 0;
      let j = 0;
      for(let i = 0; i < props.chartData.length; ) {
         let k = 0;
         for(; (k < unitConversion && (k+i) < props.chartData.length); k++){
            sum = sum + +props.chartData[k + i];
         }
         i = i + k;
         average = sum/k;
         chartDataTemp[j] = +average.toFixed(3);
         if(tempLabels[j] !== undefined) {
            tempLabels[j] = tempLabels[j].split(" ")[0];
         }
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
   //  const annotation = {
   //    annotations: [{
   //       type: 'line',
   //       mode: 'horizontal',
   //       scaleID: 'y-axis-0',
   //       value: 5,
   //       borderColor: 'rgb(75, 192, 192)',
   //       borderWidth: 4,
   //       label: {
   //         enabled: false,
   //         content: 'Test label'
   //       }
   //     }]
   //  }
   
   return (
     <Line data={data} options = {options}/>
   )
}