import style from './About.module.scss'
import Aside from '../../widgets/Aside/Aside'
import { Outlet } from 'react-router-dom'
import { Helmet } from 'react-helmet'

export default function About(props) {
  return (
    <>
      <Helmet>
        <title>關於｜田野數據科學家</title>
        <meta name="description" content="登入以進行進一步的交流" />
      </Helmet>
      <div className={style.container}>
        <div className={style.header}>
          <img src="/agriscientist-ai.ico" alt="" />
          <h1>田野數據科學家</h1>
        </div>
        <h1>關於我們</h1>
        <div className={style.intro}>
          <p>
            　　我們的專題「田野數據科學家」是一個結合了農場數據分析和語音交互的創新作品。我們利用各種感測器來收集農場的關鍵數據，如溫度、濕度、光照和土壤情況，並通過雲端技術實時監控這些數據，幫助農民自動化和優化農場管理。最特別的是，我們整合了自然語言處理技術，使得用戶可以通過語音指令輕鬆獲取農場資訊。這樣，農民就能更專注於農作物本身，提升工作效率並降低勞動強度。
          </p>
        </div>
        <h1>團隊</h1>
        <div className={style.team}>
          <div className={style.members}>
            <div className={style.people}>
              <div className={style.header}>
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/agriscientist-ai.appspot.com/o/assets%2Fimages%2Fmartin.jpeg?alt=media&token=f501a223-d021-4acb-8c59-231caa210a92"
                  alt="陳冠諺"
                />
              </div>
              <div className={style.content}>
                <p className={style.name}>陳冠諺</p>
                <p className={style.intro}>資訊管理師</p>
              </div>
            </div>
            <div className={style.people}>
              <div className={style.header}>
                <img src="/images/IMG_2809.jpeg" alt="林昌龍" />
              </div>
              <div className={style.content}>
                <p className={style.name}>林昌龍</p>
                <p className={style.intro}>軟體系統設計師</p>
              </div>
            </div>
            <div className={style.people}>
              <div className={style.header}>
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/agriscientist-ai.appspot.com/o/assets%2Fimages%2Ftailing.jpg?alt=media&token=f5d9b9bd-11ce-4d50-8273-54beaa57586b"
                  alt="趙泰齡"
                />
              </div>
              <div className={style.content}>
                <p className={style.name}>趙泰齡</p>
                <p className={style.intro}>硬體材料師</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
