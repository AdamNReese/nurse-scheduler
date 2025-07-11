import React from 'react';

const ConfirmationDialog = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  onConfirm, 
  onCancel,
  isDestructive = false
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="confirmation-overlay" onClick={handleOverlayClick}>
      <div className="confirmation-modal">
        <div className="confirmation-header">
          <h3>{title}</h3>
        </div>
        
        <div className="confirmation-body">
          <p>{message}</p>
        </div>
        
        <div className="confirmation-actions">
          <button 
            onClick={onCancel}
            className="cancel-btn"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`confirm-btn ${isDestructive ? 'destructive' : ''}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;