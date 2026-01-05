'use client';

import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface ToastProps {
    message: string;
    show: boolean;
    onClose: () => void;
}

export default function Toast({ message, show, onClose }: ToastProps) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(onClose, 2000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className="toast">
            <CheckCircle size={18} />
            {message}
        </div>
    );
}

export function useToast() {
    const [toast, setToast] = useState({ show: false, message: '' });

    const showToast = (message: string) => {
        setToast({ show: true, message });
    };

    const hideToast = () => {
        setToast({ show: false, message: '' });
    };

    return { toast, showToast, hideToast };
}
