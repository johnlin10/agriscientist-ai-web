import style from './css/Nav.module.scss'

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

export default function Nav(props) {
  return (
    <nav className={style.nav}>
      <div className={style.view}>
        <ul>
          <li onClick={() => props.navigateClick('/')}>
            <p>
              <FontAwesomeIcon icon={faLeaf} className={style.icon} />
              <span>首頁</span>
            </p>
          </li>
          <li onClick={() => props.navigateClick('/realtime/sensor')}>
            <p>
              {/* <FontAwesomeIcon
                icon={faMagnifyingGlassChart}
                className={style.icon}
              /> */}
              <FontAwesomeIcon icon={faChartSimple} className={style.icon} />
              <span>即時</span>
            </p>
            <FontAwesomeIcon icon={faCaretUp} className={style.more} />
            <ul>
              <li
                onClick={(event) => {
                  event.stopPropagation() // 阻止事件冒泡
                  props.navigateClick('/realtime/sensor')
                }}
              >
                <p>
                  感測數據
                  <FontAwesomeIcon icon={faArrowRight} />
                </p>
              </li>
              <li
                onClick={(event) => {
                  event.stopPropagation() // 阻止事件冒泡
                  props.navigateClick('/realtime/control')
                }}
              >
                <p>
                  控制台
                  <FontAwesomeIcon icon={faArrowRight} />
                </p>
              </li>
              <li
                onClick={(event) => {
                  event.stopPropagation() // 阻止事件冒泡
                  props.navigateClick('/realtime/chat')
                }}
              >
                <p>
                  農場助理
                  <FontAwesomeIcon icon={faArrowRight} />
                </p>
              </li>
              <hr />
              <li
                onClick={(event) => {
                  event.stopPropagation() // 阻止事件冒泡
                  props.navigateClick('/realtime/smartSwitch')
                }}
              >
                <p>
                  智慧插座
                  <FontAwesomeIcon icon={faArrowRight} />
                </p>
              </li>
            </ul>
          </li>
          <li onClick={() => props.navigateClick('/products/microfarm')}>
            <p>
              {/* <FontAwesomeIcon icon={faInbox} className={style.icon} /> */}
              <FontAwesomeIcon icon={faCube} className={style.icon} />
              <span>產品</span>
            </p>
            <FontAwesomeIcon icon={faCaretUp} className={style.more} />
            <ul>
              <li
                onClick={(event) => {
                  event.stopPropagation() // 阻止事件冒泡
                  props.navigateClick('/products/microfarm')
                }}
              >
                <p>
                  MicroFarm
                  <FontAwesomeIcon icon={faArrowRight} />
                </p>
              </li>
              <li
                onClick={(event) => {
                  event.stopPropagation() // 阻止事件冒泡
                  props.navigateClick('/products/microfarm-pro')
                }}
              >
                <p>
                  MicroFarm Pro
                  <FontAwesomeIcon icon={faArrowRight} />
                </p>
              </li>
            </ul>
          </li>
          <li onClick={() => props.navigateClick('/researches/intro')}>
            <p>
              <FontAwesomeIcon icon={faBook} className={style.icon} />
              <span>研究</span>
            </p>
            <FontAwesomeIcon icon={faCaretUp} className={style.more} />
            <ul>
              <li
                onClick={(event) => {
                  event.stopPropagation() // 阻止事件冒泡
                  props.navigateClick('/researches/intro')
                }}
              >
                <p>
                  前言
                  <FontAwesomeIcon icon={faArrowRight} />
                </p>
              </li>
              <hr />
              <li
                onClick={(event) => {
                  event.stopPropagation() // 阻止事件冒泡
                  props.navigateClick('/researches/hardware')
                }}
              >
                <p>
                  硬體準備
                  <FontAwesomeIcon icon={faArrowRight} />
                </p>
              </li>
              <li
                onClick={(event) => {
                  event.stopPropagation() // 阻止事件冒泡
                  props.navigateClick('/researches/software')
                }}
              >
                <p>
                  軟體環境
                  <FontAwesomeIcon icon={faArrowRight} />
                </p>
              </li>
              <li
                onClick={(event) => {
                  event.stopPropagation() // 阻止事件冒泡
                  props.navigateClick('/researches/crops')
                }}
              >
                <p>
                  農作物
                  <FontAwesomeIcon icon={faArrowRight} />
                </p>
              </li>
              <li
                onClick={(event) => {
                  event.stopPropagation() // 阻止事件冒泡
                  props.navigateClick('/researches/dataProcessing')
                }}
              >
                <p>
                  數據處理
                  <FontAwesomeIcon icon={faArrowRight} />
                </p>
              </li>
              <li
                onClick={(event) => {
                  event.stopPropagation() // 阻止事件冒泡
                  props.navigateClick('/researches/aiAndMachinelearning')
                }}
              >
                <p>
                  人工智慧與機器學習
                  <FontAwesomeIcon icon={faArrowRight} />
                </p>
              </li>
            </ul>
          </li>
          <li onClick={() => props.navigateClick('/about')}>
            <p>
              {/* <FontAwesomeIcon icon={faUsers} className={style.icon} /> */}
              <FontAwesomeIcon icon={faCircleInfo} className={style.icon} />
              <span>關於</span>
            </p>
            <FontAwesomeIcon icon={faCaretUp} className={style.more} />
            <ul>
              <li
                onClick={(event) => {
                  event.stopPropagation() // 阻止事件冒泡
                  props.navigateClick('/about')
                }}
              >
                <p>
                  關於我們
                  <FontAwesomeIcon icon={faArrowRight} />
                </p>
              </li>
              {/* <li
                onClick={(event) => {
                  event.stopPropagation() // 阻止事件冒泡
                  // props.navigateClick('/about')
                }}
              >
                <p>我們的理念</p>
              </li> */}
              <hr />
              <li
                onClick={(event) => {
                  event.stopPropagation() // 阻止事件冒泡
                  props.navigateClick('/user')
                }}
              >
                <p>
                  帳號
                  <FontAwesomeIcon icon={faArrowRight} />
                </p>
              </li>
              <li
                onClick={(event) => {
                  event.stopPropagation() // 阻止事件冒泡
                  props.navigateClick('/post')
                }}
              >
                <p>
                  公告
                  <FontAwesomeIcon icon={faArrowRight} />
                </p>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  )
}
