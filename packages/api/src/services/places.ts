export const CATEGORY_LABELS = {
	monument: "Landmark",
	park: "Park",
	culture: "Culture",
} as const;

export const COLORS = {
	monument: "#E0703B",
	park: "#5C9A57",
	culture: "#8A4E93",
} as const;

export const MIN_NEARBY_PLACES = 10;
export const PLACES_REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

export type Category = keyof typeof CATEGORY_LABELS;
export type PlaceRefreshRow = { place: { updatedAt: Date } };
export type OverpassElement = {
	type: string;
	id: number;
	lat?: number;
	lon?: number;
	center?: { lat?: number; lon?: number };
	tags?: Record<string, string>;
};

export function normalizeOverpassElements(elements: OverpassElement[]) {
	const seen = new Set<string>();
	return elements.flatMap((element) => {
		const latitude = element.lat ?? element.center?.lat;
		const longitude = element.lon ?? element.center?.lon;
		const name = element.tags?.name;
		const category = categoryFromTags(element.tags ?? {});
		const key = `${element.type}:${element.id}`;
		if (
			latitude == null ||
			longitude == null ||
			!name ||
			!category ||
			seen.has(key)
		)
			return [];
		seen.add(key);
		return [
			{
				id: crypto.randomUUID(),
				osmType: element.type,
				osmId: String(element.id),
				name,
				category,
				latitude,
				longitude,
			},
		];
	});
}

export function shouldRefetchPlaces(
	rows: PlaceRefreshRow[],
	now = new Date(),
) {
	if (rows.length < MIN_NEARBY_PLACES) return true;
	const newestUpdatedAt = Math.max(
		...rows.map(({ place }) => place.updatedAt.getTime()),
	);
	return now.getTime() - newestUpdatedAt > PLACES_REFRESH_MS;
}

export function haversineMeters(
	lat1: number,
	lng1: number,
	lat2: number,
	lng2: number,
) {
	const r = 6_371_000;
	const toRad = (value: number) => (value * Math.PI) / 180;
	const dLat = toRad(lat2 - lat1);
	const dLng = toRad(lng2 - lng1);
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
	return 2 * r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function toCategory(category: string): Category {
	return category === "park" || category === "culture" ? category : "monument";
}

function categoryFromTags(tags: Record<string, string>): Category | null {
	if (
		tags.leisure === "park" ||
		tags.leisure === "garden" ||
		tags.leisure === "playground" ||
		tags.leisure === "nature_reserve"
	)
		return "park";
	if (
		tags.tourism === "museum" ||
		tags.tourism === "artwork" ||
		tags.amenity === "school" ||
		tags.amenity === "library" ||
		tags.amenity === "townhall" ||
		tags.amenity === "place_of_worship"
	)
		return "culture";
	if (
		tags.railway === "station" ||
		tags.railway === "halt" ||
		tags.leisure === "sports_centre" ||
		tags.leisure === "stadium"
	)
		return "monument";
	if (tags.tourism || tags.historic) return "monument";
	return null;
}
