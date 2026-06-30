import { env } from "@poigame/env/native";
import type { ImageSourcePropType } from "react-native";

import { authClient } from "@/lib/auth-client";

export function photoSource(
	photoPath?: string | null,
): ImageSourcePropType | null {
	if (!photoPath) return null;
	const cookie = authClient.getCookie();
	return {
		uri: `${env.EXPO_PUBLIC_SERVER_URL}${photoPath}`,
		headers: cookie ? { Cookie: cookie } : undefined,
	};
}
