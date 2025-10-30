import React, { useEffect, useState } from 'react';
import {
  Button,
  Input,
  Select,
  SelectItem,
  Tooltip,
  Card,
  CardBody,
  CardHeader,
} from '@heroui/react';
import { QRCodeSVG } from 'qrcode.react';
import {
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaPlus,
  FaTrash,
  FaQrcode,
  FaList,
} from 'react-icons/fa';

import { useTranslation } from 'react-i18next';
import { QRCodeWidgetSettings } from '../../../../../../domain/types';
import { QRCodeData } from '../../../../../../domain/types/widget/QRCodeWidgetSettings';

interface QRCodeEditProps {
  settings: QRCodeWidgetSettings;
  onSettingsChange: (settings: QRCodeWidgetSettings, valid: boolean) => void;
}

interface FormData {
  name: string;
  type: 'text' | 'url' | 'wifi';
  content: string;
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
}

const initialFormData: FormData = {
  name: '',
  type: 'text',
  content: '',
  ssid: '',
  password: '',
  encryption: 'WPA',
};

const QRCodeEdit: React.FC<QRCodeEditProps> = ({
  settings,
  onSettingsChange,
}) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<QRCodeData[]>(settings.qrcodes);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showNameError, setShowNameError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (editingIndex !== null) {
      const item = items[editingIndex];
      setFormData({
        name: item.name,
        type: item.type,
        content: item.data.text || item.data.url || '',
        ssid: item.data.wifi?.ssid || '',
        password: item.data.wifi?.password || '',
        encryption: item.data.wifi?.encryption || 'WPA',
      });
    } else {
      setFormData(initialFormData);
    }
    setShowNameError(false);
  }, [editingIndex, items]);

  useEffect(() => {
    const isValid = items.length > 0;
    onSettingsChange({ qrcodes: items }, isValid);
  }, [items, onSettingsChange]);

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'name') {
      setShowNameError(false);
    }
  };

  const handleSubmit = (): void => {
    if (!formData.name.trim()) {
      setShowNameError(true);
      return;
    }

    const newQRCode: QRCodeData = createQRCodeData(formData);
    const updatedItems =
      editingIndex !== null
        ? items.map((item, index) =>
            index === editingIndex
              ? { ...newQRCode, lastModified: new Date() }
              : item,
          )
        : [...items, newQRCode];

    setItems(updatedItems);
    resetForm();
  };

  const resetForm = (): void => {
    setFormData(initialFormData);
    setEditingIndex(null);
    setShowNameError(false);
    setShowPassword(false);
  };

  const deleteItem = (index: number): void => {
    setItems(items.filter((_, i) => i !== index));
    if (editingIndex === index) {
      resetForm();
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex gap-3">
          <FaQrcode />
          <div className="flex flex-col">
            <p className="text-md">
              {editingIndex !== null
                ? t('sites.config.components.qrcodeEdit.editQRCode')
                : t('sites.config.components.qrcodeEdit.createQRCode')}
            </p>
            <p className="text-small text-default-500">
              {t('sites.config.components.qrcodeEdit.createQRCodeDesc')}
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <QRCodeForm
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            resetForm={resetForm}
            editingIndex={editingIndex}
            showNameError={showNameError}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        </CardBody>
      </Card>

      {editingIndex === null && (
        <Card>
          <CardHeader className="flex gap-3">
            <FaList />
            <div className="flex flex-col">
              <p className="text-md">
                {t('sites.config.components.qrcodeEdit.qrCodeList')}
              </p>
              <p className="text-small text-default-500">
                {t('sites.config.components.qrcodeEdit.qrCodeListDesc')}
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <QRCodeList
              items={items}
              setEditingIndex={setEditingIndex}
              deleteItem={deleteItem}
            />
            {items.length === 0 && (
              <p className="text-danger mt-2">
                {t('sites.config.components.qrcodeEdit.qrCodeRequired')}
              </p>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
};

interface QRCodeFormProps {
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: string) => void;
  handleSubmit: () => void;
  resetForm: () => void;
  editingIndex: number | null;
  showNameError: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
}

const QRCodeForm: React.FC<QRCodeFormProps> = ({
  formData,
  handleInputChange,
  handleSubmit,
  resetForm,
  editingIndex,
  showNameError,
  showPassword,
  setShowPassword,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3">
      <Input
        fullWidth
        placeholder="Name des QR Codes"
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
        label="Name"
        isRequired
        isInvalid={showNameError}
        errorMessage={
          showNameError
            ? t('sites.config.components.qrcodeEdit.nameRequired')
            : undefined
        }
      />
      <Select
        className="max-w-xs"
        label={t('sites.config.components.qrcodeEdit.type')}
        value={formData.type}
        selectedKeys={[formData.type]}
        onChange={(e) =>
          handleInputChange('type', e.target.value as FormData['type'])
        }
      >
        <SelectItem key="text">
          {t('sites.config.components.qrcodeEdit.text')}
        </SelectItem>
        <SelectItem key="url">
          {t('sites.config.components.qrcodeEdit.url')}
        </SelectItem>
        <SelectItem key="wifi">
          {t('sites.config.components.qrcodeEdit.wifi')}
        </SelectItem>
      </Select>
      {formData.type === 'wifi' ? (
        <WifiInputs
          formData={formData}
          handleInputChange={handleInputChange}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />
      ) : (
        <Input
          fullWidth
          placeholder={formData.type === 'text' ? 'Text' : 'URL'}
          value={formData.content}
          onChange={(e) => handleInputChange('content', e.target.value)}
        />
      )}
      <div className="flex gap-2">
        <Button
          onPress={handleSubmit}
          startContent={editingIndex !== null ? <FaEdit /> : <FaPlus />}
        >
          {editingIndex !== null ? 'Update' : 'Add'} QR Code
        </Button>
        {editingIndex !== null && (
          <Button color="secondary" onPress={resetForm}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

interface WifiInputsProps {
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
}

const WifiInputs: React.FC<WifiInputsProps> = ({
  formData,
  handleInputChange,
  showPassword,
  setShowPassword,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <Input
        fullWidth
        placeholder="SSID"
        value={formData.ssid}
        onChange={(e) => handleInputChange('ssid', e.target.value)}
      />
      <Input
        fullWidth
        placeholder="Passwort"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={(e) => handleInputChange('password', e.target.value)}
        endContent={
          <Button
            isIconOnly
            className="focus:outline-none"
            type="button"
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <FaEyeSlash className="text-2xl text-default-400 pointer-events-none" />
            ) : (
              <FaEye className="text-2xl text-default-400 pointer-events-none" />
            )}
          </Button>
        }
      />
      <Select
        className="max-w-xs"
        label={t('sites.config.components.qrcodeEdit.encryption')}
        value={formData.encryption}
        selectedKeys={[formData.encryption]}
        onChange={(e) =>
          handleInputChange(
            'encryption',
            e.target.value as FormData['encryption'],
          )
        }
      >
        <SelectItem key="WPA">WPA</SelectItem>
        <SelectItem key="WEP">WEP</SelectItem>
        <SelectItem key="nopass">
          {t('sites.config.components.qrcodeEdit.noPassword')}
        </SelectItem>
      </Select>
    </>
  );
};

const QRCodeList: React.FC<{
  items: QRCodeData[];
  setEditingIndex: (index: number) => void;
  deleteItem: (index: number) => void;
}> = ({ items, setEditingIndex, deleteItem }) => (
  <div className="max-h-[300px] overflow-y-auto">
    <ul className="flex flex-col gap-2">
      {items.map((item, index) => (
        <QRCodeItem
          key={index}
          item={item}
          index={index}
          setEditingIndex={setEditingIndex}
          deleteItem={deleteItem}
        />
      ))}
    </ul>
  </div>
);

const QRCodeItem: React.FC<{
  item: QRCodeData;
  index: number;
  setEditingIndex: (index: number) => void;
  deleteItem: (index: number) => void;
}> = ({ item, index, setEditingIndex, deleteItem }) => (
  <li className="flex items-center justify-between border rounded-md p-2">
    <div className="grow min-w-0 mr-2">
      <Tooltip placement="top-start" content={item.name} showArrow>
        <span className="text-foreground truncate cursor-pointer">
          {item.name}
        </span>
      </Tooltip>
    </div>
    <div className="shrink-0 mx-2">
      <QRCodeSVG value={generateQRValue(item)} size={64} />
    </div>
    <div className="shrink-0 flex gap-2">
      <Tooltip content="Edit" placement="left">
        <Button
          isIconOnly
          size="sm"
          variant="faded"
          onPress={() => setEditingIndex(index)}
        >
          <FaEdit />
        </Button>
      </Tooltip>
      <Tooltip content="Delete" placement="right">
        <Button
          isIconOnly
          size="sm"
          variant="faded"
          color="danger"
          onPress={() => deleteItem(index)}
        >
          <FaTrash />
        </Button>
      </Tooltip>
    </div>
  </li>
);

function createQRCodeData(formData: FormData): QRCodeData {
  const now = new Date();
  return {
    name: formData.name,
    type: formData.type,
    data:
      formData.type === 'wifi'
        ? {
            wifi: {
              ssid: formData.ssid,
              password: formData.password,
              encryption: formData.encryption,
            },
          }
        : { [formData.type]: formData.content },
    createdAt: now,
    lastModified: now,
  };
}

function generateQRValue(item: QRCodeData): string {
  switch (item.type) {
    case 'text':
      return item.data.text || '';
    case 'url':
      return item.data.url || '';
    case 'wifi':
      const { ssid, password, encryption } = item.data.wifi || {};
      return `WIFI:T:${encryption};S:${ssid};P:${password};;`;
    default:
      return '';
  }
}

export default QRCodeEdit;
