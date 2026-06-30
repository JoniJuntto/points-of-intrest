import {
	CreateBucketCommand,
	GetObjectCommand,
	HeadBucketCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { db } from "@poigame/db";
import { collectedPlaces } from "@poigame/db/schema/index";
import { env } from "@poigame/env/server";
import { and, eq } from "drizzle-orm";

const s3 = new S3Client({
	endpoint: env.S3_ENDPOINT,
	forcePathStyle: true,
	region: env.S3_REGION,
	credentials: {
		accessKeyId: env.S3_ACCESS_KEY_ID,
		secretAccessKey: env.S3_SECRET_ACCESS_KEY,
	},
});

let bucketReady: Promise<void> | null = null;

function ensureBucket() {
	if (!bucketReady) {
		bucketReady = (async () => {
			try {
				await s3.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }));
			} catch {
				await s3.send(new CreateBucketCommand({ Bucket: env.S3_BUCKET }));
			}
		})();
	}
	return bucketReady;
}

export function capturePhotoKey(userId: string, placeId: string) {
	return `captures/${userId}/${placeId}.jpg`;
}

export function placePhotoPath(placeId: string, photoKey?: string | null) {
	return photoKey ? `/api/photos/places/${encodeURIComponent(placeId)}` : null;
}

export async function uploadCapturePhoto(key: string, body: Buffer) {
	await ensureBucket();
	await s3.send(
		new PutObjectCommand({
			Bucket: env.S3_BUCKET,
			Key: key,
			Body: body,
			ContentType: "image/jpeg",
		}),
	);
}

export async function getCapturePhoto(key: string) {
	const response = await s3.send(
		new GetObjectCommand({
			Bucket: env.S3_BUCKET,
			Key: key,
		}),
	);
	if (!response.Body) return null;
	return Buffer.from(await response.Body.transformToByteArray());
}

export async function getPlacePhotoForUser(userId: string, placeId: string) {
	const [capture] = await db
		.select({ photoKey: collectedPlaces.photoKey })
		.from(collectedPlaces)
		.where(
			and(
				eq(collectedPlaces.userId, userId),
				eq(collectedPlaces.placeId, placeId),
			),
		)
		.limit(1);
	if (!capture?.photoKey) return null;
	return getCapturePhoto(capture.photoKey);
}
