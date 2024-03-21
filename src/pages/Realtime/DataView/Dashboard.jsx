/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react'
import style from './style.module.scss'
import { db } from '../../../firebase'
import { doc, onSnapshot } from 'firebase/firestore'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {
  BarChart,
  Bar,
  Rectangle,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  Tooltip,
  Brush,
  Scatter,
  Label,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'

// 此頁面正在內部開發中，尚未完工
export default function Dashboard() {
  return (
    <div className={style.view}>
      <div className={style.container}>
        <div className={style.header}>
          <p>田野數據科學家的 MicroFarm</p>
        </div>
        <div className={style.dashboardView}>
          <SensorDashboardBlock name="空氣溫度" />
          <SensorDashboardBlock name="空氣濕度" />
          <SensorDashboardBlock name="土壤濕度" />
          <SensorDashboardBlock name="光照度" />
          <SensorDashboardBlock name="水位高度" />
        </div>
      </div>
    </div>
  )
}

function SensorDashboardBlock({ name, data, type }) {
  return (
    <div className={style.dashboardBlock}>
      <div className={style.header}>
        <p className={style.name}>{name}</p>
      </div>
    </div>
  )
}
