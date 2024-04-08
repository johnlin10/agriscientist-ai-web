import MarkdownView from '../../widgets/MarkdownView/MarkdownView'
import style from './TermsOfUse.module.scss'

export default function TermsOfUse() {
  return (
    <div className={style.view}>
      <div className={style.container}>
        <MarkdownView filePath="termsOfUse" />
      </div>
    </div>
  )
}
