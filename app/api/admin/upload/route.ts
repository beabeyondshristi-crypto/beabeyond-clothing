import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-db';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const formData = await req.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const supabase = await createClient();
    const urls: string[] = [];
    const bucket = 'product-images';

    for (const file of files) {
      const ext = file.name.match(/\.\w+$/)?.[0] || '.jpg';
      const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filename, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filename);

      urls.push(publicUrl);
    }

    return NextResponse.json({ urls });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
