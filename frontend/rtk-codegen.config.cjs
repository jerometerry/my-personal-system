// frontend/rtk-codegen.config.js
module.exports = {
  schemaFile: `http://127.0.0.1:8000/openapi.json?_cacheBust=${Date.now()}`,
  apiFile: './src/state/api.ts',
  outputFile: './src/state/generatedApi.ts',
  exportName: 'api',
  hooks: true,
};