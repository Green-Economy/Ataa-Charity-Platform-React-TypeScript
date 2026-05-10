import axios from 'axios';
import * as apiTypes from '../types/apiTypes';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'https://ataa-charity-platform.vercel.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ✅ Auth
export const login = (data: apiTypes.LoginInput) =>
  api.post<apiTypes.AuthResponse>('/auth/login', data);

export const register = (data: apiTypes.RegisterInput) =>
  api.post('/auth/register', data);

export const verifyEmail = (data: apiTypes.VerifyEmailInput) =>
  api.post('/auth/verifyEmail', data);

export const forgetPassword = (data: apiTypes.ForgetPasswordInput) =>
  api.post('/auth/forgetPassword', data);

export const resetPassword = (data: apiTypes.ResetPasswordRequest) =>
  api.post('/auth/resetPassword', data);

export const refreshToken = (data: apiTypes.RefreshTokenRequest) =>
  api.post<apiTypes.RefreshTokenResponse>('/auth/refreshToken', data);

// ✅ Users
export const getProfile = (token: string) =>
  api.get<apiTypes.UserProfile>('/users/profile', { headers: { Authorization: token } });

export const updateProfile = (token: string, data: apiTypes.UpdateProfileInput) =>
  api.patch('/users/profile', data, { headers: { Authorization: token } });

export const changePassword = (token: string, data: apiTypes.ChangePasswordInput) =>
  api.patch('/users/changePassword', data, { headers: { Authorization: token } });

export const deleteAccount = (token: string) =>
  api.delete('/users/account', { headers: { Authorization: token } });

export const getAllUsers = (token: string, page?: number, limit?: number) =>
  api.get<apiTypes.GetUsersResponse>('/users', { headers: { Authorization: token }, params: { page, limit } });

export const getUserById = (token: string, id: string) =>
  api.get<apiTypes.UserProfile>('/users/' + id, { headers: { Authorization: token } });

export const deleteUserById = (token: string, id: string) =>
  api.delete('/users/' + id, { headers: { Authorization: token } });

// ✅ Charities
export const getAllCharities = (token: string, page?: number, limit?: number) =>
  api.get<apiTypes.Charity[]>('/charity/charities', { headers: { Authorization: token }, params: { page, limit } });

export const getCharityById = (token: string, id: string) =>
  api.get<apiTypes.Charity>('/charity/' + id, { headers: { Authorization: token } });

export const updateCharity = (token: string, id: string, data: apiTypes.UpdateCharityInput) =>
  api.patch('/charity/' + id, data, { headers: { Authorization: token } });

export const deleteCharity = (token: string, id: string) =>
  api.delete('/charity/' + id, { headers: { Authorization: token } });

export const approveCharity = (token: string, id: string) =>
  api.patch('/charity/' + id + '/approve', {}, { headers: { Authorization: token } });

export const rejectCharity = (token: string, id: string, data: apiTypes.RejectCharityInput) =>
  api.patch('/charity/' + id + '/reject', data, { headers: { Authorization: token } });

// ✅ Donations
export const createDonation = (token: string, data: apiTypes.CreateDonationInput) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key === "images" && Array.isArray(value)) {
      (value as File[]).forEach((file) => formData.append("images", file));
    } else {
      formData.append(key, String(value));
    }
  });
  return api.post('/donor', formData, { headers: { Authorization: token, 'Content-Type': 'multipart/form-data' } });
};

export const getMyDonations = (token: string, page?: number, limit?: number) =>
  api.get('/donor', { headers: { Authorization: token }, params: { page, limit } });

// ✅ Evaluation
export const createEvaluation = (token: string, donationId: string, data: apiTypes.CreateEvaluationInput) =>
  api.post('/rating/' + donationId, data, { headers: { Authorization: token } });

export const getEvaluation = (token: string, donationId: string) =>
  api.get('/rating/' + donationId, { headers: { Authorization: token } });

// ✅ Reports
export const createReport = (token: string, data: apiTypes.ReportInput) =>
  api.post('/report/addReport', data, { headers: { Authorization: token } });

export const getAllReports = (token: string, page?: number, limit?: number) =>
  api.get('/report/allReports', { headers: { Authorization: token }, params: { page, limit } });

// ✅ AI
export const aiChat = (token: string, message: string) =>
  api.post('/ai/chat', { message }, { headers: { Authorization: token } });

export const aiAnalysis = (token: string, message: string, files: File[]) => {
  const formData = new FormData();
  formData.append('message', message);
  files.forEach(file => formData.append('data', file));
  return api.post('/ai/analysis', formData, { headers: { Authorization: token, 'Content-Type': 'multipart/form-data' } });
};

// ✅ Charity Dashboard
export const getCharityStats = (token: string, license: string) =>
  api.get('/dashboard/stats/' + license, { headers: { Authorization: token } });

export const getCharityDonations = (token: string, license: string, page?: number, limit?: number) =>
  api.get('/dashboard/donations/' + license, { headers: { Authorization: token }, params: { page, limit } });

export const getCharityRequests = (token: string, license: string, page?: number, limit?: number) =>
  api.get('/dashboard/requests/' + license, { headers: { Authorization: token }, params: { page, limit } });

export const changeRequestStatus = (
  token: string, donationId: string, license: string, status: string
) =>
  api.patch(`/dashboard/request/${donationId}/${license}`, { status }, { headers: { Authorization: token } });

// ✅ Notifications
export const getNotifications = (token: string, page?: number, limit?: number) =>
  api.get<apiTypes.Notification[]>('/notification', { headers: { Authorization: token }, params: { page, limit } });

export const markNotificationAsRead = (token: string, notificationId: string) =>
  api.patch(`/notification/${notificationId}`, { status: 'read' }, { headers: { Authorization: token } });

export const deleteNotification = (token: string, notificationId: string) =>
  api.delete(`/notification/${notificationId}`, { headers: { Authorization: token } });

// ✅ Cron (لو ستختبر باللوكال فقط)
export const cronDonationReminder = (token: string) =>
  api.get('/cron/donationReminder', { headers: { Authorization: token } });

export const cronAdminReport = (token: string) =>
  api.get('/cron/adminReport', { headers: { Authorization: token } });