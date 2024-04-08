import style from './AIML.module.scss'
import MarkdownView from '../../../../widgets/MarkdownView/MarkdownView'
import { Helmet } from 'react-helmet'

export default function AIML(props) {
  return (
    <div className={style.container}>
      <Helmet>
        <title>人工智慧與機器學習・研究｜田野數據科學家</title>
      </Helmet>
      <MarkdownView filePath="aiAndMachinelearning" />
    </div>
  )
}
