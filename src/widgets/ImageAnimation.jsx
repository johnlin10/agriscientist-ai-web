import style from "./css/ImageAnimation.module.scss"

export default function ImageAnimation({ path, className }) {
  return <img className={className} src={path} alt="" />
}
