import style from './css/MarkdownView.module.scss'
// import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { onSnapshot, doc } from 'firebase/firestore'
import { db, writeFirestoreDoc } from '../firebase'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/panda-syntax-dark.css'
import { useContext } from 'react'
import { AppContext } from '../AppContext'

import Loading from './Loading'

/**
 * Markdown 顯示與編輯模組
 * @param {string} filePath - Markdown 文檔在 Firestore 上的路徑
 * @returns
 */
export default function MarkdownView({ filePath }) {
  const { adminPermit } = useContext(AppContext)
  const [markdownContent, setMarkdown] = useState()
  const [isEditing, setIsEditing] = useState(false)
  const [editMarkdownContent, setEditingMarkdown] = useState()

  // 在資料庫中搜尋 filePath 路徑的 Markdown 文檔
  useEffect(() => {
    const md_doc_ref = doc(db, `docs/${filePath}`)
    const unsubscribe = onSnapshot(md_doc_ref, async (doc) => {
      if (doc.data()) {
        const md = doc.data().doc
        setMarkdown(md)
        if (!editMarkdownContent) setEditingMarkdown(md)
      } else {
        setMarkdown(`找不到文檔：docs/${filePath}`)
        console.log(`找不到文檔：docs/${filePath}`)
      }
    })
    return () => unsubscribe()
  }, [editMarkdownContent, filePath])

  // 為 H1 大標題 classList 添加 mdHeaderTitle
  useEffect(() => {
    const md_view = document.querySelector('.markdownView')
    if (markdownContent && md_view) {
      const md_headerTitle = md_view.querySelector('h1')
      if (md_headerTitle) md_headerTitle.classList.add('mdHeaderTitle')
    }
  }, [markdownContent, editMarkdownContent])

  // 將 H2 標題的 id 設定為自身內容
  useEffect(() => {
    const h2Elements = document.querySelectorAll('h2')
    if (h2Elements.length > 0) {
      h2Elements.forEach((h2Element) => {
        h2Element.id = `#${h2Element.textContent}`
      })
    }
  }, [markdownContent, editMarkdownContent])

  // 將 code 區塊下一段文字樣式設定為 code 區塊的補充資訊欄
  useEffect(() => {
    const preElements = document.querySelectorAll('pre')
    const pElements = document.querySelectorAll('p')
    if (pElements) {
      pElements.forEach((pElements) => {
        pElements.classList.remove('codeSource')
      })
    }
    if (preElements) {
      preElements.forEach((preElement) => {
        const nextElement = preElement.nextElementSibling
        if (nextElement && nextElement.tagName === 'P') {
          nextElement.classList.add('codeSource')
        }
      })
    }
  }, [markdownContent, editMarkdownContent])

  // 將以編輯內容存入雲端
  const saveMarkdown = async () => {
    // 尋找文檔標題
    const mdHeaderTitleContent = document
      .querySelector('.markdownView')
      .querySelector('h1').textContent

    // 將已編輯內容儲存到雲端
    await writeFirestoreDoc(
      `docs/${filePath}`,
      { title: mdHeaderTitleContent, doc: editMarkdownContent },
      false
    )
  }

  // 切換 Markdown 編輯模式
  const editToMarkdown = () => {
    if (!isEditing) {
      setIsEditing(true)
      setEditingMarkdown(markdownContent)
    } else {
      setIsEditing(false)
    }
  }

  return (
    <>
      <div
        className={`${style.view}${
          isEditing ? ` ${style.edit}` : ''
        } markdownView`}
      >
        <div className={style.markdown}>
          {markdownContent ? (
            <ReactMarkdown
              remarkPlugins={[gfm, remarkMath]}
              rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
              components={{ a: LinkRenderer }}
            >
              {isEditing ? editMarkdownContent : markdownContent}
            </ReactMarkdown>
          ) : (
            <Loading loadingAniActv={true} type="local" />
          )}
        </div>
        {isEditing && (
          <EditMarkdownView
            editMarkdownContent={editMarkdownContent}
            setEditingMarkdown={setEditingMarkdown}
          />
        )}
      </div>

      {adminPermit && (
        <div className={style.buttons}>
          {editMarkdownContent !== markdownContent && (
            <button
              className={style.save}
              type="button"
              onClick={() => saveMarkdown()}
            >
              儲存
            </button>
          )}
          <button
            className={style.edit}
            type="button"
            onClick={() => editToMarkdown()}
          >
            {isEditing ? '取消' : '編輯'}
          </button>
        </div>
      )}
    </>
  )
}

// Markdown 文本編輯窗口
function EditMarkdownView(props) {
  return (
    <div className={style.editMarkdown}>
      <textarea
        name=""
        id=""
        onChange={(e) => props.setEditingMarkdown(e.target.value)}
      >
        {props.editMarkdownContent}
      </textarea>
    </div>
  )
}

// 自訂義連結文字樣式（target設定為blank）
function LinkRenderer(props) {
  return (
    <a href={props.href} target="_blank" rel="noreferrer">
      {props.children}
    </a>
  )
}
