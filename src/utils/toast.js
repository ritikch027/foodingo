import Toast from 'react-native-toast-message';

const DEFAULTS = {
  visibilityTime: 2600,
};

export const showSimpleToast = (message, options = {}) => {
  Toast.show({
    type: 'simple',
    text1: message,
    position: 'top',
    ...DEFAULTS,
    ...options,
  });
};

export const showSnack = (message, options = {}) => {
  Toast.show({
    type: 'snackbar',
    text1: message,
    position: 'bottom',
    ...DEFAULTS,
    ...options,
  });
};

