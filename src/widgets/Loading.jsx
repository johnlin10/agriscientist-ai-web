import { useEffect, useState } from "react";
import style from "./css/Loading.module.scss";

export default function Loading({ actv, type }) {
  return (
    <div
      className={`${style.loading}${actv ? ` ${style.actv}` : ""}${
        type === "local" ? ` ${style.local}` : ""
      }`}
    >
      <img
        className={style.loadingGIF}
        src={`${process.env.PUBLIC_URL}/images/loading.gif`}
        alt="Loading..."
      />
    </div>
  );
}
