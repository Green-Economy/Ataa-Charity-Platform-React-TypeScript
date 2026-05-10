// // ✅ كل الـ Interfaces مطابقة 100% للـ Response اللي بيرجعه الـ Backend

// export type RoleType = 'user' | 'charity' | 'admin';

// export interface User {
//   _id: string;
//   userName: string;
//   email: string;
//   phone: string;
//   address: string;
//   roleType: RoleType;
//   isVerified?: boolean;
//   createdAt?: string;
//   updatedAt?: string;
//   // حقول خاصة بالجمعيات
//   charityName?: string;
//   licenseNumber?: string;
//   // حقول خاصة بالأدمن
//   nationalId?: string;
// }

// export interface Charity {
//   _id: string;
//   charityName: string;
//   email: string;
//   phone: string;
//   address: string;
//   description: string;
//   charityDescription?: string;
//   logo?: string;
//   licenseNumber?: string;
//   status: 'pending' | 'approved' | 'rejected';
//   rejectionReason?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface Donation {
//   _id: string;
//   donorId: string;
//   donorName?: string;
//   // charityId can be a string ID or a populated object from the backend
//   charityId: string | { _id: string; charityName: string; [key: string]: any };
//   charityName?: string; // sometimes returned flat
//   type: string;
//   size: string;
//   quantity: number;
//   condition: string;
//   description?: string;
//   images: string[];
//   status: 'pending' | 'accepted' | 'rejected' | 'delivered' | 'completed';
//   createdAt: string;
//   updatedAt: string;
// }

// export interface DashboardStats {
//   Total_Donations: number;
//   Pending_Donations: number;
//   Accepted_Donations: number;
//   Rejected_Donations: number;
// }

// export interface Notification {
//   _id: string;
//   userId: string;
//   title: string;
//   message: string;
//   type: 'donation' | 'system' | 'report';
//   status: 'read' | 'unread';
//   createdAt: string;
// }

// export interface Rating {
//   _id: string;
//   donationId: string;
//   userId: string;
//   rating: number;
//   comment?: string;
//   createdAt: string;
// }

// export interface Report {
//   _id: string;
//   userId: string;
//   description: string;
//   status: 'pending' | 'resolved';
//   createdAt: string;
// }

// // ✅ Response Types للـ Auth — دي الأهم!
// export interface LoginResponse {
//   success: boolean;
//   message?: string;
//   tokens: {
//     accessToken: string;
//     refreshToken: string;
//   };
//   user: User;
// }

// // export interface RegisterResponse {
// //   success: boolean;
// //   message: string;
// //   user?: User;
// // }
// export interface RegisterResponse {
//   success: boolean;
//   message: string;
//   user?: User;
//   // optional: بعض الـ roles (user) بيرجع الـ tokens مباشرة بدون verify email
//   tokens?: {
//     accessToken: string;
//     refreshToken: string;
//   };
// }

// export interface RefreshTokenResponse {
//   success: boolean;
//   tokens: {
//     accessToken: string;
//     refreshToken?: string;
//   };
// }

// export interface ProfileResponse {
//   success: boolean;
//   user?: User;
//   finder?: User;  // للـ Backend اللي بيرجع finder
//   data?: User;    // للـ Backend اللي بيرجع data
//   message?: string;
// }



// ═══════════════════════════════════════════════════════════════
// ФАЙЛ: src/services/types.ts
// الإصلاح: Warning #5 — RegisterResponse يجب أن يدعم tokens الاختيارية
// ═══════════════════════════════════════════════════════════════

// ❌ النوع القديم:
// export interface RegisterResponse {
//   success: boolean;
//   message: string;
//   user?: User;
// }

// ✅ النوع الصحيح — يدعم tokens اختيارية (بعض Backends تُرجع توكنات مع التسجيل)
export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: User;
  // optional: بعض الـ roles (user) بيرجع الـ tokens مباشرة بدون verify email
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

// ═══════════════════════════════════════════════════════════════
// الملف الكامل المصحح: src/services/types.ts
// ═══════════════════════════════════════════════════════════════

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
  title: string;
  message: string;
  type: 'donation' | 'system' | 'report';
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

// ✅ Auth Response Types
export interface LoginResponse {
  success: boolean;
  message?: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: User;
}

// ✅ إصلاح: أضفنا tokens? الاختيارية
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