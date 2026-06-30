import { expect, test } from "bun:test";
import sharp from "sharp";

import { compressPhotoBase64 } from "./photo-image";

test("compressPhotoBase64 returns JPEG and rejects invalid input", async () => {
	const input = await sharp({
		create: {
			width: 1,
			height: 1,
			channels: 3,
			background: "#fff",
		},
	})
		.png()
		.toBuffer();
	const jpeg = await compressPhotoBase64(input.toString("base64"));

	expect(jpeg[0]).toBe(0xff);
	expect(jpeg[1]).toBe(0xd8);
	await expect(compressPhotoBase64("not image")).rejects.toThrow();
});
