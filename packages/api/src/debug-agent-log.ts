import { appendFileSync } from "node:fs";

const LOG_PATH = "/Users/joni/koodaus/poigame/.cursor/debug-22fb80.log";

export function agentDebugLog(payload: Record<string, unknown>) {
	try {
		appendFileSync(
			LOG_PATH,
			`${JSON.stringify({ sessionId: "22fb80", ...payload, timestamp: Date.now() })}\n`,
		);
	} catch {
		// ignore write failures during debug
	}
}
