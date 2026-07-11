import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
	Easing,
	FadeInDown,
	interpolate,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withDelay,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Container } from "@/components/container";
import Stamp from "@/components/Stamp";
import { SignIn } from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";
import { INK, MONO, SERIF, TEAL } from "@/lib/common-values";
import { tap } from "@/lib/haptics";

const PAPER = "#FBF6EC";

export function AuthScreen({ embedded = false }: { embedded?: boolean }) {
	const [showSignIn, setShowSignIn] = useState(true);
	const insets = useSafeAreaInsets();
	const reduceMotion = useReducedMotion();
	const slam = useSharedValue(reduceMotion ? 1 : 0);

	useEffect(() => {
		if (!reduceMotion) {
			slam.value = withDelay(
				520,
				withTiming(1, { duration: 380, easing: Easing.out(Easing.ease) }),
			);
		}
	}, [slam, reduceMotion]);

	const slamStyle = useAnimatedStyle(() => ({
		opacity: interpolate(slam.value, [0, 0.7, 1], [0, 1, 1]),
		transform: [
			{ rotate: "8deg" },
			{ scale: interpolate(slam.value, [0, 1], [2.4, 1]) },
		],
	}));

	const toggleMode = () => {
		tap();
		setShowSignIn((prev) => !prev);
	};

	return (
		<Container
			className={embedded ? "px-0" : "px-6"}
			style={{
				backgroundColor: embedded ? "transparent" : PAPER,
				paddingBottom: embedded ? 0 : insets.bottom,
			}}
		>
			<View
				style={{
					flex: embedded ? undefined : 1,
					justifyContent: embedded ? "flex-start" : "center",
					paddingTop: embedded ? 0 : insets.top + 24,
					paddingBottom: embedded ? 0 : 20,
					gap: embedded ? 16 : 26,
				}}
			>
				{embedded ? null : (
					<View>
						<Animated.View
							style={[
								{ position: "absolute", right: 2, top: -20, zIndex: 1 },
								slamStyle,
							]}
						>
							<Stamp color={TEAL} cat="monument" />
						</Animated.View>
						<Animated.Text
							entering={FadeInDown.duration(450)}
							style={{
								fontFamily: MONO,
								fontSize: 11,
								letterSpacing: 2.4,
								color: "#9a8f7e",
							}}
						>
							PLACE PASSPORT
						</Animated.Text>
						<Animated.Text
							entering={FadeInDown.delay(80).duration(450)}
							style={{
								fontFamily: SERIF,
								fontStyle: "italic",
								fontWeight: "800",
								fontSize: 44,
								color: INK,
								marginTop: 8,
							}}
						>
							Pleises
						</Animated.Text>
						<Animated.Text
							entering={FadeInDown.delay(160).duration(450)}
							style={{
								fontSize: 15,
								lineHeight: 22,
								color: "#6b6357",
								marginTop: 10,
								maxWidth: 260,
							}}
						>
							Walk to places near you, capture them with your camera, and
							collect the stamps.
						</Animated.Text>
					</View>
				)}

				<Animated.View
					entering={embedded ? undefined : FadeInDown.delay(240).duration(450)}
				>
					{showSignIn ? <SignIn /> : <SignUp />}
				</Animated.View>

				<Pressable
					accessibilityRole="button"
					onPress={toggleMode}
					style={{
						alignSelf: "center",
						paddingVertical: 12,
						paddingHorizontal: 16,
					}}
				>
					<Text
						style={{
							fontFamily: MONO,
							fontSize: 12,
							fontWeight: "700",
							letterSpacing: 1.2,
							color: TEAL,
						}}
					>
						{showSignIn
							? "NEW HERE? CREATE ACCOUNT"
							: "HAVE AN ACCOUNT? SIGN IN"}
					</Text>
				</Pressable>
			</View>
		</Container>
	);
}
