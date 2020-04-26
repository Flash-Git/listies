import React, { FC, useContext, Fragment } from "react";

import ItemContext from "../../context/item/ItemContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Item, List, ItemContext as IImportContext } from "context";

interface Props {
  currentList: List;
}

const Exporter: FC<Props> = ({ currentList }) => {
  const itemContext: IImportContext = useContext(ItemContext);
  const { items } = itemContext;

  const exportList = () => {
    // const printObj = currentList.name + ":\n" + JSON.stringify(items, null, 2);
    const printObj =
      currentList.name +
      ":\n" +
      items.map((item: Item) => {
        return "\n" + item.name;
      });

    const element = document.createElement("a");
    const file = new Blob([printObj], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${currentList.name}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  return currentList ? (
    <button
      className="btn btn-link m-2"
      style={{ float: "right", height: "2.4rem", color: "#003699" }}
      onClick={exportList}
    >
      <FontAwesomeIcon style={{ height: "100%" }} icon={["fas", "download"]} />
    </button>
  ) : (
    <Fragment></Fragment>
  );
};

export default Exporter;
