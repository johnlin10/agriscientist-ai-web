import style from './style/Sensors.module.scss'
import { db } from '../../firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTemperatureThreeQuarters,
  faTemperatureHalf,
  faTemperatureQuarter,
  faCircleChevronRight,
  faCircleChevronLeft,
} from '@fortawesome/free-solid-svg-icons'

import { Helmet } from 'react-helmet'
// 圖表庫
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

export default function Sensors(props) {
  const [sensors, setSensors] = useState()
  const [sensors_actv, setSensors_actv] = useState(false)
  const [dataIndexes, setDataIndexes] = useState([]) // 選擇數據單位段落 - 用於尋找段落
  const [selectDataIndex, setSelectDataIndex] = useState(0)
  const [dataUnit, setDataUnit] = useState('hour') // 選擇數據單位 - hour/day/week/month
  const [displayedData, setDisplayedData] = useState()

  const [dataAnalytics_temperature_actv, set_dataAnalytics_temperature_actv] =
    useState(false)
  const [dataAnalytics_humidity_actv, set_dataAnalytics_humidity_actv] =
    useState(false)
  const [dataAnalytics_light_actv, set_dataAnalytics_light_actv] =
    useState(false)
  const [dataAnalytics_soilHumidity_actv, set_dataAnalytics_soilHumidity_actv] =
    useState(false)
  const [dataAnalytics_water_actv, set_dataAnalytics_water_actv] =
    useState(false)

  const [dataAnalytics, setDataAnalytics] = useState()

  const RADIAN = Math.PI / 180
  const temperature_gear = [
    { name: '寒冷', value: 15, color: '#649df2' },
    { name: '適中', value: 12, color: '#48d566' },
    { name: '炎熱', value: 13, color: '#d45353' },
  ]
  const humidity_gear = [
    { name: '乾燥', value: 33, color: '#649df2' },
    { name: '適中', value: 34, color: '#48d566' },
    { name: '潮濕', value: 33, color: '#d45353' },
  ]
  const soilHumidity_gear = [
    { name: '乾燥', value: 33, color: '#649df2' },
    { name: '適中', value: 34, color: '#48d566' },
    { name: '潮濕', value: 33, color: '#d45353' },
  ]
  const water_gear = [
    { name: '乾燥', value: 33, color: '#d45353' },
    { name: '適中', value: 34, color: '#649df2' },
    { name: '潮濕', value: 33, color: '#48d566' },
  ]

  // 儀表板指針
  const cx = 100
  const cy = 100
  const iR = 50
  const oR = 100
  const needle = (value, data, cx, cy, iR, oR, color) => {
    let total = 0
    data.forEach((v) => {
      total += v.value
    })
    const ang = 180.0 * (1 - value / total)
    const length = (iR + 2 * oR) / 3
    const sin = Math.sin(-RADIAN * ang)
    const cos = Math.cos(-RADIAN * ang)
    const r = 5
    const x0 = cx + 5
    const y0 = cy + 5
    const xba = x0 + r * sin
    const yba = y0 - r * cos
    const xbb = x0 - r * sin
    const ybb = y0 + r * cos
    const xp = x0 + length * cos
    const yp = y0 + length * sin

    return [
      <circle cx={x0} cy={y0} r={r} fill={color} stroke="none" />,
      <path
        d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`}
        stroke="#none"
        fill={color}
      />,
    ]
  }

  const checkSensorStatus = (timestamp) => {
    // 获取当前时间
    const now = new Date().getTime()
    // 将Firestore时间戳转换为毫秒
    const sensorTimestamp =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6
    // 检查时间差
    return now - sensorTimestamp > 360000
  }

  // 感測器數據即時同步
  useEffect(() => {
    const sensorsDataRef = doc(db, 'sensors_data', 'sensors_2')
    const unsubscribe = onSnapshot(sensorsDataRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().hasOwnProperty('data')) {
        const sortData = docSnap.data().data.sort((a, b) => {
          const timestampA =
            a.timestamp.seconds * 1000 + a.timestamp.nanoseconds / 1e6
          const timestampB =
            b.timestamp.seconds * 1000 + b.timestamp.nanoseconds / 1e6

          return timestampA - timestampB
        })
        setSensors(sortData)
        // console.log(sortData)
        // setDataDisplayArea(sortData.length)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (sensors && sensors.length > 0) {
      const groupedData = groupData(sensors, dataUnit)
      setDisplayedData(groupedData)

      const availableDates = getAvailableDates(groupedData, dataUnit)
      setDataIndexes(availableDates)
      setSelectDataIndex(availableDates.length - 1)
      console.log(availableDates.length - 1)
    }
  }, [sensors, dataUnit])

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
            .replace(/-/g, '') // Get YYYY-MM-DD format

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

  // Helper function to get the week number
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getUTCFullYear(), 0, 1)
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
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
        return Object.keys(groupedData)

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

  // useEffect(() => {
  //   if (dataDates && dataDates.length > 0) {
  //     setSelectDates(dataDates.length - 1)
  //   }
  // }, [dataDates])

  const handlePrevDay = () => {
    if (selectDataIndex > 0) {
      setSelectDataIndex(selectDataIndex - 1)
    }
  }
  const handleNextDay = () => {
    if (selectDataIndex < dataIndexes.length - 1) {
      setSelectDataIndex(selectDataIndex + 1)
    }
  }

  // 獲取數據分析
  useEffect(() => {
    const dataAnalytics_ref = doc(db, 'sensors_data', 'dataAnalytics')

    const unsubscribe = onSnapshot(dataAnalytics_ref, (docSnap) => {
      if (docSnap.exists()) {
        setDataAnalytics(docSnap.data())
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // 感測器在線狀態
  useEffect(() => {
    const lastData = sensors ? sensors[sensors.length - 1] : ''
    if (lastData && sensors && checkSensorStatus(lastData.timestamp)) {
      setSensors_actv(false)
    } else {
      setSensors_actv(true)
    }

    const intervalId = setInterval(() => {
      if (lastData && sensors && checkSensorStatus(lastData.timestamp)) {
        setSensors_actv(false)
      } else {
        setSensors_actv(true)
      }
    }, 6000)

    return () => {
      clearInterval(intervalId) // 清除定时器
    }
  }, [sensors])

  // 將timestamp時間格式化
  function formatTimestamp(seconds) {
    const date = new Date(seconds * 1000)
    return date.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
  }

  // 溫度感測器在不同狀態下的 icon
  const temperature_icon = [
    {
      high: <FontAwesomeIcon icon={faTemperatureThreeQuarters} />,
      medium: <FontAwesomeIcon icon={faTemperatureHalf} />,
      low: <FontAwesomeIcon icon={faTemperatureQuarter} />,
    },
  ]
  return (
    <>
      <Helmet>
        <title>感測數據｜田野數據科學家</title>
      </Helmet>

      {/* 操控條 */}
      <div className={style.data_range}>
        {/* 上一筆資料 */}
        <button className={style.switchData} onClick={() => handlePrevDay()}>
          <FontAwesomeIcon icon={faCircleChevronLeft} />
        </button>
        {/* 數據單位控制 */}
        <div>
          <p>{dataIndexes[selectDataIndex]}</p>
          <select
            name="數據單位"
            className={style.dataUnitSelection}
            value={dataUnit}
            onChange={(e) => setDataUnit(e.target.value)}
          >
            <optgroup label="根據時間">
              <option value="hour">小時</option>
              <option value="day">日（可能卡頓）</option>
              <option value="week">週（卡頓）</option>
              <option value="month">月（非常卡頓）</option>
            </optgroup>
            <optgroup label="其他">
              <option value="record">筆</option>
            </optgroup>
          </select>
        </div>
        {/* 下一筆資料 */}
        <button className={style.switchData} onClick={() => handleNextDay()}>
          <FontAwesomeIcon icon={faCircleChevronRight} />
        </button>
      </div>

      {/* 溫度 */}
      <div className={style.sensor_block}>
        <div className={style.realtime_data}>
          <p>
            {sensors_actv ? (
              <div className={style.realtime}>
                <span>即時</span>
              </div>
            ) : (
              <div>
                <span>離線</span>
              </div>
            )}
            溫度
          </p>
          {sensors && sensors.length > 0 ? (
            <>
              {/* 最新讀數 */}
              <h2>
                {sensors[sensors.length - 1].temperature > 27
                  ? temperature_icon[0].high
                  : sensors[sensors.length - 1].temperature > 15
                  ? temperature_icon[0].medium
                  : temperature_icon[0].low}{' '}
                {sensors[sensors.length - 1].temperature} 度
              </h2>

              {/* 分析 */}
              {dataAnalytics ? (
                <span className={style.analytics}>
                  <span>
                    總平均{' '}
                    {dataAnalytics.temperature
                      ? dataAnalytics.temperature.mean
                      : '--'}
                  </span>
                  <span>
                    總中位數{' '}
                    {dataAnalytics.temperature
                      ? dataAnalytics.temperature.median
                      : '--'}
                  </span>
                  {dataAnalytics.temperature ? (
                    <span>
                      {dataAnalytics.temperature.trend
                        ? `總${dataAnalytics.temperature.trend}`
                        : '--'}
                    </span>
                  ) : (
                    ''
                  )}
                  <span
                    className={`${style.more}${
                      dataAnalytics_temperature_actv ? ` ${style.actv}` : ''
                    }`}
                    onClick={() =>
                      set_dataAnalytics_temperature_actv(
                        !dataAnalytics_temperature_actv
                      )
                    }
                  >
                    {dataAnalytics_temperature_actv ? '收回' : '更多...'}
                  </span>
                  {dataAnalytics_temperature_actv ? (
                    <>
                      <span>
                        一天平均{' '}
                        {dataAnalytics.temperature
                          ? dataAnalytics.temperature.mean_1
                          : '--'}
                      </span>
                      <span>
                        一天中位數{' '}
                        {dataAnalytics.temperature
                          ? dataAnalytics.temperature.median_1
                          : '--'}
                      </span>
                      {dataAnalytics.temperature ? (
                        <span>
                          {dataAnalytics.temperature.trend_1
                            ? `一天${dataAnalytics.temperature.trend_1}`
                            : '--'}
                        </span>
                      ) : (
                        ''
                      )}
                    </>
                  ) : (
                    ''
                  )}
                </span>
              ) : (
                ''
              )}

              {/* 時間 */}
              <span>
                {formatTimestamp(sensors[sensors.length - 1].timestamp.seconds)}
              </span>

              {/* 儀表板 */}
              <PieChart className={style.dashboard} width={210} height={110}>
                <Pie
                  dataKey="value"
                  startAngle={180}
                  endAngle={0}
                  data={temperature_gear}
                  cx={cx}
                  cy={cy}
                  innerRadius={iR}
                  outerRadius={oR}
                  fill="#8884d8"
                  stroke="none"
                >
                  {temperature_gear.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                {needle(
                  sensors[sensors.length - 1].temperature,
                  temperature_gear,
                  cx,
                  cy,
                  iR,
                  oR,
                  '#f3f350'
                )}
              </PieChart>
            </>
          ) : (
            <h2>無數據</h2>
          )}
        </div>

        {sensors && sensors.length > 0 && (
          <div className={style.charts}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                width={500}
                height={100}
                data={
                  displayedData &&
                  dataIndexes.length > 0 &&
                  selectDataIndex > -1
                    ? displayedData[dataIndexes[selectDataIndex]]
                    : []
                }
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
                  tickFormatter={(unixTime) => {
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

                    return `${formattedMonth}${formattedDay} ${formattedHours}${formattedMinutes}`
                  }}
                />
                <YAxis type="number" domain={[0, 'dataMax + 5']} />
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
                <Line type="monotone" dataKey="temperature" stroke="#eaa74a" />
                {dataAnalytics && dataAnalytics.temperature ? (
                  <ReferenceLine
                    y={dataAnalytics.temperature.median}
                    isFront={true}
                    position="start"
                    stroke="#af721c"
                    strokeWidth="1px"
                    strokeDasharray="7 3"
                  >
                    <Label
                      value="中位數"
                      position="insideBottomLeft"
                      fill="#af721c"
                    />
                  </ReferenceLine>
                ) : (
                  ''
                )}
                {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 濕度 */}
      <div className={style.sensor_block}>
        <div className={style.realtime_data}>
          <p>
            {sensors_actv ? (
              <div className={style.realtime}>
                <span>即時</span>
              </div>
            ) : (
              <div>
                <span>離線</span>
              </div>
            )}
            濕度
          </p>
          {sensors && sensors.length > 0 ? (
            <>
              {/* 最新讀數 */}
              <h2>{sensors[sensors.length - 1].humidity} %</h2>

              {/* 分析 */}
              {dataAnalytics ? (
                <span className={style.analytics}>
                  <span>
                    總平均{' '}
                    {dataAnalytics.humidity
                      ? dataAnalytics.humidity.mean
                      : '--'}
                  </span>
                  <span>
                    總中位數{' '}
                    {dataAnalytics.humidity
                      ? dataAnalytics.humidity.median
                      : '--'}
                  </span>
                  {dataAnalytics.humidity ? (
                    <span>
                      {dataAnalytics.humidity.trend
                        ? `總${dataAnalytics.humidity.trend}`
                        : '--'}
                    </span>
                  ) : (
                    ''
                  )}
                  <span
                    className={`${style.more}${
                      dataAnalytics_humidity_actv ? ` ${style.actv}` : ''
                    }`}
                    onClick={() =>
                      set_dataAnalytics_humidity_actv(
                        !dataAnalytics_humidity_actv
                      )
                    }
                  >
                    {dataAnalytics_humidity_actv ? '收回' : '更多...'}
                  </span>
                  {dataAnalytics_humidity_actv ? (
                    <>
                      <span>
                        一天平均{' '}
                        {dataAnalytics.humidity
                          ? dataAnalytics.humidity.mean_1
                          : '--'}
                      </span>
                      <span>
                        一天中位數{' '}
                        {dataAnalytics.humidity
                          ? dataAnalytics.humidity.median_1
                          : '--'}
                      </span>
                      {dataAnalytics.humidity ? (
                        <span>
                          {dataAnalytics.humidity.trend_1
                            ? `一天${dataAnalytics.humidity.trend_1}`
                            : '--'}
                        </span>
                      ) : (
                        ''
                      )}
                    </>
                  ) : (
                    ''
                  )}
                </span>
              ) : (
                ''
              )}

              {/* 時間 */}
              <span>
                {formatTimestamp(sensors[sensors.length - 1].timestamp.seconds)}
              </span>

              {/* 儀表板 */}
              <PieChart className={style.dashboard} width={210} height={110}>
                <Pie
                  dataKey="value"
                  startAngle={180}
                  endAngle={0}
                  data={humidity_gear}
                  cx={cx}
                  cy={cy}
                  innerRadius={iR}
                  outerRadius={oR}
                  fill="#8884d8"
                  stroke="none"
                >
                  {humidity_gear.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                {needle(
                  sensors[sensors.length - 1].humidity,
                  humidity_gear,
                  cx,
                  cy,
                  iR,
                  oR,
                  '#f3f350'
                )}
              </PieChart>
            </>
          ) : (
            <h2>無數據</h2>
          )}
        </div>

        {sensors && sensors.length > 0 && (
          <div className={style.charts}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                width={500}
                height={400}
                data={
                  displayedData &&
                  dataIndexes.length > 0 &&
                  selectDataIndex > -1
                    ? displayedData[dataIndexes[selectDataIndex]]
                    : []
                }
                margin={{
                  top: 12,
                  right: 12,
                  left: -12,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="15%"
                      stopColor="var(--blue_L4)"
                      stopOpacity={1}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--blue_L4)"
                      stopOpacity={0.2}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp.seconds"
                  tickFormatter={(unixTime) => {
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

                    return `${formattedMonth}${formattedDay} ${formattedHours}${formattedMinutes}`
                  }}
                />
                <YAxis type="number" domain={[0, 100]} />
                <Tooltip
                  animationDuration={50}
                  animationEasing="ease-in-out"
                  cursor={{ stroke: '#48d566', strokeWidth: 1 }}
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
                  // formatter={(value) => value.toFixed(1)}
                />

                <Area
                  type="monotone"
                  dataKey="humidity"
                  stroke="#3f9dea"
                  fill="url(#colorUv)"
                />
                {dataAnalytics && dataAnalytics.humidity ? (
                  <ReferenceLine
                    y={dataAnalytics.humidity.median}
                    isFront={true}
                    position="start"
                    fill="var(--blue_D3)"
                    stroke="var(--blue_D3)"
                    strokeWidth="1px"
                    strokeDasharray="7 3"
                  >
                    <Label
                      value="中位數"
                      position="insideBottomLeft"
                      fill="var(--blue_D4)"
                    />
                  </ReferenceLine>
                ) : (
                  ''
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 光照度 */}
      <div className={style.sensor_block}>
        <div className={style.realtime_data}>
          <p>
            {sensors_actv ? (
              <div className={style.realtime}>
                <span>即時</span>
              </div>
            ) : (
              <div>
                <span>離線</span>
              </div>
            )}
            光照度
          </p>
          {sensors && sensors.length > 0 ? (
            <>
              <h2>{sensors[sensors.length - 1].light} Lux</h2>

              {/* 分析 */}
              {dataAnalytics ? (
                <span className={style.analytics}>
                  <span>
                    總平均{' '}
                    {dataAnalytics.light ? dataAnalytics.light.mean : '--'}
                  </span>
                  <span>
                    總中位數{' '}
                    {dataAnalytics.light ? dataAnalytics.light.median : '--'}
                  </span>
                  {dataAnalytics.light ? (
                    <span>
                      {dataAnalytics.light.trend
                        ? `總${dataAnalytics.light.trend}`
                        : '--'}
                    </span>
                  ) : (
                    ''
                  )}
                  <span
                    className={`${style.more}${
                      dataAnalytics_light_actv ? ` ${style.actv}` : ''
                    }`}
                    onClick={() =>
                      set_dataAnalytics_light_actv(!dataAnalytics_light_actv)
                    }
                  >
                    {dataAnalytics_light_actv ? '收回' : '更多...'}
                  </span>
                  {dataAnalytics_light_actv ? (
                    <>
                      <span>
                        一天平均{' '}
                        {dataAnalytics.light
                          ? dataAnalytics.light.mean_1
                          : '--'}
                      </span>
                      <span>
                        一天中位數{' '}
                        {dataAnalytics.light
                          ? dataAnalytics.light.median_1
                          : '--'}
                      </span>
                      {dataAnalytics.light ? (
                        <span>
                          {dataAnalytics.light.trend_1
                            ? `一天${dataAnalytics.light.trend_1}`
                            : '--'}
                        </span>
                      ) : (
                        ''
                      )}
                    </>
                  ) : (
                    ''
                  )}
                </span>
              ) : (
                ''
              )}

              {/* 時間 */}
              <span>
                {formatTimestamp(sensors[sensors.length - 1].timestamp.seconds)}
              </span>
            </>
          ) : (
            <h2>無數據</h2>
          )}
        </div>

        {sensors && sensors.length > 0 && (
          <div className={style.charts}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                width={500}
                height={300}
                data={
                  displayedData &&
                  dataIndexes.length > 0 &&
                  selectDataIndex > -1
                    ? displayedData[dataIndexes[selectDataIndex]]
                    : []
                }
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
                  tickFormatter={(unixTime) => {
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

                    return `${formattedMonth}${formattedDay} ${formattedHours}${formattedMinutes}`
                  }}
                />
                <YAxis type="number" domain={[0, 1000]} />
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
                <Bar
                  dataKey="light"
                  fill="#ead54a"
                  // activeBar={<Rectangle stroke="#ead54a" />}
                />

                {dataAnalytics && dataAnalytics.light ? (
                  <ReferenceLine
                    y={dataAnalytics.light.median}
                    isFront={true}
                    position="start"
                    stroke="#a8961f"
                    strokeWidth="1px"
                    strokeDasharray="7 3"
                  >
                    <Label
                      value="中位數"
                      position="insideBottomLeft"
                      fill="#a8961f"
                    />
                  </ReferenceLine>
                ) : (
                  ''
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 土壤濕度 */}
      <div className={style.sensor_block}>
        <div className={style.realtime_data}>
          <p>
            {sensors_actv ? (
              <div className={style.realtime}>
                <span>即時</span>
              </div>
            ) : (
              <div>
                <span>離線</span>
              </div>
            )}
            土壤濕度值
          </p>
          {sensors && sensors.length > 0 ? (
            <>
              {/* 最新讀數 */}
              <h2>{sensors[sensors.length - 1].soilHumidity} %</h2>
              {/* 分析 */}
              {dataAnalytics ? (
                <span className={style.analytics}>
                  <span>
                    總平均{' '}
                    {dataAnalytics.soilHumidity
                      ? dataAnalytics.soilHumidity.mean
                      : '--'}
                  </span>
                  <span>
                    總中位數{' '}
                    {dataAnalytics.soilHumidity
                      ? dataAnalytics.soilHumidity.median
                      : '--'}
                  </span>
                  {dataAnalytics.soilHumidity ? (
                    <span>
                      {dataAnalytics.soilHumidity.trend
                        ? `總${dataAnalytics.soilHumidity.trend}`
                        : '--'}
                    </span>
                  ) : (
                    ''
                  )}
                  <span
                    className={`${style.more}${
                      dataAnalytics_soilHumidity_actv ? ` ${style.actv}` : ''
                    }`}
                    onClick={() =>
                      set_dataAnalytics_soilHumidity_actv(
                        !dataAnalytics_soilHumidity_actv
                      )
                    }
                  >
                    {dataAnalytics_soilHumidity_actv ? '收回' : '更多...'}
                  </span>
                  {dataAnalytics_soilHumidity_actv ? (
                    <>
                      <span>
                        一天平均{' '}
                        {dataAnalytics.soilHumidity
                          ? dataAnalytics.soilHumidity.mean_1
                          : '--'}
                      </span>
                      <span>
                        一天中位數{' '}
                        {dataAnalytics.soilHumidity
                          ? dataAnalytics.soilHumidity.median_1
                          : '--'}
                      </span>
                      {dataAnalytics.soilHumidity ? (
                        <span>
                          {dataAnalytics.soilHumidity.trend_1
                            ? `一天${dataAnalytics.soilHumidity.trend_1}`
                            : '--'}
                        </span>
                      ) : (
                        ''
                      )}
                    </>
                  ) : (
                    ''
                  )}
                </span>
              ) : (
                ''
              )}
              {/* 時間 */}
              <span>
                {formatTimestamp(sensors[sensors.length - 1].timestamp.seconds)}
              </span>

              {/* 儀表板 */}
              <PieChart className={style.dashboard} width={210} height={110}>
                <Pie
                  dataKey="value"
                  startAngle={180}
                  endAngle={0}
                  data={soilHumidity_gear}
                  cx={cx}
                  cy={cy}
                  innerRadius={iR}
                  outerRadius={oR}
                  fill="#8884d8"
                  stroke="none"
                >
                  {soilHumidity_gear.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                {needle(
                  sensors[sensors.length - 1].soilHumidity,
                  soilHumidity_gear,
                  cx,
                  cy,
                  iR,
                  oR,
                  '#f3f350'
                )}
              </PieChart>
            </>
          ) : (
            <h2>無數據</h2>
          )}
        </div>

        {sensors && sensors.length > 0 && (
          <div className={style.charts}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                width={500}
                height={100}
                data={
                  displayedData &&
                  dataIndexes.length > 0 &&
                  selectDataIndex > -1
                    ? displayedData[dataIndexes[selectDataIndex]]
                    : []
                }
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
                  tickFormatter={(unixTime) => {
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

                    return `${formattedMonth}${formattedDay} ${formattedHours}${formattedMinutes}`
                  }}
                />
                <YAxis type="number" domain={[0, 100]} />
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
                  // formatter={(value) => value.toFixed(1)}
                />
                <Bar
                  type="monotone"
                  dataKey="soilHumidity"
                  // fill="url(#colorSoilHumidity)"
                  fill="var(--blue_L4)"
                  activeBar={<Rectangle stroke="#3f9dea" />}
                />

                {dataAnalytics && dataAnalytics.soilHumidity ? (
                  <ReferenceLine
                    y={dataAnalytics.soilHumidity.median}
                    isFront={true}
                    position="start"
                    fill="var(--blue_D3)"
                    stroke="var(--blue_D3)"
                    strokeWidth="1px"
                    strokeDasharray="7 3"
                  >
                    <Label
                      value="中位數"
                      position="insideBottomLeft"
                      fill="var(--blue_D4)"
                    />
                  </ReferenceLine>
                ) : (
                  ''
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 水位 */}
      <div className={style.sensor_block}>
        <div className={style.realtime_data}>
          <p>
            {sensors_actv ? (
              <div className={style.realtime}>
                <span>即時</span>
              </div>
            ) : (
              <div>
                <span>離線</span>
              </div>
            )}
            水位感測
          </p>
          {sensors && sensors.length > 0 ? (
            <>
              {/* 最新讀數 */}
              <h2>{sensors[sensors.length - 1].water}</h2>

              {/* 分析 */}
              {dataAnalytics ? (
                <span className={style.analytics}>
                  <span>
                    總平均{' '}
                    {dataAnalytics.water ? dataAnalytics.water.mean : '--'}
                  </span>
                  <span>
                    總中位數{' '}
                    {dataAnalytics.water ? dataAnalytics.water.median : '--'}
                  </span>
                  {dataAnalytics.water ? (
                    <span>
                      {dataAnalytics.water.trend
                        ? `總${dataAnalytics.water.trend}`
                        : '--'}
                    </span>
                  ) : (
                    ''
                  )}
                  <span
                    className={`${style.more}${
                      dataAnalytics_water_actv ? ` ${style.actv}` : ''
                    }`}
                    onClick={() =>
                      set_dataAnalytics_water_actv(!dataAnalytics_water_actv)
                    }
                  >
                    {dataAnalytics_water_actv ? '收回' : '更多...'}
                  </span>
                  {dataAnalytics_water_actv ? (
                    <>
                      <span>
                        一天平均{' '}
                        {dataAnalytics.water
                          ? dataAnalytics.water.mean_1
                          : '--'}
                      </span>
                      <span>
                        一天中位數{' '}
                        {dataAnalytics.water
                          ? dataAnalytics.water.median_1
                          : '--'}
                      </span>
                      {dataAnalytics.water ? (
                        <span>
                          {dataAnalytics.water.trend_1
                            ? `一天${dataAnalytics.water.trend_1}`
                            : '--'}
                        </span>
                      ) : (
                        ''
                      )}
                    </>
                  ) : (
                    ''
                  )}
                </span>
              ) : (
                ''
              )}

              {/* 時間 */}
              <span>
                {formatTimestamp(sensors[sensors.length - 1].timestamp.seconds)}
              </span>

              {/* 儀表板 */}
              {/* <PieChart className={style.dashboard} width={210} height={110}>
                <Pie
                  dataKey="value"
                  startAngle={180}
                  endAngle={0}
                  data={water_gear}
                  cx={cx}
                  cy={cy}
                  innerRadius={iR}
                  outerRadius={oR}
                  fill="#8884d8"
                  stroke="none"
                >
                  {water_gear.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                {needle(
                  sensors[sensors.length - 1].water,
                  soilHumidity_gear,
                  cx,
                  cy,
                  iR,
                  oR,
                  '#f3f350'
                )}
              </PieChart> */}
            </>
          ) : (
            <h2>無數據</h2>
          )}
        </div>
        {sensors && sensors.length > 0 && (
          <div className={style.charts}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                width={500}
                height={400}
                data={
                  displayedData &&
                  dataIndexes.length > 0 &&
                  selectDataIndex > -1
                    ? displayedData[dataIndexes[selectDataIndex]]
                    : []
                }
                margin={{
                  top: 12,
                  right: 12,
                  left: -12,
                  bottom: 0,
                }}
              >
                {/* <CartesianGrid strokeDasharray="3 3" /> */}
                <XAxis
                  dataKey="timestamp.seconds"
                  tickFormatter={(unixTime) => {
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

                    return `${formattedMonth}${formattedDay} ${formattedHours}${formattedMinutes}`
                  }}
                />
                <YAxis type="number" domain={[0, 'dataMax + 100']} />
                <Tooltip
                  animationDuration={50}
                  animationEasing="ease-in-out"
                  // cursor={{ stroke: '#48d566', strokeWidth: 1 }}
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
                  // formatter={(value) => value.toFixed(1)}
                />
                <Bar
                  type="monotone"
                  dataKey="water"
                  fill="var(--blue_L4)"
                  // stroke="#3f9dea"
                  background={{ fill: '#0000000f' }}
                />

                {dataAnalytics && dataAnalytics.water ? (
                  <ReferenceLine
                    y={dataAnalytics.water.median}
                    isFront={true}
                    position="start"
                    fill="var(--blue_D3)"
                    stroke="var(--blue_D3)"
                    strokeWidth="1px"
                    strokeDasharray="7 3"
                  >
                    <Label
                      value="中位數"
                      position="insideBottomLeft"
                      fill="var(--blue_D4)"
                    />
                  </ReferenceLine>
                ) : (
                  ''
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 混合數據 */}
      <div className={style.sensor_block}>
        {sensors && sensors.length > 0 && (
          <div className={style.charts} data-full>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                width={500}
                height={100}
                data={
                  displayedData &&
                  dataIndexes.length > 0 &&
                  selectDataIndex > -1
                    ? displayedData[dataIndexes[selectDataIndex]]
                    : []
                }
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
                  tickFormatter={(unixTime) => {
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

                    return `${formattedMonth}${formattedDay} ${formattedHours}${formattedMinutes}`
                  }}
                />
                <YAxis type="number" domain={[0, 40]} />
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
                  // formatter={(value) => value.toFixed(1)}
                />
                <defs>
                  <linearGradient
                    id="colorHumidity"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#48d566" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#48d566" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient
                    id="colorSoilHumidity"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#3f9dea" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3f9dea" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <Legend />

                <Line type="monotone" dataKey="temperature" stroke="#eaa74a" />
                <Bar
                  type="monotone"
                  dataKey="soilHumidity"
                  // fill="url(#colorSoilHumidity)"
                  fill="#3f9deaa1"
                  activeBar={<Rectangle fill="#3f9dea" stroke="#3f9dea" />}
                />
                {/* <Line type="monotone" dataKey="soilHumidity" stroke="#d45353" /> */}
                <Bar
                  type="monotone"
                  dataKey="humidity"
                  // fill="url(#colorHumidity)"
                  fill="#48d566a1"
                  activeBar={<Rectangle fill="#48d566" stroke="#48d566" />}
                />
                {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <div className={style.sensor_block}>
        {sensors && sensors.length > 0 && (
          <div className={style.charts} data-full>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                width={500}
                height={100}
                data={
                  displayedData &&
                  dataIndexes.length > 0 &&
                  selectDataIndex > -1
                    ? displayedData[dataIndexes[selectDataIndex]]
                    : []
                }
                margin={{
                  top: 12,
                  right: 12,
                  left: -18,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="2 1" />
                <XAxis
                  dataKey="timestamp.seconds"
                  tickFormatter={(unixTime) => {
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

                    return `${formattedMonth}${formattedDay} ${formattedHours}${formattedMinutes}`
                  }}
                />
                <YAxis type="number" domain={[0, 40]} />
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

                    return `${formattedMonth}月${formattedDay}日 ${formattedHours}${formattedMinutes}`
                  }}
                  // formatter={(value) => value.toFixed(1)}
                />
                <Legend />

                <Bar
                  type="monotone"
                  dataKey="light"
                  // fill="url(#colorHumidity)"
                  fill="#ead54ad1"
                  activeBar={<Rectangle stroke="#ead54a" />}
                />
                <Area
                  type="monotone"
                  dataKey="water"
                  // fill="url(#colorSoilHumidity)"
                  fill="#3f9dea2f"
                  stroke="#3f9dea"
                  activeBar={<Rectangle fill="#3f9dea" stroke="#3f9dea" />}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </>
  )
}
