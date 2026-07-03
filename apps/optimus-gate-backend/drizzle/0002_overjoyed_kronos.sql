CREATE TYPE "public"."business_member_role" AS ENUM('owner', 'admin', 'developer', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."business_status" AS ENUM('active', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."ledger_account_type" AS ENUM('business_available', 'business_pending');--> statement-breakpoint
CREATE TYPE "public"."ledger_entry_type" AS ENUM('payment_credit', 'renewal_credit', 'refund_debit', 'reversal_debit', 'payout_debit', 'adjustment');--> statement-breakpoint
CREATE TABLE "business_customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"external_customer_id" varchar(160) NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(180),
	"phone" varchar(60),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "business_member_role" DEFAULT 'owner' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"name" varchar(160) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"status" "business_status" DEFAULT 'active' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledger_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"type" "ledger_account_type" NOT NULL,
	"currency" varchar(3) DEFAULT 'NGN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"ledger_account_id" uuid NOT NULL,
	"type" "ledger_entry_type" NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'NGN' NOT NULL,
	"idempotency_key" varchar(220) NOT NULL,
	"source_type" varchar(80) NOT NULL,
	"source_id" uuid,
	"description" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "api_keys" ADD COLUMN "business_id" uuid;--> statement-breakpoint
ALTER TABLE "api_keys" ADD COLUMN "created_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "customer_payment_methods" ADD COLUMN "business_id" uuid;--> statement-breakpoint
ALTER TABLE "customer_payment_methods" ADD COLUMN "business_customer_id" uuid;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "business_id" uuid;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD COLUMN "business_id" uuid;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD COLUMN "business_customer_id" uuid;--> statement-breakpoint
ALTER TABLE "subscription_payment_attempts" ADD COLUMN "business_id" uuid;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "business_id" uuid;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "business_customer_id" uuid;--> statement-breakpoint
ALTER TABLE "nomba_checkout_orders" ADD COLUMN "business_id" uuid;--> statement-breakpoint
ALTER TABLE "nomba_webhook_events" ADD COLUMN "business_id" uuid;--> statement-breakpoint
INSERT INTO "businesses" ("owner_user_id", "name", "slug")
SELECT
	"users"."id",
	COALESCE(NULLIF(split_part("users"."email", '@', 1), ''), 'Business') || '''s Business',
	'user-' || "users"."id"::text
FROM "users"
WHERE NOT EXISTS (
	SELECT 1 FROM "businesses" WHERE "businesses"."owner_user_id" = "users"."id"
);--> statement-breakpoint
INSERT INTO "business_members" ("business_id", "user_id", "role")
SELECT "businesses"."id", "businesses"."owner_user_id", 'owner'
FROM "businesses";--> statement-breakpoint
UPDATE "api_keys"
SET
	"business_id" = "businesses"."id",
	"created_by_user_id" = "api_keys"."user_id"
FROM "businesses"
WHERE "businesses"."owner_user_id" = "api_keys"."user_id";--> statement-breakpoint
UPDATE "plans"
SET "business_id" = "businesses"."id"
FROM "businesses"
WHERE "businesses"."owner_user_id" = "plans"."user_id";--> statement-breakpoint
UPDATE "subscriptions"
SET "business_id" = "businesses"."id"
FROM "businesses"
WHERE "businesses"."owner_user_id" = "subscriptions"."user_id";--> statement-breakpoint
UPDATE "customer_payment_methods"
SET "business_id" = "businesses"."id"
FROM "businesses"
WHERE "businesses"."owner_user_id" = "customer_payment_methods"."user_id";--> statement-breakpoint
INSERT INTO "business_customers" ("business_id", "external_customer_id", "email")
SELECT DISTINCT
	"subscriptions"."business_id",
	COALESCE(NULLIF("subscriptions"."customer_id", ''), "subscriptions"."id"::text),
	"subscriptions"."customer_email"
FROM "subscriptions"
WHERE "subscriptions"."business_id" IS NOT NULL;--> statement-breakpoint
INSERT INTO "business_customers" ("business_id", "external_customer_id", "email")
SELECT DISTINCT
	"customer_payment_methods"."business_id",
	COALESCE(NULLIF("customer_payment_methods"."customer_id", ''), "customer_payment_methods"."id"::text),
	"customer_payment_methods"."customer_email"
FROM "customer_payment_methods"
WHERE
	"customer_payment_methods"."business_id" IS NOT NULL
	AND NOT EXISTS (
		SELECT 1
		FROM "business_customers"
		WHERE
			"business_customers"."business_id" = "customer_payment_methods"."business_id"
			AND "business_customers"."external_customer_id" = COALESCE(NULLIF("customer_payment_methods"."customer_id", ''), "customer_payment_methods"."id"::text)
	);--> statement-breakpoint
UPDATE "subscriptions"
SET "business_customer_id" = "business_customers"."id"
FROM "business_customers"
WHERE
	"business_customers"."business_id" = "subscriptions"."business_id"
	AND "business_customers"."external_customer_id" = COALESCE(NULLIF("subscriptions"."customer_id", ''), "subscriptions"."id"::text);--> statement-breakpoint
UPDATE "customer_payment_methods"
SET "business_customer_id" = "business_customers"."id"
FROM "business_customers"
WHERE
	"business_customers"."business_id" = "customer_payment_methods"."business_id"
	AND "business_customers"."external_customer_id" = COALESCE(NULLIF("customer_payment_methods"."customer_id", ''), "customer_payment_methods"."id"::text);--> statement-breakpoint
UPDATE "subscription_invoices"
SET
	"business_id" = "subscriptions"."business_id",
	"business_customer_id" = "subscriptions"."business_customer_id"
FROM "subscriptions"
WHERE "subscriptions"."id" = "subscription_invoices"."subscription_id";--> statement-breakpoint
UPDATE "subscription_payment_attempts"
SET "business_id" = "subscriptions"."business_id"
FROM "subscriptions"
WHERE "subscriptions"."id" = "subscription_payment_attempts"."subscription_id";--> statement-breakpoint
UPDATE "nomba_checkout_orders"
SET "business_id" = "subscriptions"."business_id"
FROM "subscriptions"
WHERE "subscriptions"."id" = "nomba_checkout_orders"."subscription_id";--> statement-breakpoint
UPDATE "nomba_checkout_orders"
SET "business_id" = "subscription_payment_attempts"."business_id"
FROM "subscription_payment_attempts"
WHERE
	"subscription_payment_attempts"."id" = "nomba_checkout_orders"."payment_attempt_id"
	AND "nomba_checkout_orders"."business_id" IS NULL;--> statement-breakpoint
UPDATE "nomba_checkout_orders"
SET "business_id" = "businesses"."id"
FROM "businesses"
WHERE
	"businesses"."owner_user_id" = "nomba_checkout_orders"."user_id"
	AND "nomba_checkout_orders"."business_id" IS NULL;--> statement-breakpoint
ALTER TABLE "api_keys" ALTER COLUMN "business_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "api_keys" ALTER COLUMN "created_by_user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "customer_payment_methods" ALTER COLUMN "business_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "customer_payment_methods" ALTER COLUMN "business_customer_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ALTER COLUMN "business_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ALTER COLUMN "business_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ALTER COLUMN "business_customer_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_payment_attempts" ALTER COLUMN "business_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "business_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "business_customer_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "nomba_checkout_orders" ALTER COLUMN "business_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "business_customers" ADD CONSTRAINT "business_customers_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_members" ADD CONSTRAINT "business_members_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_members" ADD CONSTRAINT "business_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_accounts" ADD CONSTRAINT "ledger_accounts_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_ledger_account_id_ledger_accounts_id_fk" FOREIGN KEY ("ledger_account_id") REFERENCES "public"."ledger_accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "business_customers_business_external_unique" ON "business_customers" USING btree ("business_id","external_customer_id");--> statement-breakpoint
CREATE INDEX "business_customers_business_id_idx" ON "business_customers" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "business_customers_email_idx" ON "business_customers" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "business_members_business_user_unique" ON "business_members" USING btree ("business_id","user_id");--> statement-breakpoint
CREATE INDEX "business_members_user_id_idx" ON "business_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "businesses_slug_unique" ON "businesses" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "businesses_owner_user_id_idx" ON "businesses" USING btree ("owner_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ledger_accounts_business_type_currency_unique" ON "ledger_accounts" USING btree ("business_id","type","currency");--> statement-breakpoint
CREATE INDEX "ledger_accounts_business_id_idx" ON "ledger_accounts" USING btree ("business_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ledger_entries_idempotency_key_unique" ON "ledger_entries" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "ledger_entries_business_id_idx" ON "ledger_entries" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "ledger_entries_account_id_idx" ON "ledger_entries" USING btree ("ledger_account_id");--> statement-breakpoint
CREATE INDEX "ledger_entries_source_idx" ON "ledger_entries" USING btree ("source_type","source_id");--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_payment_methods" ADD CONSTRAINT "customer_payment_methods_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_payment_methods" ADD CONSTRAINT "customer_payment_methods_business_customer_id_business_customers_id_fk" FOREIGN KEY ("business_customer_id") REFERENCES "public"."business_customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_business_customer_id_business_customers_id_fk" FOREIGN KEY ("business_customer_id") REFERENCES "public"."business_customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_payment_attempts" ADD CONSTRAINT "subscription_payment_attempts_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_business_customer_id_business_customers_id_fk" FOREIGN KEY ("business_customer_id") REFERENCES "public"."business_customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nomba_checkout_orders" ADD CONSTRAINT "nomba_checkout_orders_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nomba_webhook_events" ADD CONSTRAINT "nomba_webhook_events_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "api_keys_business_id_idx" ON "api_keys" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "api_keys_created_by_user_id_idx" ON "api_keys" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "customer_payment_methods_business_id_idx" ON "customer_payment_methods" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "subscription_invoices_business_id_idx" ON "subscription_invoices" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "subscription_invoices_business_customer_id_idx" ON "subscription_invoices" USING btree ("business_customer_id");--> statement-breakpoint
CREATE INDEX "subscription_payment_attempts_business_id_idx" ON "subscription_payment_attempts" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "subscriptions_business_id_idx" ON "subscriptions" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "nomba_checkout_orders_business_id_idx" ON "nomba_checkout_orders" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "nomba_webhook_events_business_id_idx" ON "nomba_webhook_events" USING btree ("business_id");
