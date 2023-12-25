import css from './css/Preview.module.scss'
import { db } from '../firebase'
import { useState, useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import { getDoc, doc, setDoc, arrayUnion, onSnapshot } from 'firebase/firestore'
// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

export default function ProjProgress(props) {
  // 項目進度
  const [progressForm, setPregressForm] = useState(false) // 表單出現狀態
  const [progressFormTitle, setProgressFormTitle] = useState('') // 標題
  const [progressFormContent, setProgressFormContent] = useState('') // 內容
  const [progressData, setProgressData] = useState([]) // 進度內容

  // 表單內容輸入框自動換行高度
  const autoHeight = useRef()
  function autoAdjustHeight() {
    const textarea = autoHeight.current
    textarea.style.height = 'auto' // 重置高度为 auto
    textarea.style.height = textarea.scrollHeight + 'px' // 设置高度为内容的实际高度
  }

  const [sendActive, setSendActive] = useState(false) // 表單發送完成狀態
  const updateProjProgress = async (event) => {
    setSendActive(true)
    if (!progressFormTitle || !progressFormContent) {
      setSendActive(false)
      alert('請將內容填寫完整')
      return
    }
    // 發布時間設定
    const date = new Date()
    // 統整發布內容
    const postData = {
      title: progressFormTitle,
      content: progressFormContent,
      time: date,
    }

    // 資料庫預設
    const projPregressRef = doc(db, 'projPregress', 'projPregress')
    const docSnap = await getDoc(projPregressRef)

    if (docSnap.exists()) {
      // 文檔存在，獲取現有內容並合併新的內容
      const existingData = docSnap.data().data || [] // 獲取內容
      const newData = arrayUnion(...existingData, postData) // 新增內容

      // 開始發送
      setSendActive(true)
      // 使用 setDoc 更新新內容到文檔
      await setDoc(projPregressRef, {
        data: newData,
      })
    } else {
      // 文檔不存在，使用 setDoc 創建新文檔（僅用於第一次發布進度）
      setSendActive(true)
      await setDoc(projPregressRef, {
        data: [postData],
      })
    }
    setSendActive(false) // 發送完成
    // 清空表單
    setProgressFormTitle('')
    setProgressFormContent('')
    setPregressForm(false) // 關閉表單
  }

  // 顯示內容
  useEffect(() => {
    // 資料庫預設
    const projPregressRef = doc(db, 'projPregress', 'projPregress')
    // 使用 onSnapshot 監聽文檔變化
    const unsubscribe = onSnapshot(projPregressRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data().data || []
        const sortedData = [...data].sort(
          (a, b) => a.time.seconds - b.time.seconds
        )
        setProgressData(sortedData)
        console.log(docSnap.data().data)
      } else {
        // 文檔不存在
        // 暫無處理項目
      }
    })

    // 取消監聽
    return () => unsubscribe()
  }, [])

  // 進度日期格式化顯示
  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = date.toLocaleString('default', { month: 'long' })
    const day = date.getDate()

    return (
      <>
        <p className={css.year}>{year}</p>
        <p className={css.month}>{month.slice(0, 3)}</p>
        <p className={css.day}>{day}</p>
      </>
    )
  }
  return (
    <>
      <div className={css.projProgress}>
        {/* <div className={css.prog_navigate}>
          <div
            className={css.nav_block}
            onClick={() => props.navigateClick('/progress/timeLine')}>
            <p>時間線</p>
          </div>
        </div> */}
        <div className={css.progressView}>
          <div className={css.titleView}>
            <h1>最新進度</h1>
            {props.adminPermit && (
              <button
                className={css.updateProgress_btn}
                onClick={
                  progressForm
                    ? () => setPregressForm(false)
                    : () => setPregressForm(true)
                }
              >
                {progressForm ? '取消' : '發表進度'}
              </button>
            )}
          </div>
          {progressForm && (
            <div className={css.updateProgress_form}>
              <h3>進度更新</h3>
              <div className={`${css.form_block}`}>
                <p>標題</p>
                <input
                  className={progressFormTitle ? ` ${css.content}` : ''}
                  type="text"
                  value={progressFormTitle}
                  onChange={(e) => setProgressFormTitle(e.target.value)}
                  autoFocus
                ></input>
              </div>
              <div className={css.form_block}>
                <p>進度內容</p>
                <textarea
                  ref={autoHeight}
                  className={progressFormContent ? ` ${css.content}` : ''}
                  value={progressFormContent}
                  onChange={(e) => setProgressFormContent(e.target.value)}
                  onInput={() => autoAdjustHeight()}
                />
              </div>
              <button
                className={css.pubProgress_btn}
                onClick={() => updateProjProgress()}
              >
                {sendActive ? (
                  <FontAwesomeIcon icon={faSpinner} spinPulse />
                ) : (
                  '發布'
                )}
              </button>
            </div>
          )}

          {/* <img
            className={css.loadingGIF}
            src={`${process.env.PUBLIC_URL}/images/loading.gif`}
            alt="Loading..."
          /> */}
          {/* <img
            className={css.loadingGIF}
            src={`${process.env.PUBLIC_URL}/images/loading.gif`}
            alt="Loading..."
          /> */}
          {progressData.length > 0 ? (
            <div className={css.progressContentView}>
              {[...progressData].reverse().map((item) => (
                <div key={item.time}>
                  <div className={css.progress_line}>
                    <div className={css.line}></div>
                    <div className={css.dot}></div>
                  </div>
                  <div className={css.progressDate}>
                    {formatDate(item.time.toDate())}
                  </div>
                  <div className={css.progressContent}>
                    <h3>{item.title}</h3>
                    <p>{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <img
              className={css.loadingGIF}
              src={`${process.env.PUBLIC_URL}/images/loading.gif`}
              alt="Loading..."
            />
          )}
          {/* {props.adminPermit ? <p>已登入管理員</p> : <p>Error</p>} */}
        </div>
      </div>
      <Outlet />
    </>
  )
}
