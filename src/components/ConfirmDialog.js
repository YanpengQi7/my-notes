import React from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({ isOpen, onConfirm, onCancel, title, message }) => {
  return (
    <div className={`confirm-dialog-overlay ${isOpen ? 'show' : 'hide'}`}>
      <div className="confirm-dialog">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-dialog-actions">
          <button className="cancel-btn" onClick={onCancel}>
            取消
          </button>
          <button className="confirm-btn" onClick={onConfirm}>
            确认
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 