import api from './api';

export const authService = {
  login: (phoneNumber, password) =>
    api.post('/auth/login', { phoneNumber, password }),

  changePassword: (oldPassword, newPassword) =>
    api.put('/auth/change-password', { oldPassword, newPassword })
};
