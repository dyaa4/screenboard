export const toastStyles: React.CSSProperties = {
    position: "fixed",
    top: "20px", // Ändere von "bottom" auf "top"
    right: "20px",
    backgroundColor: "#333",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
    opacity: 0.9,
    zIndex: 999,
    width: "300px",
    height: "100px",
};

export const messageStyles: React.CSSProperties = {
    flexGrow: 1,
    marginRight: "10px",
};

export const closeButtonStyles: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
};