module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // 👇👇 This must be the last plugin
    'react-native-reanimated/plugin',
  ],
};
