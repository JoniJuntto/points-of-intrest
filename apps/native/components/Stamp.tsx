import { Text, View } from "react-native";
import Glyph from "@/components/Glyph";
import { MONO } from "@/lib/common-values";
import type { PlaceCategory } from "@/utils/trpc";

export default function Stamp({
	color,
	cat,
}: {
	color: string;
	cat: PlaceCategory;
}) {
	const w = 76;
	const h = 90;
	const dd = 8;
	const pitch = 12;
	const bg = "#FBF6EC";
	const nx = Math.round(w / pitch);
	const ny = Math.round(h / pitch);
	const dots: React.ReactNode[] = [];
	for (let i = 0; i <= nx; i++) {
		const x = i * (w / nx);
		dots.push(
			<View
				key={`t${i}`}
				style={{
					position: "absolute",
					left: x - dd / 2,
					top: -dd / 2,
					width: dd,
					height: dd,
					borderRadius: dd / 2,
					backgroundColor: bg,
				}}
			/>,
		);
		dots.push(
			<View
				key={`b${i}`}
				style={{
					position: "absolute",
					left: x - dd / 2,
					bottom: -dd / 2,
					width: dd,
					height: dd,
					borderRadius: dd / 2,
					backgroundColor: bg,
				}}
			/>,
		);
	}
	for (let i = 0; i <= ny; i++) {
		const y = i * (h / ny);
		dots.push(
			<View
				key={`l${i}`}
				style={{
					position: "absolute",
					top: y - dd / 2,
					left: -dd / 2,
					width: dd,
					height: dd,
					borderRadius: dd / 2,
					backgroundColor: bg,
				}}
			/>,
		);
		dots.push(
			<View
				key={`r${i}`}
				style={{
					position: "absolute",
					top: y - dd / 2,
					right: -dd / 2,
					width: dd,
					height: dd,
					borderRadius: dd / 2,
					backgroundColor: bg,
				}}
			/>,
		);
	}
	return (
		<View style={{ width: w, height: h }}>
			<View
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: color,
					borderRadius: 2,
					overflow: "hidden",
				}}
			>
				<View
					style={{
						position: "absolute",
						top: 5,
						left: 5,
						right: 5,
						bottom: 5,
						borderWidth: 1.5,
						borderColor: "rgba(255,255,255,.5)",
						borderRadius: 1,
					}}
				/>
				<View
					style={{
						position: "absolute",
						top: 15,
						left: 0,
						right: 0,
						alignItems: "center",
					}}
				>
					<Glyph cat={cat} size={28} color="#fff" />
				</View>
				<Text
					style={{
						position: "absolute",
						bottom: 9,
						left: 0,
						right: 0,
						textAlign: "center",
						fontFamily: MONO,
						fontSize: 8,
						letterSpacing: 1,
						color: "rgba(255,255,255,.92)",
					}}
				>
					DISCOVERED
				</Text>
				<Text
					style={{
						position: "absolute",
						top: 4,
						right: 7,
						fontFamily: MONO,
						fontSize: 11,
						fontWeight: "700",
						color: "rgba(255,255,255,.92)",
					}}
				>
					★
				</Text>
			</View>
			{dots}
		</View>
	);
}
