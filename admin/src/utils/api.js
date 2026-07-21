const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5001/api';

export const getAdminAuth = () => ({
  token: localStorage.getItem('admin_token'),
  role: localStorage.getItem('role'),
});

export const clearAdminAuth = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('role');
  localStorage.removeItem('admin_user');
};

export const storeAdminAuth = ({ token, user }) => {
  localStorage.setItem('admin_token', token);
  localStorage.setItem('role', user.role);
  localStorage.setItem('admin_user', JSON.stringify(user));
};

export async function apiRequest(path, options = {}) {
  const { token } = getAdminAuth();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message = payload.error || payload.message || 'Request failed';
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export { API_BASE_URL };
