// ──────────────────────────────────────────────────────────────────────────────
// useBillingData — billing data hook
// Mock implementation. Replace `fetchBillingData` with a real API call when
// the /api/billing endpoint is ready (see PayPro IPN logs docs).
// ──────────────────────────────────────────────────────────────────────────────

export interface PaymentHistoryItem {
  id: string
  date: string
  description: string
  amount: string
  status: 'success' | 'refund' | 'failed' | 'pending'
  statusLabel: string
  invoiceUrl: string | null
}

export interface UsageStat {
  used: number
  limit: number // -1 = unlimited
}

export interface BillingData {
  nextPayment: {
    date: string
    amount: string
    plan: string
    currency: string
  }
  currentPlan: {
    name: string
    price: string
    billingCycle: 'monthly' | 'annual'
  }
  usage: {
    seats: UsageStat
    presentations: UsageStat
    avatarMinutes: UsageStat
    monthlyLinks: UsageStat
    chatMinutes: UsageStat
  }
  history: PaymentHistoryItem[]
}

// ── PayPro Global portal URLs ─────────────────────────────────────────────────
// Set these in Vercel env vars when real URLs are provided by PayPro.
export const PAYPRO_CHANGE_CARD_URL =
  process.env.NEXT_PUBLIC_PAYPRO_CHANGE_CARD_URL ||
  'https://store.payproglobal.com/account/payment-methods'

export const PAYPRO_BILLING_INFO_URL =
  process.env.NEXT_PUBLIC_PAYPRO_BILLING_INFO_URL ||
  'https://store.payproglobal.com/account/details'

// ── Mock data (replace with real API) ────────────────────────────────────────
const MOCK_BILLING: BillingData = {
  nextPayment: {
    date: '27 Jun 2026',
    amount: '$29.00',
    plan: 'Professional',
    currency: 'USD',
  },
  currentPlan: {
    name: 'Professional',
    price: '$29.00',
    billingCycle: 'monthly',
  },
  usage: {
    seats:         { used: 1,  limit: 5   },
    presentations: { used: 26, limit: 100 },
    avatarMinutes: { used: 15, limit: 20  },
    monthlyLinks:  { used: 5,  limit: 200 },
    chatMinutes:   { used: 45, limit: 50  },
  },
  history: [
    { id: 'INV-2026-05', date: '27 May 2026', description: 'Professional Plan — Monthly', amount: '$29.00', status: 'success', statusLabel: 'Paid',      invoiceUrl: '#' },
    { id: 'INV-2026-04', date: '27 Apr 2026', description: 'Professional Plan — Monthly', amount: '$29.00', status: 'success', statusLabel: 'Paid',      invoiceUrl: '#' },
    { id: 'INV-2026-03', date: '27 Mar 2026', description: 'Professional Plan — Monthly', amount: '$29.00', status: 'refund',  statusLabel: 'Refunded',   invoiceUrl: null },
    { id: 'INV-2026-02', date: '27 Feb 2026', description: 'Professional Plan — Monthly', amount: '$29.00', status: 'success', statusLabel: 'Paid',      invoiceUrl: '#' },
    { id: 'INV-2026-01', date: '27 Jan 2026', description: 'Professional Plan — Monthly', amount: '$29.00', status: 'success', statusLabel: 'Paid',      invoiceUrl: '#' },
    { id: 'INV-2025-12', date: '27 Dec 2025', description: 'Professional Plan — Monthly', amount: '$29.00', status: 'success', statusLabel: 'Paid',      invoiceUrl: '#' },
  ],
}

export function useBillingData(): { data: BillingData; isLoading: boolean } {
  // TODO: swap to real API once /api/billing is available:
  // const { data, isLoading } = useSWR('/api/billing', fetcher)
  return { data: MOCK_BILLING, isLoading: false }
}
