import { useEffect } from 'react'
import style from './css/Home.module.scss'
import { Helmet } from 'react-helmet'
import Bottom from '../widgets/Bottom'

import Rellax from 'rellax'
import CountdownTimer from '../widgets/CountdownTimer/CountdownTimer'

export default function Home(props) {
  useEffect(() => {
    const selectors = [
      '.headerIcon',
      '.headerTitle',
      '.headerDescription',
      // `.${style.countDownTimer}`,
    ]

    const titleRellaxes = selectors.map(
      (selector) => new Rellax(selector, { wrapper: '#main' })
    )

    return () => {
      titleRellaxes.forEach((titleRellax) => titleRellax.destroy())
    }
  }, [])
  return (
    <>
      <Helmet>
        <title>田野數據科學家｜首頁</title>
        <meta
          name="description"
          content="基於農場數據分析為基礎，並以語音交互為核心的專題作品網站。"
        />
      </Helmet>
      <div className={style.container}>
        <div className={style.header}>
          <div className={`${style.title}`}>
            <img
              className="headerIcon"
              src={`${process.env.PUBLIC_URL}/agriscientist-ai.ico`}
              data-rellax-speed="-5"
              alt="田野數據科學家 Logo"
            />
            <h1 className="headerTitle" data-rellax-speed="-5">
              田野數據<span className="nowrap">科學家</span>
            </h1>
            <p className="headerDescription" data-rellax-speed="-5">
              基於農場數據分析為基礎<span className="end">，</span>
              <br />
              並以語音交互為核心的<span className="nowrap">專題作品網站。</span>
            </p>
            {/* <p className={`${style.countDownTimer}`} data-rellax-speed="-5">
              【全國專題競賽-複賽】結果倒數
              <br />
              <CountdownTimer targetDate="2024-03-19 17:00:00" />
            </p> */}
          </div>
        </div>
        <div className={`${style.intro} ${style.center_v} ${style.center_h}`}>
          <div className={style.introContainer}>
            <img
              id="assistant_icon"
              className={`${style.assistant_icon} `}
              src="https://firebasestorage.googleapis.com/v0/b/agriscientist-ai.appspot.com/o/assets%2Fimages%2Fagriscientist-ai-assistant-2d.png?alt=media&token=18348ad1-e6e0-4627-ae35-e1af10242839"
              alt="Agriscientist AI"
            />
            <div className={`${style.title} ${style.l} `}>
              <h1 className="introTitle">
                <span className="introTag">即將推出</span>
                Agriscientist AI
              </h1>
              <p className="introDescription">
                <span className="nowrap">農場的語音助理管家，</span>
                <span className="nowrap">瞭解農場資訊只需要問他。</span>
              </p>
            </div>
          </div>
        </div>
        {/* <div className={style.team}></div>
        <div className={style.product}></div> */}
      </div>
      <Bottom
        handleThemeChange={props.handleThemeChange}
        modeValue={props.modeValue}
      />
    </>
  )
}
