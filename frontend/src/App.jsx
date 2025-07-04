import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ExplorePage from "./pages/explorePage/ExplorePage.jsx";
import RegisterPage from "./pages/registerPage/RegisterPage.jsx";
import LoginPage from "./pages/loginPage/LoginPage.jsx";
import ForgotPasswordPage from "./pages/forgotPasswordPage/ForgotPasswordPage.jsx";
import ChangePasswordPage from "./pages/changePasswordPage/ChangePasswordPage.jsx";
import HomePage from "./pages/homePage/HomePage.jsx";
import ProfilePage from "./pages/profilePage/ProfilePage.jsx";
import EditProfilePage from "./pages/editProfilePage/EditProfilePage.jsx";
import MainLayout from "./components/mainLayout/MainLayout.jsx";
import PostModal from "./components/postModal/PostModal.jsx";
import MessagesPanel from "./components/messagesPanel/MessagesPanel.jsx";
import NoteFound from "./components/notFound/NotFound.jsx";

import DemoBadge from "./components/demoBadge/DemoBadge.jsx";

import ProtectedRoute from "./components/protectedRoute/ProtectedRoute.jsx";

import UserProfilePage from "./pages/userProfilePage/UserProfilePage.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import { PostEventsProvider } from "./context/PostEventsContext.jsx";
import {
  PostModalProvider,
  usePostModal,
} from "./context/PostModalContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

function GlobalModals() {
  const { selectedPost, closePostModal } = usePostModal();

  return selectedPost ? (
    <PostModal post={selectedPost} onClose={closePostModal} />
  ) : null;
}

function App() {
  return (
    <PostEventsProvider>
      <UserProvider>
        <ThemeProvider>
          <PostModalProvider>
            <GlobalModals />
            <DemoBadge />
            <Routes>
              {/* Публичные маршруты */}
              <Route path="/" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />

              {/* Основной layout */}
              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/home" element={<HomePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/users/:id" element={<UserProfilePage />} />
                <Route path="/profile/edit" element={<EditProfilePage />} />
                <Route path="*" element={<NoteFound />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/messages" element={<MessagesPanel />} />
              </Route>
            </Routes>
          </PostModalProvider>
        </ThemeProvider>
      </UserProvider>
    </PostEventsProvider>
  );
}

export default App;
