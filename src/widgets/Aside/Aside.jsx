import { useEffect, useState } from 'react'
import style from './Aside.module.scss'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * 側邊欄
 * @param {Array} list - 傳遞結構與動作
 * @returns 
 * @example
  const aside = [
    {
      title: '研究',
      ul: [
        {
          title: '硬體準備',
          path: '/researches/hardware',
        },
        {
          title: '軟體環境',
          path: '/researches/software',
        },
        {
          title: '農作物',
          path: '/researches/crops',
        },
        {
          title: '數據處理',
          path: '/researches/dataProcessing',
        },
        {
          title: '人工智慧與機器學習',
          path: '/researches/aiAndMachinelearning',
        },
      ],
    },
  ]
  <Aside list={aside} />
 */
export default function Aside({ list }) {
  const location = useLocation()

  // 頁面跳轉
  const navigate = useNavigate()
  const navigateClick = (page) => {
    navigate(page)
  }
  /**
   * 檢查當前路徑是否匹配指定的路徑之一
   * @param {Array} paths - 包含多個路徑的數組
   * @returns {boolean} - 如果當前路徑與任何一個指定路徑匹配，則返回 true，否則返回 false
   */
  function checkLocation(paths) {
    return paths.some((path) => location.pathname === path)
  }

  /**
   * 滾動到大標題
   * @param {number} index - 段落索引
   */
  const moveToHeader = () => {
    const header = document.querySelector('h1.mdHeaderTitle')

    if (header) {
      setTimeout(() => {
        header.scrollIntoView({ behavior: 'smooth' })
      }, 150)
    }
  }

  /**
   * 滾動到索引的段落 - 段落標題
   * @param {number} index - 段落索引
   */
  const moveToPassage = (index) => {
    const passages = document.querySelectorAll('h2')

    if (passages && passages[index]) {
      passages[index].nextElementSibling.style.scrollMarginTop = '88px'
      setTimeout(() => {
        passages[index].nextElementSibling.scrollIntoView({
          behavior: 'smooth',
        })
      }, 150)
    }
  }

  /**
   * 滾動到索引的子段落 - 段落標題
   * @param {number} index - 段落索引
   */
  const moveToChildPassage = (index) => {
    const passages = document.querySelectorAll('h3')

    if (passages && passages[index]) {
      passages[index].style.scrollMarginTop = '96px'
      setTimeout(() => {
        passages[index].scrollIntoView({
          behavior: 'smooth',
        })
      }, 150)
    }
  }

  return (
    <aside>
      {list?.map((item, index) => (
        <div key={index}>
          <h1>{item.title}</h1>
          <ul>
            {item.ul.map((li, index) => (
              <li
                key={index}
                className={checkLocation([`${li.path}`]) ? style.actv : ''}
                onClick={() => navigateClick(li.path)}
              >
                <p>{li.title}</p>
                {li.child ? (
                  <div
                    className={checkLocation([`${li.path}`]) ? style.actv : ''}
                  >
                    {li.child.map((li, index) => (
                      <>
                        <p key={index} onClick={() => moveToPassage(index)}>
                          {li.title}
                        </p>
                        {li.child ? (
                          <div>
                            {li.child.map((li, index) => (
                              <p
                                key={index}
                                onClick={() => moveToChildPassage(index)}
                              >
                                {li.title}
                              </p>
                            ))}
                          </div>
                        ) : (
                          ''
                        )}
                      </>
                    ))}
                  </div>
                ) : (
                  ''
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  )
}
