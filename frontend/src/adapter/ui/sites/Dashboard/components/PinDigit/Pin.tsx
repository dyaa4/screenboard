import React from 'react';

import { LogInUtility, UserStatus } from '../helper';
import { AppContext } from '../../Dashboard';
import PinDigit from './PinDigit';
import { useTranslation } from 'react-i18next';
import { Layout } from '@domain/entities/Layout';
export interface PinProps {
  layout: Layout | undefined;
}
const Pin = (props: PinProps): JSX.Element => {
  const { t } = useTranslation();
  const { layout } = props;
  const { userStatus, setUserStatusTo } = React.useContext(AppContext);

  const [pin, setPinTo] = React.useState<string>('');

  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (
      userStatus === UserStatus.LoggingIn ||
      userStatus === UserStatus.LogInError
    ) {
      ref.current?.focus();
    } else {
      setPinTo('');
    }
  }, [userStatus]);

  React.useEffect(() => {
    if (pin.length === 4) {
      const verify = async (): Promise<void> => {
        try {
          setUserStatusTo(UserStatus.VerifyingLogIn);

          if (await LogInUtility.verify(pin, layout?.pinCode)) {
            setUserStatusTo(UserStatus.LoggedIn);
          }
        } catch (err) {
          console.error(err);

          setUserStatusTo(UserStatus.LogInError);
        }
      };

      verify();
    }

    if (userStatus === UserStatus.LogInError) {
      setUserStatusTo(UserStatus.LoggingIn);
    }
  }, [pin]);

  const handleOnClick = (): void => {
    ref.current?.focus();
  };

  const handleOnCancel = (): void => {
    setUserStatusTo(UserStatus.LoggedOut);
  };

  const handleOnChange = (e: any): void => {
    if (e.target.value.length <= 4) {
      setPinTo(e.target.value.toString());
    }
  };

  const getCancelText = (): JSX.Element => {
    return (
      <span className="cursor-pointer text-white" onClick={handleOnCancel}>
        {t('actions.cancel')}
      </span>
    );
  };

  const getErrorText = (): React.ReactNode => {
    if (userStatus === UserStatus.LogInError) {
      return <span id="app-pin-error-text">Invalid</span>;
    }
  };

  return (
    <div id="app-pin-wrapper">
      <input
        disabled={
          userStatus !== UserStatus.LoggingIn &&
          userStatus !== UserStatus.LogInError
        }
        id="app-pin-hidden-input"
        maxLength={4}
        ref={ref}
        type="number"
        value={pin}
        onChange={handleOnChange}
      />
      <div id="app-pin" onClick={handleOnClick}>
        <PinDigit focused={pin.length === 0} value={pin[0]} />
        <PinDigit focused={pin.length === 1} value={pin[1]} />
        <PinDigit focused={pin.length === 2} value={pin[2]} />
        <PinDigit focused={pin.length === 3} value={pin[3]} />
      </div>
      <h3 className="text-white">
        {t('sites.dashboard.components.pin.enterPin')} {getErrorText()}
        {getCancelText()}
      </h3>
    </div>
  );
};

export default Pin;
