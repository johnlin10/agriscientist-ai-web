import style from './Crops.module.scss'
import MarkdownView from '../../../../widgets/MarkdownView/MarkdownView'
import { Helmet } from 'react-helmet'

export default function Crops(props) {
  return (
    <div className={style.container}>
      <Helmet>
        <title>農作・研究｜田野數據科學家</title>
      </Helmet>
      <MarkdownView filePath="crops" />
    </div>
  )
}
