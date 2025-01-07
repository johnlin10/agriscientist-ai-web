import style from './Nav.module.scss'
import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCaretUp,
  faLeaf,
  faChartSimple,
  faCube,
  faBook,
  faUsers,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'

const navItems = [
  {
    title: '首頁',
    icon: faLeaf,
    basePath: '/',
    path: '/',
  },
  {
    title: '即時',
    icon: faChartSimple,
    basePath: '/realtime',
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
    basePath: '/products',
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
    basePath: '/researches',
    path: '/researches/intro',
    child: [
      {
        title: '前言',
        path: '/researches/intro',
      },
      {
        title: 'hr',
        basePath: '',
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
    basePath: '/about',
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

export default function Nav() {
  const location = useLocation()
  const [navBarPosition, setNavBarPosition] = useState(0)

  // 讓 navBar 根據頁面的 location 改鰾定位ㄋ
  useEffect(() => {
    let index = 0
    navItems.forEach((navItem, i) => {
      if (navItem.path === '/') {
        if (location.pathname === navItem.path) {
          index = i
        } else if (
          location.pathname === '/user' ||
          location.pathname === '/post'
        ) {
          index = 4
        }
      } else if (location.pathname.startsWith(navItem.basePath)) {
        index = i
      }
    })
    setNavBarPosition(index)
  }, [location])

  return (
    <nav className={style.nav}>
      <div className={style.view}>
        <ul>
          <div className={style.navBar} data-position={navBarPosition}></div>
          {navItems.map((navItem, index) => (
            <li
              key={index}
              className={navBarPosition === index ? style.actv : ''}
            >
              <Link to={`${process.env.PUBLIC_URL}${navItem.path}`}>
                <FontAwesomeIcon icon={navItem.icon} className={style.icon} />
                <span>{navItem.title}</span>
              </Link>
              {navItem.child && (
                <>
                  <FontAwesomeIcon icon={faCaretUp} className={style.more} />
                  <ul>
                    {navItem.child.map((list, index) => {
                      if (list.title === 'hr') {
                        return <hr key={index} />
                      }
                      return (
                        <li key={index}>
                          <Link to={`${process.env.PUBLIC_URL}${list.path}`}>
                            {list.title}
                            <FontAwesomeIcon icon={faArrowRight} />
                          </Link>
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
