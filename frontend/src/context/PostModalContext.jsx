import { createContext, useContext, useState } from "react";

const PostModalContext = createContext();

export const usePostModal = () => useContext(PostModalContext);

export function PostModalProvider({ children }) {
  const [selectedPost, setSelectedPost] = useState(null);

  const openPostModal = (post) => setSelectedPost(post);

  const closePostModal = () => setSelectedPost(null);

  return (
    <PostModalContext.Provider
      value={{ selectedPost, openPostModal, closePostModal }}
    >
      {children}
    </PostModalContext.Provider>
  );
}
