/**
 * Wrapper around fetch that automatically adds Authorization header
 */
export default function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  return fetch(url, { ...options, headers });
}
