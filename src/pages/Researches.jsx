import style from "./css/Researches.module.scss";
import Aside from "../widgets/Aside";
import { Outlet } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import { getFirestoreData } from "../firebase";
import { useContext } from "react";
import { AppContext } from "../AppContext";

export default function Researches(props) {
  const aside_local = [
    {
      title: "研究",
      ul: [
        {
          title: "前言",
          path: "/researches/intro",
        },
        {
          title: "硬體設備",
          path: "/researches/hardware",
          child: [
            { title: "Raspberry Pi 4B", id: "" },
            { title: "MCP 3008", id: "" },
            {
              title: "感測器",
              click: "",
              child: [
                { title: "溫濕度感測器", id: "" },
                { title: "土壤濕度感測器", id: "" },
                { title: "光照度感測器", id: "" },
                { title: "水位感測器", id: "" },
              ],
            },
            { title: "MicroFarm 外殼", click: "" },
            { title: "電路連接", click: "" },
          ],
        },
        {
          title: "軟體開發",
          path: "/researches/software",
          child: [
            {
              title: "環境建置",
              click: "",
              child: [
                { title: "開發調試", id: "" },
                { title: "Raspberry Pi 程式", id: "" },
              ],
            },
            { title: "雲端數據庫", click: "" },
            { title: "即時資訊展示", click: "" },
          ],
        },
        {
          title: "農作",
          path: "/researches/crops",
          child: [
            { title: "微農場環境", click: "" },
            { title: "農作物", click: "" },
            { title: "生長環境", click: "" },
          ],
        },
        {
          title: "數據處理",
          path: "/researches/dataProcessing",
          child: [
            { title: "蒐集", click: "" },
            { title: "結構", click: "" },
            { title: "存放", click: "" },
            { title: "分析", click: "" },
            { title: "可視化", click: "" },
          ],
        },
        {
          title: "人工智慧與機器學習",
          path: "/researches/aiAndMachinelearning",
          child: [
            { title: "語音助理", click: "" },
            { title: "模型訓練", click: "" },
            { title: "數據分析", click: "" },
            { title: "智慧化建議", click: "" },
          ],
        },
      ],
    },
  ];

  return (
    <div className={style.container}>
      <Helmet>
        <title>研究｜田野數據科學家</title>
      </Helmet>
      <Aside list={aside_local} />
      <div>
        <Outlet />
      </div>
    </div>
  );
}
