import { Platform } from "react-native";
import type { Place } from "@/utils/trpc";

export const INK = "#221B2E";
export const TEAL = "#14857A";
export const ACCENT = "#E45D4F";
export const SERIF = Platform.select({ ios: "Georgia", default: "serif" });
export const MONO = Platform.select({
	ios: "Menlo",
	android: "monospace",
	default: "monospace",
});

export const RANGE_M = 1_000;
export const RING_CIRC = 2 * Math.PI * 34; // 213.6
export const CONFETTI_KEYS = Array.from(
	{ length: 28 },
	(_, index) => `confetti-${index}`,
);

export function ringOffset(dist: number): number {
	const pct =
		dist <= RANGE_M
			? 1
			: Math.max(0.06, Math.min(1, 1 - (dist - RANGE_M) / 270));
	return Math.round(RING_CIRC * (1 - pct));
}

export function nearestUncaptured(places: Place[]): Place | null {
	const unc = places.filter((p) => !p.captured).sort((a, b) => a.dist - b.dist);
	return unc[0] ?? null;
}
