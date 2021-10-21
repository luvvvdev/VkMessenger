module.exports = {
  presets: ["@babel/preset-react", "@babel/plugin-syntax-jsx"],
  env: {
    production: {},
  },
  plugins: [
    [
        "@babel/plugin-syntax-jsx",
      "@babel/plugin-proposal-decorators",
      {
        legacy: true,
      },
    ],
    ["@babel/plugin-proposal-optional-catch-binding"],
  ],
}
