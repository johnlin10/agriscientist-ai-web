import css from './css/TimeLine.module.css'
// import { Bar } from '@ant-design/plots'
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
// import { Doughnut } from 'react-chartjs-2'
// import Chart from 'react-chartjs-2'

export default function TimeLine(props) {
  // 定義數據
  const data = [
    {
      x: '2023-07-20',
      y: [100, 200, 300],
    },
    {
      x: '2023-07-21',
      y: [200, 300, 400],
    },
    {
      x: '2023-07-22',
      y: [300, 400, 500],
    },
    {
      x: '2023-07-23',
      y: [400, 500, 600],
    },
    {
      x: '2023-07-24',
      y: [500, 600, 700],
    },
  ]

  // 定義圖表選項
  const options = {
    title: {
      display: true,
      text: '每日訪問量',
    },
    xAxis: {
      type: 'date',
    },
    yAxis: {
      title: {
        text: '訪問量',
      },
    },
  }
  return (
    <div className={css.timeLine_view}>
      {/* <Chart type="bar" data={data} options={options} /> */}
    </div>
  )
}
