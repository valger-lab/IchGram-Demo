import styles from "./PostActionModal.module.css";

export default function PostActionsModal({
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) {
  if (!isOpen) return null;
  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button onClick={onEdit} className={styles.actionBtn}>
          ✏️ Edit Post
        </button>
        <button onClick={onDelete} className={styles.actionBtn}>
          🗑️ Delete Post
        </button>
        <button onClick={onClose} className={styles.actionBtn}>
          Cancel
        </button>
      </div>
    </>
  );
}
