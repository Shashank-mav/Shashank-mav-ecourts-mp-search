import { ecourtsFetch } from '../lib';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cnr = searchParams.get('cnr');
  if (!cnr) return Response.json({ error: 'CNR required' }, { status: 400 });
  return ecourtsFetch(`/api/partner/case/${encodeURIComponent(cnr)}`);
}
