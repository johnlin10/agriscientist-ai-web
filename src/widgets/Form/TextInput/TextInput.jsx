import styles from './styles.module.scss'

/**
 *
 * @param {any} value
 * @returns
 */
export default function TextInput({ value }) {
  return <input className={styles.textInput} type="text" value={value} />
}
