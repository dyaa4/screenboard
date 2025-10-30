import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Input,
  ModalFooter,
  Button,
} from '@heroui/react';
import { useTranslation } from 'react-i18next';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  title: string;
  isLoading: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
  inputLabel: string;
  actionLabel: string;
}

const DashboardModal = ({
  isOpen,
  onClose,
  onSave,
  title,
  isLoading,
  inputValue,
  setInputValue,
  inputLabel,
  actionLabel,
}: DashboardModalProps) => {
  const { t } = useTranslation();
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      classNames={{ base: 'backdrop-blur-md' }}
    >
      <ModalContent>
        <ModalHeader className="text-xl font-bold">{title}</ModalHeader>
        <ModalBody>
          <Input
            label={inputLabel}
            value={inputValue}
            variant="bordered"
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full"
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            {t('actions.cancel')}
          </Button>
          <Button color="primary" onPress={onSave} isLoading={isLoading}>
            {actionLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DashboardModal;
