const crypto = require('node:crypto');
const {
  getConfig,
  getOrderByReference,
  sendJson,
  updatePaymentStatus,
} = require('./shared');

const readRawBody = async (request) => {
  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
};

module.exports = async (request, response) => {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendJson(response, 405, { error: 'Method not allowed.' });
  }

  try {
    const config = getConfig();
    const body = await readRawBody(request);
    const expected = crypto
      .createHmac('sha512', config.paystackSecretKey)
      .update(body)
      .digest('hex');
    const received = request.headers['x-paystack-signature'] || '';
    const expectedBuffer = Buffer.from(expected, 'hex');
    const receivedBuffer = Buffer.from(received, 'hex');
    if (expectedBuffer.length !== receivedBuffer.length
      || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
      return sendJson(response, 401, { error: 'Invalid webhook signature.' });
    }

    const event = JSON.parse(body.toString('utf8'));
    const payment = event.data;
    if (event.event === 'charge.success' && payment?.reference) {
      const order = await getOrderByReference(config, payment.reference);
      if (order && payment.status === 'success'
        && payment.amount === order.total_ngn * 100
        && payment.currency === 'NGN') {
        await updatePaymentStatus(config, order.id, 'paid');
      }
    }
    return sendJson(response, 200, { received: true });
  } catch (error) {
    console.error('Payment webhook failed:', error);
    return sendJson(response, 400, { error: 'Could not process payment notification.' });
  }
};

module.exports.config = { api: { bodyParser: false } };
