'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, Check, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Types ---
type DialogType = 'alert' | 'confirm';
type DialogVariant = 'success' | 'error' | 'info' | 'warning';

interface DialogOptions {
  title: string;
  message: string;
  variant?: DialogVariant;
  confirmText?: string;
  cancelText?: string;
}

interface UiContextType {
  showAlert: (options: DialogOptions) => Promise<void>;
  showConfirm: (options: DialogOptions) => Promise<boolean>;
}

const UiContext = createContext<UiContextType | undefined>(undefined);

// --- The Provider Component ---
export function UiProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<DialogType>('alert');
  const [config, setConfig] = useState<DialogOptions>({ title: '', message: '' });
  
  // We store the 'resolve' function of the Promise here
  const [resolver, setResolver] = useState<(value: any) => void>(() => {});

  const showAlert = useCallback((options: DialogOptions) => {
    return new Promise<void>((resolve) => {
      setResolver(() => resolve);
      setConfig(options);
      setType('alert');
      setIsOpen(true);
    });
  }, []);

  const showConfirm = useCallback((options: DialogOptions) => {
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
      setConfig(options);
      setType('confirm');
      setIsOpen(true);
    });
  }, []);

  const handleClose = (result: boolean) => {
    setIsOpen(false);
    setTimeout(() => {
        // Resolve after animation closes
        resolver(result); 
    }, 200); 
  };

  // Icon Logic
  const getIcon = () => {
    switch (config.variant) {
      case 'error': return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case 'success': return <Check className="w-6 h-6 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-6 h-6 text-amber-500" />;
      default: return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  return (
    <UiContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      {/* --- THE MODAL OVERLAY --- */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in"
            onClick={() => type === 'alert' && handleClose(true)}
          />

          {/* Dialog Box */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in-scale border border-slate-100">
            {/* Header Colored Strip */}
            <div className={cn("h-1 w-full", 
              config.variant === 'error' ? 'bg-red-500' :
              config.variant === 'success' ? 'bg-green-500' :
              'bg-blue-500'
            )} />

            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-50 rounded-full shrink-0">
                  {getIcon()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {config.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {config.message}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex justify-end gap-3">
                {type === 'confirm' && (
                  <button
                    onClick={() => handleClose(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    {config.cancelText || 'Cancel'}
                  </button>
                )}
                <button
                  onClick={() => handleClose(true)}
                  className={cn(
                    "px-6 py-2 text-sm font-semibold text-white rounded-lg shadow-lg transition-transform active:scale-95",
                    config.variant === 'error' ? 'bg-red-600 hover:bg-red-700' :
                    config.variant === 'success' ? 'bg-green-600 hover:bg-green-700' :
                    'bg-slate-900 hover:bg-slate-800'
                  )}
                >
                  {config.confirmText || 'Okay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </UiContext.Provider>
  );
}

// Hook to use it easily
export function useUi() {
  const context = useContext(UiContext);
  if (!context) {
    throw new Error('useUi must be used within a UiProvider');
  }
  return context;
}
