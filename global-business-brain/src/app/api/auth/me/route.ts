import { getCurrentUser } from '@/lib/server/session';
import { handleRoute, jsonOk } from '@/lib/server/http';

export const GET = handleRoute(async () => {
  const user = await getCurrentUser();
  return jsonOk({ user: user ? { id: user.id, email: user.email, isGuest: user.isGuest } : null });
});
