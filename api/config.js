module.exports = (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Type', 'application/json');

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return response.status(503).json({
      error: 'Set SUPABASE_URL and SUPABASE_ANON_KEY in the Vercel project environment.',
    });
  }

  try {
    const projectUrl = new URL(url);
    if (projectUrl.protocol !== 'https:') {
      throw new Error('Supabase URL must use HTTPS.');
    }
  } catch {
    return response.status(503).json({ error: 'SUPABASE_URL must be a valid HTTPS URL.' });
  }

  return response.status(200).json({ url, anonKey });
};
