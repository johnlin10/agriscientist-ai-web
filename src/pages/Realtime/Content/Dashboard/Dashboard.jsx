/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo } from 'react'
import style from './Dashboard.module.scss'
import { db } from '../../../../firebase'
import { collection, onSnapshot, query } from 'firebase/firestore'
import {
  calculateMedian,
  calculateAverage,
  sampleGroupedData,
  groupData,
} from '../../../../script/DataAnalysis'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faAngleLeft,
  faChevronRight,
  faAnglesRight,
} from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import { formatDistanceToNow, formatRelative, format } from 'date-fns'
import { zhTW } from 'date-fns/locale'

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

const analysisTimeRange = {
  hour: '一小時',
  three_hours: '三小時',
  six_hours: '六小時',
  twelve_hours: '十二小時',
  day: '一天',
  three_days: '三天',
  week: '一週',
  three_week: '三週',
  month: '一個月',
  three_month: '三個月',
}

// 此頁面正在內部開發中，尚未完工
export default function Dashboard() {
  // 感測器資訊
  const sensors = [
    {
      name: '空氣溫度',
      type: 'temperature',
      unit: '℃',
      fixed: 1,
      chartType: 'area',
      color: 'var(--green_L4)',
      accentColor: 'var(--green_D2)',
      maxScaleFactor: 1.1,
      minScaleFactor: 0.8,
    },
    {
      name: '空氣濕度',
      type: 'humidity',
      unit: '%',
      fixed: 1,
      chartType: 'area',
      color: 'var(--blue_L5)',
      accentColor: 'var(--blue_D3)',
      maxScaleFactor: 1.1,
      minScaleFactor: 0.8,
    },
    {
      name: '土壤濕度',
      type: 'soilHumidity',
      unit: '%',
      fixed: 1,
      chartType: 'area',
      color: 'var(--blue_L5)',
      accentColor: 'var(--blue_D3)',
      maxScaleFactor: 1.1,
      minScaleFactor: 0.8,
    },
    {
      name: '光照度',
      type: 'light',
      unit: 'Lux',
      fixed: 0,
      chartType: 'bar',
      color: 'var(--yellow_L4)',
      accentColor: 'var(--yellow_D3)',
      maxScaleFactor: 1.2,
      minScaleFactor: '',
    },
    // {
    //   name: '水位高度',
    //   type: 'water',
    //   unit: '',
    //   fixed: 0,
    //   chartType: 'bar',
    //   color: 'var(--blue_L5)',
    //   accentColor: 'var(--blue_D3)',
    //   maxScaleFactor: 1.2,
    //   minScaleFactor: '',
    // },
  ]
  const dataAnalysisType = ['平均', '中位']

  // 感測器原始資料
  const [sensorsData, setSensorsData] = useState(null)
  const [trendAnalysis, setTrendAnalysis] = useState(null)

  // 感測器當前分組資料
  const [sensorGroupData, setSensorGroupData] = useState(null) // 根據單位分組的數據
  const [sensorSampledData, setSensorSampledData] = useState(null) // 採樣後的數據
  const [dataIndexes, setDataIndexes] = useState([]) // 選擇數據單位段落 - 用於尋找段落
  const [selectDataIndex, setSelectDataIndex] = useState(0)
  const [dataUnit, setDataUnit] = useState('hour') // 選擇數據單位 - hour/day/week/month
  const [selectAnalysisDataType, setSelectAnalysisDataType] = useState(0)
  const [maxTrendsBySensor, setMaxTrendsBySensor] = useState({})

  // 圖表數據是否已初始化（初始化後，讓數據分組圖表不因數據更新而返回顯示最新數據）
  const [isIndexesInitialized, setIsIndexesInitialized] = useState(false)

  // *=== 數據處理 ===============================================================

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
      setSensorGroupData(groupedData)

      // 將數據根據單位設置不同的聚合採樣精度
      let sampleSize
      switch (dataUnit) {
        case 'hour':
          sampleSize = 1
          break
        case 'day':
          sampleSize = 6
          break
        case 'week':
          sampleSize = 7 * 6
          break
        case 'month':
          sampleSize = 4 * 7 * 6
          break
        default:
          sampleSize = 1
      }
      // 對分組後的數據進行採樣
      const sampledData = sampleGroupedData(groupedData, sampleSize)
      // 儲存採樣後的數據
      setSensorSampledData(sampledData)

      if (!isIndexesInitialized) {
        // 當 index 尚未初始化
        const availableDates = getAvailableDates(groupedData, dataUnit)
        setDataIndexes(availableDates)
        setSelectDataIndex(availableDates.length - 1)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sensorsData, dataUnit, isIndexesInitialized])

  /**
   * 找出最大的數據趨勢分析結果
   * @param {Array} trendsByTimeRange - 數據趨勢分析結果
   * @returns {Array} - 變化率最大的趨勢
   */
  function findMaxSlopeTrend(trendsByTimeRange) {
    let maxTrend = null
    let maxSlope = 0

    // 便利每個時間範圍的趨勢分析
    Object.values(trendsByTimeRange).forEach((trends) => {
      trends.forEach((trend) => {
        const currentSlopeAbs = Math.abs(trend.slope)
        if (currentSlopeAbs > maxSlope) {
          maxSlope = currentSlopeAbs
          maxTrend = trend
        }
      })
    })

    return maxTrend
  }

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
            // water: parseInt(item.water, 10),
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

  // 獲取數據趨勢分析結果 - trendAnalysis-所有分析結果, maxTrendsBySensor-變化最大的分析結果
  useEffect(() => {
    const collectionRef = collection(db, 'trend_analysis')
    const q = query(collectionRef)

    // 監聽整個集合的變更
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let documents = []

        snapshot.forEach((doc) => {
          // 用doc.id做為索引，用doc.data()做為值
          documents[doc.id] = doc.data()
        })

        // 更新所有doc的數據
        setTrendAnalysis(documents)

        // 提取個想感測器變化最大的分析結果
        let maxTrends = {}
        for (const sensorType in documents) {
          const sensorData = documents[sensorType]
          if (sensorData && sensorData.trends_by_time_range) {
            maxTrends[sensorType] = findMaxSlopeTrend(
              sensorData.trends_by_time_range
            )
          }
        }
        setMaxTrendsBySensor(maxTrends)
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
              data={sensorsData}
            />
          ))}
        </div>
        <div className={style.dataAnalysisView}>
          <div className={style.data_range}>
            <div className={style.data_range_controls}>
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
                <div>
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
              </div>
              {/* 下一筆資料 */}
              <button
                title={
                  isIndexesInitialized ? '查看下一頁數據' : '目前是最新數據'
                }
                className={style.switchData}
                data-islast={!isIndexesInitialized}
                onClick={() => handleNextDay()}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </div>
          <div className={style.dataAnalysisBoard}>
            {sensors.map((sensor, index) => (
              <SensorDataChartBlock
                key={index}
                sensor={sensor}
                data={
                  sensorSampledData
                    ? sensorSampledData[dataIndexes[selectDataIndex]]
                    : null
                }
                analysisType={{
                  typeName: dataAnalysisType[selectAnalysisDataType],
                  index: selectAnalysisDataType,
                }}
                trends={
                  maxTrendsBySensor[sensor.type]
                    ? maxTrendsBySensor[sensor.type]
                    : {}
                }
              />
            ))}
          </div>
          {/* <MixChart
            type=""
            sensor={sensors}
            data={
              sensorSampledData
                ? sensorSampledData[dataIndexes[selectDataIndex]]
                : null
            }
          /> */}
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
  const [timeType, setTimeType] = useState('absolute') // relative, absolute
  const [relativeTime, setRelativeTime] = useState('')

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

  const handleChangeTimeType = () => {
    // setTimeType(timeType === 'relative' ? 'absolute' : 'relative')

    if (timeType === 'absolute') {
      setTimeType('relative')
      setTimeout(() => {
        setTimeType('absolute')
      }, 5000)
    }
  }

  /**
   * 將timestamp時間格式化
   * @param {number} seconds - timestamp.seconds
   * @returns - 絕對時間 (今天上午 7:34, 昨天下午 4:30等)
   */
  function formatTimestamp(seconds) {
    const date = new Date(seconds * 1000)
    const now = new Date()

    const relativeDay = formatRelative(date, now, { locale: zhTW })
    const time = format(date, 'aaa h:mm', { locale: zhTW })

    return `${relativeDay}`
  }

  /**
   * 將timestamp時間格式化
   * @param {number} seconds - timestamp.seconds
   * @returns - 相對時間 (今天、昨天等)
   */
  function formatRelativeTimestamp(seconds) {
    const date = new Date(seconds * 1000)
    const relativeTime = formatDistanceToNow(date, { locale: zhTW })
    const fullTime = `(${format(date, 'yyyy/MM/dd HH:mm:ss', {
      locale: zhTW,
    })})`
    return `${relativeTime}前`
  }

  // 定期更新相對時間
  useEffect(() => {
    if (latestData) {
      const updateRelativeTime = () => {
        setRelativeTime(formatRelativeTimestamp(latestData.timestamp.seconds))
      }

      updateRelativeTime()
      const intervalId = setInterval(updateRelativeTime, 30000)

      return () => {
        clearInterval(intervalId) // 清除定时器
      }
    }
  }, [latestData])

  return (
    <div className={style.dashboardBlock} data-actv={sensors_actv}>
      <div className={style.header}>
        <span className={style.status} data-actv={sensors_actv}>
          {sensors_actv ? '即時' : '離線'}
        </span>
        <p className={style.name}>{sensor.name}</p>
      </div>
      <div className={style.dashboardData}>
        {latestData ? (
          <div className={style.data}>
            <p className={style.data}>
              {latestData[sensor.type]}
              <span>{sensor.unit}</span>
            </p>
            <SensorSimpleBarChartBlock sensor={sensor} data={data} />
          </div>
        ) : (
          <Loading loadingAniActv={true} type="local" />
        )}

        <p className={style.time} onClick={handleChangeTimeType}>
          {latestData
            ? `${
                timeType === 'relative'
                  ? relativeTime
                  : formatTimestamp(latestData.timestamp.seconds)
              }`
            : 'Loading...'}
        </p>
      </div>
    </div>
  )
}

function SensorSimpleBarChartBlock({ sensor, data }) {
  const [chartData, setChartData] = useState(null)

  useEffect(() => {
    if (data && data.length) {
      const latestData = data.slice(-5)
      setChartData(latestData)
      // console.log(latestData)
    }
  }, [data])

  return (
    <div className={style.simpleBarChart}>
      <SensorSimpleBarChart sensor={sensor} data={chartData} />
    </div>
  )
}

function SensorSimpleBarChart({ sensor, data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 3,
          right: 0,
          left: 0,
          bottom: 3,
        }}
      >
        <YAxis
          dataKey={sensor.type}
          type="number"
          hide={true}
          domain={[
            sensor.minScaleFactor !== ''
              ? (dataMin) => dataMin * sensor.minScaleFactor
              : 0,
            sensor.maxScaleFactor !== ''
              ? (dataMax) => dataMax * sensor.maxScaleFactor
              : (dataMax) => dataMax * 1.2,
          ]}
          tickFormatter={(data) => data.toFixed(sensor.fixed)}
        />
        <Bar
          dataKey={sensor.type}
          fill="var(--green_L5)"
          radius={[6, 6, 6, 6]}
          minPointSize={12}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

function SensorDataChartBlock({ sensor, data, analysisType, trends }) {
  const [trendText, setTrendText] = useState(null)
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
    } else if (sensor.chartType === 'area') {
      return (
        <SensorAreaChart
          sensor={sensor}
          data={data}
          analysisType={analysisType}
        />
      )
    } else {
      return (
        <SensorLineChart
          sensor={sensor}
          data={data}
          analysisType={analysisType}
        />
      )
    }
  }

  useEffect(() => {
    if (trends.timeRange) {
      setTrendText(
        `最近${analysisTimeRange[trends.timeRange]}的${sensor.name}${
          trends.trendDirection
        }`
      )
    }
  }, [sensor, trends])

  return (
    <div className={style.chartBlock}>
      <div className={style.header}>
        <p className={style.name}>{sensor.name}</p>
        {/* <p className={style.unit}>{data}</p> */}
      </div>
      {trendText && <p className={style.trend}>{trendText}</p>}
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
          domain={[
            sensor.minScaleFactor !== ''
              ? (dataMin) => dataMin * sensor.minScaleFactor
              : 0,
            sensor.maxScaleFactor !== ''
              ? (dataMax) => dataMax * sensor.maxScaleFactor
              : (dataMax) => dataMax * 1.2,
          ]}
          tickFormatter={(data) => data.toFixed(sensor.fixed)}
        />

        <Tooltip
          animationDuration={50}
          animationEasing="ease-in-out"
          labelFormatter={(unixTime) =>
            moment(unixTime * 1000).format('MM月DD日 HH:mm')
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
          domain={[
            sensor.minScaleFactor !== ''
              ? (dataMin) => dataMin * sensor.minScaleFactor
              : 0,
            sensor.maxScaleFactor !== ''
              ? (dataMax) => dataMax * sensor.maxScaleFactor
              : (dataMax) => dataMax * 1.2,
          ]}
          tickFormatter={(data) => data.toFixed(sensor.fixed)}
        />

        <Tooltip
          animationDuration={50}
          animationEasing="ease-in-out"
          labelFormatter={(unixTime) =>
            moment(unixTime * 1000).format('MM月DD日 HH:mm')
          }
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

function SensorAreaChart({ sensor, data, analysisType }) {
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
      <AreaChart
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
          domain={[
            sensor.minScaleFactor !== ''
              ? (dataMin) => dataMin * sensor.minScaleFactor
              : 0,
            sensor.maxScaleFactor !== ''
              ? (dataMax) => dataMax * sensor.maxScaleFactor
              : (dataMax) => dataMax * 1.2,
          ]}
          tickFormatter={(data) => data.toFixed(sensor.fixed)}
        />

        <Tooltip
          animationDuration={50}
          animationEasing="ease-in-out"
          labelFormatter={(unixTime) =>
            moment(unixTime * 1000).format('MM月DD日 HH:mm')
          }
        />
        <Area
          type="monotone"
          dataKey={sensor.type}
          stroke={sensor.color}
          fill={sensor.color}
        />

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
      </AreaChart>
    </ResponsiveContainer>
  )
}

function MixChart({ type, sensor, data }) {
  const typeset = [
    {
      sensor: 'temperature',
      chartType: '',
      color: '',
    },
    {
      sensor: 'humidity',
      chartType: '',
      color: '',
    },
  ]

  useEffect(() => {
    let chartElement = []
    if (data) {
      typeset.forEach((type) => {
        console.log(`${data}`)

        // 根據 chart 類型 area, line, bar，生成對應的 recharts 圖表，並將圖表 element 添加到 chartElement 變數中。並且 forEach 循環添加多個 chart element。
        if (type.chartType === 'area') {
          chartElement.push({
            element: (
              <AreaChart
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
                  domain={[
                    sensor.minScaleFactor !== ''
                      ? (dataMin) => dataMin * sensor.minScaleFactor
                      : 0,
                    sensor.maxScaleFactor !== ''
                      ? (dataMax) => dataMax * sensor.maxScaleFactor
                      : (dataMax) => dataMax * 1.2,
                  ]}
                  tickFormatter={(data) => data.toFixed(sensor.fixed)}
                />

                <Tooltip
                  animationDuration={50}
                  animationEasing="ease-in-out"
                  labelFormatter={(unixTime) =>
                    moment(unixTime * 1000).format('MM月DD日 HH:mm')
                  }
                />
                <Area
                  type="monotone"
                  dataKey={sensor.type}
                  stroke={sensor.color}
                  fill={sensor.color}
                />
              </AreaChart>
            ),
          })
        } else if (type.chartType === 'line') {
          chartElement.push({
            element: (
              <AreaChart
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
                  domain={[
                    sensor.minScaleFactor !== ''
                      ? (dataMin) => dataMin * sensor.minScaleFactor
                      : 0,
                    sensor.maxScaleFactor !== ''
                      ? (dataMax) => dataMax * sensor.maxScaleFactor
                      : (dataMax) => dataMax * 1.2,
                  ]}
                  tickFormatter={(data) => data.toFixed(sensor.fixed)}
                />

                <Tooltip
                  animationDuration={50}
                  animationEasing="ease-in-out"
                  labelFormatter={(unixTime) =>
                    moment(unixTime * 1000).format('MM月DD日 HH:mm')
                  }
                />
                <Area
                  type="monotone"
                  dataKey={sensor.type}
                  stroke={sensor.color}
                  fill={sensor.color}
                />
              </AreaChart>
            ),
          })
        } else if (type.chartType === 'bar') {
          chartElement.push({
            element: (
              <AreaChart
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
                  domain={[
                    sensor.minScaleFactor !== ''
                      ? (dataMin) => dataMin * sensor.minScaleFactor
                      : 0,
                    sensor.maxScaleFactor !== ''
                      ? (dataMax) => dataMax * sensor.maxScaleFactor
                      : (dataMax) => dataMax * 1.2,
                  ]}
                  tickFormatter={(data) => data.toFixed(sensor.fixed)}
                />

                <Tooltip
                  animationDuration={50}
                  animationEasing="ease-in-out"
                  labelFormatter={(unixTime) =>
                    moment(unixTime * 1000).format('MM月DD日 HH:mm')
                  }
                />
                <Area
                  type="monotone"
                  dataKey={sensor.type}
                  stroke={sensor.color}
                  fill={sensor.color}
                />
              </AreaChart>
            ),
          })
        }
      })
    }
  }, [type, sensor, data])

  return <ResponsiveContainer width="100%" height="100%"></ResponsiveContainer>
}
