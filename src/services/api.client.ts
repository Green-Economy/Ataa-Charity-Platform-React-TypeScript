// // ✅ HTTP Client مع معالجة الـ Token صح (بدون Bearer) + Refresh تلقائي

// const BASE_URL = import.meta.env.VITE_API_URL || 'https://ataa-charity-platform.vercel.app';

// function getToken(): string | null {
//   return localStorage.getItem('accessToken');
// }

// function getRefreshToken(): string | null {
//   return localStorage.getItem('refreshToken');
// }

// async function refreshAccessToken(): Promise<string | null> {
//   const refreshToken = getRefreshToken();
//   if (!refreshToken) return null;

//   try {
//     const res = await fetch(`${BASE_URL}/auth/refreshToken`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ refreshToken }),
//     });

//     if (!res.ok) return null;

//     const data = await res.json();

//     // ✅ الباك اند بيرجع: { tokens: { accessToken, refreshToken? } }
//     const newToken = data?.tokens?.accessToken;
//     if (!newToken) return null;

//     localStorage.setItem('accessToken', newToken);

//     // لو جاي توكن جديد للـ refresh، حدّثه
//     const newRefresh = data?.tokens?.refreshToken;
//     if (newRefresh) {
//       localStorage.setItem('refreshToken', newRefresh);
//     }

//     return newToken;
//   } catch (error) {
//     console.error('❌ Token refresh failed:', error);
//     return null;
//   }
// }

// export async function request<T = any>(
//   path: string,
//   options: RequestInit = {},
//   isFormData = false
// ): Promise<T> {
//   let token = getToken();
  
//   const headers: Record<string, string> = {};
  
//   // ✅ مفيش Content-Type مع FormData — المتصفح هيحطه أوتوماتيك
//   if (!isFormData) {
//     headers['Content-Type'] = 'application/json';
//   }

//   if (token) {
//     headers['Authorization'] = token;
//   }

//   // المحاولة الأولى
//   let res = await fetch(`${BASE_URL}${path}`, {
//     ...options,
//     headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
//   });

//   // ✅ لو الـ 401، جرّب نعمل Refresh للتوكن
//   if (res.status === 401 && token) {
//     const newToken = await refreshAccessToken();
    
//     if (newToken) {
//       // حاول تاني بالتوكن الجديد
//       res = await fetch(`${BASE_URL}${path}`, {
//         ...options,
//         headers: { 
//           ...headers, 
//           Authorization: newToken,
//           ...(options.headers as Record<string, string> || {}) 
//         },
//       });
//     } else {
//       // لو فشل الـ refresh، امسح التوكنات وارجع للوجين
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('refreshToken');
//       window.location.href = '/';
//       throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجددًا');
//     }
//   }

//   // ✅ قراءة الـ Response
//   const contentType = res.headers.get('content-type');
//   const data = contentType?.includes('application/json') 
//     ? await res.json() 
//     : { success: res.ok, message: await res.text() };

//   // ✅ لو الـ request فشل، ارمي الـ error
//   if (!res.ok) {
//     const msg = data?.message || data?.error || 'حدث خطأ غير متوقع';
//     throw new Error(Array.isArray(msg) ? msg[0] : msg);
//   }

//   return data as T;
// }

// ✅ HTTP Client مع معالجة الـ Token صح (بدون Bearer) + Refresh تلقائي

const BASE_URL = import.meta.env.VITE_API_URL || 'https://ataa-charity-platform.vercel.app';

function getToken(): string | null {
  return localStorage.getItem('accessToken');
}

function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/refreshToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const data = await res.json();

    const newToken = data?.tokens?.accessToken;
    if (!newToken) return null;

    localStorage.setItem('accessToken', newToken);

    const newRefresh = data?.tokens?.refreshToken;
    if (newRefresh) {
      localStorage.setItem('refreshToken', newRefresh);
    }

    return newToken;
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    return null;
  }
}

export async function request<T = any>(
  path: string,
  options: RequestInit = {},
  isFormData = false,
  requiresAuth = false  // ✅ لو true بس هيعمل redirect لو انتهت الجلسة
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {};

  // ✅ مفيش Content-Type مع FormData
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  // ✅ بيبعت الـ token لو موجود — في كل الحالات
  if (token) {
    headers['Authorization'] = token;
  }

  let res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
  });

  // ✅ لو 401 وعندنا token — جرب تعمل Refresh
  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
          ...headers,
          Authorization: newToken,
          ...(options.headers as Record<string, string> || {}),
        },
      });
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // ✅ redirect بس لو الـ endpoint محتاج auth فعلاً
      if (requiresAuth) {
        window.location.href = '/';
      }

      throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجددًا');
    }
  }

  // ✅ قراءة الـ Response
  const contentType = res.headers.get('content-type');
  const data = contentType?.includes('application/json')
    ? await res.json()
    : { success: res.ok, message: await res.text() };

  // ✅ ارمي الـ error بدون redirect
  if (!res.ok) {
    const msg = data?.message || data?.error || 'حدث خطأ غير متوقع';
    throw new Error(Array.isArray(msg) ? msg[0] : msg);
  }

  return data as T;
}