import { profileSchema } from '@/lib/validation/schemas';
import { getCountry } from '@/lib/data/countries';
import { isDemoMode } from '@/lib/data/demo/dataset';
import { handleRoute, jsonError, jsonOk, parseJsonBody } from '@/lib/server/http';
import { z } from 'zod';
import { guard } from '../_shared';

export const GET = handleRoute(async (request: Request) => {
  const g = await guard(request, { limit: 'write' });
  if (!g.ok) return g.response;
  return jsonOk({ profile: await g.store.profiles.get(g.user.id) });
});

export const PUT = handleRoute(async (request: Request) => {
  const g = await guard(request, { limit: 'write' });
  if (!g.ok) return g.response;
  const body = await parseJsonBody(request, z.object({ profile: profileSchema }));
  if (!body.ok) return body.response;
  const p = body.data.profile;
  const demo = isDemoMode();
  const codes = [p.residenceCountry, ...p.operableCountries, ...p.targetCountries];
  const unknown = codes.filter((c) => !getCountry(c, { includeDemo: demo }));
  if (unknown.length) return jsonError(400, 'unknown_country', `Kod vendi i panjohur: ${unknown.join(', ')}`);
  const saved = await g.store.profiles.upsert(g.user.id, { ...p, updatedAt: new Date().toISOString() });
  return jsonOk({ profile: saved });
});
