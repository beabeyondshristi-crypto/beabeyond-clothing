import { redirect } from 'next/navigation';

// Homepage editing moved into the Pages CMS
export default function LegacyHomepageEditor() {
  redirect('/admin/content');
}
