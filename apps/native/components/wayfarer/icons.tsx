import type * as React from "react";
import Svg, { Circle, Path, Rect } from "react-native-svg";

type ProfileIconProps = {
	size?: number;
	stroke?: string;
	className?: string;
};

export const ProfileIcon: React.FC<ProfileIconProps> = ({
	size = 22,
	stroke = "#fff",
	className,
}) => (
	<Svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		className={className}
		accessible={true}
		accessibilityLabel="Profile Icon"
	>
		<Path
			d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
			stroke={stroke}
			strokeWidth={1.7}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<Path
			d="M18 20v-2a4 4 0 0 0-4-4H10a4 4 0 0 0-4 4v2"
			stroke={stroke}
			strokeWidth={1.7}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</Svg>
);

export function AlbumIcon({ size = 22 }: { size?: number }) {
	return (
		<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
			<Path
				d="M5 4.5h11a2 2 0 0 1 2 2V19a1 1 0 0 1-1.4.92L11 17.4 5.4 19.9A1 1 0 0 1 4 19V5.5a1 1 0 0 1 1-1z"
				stroke="#fff"
				strokeWidth={1.7}
				strokeLinejoin="round"
			/>
			<Path
				d="M8.5 9.5h6M8.5 12.5h4"
				stroke="#fff"
				strokeWidth={1.7}
				strokeLinecap="round"
			/>
		</Svg>
	);
}

export function RecenterIcon() {
	return (
		<Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
			<Circle cx={12} cy={12} r={4} stroke="#14857A" strokeWidth={1.8} />
			<Path
				d="M12 2v3M12 19v3M2 12h3M19 12h3"
				stroke="#14857A"
				strokeWidth={1.8}
				strokeLinecap="round"
			/>
		</Svg>
	);
}

export function LocationPinIcon() {
	return (
		<Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
			<Path
				d="M12 21s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12z"
				stroke="#14857A"
				strokeWidth={1.8}
			/>
			<Circle cx={12} cy={9} r={2.4} fill="#14857A" />
		</Svg>
	);
}

export function CaptureIcon({ stroke = "#fff" }: { stroke?: string }) {
	return (
		<Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
			<Rect
				x={3}
				y={7}
				width={18}
				height={13}
				rx={3}
				stroke={stroke}
				strokeWidth={1.8}
			/>
			<Circle cx={12} cy={13.5} r={3.6} stroke={stroke} strokeWidth={1.8} />
			<Path
				d="M9 7l1.4-2.4h3.2L15 7"
				stroke={stroke}
				strokeWidth={1.8}
				strokeLinejoin="round"
			/>
		</Svg>
	);
}

export function ChevronRightIcon() {
	return (
		<Svg width={9} height={15} viewBox="0 0 8 14">
			<Path
				d="M1 1l6 6-6 6"
				stroke="#9a9286"
				strokeWidth={2.2}
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}

export function WalkIcon() {
	return (
		<Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
			<Circle cx={13} cy={4} r={2} fill="#fff" />
			<Path
				d="M11 9l-3 5 3 1 1 5M11 9l4 2 3-1M11 9l-2 1"
				stroke="#fff"
				strokeWidth={1.8}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}

export function CloseIcon() {
	return (
		<Svg width={18} height={18} viewBox="0 0 24 24">
			<Path
				d="M5 5l14 14M19 5L5 19"
				stroke="#fff"
				strokeWidth={2}
				strokeLinecap="round"
			/>
		</Svg>
	);
}

export function BackIcon() {
	return (
		<Svg width={11} height={18} viewBox="0 0 12 20">
			<Path
				d="M10 2L2 10l8 8"
				stroke="#221B2E"
				strokeWidth={2.4}
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}
