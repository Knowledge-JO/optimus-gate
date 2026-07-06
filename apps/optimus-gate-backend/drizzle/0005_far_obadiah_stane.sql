CREATE TYPE "public"."refund_status" AS ENUM('pending', 'processing', 'succeeded', 'failed');--> statement-breakpoint
CREATE TABLE "subscription_refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"business_customer_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"subscription_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"payment_attempt_id" uuid NOT NULL,
	"status" "refund_status" DEFAULT 'pending' NOT NULL,
	"provider" varchar(40) DEFAULT 'nomba' NOT NULL,
	"provider_reference" varchar(180) NOT NULL,
	"original_transaction_id" varchar(180) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'NGN' NOT NULL,
	"reason" text,
	"idempotency_key" varchar(220),
	"account_number" varchar(30),
	"bank_code" varchar(30),
	"raw_response" jsonb,
	"ledger_debited_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscription_refunds" ADD CONSTRAINT "subscription_refunds_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_refunds" ADD CONSTRAINT "subscription_refunds_business_customer_id_business_customers_id_fk" FOREIGN KEY ("business_customer_id") REFERENCES "public"."business_customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_refunds" ADD CONSTRAINT "subscription_refunds_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_refunds" ADD CONSTRAINT "subscription_refunds_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_refunds" ADD CONSTRAINT "subscription_refunds_invoice_id_subscription_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."subscription_invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_refunds" ADD CONSTRAINT "subscription_refunds_payment_attempt_id_subscription_payment_attempts_id_fk" FOREIGN KEY ("payment_attempt_id") REFERENCES "public"."subscription_payment_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "subscription_refunds_business_id_idx" ON "subscription_refunds" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "subscription_refunds_payment_attempt_id_idx" ON "subscription_refunds" USING btree ("payment_attempt_id");--> statement-breakpoint
CREATE INDEX "subscription_refunds_status_idx" ON "subscription_refunds" USING btree ("status");--> statement-breakpoint
CREATE INDEX "subscription_refunds_provider_reference_idx" ON "subscription_refunds" USING btree ("provider_reference");--> statement-breakpoint
CREATE UNIQUE INDEX "subscription_refunds_idempotency_key_unique" ON "subscription_refunds" USING btree ("idempotency_key");