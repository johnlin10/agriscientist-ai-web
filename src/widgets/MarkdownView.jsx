import style from './css/MarkdownView.module.scss'
import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { onSnapshot, doc } from 'firebase/firestore'
import { db, auth, app, writeFirestoreDoc, getFirestoreData } from '../firebase'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/panda-syntax-dark.css'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { useContext } from 'react'
import { AppContext } from '../AppContext'

import Loading from './Loading'

export default function MarkdownView({ filePath }) {
  const { adminPermit } = useContext(AppContext)
  const [markdown, setMarkdown] = useState()
  const [editMarkdown_actv, setEditMarkdown_actv] = useState(false)
  const [editingMarkdown, setEditingMarkdown] = useState()

  // useEffect(() => {
  //   if (filePath) {
  //     fetch(`/docs/${filePath}.md`)
  //       .then((res) => res.text())
  //       .then((text) => setMarkdown(text));
  //   }
  // }, [filePath]);

  useEffect(() => {
    const md_doc_ref = doc(db, `docs/${filePath}`)
    const unsubscribe = onSnapshot(md_doc_ref, async (doc) => {
      if (doc.data()) {
        const md = doc.data().doc
        setMarkdown(md)
        if (!editingMarkdown) setEditingMarkdown(md)
      } else {
        setMarkdown(`找不到文檔：docs/${filePath}`)
        console.log(`找不到文檔：docs/${filePath}`)
      }
    })
    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const md_view = document.querySelector('.markdownView')
    if (markdown && md_view) {
      const md_headerTitle = md_view.querySelector('h1')
      if (md_headerTitle) md_headerTitle.classList.add('mdHeaderTitle')
    }
  }, [markdown, editingMarkdown])

  useEffect(() => {
    const h2Elements = document.querySelectorAll('h2')
    if (h2Elements.length > 0) {
      h2Elements.forEach((h2Element) => {
        h2Element.id = `#${h2Element.textContent}`
      })
    }
  }, [markdown, editingMarkdown])

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
  }, [markdown, editingMarkdown])

  const saveMarkdown = async () => {
    const md_headerTitle_content = document
      .querySelector('.markdownView')
      .querySelector('h1').textContent
    await writeFirestoreDoc(
      `docs/${filePath}`,
      { title: md_headerTitle_content, doc: editingMarkdown },
      false
    )
  }

  const editToMarkdown = () => {
    if (!editMarkdown_actv) {
      setEditMarkdown_actv(true)
      setEditingMarkdown(markdown)
    } else {
      setEditMarkdown_actv(false)
    }
  }

  return (
    <>
      <div
        className={`${style.view}${
          editMarkdown_actv ? ` ${style.edit}` : ''
        } markdownView`}
      >
        <div className={style.markdown}>
          {markdown ? (
            <ReactMarkdown
              remarkPlugins={[gfm, remarkMath]}
              rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
              components={{ a: LinkRenderer }}
            >
              {editMarkdown_actv ? editingMarkdown : markdown}
            </ReactMarkdown>
          ) : (
            <Loading loadingAniActv={true} type="local" />
          )}
        </div>
        {editMarkdown_actv && (
          <EditMarkdown
            editingMarkdown={editingMarkdown}
            setEditingMarkdown={setEditingMarkdown}
          />
        )}
      </div>

      {adminPermit && (
        <div className={style.buttons}>
          {editingMarkdown !== markdown && (
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
            {editMarkdown_actv ? '取消' : '編輯'}
          </button>
        </div>
      )}
    </>
  )
}

function EditMarkdown(props) {
  return (
    <div className={style.editMarkdown}>
      <textarea
        name=""
        id=""
        onChange={(e) => props.setEditingMarkdown(e.target.value)}
      >
        {props.editingMarkdown}
      </textarea>
    </div>
  )
}

function LinkRenderer(props) {
  return (
    <a href={props.href} target="_blank" rel="noreferrer">
      {props.children}
    </a>
  )
}
