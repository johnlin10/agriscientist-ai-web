import MarkdownView from '../../widgets/MarkdownView'
import style from './style.module.scss'

export default function TermsOfUse() {
  return (
    <div className={style.view}>
      <div className={style.container}>
        <MarkdownView filePath="termsOfUse" />
      </div>
    </div>
  )
}
