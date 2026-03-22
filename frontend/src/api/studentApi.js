const BASE_URL = '/api/student';

function authHeaders(extra = {}) {
  const token = localStorage.getItem('token');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
}

export const canteenAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/canteens`, { headers: authHeaders() }).then(handleResponse),
  getById: (id) =>
    fetch(`${BASE_URL}/canteens/${id}`, { headers: authHeaders() }).then(handleResponse),
  getMeals: (canteenId, filters = '') =>
    fetch(`${BASE_URL}/canteens/${canteenId}/meals?${filters}`, { headers: authHeaders() }).then(handleResponse),

  globalSearch: (query = '', category = '', maxPrice = '') => {
    let params = [];
    if (query) params.push(`q=${encodeURIComponent(query)}`);
    if (category && category !== 'All') params.push(`category=${category}`);
    if (maxPrice) params.push(`maxPrice=${maxPrice}`);
    return fetch(`${BASE_URL}/canteens/search?${params.join('&')}`, { headers: authHeaders() }).then(handleResponse);
  },

  getMostOrdered: (studentId) =>
    fetch(`${BASE_URL}/canteens/most-ordered/${studentId}`, { headers: authHeaders() }).then(handleResponse),
};

export const cartAPI = {
  getCart: (studentId) =>
    fetch(`${BASE_URL}/cart/${studentId}`, { headers: authHeaders() }).then(handleResponse),
  addToCart: (data) =>
    fetch(`${BASE_URL}/cart/add`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    }).then(handleResponse),
  updateItem: (data) =>
    fetch(`${BASE_URL}/cart/update`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    }).then(handleResponse),
  removeItem: (data) =>
    fetch(`${BASE_URL}/cart/remove`, {
      method: 'DELETE',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    }).then(handleResponse),
  clearCart: (studentId) =>
    fetch(`${BASE_URL}/cart/clear/${studentId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(handleResponse),
};

export const orderAPI = {
  placeOrder: (data) =>
    fetch(`${BASE_URL}/orders/place`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    }).then(handleResponse),
  getById: (orderId) =>
    fetch(`${BASE_URL}/orders/${orderId}`, { headers: authHeaders() }).then(handleResponse),
  cancelOrder: (orderId) =>
    fetch(`${BASE_URL}/orders/${orderId}/cancel`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then(handleResponse),
};

export const paymentAPI = {
  getByOrder: (orderId) =>
    fetch(`${BASE_URL}/payment/${orderId}`, { headers: authHeaders() }).then(handleResponse),
  processPayment: (data) =>
    fetch(`${BASE_URL}/payment/process`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    }).then(handleResponse),
};

export const trackingAPI = {
  getHistory: (studentId) =>
    fetch(`${BASE_URL}/tracking/history/${studentId}`, { headers: authHeaders() }).then(handleResponse),
  trackStatus: (orderId) =>
    fetch(`${BASE_URL}/tracking/status/${orderId}`, { headers: authHeaders() }).then(handleResponse),
  getExpenses: (studentId, year) =>
    fetch(`${BASE_URL}/tracking/expenses/${studentId}?year=${year}`, { headers: authHeaders() }).then(handleResponse),
  submitRating: (data) =>
    fetch(`${BASE_URL}/tracking/rating`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    }).then(handleResponse),
  getMyRatings: (studentId) =>
    fetch(`${BASE_URL}/tracking/ratings/${studentId}`, { headers: authHeaders() }).then(handleResponse),
};
