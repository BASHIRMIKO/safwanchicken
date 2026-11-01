const {
  authenticate,
  getConfig,
  getOrderByReference,
  sendJson,
  updatePaymentStatus,
} = require('./shared');

module.exports = async (request, response) => {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return sendJson(response, 405, { error: 'Method not allowed.' });
  }

  try {
    const config = getConfig();
    const user = await authenticate(request, config);
    const reference = String(request.query.reference || '');
    if (!/^[a-zA-Z0-9._-]{1,100}$/.test(reference)) {
      return sendJson(response, 400, { error: 'Invalid payment reference.' });
    }

    const order = await getOrderByReference(config, reference);
    if (!order || order.user_id !== user.id) {
      return sendJson(response, 404, { error: 'Order not found for this account.' });
    }

    const paymentResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { authorization: `Bearer ${config.paystackSecretKey}` } },
    );
    const paymentResult = await paymentResponse.json();
    if (!paymentResponse.ok || !paymentResult.status) {
      throw new Error(paymentResult.message || 'Could not verify payment with the provider.');
    }
    const payment = paymentResult.data;
    if (payment.status !== 'success') {
      if (['failed', 'abandoned'].includes(payment.status)) {
        await updatePaymentStatus(config, order.id, 'failed');
      }
      return sendJson(response, 202, {
        paid: false,
        message: payment.status === 'failed' ? 'Payment was not completed.' : 'Payment is still processing.',
      });
    }
    if (payment.amount !== order.total_ngn * 100 || payment.currency !== 'NGN'
      || payment.customer?.email?.toLowerCase() !== user.email.toLowerCase()) {
      return sendJson(response, 400, { error: 'Payment details did not match this order.' });
    }

    await updatePaymentStatus(config, order.id, 'paid');
    return sendJson(response, 200, { paid: true, order_id: order.id });
  } catch (error) {
    console.error('Payment verification failed:', error);
    return sendJson(response, 400, { error: error.message || 'Could not verify payment.' });
  }
};
