import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthScreen } from "@/components/wayfarer/auth-screen";
import { BackIcon } from "@/components/wayfarer/icons";
import { useWayfarer } from "@/contexts/wayfarer-context";
import { authClient } from "@/lib/auth-client";
import { ACCENT, INK, MONO, SERIF, TEAL } from "@/lib/common-values";
import { tap } from "@/lib/haptics";
import { queryClient } from "@/utils/trpc";

function initials(name: string) {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");
}

function FieldRow({ label, value }: { label: string; value: string }) {
	return (
		<View>
			<Text
				style={{
					fontFamily: MONO,
					fontSize: 9,
					letterSpacing: 1.4,
					color: "#8a8276",
				}}
			>
				{label}
			</Text>
			<Text
				style={{
					fontFamily: SERIF,
					fontSize: 17,
					fontWeight: "600",
					color: INK,
					marginTop: 2,
				}}
				numberOfLines={1}
			>
				{value}
			</Text>
		</View>
	);
}

function DashedRule() {
	return (
		<View
			style={{
				borderTopWidth: 1,
				borderStyle: "dashed",
				borderColor: "rgba(34,27,46,.18)",
			}}
		/>
	);
}

export function ProfileScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { data: session } = authClient.useSession();
	const { capturedCount, total, progress, displayPlaceName } = useWayfarer();
	const [signingOut, setSigningOut] = useState(false);

	const user = session?.user;
	const isAnonymous = user?.isAnonymous === true;
	const name = isAnonymous ? "Guest explorer" : (user?.name ?? "Wayfarer");
	const email = isAnonymous ? "" : (user?.email ?? "");
	const passportNo = (user?.id ?? "").slice(0, 8).toUpperCase() || "—";

	const signOut = async () => {
		if (signingOut) return;
		tap();
		setSigningOut(true);
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					queryClient.clear();
				},
			},
		});
		setSigningOut(false);
	};

	return (
		<View style={{ flex: 1, backgroundColor: "#F4ECDD" }}>
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerStyle={{
					paddingBottom: insets.bottom + 40,
					paddingHorizontal: 20,
				}}
			>
				<Pressable
					onPress={() => router.replace("/")}
					style={{
						width: 44,
						height: 44,
						borderRadius: 22,
						backgroundColor: "#fff",
						alignItems: "center",
						justifyContent: "center",
						marginBottom: 20,
						shadowColor: INK,
						shadowOpacity: 0.14,
						shadowRadius: 10,
						shadowOffset: { width: 0, height: 3 },
					}}
				>
					<BackIcon />
				</Pressable>

				<View
					style={{
						backgroundColor: "#fff",
						borderRadius: 22,
						borderWidth: 1.5,
						borderColor: "rgba(34,27,46,.12)",
						padding: 20,
						gap: 16,
						marginBottom: 16,
						shadowColor: INK,
						shadowOpacity: 0.08,
						shadowRadius: 24,
						shadowOffset: { width: 0, height: 8 },
						elevation: 4,
					}}
				>
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "space-between",
						}}
					>
						<Text
							style={{
								fontFamily: MONO,
								fontSize: 9,
								letterSpacing: 1.8,
								color: "#8a8276",
							}}
						>
							PLEISES · PLACE PASSPORT
						</Text>
						<Text
							style={{
								fontFamily: MONO,
								fontSize: 9,
								letterSpacing: 1,
								color: TEAL,
								fontWeight: "700",
							}}
						>
							№ {passportNo}
						</Text>
					</View>

					<View style={{ flexDirection: "row", gap: 16 }}>
						<View style={{ transform: [{ rotate: "-2deg" }] }}>
							<View
								style={{
									width: 88,
									height: 88,
									borderRadius: 10,
									backgroundColor: INK,
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<View
									style={{
										position: "absolute",
										top: 4,
										left: 4,
										right: 4,
										bottom: 4,
										borderWidth: 1,
										borderColor: "rgba(255,255,255,.35)",
										borderRadius: 7,
									}}
								/>
								<Text
									style={{
										fontFamily: SERIF,
										fontSize: 30,
										fontWeight: "700",
										color: "#fff",
									}}
								>
									{initials(name) || "?"}
								</Text>
							</View>
							<View
								style={{
									position: "absolute",
									top: -8,
									left: "50%",
									marginLeft: -28,
									width: 56,
									height: 17,
									backgroundColor: "rgba(26,163,154,.5)",
									borderWidth: 1,
									borderColor: "rgba(255,255,255,.4)",
									transform: [{ rotate: "-4deg" }],
								}}
							/>
						</View>

						<View style={{ flex: 1, justifyContent: "center", gap: 10 }}>
							<FieldRow label="NAME" value={name} />
							{isAnonymous ? (
								<FieldRow label="STATUS" value="Playing as guest" />
							) : (
								<FieldRow label="EMAIL" value={email || "—"} />
							)}
						</View>
					</View>

					<DashedRule />

					<FieldRow label="EXPLORING NEAR" value={displayPlaceName} />

					<View>
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								alignItems: "baseline",
								marginBottom: 8,
							}}
						>
							<Text
								style={{
									fontFamily: MONO,
									fontSize: 9,
									letterSpacing: 1.4,
									color: "#8a8276",
								}}
							>
								STAMPS
							</Text>
							<Text
								style={{
									fontFamily: MONO,
									fontSize: 12,
									fontWeight: "700",
									color: TEAL,
								}}
							>
								{capturedCount} OF {total} · {progress}%
							</Text>
						</View>
						<View
							style={{
								height: 4,
								borderRadius: 2,
								backgroundColor: "rgba(34,27,46,.08)",
								overflow: "hidden",
							}}
						>
							<View
								style={{
									width: `${Math.min(100, Math.max(0, progress))}%`,
									height: 4,
									borderRadius: 2,
									backgroundColor: TEAL,
								}}
							/>
						</View>
					</View>
				</View>

				<Pressable
					onPress={() => {
						tap();
						router.push("/album");
					}}
					style={{
						height: 54,
						borderRadius: 16,
						backgroundColor: INK,
						alignItems: "center",
						justifyContent: "center",
						marginBottom: 12,
					}}
				>
					<Text style={{ fontWeight: "700", fontSize: 15, color: "#fff" }}>
						View passport
					</Text>
				</Pressable>

				{isAnonymous ? (
					<View
						style={{
							backgroundColor: "#fff",
							borderRadius: 18,
							padding: 18,
							marginBottom: 12,
							gap: 12,
							shadowColor: INK,
							shadowOpacity: 0.08,
							shadowRadius: 12,
							shadowOffset: { width: 0, height: 3 },
						}}
					>
						<Text
							style={{
								fontFamily: MONO,
								fontSize: 10,
								letterSpacing: 1.4,
								color: "#6b6357",
							}}
						>
							SAVE YOUR PROGRESS
						</Text>
						<Text
							style={{
								fontFamily: SERIF,
								fontSize: 20,
								fontWeight: "600",
								color: INK,
							}}
						>
							Create an account to keep your captures across devices.
						</Text>
						<AuthScreen embedded />
					</View>
				) : null}

				<Pressable
					onPress={signOut}
					disabled={signingOut}
					style={{
						height: 54,
						borderRadius: 16,
						backgroundColor: "#fff",
						borderWidth: 1.5,
						borderColor: "rgba(34,27,46,.12)",
						alignItems: "center",
						justifyContent: "center",
						opacity: signingOut ? 0.6 : 1,
					}}
				>
					<Text style={{ fontWeight: "700", fontSize: 15, color: ACCENT }}>
						{signingOut
							? "Signing out…"
							: isAnonymous
								? "Reset guest session"
								: "Sign out"}
					</Text>
				</Pressable>
			</ScrollView>
		</View>
	);
}
