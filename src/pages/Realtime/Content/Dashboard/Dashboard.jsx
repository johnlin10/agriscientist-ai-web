/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react'
import style from './Dashboard.module.scss'
import { db } from '../../../../firebase'
import { collection, onSnapshot, query } from 'firebase/firestore'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faAngleLeft,
  faChevronRight,
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
  LabelList,
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
      fixed: 1,
      chartType: 'line',
      color: 'var(--green_L4)',
      accentColor: 'var(--green_D2)',
    },
    {
      name: '空氣濕度',
      type: 'humidity',
      unit: '%',
      fixed: 1,
      chartType: 'bar',
      color: 'var(--blue_L5)',
      accentColor: 'var(--blue_D3)',
    },
    {
      name: '土壤濕度',
      type: 'soilHumidity',
      unit: '%',
      fixed: 1,
      chartType: 'bar',
      color: 'var(--blue_L5)',
      accentColor: 'var(--blue_D3)',
    },
    {
      name: '光照度',
      type: 'light',
      unit: 'Lux',
      fixed: 0,
      chartType: 'bar',
      color: 'var(--yellow_L4)',
      accentColor: 'var(--yellow_D3)',
    },
    {
      name: '水位高度',
      type: 'water',
      unit: '',
      fixed: 0,
      chartType: 'bar',
      color: 'var(--blue_L5)',
      accentColor: 'var(--blue_D3)',
    },
  ]
  const dataAnalysisType = ['平均', '中位']

  // 感測器原始資料
  const [sensorsData, setSensorsData] = useState(null)

  // 感測器當前分組資料
  const [sensorGroupData, setSensorGroupData] = useState(null)
  const [dataIndexes, setDataIndexes] = useState([]) // 選擇數據單位段落 - 用於尋找段落
  const [selectDataIndex, setSelectDataIndex] = useState(0)
  const [dataUnit, setDataUnit] = useState('hour') // 選擇數據單位 - hour/day/week/month
  const [selectAnalysisDataType, setSelectAnalysisDataType] = useState(0)

  // 圖表數據是否已初始化（初始化後，讓數據分組圖表不因數據更新而返回顯示最新數據）
  const [isIndexesInitialized, setIsIndexesInitialized] = useState(false)

  // *=== 數據處理 ===============================================================

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sensorsData, dataUnit, isIndexesInitialized])

  // *=== 數據獲取 ===============================================================
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

          // 將當前文檔的數據添加到數組中
          documents = documents.concat(formattedData)
        })

        documents.sort((a, b) => {
          return a.timestamp - b.timestamp
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
  // 分析資料切換
  const changeAnalysisData = (type) => {
    setSelectAnalysisDataType(type)
  }

  return (
    <div className={style.view}>
      <div className={style.container}>
        <PageHeader title="MicroFarm Pro" />
        <div className={style.dashboardView}>
          {/* 最新數據顯示 */}
          {sensors.map((sensor, index) => (
            <SensorDashboardBlock
              key={index}
              sensor={sensor}
              data={sensorsData} // 當週數據
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
            <FontAwesomeIcon icon={faAngleLeft} />
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
            <select
              name=""
              className={style.dataUnitSelection}
              value={selectAnalysisDataType}
              onChange={(e) => changeAnalysisData(e.target.value)}
            >
              <optgroup label="基礎運算">
                {dataAnalysisType.map((type, index) => (
                  <option value={index} key={index}>
                    {type}
                  </option>
                ))}
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
            data-islast={!isIndexesInitialized}
            onClick={() => handleNextDay()}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
        <div className={style.dataAnalysisBoard}>
          {sensors.map((sensor, index) => (
            <SensorDataChartBlock
              key={index}
              sensor={sensor}
              data={
                sensorGroupData
                  ? sensorGroupData[dataIndexes[selectDataIndex]]
                  : null
              }
              analysisType={{
                typeName: dataAnalysisType[selectAnalysisDataType],
                index: selectAnalysisDataType,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 *
 * @param {Array} sensor - 感測器資訊
 * @param {*} data - 感測器資料
 * @returns
 */
function SensorDashboardBlock({ sensor, data }) {
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
        <p className={style.name}>{sensor.name}</p>
      </div>
      <div className={style.dashboardData}>
        {latestData ? (
          <p className={style.data}>
            {latestData[sensor.type]}
            {sensor.unit}
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

function SensorDataChartBlock({ sensor, data, analysisType }) {
  const SelectChart = () => {
    if (sensor.chartType === 'line') {
      return (
        <SensorLineChart
          sensor={sensor}
          data={data}
          analysisType={analysisType}
        />
      )
    } else if (sensor.chartType === 'bar') {
      return (
        <SensorBarChart
          sensor={sensor}
          data={data}
          analysisType={analysisType}
        />
      )
    }
  }
  return (
    <div className={style.chartBlock}>
      <div className={style.header}>
        <p className={style.name}>{sensor.name}</p>
        {/* <p className={style.unit}>{data}</p> */}
      </div>
      <div className={style.chart}>
        {data ? (
          <SelectChart />
        ) : (
          <Loading loadingAniActv={true} type="local" />
        )}
      </div>
    </div>
  )
}

/**
 * 計算中位數
 * @param {Array} data
 * @param {Number} key
 * @returns
 */
function calculateMedian(data, key) {
  const sortedValues = data.map((item) => item[key]).sort((a, b) => a - b)
  const middleIndex = Math.floor(sortedValues.length / 2)
  if (sortedValues.length % 2 !== 0) {
    return sortedValues[middleIndex]
  }
  return (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2
}

/**
 * 計算平均值
 * @param {Array} data - 數據數組
 * @param {Number} key - 感測器代號
 * @returns
 */
function calculateAverage(data, key) {
  const sum = data.reduce((acc, item) => acc + item[key], 0)
  return sum / data.length
}

function SensorLineChart({ sensor, data, analysisType }) {
  const [displayDataAnalysis, setDisplayDataAnalysis] = useState(null)

  useEffect(() => {
    // 根據傳入的 sensor.type 計算平均值和中位數
    const average = calculateAverage(data, sensor.type)
    const median = calculateMedian(data, sensor.type)

    // 根据 analysisType 设置要显示的数据分析类型
    let analysisValue
    if (analysisType.index === '0') {
      analysisValue = average
    } else if (analysisType.index === '1') {
      analysisValue = median
    } else {
      analysisValue = average
    }

    // 設定要顯示的數據分析結果
    setDisplayDataAnalysis(analysisValue)
  }, [data, sensor, analysisType])

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
          dataKey={sensor.type}
          type="number"
          domain={[0, (dataMax) => dataMax * 1.2]}
          tickFormatter={(data) => data.toFixed(sensor.fixed)}
        />

        <Tooltip
          animationDuration={50}
          animationEasing="ease-in-out"
          labelFormatter={(unixTime) =>
            moment(unixTime * 1000).format('MM/DD HH:mm')
          }
        />
        <Line type="monone" dataKey={sensor.type} stroke={sensor.color}>
          {/* <LabelList dataKey={type} position="top" /> */}
        </Line>

        <ReferenceLine
          y={displayDataAnalysis ? displayDataAnalysis : ''}
          isFront={true}
          position="start"
          fill={sensor.accentColor}
          stroke={sensor.accentColor}
          strokeWidth="1px"
          strokeDasharray="7 3"
        >
          <Label
            value={
              displayDataAnalysis
                ? `${analysisType.typeName} ${displayDataAnalysis.toFixed(
                    sensor.fixed
                  )}${sensor.unit}`
                : ''
            }
            position="insideBottomLeft"
            fill={sensor.accentColor}
          />
        </ReferenceLine>
      </LineChart>
    </ResponsiveContainer>
  )
}

function SensorBarChart({ sensor, data, analysisType }) {
  const [displayDataAnalysis, setDisplayDataAnalysis] = useState(null)

  useEffect(() => {
    // 根據傳入的 sensor.type 計算平均值和中位數
    const average = calculateAverage(data, sensor.type)
    const median = calculateMedian(data, sensor.type)

    // 根據 analysisType 設定要顯示的數據分析類型
    let analysisValue
    if (analysisType.index === '0') {
      analysisValue = average
    } else if (analysisType.index === '1') {
      analysisValue = median
    } else {
      analysisValue = average
    }

    // 設定要顯示的數據分析結果
    setDisplayDataAnalysis(analysisValue)
  }, [data, sensor, analysisType])
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 12,
          right: 12,
          left: -12,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="timestamp.seconds"
          tickFormatter={(unixTime) =>
            moment(unixTime * 1000).format('MM/DD HH:mm')
          }
        />
        <YAxis
          dataKey={sensor.type}
          type="number"
          domain={[0, (dataMax) => dataMax * 1.2]}
          tickFormatter={(data) => data.toFixed(sensor.fixed)}
        />
        <Tooltip
          animationDuration={50}
          animationEasing="ease-in-out"
          labelFormatter={(unixTime) => {
            const date = new Date(unixTime * 1000)
            const month = date.getMonth() + 1 // 月份是從 0 開始的，所以要加 1
            const day = date.getDate()
            const hours = date.getHours()
            const minutes = date.getMinutes()

            // 使用 padStart 來確保月份、日期、小時和分鐘是兩位數
            const formattedMonth = month.toString().padStart(2, '0')
            const formattedDay = day.toString().padStart(2, '0')
            const formattedHours = hours.toString().padStart(2, '0')
            const formattedMinutes = minutes.toString().padStart(2, '0')

            return `${formattedMonth}月${formattedDay}日 ${formattedHours}:${formattedMinutes}`
          }}
        />
        <Bar dataKey={sensor.type} fill={sensor.color} />

        <ReferenceLine
          y={displayDataAnalysis ? displayDataAnalysis : ''}
          isFront={true}
          position="start"
          fill={sensor.accentColor}
          stroke={sensor.accentColor}
          strokeWidth="1px"
          strokeDasharray="7 3"
        >
          <Label
            value={
              displayDataAnalysis
                ? `${analysisType.typeName} ${displayDataAnalysis.toFixed(
                    sensor.fixed
                  )}${sensor.unit}`
                : ''
            }
            position="insideBottomLeft"
            fill={sensor.accentColor}
          />
        </ReferenceLine>
      </BarChart>
    </ResponsiveContainer>
  )
}
