/* eslint-disable no-unused-vars */
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useContext,
} from 'react'
import { AppContext } from './AppContext'
import { useLocation } from 'react-router-dom'
import { useNavigate, Navigate, Route, Routes, Outlet } from 'react-router-dom'
import css from './App.module.scss'
// Service Worker
import { serviceWorkerRegistration } from './serviceWorkerRegistration'
import { getRegistration } from './serviceWorkerRegistration'
// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faSun,
  faMoon,
  faCircleHalfStroke,
  faCircleUp,
  faCircleUser,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons'
// Pages
import Home from './pages/Home'
import Preview from './pages/Preview'
import User from './pages/User' //
import NotFound from './pages/NotFound'
import ProjProgress from './pages/ProjProgress'
import TimeLine from './pages/TimeLine'
import Realtime from './pages/Realtime/Realtime'
import Contrals from './pages/LiveInfo/Controls'
import Sensors from './pages/LiveInfo/Sensors'
import Chats from './pages/LiveInfo/Chats'
import SmartSwitch from './pages/SmartSwitch'
import Products from './pages/Products'
import MicroFarm from './pages/Products/MicroFarm'
import MicroFarmPro from './pages/Products/MicroFarmPro'
import Researches from './pages/Researches'
import Software from './pages/Researches/Software'
import Hardware from './pages/Researches/Hardware'
import Crops from './pages/Researches/Crops'
import DataProcessing from './pages/Researches/DataProcessing'
import AIML from './pages/Researches/AIML'
import ResearchesIntro from './pages/Researches/Intro'
import About from './pages/About'

import Loading from './widgets/Loading'

import { ParallaxProvider, Parallax } from 'react-scroll-parallax'

import Nav from './widgets/Nav'
import TermsOfUse from './pages/TermsOfUse/TermsOfUse'
import Feedback from './pages/Feedback/Feedback'
import Dashboard from './pages/Realtime/DataView/Dashboard'
import Post from './pages/Post/Post'

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const contextValue = useContext(AppContext)

  const { user, adminPermit } = useContext(AppContext)
  // console.log(user);

  // Service Worker 自動檢查更新
  const [updateAvailable, setUpdateAvailable] = useState(false)
  useEffect(() => {
    const intervalId = setInterval(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register(`/service-worker.js`)
          .then((registration) => {
            registration.update()
            console.log(
              'ServiceWorker 註冊成功！ 管轄範圍：',
              registration.scope
            )
            // 檢查是否有新版本可用
            if (registration.waiting) {
              setUpdateAvailable(true)
            }
            registration.addEventListener('updatefound', () => {
              const installingWorker = registration.installing
              if (installingWorker) {
                installingWorker.addEventListener('statechange', () => {
                  if (
                    installingWorker.state === 'installed' &&
                    navigator.serviceWorker.controller
                  ) {
                    // 提示用戶更新
                    setUpdateAvailable(true)
                  }
                })
              }
            })
            // 當新版本可用時觸發
            serviceWorkerRegistration.register({
              onUpdate: () => {
                // 提示用戶更新
                setUpdateAvailable(true)
              },
            })
          })
          .catch((error) => {
            console.log('ServiceWorker 註冊失敗：', error)
          })
      }
    }, 2500)

    return () => clearInterval(intervalId)
  }, [])

  // 檢查到新版本後，用戶需手動更新新版本
  const handleUpdate = async () => {
    const registration = await getRegistration()
    if (registration && registration.waiting) {
      // 強制激活新版本
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      setUpdateAvailable(false)
      window.location.reload(true)
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
    // window.addEventListener('load', () => {
    // })
  }, [])

  // 外觀模式切換
  const [theme, setTheme] = useState()
  const [themeMode, setThemeMode] = useState(() => {
    const savedThemeMode = localStorage.getItem('themeMode')
    return savedThemeMode !== null ? 0 : 0 // 預設為「根據系統」 parseInt(savedThemeMode)
  })
  const [modeValue, setModeValue] = useState([])
  // 監測系統外觀模式變化
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)')
  // 變更狀態，並且在檢測到系統狀態變化後執行
  useEffect(() => {
    if (themeMode === 1) {
      if (prefersDarkMode.matches) {
        setTheme('dark')
        setModeValue([
          <FontAwesomeIcon icon={faCircleHalfStroke} />,
          '根據系統',
        ])
      } else if (!prefersDarkMode.matches) {
        setTheme('')
        setModeValue([
          <FontAwesomeIcon icon={faCircleHalfStroke} />,
          '根據系統',
        ])
      }
    } else if (themeMode === 2) {
      setTheme('dark')
      setModeValue([<FontAwesomeIcon icon={faMoon} />, '深色模式'])
    } else if (themeMode === 0) {
      setTheme('')
      setModeValue([<FontAwesomeIcon icon={faSun} />, '淺色模式'])
    }

    prefersDarkMode.addEventListener('change', systemThemeChange)
    return () => {
      prefersDarkMode.removeEventListener('change', systemThemeChange)
    }
  }, [themeMode])
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])
  // 監測並使用 localStorage 儲存狀態
  useEffect(() => {
    localStorage.setItem('themeMode', themeMode.toString())
  }, [themeMode])

  //「根據系統」選項，檢測系統主題並切換狀態
  const systemThemeChange = useCallback(() => {
    if (themeMode === 1) {
      if (prefersDarkMode.matches) {
        setTheme('dark')
        setModeValue([
          <FontAwesomeIcon icon={faCircleHalfStroke} />,
          '根據系統',
        ])
      } else if (!prefersDarkMode.matches) {
        setTheme('')
        setModeValue([
          <FontAwesomeIcon icon={faCircleHalfStroke} />,
          '根據系統',
        ])
      }
    }
  }, [themeMode, prefersDarkMode])

  // 狀態切換輪迴
  const handleThemeChange = (event) => {
    if (themeMode === 1) {
      setTheme('dark')
      setThemeMode(2)
      setModeValue([<FontAwesomeIcon icon={faMoon} />, '淺色模式'])
    } else if (themeMode === 2) {
      setTheme('')
      setThemeMode(0)
      setModeValue([<FontAwesomeIcon icon={faSun} />, '淺色模式'])
    } else if (themeMode === 0) {
      setThemeMode(1)
      setModeValue([<FontAwesomeIcon icon={faCircleHalfStroke} />, '根據系統'])
    }
  }
  const [pathname, setPathname] = useState('')
  useEffect(() => {
    let page = location.pathname
    setPathname(page)
  }, [location])

  const [scrollmax, setScrollmax] = useState(false)
  const [topMaskBackdrop, setTopMaskBackdrop] = useState(0)
  const [headerTopScale, setHeaderTopScale] = useState(1)
  useEffect(() => {
    const myElement = document.querySelector('main')
    setTopMaskBackdrop(0)
    setHeaderTopScale(1)

    const handleScroll = () => {
      const windowHeight = window.innerHeight
      if (myElement.scrollTop > windowHeight) {
        setScrollmax(true)
      } else {
        setScrollmax(false)
      }
      if ((myElement.scrollTop / windowHeight) * 100 < 20) {
        setTopMaskBackdrop((myElement.scrollTop / windowHeight) * 100)
        setHeaderTopScale(1 - myElement.scrollTop / windowHeight / 1.5)
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
                <Home
                  navigateClick={navigateClick}
                  adminPermit={adminPermit}
                  handleThemeChange={handleThemeChange}
                  modeValue={modeValue}
                />
              }
            />

            <Route
              path="/preview"
              element={
                <Preview
                  adminPermit={adminPermit}
                  topMaskBackdrop={topMaskBackdrop}
                  headerTopScale={headerTopScale}
                />
              }
            />

            <Route path="post" element={<Post />}></Route>

            <Route
              path="/progress"
              element={
                <ProjProgress
                  navigateClick={navigateClick}
                  adminPermit={adminPermit}
                />
              }
            >
              <Route path="timeLine" element={<TimeLine />}></Route>
            </Route>

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
              <Route path="dataProcessing" element={<DataProcessing />} />
              <Route path="aiAndMachinelearning" element={<AIML />} />
            </Route>

            <Route path="/about" element={<About />}></Route>

            <Route
              path="/user"
              element={<User adminPermit={adminPermit} />}
            ></Route>

            <Route
              path="*"
              element={<NotFound navigateClick={navigateClick} />}
            />

            <Route path="/realtime" element={<Realtime />}>
              <Route path="sensor" element={<Sensors />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="control" element={<Contrals />} />
              <Route path="chat" element={<Chats />} />
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
          <div className={css.updater}>
            <h1>網站有更新！</h1>
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
