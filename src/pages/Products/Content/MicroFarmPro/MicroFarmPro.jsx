import MarkdownView from '../../../../widgets/MarkdownView/MarkdownView'
import style from './MicroFarmPro.module.scss'
import { Helmet } from 'react-helmet'

export default function MicroFarmPro() {
  return (
    <>
      <Helmet>
        <title>MicroFarm Pro・產品｜田野數據科學家</title>
      </Helmet>
      <div className={style.container}>
        <MarkdownView filePath="microFarmPro" />
      </div>
    </>
  )
}
