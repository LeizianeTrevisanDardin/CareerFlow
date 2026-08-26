import { redirect } from "next/navigation";

import {
  Check,
  Coins,
  CreditCard,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { createCreditCheckout } from "./actions";

type BillingPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function BillingPage({
  searchParams,
}: BillingPageProps) {
  const {
    success,
    error,
  } = await searchParams;

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: profile,
  } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single();

  const {
  data: purchases,
  error: purchasesError,
} = await supabase
  .from("stripe_credit_purchases")
  .select(`
    id,
    package_id,
    credits,
    amount_total,
    currency,
    created_at
  `)
  .eq("user_id", user.id)
  .order("created_at", {
    ascending: false,
  });

if (purchasesError) {
  console.error(
    "Error loading purchase history:",
    purchasesError
  );
}

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl">

        {/* HEADER */}

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Billing
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Credits & billing
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Purchase Careerflow credits and use them
            across our AI-powered career tools.
          </p>
        </div>

        {/* MESSAGES */}

        {success ===
          "payment_received" && (
          <Message
            type="success"
            title="Payment received"
            message="Your payment was completed. Credits will be added after payment confirmation."
          />
        )}

        {error ===
          "payment_cancelled" && (
          <Message
            type="error"
            title="Payment cancelled"
            message="No payment was made and no credits were added."
          />
        )}

        {error ===
          "checkout_failed" && (
          <Message
            type="error"
            title="We couldn't start checkout"
            message="Please try again."
          />
        )}

        {error ===
          "invalid_package" && (
          <Message
            type="error"
            title="Invalid credit package"
            message="Please select one of the available packages."
          />
        )}

        {/* BALANCE */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
                <Coins className="h-5 w-5 text-emerald-700" />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Available credits
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {profile?.credits ?? 0}
                </p>
              </div>

            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-500">
                Credits never expire
              </p>
            </div>

          </div>

        </section>

        {/* CREDIT PACKAGES */}

        <section className="mt-8">

          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
            Credit Packages
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            Choose your credits
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Pay once and use your credits whenever you need them.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">

            <CreditPackage
              packageId="starter"
              name="Starter"
              credits={100}
              price="$9.99"
              description="Great for occasional use."
            />

            <CreditPackage
              packageId="plus"
              name="Plus"
              credits={300}
              price="$24.99"
              description="For active job seekers."
              popular
            />

            <CreditPackage
              packageId="pro"
              name="Pro"
              credits={750}
              price="$49.99"
              description="Best value for frequent use."
            />

          </div>

        </section>

        {/* HOW CREDITS WORK */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
              <CreditCard className="h-5 w-5 text-slate-700" />
            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                How credits work
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Credits are used when you run AI-powered Careerflow tools.
              </p>

            </div>

          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

            <Feature text="Resume analysis" />

            <Feature text="Job Match" />

            <Feature text="Cover letters" />

            <Feature text="LinkedIn analysis" />

            <Feature text="Portfolio analysis" />

            <Feature text="Apply Copilot" />

          </div>

        </section>

        {/* PURCHASE HISTORY */}

    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">

    <div>
        <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
        Purchase History
        </p>

        <h2 className="mt-1 text-2xl font-bold text-slate-900">
        Your credit purchases
        </h2>

        <p className="mt-2 text-sm text-slate-500">
        Review your previous Careerflow credit purchases.
        </p>
    </div>

    {purchases && purchases.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">

        <div className="hidden grid-cols-4 gap-4 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 sm:grid">
            <span>Package</span>
            <span>Credits</span>
            <span>Amount</span>
            <span>Date</span>
        </div>

        <div className="divide-y divide-slate-200">

            {purchases.map((purchase) => {
            const packageName =
                purchase.package_id === "starter"
                ? "Starter"
                : purchase.package_id === "plus"
                ? "Plus"
                : purchase.package_id === "pro"
                ? "Pro"
                : purchase.package_id;

          const amount =
            purchase.amount_total !== null
              ? (
                  purchase.amount_total / 100
                ).toFixed(2)
              : "0.00";

          const currency =
            (
              purchase.currency ||
              "cad"
            ).toUpperCase();

          return (
            <div
              key={purchase.id}
              className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-4 sm:items-center sm:gap-4"
            >
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400 sm:hidden">
                  Package
                </p>

                <p className="font-semibold text-slate-900">
                  {packageName}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400 sm:hidden">
                  Credits
                </p>

                <p className="text-sm font-semibold text-emerald-700">
                  +{purchase.credits}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400 sm:hidden">
                  Amount
                </p>

                <p className="text-sm text-slate-700">
                  ${amount} {currency}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400 sm:hidden">
                  Date
                </p>

                <p className="text-sm text-slate-500">
                  {new Date(
                    purchase.created_at
                  ).toLocaleDateString(
                    "en-CA",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
            </div>
          );
        })}

      </div>

    </div>
        ) : (
            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
                You haven&apos;t purchased any credits yet.
            </p>
            </div>
        )}

        </section>

      </div>
    </div>
  );
}

function CreditPackage({
  packageId,
  name,
  credits,
  price,
  description,
  popular = false,
}: {
  packageId: string;
  name: string;
  credits: number;
  price: string;
  description: string;
  popular?: boolean;
}) {
  return (
    <div
      className={`relative rounded-3xl border bg-white p-6 ${
        popular
          ? "border-emerald-300"
          : "border-slate-200"
      }`}
    >

      {popular && (
        <span className="absolute right-5 top-5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Most Popular
        </span>
      )}

      <p className="text-sm font-medium text-slate-500">
        {name}
      </p>

      <p className="mt-4 text-4xl font-bold text-slate-900">
        {credits}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        Careerflow credits
      </p>

      <p className="mt-6 text-2xl font-bold text-slate-900">
        {price}
        <span className="ml-1 text-sm font-normal text-slate-400">
          CAD
        </span>
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>

      <form
        action={createCreditCheckout}
        className="mt-6"
      >
        <input
          type="hidden"
          name="packageId"
          value={packageId}
        />

        <button
          type="submit"
          className={`w-full rounded-xl px-5 py-3 text-sm font-semibold transition ${
            popular
              ? "bg-emerald-700 text-white hover:bg-emerald-800"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          Buy Credits
        </button>
      </form>

    </div>
  );
}

function Feature({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">

      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100">
        <Check className="h-3.5 w-3.5 text-emerald-700" />
      </div>

      <span className="text-sm font-medium text-slate-700">
        {text}
      </span>

    </div>
  );
}

function Message({
  type,
  title,
  message,
}: {
  type: "success" | "error";
  title: string;
  message: string;
}) {
  const success =
    type === "success";

  return (
    <div
      className={`mt-6 rounded-2xl border px-5 py-4 ${
        success
          ? "border-emerald-200 bg-emerald-50"
          : "border-red-200 bg-red-50"
      }`}
    >
      <p
        className={`font-semibold ${
          success
            ? "text-emerald-900"
            : "text-red-900"
        }`}
      >
        {title}
      </p>

      <p
        className={`mt-1 text-sm ${
          success
            ? "text-emerald-700"
            : "text-red-700"
        }`}
      >
        {message}
      </p>
    </div>
  );
}