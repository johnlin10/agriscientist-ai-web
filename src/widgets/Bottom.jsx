/* eslint-disable jsx-a11y/alt-text */
import style from "./css/Bottom.module.scss";
import { useLocation, useNavigate } from "react-router-dom";

// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopyright, faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function Bottom(props) {
  const location = useLocation();
  const pageLinks = [
    {
      title: "關於",
      path: "/about",
      class: style.aboutUs,
      child: [
        { title: "關於我們", path: "/about/us" },
        { title: "我們的理念", path: "/about/concept" },
      ],
    },
    {
      title: "產品",
      path: "/products",
      class: style.product,
      child: [{ title: "微農場 MicroFarm", path: "/products/microfarm" }],
    },
    {
      title: "研究",
      path: "/researches",
      class: style.researches,
      child: [
        { title: "硬體", path: "/researches/hardware" },
        { title: "軟體", path: "/researches/software" },
        { title: "農作", path: "/researches/crops" },
        { title: "數據", path: "/researches/dataProcessing" },
        {
          title: "人工智慧與機器學習",
          path: "/researches/aiAndMachinelearning",
        },
      ],
    },
    {
      title: "Open Source",
      path: "",
      class: style.openSource,
      child: [
        { title: "Raspberry Pi", path: "" },
        { title: "Website", path: "" },
      ],
    },
  ];

  // 頁面跳轉
  const navigate = useNavigate();
  const navigateClick = (page) => {
    navigate(page);
  };

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
                  <li onClick={() => navigateClick(child.path)} key={index}>
                    {child.title}
                    <FontAwesomeIcon icon={faArrowRight} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {/* <div className={style.aboutUs}>
            <p>關於</p>
            <ul>
              <li>
                關於我們
                <FontAwesomeIcon icon={faArrowRight} />
              </li>
              <li>
                我們的理念
                <FontAwesomeIcon icon={faArrowRight} />
              </li>
            </ul>
          </div>
          <div className={style.product}>
            <p>產品</p>
            <ul>
              <li>
                微農場 MicroFarm
                <FontAwesomeIcon icon={faArrowRight} />
              </li>
            </ul>
          </div>
          <div className={style.researches}>
            <p>研究</p>
            <ul>
              <li>
                硬體準備
                <FontAwesomeIcon icon={faArrowRight} />
              </li>
              <li>
                軟體環境
                <FontAwesomeIcon icon={faArrowRight} />
              </li>
              <li>
                農作物
                <FontAwesomeIcon icon={faArrowRight} />
              </li>
              <li>
                數據處理
                <FontAwesomeIcon icon={faArrowRight} />
              </li>
              <li>
                人工智慧與機器學習
                <FontAwesomeIcon icon={faArrowRight} />
              </li>
            </ul>
          </div>
          <div className={style.openSource}>
            <p>Open Source</p>
            <ul>
              <li>
                Raspberry Pi
                <FontAwesomeIcon icon={faArrowRight} />
              </li>
              <li>
                Arduino
                <FontAwesomeIcon icon={faArrowRight} />
              </li>
              <li>
                Website
                <FontAwesomeIcon icon={faArrowRight} />
              </li>
            </ul>
          </div> */}
        </div>
        <div className={style.copyRight}>
          <div>
            <p>
              Copyright © 2023{" "}
              <span
                className={style.link}
                onClick={() => window.open("https://johnlin.web.app")}
              >
                Johnlin
              </span>{" "}
              保留一切權利。
            </p>

            {/* <p>
              <a
                property="dct:title"
                rel="cc:attributionURL"
                href="https://agriscientist-ai.web.app"
              >
                agriscientist-ai.web.app
              </a>{' '}
              由{' '}
              <a
                rel="cc:attributionURL dct:creator"
                property="cc:attributionName"
                href="https://johnlin.web.app/"
              >
                Johnlin
              </a>{' '}
              授權許可{' '}
              <a
                href="http://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1"
                target="_blank"
                rel="license noopener noreferrer"
                style={{ display: 'inline-block' }}
              >
                <img
                  style={{
                    height: '22px !important',
                    marginLeft: '3px',
                    verticalAlign: 'text-bottom',
                  }}
                  src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"
                />
                <img
                  style={{
                    height: '22px !important',
                    marginLeft: '3px',
                    verticalAlign: 'text-bottom',
                  }}
                  src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1"
                />
                <img
                  style={{
                    height: '22px !important',
                    marginLeft: '3px',
                    verticalAlign: 'text-bottom',
                  }}
                  src="https://mirrors.creativecommons.org/presskit/icons/nc.svg?ref=chooser-v1"
                />
                <img
                  style={{
                    height: '22px !important',
                    marginLeft: '3px',
                    verticalAlign: 'text-bottom',
                  }}
                  src="https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1"
                />
              </a>
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );
}
