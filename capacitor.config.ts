import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.giulia.os',
  appName: 'Giulia',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Optioneel — laad de live Base44-app in plaats van lokaal gebouwde assets:
    // url: 'https://your-app.base44.app',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  ios: {
    contentInset: 'always',
    scrollEnabled: false,
  },
  android: {
    backgroundColor: '#f5f1e8',
  },
};

export default config;