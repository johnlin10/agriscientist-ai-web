import style from './Chats.module.scss'
import { db } from '../../../../firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import TestingBlock from '../../../../widgets/TestingNoticeBlock/TestingNoticeBlock'

export default function Chats(props) {
  const [chat_history, setChat_history] = useState([])
  const [assistanStatus, setAssistantStatus] = useState(false)
  const [KEEP_RECENT, setKEEP_RECENT] = useState(0)
  const sensorsDataRef = doc(db, 'chat', 'chat_history')
  const assistanStatusRef = doc(db, 'chat', 'assistant_status')

  // 感測器數據即時同步
  useEffect(() => {
    const unsubscribe = onSnapshot(sensorsDataRef, (docSnap) => {
      const messages = docSnap.data().messages
      setChat_history(messages)
      setKEEP_RECENT(docSnap.data().KEEP_RECENT)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onSnapshot(assistanStatusRef, (docSnap) => {
      const status = docSnap.data().status
      setAssistantStatus(status)
      console.log(status)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    const newChat = document.querySelectorAll('.chat_block')
    if (newChat.length > 0) {
      setTimeout(() => {
        newChat[newChat.length - 1].scrollIntoView({ behavior: 'smooth' })
      }, 150)
    }
  }, [chat_history])

  const [isFirstChatLoad, setIsFirstChatLoad] = useState(true)
  useEffect(() => {
    const chatBlocks = document.querySelectorAll('.chat_block')
    // 假设最新的消息在数组的开头
    if (chatBlocks.length > 0) {
      chatBlocks[chatBlocks.length - 1].classList.add('animation')
      if (isFirstChatLoad) {
        for (let i = 0; i < chatBlocks.length - 1; i++) {
          chatBlocks[i].classList.add('animation_other')
        }
        setIsFirstChatLoad(false)
      }

      setTimeout(() => {
        // 给其他元素移除.show类
        for (let i = 0; i < chatBlocks.length; i++) {
          chatBlocks[i].classList.remove('animation')
          chatBlocks[i].classList.remove('animation_other')
        }
      }, 100)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat_history])

  // 打字機效果函數
  const typeWriterEffect = (text, element, index = 0) => {
    if (index < text.length) {
      element.textContent += text.charAt(index)

      // 當距離底部小於 50px ，滚动到底部
      if (shouldScrollToBottom()) {
        element.scrollIntoView({ behavior: 'smooth' })
      }

      const delay = Math.random() * (200 - 100) + 50
      setTimeout(() => typeWriterEffect(text, element, index + 1), delay)
    }
  }

  // 檢查頁面是否距離底部超過 50px
  const shouldScrollToBottom = () => {
    const chat_container = document.querySelector('.chat_container')
    if (chat_container) {
      const totalPageHeight = chat_container.scrollHeight
      const viewportHeight = chat_container.clientHeight
      const scrollPosition = chat_container.scrollTop
      return totalPageHeight - (viewportHeight + scrollPosition) <= 50
    }
  }

  useEffect(() => {
    // 在 chat_history 更新後執行打字機效果
    const chatBlocks = document.querySelectorAll('.chat_block p')
    if (chatBlocks.length > 0) {
      const lastChatBlock = chatBlocks[chatBlocks.length - 1]
      lastChatBlock.textContent = '' // 清空原有內容
      setTimeout(() => {
        typeWriterEffect(
          chat_history[chat_history.length - 1].content,
          lastChatBlock
        )
      }, 400)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat_history])

  return (
    <div className={`${style.container}`}>
      <Helmet>
        <title>農場助理｜田野數據科學家</title>
      </Helmet>
      <TestingBlock title="服務暫停中" description="正在最佳化對話體驗。" />
      <div
        className={`${style.assistant}${
          assistanStatus === 'true' ? ` ${style.actv}` : ''
        }${assistanStatus === 'loading' ? ` ${style.loading}` : ''}`}
      >
        <div
          className={`${style.circle}${
            assistanStatus === 'loading' ? ` ${style.loading}` : ''
          }`}
        ></div>
        <div
          className={`${style.circle}${
            assistanStatus === 'loading' ? ` ${style.loading}` : ''
          }`}
        ></div>
        <div
          className={`${style.circle}${
            assistanStatus === 'loading' ? ` ${style.loading}` : ''
          }`}
        ></div>
        <div
          className={`${style.circle}${
            assistanStatus === 'loading' ? ` ${style.loading}` : ''
          }`}
        ></div>
        <div
          className={`${style.circle}${
            assistanStatus === 'loading' ? ` ${style.loading}` : ''
          }`}
        ></div>
      </div>
      {chat_history && chat_history.length > 0
        ? chat_history.map((item, index) => {
            // eslint-disable-next-line array-callback-return
            if (index < KEEP_RECENT) return
            return (
              <div
                className={`chat_block ${style.chat_block}${
                  index < KEEP_RECENT ? ` ${style.expire}` : ''
                }${item.role === 'user' ? ` ${style.user}` : ''}`}
                key={index}
              >
                <span>
                  {item.role === 'assistant'
                    ? '專題助理'
                    : item.role === 'user'
                    ? '用戶'
                    : ''}
                </span>
                {item.audio_url && item.role === 'assistant' ? (
                  <audio src={item.audio_url} controls></audio>
                ) : item.role === 'assistant' ? (
                  <span className={style.noAudio}>無音訊</span>
                ) : (
                  ''
                )}
                <p>{item.content}</p>
              </div>
            )
          })
        : ''}
    </div>
  )
}
