import { useEffect } from "react";
import { Image, Text, View } from "react-native";
import Animated, {
	Easing,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withTiming,
} from "react-native-reanimated";
import Glyph from "@/components/Glyph";
import Stamp from "@/components/Stamp";
import { useWayfarer } from "@/contexts/wayfarer-context";
import { INK, MONO, SERIF } from "@/lib/common-values";
import { photoSource } from "@/lib/photo-source";
import type { Place } from "@/utils/trpc";

export default function RevealPolaroid({
	place,
	top,
}: {
	place: Place;
	top: number;
}) {
	const { displayPlaceName } = useWayfarer();
	const d = useSharedValue(0);
	const slam = useSharedValue(0);
	useEffect(() => {
		d.value = withTiming(1, {
			duration: 1000,
			easing: Easing.bezier(0.3, 0.7, 0.4, 1),
		});
		slam.value = withDelay(
			620,
			withTiming(1, { duration: 380, easing: Easing.out(Easing.ease) }),
		);
	}, [d, slam]);
	const dropStyle = useAnimatedStyle(() => ({
		opacity: interpolate(d.value, [0, 0.14, 1], [0, 1, 1]),
		transform: [
			{
				translateY: interpolate(
					d.value,
					[0, 0.58, 0.72, 0.86, 1],
					[-420, 0, -28, 0, 0],
				),
			},
			{
				rotate: `${interpolate(d.value, [0, 0.58, 0.72, 0.86, 1], [-13, -3.2, -5, -2.4, -3])}deg`,
			},
		],
	}));
	const slamStyle = useAnimatedStyle(() => ({
		opacity: interpolate(slam.value, [0, 0.7, 1], [0, 1, 1]),
		transform: [
			{ rotate: "9deg" },
			{ scale: interpolate(slam.value, [0, 1], [2.7, 1]) },
		],
	}));
	const source = photoSource(place.photoPath);
	return (
		<Animated.View
			style={[
				{
					position: "absolute",
					left: "50%",
					top,
					marginLeft: -106,
					width: 212,
				},
				dropStyle,
			]}
		>
			<View
				style={{
					backgroundColor: "#fff",
					paddingHorizontal: 13,
					paddingTop: 13,
					borderRadius: 4,
					shadowColor: INK,
					shadowOpacity: 0.3,
					shadowRadius: 36,
					shadowOffset: { width: 0, height: 16 },
					elevation: 10,
				}}
			>
				<View
					style={{
						position: "absolute",
						left: "50%",
						top: -13,
						marginLeft: -44,
						width: 88,
						height: 26,
						backgroundColor: "rgba(26,163,154,.5)",
						borderWidth: 1,
						borderColor: "rgba(255,255,255,.4)",
						transform: [{ rotate: "-3deg" }],
					}}
				/>
				<View
					style={{
						height: 190,
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
						<View style={{ opacity: 0.9 }}>
							<Glyph cat={place.cat} size={96} color="rgba(255,255,255,.92)" />
						</View>
					)}
					<Text
						style={{
							position: "absolute",
							left: 10,
							bottom: 8,
							fontFamily: MONO,
							fontSize: 9,
							color: "rgba(255,255,255,.82)",
						}}
					>
						{place.coord}
					</Text>
				</View>
				<View
					style={{ paddingHorizontal: 4, paddingTop: 11, paddingBottom: 16 }}
				>
					<Text
						style={{
							fontFamily: SERIF,
							fontWeight: "700",
							fontStyle: "italic",
							fontSize: 17,
							color: INK,
						}}
					>
						{place.name}
					</Text>
					<Text
						style={{
							fontFamily: MONO,
							fontSize: 10,
							color: "#9a8f7e",
							marginTop: 3,
						}}
					>
						{place.date} · {displayPlaceName.toUpperCase()}
					</Text>
				</View>
				<Animated.View
					style={[{ position: "absolute", right: -14, bottom: 8 }, slamStyle]}
				>
					<Stamp color={place.color} cat={place.cat} />
				</Animated.View>
			</View>
		</Animated.View>
	);
}
