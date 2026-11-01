const getConfig = () => {
  const config = {
    supabaseUrl: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
    siteUrl: process.env.PUBLIC_SITE_URL,
  };
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (missing.length) {
    throw new Error(`Missing server environment variables: ${missing.join(', ')}`);
  }

  const supabaseUrl = new URL(config.supabaseUrl);
  if (supabaseUrl.protocol !== 'https:') {
    throw new Error('SUPABASE_URL must use HTTPS.');
  }
  config.supabaseUrl = supabaseUrl.origin;
  const siteUrl = new URL(config.siteUrl);
  if (siteUrl.protocol !== 'https:' && siteUrl.hostname !== 'localhost') {
    throw new Error('PUBLIC_SITE_URL must use HTTPS.');
  }
  config.siteUrl = siteUrl.origin;
  return config;
};

const sendJson = (response, status, payload) => {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Type', 'application/json');
  return response.status(status).json(payload);
};

const readJson = (request) => {
  if (request.body && typeof request.body === 'object') return request.body;
  try {
    return JSON.parse(request.body || '{}');
  } catch {
    throw new Error('Request body must be valid JSON.');
  }
};

const authenticate = async (request, config) => {
  const authorization = request.headers.authorization || '';
  if (!authorization.startsWith('Bearer ')) {
    throw new Error('Sign in before starting checkout.');
  }
  const response = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: config.anonKey,
      authorization,
    },
  });
  if (!response.ok) throw new Error('Your session has expired. Sign in and try again.');
  const user = await response.json();
  if (!user.id || !user.email) throw new Error('Your account must have an email address to pay online.');
  return { ...user, accessToken: authorization.slice('Bearer '.length) };
};

const serviceRequest = async (config, path, options = {}) => {
  const response = await fetch(`${config.supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: config.serviceRoleKey,
      authorization: `Bearer ${config.serviceRoleKey}`,
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!response.ok) {
    throw new Error(typeof data === 'object' && data?.message ? data.message : 'Database request failed.');
  }
  return data;
};

const getOrderByReference = async (config, reference) => {
  const query = new URLSearchParams({
    payment_reference: `eq.${reference}`,
    select: 'id,user_id,total_ngn,payment_status',
    limit: '1',
  });
  const orders = await serviceRequest(config, `orders?${query}`);
  return orders[0] || null;
};

const updatePaymentStatus = (config, orderId, status) => {
  const query = new URLSearchParams({ id: `eq.${orderId}` });
  return serviceRequest(config, `orders?${query}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ payment_status: status, updated_at: new Date().toISOString() }),
  });
};

module.exports = {
  authenticate,
  getConfig,
  getOrderByReference,
  readJson,
  sendJson,
  serviceRequest,
  updatePaymentStatus,
};
