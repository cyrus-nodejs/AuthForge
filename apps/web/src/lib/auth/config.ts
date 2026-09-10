export const authConfig = {
    apiBaseUrl:
      process.env.AUTHFORT_API_URL ??
      'http://localhost:3000/api',
  
    bffOrigin:
      process.env.NEXT_PUBLIC_APP_URL ??
      'http://localhost:3001',
  
    accessCookieName:
      '__Host-authfort_at',
  
    refreshCookieName:
      '__Host-authfort_rt',
  
    accessCookieMaxAge:
      15 * 60,
  
    refreshCookieMaxAge:
      30 * 24 * 60 * 60,
  } as const;