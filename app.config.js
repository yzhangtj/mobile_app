import "dotenv/config";

export default {
  expo: {
    name: "Ventify",
    slug: "Ventify",
    privacy: "public",
    platforms: ["ios", "android", "web"],
    version: "1.0.2",
    orientation: "portrait",
    icon: "./assets/app-icon.png",
    splash: {
      image: "./assets/splash-screen-light.png",
      resizeMode: "cover",
      backgroundColor: "#213A4E",
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.capstone80.ventify",
      buildNumber: "1.0.2",
    },
    android: {
      package: "com.capstone80.ventify",
      versionCode: 3,
    },
    description:
      "An app for using MangOH Yellow IoT boards to monitor CO2 levels in offices, lecture halls, and other spaces",
    extra: {
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID,
    },
  },
};
