export const env = {
  apiUrl: import.meta.env.VITE_API_URL as string,
  cognitoDomain: import.meta.env.VITE_COGNITO_DOMAIN as string,
  cognitoClientId: import.meta.env.VITE_COGNITO_CLIENT_ID as string,
  redirectUri: import.meta.env.VITE_REDIRECT_URI as string,
  logoutUri: import.meta.env.VITE_LOGOUT_URI as string,
};
