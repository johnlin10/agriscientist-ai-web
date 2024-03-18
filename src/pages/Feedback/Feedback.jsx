import MarkdownView from '../../widgets/MarkdownView'
import style from './style.module.scss'
import Sheet from '../../widgets/Sheet/Sheet'
import { useState } from 'react'

export default function Feedback() {
  const [showFeedbackSheet, setShowFeedbackSheet] = useState(false)
  const feedbackControls = [
    {
      title: '發布',
      accent: true, // 強調按鈕
      action: () => {},
    },
  ]
  return (
    <>
      <div className={style.view}>
        <div className={style.container}>
          <MarkdownView filePath="feedbackDescription" />
          <button onClick={() => setShowFeedbackSheet(true)}>進行反饋</button>
        </div>
      </div>
      {showFeedbackSheet && (
        <Sheet
          title="問題反饋"
          childenView=""
          closeAction={() => setShowFeedbackSheet(false)}
          controls={feedbackControls}
        />
      )}
    </>
  )
}
