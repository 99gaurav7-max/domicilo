import { Dialog, Transition } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`w-full ${sizes[size]} transform overflow-hidden rounded-2xl glass-card p-6 transition-all`}>
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">{title}</Dialog.Title>
                  <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', variant = 'danger' }: ConfirmDialogProps) {
  const colors = {
    danger: { bg: 'bg-red-500 hover:bg-red-600', icon: 'text-red-500' },
    warning: { bg: 'bg-amber-500 hover:bg-amber-600', icon: 'text-amber-500' },
    info: { bg: 'bg-blue-500 hover:bg-blue-600', icon: 'text-blue-500' },
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center py-2">
        <AlertTriangle className={`w-12 h-12 ${colors[variant].icon} mb-3`} />
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">{message}</p>
        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${colors[variant].bg}`}>{confirmText}</button>
        </div>
      </div>
    </Modal>
  );
}
