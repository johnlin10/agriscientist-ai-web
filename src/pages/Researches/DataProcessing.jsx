import style from "./styles/DataProcessing.module.scss";
import MarkdownView from "../../widgets/MarkdownView";
import { Helmet } from "react-helmet";

export default function DataProcessing(props) {
  return (
    <div className={style.container}>
      <Helmet>
        <title>數據・研究｜田野數據科學家</title>
      </Helmet>
      <MarkdownView filePath="dataProcessing" />
    </div>
  );
}
