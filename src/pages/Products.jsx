import style from "./css/Products.module.scss";
import Aside from "../widgets/Aside";
import { Outlet } from "react-router-dom";
import { Helmet } from "react-helmet";

export default function Products(props) {
  const aside = [
    {
      title: "產品",
      ul: [
        {
          title: "微農場 MicroFarm",
          path: "/products/microfarm",
        },
        {
          title: "敬請期待...",
          path: "",
        },
      ],
    },
  ];
  return (
    <div className={style.container}>
      <Helmet>
        <title>產品｜田野數據科學家</title>
        <meta name="description" content="登入以進行進一步的交流" />
      </Helmet>
      <Aside list={aside} />
      <div>
        <Outlet />
      </div>
    </div>
  );
}
