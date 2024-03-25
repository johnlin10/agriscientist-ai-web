import styles from './styles.module.scss'

export default function TextArea({ title, value }) {
  return (
    <textarea
      className={styles.textArea}
      name={title}
      value={value}
      data-bg=""
    ></textarea>
  )
}
