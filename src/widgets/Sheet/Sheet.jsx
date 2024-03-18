import { useEffect, useState } from 'react'
import style from './style.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

/**
 * 
 * @param {*} param0 
 * @returns 
 * @example
 * const controls = [
    {
      title: "發布",
      accent: true, // 強調按鈕
      action: () => publishNotice(),
    },
  ]
 */
export default function Sheet({ title, childenView, closeAction, controls }) {
  const [pageAnimation, setPageAnimation] = useState(true)
  useEffect(() => {
    setPageAnimation(false)
  }, [])

  function closeSheet() {
    setPageAnimation(true)
    setTimeout(() => {
      closeAction()
    }, 700)
  }

  return (
    <div className={style.view}>
      <div
        className={`${style.container}${
          pageAnimation ? ` ${style.pageAnimation}` : ''
        }`}
      >
        <div className={style.header}>
          <div className={style.title}>
            <p>{title}</p>
          </div>
          <div className={style.controls}>
            {controls?.map((control, index) => (
              <button
                className={`${control.accent ? style.accent : ''}`}
                onClick={control.action}
                key={index}
              >
                {control.title}
              </button>
            ))}
            <button type="button" onClick={closeSheet}>
              <FontAwesomeIcon icon={faXmark} />
              {!controls && <span>關閉</span>}
            </button>
          </div>
        </div>
        <div className={style.content}>{childenView}</div>
      </div>
    </div>
  )
}
