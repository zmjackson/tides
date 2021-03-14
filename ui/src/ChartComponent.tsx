import React from 'react'
import { Line } from 'react-chartjs-2'
// import Chart from 'chart.js'
// import  ChartAnnotation from 'chartjs-plugin-annotation';

// Chart.plugins.register([ChartAnnotation]); // Global


interface chartData {
   data: number[]
   labels: string[]
   level?: number[]
 }

export default function ChartComponent(props: chartData) {
   const data = {
      labels: props.labels,
      datasets: [
         {
            label: 'Water Level Data',
            data: props.data,
            borderColor: ['rgba(32, 143, 217, 0.2)'],
            backgroundColor: ['rgba(32, 143, 217, 0.2)'],
            pointBackgroundColor: ['rgba(243, 241, 149, 0.2)'],
            pointBorderColor: ['rgba(243, 241, 149, 0.2)'],
         },
         {
            data: props.level
            // borderColor: []
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