// src/tokenService.js
const TOKEN_KEY = 'googleDriveToken';

// Function to load the token from local storage
export const loadToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? JSON.parse(token) : null;
};

// Function to save the token to local storage
export const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
};
