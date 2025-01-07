/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext } from 'react'
import { Workbox } from 'workbox-window'
import { AppContext } from './AppContext'
import { useLocation } from 'react-router-dom'
import { useNavigate, Route, Routes } from 'react-router-dom'
import css from './App.module.scss'

// Service Worker
import { serviceWorkerRegistration } from './serviceWorkerRegistration'

// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleUp } from '@fortawesome/free-solid-svg-icons'

// Pages
import Home from './pages/Home/Home'
import User from './pages/User/User'

import Realtime from './pages/Realtime/Realtime'
import Contrals from './pages/Realtime/Content/Controls/Controls'
import Sensors from './pages/Realtime/Content/Sensors/Sensors'
import Chats from './pages/Realtime/Content/Chats/Chats'
import SmartSwitch from './pages/Realtime/Content/SmartSwich/SmartSwitch'
import Dashboard from './pages/Realtime/Content/Dashboard/Dashboard'

import Products from './pages/Products/Products'
import MicroFarm from './pages/Products/Content/MicroFarm/MicroFarm'
import MicroFarmPro from './pages/Products/Content/MicroFarmPro/MicroFarmPro'

import Researches from './pages/Researches/Researches'
import Software from './pages/Researches/Content/Software/Software'
import Hardware from './pages/Researches/Content/Hardware/Hardware'
import Crops from './pages/Researches/Content/Crops/Crops'
import DataProcessing from './pages/Researches/Content/DataProcessing/DataProcessing'
import AIML from './pages/Researches/Content/AIML/AIML'
import ResearchesIntro from './pages/Researches/Content/Intro/Intro'
import About from './pages/About/About'

// import Loading from './widgets/Loading/Loading'
import NotFound from './pages/NotFound/NotFound'

// Widgets
import Nav from './widgets/Navigator/Nav'
import TermsOfUse from './pages/TermsOfUse/TermsOfUse'
import Feedback from './pages/Feedback/Feedback'
import Post from './pages/Post/Post'

// serviece worker test
function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const { adminPermit } = useContext(AppContext)

  // Service Worker 自動檢查更新
  const [updateAvailable, setUpdateAvailable] = useState(false)
  useEffect(() => {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data === 'new-sw-activated') {
        window.location.reload()
      }
    })
  }, [])

  // 檢查到新版本後，用戶需手動更新新版本
  const handleUpdate = () => {
    if (updateAvailable) {
      // 如果有新的 Service Worker 等待中，發送消息來觸發更新
      serviceWorkerRegistration.getRegistration().then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          setUpdateAvailable(false)
        }
      })
    }
  }

  // 頁面跳轉
  const navigateClick = (page) => {
    navigate(page)
  }

  // 加載狀態
  const [isLoading, setIsLoading] = useState(true)
  const [loadingAniActv, setLoadingAniActv] = useState(true)
  useEffect(() => {
    setIsLoading(true)
    // setLoadingAniActv(false)
    setTimeout(() => {
      setLoadingAniActv(true)
      setTimeout(() => {
        setLoadingAniActv(false)
        setTimeout(() => {
          setIsLoading(false)
        }, 500)
      }, 1000)
    }, 500)
  }, [])

  const [pathname, setPathname] = useState('')
  useEffect(() => {
    let page = location.pathname
    setPathname(page)
  }, [location])

  const [scrollmax, setScrollmax] = useState(false)
  useEffect(() => {
    const myElement = document.querySelector('main')

    const handleScroll = () => {
      const windowHeight = window.innerHeight
      if (myElement.scrollTop > windowHeight) {
        setScrollmax(true)
      } else {
        setScrollmax(false)
      }
    }

    if (myElement) {
      myElement.addEventListener('scroll', handleScroll)
    } else {
      setScrollmax(false)
    }

    return () => {
      if (myElement) myElement.removeEventListener('scroll', handleScroll)
    }
  }, [location])

  /**
   * 檢查當前路徑是否匹配指定的路徑之一
   * @param {Array} paths - 包含多個路徑的數組
   * @returns {boolean} - 如果當前路徑與任何一個指定路徑匹配，則返回 true，否則返回 false
   */
  function checkLocation(paths) {
    return paths.some((path) => location.pathname === path)
  }

  return (
    <>
      <div
        className={`${css.App}${scrollmax ? `` : ` ${css.isTop}`}${
          checkLocation(['/', '/preview']) ? ` ${css.isHome}` : ``
        }`}
      >
        <Nav navigateClick={navigateClick} isHome={checkLocation(['/'])} />
        <main id="main">
          <Routes>
            <Route
              path="/"
              element={
                <Home navigateClick={navigateClick} adminPermit={adminPermit} />
              }
            />

            <Route
              path="/products"
              element={<Products navigateClick={navigateClick} />}
            >
              <Route path="microfarm" element={<MicroFarm />} />
              <Route path="microfarm-pro" element={<MicroFarmPro />} />
            </Route>

            <Route
              path="/researches"
              element={
                <Researches
                  navigateClick={navigateClick}
                  adminPermit={adminPermit}
                />
              }
            >
              <Route path="intro" element={<ResearchesIntro />} />
              <Route path="software" element={<Software />} />
              <Route path="hardware" element={<Hardware />} />
              <Route path="crops" element={<Crops />} />
              <Route path="dataProcess" element={<DataProcessing />} />
              <Route path="aiml" element={<AIML />} />
            </Route>

            <Route
              path="/user"
              element={<User adminPermit={adminPermit} />}
            ></Route>
            <Route path="/post" element={<Post />}></Route>
            <Route path="/about" element={<About />}></Route>

            <Route
              path="*"
              element={<NotFound navigateClick={navigateClick} />}
            />

            <Route path="/realtime" element={<Realtime />}>
              <Route path="sensor" element={<Sensors />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="control" element={<Contrals />} />
              <Route path="assistant" element={<Chats />} />
              <Route
                path="smartSwitch"
                element={<SmartSwitch navigateClick={navigateClick} />}
              />
            </Route>
            <Route path="termsOfUse" element={<TermsOfUse />} />
            <Route path="feedback" element={<Feedback />} />
          </Routes>
        </main>

        {/* 頁面加載 */}
        {isLoading && (
          <div className={`${css.loading} ${loadingAniActv ? css.actv : ''}`}>
            <img
              className={css.loadingGIF}
              src={`${process.env.PUBLIC_URL}/images/loading.gif`}
              alt="Loading..."
            />
          </div>
        )}
        {/* 更新彈窗 */}
        {updateAvailable && (
          <div className={css.updater} data-home={location.pathname === '/'}>
            <h1>網站有新版本</h1>
            <button onClick={handleUpdate}>
              <FontAwesomeIcon
                icon={faCircleUp}
                style={{ marginRight: '6px' }}
              />
              立即更新
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default App
