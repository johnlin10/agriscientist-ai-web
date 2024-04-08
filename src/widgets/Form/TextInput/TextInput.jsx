import styles from './TextInput.module.scss'

/**
 *
 * @param {any} value
 * @returns
 */
export default function TextInput({ value }) {
  return <input className={styles.textInput} type="text" value={value} />
}
