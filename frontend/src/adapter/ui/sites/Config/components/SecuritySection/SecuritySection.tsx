import { Card, CardBody, CardHeader, InputOtp, Switch } from '@heroui/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiShield } from 'react-icons/fi';

interface SecuritySectionProps {
  pinProtectionEnabled: boolean;
  pinCode: string | null;
  onPinProtectionChange: (value: boolean) => void;
  onPinCodeChange: (value: string) => void;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({
  pinProtectionEnabled,
  pinCode,
  onPinProtectionChange,
  onPinCodeChange,
}) => {
  const { t } = useTranslation();

  // Temporäre Variable für die Eingabe
  const [tempPinCode, setTempPinCode] = React.useState<string | null>(pinCode);
  const [hasStartedTyping, setHasStartedTyping] =
    React.useState<boolean>(false); // Neuer Zustand, um zu tracken, ob der Benutzer tippt

  // Funktion zur Validierung
  const isPinValid = (pin: string) => {
    return pin.length === 4 && /^\d{4}$/.test(pin); // 4 Ziffern prüfen
  };

  const handlePinCodeChange = (value: string) => {
    setTempPinCode(value);
    setHasStartedTyping(true); // Wenn der Benutzer tippt, wird `hasStartedTyping` auf `true` gesetzt

    // Nur den Wert weitergeben, wenn der PIN genau 4 Ziffern hat und gültig ist
    if (value.length === 4 && isPinValid(value)) {
      onPinCodeChange(value); // PIN speichern, wenn 4 Ziffern und gültig
    }
  };

  return (
    <Card fullWidth className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-3 flex gap-3">
        <div className="p-2 rounded-lg bg-success/10">
          <FiShield className="w-5 h-5 text-success" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-default-800">
            {t('sites.config.components.layout.security')}
          </h2>
          <p className="text-sm text-default-500">
            {t('sites.config.components.securitySection.subtitle', { defaultValue: 'Schütze dein Dashboard mit einem PIN' })}
          </p>
        </div>
      </CardHeader>
      <CardBody className="pt-2">
        <div className="flex flex-row items-center gap-4">
          <span>{t('sites.config.components.layout.pinProtection')}</span>
          <Switch
            title="Pin Protection"
            isSelected={pinProtectionEnabled}
            onChange={(e) => {
              if (!e.target.checked) {
                onPinCodeChange(''); // PIN zurücksetzen, wenn deaktiviert
                setTempPinCode(''); // Temporären PIN zurücksetzen
                setHasStartedTyping(false); // `hasStartedTyping` zurücksetzen
              }
              onPinProtectionChange(e.target.checked);
            }}
          />
        </div>
        {pinProtectionEnabled && (
          <div className="mt-2">
            <InputOtp
              color={
                hasStartedTyping && tempPinCode?.length === 4
                  ? 'success'
                  : 'default' // Farbe ändern, wenn der PIN gültig ist
              } // Farbe ändern, wenn der PIN ungültig ist
              length={4}
              isInvalid={
                hasStartedTyping &&
                (tempPinCode?.length !== 4 || !isPinValid(tempPinCode))
              } // Validierung nur nach der ersten Eingabe
              value={tempPinCode!}
              onValueChange={handlePinCodeChange}
              label={t('sites.config.components.layout.enterPin')} // Mehrsprachigkeit
              alt={t('sites.config.components.layout.enterPin')} // Mehrsprachigkeit
              errorMessage={
                hasStartedTyping &&
                (tempPinCode?.length !== 4 || !isPinValid(tempPinCode))
                  ? t('sites.config.errors.invalidPin') // Fehlermeldung, wenn der PIN ungültig ist
                  : undefined
              }
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
};
