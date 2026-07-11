import {
	CopyObjectCommand,
	DeleteObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { createDb } from "@poigame/db";
import { collectedPlaces } from "@poigame/db/schema/index";
import { env } from "@poigame/env/server";
import { and, eq } from "drizzle-orm";

type CaptureRow = typeof collectedPlaces.$inferSelect;

function capturePhotoKey(userId: string, placeId: string) {
	return `captures/${userId}/${placeId}.jpg`;
}

function pickBetterCapture(a: CaptureRow, b: CaptureRow) {
	if (a.photoKey && !b.photoKey) return a;
	if (b.photoKey && !a.photoKey) return b;
	return a.capturedAt >= b.capturedAt ? a : b;
}

const s3 = new S3Client({
	endpoint: env.S3_ENDPOINT,
	forcePathStyle: true,
	region: env.S3_REGION,
	credentials: {
		accessKeyId: env.S3_ACCESS_KEY_ID,
		secretAccessKey: env.S3_SECRET_ACCESS_KEY,
	},
});

async function copyCapturePhoto(fromKey: string, toKey: string) {
	if (fromKey === toKey) return toKey;
	await s3.send(
		new CopyObjectCommand({
			Bucket: env.S3_BUCKET,
			CopySource: `${env.S3_BUCKET}/${fromKey}`,
			Key: toKey,
			ContentType: "image/jpeg",
		}),
	);
	return toKey;
}

async function deleteCapturePhoto(key: string) {
	try {
		await s3.send(
			new DeleteObjectCommand({
				Bucket: env.S3_BUCKET,
				Key: key,
			}),
		);
	} catch (error) {
		console.error("Failed to delete capture photo during migration", {
			key,
			error,
		});
	}
}

async function migratePhotoToUser(
	fromKey: string,
	userId: string,
	placeId: string,
) {
	const toKey = capturePhotoKey(userId, placeId);
	try {
		await copyCapturePhoto(fromKey, toKey);
		if (fromKey !== toKey) {
			await deleteCapturePhoto(fromKey);
		}
		return toKey;
	} catch (error) {
		console.error("Failed to migrate capture photo", {
			fromKey,
			toKey,
			error,
		});
		return fromKey;
	}
}

export async function migrateAnonymousUser(
	anonymousUserId: string,
	newUserId: string,
) {
	if (anonymousUserId === newUserId) return;

	const db = createDb();
	const anonCaptures = await db
		.select()
		.from(collectedPlaces)
		.where(eq(collectedPlaces.userId, anonymousUserId));

	if (anonCaptures.length === 0) return;

	const existingCaptures = await db
		.select()
		.from(collectedPlaces)
		.where(eq(collectedPlaces.userId, newUserId));

	const existingByPlace = new Map(
		existingCaptures.map((capture) => [capture.placeId, capture]),
	);

	for (const anonCapture of anonCaptures) {
		const existingCapture = existingByPlace.get(anonCapture.placeId);

		if (!existingCapture) {
			let photoKey = anonCapture.photoKey;
			if (photoKey) {
				photoKey = await migratePhotoToUser(
					photoKey,
					newUserId,
					anonCapture.placeId,
				);
			}

			await db
				.update(collectedPlaces)
				.set({
					userId: newUserId,
					photoKey,
				})
				.where(
					and(
						eq(collectedPlaces.userId, anonymousUserId),
						eq(collectedPlaces.placeId, anonCapture.placeId),
					),
				);
			continue;
		}

		const winner = pickBetterCapture(anonCapture, existingCapture);

		if (winner.userId === anonymousUserId) {
			let photoKey = anonCapture.photoKey;
			if (photoKey) {
				photoKey = await migratePhotoToUser(
					photoKey,
					newUserId,
					anonCapture.placeId,
				);
			}

			await db
				.update(collectedPlaces)
				.set({
					photoKey,
					capturedAt: anonCapture.capturedAt,
				})
				.where(
					and(
						eq(collectedPlaces.userId, newUserId),
						eq(collectedPlaces.placeId, anonCapture.placeId),
					),
				);

			if (existingCapture.photoKey && existingCapture.photoKey !== photoKey) {
				await deleteCapturePhoto(existingCapture.photoKey);
			}
		} else if (anonCapture.photoKey) {
			await deleteCapturePhoto(anonCapture.photoKey);
		}

		await db
			.delete(collectedPlaces)
			.where(
				and(
					eq(collectedPlaces.userId, anonymousUserId),
					eq(collectedPlaces.placeId, anonCapture.placeId),
				),
			);
	}
}
