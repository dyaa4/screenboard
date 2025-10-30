import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Switch,
} from '@heroui/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const ProfileSettingsModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    darkMode: false,
  });

  const handleSave = () => {
    // Hier kannst du die Logik für das Speichern der Änderungen einfügen
    console.log('Saved settings:', settings);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      aria-labelledby="profile-settings-modal"
    >
      <ModalHeader>{t('modals.profileSettings.title')}</ModalHeader>
      <ModalBody>
        <div className="flex flex-col gap-4">
          <Input
            label={t('modals.profileSettings.email')}
            placeholder={t('modals.profileSettings.enterEmail')}
            defaultValue="user@example.com"
            readOnly
          />
          <div className="flex items-center justify-between">
            <span>{t('modals.profileSettings.emailNotifications')}</span>
            <Switch
              checked={settings.emailNotifications}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  emailNotifications: e.target.checked,
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span>{t('modals.profileSettings.darkMode')}</span>
            <Switch
              checked={settings.darkMode}
              onChange={(e) =>
                setSettings({ ...settings, darkMode: e.target.checked })
              }
            />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="flat" onPress={onClose}>
          {t('actions.cancel')}
        </Button>
        <Button color="primary" onPress={handleSave}>
          {t('actions.save')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ProfileSettingsModal;
