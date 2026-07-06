UPDATE "nomba_webhook_events"
SET "event_reference" = NULL
WHERE "event_reference" = '';--> statement-breakpoint
WITH "ranked_webhook_events" AS (
	SELECT
		"id",
		ROW_NUMBER() OVER (
			PARTITION BY "event_reference"
			ORDER BY "created_at", "id"
		) AS "duplicate_rank"
	FROM "nomba_webhook_events"
	WHERE "event_reference" IS NOT NULL
)
UPDATE "nomba_webhook_events"
SET "event_reference" = NULL
FROM "ranked_webhook_events"
WHERE
	"nomba_webhook_events"."id" = "ranked_webhook_events"."id"
	AND "ranked_webhook_events"."duplicate_rank" > 1;--> statement-breakpoint
CREATE UNIQUE INDEX "nomba_webhook_events_event_reference_unique" ON "nomba_webhook_events" USING btree ("event_reference");
