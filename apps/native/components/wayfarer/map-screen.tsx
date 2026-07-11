import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
	LayoutAnimation,
	Platform,
	Pressable,
	ScrollView,
	Text,
	UIManager,
	View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import Glyph from "@/components/Glyph";
import LiveMap from "@/components/LiveMap";
import MapBackground from "@/components/MapWebFallback";
import {
	AlbumIcon,
	CaptureIcon,
	ChevronRightIcon,
	LocationPinIcon,
	ProfileIcon,
	RecenterIcon,
} from "@/components/wayfarer/icons";
import { PlaceSheet } from "@/components/wayfarer/place-sheet";
import { useWayfarer } from "@/contexts/wayfarer-context";
import type { LatLng } from "@/lib/common-types";
import { ACCENT, INK, MONO, RANGE_M, SERIF, TEAL } from "@/lib/common-values";
import { tap } from "@/lib/haptics";
import { firstParam } from "@/lib/wayfarer-utils";
import type { Place } from "@/utils/trpc";

if (
	Platform.OS === "android" &&
	UIManager.setLayoutAnimationEnabledExperimental
) {
	UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function MapScreen() {
	const router = useRouter();
	const params = useLocalSearchParams<{ placeId?: string | string[] }>();
	const insets = useSafeAreaInsets();
	const selectedId = firstParam(params.placeId) ?? null;
	const [placesExpanded, setPlacesExpanded] = useState(false);

	const {
		userLoc,
		displayPlaceName,
		locationDenied,
		places,
		capturedCount,
		nearestPlace: card,
		mapRef,
		recenter,
		getPlace,
	} = useWayfarer();

	const selectedPlace = selectedId ? getPlace(selectedId) : undefined;

	const sortedPlaces = useMemo(
		() => [...places].sort((a, b) => a.dist - b.dist),
		[places],
	);

	const togglePlacesPanel = () => {
		tap();
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setPlacesExpanded((prev) => !prev);
	};

	const openSheet = (id: string) => {
		tap();
		router.setParams({ placeId: id });
	};

	const goAlbum = () => {
		tap();
		router.push("/album");
	};

	const goProfile = () => {
		tap();
		router.push("/profile");
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
					<Pressable
						onPress={togglePlacesPanel}
						style={{
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "space-between",
							paddingVertical: 7,
							gap: 8,
						}}
					>
						<Text
							numberOfLines={1}
							style={{
								flex: 1,
								fontFamily: MONO,
								fontSize: 10,
								letterSpacing: 1.4,
								color: "#6b6357",
							}}
						>
							{displayPlaceName.toUpperCase()}
						</Text>
						<Text
							style={{
								fontFamily: MONO,
								fontSize: 11,
								fontWeight: "700",
								color: TEAL,
							}}
						>
							{capturedCount} captured
						</Text>
					</Pressable>
					{placesExpanded ? (
						<View style={{ marginTop: 4 }}>
							<View
								style={{
									height: 1,
									backgroundColor: "rgba(34,27,46,.08)",
									marginBottom: 4,
								}}
							/>
							<ScrollView
								style={{ maxHeight: 380 }}
								nestedScrollEnabled
								showsVerticalScrollIndicator={false}
							>
								{sortedPlaces.map((place) => (
									<PlaceListRow
										key={place.id}
										place={place}
										onPress={() => openSheet(place.id)}
									/>
								))}
							</ScrollView>
						</View>
					) : null}
				</View>
				{!placesExpanded && (
					<View style={{ flexDirection: "row", gap: 10 }}>
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
						<Pressable
							onPress={goProfile}
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
							<ProfileIcon />
						</Pressable>
					</View>
				)}
			</View>

			{selectedPlace && userLoc ? (
				<PlaceCompass
					target={{ latitude: selectedPlace.lat, longitude: selectedPlace.lng }}
					userLoc={userLoc}
				/>
			) : null}

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
								{card.catLabel.toUpperCase()}
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
									{card.dist <= RANGE_M ? "In range" : `${card.dist} m away`}
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

function PlaceCompass({
	target,
	userLoc,
}: {
	target: LatLng;
	userLoc: LatLng;
}) {
	const [heading, setHeading] = useState<number | null>(null);

	useEffect(() => {
		let mounted = true;
		let sub: Location.LocationSubscription | null = null;
		Location.watchHeadingAsync((h) => {
			if (!mounted) return;
			setHeading(h.trueHeading >= 0 ? h.trueHeading : h.magHeading);
		}).then((s) => {
			if (mounted) {
				sub = s;
			} else {
				s.remove();
			}
		});
		return () => {
			mounted = false;
			sub?.remove();
		};
	}, []);

	// ponytail: heading is null until the first sensor event (always on simulator);
	// fall back to 0 (facing north) so the needle still shows the bearing.
	const rotation = bearingDeg(userLoc, target) - (heading ?? 0);

	return (
		// ponytail: sheet snaps to 55%, so "18%" centers the badge in the visible map strip
		<View
			pointerEvents="none"
			style={{
				position: "absolute",
				left: 0,
				right: 0,
				top: "18%",
				alignItems: "center",
				zIndex: 9,
			}}
		>
			<View
				style={{
					width: 110,
					height: 110,
					borderRadius: 55,
					backgroundColor: "rgba(255,255,255,.95)",
					borderWidth: 2,
					borderColor: "rgba(20,133,122,.25)",
					alignItems: "center",
					justifyContent: "center",
					shadowColor: INK,
					shadowOpacity: 0.3,
					shadowRadius: 24,
					shadowOffset: { width: 0, height: 10 },
					elevation: 10,
				}}
			>
				<View style={{ transform: [{ rotate: `${rotation}deg` }] }}>
					<Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
						<Path d="M12 2.5l5 15-5-3.2-5 3.2z" fill={TEAL} />
					</Svg>
				</View>
			</View>
		</View>
	);
}

function bearingDeg(from: LatLng, to: LatLng) {
	const toRad = (v: number) => (v * Math.PI) / 180;
	const dLng = toRad(to.longitude - from.longitude);
	const lat1 = toRad(from.latitude);
	const lat2 = toRad(to.latitude);
	const y = Math.sin(dLng) * Math.cos(lat2);
	const x =
		Math.cos(lat1) * Math.sin(lat2) -
		Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
	return (Math.atan2(y, x) * 180) / Math.PI;
}

function PlaceListRow({
	place,
	onPress,
}: {
	place: Place;
	onPress: () => void;
}) {
	return (
		<Pressable
			onPress={() => {
				tap();
				onPress();
			}}
			style={{
				flexDirection: "row",
				alignItems: "center",
				gap: 10,
				paddingVertical: 9,
				borderBottomWidth: 1,
				borderBottomColor: "rgba(34,27,46,.06)",
			}}
		>
			<View
				style={{
					width: 32,
					height: 32,
					borderRadius: 10,
					backgroundColor: place.color,
					alignItems: "center",
					justifyContent: "center",
					opacity: place.captured ? 0.55 : 1,
				}}
			>
				<Glyph cat={place.cat} size={14} color="#fff" />
			</View>
			<View style={{ flex: 1, gap: 2 }}>
				<Text
					numberOfLines={1}
					style={{
						fontFamily: SERIF,
						fontWeight: "600",
						fontSize: 15,
						color: INK,
					}}
				>
					{place.name}
				</Text>
				<Text
					style={{
						fontFamily: MONO,
						fontSize: 9,
						letterSpacing: 0.8,
						color: "#8a8276",
					}}
				>
					{place.catLabel.toUpperCase()}
				</Text>
			</View>
			<Text
				style={{
					fontFamily: MONO,
					fontSize: 10,
					fontWeight: "700",
					color: place.captured ? "#6b6357" : TEAL,
				}}
			>
				{place.captured
					? "Captured"
					: place.dist <= RANGE_M
						? "In range"
						: `${place.dist}m`}
			</Text>
		</Pressable>
	);
}
