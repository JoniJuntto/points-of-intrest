import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Polaroid from "@/components/Polaroid";
import { BackIcon } from "@/components/wayfarer/icons";
import { useWayfarer } from "@/contexts/wayfarer-context";
import { INK, MONO, SERIF } from "@/lib/common-values";

export function AlbumScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { places, albumPlaces } = useWayfarer();

	return (
		<View style={{ flex: 1, backgroundColor: "#F4ECDD" }}>
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
			>
				<View
					style={{
						paddingHorizontal: 20,
						paddingBottom: 16,
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
							marginBottom: 14,
							shadowColor: INK,
							shadowOpacity: 0.14,
							shadowRadius: 10,
							shadowOffset: { width: 0, height: 3 },
						}}
					>
						<BackIcon />
					</Pressable>
				</View>

				<View
					style={{
						flexDirection: "row",
						flexWrap: "wrap",
						paddingHorizontal: 16,
						gap: 16,
					}}
				>
					{albumPlaces.map((p, i) => (
						<Polaroid key={p.id} place={p} index={i} />
					))}
					{places
						.filter((p) => !p.captured)
						.sort((a, b) => a.dist - b.dist)
						.slice(0, 4)
						.map((e) => (
							<View
								key={e.id}
								style={{
									width: "47%",
									height: 188,
									borderRadius: 6,
									borderWidth: 2,
									borderStyle: "dashed",
									borderColor: "rgba(34,27,46,.18)",
									alignItems: "center",
									justifyContent: "center",
									gap: 8,
									backgroundColor: "rgba(255,255,255,.3)",
								}}
							>
								<View
									style={{
										width: 42,
										height: 42,
										borderRadius: 21,
										borderWidth: 2,
										borderStyle: "dashed",
										borderColor: "rgba(34,27,46,.2)",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<Text
										style={{
											fontFamily: SERIF,
											fontSize: 22,
											color: "rgba(34,27,46,.32)",
										}}
									>
										?
									</Text>
								</View>
								<Text
									style={{
										fontFamily: MONO,
										fontSize: 9,
										color: "#a89e8e",
									}}
								>
									{e.dist}m away
								</Text>
							</View>
						))}
				</View>
			</ScrollView>
		</View>
	);
}
