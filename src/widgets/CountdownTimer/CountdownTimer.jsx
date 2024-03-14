import { useEffect, useState } from 'react'
import style from './style.module.scss'

export default function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    // 設置定時器每秒更新剩餘時間
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(targetDate)
      setTimeLeft(newTimeLeft)

      // 如果時間到了，清除定時器
      if (newTimeLeft.total <= 0) {
        clearInterval(timer)
      }
    }, 1000)

    // 清除定時器的效果
    return () => clearInterval(timer)
  }, [targetDate])

  // 格式化剩餘時間
  const formattedTimeLeft = {
    days: Math.floor(timeLeft.total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((timeLeft.total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((timeLeft.total / 1000 / 60) % 60),
    seconds: Math.floor((timeLeft.total / 1000) % 60),
  }

  // 如果時間已經到了，可以顯示一些特別的內容
  if (timeLeft.total <= 0) {
    return <span>倒數計時結束！</span>
  }

  return (
    <span>
      {formattedTimeLeft
        ? `${formattedTimeLeft.days > 0 ? `${formattedTimeLeft.days}天 ` : ''}
          ${
            formattedTimeLeft.hours > 0 ? `${formattedTimeLeft.hours}小時 ` : ''
          } 
          ${
            formattedTimeLeft.minutes > 0
              ? `${formattedTimeLeft.minutes}分鐘 `
              : ''
          }
          ${
            formattedTimeLeft.seconds > 0
              ? `${formattedTimeLeft.seconds}秒 `
              : ''
          }`
        : ''}
    </span>
  )
}

function calculateTimeLeft(targetDate) {
  const difference = +new Date(targetDate) - +new Date()
  return {
    total: difference,
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  }
}
