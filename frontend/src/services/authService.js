import api from './api';

export const authService = {
  login: (soDienThoai, matKhau) =>
    api.post('/auth/login', { soDienThoai, matKhau }),

  changePassword: (matKhauCu, matKhauMoi) =>
    api.post('/auth/change-password', { matKhauCu, matKhauMoi })
};
