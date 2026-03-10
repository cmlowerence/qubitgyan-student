// src/components/providers/ui-provider.tsx
'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Check, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<DialogType>('alert');
  const [config, setConfig] = useState<DialogOptions>({ title: '', message: '' });
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
        resolver(result); 
    }, 200); 
  };

  const getIcon = () => {
    switch (config.variant) {
      case 'error': return <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />;
      case 'success': return <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />;
      default: return <Info className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />;
    }
  };

  return (
    <UiContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
            onClick={() => type === 'alert' && handleClose(true)}
          />

          <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in-scale border border-slate-100 flex flex-col">
            <div className={cn("h-1.5 w-full shrink-0", 
              config.variant === 'error' ? 'bg-red-500' :
              config.variant === 'success' ? 'bg-green-500' :
              config.variant === 'warning' ? 'bg-amber-500' :
              'bg-blue-500'
            )} />

            <div className="p-5 sm:p-6 lg:p-7">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-2.5 bg-slate-50 rounded-full shrink-0">
                  {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    {config.title}
                  </h3>
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {config.message}
                  </p>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 w-full">
                {type === 'confirm' && (
                  <button
                    onClick={() => handleClose(false)}
                    className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl sm:rounded-lg transition-colors active:scale-[0.98]"
                  >
                    {config.cancelText || 'Cancel'}
                  </button>
                )}
                <button
                  onClick={() => handleClose(true)}
                  className={cn(
                    "w-full sm:w-auto px-6 py-2.5 sm:py-2 text-sm font-semibold text-white rounded-xl sm:rounded-lg shadow-lg transition-all active:scale-[0.98]",
                    config.variant === 'error' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' :
                    config.variant === 'success' ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20' :
                    'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
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

export function useUi() {
  const context = useContext(UiContext);
  if (!context) {
    throw new Error('useUi must be used within a UiProvider');
  }
  return context;
}