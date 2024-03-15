/* eslint-disable jsx-a11y/alt-text */
import style from './css/Bottom.module.scss'
import { useLocation, useNavigate } from 'react-router-dom'

// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopyright, faArrowRight } from '@fortawesome/free-solid-svg-icons'

export default function Bottom(props) {
  const location = useLocation()
  const pageLinks = [
    {
      title: 'About',
      path: '/about',
      class: style.aboutUs,
      child: [
        { title: '關於我們', path: '/about/us' },
        { title: '我們的理念', path: '/about/concept' },
      ],
    },
    {
      title: 'Products',
      path: '/products',
      class: style.product,
      child: [
        { title: 'MicroFarm', path: '/products/microfarm' },
        { title: 'MicroFarm Pro', path: '/products/microfarm-pro' },
      ],
    },
    {
      title: 'Research',
      path: '/researches',
      class: style.researches,
      child: [
        { title: '硬體', path: '/researches/hardware' },
        { title: '軟體', path: '/researches/software' },
        { title: '農作', path: '/researches/crops' },
        { title: '數據', path: '/researches/dataProcessing' },
        {
          title: '人工智慧與機器學習',
          path: '/researches/aiAndMachinelearning',
        },
      ],
    },
    {
      title: 'Open Source',
      path: '',
      class: style.openSource,
      child: [
        {
          title: 'Raspberry Pi',
          path: 'https://github.com/johnlin10/agriscientist-ai-raspberrypi',
        },
        {
          title: 'Website',
          path: 'https://github.com/johnlin10/agriscientist-ai-web',
        },
      ],
    },
    {
      title: 'Docs',
      path: '',
      class: style.docs,
      child: [
        {
          title: '研究小論文',
          path: 'https://firebasestorage.googleapis.com/v0/b/agriscientist-ai.appspot.com/o/assets%2Fdocs%2F田野數據科學家_小論文v1.0.2（最終版）.pdf?alt=media&token=356784e8-0158-4584-a0b3-d96c3f5e5d5d',
        },
      ],
    },
  ]

  // 頁面跳轉
  const navigate = useNavigate()
  const navigateClick = (page) => {
    navigate(page)
  }

  return (
    <div className={`${style.container}`}>
      <div className={style.view}>
        <div className={style.header}>
          <div className={style.title}>
            <img
              src={`${process.env.PUBLIC_URL}/agriscientist-ai.ico`}
              alt=""
            />
            <h1>田野數據科學家</h1>
          </div>
        </div>
        <div className={style.navigation}>
          {pageLinks.map((item, index) => (
            <div className={item.class} key={index}>
              <p>{item.title}</p>
              <ul>
                {item.child?.map((child, index) => (
                  <li
                    onClick={() =>
                      child.path.includes('https://')
                        ? window.open(child.path)
                        : navigateClick(child.path)
                    }
                    key={index}
                  >
                    {child.title}
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      style={{
                        transform: child.path.includes('https://')
                          ? 'rotate(-45deg)'
                          : '',
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* <button
          className={style.themeChange}
          type="button"
          onClick={() => props.handleThemeChange()}
        >
          {props.modeValue[0]}
          {` `}
          {props.modeValue[1]}
          {` `}(Beta)
        </button> */}
        <div className={style.copyRight}>
          <div>
            <p>
              Copyright © 2023-2024{' '}
              <span
                className={style.link}
                onClick={() => window.open('https://johnlin.web.app')}
              >
                Johnlin
              </span>{' '}
              保留一切權利。{' '}
              <span
                className={style.link}
                onClick={() => navigateClick('/termsOfUse')}
              >
                使用條款
              </span>{' '}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
