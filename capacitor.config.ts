import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'ITS-example',
  webDir: 'dist/dis-template',
  bundledWebRuntime: false,
  server: {
    cleartext: true,
  }
};

export default config;
