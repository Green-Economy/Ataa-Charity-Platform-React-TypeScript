// ─── API Types — مطابقة 100% للـ Backend Response ─────────────────────────────

export type RoleType = 'user' | 'charity' | 'admin';

export interface User {
  _id: string;
  userName: string;
  email: string;
  phone: string;
  address: string;
  roleType: RoleType;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  charityName?: string;
  licenseNumber?: string;
  nationalId?: string;
}

export interface Charity {
  _id: string;
  charityName: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  charityDescription?: string;
  logo?: string;
  licenseNumber?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Donation {
  _id: string;
  donorId: string;
  donorName?: string;
  // charityId can be a plain string ID or a populated object from the backend
  charityId: string | { _id: string; charityName: string; [key: string]: any };
  charityName?: string;
  type: string;
  size: string;
  quantity: number;
  condition: string;
  description?: string;
  images: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'delivered' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  Total_Donations: number;
  Pending_Donations: number;
  Accepted_Donations: number;
  Rejected_Donations: number;
}

export interface Notification {
  _id: string;
  userId: string;
  title?: string;
  message: string;
  type: 'donation' | 'system' | 'report';
  // Backend uses "status" field — NOT "isRead"
  status: 'read' | 'unread';
  createdAt: string;
}

export interface Rating {
  _id: string;
  donationId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Report {
  _id: string;
  userId: string;
  description: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}

// ─── Auth Response Types ───────────────────────────────────────────────────────

export interface LoginResponse {
  success: boolean;
  message?: string;
  tokens: {
    accessToken: string;
    refreshToken?: string;
  };
  user: User;
}

// tokens? is optional — some backends return them directly on register (skip verify step)
export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: User;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  tokens: {
    accessToken: string;
    refreshToken?: string;
  };
}

export interface ProfileResponse {
  success: boolean;
  user?: User;
  finder?: User;
  data?: User;
  message?: string;
}
