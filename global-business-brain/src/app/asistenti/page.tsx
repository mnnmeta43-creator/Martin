import type { Metadata } from 'next';
import { getEnv } from '@/lib/server/env';
import { Chat } from '@/components/assistant/Chat';
import { PageHeader } from '@/components/ui/PageHeader';
import { StoreUnavailable } from '@/components/ui/StoreUnavailable';
import { getViewer } from '../_lib/viewer';

export const metadata: Metadata = { title: 'Asistenti AI' };
export const dynamic = 'force-dynamic';

export default async function AssistantPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await props.searchParams;
  const viewer = await getViewer();
  if (!viewer.store) return <StoreUnavailable messageSq={viewer.storeErrorSq ?? 'Databaza mungon.'} />;
  const projects = viewer.user ? await viewer.store.projects.list(viewer.user.id) : [];
  const requested = Array.isArray(sp.projekti) ? sp.projekti[0] : sp.projekti;
  const projectId = projects.find((p) => p.id === requested)?.id ?? projects[0]?.id ?? null;
  const history = viewer.user ? await viewer.store.chat.list(viewer.user.id, projectId, 30) : [];
  return (
    <>
      <PageHeader
        title="Asistenti AI"
        subtitle="Njeh profilin, idenë e hapur, buxhetin dhe detyrat. Për çdo ndryshim financiar përdor kalkulatorin e aplikacionit; burimet shfaqen pranë pretendimeve."
      />
      <Chat
        projects={projects.map((p) => ({ id: p.id, title: p.title }))}
        initialProjectId={projectId}
        initialMessages={history}
        aiConfigured={Boolean(getEnv().ANTHROPIC_API_KEY)}
      />
    </>
  );
}
