import BottomSheet, {
	type BottomSheet as BottomSheetRef,
	BottomSheetScrollView,
} from "@expo/ui/community/bottom-sheet";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Glyph from "@/components/Glyph";
import ProgressRing from "@/components/ProgressRing";
import { CaptureIcon } from "@/components/wayfarer/icons";
import { useWayfarer } from "@/contexts/wayfarer-context";
import { ACCENT, INK, MONO, RANGE_M, SERIF } from "@/lib/common-values";
import { bump } from "@/lib/haptics";
import type { Place } from "@/utils/trpc";

type PlaceSheetProps = {
	placeId: string | null;
};

export function PlaceSheet({ placeId }: PlaceSheetProps) {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const sheetRef = useRef<BottomSheetRef>(null);
	const { getPlace } = useWayfarer();
	const place = placeId ? getPlace(placeId) : undefined;

	useEffect(() => {
		if (placeId) {
			sheetRef.current?.snapToIndex(0);
			return;
		}
		sheetRef.current?.close();
	}, [placeId]);

	const closeSheet = () => {
		router.replace("/");
	};

	const startCapture = () => {
		if (!placeId) return;
		bump();
		sheetRef.current?.close();
		router.push({
			pathname: "/capture/[placeId]",
			params: { placeId },
		});
	};

	if (!place) {
		return (
			<BottomSheet
				ref={sheetRef}
				index={-1}
				enableDynamicSizing
				enablePanDownToClose
				onClose={closeSheet}
				backgroundStyle={{ backgroundColor: "#FBF6EC" }}
			>
				<BottomSheetScrollView />
			</BottomSheet>
		);
	}

	const inRange = place.dist <= RANGE_M;

	return (
		<BottomSheet
			ref={sheetRef}
			index={-1}
			snapPoints={["55%", "88%"]}
			enablePanDownToClose
			onClose={closeSheet}
			backgroundStyle={{ backgroundColor: "#FBF6EC" }}
		>
			<BottomSheetScrollView
				contentContainerStyle={{
					paddingHorizontal: 20,
					paddingTop: 8,
					paddingBottom: insets.bottom + 24,
				}}
			>
				<PlaceSheetContent
					place={place}
					inRange={inRange}
					onCapture={startCapture}
				/>
			</BottomSheetScrollView>
		</BottomSheet>
	);
}

function PlaceSheetContent({
	place,
	inRange,
	onCapture,
}: {
	place: Place;
	inRange: boolean;
	onCapture: () => void;
}) {
	return (
		<View style={{ gap: 0 }}>
			<Text
				style={{
					fontFamily: MONO,
					fontSize: 11,
					letterSpacing: 1.4,
					color: "#9a8f7e",
					marginTop: 16,
					marginBottom: 3,
				}}
			>
				{place.catLabel.toUpperCase()}
			</Text>
			<Text
				style={{
					fontFamily: SERIF,
					fontWeight: "700",
					fontSize: 27,
					color: INK,
				}}
			>
				{place.name}
			</Text>

			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					gap: 16,
					marginTop: 18,
					padding: 14,
					borderRadius: 18,
					backgroundColor: "#fff",
					shadowColor: INK,
					shadowOpacity: 0.07,
					shadowRadius: 14,
					shadowOffset: { width: 0, height: 4 },
				}}
			>
				<ProgressRing dist={place.dist} inRange={inRange} />
				<View style={{ flex: 1 }}>
					<Text
						style={{
							fontFamily: SERIF,
							fontWeight: "700",
							fontSize: 18,
							color: INK,
						}}
					>
						{inRange ? "You're here" : `${place.dist} m away`}
					</Text>
					<Text
						style={{
							fontSize: 13,
							color: "#8a8276",
							marginTop: 3,
							lineHeight: 18,
						}}
					>
						{inRange ? "Capture it!" : "Get within 1 km to capture"}
					</Text>
				</View>
			</View>

			{inRange ? (
				<Pressable
					onPress={onCapture}
					style={{
						marginTop: 14,
						height: 58,
						borderRadius: 18,
						backgroundColor: ACCENT,
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "center",
						gap: 10,
						shadowColor: ACCENT,
						shadowOpacity: 0.42,
						shadowRadius: 22,
						shadowOffset: { width: 0, height: 8 },
					}}
				>
					<CaptureIcon stroke="#fff" />
					<Text style={{ color: "#fff", fontWeight: "700", fontSize: 17 }}>
						Capture this place
					</Text>
				</Pressable>
			) : null}
		</View>
	);
}
