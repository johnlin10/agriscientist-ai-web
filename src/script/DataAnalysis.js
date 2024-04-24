/**
 * 計算中位數
 * @param {Array} data
 * @param {Number} key
 * @returns
 */
export function calculateMedian(data, key) {
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
export function calculateAverage(data, key) {
  const sum = data.reduce((acc, item) => acc + item[key], 0)
  return sum / data.length
}

/**
 * 對分組的數據進行採樣
 * @param {Array} groupedData - 分組後的數據
 * @param {number} sampleSize - 採樣大小
 * @returns {Array} - 採樣後的數據數組
 */
export function sampleGroupedData(groupedData, sampleSize) {
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
export function groupData(sensorData, type) {
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
