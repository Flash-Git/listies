import { FC, useContext, useEffect, useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import ListItem from "./ListItem";
import Spinner from "../layout/Spinner";

import AuthContext from "../../context/auth/AuthContext";
import ListContext from "../../context/list/ListContext";

import { List, ListContext as IListContext, AuthContext as IAuthContext } from "context";

const Lists: FC = () => {
  const authContext: IAuthContext = useContext(AuthContext);
  const { loading: authLoading, isAuthenticated } = authContext;

  const listContext: IListContext = useContext(ListContext);
  const { loading, lists, getLists, setLists } = listContext;

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    getLists();
    //eslint-disable-next-line
  }, [authLoading, isAuthenticated]);

  /*
  / Dragging
  */

  const [draggedList, setDraggedList] = useState<List | null>(null);

  const onDragStart = (e: any, index: number, name: string) => {
    setDraggedList(lists[index]);
    e.dataTransfer.setData("text/plain", name);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (index: number) => {
    const draggedOverItem = lists[index];
    // if the item is dragged over itself, ignore
    if (draggedList === null || draggedList.id === draggedOverItem.id) return;
    // filter out the currently dragged item
    const newLists = lists.filter((list: List) => draggedList && list.id !== draggedList.id);
    // add the dragged item after the dragged over item
    setLists(newLists.splice(index, 0, draggedList));
  };

  const onDragEnd = () => {
    setDraggedList(null);
  };

  if (lists.length > 0 && !loading) {
    return (
      <TransitionGroup>
        {lists.map((list: List, i: number) => (
          <CSSTransition key={list.id} timeout={200}>
            <div
              className="drag"
              draggable
              onDragStart={(e) => onDragStart(e, i, list.name)}
              onDragEnd={onDragEnd}
              onDragOver={() => onDragOver(i)}
            >
              <ListItem list={list} />
            </div>
          </CSSTransition>
        ))}
      </TransitionGroup>
    );
  }
  return <Spinner />;
};

export default Lists;
