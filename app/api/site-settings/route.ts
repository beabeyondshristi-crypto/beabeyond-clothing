import { NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/admin-db';
import { DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';

export async function GET() {
  try {
    return NextResponse.json(await getSiteSettings());
  } catch {
    return NextResponse.json(DEFAULT_SITE_SETTINGS);
  }
}
