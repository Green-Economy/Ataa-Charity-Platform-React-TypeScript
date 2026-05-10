// -------- AUTH --------
export interface LoginInput { email: string; password: string; }
export interface AuthResponse { success: boolean; accessToken: string; refreshToken: string; }
export interface RegisterInput {
  userName?: string;
  charityName?: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  address: string;
  roleType?: 'user' | 'charity' | 'admin';
  licenseNumber?: string;
  charityDescription?: string;
  nationalID?: string;
}
export interface VerifyEmailInput { email: string; code: string; }
export interface ForgetPasswordInput { email: string; }
export interface ResetPasswordRequest { email: string; code: string; password: string; confirmPassword: string; }
export interface RefreshTokenRequest { refreshToken: string; }
export interface RefreshTokenResponse { success: boolean; accessToken: string; }

// -------- USER --------
export interface UserProfile {
  _id: string;
  userName: string;
  email: string;
  phone: string;
  address: string;
  roleType: 'user' | 'charity' | 'admin';
}
export interface UpdateProfileInput { userName?: string; address?: string; phone?: string; }
export interface ChangePasswordInput { oldPassword: string; newPassword: string; confirmPassword: string; }
export interface GetUsersResponse { success: boolean; data: UserProfile[]; }

// -------- CHARITY --------
export interface Charity {
  _id: string;
  charityName: string;
  email: string;
  phone: string;
  address: string;
  description: string;
}
export interface UpdateCharityInput { charityName?: string; address?: string; description?: string; }
export interface RejectCharityInput { reason: string; }

// -------- DONATIONS --------
export interface CreateDonationInput {
  type: string;
  size: string;
  quantity: number;
  description?: string;
  images: File[];
  condition: string;
}

// -------- EVALUATION --------
export interface CreateEvaluationInput { rating: number; comment?: string; }

// -------- REPORT --------
export interface ReportInput { description: string; }

// -------- NOTIFICATIONS --------
export interface Notification { _id: string; status: 'read' | 'unread'; message: string; }