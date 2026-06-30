import sharp from "sharp";

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

export async function compressPhotoBase64(photoBase64: string) {
	const input = decodePhotoBase64(photoBase64);
	return sharp(input)
		.autoOrient()
		.resize({ width: 1600, withoutEnlargement: true })
		.jpeg({ quality: 78, mozjpeg: true })
		.toBuffer();
}

function decodePhotoBase64(photoBase64: string) {
	const base64 = photoBase64.includes(",")
		? photoBase64.slice(photoBase64.indexOf(",") + 1)
		: photoBase64;
	if (!base64 || base64.length % 4 !== 0 || !BASE64_RE.test(base64)) {
		throw new Error("Invalid photo data");
	}
	const buffer = Buffer.from(base64, "base64");
	if (buffer.length === 0 || buffer.length > MAX_PHOTO_BYTES) {
		throw new Error("Invalid photo size");
	}
	return buffer;
}
