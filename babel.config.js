module.exports = {
  presets: [
    'module:metro-react-native-babel-preset',
    
  ],
  plugins: [
    ['module:react-native-dotenv', {
      'moduleName': '@env',
      'path': '.env',
      'blacklist': null,
      'whitelist': null,
      'safe': false,
      'allowUndefined': true
    }],
    'react-native-reanimated/plugin',
    [
      '@babel/plugin-transform-class-properties',
      { loose: true } // Tai false, riippuen tarpeista
    ],
    [
      '@babel/plugin-transform-private-methods',
      { loose: true } // Tai false, riippuen tarpeista
    ],
    [
      '@babel/plugin-transform-private-property-in-object',
      { loose: true } // Tai false, riippuen tarpeista
    ],
  ]
};




