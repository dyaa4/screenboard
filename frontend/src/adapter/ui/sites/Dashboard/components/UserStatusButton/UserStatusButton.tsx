import React from 'react';

import { UserStatus } from '../helper';
import { AppContext } from '../../Dashboard';
import { Button } from '@heroui/react';

export interface IUserStatusButton {
  icon: string;
  id: string;
  userStatus: UserStatus;
  pinCode?: string;
}

export const UserStatusButton = (props: IUserStatusButton): JSX.Element => {
  const { userStatus, setUserStatusTo } = React.useContext(AppContext);

  const handleOnClick = (): void => {
    setUserStatusTo(props.userStatus);
  };

  return (
    <Button
      isIconOnly
      id={props.id}
      className="user-status-button clear-button"
      disabled={userStatus === props.userStatus}
      type="button"
      onPress={handleOnClick}
    >
      <i className={props.icon} />
    </Button>
  );
};
