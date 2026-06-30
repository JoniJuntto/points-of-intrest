import { useEffect } from "react";
import Animated, {
	Easing,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";

export default function Reticle() {
	const r = useSharedValue(0);
	useEffect(() => {
		r.value = withRepeat(
			withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
			-1,
			true,
		);
	}, [r]);
	const style = useAnimatedStyle(() => ({
		transform: [{ scale: interpolate(r.value, [0, 1], [1, 1.06]) }],
		opacity: interpolate(r.value, [0, 1], [0.9, 0.5]),
	}));
	return (
		<Animated.View
			style={[
				{
					width: 84,
					height: 84,
					borderWidth: 2,
					borderColor: "rgba(255,255,255,.8)",
					borderRadius: 42,
				},
				style,
			]}
		/>
	);
}
