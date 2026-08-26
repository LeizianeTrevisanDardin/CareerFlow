import { NextResponse } from "next/server";
import Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const CREDIT_PACKAGES = {
  starter: {
    credits: 100,
    amount: 999,
  },

  plus: {
    credits: 300,
    amount: 2499,
  },

  pro: {
    credits: 750,
    amount: 4999,
  },
} as const;

type PackageId =
  keyof typeof CREDIT_PACKAGES;

export async function POST(
  request: Request
) {
  const webhookSecret =
    process.env
      .STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error(
      "Missing STRIPE_WEBHOOK_SECRET"
    );

    return NextResponse.json(
      {
        error:
          "Webhook secret not configured",
      },
      {
        status: 500,
      }
    );
  }

  const signature =
    request.headers.get(
      "stripe-signature"
    );

  if (!signature) {
    return NextResponse.json(
      {
        error:
          "Missing Stripe signature",
      },
      {
        status: 400,
      }
    );
  }

  // IMPORTANT:
  // Stripe requires the raw body
  // for signature verification.
  const body =
    await request.text();

  let event:
    Stripe.Event;

  try {
    event =
      stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
  } catch (error) {
    console.error(
      "Stripe webhook signature error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Invalid webhook signature",
      },
      {
        status: 400,
      }
    );
  }

  // ==========================================
  // CHECKOUT COMPLETED
  // ==========================================

  if (
    event.type ===
    "checkout.session.completed"
  ) {
    const session =
      event.data
        .object as Stripe.Checkout.Session;

    // We only grant credits
    // after payment is confirmed.
    if (
      session.payment_status !==
      "paid"
    ) {
      return NextResponse.json({
        received: true,
      });
    }

    const userId =
      session.metadata?.user_id;

    const packageId =
      session.metadata
        ?.package_id as
        | PackageId
        | undefined;

    if (
      !userId ||
      !packageId
    ) {
      console.error(
        "Stripe session missing metadata:",
        session.id
      );

      return NextResponse.json(
        {
          error:
            "Missing checkout metadata",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // VALIDATE PACKAGE SERVER-SIDE
    // ==========================================

    const selectedPackage =
      CREDIT_PACKAGES[
        packageId
      ];

    if (!selectedPackage) {
      console.error(
        "Invalid Stripe package:",
        packageId
      );

      return NextResponse.json(
        {
          error:
            "Invalid credit package",
        },
        {
          status: 400,
        }
      );
    }

    if (
      session.currency !== "cad" ||
      session.amount_total !==
        selectedPackage.amount
    ) {
      console.error(
        "Stripe amount mismatch:",
        {
          sessionId:
            session.id,

          amount:
            session.amount_total,

          currency:
            session.currency,
        }
      );

      return NextResponse.json(
        {
          error:
            "Payment amount mismatch",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // ADD CREDITS
    // ==========================================

    const admin =
      createAdminClient();

    const {
      data,
      error,
    } = await admin.rpc(
      "add_stripe_credits",
      {
        p_user_id:
          userId,

        p_stripe_session_id:
          session.id,

        p_package_id:
          packageId,

        p_credits:
          selectedPackage.credits,

        p_amount_total:
          session.amount_total,

        p_currency:
          session.currency,
      }
    );

    if (error) {
      console.error(
        "Error adding Stripe credits:",
        error
      );

      // Return 500 so Stripe retries.
      return NextResponse.json(
        {
          error:
            "Failed to add credits",
        },
        {
          status: 500,
        }
      );
    }

    if (data === false) {
      console.log(
        "Stripe payment already processed:",
        session.id
      );
    } else {
      console.log(
        `Added ${selectedPackage.credits} credits for user ${userId}`
      );
    }
  }

  return NextResponse.json({
    received: true,
  });
}