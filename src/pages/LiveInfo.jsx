import { Outlet } from "react-router-dom";
import React, { useEffect, useState } from "react";
import css from "./css/LiveInfo.module.css";
import Aside from "../widgets/Aside";
import { Helmet } from "react-helmet";

export default function LiveInfo(props) {
  const aside = [
    {
      title: "即時資訊",
      ul: [
        {
          title: "感測器",
          path: "/realtime/sensor",
        },
        {
          title: "聊天",
          path: "/realtime/chat",
        },
      ],
    },
  ];
  return (
    <div className={css.container}>
      <Helmet>
        <title>即時｜田野數據科學家</title>
      </Helmet>
      <Aside list={aside}></Aside>
      <div className={`${css.view} chat_container`}>
        <Outlet />
      </div>
    </div>
  );
}
