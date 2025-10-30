import { useAuth } from '@adapter/ui/contexts/AuthContext';
import LocaleSwitcher from '@components/LocaleSwitcher/LocaleSwitcher';
import {
  Avatar,
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Switch,
} from '@heroui/react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { FiUser, FiMail, FiGlobe, FiSun, FiMoon } from 'react-icons/fi';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileSettingsModal = ({
  isOpen,
  onClose,
}: ProfileSettingsModalProps) => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: 'bg-background',
        header: 'border-b border-divider',
        body: 'py-6',
        footer: 'border-t border-divider',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('components.navLayout.profileSettings')}
          </h2>
          <p className="text-sm text-default-500 font-normal">
            {t('components.profileSettings.subtitle', {
              defaultValue: 'Verwalte deine Profil- und App-Einstellungen',
            })}
          </p>
        </ModalHeader>
        <ModalBody>
          {/* User Information Section */}
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FiUser className="text-primary" />
                </div>
                {t('components.profileSettings.userInfo', {
                  defaultValue: 'Benutzerinformationen',
                })}
              </h3>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-default-100">
                <Avatar
                  src={user?.picture}
                  name={user?.name}
                  size="lg"
                  isBordered
                  color="primary"
                />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <FiUser className="text-default-500" size={16} />
                    <span className="font-semibold text-default-800">
                      {user?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMail className="text-default-500" size={16} />
                    <span className="text-sm text-default-600">
                      {user?.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Divider />

            {/* Language Settings Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <FiGlobe className="text-secondary" />
                </div>
                {t('components.profileSettings.language', {
                  defaultValue: 'Sprache',
                })}
              </h3>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-default-600 mb-2">
                  {t('components.profileSettings.languageDescription', {
                    defaultValue: 'Wähle deine bevorzugte Sprache',
                  })}
                </p>
                <LocaleSwitcher />
              </div>
            </div>

            <Divider />

            {/* Theme Settings Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-warning/10">
                  {theme === 'dark' ? (
                    <FiMoon className="text-warning" />
                  ) : (
                    <FiSun className="text-warning" />
                  )}
                </div>
                {t('components.profileSettings.theme', {
                  defaultValue: 'Design',
                })}
              </h3>
              <div className="flex items-center justify-between p-4 rounded-lg bg-default-100">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-default-800">
                    {t('components.profileSettings.darkMode', {
                      defaultValue: 'Dunkler Modus',
                    })}
                  </span>
                  <span className="text-sm text-default-600">
                    {t('components.profileSettings.darkModeDescription', {
                      defaultValue:
                        'Aktiviere den dunklen Modus für eine angenehmere Ansicht bei Nacht',
                    })}
                  </span>
                </div>
                <Switch
                  isSelected={theme === 'dark'}
                  onValueChange={(isSelected) =>
                    setTheme(isSelected ? 'dark' : 'light')
                  }
                  size="lg"
                  color="primary"
                  thumbIcon={({ isSelected, className }) =>
                    isSelected ? (
                      <FaMoon className={className} />
                    ) : (
                      <FaSun className={className} />
                    )
                  }
                />
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end mt-4">
              <Button color="primary" variant="shadow" onPress={onClose}>
                {t('actions.close', { defaultValue: 'Schließen' })}
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ProfileSettingsModal;
