import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Customer } from '@/lib/types';

export function useAuth() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }
        const res = await fetch('/api/customers/me');
        const data = await res.json();
        if (data?.id) setCustomer(data);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  return { customer, loading };
}
