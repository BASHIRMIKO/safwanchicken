const {
  authenticate,
  getConfig,
  readJson,
  sendJson,
  serviceRequest,
} = require('./shared');

module.exports = async (request, response) => {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendJson(response, 405, { error: 'Method not allowed.' });
  }

  let orderId = null;
  try {
    const config = getConfig();
    const user = await authenticate(request, config);
    const input = readJson(request);
    const address = String(input.delivery_address || '').trim();
    const phone = String(input.phone || '').trim();
    const notes = String(input.notes || '').trim();
    let order;
    if (input.order_id) {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.order_id)) {
        return sendJson(response, 400, { error: 'Invalid order reference.' });
      }
      const query = new URLSearchParams({
        id: `eq.${input.order_id}`,
        user_id: `eq.${user.id}`,
        select: 'id,total_ngn,status,payment_status',
        limit: '1',
      });
      const orders = await serviceRequest(config, `orders?${query}`);
      order = orders[0];
      if (!order || order.status !== 'pending') {
        return sendJson(response, 404, { error: 'Order not found or no longer awaiting payment.' });
      }
      if (!['unpaid', 'failed'].includes(order.payment_status)) {
        return sendJson(response, 409, { error: 'This payment is still processing. Refresh your order history shortly.' });
      }
      orderId = order.id;
    } else {
      if (address.length < 5 || address.length > 500 || phone.length < 5 || phone.length > 32 || notes.length > 500) {
        return sendJson(response, 400, { error: 'Check your delivery details and try again.' });
      }
      const orderResponse = await fetch(`${config.supabaseUrl}/rest/v1/rpc/place_order`, {
        method: 'POST',
        headers: {
          apikey: config.anonKey,
          authorization: `Bearer ${user.accessToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          p_delivery_address: address,
          p_phone: phone,
          p_notes: notes || null,
        }),
      });
      if (!orderResponse.ok) {
        const error = await orderResponse.json().catch(() => ({}));
        throw new Error(error.message || 'Could not create your order.');
      }
      orderId = await orderResponse.json();
      const query = new URLSearchParams({
        id: `eq.${orderId}`,
        user_id: `eq.${user.id}`,
        select: 'id,total_ngn,status,payment_status',
        limit: '1',
      });
      const orders = await serviceRequest(config, `orders?${query}`);
      order = orders[0];
      if (!order) throw new Error('Could not find the order to start payment.');
    }
    const claimQuery = new URLSearchParams({
      id: `eq.${order.id}`,
      status: 'eq.pending',
      payment_status: 'in.(unpaid,failed)',
    });
    const claimed = await serviceRequest(config, `orders?${claimQuery}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ payment_status: 'pending', updated_at: new Date().toISOString() }),
    });
    if (claimed.length !== 1) {
      return sendJson(response, 409, { error: 'This payment is already being processed. Refresh your order history shortly.' });
    }

    const paymentResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.paystackSecretKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: order.total_ngn * 100,
        currency: 'NGN',
        callback_url: new URL('/payment.html', config.siteUrl).toString(),
        metadata: { order_id: order.id },
      }),
    });
    const paymentResult = await paymentResponse.json();
    if (!paymentResponse.ok || !paymentResult.status || !paymentResult.data?.authorization_url) {
      throw new Error(paymentResult.message || 'The payment provider could not start checkout.');
    }
    const authorizationUrl = new URL(paymentResult.data.authorization_url);
    if (authorizationUrl.protocol !== 'https:'
      || (authorizationUrl.hostname !== 'paystack.com' && !authorizationUrl.hostname.endsWith('.paystack.com'))) {
      throw new Error('The payment provider returned an invalid checkout URL.');
    }

    const reference = paymentResult.data.reference;
    const updateQuery = new URLSearchParams({ id: `eq.${order.id}` });
    await serviceRequest(config, `orders?${updateQuery}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        payment_status: 'pending',
        payment_reference: reference,
        updated_at: new Date().toISOString(),
      }),
    });
    return sendJson(response, 200, {
      authorization_url: authorizationUrl.toString(),
    });
  } catch (error) {
    console.error('Payment initialization failed:', error);
    if (orderId) {
      const config = getConfig();
      const query = new URLSearchParams({
        id: `eq.${orderId}`,
        payment_status: 'in.(unpaid,pending)',
      });
      await serviceRequest(config, `orders?${query}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ payment_status: 'failed', updated_at: new Date().toISOString() }),
      }).catch((statusError) => {
        console.error('Could not mark the unpaid order as failed:', statusError);
      });
    }
    return sendJson(response, 400, {
      error: error.message || 'Could not start payment.',
      ...(orderId ? { order_id: orderId } : {}),
    });
  }
};
