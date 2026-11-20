import Constants from 'expo-constants';

// Public backend (used in production builds, or when no local backend can be found)
const PUBLIC_API_URL = 'https://revzone-backend.onrender.com/api';
const LOCAL_API_PORT = 5000;

// In development, the phone loads the app from your PC (Expo shows it as "192.168.x.x:8081").
// The backend runs on that same PC, so we reuse that address: no need to edit this file
// every time you change Wi-Fi.
const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
const isLocalIp = !!expoHost && /^\d{1,3}(\.\d{1,3}){3}$/.test(expoHost);

export const API_URL = __DEV__ && isLocalIp
    ? `http://${expoHost}:${LOCAL_API_PORT}/api`
    : PUBLIC_API_URL;
