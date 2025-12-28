// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  srcDir: 'app',

  nitro: {
    externals: {
      inline: ['dotenv']
    }
  },

  vite: {
    optimizeDeps: {
      exclude: ['bcryptjs', 'jsonwebtoken', 'winston', 'nodemailer', 'cloudinary']
    },
    plugins: [
      tailwindcss(),
    ],
    server: {
      allowedHosts: ['dlas.leci.app', 'all'],
    }
  },

  runtimeConfig: {
    // Database Configuration
    // Database Configuration
    databaseUrl: process.env.DATABASE_URL,
    databaseUser: process.env.DATABASE_USER,
    databasePassword: process.env.DATABASE_PASSWORD,
    databaseName: process.env.DATABASE_NAME,
    databaseHost: process.env.DATABASE_HOST,
    databasePort: process.env.DATABASE_PORT,

    // JWT Configuration
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,

    // Mail Configuration
    mailHost: process.env.MAIL_HOST,
    mailPort: process.env.MAIL_PORT,
    mailUsername: process.env.MAIL_USERNAME,
    mailPassword: process.env.MAIL_PASSWORD,
    mailFromName: process.env.MAIL_FROM_NAME,
    mailFromAddress: process.env.MAIL_FROM_ADDRESS,
    mailSecure: process.env.MAIL_SECURE,

    // Cloudinary Configuration
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,

    // Redis Configuration
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT,
    redisPassword: process.env.REDIS_PASSWORD,
    redisDb: process.env.REDIS_DB,

    // Midtrans Configuration (Server Side)
    midtransServerKey: process.env.MIDTRANS_SERVER_KEY,
    midtransIsProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',

    public: {
      midtransClientKey: process.env.MIDTRANS_CLIENT_KEY,
      midtransIsProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      // App URL
      appUrl: process.env.APP_URL || 'http://localhost:3000',
    }
  },

  css: ['~/assets/css/main.css'],

  modules: ['@pinia/nuxt', '@nuxt/image'],

  image: {
    quality: 80,
    format: ['webp', 'avif', 'jpeg'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },

  pinia: {
    storesDirs: ['~/stores/**'],
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'id'
      }
    }
  }
})

