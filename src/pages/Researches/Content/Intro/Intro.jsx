import style from './Intro.module.scss'
import MarkdownView from '../../../../widgets/MarkdownView/MarkdownView'
import { Helmet } from 'react-helmet'

export default function ResearchesIntro(props) {
  return (
    <div className={style.container}>
      <Helmet>
        <title>前言・研究｜田野數據科學家</title>
      </Helmet>
      <MarkdownView filePath="intro" />
    </div>
  )
}
