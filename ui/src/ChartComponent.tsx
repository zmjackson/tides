import React from 'react'
import { Line } from 'react-chartjs-2'
// import Chart from 'chart.js'
// import  ChartAnnotation from 'chartjs-plugin-annotation';

// Chart.plugins.register([ChartAnnotation]); // Global

const sixMinsToHours = 10;
const sixMinsToDay = sixMinsToHours * 24;
const sixMinsToWeek = sixMinsToDay * 7; //(60mins/hour*24hours/day*7day/week)/(6mins)/week
const sixMinsToMonth = sixMinsToDay * 31;
interface chartMetaData {
   data: number[]
   labels: string[]
   resolution: string
   normalorAverage: string
   threshold?: number
 }

   function setChartData(
      unitConversion: number, 
      chartData: number[], 
      data: number[], 
      chartLabels: string[], 
      labels: string[]) {
      let j = 0;
      for(let i = 0; i < data.length; i = i + unitConversion){
         chartData[j] = data[i]; 
         chartLabels[j] = labels[i];
         j++;
      }
   }

   function setChartDataForWeekNormal(
      chartData: number[],
      data: number[],
      chartLabels: string[],
      labels: string[]) {
      let j = 0;
      for(let i = 0; i < data.length; i = i + sixMinsToWeek) {
            chartData[j] = data[i];
            chartLabels[j] = labels[i];
            j++;
         if(data.length - i <= sixMinsToWeek && data.length - i !== sixMinsToDay && data.length > sixMinsToWeek) {
            i  = data.length - sixMinsToDay;
            chartData[j] = data[i];
            chartLabels[j] = labels[i];
            i = data.length;
            j++;
         }
      }
   }

   function setChartDataForMonthNormal(
      chartData: number[],
      data: number[],
      chartLabels: string[],
      labels: string[]) {
         let j = 0;
         for(let i = 0; i < data.length;) {
            chartData[j] = data[i];
            chartLabels[j] = labels[i];
            j++;
            if(data.length - i <= sixMinsToMonth && data.length - i !== sixMinsToDay && data.length > sixMinsToMonth) {
               i  = data.length - sixMinsToDay;
               chartData[j] = data[i - sixMinsToDay];
               chartLabels[j] = labels[i - sixMinsToDay];
               i = data.length;
               j++;
            }
            
            if(labels[i] !== undefined) {
               console.log(i);
               console.log(labels[i]);
               console.log(labels[i].split('-')[1]);
               if(labels[i].split('-')[1] === '02') {
                  i = i + sixMinsToMonth - 2 * sixMinsToDay;
               }
               else if(labels[i].split('-')[1] === '01' || 
                        labels[i].split('-')[1] === '03' || 
                        labels[i].split('-')[1] === '05' || 
                        labels[i].split('-')[1] === '07' || 
                        labels[i].split('-')[1] === '08' || 
                        labels[i].split('-')[1] === '10' ||
                        labels[i].split('-')[1] === '12') {
                           i = i + sixMinsToMonth;
               }
               else {
                  i = i + sixMinsToMonth - sixMinsToDay;
               }
            }
            //    else {
                  // console.log(i)
                  // console.log(sixMinsToMonth);
                  // console.log(i/sixMinsToMonth);
                  // if(i/sixMinsToMonth % 2 === 0 && i/sixMinsToMonth !== 0) {
                  //    console.log('help')
                  //    i = i + sixMinsToMonth - 1;
                  // }
                  // else {
                     // i = i + sixMinsToMonth;
                  // }
            //    }
            // }
         }
      }

   function setChartDataForWeekAverage(
      chartData: number[],
      data: number[]) {
      let sum: number = 0;
      let average: number = 0;
      let j = 0;
      let count = 0;
      let numOfDays = data.length/sixMinsToDay;
      for(let i = 0; i < data.length; i++) {
         count++;
         sum = sum + +data[i];
         //if the loop has reached one week worth of data
         if(i % sixMinsToWeek === 0 && i !== 0) {
            average = sum/count;
            chartData[j] = +average.toFixed(3);
            sum = 0;
            count = 0;
            average = 0;
            j++;
            numOfDays -= 7;
         }
         //if we have equal to or less than a weeks worth of data
         else if(numOfDays <= 7) {
            //get average of what is left
            while(i < data.length - 1) {
               i++;
               sum = sum + +data[i];
               count++;
            }
            average = sum/count;
            chartData[j] = +average.toFixed(3);
            break;
         }
      }  
   }

   function setAverage(
      unitConversion: number,
      chartData: number[],
      data: number[],
      chartLabels: string[],
      labels: string[]) {
      let average: number = 0;
      let sum: number = 0;
      let j = 0;
      for(let i = 0; i < data.length; ) {
         let k = 0;
         for(; k < unitConversion; k++){
            sum = sum + +data[k + i];
         }
         i = i + k;
         average = sum/k;
         chartData[j] = +average.toFixed(3);
         if(chartLabels[j] !== undefined) {
            chartLabels[j] = chartLabels[j].split(" ")[0];
         }
         sum = 0;
         average = 0;
         j++;
      }
   }

   function setLabelsForWeekAverage(
   chartLabels: string[],
   labels: string[],
   numberOfDays: number) {
      let j = 0;
      let newStartDate: string = '';
      
      for(let i = sixMinsToWeek; i < numberOfDays*sixMinsToDay; i += sixMinsToWeek) {
         if(labels[i - sixMinsToWeek] !== undefined && labels[i - 1] !== undefined && labels[i] !== undefined) {
            chartLabels[j] = labels[i - sixMinsToWeek].split(" ")[0] + '--' + labels[i - 1].split(" ")[0];
            newStartDate = labels[i].split(" ")[0];
            j++;
         }
      }
      if(labels[j - 1] !== undefined && labels[labels.length - 1] !== undefined) {
         chartLabels[j] = newStartDate + '--' + labels[labels.length - 1].split(" ")[0];
      }
      if(numberOfDays*sixMinsToDay <= sixMinsToWeek && labels[0] !== undefined && labels[labels.length - 1] !== undefined) {
         chartLabels[j] = labels[0].split(" ")[0] + '--' + labels[labels.length - 1].split(" ")[0];
      }
   }


export default function ChartComponent(props: chartMetaData) {
   let chartData: number[] = [];
   let chartLabels: string[] = [];
   let unitConversion: number = 0;

   if(props.resolution === '6 mins') {
      chartData = props.data.slice(0);
      chartLabels = props.labels.slice(0);
   }
   else if(props.resolution === '1 hour') {
      unitConversion = sixMinsToHours;
      setChartData(unitConversion, chartData, props.data, chartLabels, props.labels);
   }
   else if(props.resolution === '1 day') {
      unitConversion = sixMinsToDay;
      setChartData(unitConversion, chartData, props.data, chartLabels, props.labels);
   }
   else if(props.resolution === '1 week' && props.normalorAverage === 'Normal') {
      setChartDataForWeekNormal(chartData, props.data, chartLabels, props.labels);
   }
   else if(props.resolution === '1 week' && props.normalorAverage === 'Average') {
      setChartDataForWeekAverage(chartData, props.data);
      setLabelsForWeekAverage(chartLabels, props.labels, props.data.length/sixMinsToDay);
   }
   else if(props.resolution === '1 month' && props.normalorAverage === 'Normal') {
      setChartDataForMonthNormal(chartData, props.data, chartLabels, props.labels);
   }
   if(props.normalorAverage === 'Average' && (props.resolution === '1 day' || props.resolution === '1 hour')) {
      setAverage(unitConversion, chartData, props.data, chartLabels, props.labels);
   }

   const data = {
      labels: chartLabels,
      datasets: [
         {
            label: 'Water Level Data',
            data: chartData,
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
      },
      elements: { point: { radius: 0, hitRadius: 10, hoverRadius: 5 } } 
    }
   return (
     <Line data={data} options = {options}/>
   )
}