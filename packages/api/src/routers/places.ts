import { db } from "@poigame/db";
import { collectedPlaces, places } from "@poigame/db/schema/index";
import { TRPCError } from "@trpc/server";
import { and, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { z } from "zod";

import { agentDebugLog } from "../debug-agent-log";
import { protectedProcedure, router } from "../index";
import { compressPhotoBase64 } from "../services/photo-image";
import {
	capturePhotoKey,
	placePhotoPath,
	uploadCapturePhoto,
} from "../services/photo-storage";
import {
	CATEGORY_LABELS,
	COLORS,
	haversineMeters,
	normalizeOverpassElements,
	type OverpassElement,
	shouldRefetchPlaces,
	toCategory,
} from "../services/places";

const RADIUS_M = 20_000;
const CAPTURE_RADIUS_M = 1_000;
const LIMIT = 25;
const OVERPASS_TIMEOUT_MS = 6_000;
type DbPlace = typeof places.$inferSelect;

const nearbyInput = z.object({
	latitude: z.number().gte(-90).lte(90),
	longitude: z.number().gte(-180).lte(180),
});

export const placesRouter = router({
	nearby: protectedProcedure
		.input(nearbyInput)
		.query(async ({ ctx, input }) => {
			let rows = await findNearbyPlaces(input.latitude, input.longitude);
			if (shouldRefetchPlaces(rows)) {
				try {
					await fetchAndSaveOverpassPlaces(input.latitude, input.longitude);
					rows = await findNearbyPlaces(input.latitude, input.longitude);
				} catch {
					// Return the cached rows we had if Overpass is unavailable.
				}
			}
			return withCaptureState(
				rows,
				ctx.session.user.id,
				input.latitude,
				input.longitude,
			);
		}),

	capture: protectedProcedure
		.input(
			z.object({
				placeId: z.string().min(1),
				latitude: z.number().gte(-90).lte(90),
				longitude: z.number().gte(-180).lte(180),
				photoBase64: z.string().min(1).max(14_000_000),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			agentDebugLog({
				location: "places.ts:capture:entry",
				message: "capture mutation started",
				hypothesisId: "H1",
				data: {
					userId: ctx.session.user.id,
					placeId: input.placeId,
					latitude: input.latitude,
					longitude: input.longitude,
					photoBase64Length: input.photoBase64.length,
				},
			});
			const [place] = await db
				.select()
				.from(places)
				.where(eq(places.id, input.placeId))
				.limit(1);
			if (!place) {
				agentDebugLog({
					location: "places.ts:capture:not-found",
					message: "place not found",
					hypothesisId: "H1",
					data: { placeId: input.placeId },
				});
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Place not found",
				});
			}
			const distance = haversineMeters(
				input.latitude,
				input.longitude,
				place.latitude,
				place.longitude,
			);
			if (distance > CAPTURE_RADIUS_M) {
				agentDebugLog({
					location: "places.ts:capture:too-far",
					message: "capture rejected by distance",
					hypothesisId: "H1",
					data: { distance, cap: CAPTURE_RADIUS_M },
				});
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Get closer to capture this place",
				});
			}
			let photo: Buffer;
			try {
				photo = await compressPhotoBase64(input.photoBase64);
			} catch (compressError) {
				agentDebugLog({
					location: "places.ts:capture:invalid-photo",
					message: "compressPhotoBase64 failed",
					hypothesisId: "H1",
					data: {
						error:
							compressError instanceof Error
								? compressError.message
								: String(compressError),
					},
				});
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Invalid photo",
				});
			}
			const photoKey = capturePhotoKey(ctx.session.user.id, input.placeId);
			try {
				await uploadCapturePhoto(photoKey, photo);
			} catch (uploadError) {
				agentDebugLog({
					location: "places.ts:capture:upload-failed",
					message: "S3 upload failed",
					hypothesisId: "H1",
					data: {
						error:
							uploadError instanceof Error
								? uploadError.message
								: String(uploadError),
					},
				});
				throw uploadError;
			}
			await db
				.insert(collectedPlaces)
				.values({
					userId: ctx.session.user.id,
					placeId: input.placeId,
					photoKey,
				})
				.onConflictDoUpdate({
					target: [collectedPlaces.userId, collectedPlaces.placeId],
					set: {
						photoKey,
						capturedAt: new Date(),
					},
				});
			agentDebugLog({
				location: "places.ts:capture:success",
				message: "capture completed",
				hypothesisId: "H1,H5",
				data: { photoKey },
			});
			return { ok: true, photoPath: placePhotoPath(input.placeId, photoKey) };
		}),

	collected: protectedProcedure.query(async ({ ctx }) => {
		const rows = await db
			.select({
				place: places,
				capturedAt: collectedPlaces.capturedAt,
				photoKey: collectedPlaces.photoKey,
			})
			.from(collectedPlaces)
			.innerJoin(places, eq(collectedPlaces.placeId, places.id))
			.where(eq(collectedPlaces.userId, ctx.session.user.id));

		return rows.map(({ place, capturedAt, photoKey }) =>
			formatPlace(place, 0, true, capturedAt, photoKey),
		);
	}),
});

async function findNearbyPlaces(latitude: number, longitude: number) {
	const box = boundingBox(latitude, longitude, RADIUS_M);
	const rows = await db
		.select()
		.from(places)
		.where(
			and(
				gte(places.latitude, box.minLat),
				lte(places.latitude, box.maxLat),
				gte(places.longitude, box.minLng),
				lte(places.longitude, box.maxLng),
			),
		);

	return rows
		.map((place) => ({
			place,
			distance: haversineMeters(
				latitude,
				longitude,
				place.latitude,
				place.longitude,
			),
		}))
		.filter((row) => row.distance <= RADIUS_M)
		.sort((a, b) => a.distance - b.distance)
		.slice(0, LIMIT);
}

async function withCaptureState(
	rows: { place: DbPlace; distance: number }[],
	userId: string,
	latitude: number,
	longitude: number,
) {
	const ids = rows.map(({ place }) => place.id);
	const captured =
		ids.length === 0
			? []
			: await db
					.select({
						placeId: collectedPlaces.placeId,
						capturedAt: collectedPlaces.capturedAt,
						photoKey: collectedPlaces.photoKey,
					})
					.from(collectedPlaces)
					.where(
						and(
							eq(collectedPlaces.userId, userId),
							inArray(collectedPlaces.placeId, ids),
						),
					);
	const capturedById = new Map(
		captured.map((row) => [
			row.placeId,
			{ capturedAt: row.capturedAt, photoKey: row.photoKey },
		]),
	);

	return rows.map(({ place, distance }) =>
		formatPlace(
			place,
			distance ||
				haversineMeters(latitude, longitude, place.latitude, place.longitude),
			capturedById.has(place.id),
			capturedById.get(place.id)?.capturedAt,
			capturedById.get(place.id)?.photoKey,
		),
	);
}

function formatPlace(
	place: DbPlace,
	distance: number,
	captured: boolean,
	capturedAt?: Date,
	photoKey?: string | null,
) {
	const category = toCategory(place.category);
	return {
		id: place.id,
		name: place.name,
		cat: category,
		catLabel: CATEGORY_LABELS[category],
		dist: Math.round(distance),
		color: COLORS[category],
		lat: place.latitude,
		lng: place.longitude,
		captured,
		coord: formatCoord(place.latitude, place.longitude),
		date: capturedAt ? formatDate(capturedAt) : "",
		photoPath: placePhotoPath(place.id, photoKey),
		blurb: `${CATEGORY_LABELS[category]} discovered nearby.`,
	};
}

async function fetchAndSaveOverpassPlaces(latitude: number, longitude: number) {
	const response = await fetch("https://overpass-api.de/api/interpreter", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"User-Agent": "poigame/1.0 (places-nearby)",
			Accept: "application/json",
		},
		body: new URLSearchParams({ data: overpassQuery(latitude, longitude) }),
		signal: AbortSignal.timeout(OVERPASS_TIMEOUT_MS),
	});
	if (!response.ok) throw new Error(`Overpass failed: ${response.status}`);

	const json = (await response.json()) as { elements?: OverpassElement[] };
	const normalized = normalizeOverpassElements(json.elements ?? []);
	if (normalized.length === 0) return;

	await db
		.insert(places)
		.values(normalized)
		.onConflictDoUpdate({
			target: [places.osmType, places.osmId],
			set: {
				name: sql`excluded.name`,
				category: sql`excluded.category`,
				latitude: sql`excluded.latitude`,
				longitude: sql`excluded.longitude`,
				updatedAt: new Date(),
			},
		});
}

function overpassQuery(latitude: number, longitude: number) {
	return `
[out:json][timeout:10];
(
  nwr(around:${RADIUS_M},${latitude},${longitude})[tourism~"^(attraction|museum|viewpoint|artwork)$"];
  nwr(around:${RADIUS_M},${latitude},${longitude})[historic~"^(monument|memorial|castle|ruins|archaeological_site)$"];
  nwr(around:${RADIUS_M},${latitude},${longitude})[railway~"^(station|halt)$"];
  nwr(around:${RADIUS_M},${latitude},${longitude})[amenity~"^(school|library|townhall|place_of_worship)$"];
  nwr(around:${RADIUS_M},${latitude},${longitude})[leisure~"^(sports_centre|stadium|playground|park|garden|nature_reserve)$"];
);
out center tags;
`;
}

function boundingBox(latitude: number, longitude: number, radiusM: number) {
	const latDelta = radiusM / 111_320;
	const lngDelta =
		radiusM / (111_320 * Math.max(Math.cos((latitude * Math.PI) / 180), 0.01));
	return {
		minLat: latitude - latDelta,
		maxLat: latitude + latDelta,
		minLng: longitude - lngDelta,
		maxLng: longitude + lngDelta,
	};
}

function formatDate(date: Date) {
	return date
		.toLocaleDateString("en-US", { month: "short", day: "numeric" })
		.toUpperCase();
}

function formatCoord(latitude: number, longitude: number) {
	const latDir = latitude >= 0 ? "N" : "S";
	const lngDir = longitude >= 0 ? "E" : "W";
	return `${Math.abs(latitude).toFixed(4)}°${latDir} ${Math.abs(longitude).toFixed(4)}°${lngDir}`;
}
