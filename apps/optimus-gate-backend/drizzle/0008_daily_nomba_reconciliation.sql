ALTER TABLE "subscription_payment_attempts" ADD COLUMN "merchant_tx_ref" varchar(180);--> statement-breakpoint
CREATE INDEX "subscription_payment_attempts_merchant_tx_ref_idx" ON "subscription_payment_attempts" USING btree ("merchant_tx_ref");--> statement-breakpoint
CREATE TABLE "nomba_reconciliation_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" varchar(40) DEFAULT 'processing' NOT NULL,
	"date_from" timestamp with time zone NOT NULL,
	"date_to" timestamp with time zone NOT NULL,
	"cursor" varchar(1000),
	"checked_count" integer DEFAULT 0 NOT NULL,
	"matched_count" integer DEFAULT 0 NOT NULL,
	"reconciled_count" integer DEFAULT 0 NOT NULL,
	"skipped_count" integer DEFAULT 0 NOT NULL,
	"failed_count" integer DEFAULT 0 NOT NULL,
	"unmatched_count" integer DEFAULT 0 NOT NULL,
	"raw_response" jsonb,
	"error" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "nomba_reconciliation_runs_status_idx" ON "nomba_reconciliation_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "nomba_reconciliation_runs_date_to_idx" ON "nomba_reconciliation_runs" USING btree ("date_to");
