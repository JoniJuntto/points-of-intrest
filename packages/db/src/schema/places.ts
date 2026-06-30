import { relations } from "drizzle-orm";
import {
	doublePrecision,
	index,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export const places = pgTable(
	"places",
	{
		id: text("id").primaryKey(),
		osmType: text("osm_type").notNull(),
		osmId: text("osm_id").notNull(),
		name: text("name").notNull(),
		category: text("category").notNull(),
		latitude: doublePrecision("latitude").notNull(),
		longitude: doublePrecision("longitude").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex("places_osm_unique").on(table.osmType, table.osmId),
		index("places_lat_lng_idx").on(table.latitude, table.longitude),
	],
);

export const collectedPlaces = pgTable(
	"collected_places",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		placeId: text("place_id")
			.notNull()
			.references(() => places.id, { onDelete: "cascade" }),
		photoKey: text("photo_key"),
		capturedAt: timestamp("captured_at").defaultNow().notNull(),
	},
	(table) => [
		uniqueIndex("collected_places_user_place_unique").on(
			table.userId,
			table.placeId,
		),
		index("collected_places_user_idx").on(table.userId),
	],
);

export const placesRelations = relations(places, ({ many }) => ({
	captures: many(collectedPlaces),
}));

export const collectedPlacesRelations = relations(
	collectedPlaces,
	({ one }) => ({
		user: one(user, {
			fields: [collectedPlaces.userId],
			references: [user.id],
		}),
		place: one(places, {
			fields: [collectedPlaces.placeId],
			references: [places.id],
		}),
	}),
);
