import React, { useContext, useEffect, useState, Fragment, FC } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import ListContext from "../../context/list/ListContext";
import ListItem from "./ListItem";
import Spinner from "../layout/Spinner";

import { List, ListContext as IListContext } from "context";

const Lists: FC = () => {
  const listContext: IListContext = useContext(ListContext);
  const { loading, lists, getLists, setLists } = listContext;

  useEffect(() => {
    getLists();
    //eslint-disable-next-line
  }, []);

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
    let newLists = lists.filter(
      (list: List) => draggedList && list.id !== draggedList.id
    );

    // add the dragged item after the dragged over item
    newLists.splice(index, 0, draggedList);

    setLists(newLists);
  };

  const onDragEnd = () => {
    setDraggedList(null);
  };

  return (
    <Fragment>
      {lists && !loading ? (
        <TransitionGroup>
          {lists.map((list: List, i: number) => (
            <CSSTransition key={list.id} timeout={200}>
              <div
                className="drag"
                draggable
                onDragStart={e => onDragStart(e, i, list.name)}
                onDragEnd={onDragEnd}
                onDragOver={() => onDragOver(i)}
              >
                <ListItem list={list} />
              </div>
            </CSSTransition>
          ))}
        </TransitionGroup>
      ) : (
        <Spinner />
      )}
    </Fragment>
  );
};

export default Lists;
