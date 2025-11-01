import { useAuth } from '@adapter/ui/contexts/AuthContext';
import {
  ROUTE_ABOUT_US,
  ROUTE_DASHBOARDS,
  ROUTE_HOME,
  ROUTE_PRICE,
  ROUTE_LIVE_INTERACTION,
} from '@common/routes';
import Footer from '@components/Footer/Footer';
import ProfileSettingsModal from '@components/ProfileSettingsModal/ProfileSettingsModal';
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from '@heroui/react';
import { useTheme } from 'next-themes';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSignOutAlt, FaBullhorn } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout, loginWithRedirect } =
    useAuth();

  return (
    <>
      <div className="flex flex-col h-screen">
        <Navbar onMenuOpenChange={setIsMenuOpen}>
          {/* Linke Seite der Navbar */}
          <NavbarContent>
            <NavbarMenuToggle
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              className="lg:hidden"
            />

            <NavbarBrand>
              <div className="flex items-center gap-2">
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
            </NavbarBrand>
          </NavbarContent>

          {/* Zentrale Navigation (Desktop) */}
          <NavbarContent className="hidden lg:flex gap-4" justify="center">
            <NavbarItem>
              <Link color="foreground" href="/">
                {t('sites.names.home')}
              </Link>
            </NavbarItem>

            {isAuthenticated && (
              <NavbarItem>
                <Link color="primary" href={ROUTE_DASHBOARDS}>
                  {t('sites.names.dashboards')}
                </Link>
              </NavbarItem>
            )}

            {isAuthenticated && (
              <NavbarItem>
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      className="text-foreground cursor-pointer hover:text-primary transition-colors"
                      variant="light"
                    >
                      {t('components.navLayout.features')}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Features" variant="faded">
                    <DropdownItem
                      key="live-interaction"
                      textValue="Live Interaction"
                      startContent={<FaBullhorn className="text-primary" size={18} />}
                      onPress={() => navigate(ROUTE_LIVE_INTERACTION)}
                      className="text-sm"
                    >
                      {t('sites.names.liveInteraction')}
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </NavbarItem>
            )}

            <NavbarItem>
              <Link color="foreground" href={ROUTE_PRICE}>
                {t('sites.names.price')}
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link color="foreground" href={ROUTE_ABOUT_US}>
                {t('sites.names.aboutus')}
              </Link>
            </NavbarItem>
          </NavbarContent>

          {/* Rechte Seite der Navbar */}
          <NavbarContent as="div" justify="end">
            {!isAuthenticated && (
              <Button
                color="primary"
                href="#"
                variant="solid"
                onPress={() => loginWithRedirect()}
                isLoading={isLoading}
              >
                {t('actions.login')}
              </Button>
            )}

            {isAuthenticated && (
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <div>
                    <Avatar
                      as="button"
                      isBordered
                      className="transition-transform"
                      color="primary"
                      name={user?.name}
                      size="sm"
                      src={user?.picture}
                    />
                  </div>
                </DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                  <DropdownItem key="profile" textValue="Profile" isReadOnly>
                    <div className="flex items-center">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">
                          {t('components.navLayout.signedAs')}
                        </span>
                        <span className="text-xs text-default-500">
                          {user?.email}
                        </span>
                      </div>
                    </div>
                  </DropdownItem>

                  <DropdownItem
                    key="settings"
                    textValue="Settings"
                    onPress={() => setIsSettingsModalOpen(true)}
                  >
                    <span className="text-sm">
                      {t('components.navLayout.profileSettings')}
                    </span>
                  </DropdownItem>

                  <DropdownItem
                    key="logout"
                    color="danger"
                    endContent={<FaSignOutAlt className="text-danger" />}
                    onPress={logout}
                  >
                    <span className="text-danger">{t('actions.logout')}</span>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            )}
          </NavbarContent>

          {/* Mobile Navigation */}
          <NavbarMenu>
            <NavbarMenuItem>
              <Link href={ROUTE_HOME} color="foreground">
                {t('sites.names.home')}
              </Link>
            </NavbarMenuItem>
            {isAuthenticated && (
              <>
                <NavbarMenuItem>
                  <Link color="foreground" href={ROUTE_DASHBOARDS}>
                    {t('sites.names.dashboards')}
                  </Link>
                </NavbarMenuItem>
              </>
            )}

            <NavbarMenuItem>
              <Link href={ROUTE_PRICE} color="foreground">
                {t('sites.names.price')}
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link href={ROUTE_ABOUT_US} color="foreground">
                {t('sites.names.aboutus')}
              </Link>
            </NavbarMenuItem>
          </NavbarMenu>
        </Navbar>

        <main
          className={`flex flex-col flex-1 overflow-auto ${theme === 'dark' ? 'bg-primary-800' : 'bg-primary-200'
            }`}
        >
          <div className="flex-1">{children}</div>
          <Footer />
        </main>
      </div>

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </>
  );
};

export default Layout;
