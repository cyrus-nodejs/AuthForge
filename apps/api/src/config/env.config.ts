export const envConfig = () => ({
  db: {
    uri: process.env.DB_URI,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callBackUrl: process.env.GOOGLE_CALLBACK_URL
  },
  smtp: {
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM,
    port: process.env.SMTP_PORT,
    host: process.env.SMTP_HOST,
    secure:process.env.SMTP_SECURE
  },
  jwt:{
  access:process.env.AUTH_ACCESS_TOKEN_SECRET,
 refresh:process.env.AUTH_REFRESH_TOKEN_SECRET
  }

});
