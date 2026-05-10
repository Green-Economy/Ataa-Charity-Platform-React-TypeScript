// ─── SERVICES — Main Entry Point ─────────────────────────────────────────────
// كل الـ types والـ API calls متنظمة في ملفات منفصلة داخل endpoints/

export * from './types';
export { request } from './api.client';

// ── Endpoint re-exports ────────────────────────────────────────────────────
export { authApi }         from './endpoints/auth';
export { usersApi }        from './endpoints/users';
export { charityApi }      from './endpoints/charities';
export { donorApi }        from './endpoints/donations';
export { dashboardApi }    from './endpoints/dashboard';
export { notificationApi } from './endpoints/notifications';
export { ratingApi, reportApi, aiApi } from './endpoints/misc';
