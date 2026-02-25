import React, { useState, useEffect, useCallback } from 'react';

let toastId = 0;

const toastStore = { listeners: [], toasts: [] };

export const addToast = (message, type = 'info') => {
    const id = ++toastId;
    toastStore.toasts = [...toastStore.toasts, { id, message, type }];
    toastStore.listeners.forEach(fn => fn(toastStore.toasts));
    setTimeout(() => {
        toastStore.toasts = toastStore.toasts.filter(t => t.id !== id);
        toastStore.listeners.forEach(fn => fn(toastStore.toasts));
    }, 3500);
};

export const ToastContainer = () => {
    const [toasts, setToasts] = useState([]);
    useEffect(() => {
        const listener = (t) => setToasts([...t]);
        toastStore.listeners.push(listener);
        return () => { toastStore.listeners = toastStore.listeners.filter(l => l !== listener); };
    }, []);

    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    return (
        <div className="toast-container">
            {toasts.map(t => (
                <div key={t.id} className={`toast toast-${t.type}`}>
                    <span>{icons[t.type] || 'ℹ️'}</span>
                    <span>{t.message}</span>
                </div>
            ))}
        </div>
    );
};

// Modal Component
export const Modal = ({ isOpen, onClose, title, children, footer }) => {
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal">
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>
    );
};

// Confirm Dialog
export const useConfirm = () => {
    const [state, setState] = useState({ open: false, msg: '', resolve: null });
    const confirm = useCallback((msg) => {
        return new Promise((resolve) => setState({ open: true, msg, resolve }));
    }, []);
    const handle = (val) => {
        state.resolve && state.resolve(val);
        setState({ open: false, msg: '', resolve: null });
    };
    const Dialog = () => state.open ? (
        <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: 380 }}>
                <div className="modal-header"><h3>Confirm Action</h3></div>
                <div className="modal-body"><p style={{ color: 'var(--text-secondary)' }}>{state.msg}</p></div>
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={() => handle(false)}>Cancel</button>
                    <button className="btn btn-danger" onClick={() => handle(true)}>Confirm</button>
                </div>
            </div>
        </div>
    ) : null;
    return { confirm, Dialog };
};

// Loading Screen
export const LoadingScreen = ({ message = 'Loading...' }) => (
    <div className="loading-screen">
        <div className="spinner" />
        <p>{message}</p>
    </div>
);
