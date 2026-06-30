import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Polaroid from "@/components/Polaroid";
import { BackIcon } from "@/components/wayfarer/icons";
import { useWayfarer } from "@/contexts/wayfarer-context";
import { INK, MONO, SERIF, TEAL } from "@/lib/common-values";

export function AlbumScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { displayPlaceName, places, albumPlaces, total, capturedCount, progress } =
		useWayfarer();

	return (
		<View style={{ flex: 1, backgroundColor: "#F4ECDD" }}>
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
			>
				<View
					style={{
						paddingTop: insets.top + 14,
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
					<Text
						style={{
							fontFamily: MONO,
							fontSize: 11,
							letterSpacing: 2,
							color: "#9a8f7e",
						}}
					>
						TRAVEL PASSPORT
					</Text>
					<Text
						style={{
							fontFamily: SERIF,
							fontWeight: "800",
							fontSize: 34,
							color: INK,
							marginTop: 2,
						}}
					>
						{displayPlaceName}
					</Text>
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							gap: 10,
							marginTop: 12,
						}}
					>
						<View
							style={{
								flex: 1,
								height: 8,
								borderRadius: 5,
								backgroundColor: "rgba(34,27,46,.1)",
								overflow: "hidden",
							}}
						>
							<View
								style={{
									height: "100%",
									width: `${progress}%`,
									borderRadius: 5,
									backgroundColor: "#1FB8A6",
								}}
							/>
						</View>
						<Text
							style={{
								fontFamily: MONO,
								fontSize: 12,
								fontWeight: "700",
								color: TEAL,
							}}
						>
							{capturedCount}/{total}
						</Text>
					</View>
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
