'use client';

import { useEffect, useState, useRef } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  // Use ref to avoid dependency issues with onClose callback
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const timer = setTimeout(() => {
      onCloseRef.current();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const bgColor = {
    success: 'bg-[var(--theme-success)]',
    error: 'bg-[var(--theme-error)]',
    warning: 'bg-[var(--theme-warning)]',
    info: 'bg-[var(--theme-info)]'
  }[type];

  const icon = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }[type];

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}>
        <span className="text-xl">{icon}</span>
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '确定',
  cancelText = '取消',
  danger = false
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await Promise.resolve(onConfirm());
      // 操作成功后自动关闭弹框
      onCancel();
    } catch (error) {
      console.error('操作失败:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--theme-surface)] rounded-xl shadow-2xl border border-[var(--theme-border)] max-w-md w-full mx-4 animate-scale-in">
        <div className="p-6">
          <h3 className="text-xl font-bold text-[var(--theme-text)] mb-2">{title}</h3>
          <p className="text-[var(--theme-textSecondary)]">{message}</p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-[var(--theme-card)] hover:bg-[var(--theme-hover)] text-[var(--theme-text)] rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
              danger
                ? 'bg-[var(--theme-error)] hover:bg-[var(--theme-error)]/80'
                : 'bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/80'
            }`}
          >
            {isLoading ? '处理中…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
