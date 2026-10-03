import { Notice } from './Notice';

/** Shown when the database is not configured: says exactly what is missing and what stops working. */
export function StoreUnavailable({ messageSq }: { messageSq: string }) {
  return (
    <Notice tone="bad" title="Ruajtja nuk është e disponueshme">
      <p>{messageSq}</p>
      <p className="mt-1">Pa databazë nuk funksionojnë: llogaritë, profili, projektet e ruajtura, detyrat dhe të dhënat e sinkronizuara nga burimet.</p>
    </Notice>
  );
}
