import style from './Nav.module.scss'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCaretUp,
  faLeaf,
  faMagnifyingGlassChart,
  faChartSimple,
  faInbox,
  faCube,
  faBook,
  faUsers,
  faCircleInfo,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons'

const navItems = [
  {
    title: '首頁',
    icon: faLeaf,
    path: '/',
  },
  {
    title: '即時',
    icon: faChartSimple,
    path: '/realtime/dashboard',
    child: [
      {
        title: '儀表板 Beta',
        path: '/realtime/dashboard',
      },
      {
        title: '農場助理',
        path: '/realtime/assistant',
      },
    ],
  },
  {
    title: '產品',
    icon: faCube,
    path: '/products/microfarm',
    child: [
      {
        title: 'MicroFarm',
        path: '/products/microfarm',
      },
      {
        title: 'MicroFarm Pro',
        path: '/products/microfarm-pro',
      },
    ],
  },
  {
    title: '研究',
    icon: faBook,
    path: '/researches/intro',
    child: [
      {
        title: '前言',
        path: '/researches/intro',
      },
      {
        title: 'hr',
        path: '',
      },
      {
        title: '硬體準備',
        path: '/researches/hardware',
      },
      {
        title: '軟體環境',
        path: '/researches/software',
      },
      {
        title: '農作物',
        path: '/researches/crops',
      },
      {
        title: '數據處理',
        path: '/researches/dataProcess',
      },
      {
        title: '人工智慧與機器學習',
        path: '/researches/aiml',
      },
    ],
  },
  {
    title: '關於',
    icon: faUsers,
    path: '/about',
    child: [
      {
        title: '關於我們',
        path: '/about',
      },
      {
        title: 'hr',
        path: '',
      },
      {
        title: '帳號',
        path: '/user',
      },
      {
        title: '公告',
        path: '/post',
      },
    ],
  },
]

export default function Nav(props) {
  return (
    <nav className={style.nav}>
      <div className={style.view}>
        <ul>
          {navItems.map((navItem, index) => (
            <li key={index}>
              <a href={`/#${navItem.path}`}>
                <FontAwesomeIcon icon={navItem.icon} className={style.icon} />
                <span>{navItem.title}</span>
              </a>
              {navItem.child && (
                <>
                  <FontAwesomeIcon icon={faCaretUp} className={style.more} />
                  <ul>
                    {navItem.child.map((list, index) => {
                      if (list.title === 'hr') {
                        return <hr />
                      }
                      return (
                        <li>
                          <a href={`/#${list.path}`}>
                            {list.title}
                            <FontAwesomeIcon icon={faArrowRight} />
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
