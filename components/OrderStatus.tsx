const STEPS = ['pending', 'processing', 'shipped', 'delivered'] as const;

export function OrderStatusBadge({ status }: { status: string }) {
  const style =
    status === 'delivered' ? 'bg-black text-white border-black' :
    status === 'cancelled' ? 'text-gray-400 border-gray-300 line-through' :
    'text-black border-black';
  return (
    <span className={`inline-block border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] ${style}`}>
      {status}
    </span>
  );
}

export function OrderTracker({ status }: { status: string }) {
  if (status === 'cancelled') {
    return <p className="text-[10px] uppercase tracking-widest text-gray-400">This order was cancelled.</p>;
  }
  const current = Math.max(0, STEPS.indexOf(status as (typeof STEPS)[number]));
  return (
    <ol className="grid grid-cols-4">
      {STEPS.map((step, i) => (
        <li key={step} className="flex flex-col gap-3">
          <div className="flex items-center">
            <span className={`w-2.5 h-2.5 shrink-0 border border-black ${i <= current ? 'bg-black' : 'bg-white'}`} />
            {i < STEPS.length - 1 && <span className={`h-px flex-1 ${i < current ? 'bg-black' : 'bg-black/15'}`} />}
          </div>
          <span className={`text-[9px] font-bold uppercase tracking-[0.2em] ${i <= current ? 'text-black' : 'text-gray-300'}`}>{step}</span>
        </li>
      ))}
    </ol>
  );
}
