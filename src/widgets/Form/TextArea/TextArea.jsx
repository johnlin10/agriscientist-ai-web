import styles from './styles.module.scss'

export default function TextArea({ title, value, onchange }) {
  return (
    <textarea
      className={styles.textArea}
      name={title}
      value={value}
      onChange={(e) => onchange(e.target.value)}
    ></textarea>
  )
}
