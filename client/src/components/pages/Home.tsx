import { FC, useContext, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useMountEffect } from "../../functions/hooks";

import Lists from "../lists/Lists";
import ListForm from "../lists/ListForm";
import Items from "../items/Items";
import ItemForm from "../items/ItemForm";

import AppContext from "../../context/app/AppContext";
import AuthContext from "../../context/auth/AuthContext";
import ListContext from "../../context/list/ListContext";

import {
  AppContext as IAppContext,
  AuthContext as IAuthContext,
  List,
  ListContext as IListContext,
} from "context";

const Home: FC = () => {
  const appContext: IAppContext = useContext(AppContext);
  const { initialiseSocket, identifySelf } = appContext;

  const authContext: IAuthContext = useContext(AuthContext);
  const { user, isAuthenticated, loading, loadUser } = authContext;

  const listContext: IListContext = useContext(ListContext);
  const {
    hidden,
    currentList,
    toggleHidden,
    setHidden,
    setCurrentList,
    clearCurrentList,
  } = listContext;

  useMountEffect(() => {
    initialiseSocket();
    loadUser();

    setHidden(localStorage.getItem("hidden") === "true" ? true : false);
  });

  useEffect(() => {
    if (!user) return;

    identifySelf(user);

    const currentList = localStorage.getItem("currentList");
    if (!currentList) return;
    const parsedList: List = JSON.parse(currentList);
    const lastUser = localStorage.getItem("lastUser");
    if (lastUser === user._id.toString()) setCurrentList(parsedList);
    else clearCurrentList();
  }, [loading, isAuthenticated, user]);

  const toggleList = () => {
    toggleHidden();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly",
        flexWrap: "wrap",
        marginTop: "0.7rem",
      }}
    >
      <button
        onClick={toggleList}
        className="btn btn-sm btn-primary mx"
        style={{
          position: "absolute",
          left: "1rem",
          paddingLeft: "0.8rem",
          paddingRight: "0.8rem",
        }}
      >
        <FontAwesomeIcon icon={["fas", "bars"]} />
      </button>

      {!hidden && (
        <div
          className="px-1 mbot-2"
          style={{
            // maxHeight: "40rem",
            overflowY: "auto",
            scrollbarWidth: "thin",
            flexBasis: "23rem",
            maxWidth: "30rem",
          }}
        >
          <ListForm />
          <Lists />
        </div>
      )}
      <div
        className="px-1 mx-auto mbot-4"
        style={{
          // maxHeight: "60rem",
          overflowY: "auto",
          scrollbarWidth: "thin",
          flexBasis: "23rem",
          maxWidth: "30rem",
        }}
      >
        <ItemForm currentList={currentList} />
        <Items currentList={currentList} />
      </div>
    </div>
  );
};

export default Home;
