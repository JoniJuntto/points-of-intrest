import { Image, Text, View } from "react-native";
import { INK, MONO, SERIF } from "@/lib/common-values";
import { photoSource } from "@/lib/photo-source";
import type { Place } from "@/utils/trpc";
import Glyph from "./Glyph";

export default function Polaroid({
	place,
	index,
}: {
	place: Place;
	index: number;
}) {
	const tilts = ["-2.5deg", "2deg", "-1.5deg", "2.5deg", "-2deg", "1.5deg"];
	const tapeTilts = ["4deg", "-5deg", "3deg", "-3deg", "6deg", "-4deg"];
	const source = photoSource(place.photoPath);
	return (
		<View
			style={{
				width: "47%",
				backgroundColor: "#fff",
				paddingHorizontal: 10,
				paddingTop: 10,
				borderRadius: 3,
				transform: [{ rotate: tilts[index % tilts.length] }],
				shadowColor: INK,
				shadowOpacity: 0.16,
				shadowRadius: 20,
				shadowOffset: { width: 0, height: 8 },
				elevation: 6,
			}}
		>
			<View
				style={{
					position: "absolute",
					left: "50%",
					top: -11,
					marginLeft: -31,
					width: 62,
					height: 22,
					backgroundColor: "rgba(224,112,59,.42)",
					borderWidth: 1,
					borderColor: "rgba(255,255,255,.35)",
					transform: [{ rotate: tapeTilts[index % tapeTilts.length] }],
				}}
			/>
			<View
				style={{
					height: 120,
					borderRadius: 2,
					backgroundColor: place.color,
					overflow: "hidden",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				{source ? (
					<Image
						source={source}
						style={{ width: "100%", height: "100%" }}
						resizeMode="cover"
					/>
				) : (
					<View style={{ opacity: 0.92 }}>
						<Glyph cat={place.cat} size={34} color="#fff" />
					</View>
				)}
			</View>
			<View style={{ paddingHorizontal: 3, paddingTop: 9, paddingBottom: 13 }}>
				<Text
					numberOfLines={2}
					style={{
						fontFamily: SERIF,
						fontWeight: "700",
						fontStyle: "italic",
						fontSize: 14,
						color: INK,
					}}
				>
					{place.name}
				</Text>
				<Text
					style={{
						fontFamily: MONO,
						fontSize: 9,
						color: "#9a8f7e",
						marginTop: 3,
					}}
				>
					{place.date} · {place.coord}
				</Text>
			</View>
		</View>
	);
}
