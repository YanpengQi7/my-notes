import React from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({ isOpen, onConfirm, onCancel, title, message }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleConfirmClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onConfirm();
  };

  const handleCancelClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onCancel();
  };

  return (
    <div className={`confirm-dialog-overlay ${isOpen ? 'show' : 'hide'}`} onClick={handleOverlayClick}>
      <div className="confirm-dialog">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-dialog-actions">
          <button className="cancel-btn" onClick={handleCancelClick}>
            取消
          </button>
          <button className="confirm-btn" onClick={handleConfirmClick}>
            确认
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 