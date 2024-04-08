import TestingBlock from '../../../../widgets/TestingNoticeBlock/TestingNoticeBlock'
import style from './Controls.module.scss'
import { Helmet } from 'react-helmet'

export default function Contrals() {
  return (
    <>
      <Helmet>
        <title>感測數據｜田野數據科學家</title>
      </Helmet>
      <TestingBlock title="正在建設控制系統..." />
      <div className={style.container}>
        <div className={style.control_block}></div>
      </div>
    </>
  )
}
