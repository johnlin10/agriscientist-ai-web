import { useState, useEffect, useRef } from 'react'
import styles from './Post.module.scss'

import PageHeader from '../../widgets/PageHeader/PageHeader'
import Sheet from '../../widgets/Sheet/Sheet'
import TextInput from '../../widgets/Form/TextInput/TextInput'
import TextArea from '../../widgets/Form/TextArea/TextArea'
import MarkdownDisplay from '../../widgets/MarkdownDisplay/MarkdownDisplay'

import {
  onSnapshot,
  doc,
  deleteDoc,
  collection,
  firestore,
} from 'firebase/firestore'
import { db, writeFirestoreDoc, getFirestoreData } from '../../firebase'

import { useContext } from 'react'
import { AppContext } from '../../AppContext'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import Loading from '../../widgets/Loading/Loading'

// 此公告可供所有人查看。發布功能僅供網站管理員發布官方公告，並不對外開放發布權限。
export default function Post() {
  const { user, adminPermit } = useContext(AppContext)
  // 發布文章彈窗狀態
  const [showPostEditor, setShowPostEditor] = useState(false)
  const [postEditorTitle, setPostEditorTitle] = useState('發布貼文')

  // 發布貼文 Markdown 編輯內容
  const [editMarkdownContent, setEditMarkdownContent] = useState('')
  // Markdown 預覽狀態
  const [markdownPreview, setMarkdownPreview] = useState(false)
  // 當前 Markdown 文檔 id
  const [markdownDocId, setMarkdownDocId] = useState()

  // 頁面頂部操作按鈕
  const pageHeaderActions = [
    {
      title: '發表新貼文',
      action: () => setShowPostEditor(true),
      auth: adminPermit,
    },
  ]

  // 發布貼文
  async function publishPost() {
    if (!editMarkdownContent) return

    const timestamp = new Date(new Date().getTime() + 8 * 60 * 60 * 1000)
    const time = timestamp
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, -3)

    const post = {
      posterName: user.displayName,
      posterImage: user.photoURL,
      content: editMarkdownContent,
      timestamp: timestamp,
    }

    if (!markdownDocId) {
      // 新貼文無 Id，則以新時間作為 Id 並發布貼文
      await writeFirestoreDoc(`post/${time}`, post, false)
    } else if (markdownDocId) {
      await writeFirestoreDoc(`post/${markdownDocId}`, post, true)
    }

    // 重置參數
    resetParam()
  }

  // 重置參數
  function resetParam() {
    setEditMarkdownContent()
    setShowPostEditor(false)
    setMarkdownDocId()
    setPostEditorTitle('發布貼文')
    setShowPostEditor(false)
    setMarkdownPreview(false)
  }

  // 將 MD 預覽中的 code 區塊下一段文字樣式設定為 code 區塊的補充資訊欄
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
  }, [markdownPreview])

  return (
    <>
      <div className={styles.view}>
        <div className={styles.container}>
          <PageHeader title="公告" description="" actions={pageHeaderActions} />
          <PostView
            setEditMarkdownContent={setEditMarkdownContent}
            setShowPostEditor={setShowPostEditor}
            setMarkdownDocId={setMarkdownDocId}
            setPostEditorTitle={setPostEditorTitle}
          />
        </div>
      </div>
      {showPostEditor && (
        <Sheet
          title={postEditorTitle}
          childenView={
            markdownPreview ? (
              <div className={styles.markdownPreview}>
                <MarkdownDisplay content={editMarkdownContent} />
              </div>
            ) : (
              <PosterSheetView
                postContent={editMarkdownContent}
                setPostContent={setEditMarkdownContent}
              />
            )
          }
          closeAction={() => resetParam()}
          controls={[
            {
              title: '預覽 Markdown',
              action: () => setMarkdownPreview(!markdownPreview),
            },
            {
              title: '發布',
              accent: true, // 強調按鈕
              action: () => publishPost(),
            },
          ]}
        />
      )}
    </>
  )
}

/**
 * 貼文串
 * @returns - 貼文串
 */
function PostView({
  setEditMarkdownContent,
  setShowPostEditor,
  setMarkdownDocId,
  setPostEditorTitle,
}) {
  const [posts, setPosts] = useState([])

  const handleEdit = (content, docId) => {
    setEditMarkdownContent(content)
    setShowPostEditor(true)
    setMarkdownDocId(docId)
    setPostEditorTitle('編輯貼文')
  }

  /**
   * 刪除指定 ID 的貼文
   * @param {string} docId - 貼文 ID
   */
  const handleDelete = async (docId) => {
    const docRef = doc(db, 'post', docId)
    try {
      // 刪除該文檔
      await deleteDoc(docRef)
      console.log(`Document with ID ${docId} has been deleted.`)
    } catch (error) {
      // 處理可能發生的錯誤
      console.error('Error deleting document: ', error)
    }
  }

  useEffect(() => {
    const collectionRef = collection(db, 'post')

    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        const newDocsData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
        // 使用 setDocsData 更新您的應用狀態或界面
        setPosts(newDocsData)
      },
      (err) => {
        console.log(`Encountered error: ${err}`)
      }
    )

    // 清理函數
    return () => unsubscribe()
  }, [])

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
  }, [posts])

  return (
    <div className={styles.postList}>
      {posts.length > 0 ? (
        posts.map((post) => (
          <PostBlock
            key={post.id}
            posterName={post.posterName}
            posterImage={post.posterImage}
            content={post.content}
            onEdit={() => handleEdit(post.content, post.id)}
            onDelete={() => handleDelete(post.id)}
          />
        ))
      ) : (
        <Loading loadingAniActv={true} type="local" />
      )}
    </div>
  )
}

/**
 * 貼文串 中的 貼文區塊
 * @param {string} posterName - 貼文作者名稱
 * @param {string} posterImage - 貼文作者頭貼
 * @param {string} title - 貼文標題
 * @param {string} content - 貼文內容
 * @returns - 單一文章區塊
 */
function PostBlock({ posterName, posterImage, content, onEdit, onDelete }) {
  const { adminPermit } = useContext(AppContext)
  const markdownRef = useRef(null)
  const moreBtnRef = useRef(null)
  const [showMore, setShowMore] = useState(false)

  const handleShowMore = () => {
    if (markdownRef.current) {
      if (!markdownRef.current.classList.contains('more')) {
        markdownRef.current.classList.add('more')
        moreBtnRef.current.classList.add('bottom')
        setShowMore(true)
      } else {
        markdownRef.current.classList.remove('more')
        moreBtnRef.current.classList.remove('bottom')
        setShowMore(false)
        // moreBtnRef.current.scrollIntoView({
        //   behavior: 'auto',
        //   block: 'center',
        //   inline: 'center',
        // })
      }
    }
  }

  return (
    <div className={styles.post}>
      <div className={styles.header}>
        <div className={styles.poster}>
          <img src={posterImage} alt={posterName} />
          <p>{posterName}</p>
        </div>
        <div className={styles.actions}>
          {adminPermit && (
            <>
              <button onClick={() => onEdit(content)}>
                <FontAwesomeIcon icon={faPen} />
              </button>
              <button onClick={() => onDelete()}>
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </>
          )}
        </div>
      </div>
      <div className={styles.markdownDisplay} ref={markdownRef}>
        <MarkdownDisplay content={content} />

        <button
          ref={moreBtnRef}
          className={styles.showMoreBtn}
          onClick={() => handleShowMore()}
        >
          {showMore ? '收起' : '展開更多'}
        </button>
      </div>
    </div>
  )
}

function PosterSheetView({ postContent, setPostContent }) {
  return (
    <div className={styles.poster}>
      <div className={styles.contentInput}>
        <TextArea
          title="貼文內容"
          value={postContent}
          onchange={setPostContent}
        />
      </div>
    </div>
  )
}
