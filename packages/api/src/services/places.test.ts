import { expect, test } from "bun:test";

import {
	PLACES_REFRESH_MS,
	haversineMeters,
	normalizeOverpassElements,
	shouldRefetchPlaces,
} from "./places";

test("place distance and Overpass normalization", () => {
	expect(Math.round(haversineMeters(48.5148, 9.0571, 48.515, 9.057))).toBe(23);

	const places = normalizeOverpassElements([
		{
			type: "node",
			id: 1,
			lat: 48.515,
			lon: 9.057,
			tags: { name: "Clock", historic: "monument" },
		},
		{
			type: "way",
			id: 2,
			center: { lat: 48.516, lon: 9.058 },
			tags: { name: "Rose Garden", leisure: "garden" },
		},
		{
			type: "node",
			id: 3,
			lat: 48.517,
			lon: 9.059,
			tags: { name: "Jokelan rautatieasema", railway: "station" },
		},
		{
			type: "node",
			id: 4,
			lat: 48.518,
			lon: 9.06,
			tags: { name: "Jokelan urheilukeskus", leisure: "sports_centre" },
		},
		{
			type: "node",
			id: 5,
			lat: 48.519,
			lon: 9.061,
			tags: { name: "Lepolan koulu", amenity: "school" },
		},
		{
			type: "node",
			id: 6,
			lat: 48.52,
			lon: 9.062,
			tags: { name: "Market", shop: "supermarket" },
		},
		{
			type: "node",
			id: 7,
			lat: 48.521,
			lon: 9.063,
			tags: { amenity: "bench" },
		},
	]);

	expect(places.map((place) => [place.name, place.category])).toEqual([
		["Clock", "monument"],
		["Rose Garden", "park"],
		["Jokelan rautatieasema", "monument"],
		["Jokelan urheilukeskus", "monument"],
		["Lepolan koulu", "culture"],
	]);
});

test("place refresh decision", () => {
	const now = new Date("2026-06-30T12:00:00Z");
	const fresh = new Date(now.getTime() - PLACES_REFRESH_MS + 1);
	const stale = new Date(now.getTime() - PLACES_REFRESH_MS - 1);
	const rows = (count: number, updatedAt: Date) =>
		Array.from({ length: count }, () => ({ place: { updatedAt } }));

	expect(shouldRefetchPlaces([], now)).toBe(true);
	expect(shouldRefetchPlaces(rows(9, fresh), now)).toBe(true);
	expect(shouldRefetchPlaces(rows(10, stale), now)).toBe(true);
	expect(shouldRefetchPlaces(rows(10, fresh), now)).toBe(false);
});
