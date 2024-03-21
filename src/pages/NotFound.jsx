import css from './css/NotFound.module.css'
import { Helmet } from 'react-helmet'

export default function NotFound(props) {
  return (
    <main className={css.view}>
      <Helmet>
        <title>找不到頁面</title>
        <meta name="description" content="在網站中找不到該頁面！" />
      </Helmet>
      <h1>
        哎呀！
        <br />
        頁面找不到～
      </h1>
      <p>返回首頁吧！</p>
      <button onClick={() => window.history.back()}>首頁</button>
    </main>
  )
}
