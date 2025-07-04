import styles from "./ContactsHeader.module.css";

const API_BASE = "http://localhost:3000";
const ContactsHeader = ({
  contacts,
  currentUserId,
  onSelect,
  unreadCounts,
}) => {
  const getUnreadCount = (userId) => {
    const found = unreadCounts.find((c) => c._id === userId);
    return found ? found.count : 0;
  };

  const uniqueContacts = contacts.filter(
    (c, i, arr) => arr.findIndex((x) => x._id === c._id) === i
  );
  return (
    <div className={styles.header}>
      {uniqueContacts
        .filter((contact) => contact._id !== currentUserId)
        .map((contact) => (
          <div
            key={contact._id}
            className={styles.contactWrapper}
            style={{ position: "relative", display: "inline-block" }}
          >
            <img
              src={
                contact.avatar?.startsWith("http")
                  ? contact.avatar
                  : `${API_BASE}${contact.avatar}`
              }
              alt={contact.username}
              className={styles.avatar}
              onClick={() => onSelect(contact)}
            />
            {getUnreadCount(contact._id) > 0 && (
              <span className={styles.unreadBadge}>
                {getUnreadCount(contact._id)}
              </span>
            )}
          </div>
        ))}
    </div>
  );
};

export default ContactsHeader;
