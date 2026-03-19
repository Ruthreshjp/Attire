import React, { createContext, useState, useContext, useCallback, useMemo, useRef } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [alert, setAlert] = useState(null);
    const [confirm, setConfirm] = useState(null);
    
    // Use refs for callbacks to prevent stale closures and unnecessary re-renders
    const alertCallbackRef = useRef(null);
    const confirmCallbackRef = useRef(null);

    const showAlert = useCallback((message, type = 'info', onClose = null) => {
        alertCallbackRef.current = onClose;
        setAlert({ message, type });
    }, []);

    const closeAlert = useCallback(() => {
        const callback = alertCallbackRef.current;
        alertCallbackRef.current = null;
        setAlert(null);
        
        if (callback) {
            // Delay slightly to ensure state update has propagated
            setTimeout(() => {
                try { callback(); } catch (e) { console.error("Alert callback error:", e); }
            }, 10);
        }
    }, []);

    const showConfirm = useCallback((message, onConfirm) => {
        confirmCallbackRef.current = onConfirm;
        setConfirm({ message });
    }, []);

    const closeConfirm = useCallback((execute = false) => {
        const callback = confirmCallbackRef.current;
        confirmCallbackRef.current = null;
        setConfirm(null);

        if (execute && callback) {
            setTimeout(() => {
                try { callback(); } catch (e) { console.error("Confirm callback error:", e); }
            }, 10);
        }
    }, []);

    const value = useMemo(() => ({
        showAlert, closeAlert, alert, 
        showConfirm, closeConfirm, confirm 
    }), [showAlert, closeAlert, alert, showConfirm, closeConfirm, confirm]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);


