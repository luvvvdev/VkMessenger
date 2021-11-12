module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  env: {
    production: {
      plugins: ["transform-remove-console"],
    },
  },
  plugins: [
    "@babel/plugin-transform-flow-strip-types",
    "@babel/proposal-object-rest-spread",
    "@babel/plugin-syntax-jsx",
    ["@babel/plugin-proposal-decorators", { legacy: true }],
    ["@babel/plugin-proposal-class-properties", { loose: true }],
  ],
}
