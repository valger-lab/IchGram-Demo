import styles from "./InputField.module.css";

const InputField = ({
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={styles.input}
    />
  );
};

export default InputField;
