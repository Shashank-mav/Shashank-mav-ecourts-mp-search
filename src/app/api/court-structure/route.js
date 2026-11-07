import { ecourtsFetch } from '../lib';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || 'states';
  return ecourtsFetch(`/api/partner/causelist/court-structure/${path}`);
}
