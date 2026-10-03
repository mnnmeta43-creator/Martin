/** Builds the export input for a project the current user owns (null when missing/foreign). */
import type { ExportInput } from '@/lib/export/excel';
import type { Store } from '@/lib/server/store/types';
import { loadProjectView } from '../../../../_lib/projects';

export async function buildExportInput(store: Store, userId: string, projectId: string, demoMode: boolean): Promise<ExportInput | null> {
  const view = await loadProjectView(store, userId, projectId, demoMode);
  if (!view || !view.archetype || !view.plan) return null;
  return {
    project: view.project,
    archetype: view.archetype,
    projections: view.projections,
    plan: view.plan,
    progress: view.progress,
    tasks: view.tasks,
    citations: view.citations,
    countryNameSq: view.countryNameSq,
    generatedAt: new Date().toISOString(),
  };
}

export function safeFileName(title: string): string {
  return (
    title
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)
      .toLowerCase() || 'projekti'
  );
}
