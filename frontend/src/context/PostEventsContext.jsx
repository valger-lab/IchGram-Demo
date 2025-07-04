import { createContext, useContext, useRef } from "react";

const PostEventsContext = createContext();

export const PostEventsProvider = ({ children }) => {
  const createListenersRef = useRef([]);
  const updateListenersRef = useRef([]);
  const deleteListenersRef = useRef([]);

  // Подписка на создание
  const subscribeToCreated = (callback) => {
    createListenersRef.current.push(callback);
    return () => {
      createListenersRef.current = createListenersRef.current.filter(
        (cb) => cb !== callback
      );
    };
  };

  // Подписка на обновление
  const subscribeToUpdated = (callback) => {
    updateListenersRef.current.push(callback);
    return () => {
      updateListenersRef.current = updateListenersRef.current.filter(
        (cb) => cb !== callback
      );
    };
  };

  // Подписка на удаление
  const subscribeToDeleted = (callback) => {
    deleteListenersRef.current.push(callback);
    return () => {
      deleteListenersRef.current = deleteListenersRef.current.filter(
        (cb) => cb !== callback
      );
    };
  };

  // Уведомить о создании
  const notifyPostCreated = (post) => {
    createListenersRef.current.forEach((cb) => cb(post));
  };

  // Уведомить об обновлении
  const notifyPostUpdated = (post) => {
    updateListenersRef.current.forEach((cb) => cb(post));
  };

  // Уведомить об удалении
  const notifyPostDeleted = (post) => {
    deleteListenersRef.current.forEach((cb) => cb(post));
  };

  return (
    <PostEventsContext.Provider
      value={{
        subscribeToCreated,
        subscribeToUpdated,
        notifyPostCreated,
        notifyPostUpdated,
        subscribeToDeleted,
        notifyPostDeleted,
      }}
    >
      {children}
    </PostEventsContext.Provider>
  );
};

export const usePostEvents = () => useContext(PostEventsContext);
