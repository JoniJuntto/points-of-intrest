import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Confetti from "@/components/Confetti";
import RevealPolaroid from "@/components/RevealPolaroid";
import { useWayfarer } from "@/contexts/wayfarer-context";
import { INK, MONO, SERIF, TEAL } from "@/lib/common-values";
import { tap } from "@/lib/haptics";
import { firstParam } from "@/lib/wayfarer-utils";

export function RevealScreen() {
	const router = useRouter();
	const params = useLocalSearchParams<{ placeId?: string | string[] }>();
	const placeId = firstParam(params.placeId);
	const insets = useSafeAreaInsets();
	const { getPlace, total, capturedCount, progress } = useWayfarer();
	const place = placeId ? getPlace(placeId) : undefined;

	if (!place) {
		return (
			<View
				style={{
					flex: 1,
					backgroundColor: "#FBF6EC",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Text>Place not found</Text>
			</View>
		);
	}

	const keepExploring = () => {
		tap();
		router.replace("/");
	};

	const goAlbum = () => {
		tap();
		router.replace("/album");
	};

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: "#FBF6EC",
				overflow: "hidden",
			}}
		>
			<Confetti />
			<RevealPolaroid place={place} top={insets.top + 90} />
			<View
				style={{
					position: "absolute",
					left: 24,
					right: 24,
					bottom: insets.bottom + 34,
					alignItems: "center",
				}}
			>
				<Animated.Text
					entering={FadeInDown.delay(900).duration(500)}
					style={{
						fontFamily: SERIF,
						fontWeight: "800",
						fontSize: 34,
						color: INK,
					}}
				>
					Captured!
				</Animated.Text>
				<Animated.Text
					entering={FadeInDown.delay(1000).duration(500)}
					style={{
						fontSize: 15,
						color: "#6b6357",
						marginTop: 6,
						lineHeight: 21,
						textAlign: "center",
					}}
				>
					{place.name} is in your passport.
				</Animated.Text>

				<Animated.View
					entering={FadeInDown.delay(1100).duration(500)}
					style={{
						flexDirection: "row",
						gap: 11,
						marginTop: 20,
						alignSelf: "stretch",
					}}
				>
					<Pressable
						onPress={keepExploring}
						style={{
							flex: 1,
							height: 54,
							borderRadius: 16,
							backgroundColor: "#fff",
							borderWidth: 1.5,
							borderColor: "rgba(34,27,46,.12)",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Text style={{ fontWeight: "700", fontSize: 15, color: INK }}>
							Keep exploring
						</Text>
					</Pressable>
					<Pressable
						onPress={goAlbum}
						style={{
							flex: 1,
							height: 54,
							borderRadius: 16,
							backgroundColor: INK,
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Text style={{ fontWeight: "700", fontSize: 15, color: "#fff" }}>
							View passport
						</Text>
					</Pressable>
				</Animated.View>
			</View>
		</View>
	);
}
