import styles from './MarkdownDisplay.module.scss'
// import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/panda-syntax-dark.css'

export default function MarkdownDisplay({ content }) {
  return (
    <div className={styles.container}>
      <div className={styles.markdown}>
        <ReactMarkdown
          remarkPlugins={[gfm, remarkMath]}
          rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
          components={{ a: LinkRenderer }}
        >
          {content}
        </ReactMarkdown>
      </div>
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
