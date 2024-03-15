import style from './styles/MicroFarm.module.scss'
import { Helmet } from 'react-helmet'
import MarkdownView from '../../widgets/MarkdownView'

export default function MicroFarm() {
  return (
    <>
      <Helmet>
        <title>MicroFarm・產品｜田野數據科學家</title>
      </Helmet>
      <div className={style.container}>
        <MarkdownView filePath="microFarm" />
      </div>
    </>
  )
}
