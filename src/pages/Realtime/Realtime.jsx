import { Outlet } from 'react-router-dom'
import style from './Realtime.module.scss'
import Aside from '../../widgets/Aside/Aside'
import { Helmet } from 'react-helmet'

export default function Realtime() {
  const aside = [
    {
      title: '即時資訊',
      ul: [
        {
          title: '感測數據（即將棄用）',
          path: '/realtime/sensor',
        },
        {
          title: '儀表板 Beta',
          path: '/realtime/dashboard',
        },
        {
          title: '控制台',
          path: '/realtime/control',
        },
        {
          title: '農場助理',
          path: '/realtime/chat',
        },
      ],
    },
    // {
    //   title: '清華智慧農業',
    //   ul: [
    //     {
    //       title: '智慧插座',
    //       path: '/realtime/smartSwitch',
    //     },
    //   ],
    // },
  ]
  return (
    <div className={style.container}>
      <Helmet>
        <title>即時｜田野數據科學家</title>
      </Helmet>
      <Aside list={aside}></Aside>
      <div className={`${style.view} chat_container`}>
        <Outlet />
      </div>
    </div>
  )
}
