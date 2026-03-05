const BASE_URL = '/api/student';

export const canteenAPI = {
  getAll: () => fetch(`${BASE_URL}/canteens`).then(r => r.json()),
  getById: (id) => fetch(`${BASE_URL}/canteens/${id}`).then(r => r.json()),
  getMeals: (canteenId, filters = '') =>
    fetch(`${BASE_URL}/canteens/${canteenId}/meals?${filters}`).then(r => r.json()),

  // 🔍 Global search across all canteens
  globalSearch: (query = '', category = '', maxPrice = '') => {
    let params = [];
    if (query) params.push(`q=${encodeURIComponent(query)}`);
    if (category && category !== 'All') params.push(`category=${category}`);
    if (maxPrice) params.push(`maxPrice=${maxPrice}`);
    return fetch(`${BASE_URL}/canteens/search?${params.join('&')}`).then(r => r.json());
  },

  // 📊 Most ordered meals for student
  getMostOrdered: (studentId) =>
    fetch(`${BASE_URL}/canteens/most-ordered/${studentId}`).then(r => r.json()),
};

export const cartAPI = {
  getCart: (studentId) => fetch(`${BASE_URL}/cart/${studentId}`).then(r => r.json()),
  addToCart: (data) =>
    fetch(`${BASE_URL}/cart/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  updateItem: (data) =>
    fetch(`${BASE_URL}/cart/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  removeItem: (data) =>
    fetch(`${BASE_URL}/cart/remove`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  clearCart: (studentId) =>
    fetch(`${BASE_URL}/cart/clear/${studentId}`, { method: 'DELETE' }).then(r => r.json()),
};

export const orderAPI = {
  placeOrder: (data) =>
    fetch(`${BASE_URL}/orders/place`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  getById: (orderId) => fetch(`${BASE_URL}/orders/${orderId}`).then(r => r.json()),
  cancelOrder: (orderId) =>
    fetch(`${BASE_URL}/orders/${orderId}/cancel`, { method: 'PATCH' }).then(r => r.json()),
};

export const paymentAPI = {
  getByOrder: (orderId) => fetch(`${BASE_URL}/payment/${orderId}`).then(r => r.json()),
  processPayment: (data) =>
    fetch(`${BASE_URL}/payment/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),
};

export const trackingAPI = {
  getHistory: (studentId) => fetch(`${BASE_URL}/tracking/history/${studentId}`).then(r => r.json()),
  trackStatus: (orderId) => fetch(`${BASE_URL}/tracking/status/${orderId}`).then(r => r.json()),
  getExpenses: (studentId, year) =>
    fetch(`${BASE_URL}/tracking/expenses/${studentId}?year=${year}`).then(r => r.json()),
  submitRating: (data) =>
    fetch(`${BASE_URL}/tracking/rating`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  getMyRatings: (studentId) =>
    fetch(`${BASE_URL}/tracking/ratings/${studentId}`).then(r => r.json()),
};
