const appEnv = import.meta.env.VITE_APP_ENV

if (appEnv !== 'development' && appEnv !== 'production') {
  throw new Error('VITE_APP_ENV must be "development" or "production".')
}

export const env = {
  appEnv,
  isDev: appEnv === 'development',
  isProd: appEnv === 'production',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
}
