export enum UserStatus {
  LoggedIn = 'Logged In',
  LoggingIn = 'Logging In',
  LoggedOut = 'Logged Out',
  LogInError = 'Log In Error',
  VerifyingLogIn = 'Verifying Log In',
}

export interface IPosition {
  left: number;
  x: number;
}

export const defaultPosition = (): IPosition => ({
  left: 0,
  x: 0,
});

export interface INumberUtility {
  clamp: (min: number, value: number, max: number) => number;
  rand: (min: number, max: number) => number;
}

export const N: INumberUtility = {
  clamp: (min: number, value: number, max: number) =>
    Math.min(Math.max(min, value), max),
  rand: (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1) + min),
};

export interface ITimeUtility {
  format: (date: Date) => string;
  formatHours: (hours: number) => string;
  formatSegment: (segment: number) => string;
}

export const T: ITimeUtility = {
  format: (date: Date): string => {
    const hours: string = T.formatHours(date.getHours());
    const minutes: number = date.getMinutes();

    return `${hours}:${T.formatSegment(minutes)}`;
  },
  formatHours: (hours: number): string => {
    //24 hour clock
    return hours < 10 ? `0${hours}` : hours.toString();
  },
  formatSegment: (segment: number): string => {
    return segment < 10 ? `0${segment}` : segment.toString();
  },
};

export interface ILogInUtility {
  verify: (pin: string, pinUser: string | null | undefined) => Promise<boolean>;
}

export const LogInUtility: ILogInUtility = {
  verify: async (
    pin: string,
    pinUser: string | null | undefined,
  ): Promise<boolean> => {
    if (!pinUser) {
      throw new Error('No pin code found');
    }

    return new Promise((resolve, reject) => {
      setTimeout(
        () => {
          if (pin === pinUser) {
            resolve(true);
          } else {
            reject(`Invalid pin: ${pin}`);
          }
        },
        N.rand(300, 700),
      );
    });
  },
};
