import { useState, useCallback } from "react";
import styles from "./FileUpload.module.css";

export default function FileUpload({ onFileUpload }) {
  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file) => {
    if (file) {
      // Check if file size is greater than 1 MB (1 MB = 1048576 bytes)
      if (file.size > 1048576) {
        alert("File size exceeds 1 MB. Please upload a smaller file.");
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        onFileUpload(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Upload Log File</h2>
      <form
        className={`${styles.form} ${dragActive ? styles.dragActive : ""}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".log,.txt"
          className={styles.fileInput}
          onChange={handleChange}
        />
        <p className={styles.instructions}>
          Drag and drop your log file here or click to select.
        </p>
        <p className={styles.sizeNotice}>Upload file (less than 1 MB)</p>
      </form>
      {fileName && <p className={styles.fileName}>Selected file: {fileName}</p>}
    </div>
  );
}
