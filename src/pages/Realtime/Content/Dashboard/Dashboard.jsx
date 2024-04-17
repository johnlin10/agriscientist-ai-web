/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react'
import style from './Dashboard.module.scss'
import { db } from '../../../../firebase'
import useCollectionAllDocData from '../../../../script/useCollectionAllDocData'
import { collection, doc, onSnapshot, query } from 'firebase/firestore'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleChevronLeft,
  faCircleChevronRight,
  faAnglesRight,
} from '@fortawesome/free-solid-svg-icons'
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
import PageHeader from '../../../../widgets/PageHeader/PageHeader'

// 此頁面正在內部開發中，尚未完工
export default function Dashboard() {
  // 感測器資訊
  const sensors = [
    {
      name: '空氣溫度',
      type: 'temperature',
      unit: '℃',
    },
    {
      name: '空氣濕度',
      type: 'humidity',
      unit: '%',
    },
    {
      name: '土壤濕度',
      type: 'soilHumidity',
      unit: '%',
    },
    {
      name: '光照度',
      type: 'light',
      unit: 'Lux',
    },
    {
      name: '水位高度',
      type: 'water',
      unit: '',
    },
  ]

  // 感測器原始資料
  const [sensorsData, setSensorsData] = useState(null)
  const [currentWeekSensorsData, setCurrentWeekSensorData] = useState(null)

  // 感測器當前分組資料
  const [sensorGroupData, setSensorGroupData] = useState(null)
  const [dataIndexes, setDataIndexes] = useState([]) // 選擇數據單位段落 - 用於尋找段落
  const [selectDataIndex, setSelectDataIndex] = useState(0)
  const [dataUnit, setDataUnit] = useState('hour') // 選擇數據單位 - hour/day/week/month

  // 圖表數據是否已初始化（初始化後，讓數據分組圖表不因數據更新而返回顯示最新數據）
  const [isIndexesInitialized, setIsIndexesInitialized] = useState(false)

  // *=== 數據獲取及處理 ===============================================================
  /**
   * 獲取當週的第一天（星期一）
   * @returns {Date} YYYYMMDD
   */
  function getCurrentWeekStartDate() {
    moment.locale('en', {
      week: {
        dow: 1,
      },
    })
    return moment().startOf('week')
  }

  // GET Current Week Sensors Data -
  useEffect(() => {
    // 獲取當週第一天為欲查詢的 Document 名稱
    const currentWeekStart = getCurrentWeekStartDate()
    const docName = currentWeekStart.format('YYYYMMDD')

    // 獲取當週的 Document，並取得最新數據
    const sonsorDataRef = doc(db, 'sensors_data', docName)
    const unsubscribe = onSnapshot(
      sonsorDataRef,
      (doc) => {
        if (doc && doc.exists()) {
          console.log('Document data:', doc.data())
          const rawData = doc.data().data
          // 將數值字串轉換為浮點數
          const formattedData = rawData.map((item) => ({
            ...item,
            soilHumidity: parseFloat(item.soilHumidity).toFixed(1),
            temperature: parseFloat(item.temperature).toFixed(1),
            humidity: parseFloat(item.humidity).toFixed(1),
            light: parseInt(item.light, 10),
            water: parseInt(item.water, 10),
          }))
          setCurrentWeekSensorData(formattedData)
        } else {
          setCurrentWeekSensorData(null)
        }
      },
      (error) => {
        console.error('Failed to subscribe to sensor data:', error)
      }
    )

    return () => unsubscribe()
  }, [])

  /**
   * 根據日期取得週數
   * @param {date} date
   * @returns {string} - 週數
   */
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getUTCFullYear(), 0, 1)
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  /**
   * 將數據進行指定時間單位的分組
   * @param {Array} data - 感測器完整數據
   * @param {string} type - 欲分類的數據單位 hour/day/week/month
   * @returns {Array} - 根據單位分組後的數據
   */
  const groupData = (sensorData, type) => {
    switch (type) {
      case 'hour':
        const groupedByHour = sensorData.reduce((acc, data) => {
          const timestamp =
            data.timestamp.seconds * 1000 + data.timestamp.nanoseconds / 1e6
          const timestampWithOffset = timestamp + 8 * 60 * 60 * 1000
          const date = new Date(timestampWithOffset)
          const formattedDate = date
            .toISOString()
            .slice(0, 13)
            .replace(/-|T|:/g, '') // YYYYMMDDHH format

          if (!acc[formattedDate]) {
            acc[formattedDate] = []
          }
          acc[formattedDate].push(data)
          return acc
        }, {})
        return groupedByHour

      case 'day':
        const groupedByDay = sensorData.reduce((acc, data) => {
          const timestamp =
            data.timestamp.seconds * 1000 + data.timestamp.nanoseconds / 1e6
          const timestampWithOffset = timestamp + 8 * 60 * 60 * 1000
          const date = new Date(timestampWithOffset)
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, '')

          if (!acc[date]) {
            acc[date] = []
          }
          acc[date].push(data)
          return acc
        }, {})
        return groupedByDay

      case 'week':
        const groupedByWeek = sensorData.reduce((acc, data) => {
          const timestamp =
            data.timestamp.seconds * 1000 + data.timestamp.nanoseconds / 1e6
          const date = new Date(timestamp)
          const weekNumber = getWeekNumber(date)
          const year = date.getUTCFullYear()
          const yearWeek = `${year}${weekNumber.toString().padStart(2, '0')}` // Combine year and week

          if (!acc[yearWeek]) {
            acc[yearWeek] = []
          }
          acc[yearWeek].push(data)
          return acc
        }, {})
        return groupedByWeek

      case 'month':
        const groupedByMonth = sensorData.reduce((acc, data) => {
          const timestamp =
            data.timestamp.seconds * 1000 + data.timestamp.nanoseconds / 1e6
          const date = new Date(timestamp)
          const year = date.getUTCFullYear()
          const month = (date.getUTCMonth() + 1).toString().padStart(2, '0') // Month from 01 to 12

          const key = `${year}${month}`
          if (!acc[key]) {
            acc[key] = []
          }
          acc[key].push(data)
          return acc
        }, {})
        return groupedByMonth

      case 'record':
        const groupedByRecord = sensorData.reduce((acc, data) => {
          if (!acc[0]) {
            acc[0] = []
          }
          acc[0].push(data)
          return acc
        }, {})
        console.log(groupedByRecord)
        return groupedByRecord

      default:
        break
    }
  }

  /**
   * 對分組的數據進行採樣
   * @param {Array} groupedData - 分組後的數據
   * @param {number} sampleSize - 採樣大小
   * @returns {Array} - 採樣後的數據數組
   */
  const sampleGroupedData = (groupedData, sampleSize) => {
    // 採樣後的數據
    const sampledData = []

    // 循環每組數據
    Object.keys(groupedData).forEach((group) => {
      let groupSample = []
      let tempSum = 0
      let lightSum = 0
      let humiditySum = 0
      let soilHumiditySum = 0
      let waterSum = 0
      let count = 0

      groupedData[group].forEach((data, index) => {
        // 累計求和
        tempSum += parseFloat(data.temperature)
        lightSum += parseInt(data.light, 10)
        humiditySum += parseFloat(data.humidity)
        soilHumiditySum += parseFloat(data.soilHumidity)
        waterSum += parseInt(data.water, 10)
        count++

        // 當達到樣本大小時，計算平均值，並重置計數器和總和
        if (
          (index + 1) % sampleSize === 0 ||
          index === groupedData[group].length - 1
        ) {
          groupSample.push({
            temperature: parseFloat((tempSum / count).toFixed(1)),
            light: Math.round(lightSum / count),
            humidity: parseFloat((humiditySum / count).toFixed(1)),
            soilHumidity: parseFloat((soilHumiditySum / count).toFixed(1)),
            water: Math.round(waterSum / count),
            timestamp: groupedData[group][index].timestamp, // 使用最後一個數據點的時間戳
          })
          // 重置
          tempSum = 0
          lightSum = 0
          humiditySum = 0
          soilHumiditySum = 0
          waterSum = 0
          count = 0
        }
      })

      // 講採樣後的數據添加到結果數組
      sampledData[group] = groupSample
    })

    console.log('Sampled Data:', sampledData)
    return sampledData
  }

  /**
   * 編列單位分組數據的索引
   * @param {Array} groupedData - 根據單位分組完的數據
   * @param {string} type - 數據分組的單位 hour/day/week/month
   * @returns {Array} - 根據單位分組的數據索引
   */
  const getAvailableDates = (groupedData, type) => {
    switch (type) {
      case 'hour':
        // Extract all available hours from groupedData
        return Object.keys(groupedData).map((hour) => hour.toString())

      case 'day':
        // Extract all available days from groupedData
        return Object.keys(groupedData).map((day) => day.toString())

      case 'week':
        // Extract all available weeks from groupedData
        return Object.keys(groupedData).map((yearWeek) => {
          const year = yearWeek.slice(0, 4)
          const week = yearWeek.slice(4)
          return `${year}${week}`
        })

      case 'month':
        return Object.keys(groupedData)

      case 'record':
        return Object.keys(groupedData)

      default:
        return []
    }
  }

  // 根據單位對數據進行分類，並根據分類進行數據聚合採樣
  useEffect(() => {
    if (sensorsData && sensorsData.length > 0) {
      // 根據單位對數據進行分類（hour/day/week/month...）
      const groupedData = groupData(sensorsData, dataUnit)

      // 將數據根據單位設置不同的聚合採樣精度
      let sampleSize
      switch (dataUnit) {
        case 'hour':
          sampleSize = 1 // 每小时数据不采样
          break
        case 'day':
          sampleSize = 6 // 每天采样一次
          break
        case 'week':
          sampleSize = 7 * 6 // 每周采样一次，假设一周7天，每天24小时
          break
        case 'month':
          sampleSize = 4 * 7 * 6 // 每月采样一次，假设一月30天，每天24小时
          break
        default:
          sampleSize = 1
      }
      // 對分組後的數據進行採樣
      const sampledData = sampleGroupedData(groupedData, sampleSize)
      // 儲存採樣後的數據
      setSensorGroupData(sampledData)

      if (!isIndexesInitialized) {
        // 當 index 尚未初始化
        const availableDates = getAvailableDates(groupedData, dataUnit)
        setDataIndexes(availableDates)
        setSelectDataIndex(availableDates.length - 1)
      }
    }
  }, [sensorsData, dataUnit, isIndexesInitialized])

  // 獲取並整合所有數據 - sensorsData
  useEffect(() => {
    const collectionRef = collection(db, 'sensors_data')
    const q = query(collectionRef)

    // 監聽整個集合的變更
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let documents = []

        snapshot.forEach((doc) => {
          const rawData = doc.data().data
          const formattedData = rawData.map((item) => ({
            ...item,
            soilHumidity: parseFloat(item.soilHumidity),
            temperature: parseFloat(item.temperature),
            humidity: parseFloat(item.humidity),
            light: parseInt(item.light, 10),
            water: parseInt(item.water, 10),
          }))

          // 将当前文档的数据添加到数组中
          documents = documents.concat(formattedData)
        })

        // 更新所有doc的數據
        setSensorsData(documents)
      },
      (error) => {
        console.error('Failed to subscribe to collection:', error)
      }
    )
    return () => unsubscribe()
  }, [])

  // *=== 圖表控制 ===============================================================
  // 切換數據單位
  const changeDataUnit = (unit) => {
    setDataUnit(unit)
    setIsIndexesInitialized(false)
    // setSelectDataIndex(selectDataIndex - 1)
  }
  // 查看上一頁數據
  const handlePrevDay = () => {
    if (selectDataIndex > 0) {
      setSelectDataIndex(selectDataIndex - 1)

      if (selectDataIndex - 1 === dataIndexes.length - 1)
        setIsIndexesInitialized(false)
      else setIsIndexesInitialized(true)
    }
  }
  // 查看下一頁數據
  const handleNextDay = () => {
    if (selectDataIndex < dataIndexes.length - 1) {
      setSelectDataIndex(selectDataIndex + 1)
      setIsIndexesInitialized(true)

      if (selectDataIndex + 1 === dataIndexes.length - 1)
        setIsIndexesInitialized(false)
      else setIsIndexesInitialized(true)
    }
  }
  // 回到最新一頁數據
  const goToLatestData = () => {
    if (dataIndexes.length > 0) {
      setSelectDataIndex(dataIndexes.length - 1)
      setIsIndexesInitialized(false)
    }
  }

  return (
    <div className={style.view}>
      {/* <TestingBlock
        title="全新數據儀表板即將登場！"
        description="將使用更佳美觀易用的數據介面，提供更全面的可視化數據及數據分析結果。"
      /> */}
      <div className={style.container}>
        <div className={style.header}>
          <p>MicroFarm Pro</p>
        </div>
        <div className={style.dashboardView}>
          {/* 最新數據顯示 */}
          {sensors.map((sensor, index) => (
            <SensorDashboardBlock
              key={index}
              name={sensor.name}
              type={sensor.type}
              data={currentWeekSensorsData} // 當週數據
              unit={sensor.unit}
            />
          ))}
        </div>
        <div className={style.data_range}>
          {/* 上一筆資料 */}
          <button
            title="查看上一頁數據"
            className={style.switchData}
            onClick={() => handlePrevDay()}
          >
            <FontAwesomeIcon icon={faCircleChevronLeft} />
          </button>
          {/* 數據單位控制 */}
          <div>
            <p>{dataIndexes[selectDataIndex]}</p>
            <select
              name="數據顯示單位"
              className={style.dataUnitSelection}
              value={dataUnit}
              onChange={(e) => changeDataUnit(e.target.value)}
            >
              <optgroup label="根據時間">
                <option value="hour">小時</option>
                <option value="day">日</option>
                <option value="week">週</option>
                <option value="month">月</option>
              </optgroup>
            </select>
            {isIndexesInitialized && (
              <button
                className={style.switchData}
                onClick={() => goToLatestData()}
                title="回到最新數據"
              >
                <FontAwesomeIcon icon={faAnglesRight} />
              </button>
            )}
          </div>
          {/* 下一筆資料 */}
          <button
            title={isIndexesInitialized ? '查看下一頁數據' : '目前是最新數據'}
            className={style.switchData}
            data-isLast={!isIndexesInitialized}
            onClick={() => handleNextDay()}
          >
            <FontAwesomeIcon icon={faCircleChevronRight} />
          </button>
        </div>
        <div className={style.dataAnalysisBoard}>
          {sensors.map((sensor, index) => (
            <SensorDataChartBlock
              key={index}
              name={sensor.name}
              type={sensor.type}
              data={
                sensorGroupData
                  ? sensorGroupData[dataIndexes[selectDataIndex]]
                  : null
              }
              unit={sensor.unit}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function SensorDashboardBlock({ name, type, data, unit }) {
  const [latestData, setLatestData] = useState(null)
  const [sensors_actv, setSensors_actv] = useState(null)

  useEffect(() => {
    const latest = data ? data[data.length - 1] : null
    setLatestData(latest)
  }, [data])

  /**
   * 檢測感測器在線狀態
   * @param {timestamp} timestamp
   * @returns - 感測器是否在線
   */
  const checkSensorStatus = (timestamp) => {
    // 獲取當前時間
    const now = new Date().getTime()
    // 將Firestore時間戳轉換為毫秒
    const sensorTimestamp =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6
    // 檢查時間差
    return now - sensorTimestamp < 360000
  }
  // 持續間隔檢測感測器在線狀態
  useEffect(() => {
    if (latestData && checkSensorStatus(latestData.timestamp)) {
      setSensors_actv(true)
    } else {
      setSensors_actv(false)
    }

    const intervalId = setInterval(() => {
      if (latestData && checkSensorStatus(latestData.timestamp)) {
        setSensors_actv(true)
      } else {
        setSensors_actv(false)
      }
    }, 6000)

    return () => {
      clearInterval(intervalId) // 清除定时器
    }
  }, [latestData])

  /**
   * 將timestamp時間格式化
   * @param {number} seconds - timestamp.seconds
   * @returns - YYYY/MM/DD 上/下午HH:mm:ss
   */
  function formatTimestamp(seconds) {
    const date = new Date(seconds * 1000)
    return date.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
  }

  return (
    <div className={style.dashboardBlock}>
      <div className={style.header}>
        <span className={style.status} data-actv={sensors_actv}>
          {sensors_actv ? '即時' : '離線'}
        </span>
        <p className={style.name}>{name}</p>
      </div>
      <div className={style.dashboardData}>
        {latestData ? (
          <p className={style.data}>
            {latestData[type]}
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

function SensorDataChartBlock({ name, type, data, unit }) {
  const [latestData, setLatestData] = useState(null)
  const [sensors_actv, setSensors_actv] = useState(null)

  useEffect(() => {
    const latest = data ? data[data.length - 1] : null
    setLatestData(latest)
  }, [data])

  return (
    <div className={style.chartBlock}>
      <div className={style.header}>
        <p className={style.name}>{name}</p>
        {/* <p className={style.unit}>{data}</p> */}
      </div>
      <div className={style.chart}>
        {data ? (
          <Chart name={name} type={type} data={data} unit={unit} />
        ) : (
          <Loading loadingAniActv={true} type="local" />
        )}
      </div>
    </div>
  )
}

function Chart({ name, type, data, unit }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        width={500}
        height={100}
        data={data}
        margin={{
          top: 12,
          right: 12,
          left: -12,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="2 1" />
        <XAxis
          dataKey="timestamp.seconds"
          tickFormatter={(unixTime) =>
            moment(unixTime * 1000).format('MM/DD HH:mm')
          }
        />
        <YAxis
          dataKey={type}
          type="number"
          domain={[0, (dataMax) => dataMax + 5]}
        />

        <Tooltip
          animationDuration={50}
          animationEasing="ease-in-out"
          labelFormatter={(unixTime) =>
            moment(unixTime * 1000).format('MM/DD HH:mm')
          }
        />
        <Line type="monotone" dataKey={type} stroke="#ebcd3b" />
      </LineChart>
    </ResponsiveContainer>
  )
}
