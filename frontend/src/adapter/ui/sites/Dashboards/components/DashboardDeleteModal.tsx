import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react';
import { FiAlertTriangle, FiTrash2 } from 'react-icons/fi';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  isLoading: boolean;
  dashboardName: string;
}

const DashboardDeleteModal = ({
  isOpen,
  onClose,
  onDelete,
  isLoading,
  dashboardName,
}: DeleteModalProps) => (
  <Modal
    isOpen={isOpen}
    onOpenChange={onClose}
    classNames={{ base: 'backdrop-blur-md' }}
  >
    <ModalContent>
      <ModalHeader className="flex gap-2 items-center text-warning">
        <FiAlertTriangle size={24} />
        <span className="text-xl font-bold">Dashboard löschen</span>
      </ModalHeader>
      <ModalBody>
        <p className="text-default-700">
          Sind Sie sicher, dass Sie das Dashboard "{dashboardName}" löschen
          möchten?
        </p>
        <p className="text-sm text-default-500 mt-2">
          Diese Aktion kann nicht rückgängig gemacht werden. Folgende Daten
          werden unwiderruflich gelöscht:
        </p>
        <ul className="list-disc list-inside text-sm text-default-500 mt-1">
          <li>Alle Dashboard-Konfigurationen</li>
          <li>Alle zugehörigen Widgets und deren Einstellungen</li>
          <li>Gespeicherte Filtereinstellungen</li>
          <li>Benutzerdefinierte Layouts</li>
        </ul>
      </ModalBody>
      <ModalFooter>
        <Button variant="light" onPress={onClose}>
          Abbrechen
        </Button>
        <Button
          color="danger"
          onPress={onDelete}
          startContent={<FiTrash2 size={16} />}
          isLoading={isLoading}
        >
          Endgültig löschen
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

export default DashboardDeleteModal;
