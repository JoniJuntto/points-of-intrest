import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Glyph from "@/components/Glyph";
import LiveMap from "@/components/LiveMap";
import MapBackground from "@/components/MapWebFallback";
import {
	AlbumIcon,
	CaptureIcon,
	ChevronRightIcon,
	LocationPinIcon,
	RecenterIcon,
} from "@/components/wayfarer/icons";
import { PlaceSheet } from "@/components/wayfarer/place-sheet";
import { useWayfarer } from "@/contexts/wayfarer-context";
import { ACCENT, INK, MONO, RANGE_M, SERIF, TEAL } from "@/lib/common-values";
import { tap } from "@/lib/haptics";
import { firstParam } from "@/lib/wayfarer-utils";

export function MapScreen() {
	const router = useRouter();
	const params = useLocalSearchParams<{ placeId?: string | string[] }>();
	const insets = useSafeAreaInsets();
	const selectedId = firstParam(params.placeId) ?? null;

	const {
		userLoc,
		displayPlaceName,
		locationDenied,
		places,
		total,
		capturedCount,
		progress,
		nearestPlace: card,
		mapRef,
		recenter,
	} = useWayfarer();

	const openSheet = (id: string) => {
		tap();
		router.setParams({ placeId: id });
	};

	const goAlbum = () => {
		tap();
		router.push("/album");
	};

	return (
		<View style={{ flex: 1, overflow: "hidden", backgroundColor: "#E9E5DB" }}>
			{userLoc ? (
				<LiveMap
					places={places}
					onMarkerTap={openSheet}
					mapRef={mapRef}
					userLoc={userLoc}
				/>
			) : (
				<View style={{ flex: 1 }}>
					<MapBackground />
					<View
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							alignItems: "center",
							justifyContent: "center",
							paddingHorizontal: 32,
						}}
					>
						<Text
							style={{
								fontFamily: SERIF,
								fontSize: 20,
								color: INK,
								textAlign: "center",
							}}
						>
							{locationDenied
								? "Location access is needed to explore nearby places."
								: "Finding your location…"}
						</Text>
					</View>
				</View>
			)}

			<View
				style={{
					position: "absolute",
					top: insets.top + 8,
					left: 14,
					right: 14,
					flexDirection: "row",
					gap: 10,
					alignItems: "center",
					zIndex: 8,
				}}
			>
				<View
					style={{
						flex: 1,
						backgroundColor: "rgba(255,255,255,.92)",
						borderRadius: 18,
						paddingVertical: 9,
						paddingHorizontal: 14,
						shadowColor: INK,
						shadowOpacity: 0.14,
						shadowRadius: 16,
						shadowOffset: { width: 0, height: 4 },
					}}
				>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							marginBottom: 7,
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
							{displayPlaceName.toUpperCase()} · EXPLORING
						</Text>
						<Text
							style={{
								fontFamily: MONO,
								fontSize: 11,
								fontWeight: "700",
								color: TEAL,
							}}
						>
							{capturedCount}/{total}
						</Text>
					</View>
					<View
						style={{
							height: 6,
							borderRadius: 4,
							backgroundColor: "rgba(34,27,46,.10)",
							overflow: "hidden",
						}}
					>
						<View
							style={{
								height: "100%",
								width: `${progress}%`,
								borderRadius: 4,
								backgroundColor: "#1FB8A6",
							}}
						/>
					</View>
				</View>
				<Pressable
					onPress={goAlbum}
					style={{
						width: 46,
						height: 46,
						borderRadius: 16,
						backgroundColor: "rgba(59,42,74,.95)",
						alignItems: "center",
						justifyContent: "center",
						shadowColor: INK,
						shadowOpacity: 0.28,
						shadowRadius: 16,
						shadowOffset: { width: 0, height: 4 },
					}}
				>
					<AlbumIcon />
				</Pressable>
			</View>

			<Pressable
				onPress={() => {
					tap();
					recenter();
				}}
				style={{
					position: "absolute",
					right: 16,
					bottom: insets.bottom + 148,
					width: 46,
					height: 46,
					borderRadius: 23,
					backgroundColor: "rgba(255,255,255,.92)",
					alignItems: "center",
					justifyContent: "center",
					zIndex: 6,
					shadowColor: INK,
					shadowOpacity: 0.2,
					shadowRadius: 14,
					shadowOffset: { width: 0, height: 4 },
				}}
			>
				<RecenterIcon />
			</Pressable>

			{card ? (
				<Animated.View
					entering={FadeInDown.duration(500)}
					style={{
						position: "absolute",
						left: 14,
						right: 14,
						bottom: insets.bottom + 26,
						zIndex: 7,
					}}
				>
					<Pressable
						onPress={() => openSheet(card.id)}
						style={{
							backgroundColor: "#fff",
							borderRadius: 24,
							padding: 13,
							flexDirection: "row",
							alignItems: "center",
							gap: 13,
							shadowColor: INK,
							shadowOpacity: 0.28,
							shadowRadius: 34,
							shadowOffset: { width: 0, height: 12 },
							elevation: 8,
						}}
					>
						<View
							style={{
								width: 60,
								height: 60,
								borderRadius: 14,
								backgroundColor: card.color,
								alignItems: "center",
								justifyContent: "center",
								shadowColor: INK,
								shadowOpacity: 0.2,
								shadowRadius: 10,
								shadowOffset: { width: 0, height: 4 },
							}}
						>
							<Glyph cat={card.cat} size={22} color="#fff" />
						</View>
						<View style={{ flex: 1 }}>
							<Text
								style={{
									fontFamily: MONO,
									fontSize: 10,
									letterSpacing: 1.2,
									color: "#8a8276",
								}}
							>
								NEXT TO DISCOVER · {card.catLabel.toUpperCase()}
							</Text>
							<Text
								numberOfLines={1}
								style={{
									fontFamily: SERIF,
									fontWeight: "700",
									fontSize: 20,
									color: INK,
									marginVertical: 2,
								}}
							>
								{card.name}
							</Text>
							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
									gap: 7,
								}}
							>
								<LocationPinIcon />
								<Text style={{ fontSize: 13, fontWeight: "600", color: TEAL }}>
									{card.dist <= RANGE_M
										? "In range — tap to capture"
										: `${card.dist} m away`}
								</Text>
							</View>
						</View>
						{card.dist <= RANGE_M ? (
							<View
								style={{
									height: 44,
									paddingHorizontal: 16,
									borderRadius: 14,
									backgroundColor: ACCENT,
									flexDirection: "row",
									alignItems: "center",
									gap: 7,
									shadowColor: ACCENT,
									shadowOpacity: 0.4,
									shadowRadius: 14,
									shadowOffset: { width: 0, height: 5 },
								}}
							>
								<CaptureIcon stroke="#fff" />
								<Text
									style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}
								>
									Capture
								</Text>
							</View>
						) : (
							<View
								style={{
									width: 34,
									height: 34,
									borderRadius: 17,
									backgroundColor: "#F2EFE9",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<ChevronRightIcon />
							</View>
						)}
					</Pressable>
				</Animated.View>
			) : null}

			<PlaceSheet placeId={selectedId} />
		</View>
	);
}
