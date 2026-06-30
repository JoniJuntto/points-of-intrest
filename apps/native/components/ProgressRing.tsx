import { Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { INK, MONO, RING_CIRC, ringOffset, TEAL } from "@/lib/common-values";

export default function ProgressRing({
	dist,
	inRange,
}: {
	dist: number;
	inRange: boolean;
}) {
	return (
		<View style={{ width: 78, height: 78 }}>
			<Svg width={78} height={78} viewBox="0 0 78 78">
				<Circle
					cx={39}
					cy={39}
					r={34}
					fill="none"
					stroke="#ECE6D8"
					strokeWidth={7}
				/>
				<Circle
					cx={39}
					cy={39}
					r={34}
					fill="none"
					stroke={TEAL}
					strokeWidth={7}
					strokeLinecap="round"
					strokeDasharray={RING_CIRC}
					strokeDashoffset={ringOffset(dist)}
					transform="rotate(-90 39 39)"
				/>
			</Svg>
			<View
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				{inRange ? (
					<Svg width={26} height={26} viewBox="0 0 24 24">
						<Path
							d="M4 12.5 L10 18 L20 6"
							stroke={TEAL}
							strokeWidth={2.6}
							fill="none"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</Svg>
				) : (
					<Text
						style={{
							fontFamily: MONO,
							fontWeight: "700",
							fontSize: 13,
							color: INK,
							textAlign: "center",
						}}
					>
						{dist}
						{"\n"}
						<Text style={{ fontSize: 9, color: "#9a8f7e" }}>m</Text>
					</Text>
				)}
			</View>
		</View>
	);
}
