import i18n from '@adapter/ui/i18n/i18n';
import { Avatar, Select, SelectItem } from '@heroui/react';
import React, { useEffect, useState } from 'react';

interface SupportedLanguage {
  code: string;
  name: string;
  flagUrl: string;
  nativeName: string;
}

const supportedLanguages: SupportedLanguage[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flagUrl: 'https://flagcdn.com/us.svg',
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flagUrl: 'https://flagcdn.com/de.svg',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flagUrl: 'https://flagcdn.com/sy.svg',
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flagUrl: 'https://flagcdn.com/ru.svg',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flagUrl: 'https://flagcdn.com/es.svg',
  },
  {
    code: 'cn',
    name: 'Chinese',
    nativeName: '中文',
    flagUrl: 'https://flagcdn.com/cn.svg',
  },
];

const LocaleSwitcher: React.FC = () => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLanguage(lng);
      console.log('Language changed to:', lng);
    };

    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  const handleLanguageChange = (value: string) => {
    console.log('Changing language to:', value);
    i18n.changeLanguage(value).catch((error) => {
      console.error('Error changing language:', error);
    });
  };

  return (
    <Select
      items={supportedLanguages}
      selectedKeys={[currentLanguage]}
      onSelectionChange={(keys) =>
        handleLanguageChange(Array.from(keys)[0] as string)
      }
      size="lg"
      className="w-48 "
      variant="flat"
      listboxProps={{
        itemClasses: {},
      }}
      popoverProps={{
        classNames: {
          base: 'before:bg-default-200',
          content: 'p-0 border-small border-divider ',
        },
      }}
      renderValue={(languages) => {
        return languages.map((language) => (
          <div key={language.data!.code} className="flex items-center gap-2">
            <Avatar
              alt={language.data!.name}
              className="shrink-0"
              size="sm"
              src={language.data!.flagUrl}
            />
            <div className="flex flex-col">
              <span className="text-foreground">
                {language.data!.nativeName}
              </span>
            </div>
          </div>
        ));
      }}
    >
      {(language) => (
        <SelectItem key={language.code} textValue={language.name}>
          <div className="flex gap-2 items-center">
            <Avatar
              alt={language.name}
              className="shrink-0"
              size="sm"
              src={language.flagUrl}
            />
            <div className="flex flex-col">
              <span className="text-small text-foreground">
                {language.nativeName}
              </span>
              <span className="text-tiny text-foreground">{language.name}</span>
            </div>
          </div>
        </SelectItem>
      )}
    </Select>
  );
};

export default LocaleSwitcher;
