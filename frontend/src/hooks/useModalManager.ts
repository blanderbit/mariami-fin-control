import { useState, useCallback } from 'react';
import { ModalState, ModalConfig } from '../types/modal';

export interface UseModalManagerReturn {
  modal: ModalState;
  openModal: (title?: string, content?: React.ReactNode, config?: ModalConfig) => void;
  closeModal: () => void;
  updateModalContent: (content: React.ReactNode) => void;
  updateModalTitle: (title: string) => void;
  updateModalConfig: (config: Partial<ModalConfig>) => void;
}

export const useModalManager = (): UseModalManagerReturn => {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
  });

  const openModal = useCallback((
    title?: string,
    content?: React.ReactNode,
    config?: ModalConfig
  ) => {
    setModal({
      isOpen: true,
      title,
      content,
      config,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModal(prev => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const updateModalContent = useCallback((content: React.ReactNode) => {
    setModal(prev => ({
      ...prev,
      content,
    }));
  }, []);

  const updateModalTitle = useCallback((title: string) => {
    setModal(prev => ({
      ...prev,
      title,
    }));
  }, []);

  const updateModalConfig = useCallback((config: Partial<ModalConfig>) => {
    setModal(prev => ({
      ...prev,
      config: {
        ...prev.config,
        ...config,
      },
    }));
  }, []);

  return {
    modal,
    openModal,
    closeModal,
    updateModalContent,
    updateModalTitle,
    updateModalConfig,
  };
};
