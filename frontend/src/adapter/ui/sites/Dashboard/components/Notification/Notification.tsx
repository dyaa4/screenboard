import React, { useState, useEffect } from "react";
import { closeButtonStyles, messageStyles, toastStyles } from "./style";


interface NotificationProps {
    message: string;
    duration?: number;
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, duration = 3000, onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onClose();
        }, duration);

        return () => {
            clearTimeout(timer);
        };
    }, [duration, onClose]);

    const handleClose = () => {
        setVisible(false);
        onClose();
    };

    return (
        visible && (
            <div style={toastStyles}>
                <div style={messageStyles}>
                    <li className="fa-solid fa-exclamation-circle" style={{ marginRight: '10px' }}></li>
                    {message}
                </div>
                <button style={closeButtonStyles} onClick={handleClose}>
                    X
                </button>
            </div>
        )
    );
};

export default Notification;
