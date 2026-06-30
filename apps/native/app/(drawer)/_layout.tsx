import { Ionicons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import { Spinner, useThemeColor } from "heroui-native";
import { useCallback } from "react";
import { Text, View } from "react-native";

import { ThemeToggle } from "@/components/theme-toggle";
import { AuthScreen } from "@/components/wayfarer/auth-screen";
import { WayfarerProvider } from "@/contexts/wayfarer-context";
import { authClient } from "@/lib/auth-client";

function DrawerLayout() {
	const themeColorForeground = useThemeColor("foreground");
	const themeColorBackground = useThemeColor("background");
	const { data: session, isPending } = authClient.useSession();

	const renderThemeToggle = useCallback(() => <ThemeToggle />, []);

	if (isPending) {
		return (
			<View
				style={{
					flex: 1,
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: themeColorBackground,
				}}
			>
				<Spinner size="lg" />
			</View>
		);
	}

	if (!session) {
		return <AuthScreen />;
	}

	return (
		<WayfarerProvider>
			<Drawer
				screenOptions={{
					headerTintColor: themeColorForeground,
					headerStyle: { backgroundColor: themeColorBackground },
					headerTitleStyle: {
						fontWeight: "600",
						color: themeColorForeground,
					},
					headerRight: renderThemeToggle,
					drawerStyle: { backgroundColor: themeColorBackground },
				}}
			>
				<Drawer.Screen
					name="index"
					options={{
						headerShown: false,
						drawerLabel: ({ color, focused }) => (
							<Text style={{ color: focused ? color : themeColorForeground }}>
								Home
							</Text>
						),
						drawerIcon: ({ size, color, focused }) => (
							<Ionicons
								name="home-outline"
								size={size}
								color={focused ? color : themeColorForeground}
							/>
						),
					}}
				/>
				<Drawer.Screen
					name="album"
					options={{ drawerItemStyle: { display: "none" }, headerShown: false }}
				/>
				<Drawer.Screen
					name="capture"
					options={{ drawerItemStyle: { display: "none" }, headerShown: false }}
				/>
			</Drawer>
		</WayfarerProvider>
	);
}

export default DrawerLayout;
