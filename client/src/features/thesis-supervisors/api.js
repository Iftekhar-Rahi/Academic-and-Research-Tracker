// same as fetch(), but also attaches the saved login token so protected API routes accept the request
export function authFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  return fetch(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
}
