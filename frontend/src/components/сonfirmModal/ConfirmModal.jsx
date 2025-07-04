import { useEffect, useState } from "react";
import styles from "./ConfirmModal.module.css";

export default function ConfirmModal({ title, onConfirm, onCancel }) {
  const [visible, setVisible] = useState(false);

  // Триггерим анимацию появления
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleCancel = () => {
    setVisible(false);
    setTimeout(onCancel, 300);
  };

  const handleConfirm = () => {
    setVisible(false);
    setTimeout(onConfirm, 300);
  };

  return (
    <div className={`${styles.overlay} ${visible ? styles.show : styles.hide}`}>
      <div
        className={`${styles.modal} ${
          visible ? styles.showModal : styles.hideModal
        }`}
      >
        <h3>{title}</h3>
        <div className={styles.buttons}>
          <button className={styles.confirm} onClick={handleConfirm}>
            yes
          </button>
          <button className={styles.cancel} onClick={handleCancel}>
            no
          </button>
        </div>
      </div>
    </div>
  );
}
