import style from './Hardware.module.scss'
import MarkdownView from '../../../../widgets/MarkdownView/MarkdownView'
import { Helmet } from 'react-helmet'

export default function Hardware(props) {
  return (
    <div className={style.container}>
      <Helmet>
        <title>硬體・研究｜田野數據科學家</title>
      </Helmet>
      <MarkdownView filePath="hardware" />
    </div>
  )
}
