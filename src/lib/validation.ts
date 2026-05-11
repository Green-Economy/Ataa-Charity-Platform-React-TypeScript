// Validation regexes from backend spec
export const nameRegex = /^[a-zA-Z\u0621-\u064A][^#&<>"~;$^%{}]{2,29}$/;
export const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
export const phoneRegex = /^(002|\+2)?01[0125][0-9]{8}$/;
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const licenseRegex = /^[A-Z0-9]{2,5}-[A-Z0-9]{3,10}-[0-9]{2,6}$/i;
export const nationalIDRegex = /^\d{14}$/;

export function validateName(val: string): string {
  if (!val) return 'الاسم مطلوب';
  if (!nameRegex.test(val)) return 'الاسم يجب أن يكون من 3-30 حرفًا ولا يحتوي رموز خاصة';
  return '';
}

export function validateEmail(val: string): string {
  if (!val) return 'البريد الإلكتروني مطلوب';
  if (!emailRegex.test(val)) return 'صيغة البريد الإلكتروني غير صحيحة';
  return '';
}

export function validatePhone(val: string): string {
  if (!val) return 'رقم الهاتف مطلوب';
  if (!phoneRegex.test(val)) return 'رقم الهاتف غير صحيح (مثال: 01xxxxxxxxx)';
  return '';
}

export function validatePassword(val: string): string {
  if (!val) return 'كلمة المرور مطلوبة';
  if (!passwordRegex.test(val)) return 'يجب أن تحتوي على 8 أحرف على الأقل وتشمل أرقامًا وأحرف كبيرة وصغيرة';
  return '';
}

export function validateLicense(val: string): string {
  if (!val) return 'رقم الترخيص مطلوب';
  if (!licenseRegex.test(val)) return 'رقم الترخيص غير صحيح (مثال: AB-CDE12-2024)';
  return '';
}

export function validateNationalId(val: string): string {
  if (!val) return 'الرقم القومي مطلوب';
  if (!nationalIDRegex.test(val)) return 'الرقم القومي يجب أن يكون 14 رقمًا';
  return '';
}

export function validateAddress(val: string): string {
  if (!val || val.trim().length < 3) return 'العنوان مطلوب (3 أحرف على الأقل)';
  return '';
}
