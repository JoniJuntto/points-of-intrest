CREATE TABLE "collected_places" (
	"user_id" text NOT NULL,
	"place_id" text NOT NULL,
	"captured_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "places" (
	"id" text PRIMARY KEY NOT NULL,
	"osm_type" text NOT NULL,
	"osm_id" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "collected_places" ADD CONSTRAINT "collected_places_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collected_places" ADD CONSTRAINT "collected_places_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "collected_places_user_place_unique" ON "collected_places" USING btree ("user_id","place_id");--> statement-breakpoint
CREATE INDEX "collected_places_user_idx" ON "collected_places" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "places_osm_unique" ON "places" USING btree ("osm_type","osm_id");--> statement-breakpoint
CREATE INDEX "places_lat_lng_idx" ON "places" USING btree ("latitude","longitude");