import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  exiting?: boolean;
}

interface ToastCtx {
  toast: (message: string, type?: ToastItem['type']) => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => {} });
export const useToast = () => useContext(Ctx);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const add = useCallback((message: string, type: ToastItem['type'] = 'info') => {
    const id = ++nextId;
    setItems(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setItems(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), 250);
    }, 3000);
  }, []);

  const icon: Record<string, string> = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };

  return (
    <Ctx.Provider value={{ toast: add }}>
      {children}
      <div className="toast-container">
        {items.map(t => (
          <div key={t.id} className={`toast toast-${t.type}${t.exiting ? ' exit' : ''}`}>
            <span>{icon[t.type]}</span>
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
