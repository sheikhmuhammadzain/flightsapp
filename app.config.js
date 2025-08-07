import 'dotenv/config';

export default {
  expo: {
    name: "MyFlightApp",
    slug: "MyFlightApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-secure-store"
    ],
    extra: {
      RAPIDAPI_KEY: process.env.X_RapidAPI_Key,
      CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
    }
  }
};
