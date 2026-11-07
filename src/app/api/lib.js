const BASE = 'https://webapi.ecourtsindia.com';

export async function ecourtsFetch(path, options = {}) {
  const key = process.env.ECOURTS_API_KEY;
  if (!key) {
    return Response.json(
      { error: 'API key not configured. Set ECOURTS_API_KEY env variable.' },
      { status: 500 }
    );
  }

  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
