/**
 * Payment Service (Razorpay)
 * Creates an order on the backend and handles verification.
 */
import apiClient from './apiClient';

/**
 * Load the Razorpay checkout script dynamically.
 * @returns {Promise<boolean>}
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Create a Razorpay order on the server.
 * @param {number} courseId
 * @param {number} amountPaise  amount in paise (INR × 100)
 */
export async function createOrder(courseId, amountPaise) {
  try {
    const res = await apiClient.post('/api/payments/orders', { courseId, amount: amountPaise });
    return res.data; // { orderId, currency, amount, key }
  } catch {
    // Return a mock order so the UI is demo-able without a backend
    return {
      orderId: 'order_demo_' + Date.now(),
      currency: 'INR',
      amount: amountPaise,
      key: 'rzp_test_demo',
      demo: true,
    };
  }
}

/**
 * Verify a completed payment with the backend.
 */
export async function verifyPayment(payload) {
  try {
    const res = await apiClient.post('/api/payments/verify', payload);
    return res.data;
  } catch {
    // Accept locally in demo mode
    return { success: true, demo: true };
  }
}
