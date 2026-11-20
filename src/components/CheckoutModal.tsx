import { useEffect, useRef, useState } from "react";
import { loadWhop } from "@whop/elements";
import { siteConfig, type RoofingPlan } from "#/config/site";
import { confirmWhopPayment } from "#/lib/whop-actions";

export function CheckoutModal({ plan, onClose }: { plan: RoofingPlan | null; onClose: () => void }) {
  const expressRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);
  const brandingRef = useRef<HTMLDivElement>(null);

  const whopRef = useRef<any>(null);
  const paymentsHandleRef = useRef<any>(null);

  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const [receiptId, setReceiptId] = useState<string | null>(null);

  useEffect(() => {
    if (!plan) return;

    let cancelled = false;
    let expressHandle: any = null;
    let paymentsHandle: any = null;

    setReady(false);
    setError("");
    setCompleted(false);
    setReceiptId(null);

    (async () => {
      try {
        const WhopElements = await loadWhop();
        if (cancelled) return;

        const whop = WhopElements({ locale: "en", environment: "sandbox" });
        whopRef.current = whop;

        // 1. ExpressCheckoutElement (Apple Pay / Google Pay)
        if (expressRef.current) {
          expressHandle = whop.checkout.create({
            plan: plan.id,
            returnUrl: window.location.href,
            onComplete: (result: any) => {
              setReceiptId(result?.paymentId || result?.setupIntentId || "CONFIRMED");
              setCompleted(true);
            },
          });
          expressHandle.create("expressCheckout", { layout: "auto" }).mount(expressRef.current);
        }

        // 2. PaymentElement + Email + Address + BrandingElement (wajib)
        paymentsHandle = whop.payments.create({
          accountId: siteConfig.company.whopAccountId,
          mode: "payment",
          plan: plan.id,
          ...(plan.isDeposit ? { setupFutureUsage: "off_session" as const } : {}),
          returnUrl: window.location.href,
        });
        paymentsHandleRef.current = paymentsHandle;

        if (emailRef.current) {
          paymentsHandle.create("email").mount(emailRef.current);
        }
        if (addressRef.current) {
          paymentsHandle.create("address", { mode: "billing" }).mount(addressRef.current);
        }
        if (paymentRef.current) {
          paymentsHandle
            .create("payment", {
              onReady: () => {
                if (!cancelled) setReady(true);
              },
              onError: (e: any) => {
                if (!cancelled) setError(e?.message || "Failed to load payment element.");
              },
            })
            .mount(paymentRef.current);
        }
        if (brandingRef.current) {
          paymentsHandle.create("branding").mount(brandingRef.current);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Failed to initialize Whop Elements.");
        }
      }
    })();

    return () => {
      cancelled = true;
      expressHandle?.destroy?.();
      paymentsHandle?.destroy?.();
      paymentsHandleRef.current = null;
    };
  }, [plan]);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentsHandleRef.current || !plan) return;

    setSubmitting(true);
    setError("");

    try {
      const tokenResult = await paymentsHandleRef.current.createConfirmationToken({});
      const confirmationToken =
        typeof tokenResult === "string"
          ? tokenResult
          : tokenResult?.confirmationToken || tokenResult?.id;

      if (!confirmationToken) {
        throw new Error("Could not create payment confirmation token.");
      }

      const res = await confirmWhopPayment({
        data: {
          confirmationToken,
          planId: plan.id,
          isDeposit: plan.isDeposit,
        },
      });

      const payment = res?.payment;
      if (payment?.client_secret && payment?.status !== "succeeded") {
        await whopRef.current?.payments?.handleNextAction?.({ clientSecret: payment.client_secret, returnUrl: window.location.href });
      }

      setReceiptId(payment?.id || "CONFIRMED");
      setCompleted(true);
    } catch (err: any) {
      if (err?.code === "payment_request_cancelled") {
        setError("Payment was cancelled. You can try again anytime.");
      } else {
        setError(err?.message || "Payment failed. Please check your details.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!plan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
      <div className="relative my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
        >
          X
        </button>

        <div className="mb-4 border-b pb-4">
          <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            {plan.billingType}
          </span>
          <h3 className="mt-2 text-xl font-bold text-slate-900">{plan.name}</h3>
          <p className="text-2xl font-extrabold text-slate-900">${plan.price}</p>
          {plan.isDeposit && (
            <p className="mt-1 text-xs text-slate-600">
              Your payment method will be saved securely via Whop Setup Intent for final balance billing upon job completion.
            </p>
          )}
        </div>

        {completed ? (
          <div className="rounded-xl bg-emerald-50 p-5 text-center">
            <h4 className="text-lg font-bold text-emerald-800">Payment Confirmed</h4>
            <p className="mt-1 text-sm text-emerald-700">
              Your booking for <strong>{plan.name}</strong> is confirmed.
            </p>
            {receiptId && <p className="mt-2 font-mono text-xs text-emerald-600">Receipt: {receiptId}</p>}
            <button
              onClick={onClose}
              className="mt-4 w-full rounded-xl bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handlePay} className="space-y-4">
            <div ref={expressRef} />

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-slate-200" />
              <span className="mx-3 text-xs text-slate-400">or pay with card / financing</span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            <div ref={emailRef} />
            <div ref={addressRef} />
            <div ref={paymentRef} />

            {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            <button
              type="submit"
              disabled={!ready || submitting}
              className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting
                ? "Processing..."
                : plan.isDeposit
                  ? `Pay $${plan.price} Deposit & Save Card`
                  : `Pay $${plan.price}`}
            </button>

            <div ref={brandingRef} className="pt-1" />
          </form>
        )}
      </div>
    </div>
  );
}





