import {
  ROUTE_ABOUT_US,
  ROUTE_IMPRINT,
  ROUTE_PRIVACY_POLICY,
} from '@common/routes';
import { Image, Link } from '@heroui/react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <footer
      className={`w-full py-6 ${theme === 'dark' ? 'bg-primary-900 text-primary-100' : 'bg-primary-100 text-primary-900'} `}
    >
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        {/* Logo und Name */}
        <div className="flex items-center mb-4 md:mb-0">
          <Image
            src={
              theme === 'dark'
                ? '/images/logo-white.png'
                : '/images/logo-black.png'
            }
            alt="Screen Board"
            width={120}
            height={40}
            radius="none"
          />
        </div>

        {/* Navigationslinks */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-4 md:mb-0">
          <Link href="/" className="hover:underline">
            {t('sites.names.home')}
          </Link>
          {/** Füge weitere Links hinzu, falls erforderlich */}
          <Link href={ROUTE_ABOUT_US} className="hover:underline">
            {t('sites.names.aboutus')}
          </Link>
          <Link href={ROUTE_PRIVACY_POLICY} className="hover:underline">
            {t('sites.names.privacyPolicy')}
          </Link>
          <Link href={ROUTE_IMPRINT} className="hover:underline">
            {t('sites.names.imprint')}
          </Link>
        </div>

        {/* Social Media Icons */}
        <div className="flex items-center gap-4">
          <Link href="https://youtube.com" target="_blank" aria-label="Youtube">
            <i className="fab fa-youtube"></i>
          </Link>
          <Link
            href="https://facebook.com"
            target="_blank"
            aria-label="Facebook"
          >
            <i className="fab fa-facebook-f"></i>
          </Link>

          <Link
            href="https://instagram.com"
            target="_blank"
            aria-label="Instagram"
          >
            <i className="fab fa-instagram"></i>
          </Link>
          {/* Füge weitere Social Media Icons nach Bedarf hinzu */}
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-4 text-center text-sm">
        &copy; {new Date().getFullYear()} Screen Board.{' '}
        {t('sites.footer.allRightsReserved')}
      </div>
    </footer>
  );
};

export default Footer;
