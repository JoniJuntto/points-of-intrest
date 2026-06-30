import { Ionicons } from "@expo/vector-icons";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import * as Haptics from "expo-haptics";
import { Platform, Pressable, StyleSheet } from "react-native";
import Animated, { FadeOut, ZoomIn } from "react-native-reanimated";
import { withUniwind } from "uniwind";

import { useAppTheme } from "@/contexts/app-theme-context";

const StyledIonicons = withUniwind(Ionicons);

type ThemeToggleProps = {
	glass?: boolean;
};

export function ThemeToggle({ glass = false }: ThemeToggleProps) {
	const { toggleTheme, isLight, isDark } = useAppTheme();

	const onPress = () => {
		if (Platform.OS === "ios") {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
		toggleTheme();
	};

	const icon = isLight ? (
		<Animated.View key="moon" entering={ZoomIn} exiting={FadeOut}>
			<StyledIonicons name="moon" size={20} className="text-foreground" />
		</Animated.View>
	) : (
		<Animated.View key="sun" entering={ZoomIn} exiting={FadeOut}>
			<StyledIonicons name="sunny" size={20} className="text-foreground" />
		</Animated.View>
	);

	const content = (
		<Pressable
			onPress={onPress}
			style={glass ? styles.glassPressable : undefined}
			className={glass ? undefined : "px-2.5"}
		>
			{icon}
		</Pressable>
	);

	if (glass && isLiquidGlassAvailable()) {
		return (
			<GlassView
				isInteractive
				colorScheme={isDark ? "dark" : "light"}
				style={styles.glass}
			>
				{content}
			</GlassView>
		);
	}

	if (glass) {
		return (
			<Pressable onPress={onPress} style={styles.fallback}>
				{icon}
			</Pressable>
		);
	}

	return content;
}

const styles = StyleSheet.create({
	glass: {
		borderRadius: 50,
	},
	glassPressable: {
		padding: 10,
	},
	fallback: {
		padding: 10,
		borderRadius: 50,
		backgroundColor: "rgba(128, 128, 128, 0.25)",
	},
});
