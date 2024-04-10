/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react'
import style from './Dashboard.module.scss'
import { db } from '../../../../firebase'
import { collection, doc, onSnapshot } from 'firebase/firestore'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import moment from 'moment'

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
import TestingBlock from '../../../../widgets/TestingNoticeBlock/TestingNoticeBlock'
import Loading from '../../../../widgets/Loading/Loading'

// 此頁面正在內部開發中，尚未完工
export default function Dashboard() {
  return (
    <div className={style.view}>
      <TestingBlock
        title="全新數據儀表板即將登場！"
        description="將使用更佳美觀易用的數據介面，提供更全面的可視化數據及數據分析結果。"
      />
      <div className={style.container}>
        <div className={style.header}>
          <p>田野數據科學家的 MicroFarm Pro</p>
        </div>
        <div className={style.dashboardView}>
          <SensorDashboardBlock name="空氣溫度" sensor="temperature" unit="℃" />
          <SensorDashboardBlock name="空氣濕度" sensor="humidity" unit="%" />
          <SensorDashboardBlock
            name="土壤濕度"
            sensor="soilHumidity"
            unit="%"
          />
          <SensorDashboardBlock name="光照度" sensor="light" unit="Lux" />
          <SensorDashboardBlock name="水位高度" sensor="water" unit="" />
        </div>
      </div>
    </div>
  )
}

function SensorDashboardBlock({ name, sensor, unit }) {
  const [latestData, setLatestData] = useState(null)
  const [sensors_actv, setSensors_actv] = useState(null)

  function getCurrentWeekStartDate() {
    // 设置星期一为一周的第一天
    moment.locale('en', {
      week: {
        dow: 1, // Monday is the first day of the week.
      },
    })
    // 获取当前日期所在周的第一天（星期一）
    return moment().startOf('week')
  }

  useEffect(() => {
    // 假设你已经有一个函数来获取当前周的开始日期
    const currentWeekStart = getCurrentWeekStartDate()
    const docName = currentWeekStart.format('YYYYMMDD')
    console.log(docName)
    const sonsorDataRef = doc(db, 'sensors_data', docName)
    const unsubscribe = onSnapshot(
      sonsorDataRef,
      (doc) => {
        if (doc.exists) {
          // 假设你的数据数组是按时间戳排序的
          const data = doc.data().data
          const latest = data[data.length - 1] // 获取最新的一条数据
          setLatestData(latest)
          console.log(latest)
        } else {
          // 处理文档不存在的情况
          setLatestData(null)
        }
      },
      (error) => {
        // 处理监听错误
        console.error('Failed to subscribe to sensor data:', error)
      }
    )

    // 组件卸载时取消订阅
    return () => unsubscribe()
  }, [name]) // 如果name变化，重新订阅

  // 檢測感測器在線狀態
  const checkSensorStatus = (timestamp) => {
    // 获取当前时间
    const now = new Date().getTime()
    // 将Firestore时间戳转换为毫秒
    const sensorTimestamp =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6
    // 检查时间差
    return now - sensorTimestamp > 360000
  }
  useEffect(() => {
    if (latestData && checkSensorStatus(latestData.timestamp)) {
      setSensors_actv(false)
    } else {
      setSensors_actv(true)
    }

    const intervalId = setInterval(() => {
      if (latestData && checkSensorStatus(latestData.timestamp)) {
        setSensors_actv(false)
      } else {
        setSensors_actv(true)
      }
    }, 6000)

    return () => {
      clearInterval(intervalId) // 清除定时器
    }
  }, [latestData])

  // 將timestamp時間格式化
  function formatTimestamp(seconds) {
    const date = new Date(seconds * 1000)
    return date.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
  }

  return (
    <div className={style.dashboardBlock}>
      <div className={style.header}>
        <span className={style.status}>{sensors_actv ? '即時' : '離線'}</span>
        <p className={style.name}>{name}</p>
      </div>
      <div className={style.dashboardData}>
        {latestData ? (
          <p className={style.data}>
            {latestData[sensor]}
            {unit}
          </p>
        ) : (
          <Loading loadingAniActv={true} type="local" />
        )}

        <p className={style.time}>
          {latestData
            ? `${formatTimestamp(latestData.timestamp.seconds)}`
            : 'Loading...'}
        </p>
      </div>
    </div>
  )
}
