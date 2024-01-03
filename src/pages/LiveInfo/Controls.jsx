import style from './style/Controls.module.scss'
import { Helmet } from 'react-helmet'

export default function Contrals() {
  return (
    <>
      <Helmet>
        <title>感測數據｜田野數據科學家</title>
      </Helmet>
      <div className={style.container}>
        <div className={style.control_block}>
          <h1>控制系統建置中...</h1>
        </div>
      </div>
    </>
  )
}
