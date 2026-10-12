// Coupon rules shared by checkout, the validate API and the mock database.
// The SQL functions in migration 00013 implement the same checks for Supabase.

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order: number;
  max_discount: number | null;
  starts_at: string | null;
  ends_at: string | null;
  usage_limit: number | null;
  used_count: number;
  once_per_customer: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CouponResult {
  valid: boolean;
  discount: number;
  message: string;
  code?: string;
}

export const normalizeCode = (code: string) => code.trim().toUpperCase().replace(/\s+/g, '');

export function evaluateCoupon(coupon: Coupon | null | undefined, subtotal: number, opts: { alreadyUsedByCustomer?: boolean; now?: Date } = {}): CouponResult {
  const now = opts.now ?? new Date();
  if (!coupon || !coupon.is_active) return { valid: false, discount: 0, message: 'This code isn’t valid' };
  if (coupon.starts_at && new Date(coupon.starts_at) > now) return { valid: false, discount: 0, message: 'This code isn’t active yet' };
  if (coupon.ends_at && new Date(coupon.ends_at) < now) return { valid: false, discount: 0, message: 'This code has expired' };
  if (coupon.usage_limit !== null && coupon.usage_limit !== undefined && coupon.used_count >= coupon.usage_limit) {
    return { valid: false, discount: 0, message: 'This code has reached its usage limit' };
  }
  if (coupon.once_per_customer && opts.alreadyUsedByCustomer) return { valid: false, discount: 0, message: 'You’ve already used this code' };
  if (subtotal < Number(coupon.min_order || 0)) {
    return { valid: false, discount: 0, message: `Add ₹${Math.ceil(Number(coupon.min_order) - subtotal)} more to use this code` };
  }

  let discount = coupon.discount_type === 'percent'
    ? (subtotal * Number(coupon.discount_value)) / 100
    : Number(coupon.discount_value);
  if (coupon.max_discount) discount = Math.min(discount, Number(coupon.max_discount));
  discount = Math.round(Math.min(discount, subtotal) * 100) / 100;

  return {
    valid: true,
    discount,
    code: coupon.code,
    message: coupon.discount_type === 'percent' ? `${coupon.discount_value}% off applied` : `₹${coupon.discount_value} off applied`,
  };
}

export const describeCoupon = (c: Pick<Coupon, 'discount_type' | 'discount_value' | 'min_order' | 'max_discount'>) =>
  `${c.discount_type === 'percent' ? `${c.discount_value}% off` : `₹${c.discount_value} off`}` +
  `${c.max_discount && c.discount_type === 'percent' ? ` up to ₹${c.max_discount}` : ''}` +
  `${c.min_order ? ` on orders over ₹${c.min_order}` : ''}`;
