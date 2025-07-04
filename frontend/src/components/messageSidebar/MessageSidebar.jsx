import styles from "./MessageSidebar.module.css";
import { useMemo } from "react";
import React from "react";

const API_BASE = "https://ichgram-demo.onrender.com";

function MessageSidebar({ contacts, onSelect, unreadCounts }) {
  const getUnreadCount = (userId) => {
    const found = unreadCounts.find((c) => c._id === userId);
    return found ? found.count : 0;
  };

  const uniqueContacts = useMemo(() => {
    return contacts.filter(
      (contact, index, self) =>
        index === self.findIndex((c) => c._id === contact._id)
    );
  }, [contacts]);

  return (
    <div className={styles.container}>
      {uniqueContacts.map((contact) => (
        <div
          key={contact._id}
          className={styles.contact}
          onClick={() => onSelect(contact)}
        >
          <div className={styles.avatarAndName}>
            {contact ? (
              <img
                key={contact._id}
                src={
                  contact.avatar?.startsWith("http")
                    ? contact.avatar
                    : contact.avatar
                    ? `${API_BASE}${contact.avatar}`
                    : "https://www.gravatar.com/avatar/?d=mp"
                }
                alt=""
                className={styles.avatar}
                loading="lazy"
              />
            ) : (
              <div className={styles.avatarSkeleton} />
            )}
            <span>{contact.username}</span>
          </div>

          {getUnreadCount(contact._id) > 0 && (
            <span className={styles.unreadBadge}>
              {getUnreadCount(contact._id)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default React.memo(MessageSidebar);
