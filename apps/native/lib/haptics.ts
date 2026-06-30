import * as Haptics from "expo-haptics";

export const tap = () =>
	Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
export const bump = () =>
	Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
export const celebrate = () =>
	Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
		() => {},
	);
