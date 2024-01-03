import style from './styles/MicroFarm.module.scss'
import { Helmet } from 'react-helmet'

export default function MicroFarm(props) {
  return (
    <>
      <Helmet>
        <title>MicroFarm・產品｜田野數據科學家</title>
      </Helmet>
      <div className={style.container}></div>
    </>
  )
}
