/**
 * Planifikuesi i rifreskimit (Netlify Scheduled Function, çdo orë, UTC).
 * Scheduled functions are limited to 30 s, so this only starts the background refresh and returns.
 * It runs on published production deploys only.
 */
import type { Config } from '@netlify/functions';

export default async () => {
  const secret = Netlify.env.get('CRON_SECRET');
  const base = Netlify.env.get('URL');
  if (!secret || !base) {
    console.warn('refresh-schedule: CRON_SECRET ose URL mungon — rifreskimi automatik është i çaktivizuar');
    return;
  }
  const res = await fetch(`${base}/.netlify/functions/refresh-background`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}` },
  });
  console.log('refresh-schedule: background refresh requested', res.status);
};

export const config: Config = {
  schedule: '@hourly',
};
