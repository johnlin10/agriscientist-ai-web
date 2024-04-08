import styles from './PageHeader.module.scss'

/**
 * 常規頁面中的粘駐式標題欄
 * @param {string} title - 頁面標題
 * @param {string} description - 頁面說明
 * @param {Array} actions - 可操作函數，將轉換為 button 提供用戶操作（預留開發）
 * @returns
 */
export default function PageHeader({ title, description, actions }) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {title && <h1>{title}</h1>}
        {description && <p>{description}</p>}
      </div>
      {actions && (
        <div className={styles.actions}>
          {actions.map((item, index) => {
            if (item.auth) {
              return (
                <button onClick={item.action} key={index}>
                  {item.title}
                </button>
              )
            } else return null
          })}
        </div>
      )}
    </div>
  )
}
