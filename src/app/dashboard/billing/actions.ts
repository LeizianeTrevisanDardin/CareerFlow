"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

type CreditPackage = {
  name: string;
  credits: number;
  amount: number;
};

const CREDIT_PACKAGES: Record<
  string,
  CreditPackage
> = {
  starter: {
    name: "Starter Credits",
    credits: 100,
    amount: 999,
  },

  plus: {
    name: "Plus Credits",
    credits: 300,
    amount: 2499,
  },

  pro: {
    name: "Pro Credits",
    credits: 750,
    amount: 4999,
  },
};

export async function createCreditCheckout(
  formData: FormData
) {
  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    redirect("/login");
  }

  const packageId =
    formData.get(
      "packageId"
    ) as string;

  const selectedPackage =
    CREDIT_PACKAGES[
      packageId
    ];

  if (!selectedPackage) {
    redirect(
      "/dashboard/billing?error=invalid_package"
    );
  }

  const siteUrl =
    process.env
      .NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  let checkoutUrl:
    string | null = null;

  try {
    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        payment_method_types: [
          "card",
        ],

        customer_email:
          user.email,

        line_items: [
          {
            quantity: 1,

            price_data: {
              currency: "cad",

              unit_amount:
                selectedPackage.amount,

              product_data: {
                name:
                  selectedPackage.name,

                description:
                  `${selectedPackage.credits} Careerflow credits`,
              },
            },
          },
        ],

        metadata: {
          user_id:
            user.id,

          package_id:
            packageId,

          credits:
            String(
              selectedPackage.credits
            ),
        },

        success_url:
          `${siteUrl}/dashboard/billing?success=payment_received&session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${siteUrl}/dashboard/billing?error=payment_cancelled`,
      });

    checkoutUrl =
      session.url;
  } catch (error) {
    console.error(
      "Stripe Checkout error:",
      error
    );

    redirect(
      "/dashboard/billing?error=checkout_failed"
    );
  }

  if (!checkoutUrl) {
    redirect(
      "/dashboard/billing?error=checkout_failed"
    );
  }

  redirect(checkoutUrl);
}