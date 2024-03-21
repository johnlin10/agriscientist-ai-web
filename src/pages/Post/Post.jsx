import { useState, useEffect } from 'react'
import styles from './styles.module.scss'

import PageHeader from '../../widgets/PageHeader/PageHeader'
import Sheet from '../../widgets/Sheet/Sheet'

// 此頁面正在內部開發階段，尚未完成
// 此公告可供所有人查看。發布功能僅供網站管理員發布官方公告，並不對外開放發布權限。
export default function Post() {
  const [showPostEditor, setShowPostEditor] = useState(false)
  const pageHeaderActions = [
    {
      title: '發表新貼文',
      action: () => setShowPostEditor(true),
    },
  ]
  return (
    <>
      <div className={styles.view}>
        <div className={styles.container}>
          <PageHeader title="公告" description="" actions={pageHeaderActions} />
          <PostView />
        </div>
      </div>
      {showPostEditor && (
        <Sheet
          title="發布貼文"
          childenView=""
          closeAction={() => setShowPostEditor(false)}
          controls={[]}
        />
      )}
    </>
  )
}

function PosterSheetView() {
  return <div className={styles.poster}></div>
}

/**
 * 貼文串
 * @returns - 貼文串
 */
function PostView() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    setPosts([
      {
        title: 'Lorem, ipsum dolor sit amet consectetur adipisicing',
        content:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse, qui quae quidem nulla aspernatur aliquam, voluptatum necessitatibus minus odit nisi consequatur tempore exercitationem ex commodi. Perspiciatis aliquid alias consequatur. Pariatur.',
        posterName: '林昌龍',
        posterImage:
          'https://lh3.googleusercontent.com/a/AAcHTteDNaAjO0XxR4eyyd7ZBCsYZz94-8-wVp67Hrv9xyoAcxcm=s96-c',
      },
      {
        title: 'Lorem, ipsum dolor sit amet consectetur adipisicing',
        content:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse, qui quae quidem nulla aspernatur aliquam, voluptatum necessitatibus minus odit nisi consequatur tempore exercitationem ex commodi. Perspiciatis aliquid alias consequatur. Pariatur.',
        posterName: '林昌龍',
        posterImage:
          'https://lh3.googleusercontent.com/a/AAcHTteDNaAjO0XxR4eyyd7ZBCsYZz94-8-wVp67Hrv9xyoAcxcm=s96-c',
      },
      {
        title: 'Lorem, ipsum dolor sit amet consectetur adipisicing',
        content:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse, qui quae quidem nulla aspernatur aliquam, voluptatum necessitatibus minus odit nisi consequatur tempore exercitationem ex commodi. Perspiciatis aliquid alias consequatur. Pariatur.',
        posterName: '林昌龍',
        posterImage:
          'https://lh3.googleusercontent.com/a/AAcHTteDNaAjO0XxR4eyyd7ZBCsYZz94-8-wVp67Hrv9xyoAcxcm=s96-c',
      },
      {
        title: 'Lorem, ipsum dolor sit amet consectetur adipisicing',
        content:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse, qui quae quidem nulla aspernatur aliquam, voluptatum necessitatibus minus odit nisi consequatur tempore exercitationem ex commodi. Perspiciatis aliquid alias consequatur. Pariatur.',
        posterName: '林昌龍',
        posterImage:
          'https://lh3.googleusercontent.com/a/AAcHTteDNaAjO0XxR4eyyd7ZBCsYZz94-8-wVp67Hrv9xyoAcxcm=s96-c',
      },
      {
        title: 'Lorem, ipsum dolor sit amet consectetur adipisicing',
        content:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse, qui quae quidem nulla aspernatur aliquam, voluptatum necessitatibus minus odit nisi consequatur tempore exercitationem ex commodi. Perspiciatis aliquid alias consequatur. Pariatur.',
        posterName: '林昌龍',
        posterImage:
          'https://lh3.googleusercontent.com/a/AAcHTteDNaAjO0XxR4eyyd7ZBCsYZz94-8-wVp67Hrv9xyoAcxcm=s96-c',
      },
      {
        title: 'Lorem, ipsum dolor sit amet consectetur adipisicing',
        content:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse, qui quae quidem nulla aspernatur aliquam, voluptatum necessitatibus minus odit nisi consequatur tempore exercitationem ex commodi. Perspiciatis aliquid alias consequatur. Pariatur.',
        posterName: '林昌龍',
        posterImage:
          'https://lh3.googleusercontent.com/a/AAcHTteDNaAjO0XxR4eyyd7ZBCsYZz94-8-wVp67Hrv9xyoAcxcm=s96-c',
      },
      {
        title: 'Lorem, ipsum dolor sit amet consectetur adipisicing',
        content:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse, qui quae quidem nulla aspernatur aliquam, voluptatum necessitatibus minus odit nisi consequatur tempore exercitationem ex commodi. Perspiciatis aliquid alias consequatur. Pariatur.',
        posterName: '林昌龍',
        posterImage:
          'https://lh3.googleusercontent.com/a/AAcHTteDNaAjO0XxR4eyyd7ZBCsYZz94-8-wVp67Hrv9xyoAcxcm=s96-c',
      },
    ])
  }, [])
  return (
    <div className={styles.postList}>
      {posts.map((post, index) => (
        <PostBlock
          key={index}
          posterName={post.posterName}
          posterImage={post.posterImage}
          title={post.title}
          content={post.content}
        />
      ))}
    </div>
  )
}

/**
 * 貼文區塊
 * @param {string} posterName - 貼文作者名稱
 * @param {string} posterImage - 貼文作者頭貼
 * @param {string} title - 貼文標題
 * @param {string} content - 貼文內容
 * @returns - 單一文章區塊
 */
function PostBlock({ posterName, posterImage, title, content }) {
  return (
    <div className={styles.post}>
      <div className={styles.header}>
        <div className={styles.poster}>
          <img src={posterImage} alt={posterName} />
          <p>{posterName}</p>
        </div>
      </div>
      {title && <h1>{title}</h1>}
      {content && <p>{content}</p>}
    </div>
  )
}
