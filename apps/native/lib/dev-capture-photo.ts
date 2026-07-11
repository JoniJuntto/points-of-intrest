import * as Device from "expo-device";
import { Image } from "react-native";

const DEV_CAPTURE_ICON = require("@/assets/images/icon.png");

/** In dev on simulator/emulator, skip the camera and upload a bundled placeholder. */
export const skipCameraOnSimulator = __DEV__ && !Device.isDevice;

let cachedBase64: string | null = null;

export async function devCapturePhotoBase64(): Promise<string> {
	if (cachedBase64) return cachedBase64;

	const { uri } = Image.resolveAssetSource(DEV_CAPTURE_ICON);
	const response = await fetch(uri);
	if (!response.ok) {
		throw new Error("Failed to load dev capture photo");
	}

	const buffer = await response.arrayBuffer();
	cachedBase64 = arrayBufferToBase64(buffer);
	return cachedBase64;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	const chunkSize = 0x8000;
	let binary = "";
	for (let i = 0; i < bytes.length; i += chunkSize) {
		binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
	}
	return btoa(binary);
}
