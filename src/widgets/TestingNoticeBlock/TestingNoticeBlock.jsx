import style from './TestingNoticeBlock.module.scss'

export default function TestingBlock({ title, description }) {
  return (
    <div className={style.container}>
      <h1>{title ? title : '系統維護中...'}</h1>
      {description && <p>{description}</p>}
    </div>
  )
}
