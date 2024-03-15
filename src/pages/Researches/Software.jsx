import style from './styles/Software.module.scss'
import MarkdownView from '../../widgets/MarkdownView'
import { Helmet } from 'react-helmet'

export default function Software() {
  return (
    <div className={style.container}>
      <Helmet>
        <title>軟體・研究｜田野數據科學家</title>
      </Helmet>
      <MarkdownView filePath="software" />
    </div>
  )
}
