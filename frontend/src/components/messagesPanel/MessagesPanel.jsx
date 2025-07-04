import { useState, useEffect } from "react";
import axios from "../../api/axiosInstance.js";
import MessageSidebar from "../messageSidebar/MessageSidebar.jsx";
import ChatWindow from "../chatWindow/ChatWindow.jsx";
import { useUser } from "../../context/UserContext.jsx";
import { io } from "socket.io-client";
import { useSearchParams } from "react-router-dom";
import ContactsHeader from "../сontactsHeader/ContactsHeader.jsx";

const socket = io("https://ichgram-demo.onrender.com", {
  withCredentials: true,
});

export default function MessagesPanel() {
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchParams] = useSearchParams();

  const { user } = useUser();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("🔌 Socket connected");
    });
  }, []);

  // Подключение к сокету
  useEffect(() => {
    if (user?._id) {
      socket.emit("join", user._id);
    }
  }, [user]);

  useEffect(() => {
    if (!user?._id) return;
    axios
      .get("/messages/unread/counts")
      .then((res) => setUnreadCounts(res.data))
      .catch(console.error);
  }, [user?._id]); // один раз, когда пользователь загружен

  // Получение сообщений при выборе собеседника
  useEffect(() => {
    if (!selectedUser) return;
    axios
      .get(`/messages/${selectedUser._id}`)
      .then((res) => setMessages(res.data))
      .catch(console.error);
  }, [selectedUser]);

  useEffect(() => {
    const handleReceiveMessage = async (msg) => {
      const isSelected = msg.senderId === selectedUser?._id;

      // Только если пользователь активен
      if (isSelected) {
        try {
          const res = await axios.get(`/messages/${selectedUser._id}`);
          setMessages(res.data);
        } catch (err) {
          console.error("Ошибка при обновлении сообщений:", err);
        }
      }

      const alreadyInContacts = contacts.some((c) => c._id === msg.senderId);
      if (!alreadyInContacts) {
        try {
          const res = await axios.get(`/users/${msg.senderId}`);

          setContacts((prev) => {
            const exists = prev.some((c) => c._id === res.data._id);
            if (exists) return prev; // не обновляем, если уже есть
            return [...prev, res.data];
          });
        } catch (err) {
          console.error("Ошибка при загрузке отправителя:", err);
        }
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    return () => socket.off("receiveMessage", handleReceiveMessage);
  }, [selectedUser, contacts]);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const res = await axios.get("/messages/contacts/list");
        setContacts((prev) => {
          const isSame =
            res.data.length === prev.length &&
            res.data.every((c, i) => c._id === prev[i]._id);
          return isSame ? prev : res.data;
        });
      } catch (err) {
        console.error("Ошибка загрузки контактов:", err);
      }
    };

    if (user?._id) {
      loadContacts();
    }
  }, [user?._id]);

  useEffect(() => {
    const userId = searchParams.get("userId");
    if (!userId) return;

    const loadAndSelectUser = async () => {
      try {
        const contact = contacts.find((c) => c._id === userId);
        if (contact) {
          setSelectedUser(contact);
        } else {
          const userRes = await axios.get(`/users/${userId}`);
          if (!contacts.some((c) => c._id === userRes.data._id)) {
            setContacts((prev) => [...prev, userRes.data]);
          }
          setSelectedUser(userRes.data);
        }
      } catch (err) {
        console.error("Ошибка загрузки пользователя:", err);
      }
    };

    loadAndSelectUser();
  }, [searchParams]);

  // Отправка сообщения
  const handleSendMessage = async (text) => {
    if (!text.trim() || !selectedUser || !user) return;

    const newMsg = {
      receiverId: selectedUser._id,
      text,
    };

    try {
      const res = await axios.post("/messages", newMsg);
      setMessages((prev) => [...prev, res.data]);

      socket.emit("sendMessage", {
        senderId: user._id,
        receiverId: selectedUser._id,
        text,
      });
    } catch (err) {
      console.error("Ошибка при отправке:", err);
    }
  };

  // Функция сброса счётчика непрочитанных сообщений для выбранного пользователя
  const handleResetUnreadCount = (userId) => {
    setUnreadCounts((prev) => prev.filter((c) => c._id !== userId));
  };

  return (
    <>
      <div>
        <ContactsHeader
          contacts={contacts}
          currentUserId={user?._id}
          onSelect={setSelectedUser}
          unreadCounts={unreadCounts}
        />
      </div>
      <div style={{ display: "flex", height: "80vh" }}>
        <MessageSidebar
          contacts={contacts}
          onSelect={(contact) => {
            setSelectedUser(contact);
            handleResetUnreadCount(contact._id);
          }}
          unreadCounts={unreadCounts}
        />
        {selectedUser && (
          <ChatWindow
            currentUserId={user?._id}
            otherUser={selectedUser}
            currentUser={user}
            messages={messages}
            onSend={handleSendMessage}
            setMessages={setMessages} //
          />
        )}
      </div>
    </>
  );
}
