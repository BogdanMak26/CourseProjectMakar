// src/components/shared/ConfirmModal.tsx
import React from 'react';
import '../css/ConfirmModal.css'; // Створимо стилі зараз

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) {
        return null; // Якщо вікно не відкрите, нічого не рендеримо
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Зупиняємо клік, щоб не закрити вікно */}
                <h2>{title}</h2>
                <p>{message}</p>
                <div className="modal-buttons">
                    <button onClick={onConfirm} className="confirm-button">
                        Так, видалити
                    </button>
                    <button onClick={onClose} className="cancel-button">
                        Скасувати
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;