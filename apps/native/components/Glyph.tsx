import Svg, { Circle, Polygon, Rect } from "react-native-svg";
import type { PlaceCategory } from "@/utils/trpc";

export default function Glyph({
	cat,
	size,
	color,
}: {
	cat: PlaceCategory;
	size: number;
	color: string;
}) {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			{cat === "monument" && (
				<>
					<Polygon points="12,3 16,21 8,21" fill={color} />
					<Rect x={7} y={20} width={10} height={2} fill={color} />
				</>
			)}
			{cat === "park" && (
				<>
					<Circle cx={12} cy={9} r={5.4} fill={color} />
					<Rect x={11} y={13} width={2} height={8} fill={color} />
				</>
			)}
			{cat === "culture" && (
				<>
					<Polygon points="12,3 21,8 3,8" fill={color} />
					<Rect x={5} y={9} width={2.4} height={10} fill={color} />
					<Rect x={10.8} y={9} width={2.4} height={10} fill={color} />
					<Rect x={16.6} y={9} width={2.4} height={10} fill={color} />
					<Rect x={4} y={19} width={16} height={2} fill={color} />
				</>
			)}
		</Svg>
	);
}
