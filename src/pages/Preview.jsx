import css from './css/Preview.module.scss'

import Bottom from '../widgets/Bottom'
import { Helmet } from 'react-helmet'
// FontAwesome

export default function Preview(props) {
  return (
    <>
      <Helmet>
        <title>田野數據科學家｜預覽</title>
        <meta
          name="description"
          content="一個用於追蹤「分析農場數據」專題作品進度的預覽網站"
        />
      </Helmet>

      {/* 頂部大標題 */}
      <div
        className={css.headerTop}
        style={{
          transform: `scale(${props.headerTopScale})`,
          WebkitTransform: `scale(${props.headerTopScale})`,
          MozTransform: `scale(${props.headerTopScale})`,
          MsTransform: `scale(${props.headerTopScale})`,
          OTransform: `scale(${props.headerTopScale})`,
        }}
      >
        {/* <img
          src={`/images/icon/general-icon/icon-512x512.png`}
          alt="田野上的數據科學家"
        /> */}
        <div className={css.title}>
          <h1
            onClick={() => window.location.reload(true)}
            title="[重新載入] 田野上的數據科學家"
          >
            田野上的數據科學家
          </h1>
          <h5>一個分析農場數據專題作品的介紹網站。</h5>
          <div className={css.advanceNotice}>
            <p>
              預計於 <span className="nowrop">11 月底完工</span>
            </p>
            <p>
              <span className="nowrop">12 月 12 日</span>
              <span className="nowrop">正式發布</span>
            </p>
            <p className={css.stayTuned}>敬請期待～</p>
          </div>
        </div>
      </div>

      {/* 模糊層 */}
      {props.topMaskBackdrop > 1 && (
        <div
          // onClick={() => scrollToTop()}
          className={css.topMask}
          style={{
            backdropFilter: `saturate(180%) blur(${props.topMaskBackdrop}px)`,
            WebkitBackdropFilter: `saturate(180%) blur(${props.topMaskBackdrop}px)`,
          }}
        ></div>
      )}

      <Bottom />

      {/* 專題進度 */}
      {/* <div className={css.projProgress}>
        <div className={css.progressView}>
          <h1>專題進度</h1>
          {props.adminPermit && (
            <button
              className={css.updateProgress_btn}
              onClick={
                progressForm
                  ? () => setPregressForm(false)
                  : () => setPregressForm(true)
              }>
              {progressForm ? '取消' : '發表進度'}
            </button>
          )}
          {progressForm && (
            <div className={css.updateProgress_form}>
              <h3>進度更新</h3>
              <div className={`${css.form_block}`}>
                <p>標題</p>
                <input
                  className={progressFormTitle ? ` ${css.content}` : ''}
                  type="text"
                  value={progressFormTitle}
                  onChange={(e) => setProgressFormTitle(e.target.value)}
                  autoFocus></input>
              </div>
              <div className={css.form_block}>
                <p>進度內容</p>
                <textarea
                  ref={autoHeight}
                  className={progressFormContent ? ` ${css.content}` : ''}
                  value={progressFormContent}
                  onChange={(e) => setProgressFormContent(e.target.value)}
                  onInput={() => autoAdjustHeight()}
                />
              </div>
              <button
                className={css.pubProgress_btn}
                onClick={() => updateProjProgress()}>
                {sendActive ? (
                  <FontAwesomeIcon icon={faSpinner} spinPulse />
                ) : (
                  '發布'
                )}
              </button>
            </div>
          )}
          {progressData.length > 0 ? (
            <div className={css.progressContentView}>
              {[...progressData].reverse().map((item) => (
                <div key={item.time}>
                  <div className={css.progress_line}>
                    <div className={css.line}></div>
                    <div className={css.dot}></div>
                  </div>
                  <div className={css.progressDate}>
                    {formatDate(item.time.toDate())}
                  </div>
                  <div className={css.progressContent}>
                    <h3>{item.title}</h3>
                    <p>{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <img
              className={css.loadingGIF}
              src={`${process.env.PUBLIC_URL}/images/loading.gif`}
              alt="Loading..."
            />
          )}
        </div>
      </div> */}
    </>
  )
}
