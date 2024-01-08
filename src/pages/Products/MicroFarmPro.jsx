import style from './styles/MicroFarmPro.module.scss'
import { Helmet } from 'react-helmet'

export default function MicroFarmPro() {
  return (
    <div className={style.container}>
      <>
        <Helmet>
          <title>MicroFarm Pro・產品｜田野數據科學家</title>
        </Helmet>
        <div className={style.container}></div>
      </>
    </div>
  )
}
