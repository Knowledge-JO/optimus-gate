CREATE TYPE "public"."payout_status" AS ENUM('pending', 'processing', 'succeeded', 'failed', 'refunded');--> statement-breakpoint
ALTER TYPE "public"."ledger_entry_type" ADD VALUE 'payout_reversal_credit' BEFORE 'adjustment';--> statement-breakpoint
CREATE TABLE "business_payout_bank_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"bank_code" varchar(20) NOT NULL,
	"bank_name" varchar(160),
	"account_number" varchar(20) NOT NULL,
	"account_name" varchar(255) NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"bank_account_id" uuid,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'NGN' NOT NULL,
	"status" "payout_status" DEFAULT 'pending' NOT NULL,
	"provider" varchar(40) DEFAULT 'nomba' NOT NULL,
	"provider_reference" varchar(160) NOT NULL,
	"nomba_transaction_id" varchar(180),
	"idempotency_key" varchar(220),
	"failure_reason" text,
	"raw_response" jsonb,
	"ledger_debited_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "business_payouts_provider_reference_unique" UNIQUE("provider_reference")
);
--> statement-breakpoint
ALTER TABLE "business_payout_bank_accounts" ADD CONSTRAINT "business_payout_bank_accounts_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_payout_bank_accounts" ADD CONSTRAINT "business_payout_bank_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_payouts" ADD CONSTRAINT "business_payouts_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_payouts" ADD CONSTRAINT "business_payouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_payouts" ADD CONSTRAINT "business_payouts_bank_account_id_business_payout_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."business_payout_bank_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "business_payout_accounts_business_bank_account_unique" ON "business_payout_bank_accounts" USING btree ("business_id","bank_code","account_number");--> statement-breakpoint
CREATE INDEX "business_payout_accounts_business_id_idx" ON "business_payout_bank_accounts" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "business_payout_accounts_default_idx" ON "business_payout_bank_accounts" USING btree ("business_id","is_default");--> statement-breakpoint
CREATE UNIQUE INDEX "business_payouts_idempotency_key_unique" ON "business_payouts" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "business_payouts_business_id_idx" ON "business_payouts" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "business_payouts_bank_account_id_idx" ON "business_payouts" USING btree ("bank_account_id");--> statement-breakpoint
CREATE INDEX "business_payouts_status_idx" ON "business_payouts" USING btree ("status");