import type { ReactNode, Ref } from "react";
import {
	ActivityIndicator,
	Pressable,
	Text,
	TextInput,
	type TextInputProps,
	View,
} from "react-native";

import { INK, MONO, SERIF } from "@/lib/common-values";

export function PaperCard({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<View
			style={{
				backgroundColor: "#fff",
				borderRadius: 22,
				borderWidth: 1.5,
				borderColor: "rgba(34,27,46,.12)",
				padding: 20,
				shadowColor: INK,
				shadowOpacity: 0.08,
				shadowRadius: 24,
				shadowOffset: { width: 0, height: 8 },
				elevation: 4,
			}}
		>
			<Text
				style={{
					fontFamily: SERIF,
					fontStyle: "italic",
					fontWeight: "700",
					fontSize: 18,
					color: INK,
					marginBottom: 16,
				}}
			>
				{title}
			</Text>
			{children}
		</View>
	);
}

export function FieldLabel({ children }: { children: string }) {
	return (
		<Text
			style={{
				fontFamily: MONO,
				fontSize: 10,
				letterSpacing: 1.4,
				color: "#8a8276",
				marginBottom: 7,
			}}
		>
			{children.toUpperCase()}
		</Text>
	);
}

export function PaperInput({
	ref,
	...props
}: TextInputProps & { ref?: Ref<TextInput> }) {
	return (
		<TextInput
			ref={ref}
			placeholderTextColor="#9a8f7e"
			{...props}
			style={{
				height: 50,
				borderRadius: 14,
				paddingHorizontal: 14,
				backgroundColor: "#F6F1E6",
				borderWidth: 1,
				borderColor: "rgba(34,27,46,.08)",
				fontSize: 15,
				color: INK,
			}}
		/>
	);
}

export function PrimaryButton({
	label,
	loading,
	onPress,
}: {
	label: string;
	loading?: boolean;
	onPress: () => void;
}) {
	return (
		<Pressable
			accessibilityRole="button"
			disabled={loading}
			onPress={onPress}
			style={({ pressed }) => ({
				height: 52,
				borderRadius: 15,
				backgroundColor: INK,
				alignItems: "center",
				justifyContent: "center",
				marginTop: 4,
				opacity: loading ? 0.6 : pressed ? 0.85 : 1,
			})}
		>
			{loading ? (
				<ActivityIndicator color="#fff" />
			) : (
				<Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
					{label}
				</Text>
			)}
		</Pressable>
	);
}
