import { useEffect, useRef } from "react";
import { View } from "react-native";
import Animated, {
	Easing,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withTiming,
} from "react-native-reanimated";
import { CONFETTI_KEYS } from "@/lib/common-values";

function ConfettiPiece({ index }: { index: number }) {
	const colors = [
		"#1AA39A",
		"#E0703B",
		"#8A4E93",
		"#E0A23B",
		"#5C9A57",
		"#F4D06F",
	];
	const cfg = useRef({
		dx: (Math.random() * 2 - 1) * 150,
		dy: 70 + Math.random() * 240,
		rot: (Math.random() * 2 - 1) * 440,
		sz: 6 + Math.random() * 8,
		round: index % 3 === 0,
		dur: 820 + Math.random() * 520,
		delay: Math.random() * 140,
		color: colors[index % colors.length],
	}).current;
	const t = useSharedValue(0);
	useEffect(() => {
		t.value = withDelay(
			cfg.delay,
			withTiming(1, {
				duration: cfg.dur,
				easing: Easing.bezier(0.2, 0.6, 0.3, 1),
			}),
		);
	}, [t, cfg]);
	const style = useAnimatedStyle(() => ({
		opacity: interpolate(t.value, [0, 0.12, 1], [0, 1, 0]),
		transform: [
			{ translateX: cfg.dx * t.value },
			{ translateY: cfg.dy * t.value },
			{ rotate: `${cfg.rot * t.value}deg` },
			{ scale: interpolate(t.value, [0, 1], [0.5, 1]) },
		],
	}));
	return (
		<Animated.View
			style={[
				{
					position: "absolute",
					left: "50%",
					top: "33%",
					width: cfg.sz,
					height: cfg.round ? cfg.sz : cfg.sz * 0.5,
					backgroundColor: cfg.color,
					borderRadius: cfg.round ? cfg.sz : 2,
				},
				style,
			]}
		/>
	);
}

export default function Confetti() {
	return (
		<View
			pointerEvents="none"
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				zIndex: 20,
			}}
		>
			{CONFETTI_KEYS.map((key, i) => (
				<ConfettiPiece key={key} index={i} />
			))}
		</View>
	);
}
