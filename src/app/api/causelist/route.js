import { ecourtsFetch } from '../lib';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  return ecourtsFetch(`/api/partner/causelist/search?${qs}`);
}
