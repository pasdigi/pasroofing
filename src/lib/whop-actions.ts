import { createServerFn } from "@tanstack/react-start";

const WHOP_API_BASE = "https://sandbox-api.whop.com/api/v1";

async function whopServerFetch(endpoint: string, body: Record<string, unknown> = {}) {
  const apiKey = process.env.ROOFING_WHOP_API_KEY || process.env.WHOP_API_KEY;
  if (!apiKey) {
    throw new Error("ROOFING_WHOP_API_KEY is not configured in app secrets.");
  }

  const res = await fetch(`${WHOP_API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Api-Version-Date": "2026-11-10-1",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || data?.message || `Whop API error (${res.status})`);
  }
  return data;
}

export const confirmWhopPayment = createServerFn({ method: "POST" })
  .validator((data: { confirmationToken: string; planId: string; isDeposit: boolean }) => data)
  .handler(async ({ data }) => {
    const accountId = process.env.WHOP_COMPANY_ID || "biz_N99ULBvp0AJmlc";
    const payment = await whopServerFetch("/payments", {
      account_id: accountId,
      variant_id: data.planId,
      confirmation_token: data.confirmationToken,
    });
    return { success: true, payment };
  });

export const submitEstimateLead = createServerFn({ method: "POST" })
  .validator((data: { name: string; email: string; phone?: string; address?: string; serviceType: string; notes?: string }) => data)
  .handler(async ({ data }) => {
    const accountId = process.env.WHOP_COMPANY_ID || "biz_N99ULBvp0AJmlc";
    const lead = await whopServerFetch("/members", {
      account_id: accountId,
      email: data.email,
      name: data.name || undefined,
    });
    return { success: true, lead };
  });

export const createFinalBalanceInvoice = createServerFn({ method: "POST" })
  .validator((data: { pin: string; memberId: string; amountUsd: number; description: string; collectionMethod: "charge_automatically" | "send_invoice" }) => data)
  .handler(async ({ data }) => {
    const expectedPin = process.env.ADMIN_DEMO_PIN || "2026";
    if (data.pin !== expectedPin) {
      throw new Error("Invalid Admin Demo PIN.");
    }
    const accountId = process.env.WHOP_COMPANY_ID || "biz_N99ULBvp0AJmlc";

    // 1. Buat draft invoice
    const draft = await whopServerFetch("/invoices", {
      account_id: accountId,
      member_id: data.memberId,
      billing_address: {
        line1: "400 Congress Ave",
        city: "Austin",
        state: "TX",
        postal_code: "78701",
        country: "US",
      },
      memo: data.description || "Roofing Project Final Balance",
      items: [
        {
          quantity: 1,
          description: data.description || "Roofing Project Final Balance",
          variant: {
            currency: "usd",
            billing_type: "one_time",
            initial_price: Number(data.amountUsd),
            title: "Roofing Final Balance",
          },
        },
      ],
      metadata: {
        collection_preference: data.collectionMethod,
        source: "roofing_admin_invoice_demo",
      },
    });

    // 2. Langsung send atau issue agar status menjadi open dan checkout_link terbentuk
    const action = data.collectionMethod === "send_invoice" ? "send" : "issue";
    const finalized = await whopServerFetch(`/invoices/${draft.id}/${action}`, {});

    return { success: true, invoice: finalized };
  });



