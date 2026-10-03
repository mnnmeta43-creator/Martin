import { buildPlanPdf } from '@/lib/export/pdf';
import { isDemoMode } from '@/lib/data/demo/dataset';
import { handleRoute } from '@/lib/server/http';
import { guard, notFound } from '../../../../_shared';
import { buildExportInput, safeFileName } from '../_input';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export const GET = handleRoute(async (request: Request, ctx: Ctx) => {
  const g = await guard(request, { limit: 'export' });
  if (!g.ok) return g.response;
  const { id } = await ctx.params;
  const input = await buildExportInput(g.store, g.user.id, id, isDemoMode());
  if (!input) return notFound('Projekti nuk u gjet.');
  const pdf = await buildPlanPdf(input);
  const date = input.generatedAt.slice(0, 10);
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="plani-${safeFileName(input.project.title)}-${date}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
});
