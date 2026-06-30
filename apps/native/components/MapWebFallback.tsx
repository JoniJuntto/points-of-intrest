import Svg, { G, Path, Rect } from "react-native-svg";

export default function MapBackground() {
	return (
		<Svg
			viewBox="0 0 402 874"
			preserveAspectRatio="xMidYMid slice"
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				width: "100%",
				height: "100%",
			}}
		>
			<Rect x={0} y={0} width={402} height={874} fill="#E9E5DB" />
			<Rect x={30} y={150} width={150} height={150} rx={16} fill="#CCD9AE" />
			<Rect x={232} y={78} width={138} height={118} rx={16} fill="#CCD9AE" />
			<Rect
				x={46}
				y={166}
				width={118}
				height={118}
				rx={12}
				fill="none"
				stroke="#bcca9c"
				strokeWidth={2}
			/>
			<Path
				d="M392,120 C320,250 312,430 256,540 C206,640 120,756 36,884"
				fill="none"
				stroke="#A9D2CC"
				strokeWidth={50}
				strokeLinecap="round"
			/>
			<Path
				d="M362,772 m -150,0 a 150,116 0 1,0 300,0 a 150,116 0 1,0 -300,0"
				fill="#A9D2CC"
			/>
			<Path
				d="M392,120 C320,250 312,430 256,540 C206,640 120,756 36,884"
				fill="none"
				stroke="#B7DAD4"
				strokeWidth={22}
				strokeLinecap="round"
			/>
			<G stroke="#D7D2C6" strokeWidth={13} strokeLinecap="round" fill="none">
				<Path d="M0,212 H402" />
				<Path d="M0,382 H402" />
				<Path d="M0,560 H402" />
				<Path d="M110,0 V874" />
				<Path d="M210,0 V874" />
				<Path d="M300,0 V874" />
				<Path d="M28,874 L402,352" />
			</G>
			<G stroke="#FCFBF7" strokeWidth={8} strokeLinecap="round" fill="none">
				<Path d="M0,212 H402" />
				<Path d="M0,382 H402" />
				<Path d="M0,560 H402" />
				<Path d="M110,0 V874" />
				<Path d="M210,0 V874" />
				<Path d="M300,0 V874" />
				<Path d="M28,874 L402,352" />
			</G>
			<G
				stroke="#FCFBF7"
				strokeWidth={4}
				strokeLinecap="round"
				fill="none"
				opacity={0.95}
			>
				<Path d="M0,120 H402" />
				<Path d="M0,470 H402" />
				<Path d="M0,668 H402" />
				<Path d="M60,0 V874" />
				<Path d="M160,0 V874" />
				<Path d="M352,0 V874" />
			</G>
			<G fill="#DCD6C9">
				<Rect x={18} y={320} width={34} height={40} rx={3} />
				<Rect x={60} y={320} width={40} height={40} rx={3} />
				<Rect x={18} y={394} width={38} height={60} rx={3} />
				<Rect x={66} y={394} width={34} height={60} rx={3} />
				<Rect x={124} y={232} width={34} height={36} rx={3} />
				<Rect x={170} y={226} width={30} height={42} rx={3} />
				<Rect x={124} y={320} width={36} height={50} rx={3} />
				<Rect x={172} y={320} width={28} height={50} rx={3} />
				<Rect x={124} y={396} width={34} height={58} rx={3} />
				<Rect x={170} y={396} width={30} height={58} rx={3} />
				<Rect x={224} y={232} width={64} height={40} rx={3} />
				<Rect x={312} y={226} width={44} height={46} rx={3} />
				<Rect x={224} y={396} width={34} height={56} rx={3} />
				<Rect x={266} y={396} width={30} height={56} rx={3} />
				<Rect x={312} y={396} width={46} height={56} rx={3} />
				<Rect x={18} y={486} width={38} height={60} rx={3} />
				<Rect x={66} y={486} width={34} height={60} rx={3} />
				<Rect x={124} y={486} width={36} height={60} rx={3} />
				<Rect x={172} y={486} width={28} height={60} rx={3} />
			</G>
			<G fill="#CFDCD6">
				<Rect x={124} y={320} width={36} height={50} rx={3} />
				<Rect x={224} y={232} width={64} height={40} rx={3} />
			</G>
			<G fill="#D8CEDA">
				<Rect x={312} y={226} width={44} height={46} rx={3} />
			</G>
		</Svg>
	);
}
