import { env } from "@poigame/env/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import Reticle from "@/components/Reticle";
import { AlbumIcon, CloseIcon } from "@/components/wayfarer/icons";
import { useWayfarer } from "@/contexts/wayfarer-context";
import { ACCENT, MONO, RANGE_M } from "@/lib/common-values";
import {
	devCapturePhotoBase64,
	skipCameraOnSimulator,
} from "@/lib/dev-capture-photo";
import { celebrate, tap } from "@/lib/haptics";
import { firstParam } from "@/lib/wayfarer-utils";

const DEBUG_LOG_URL = `${env.EXPO_PUBLIC_SERVER_URL}/api/debug-log`;
const DEV_CAPTURE_ICON = require("@/assets/images/icon.png");

function agentLog(payload: Record<string, unknown>) {
	fetch(DEBUG_LOG_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			sessionId: "22fb80",
			...payload,
			timestamp: Date.now(),
		}),
	}).catch(() => {});
}

export function CaptureScreen() {
	const router = useRouter();
	const params = useLocalSearchParams<{ placeId?: string | string[] }>();
	const placeId = firstParam(params.placeId);
	const insets = useSafeAreaInsets();
	const cameraRef = useRef<CameraView>(null);
	const [permission, requestPermission] = useCameraPermissions();
	const [flashed, setFlashed] = useState(false);
	const [capturing, setCapturing] = useState(false);
	const [cameraReady, setCameraReady] = useState(false);
	const { userLoc, getPlace, capturePlace, markCaptured } = useWayfarer();
	const place = placeId ? getPlace(placeId) : undefined;

	const unavailable = (message: string) => (
		<View
			style={{
				flex: 1,
				backgroundColor: "#0D0F15",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<Text style={{ color: "#fff" }}>{message}</Text>
		</View>
	);

	if (!place) {
		return unavailable("Place not found");
	}
	if (!userLoc) {
		return unavailable("Finding your location...");
	}
	if (place.dist > RANGE_M) {
		return unavailable("Get within 1 km to capture");
	}

	const closeCapture = () => {
		router.back();
		setFlashed(false);
	};

	const goAlbum = () => {
		tap();
		router.push("/album");
	};

	const shutter = async () => {
		const guardBlocked =
			flashed ||
			capturing ||
			!placeId ||
			!userLoc ||
			place.dist > RANGE_M ||
			(!skipCameraOnSimulator && (!permission?.granted || !cameraReady));
		// #region agent log
		agentLog({
			location: "capture-screen.tsx:shutter:entry",
			message: "shutter pressed",
			data: {
				guardBlocked,
				flashed,
				capturing,
				placeId,
				placeDist: place.dist,
				permissionGranted: permission?.granted,
				cameraReady,
			},
			hypothesisId: "H3",
		});
		// #endregion
		if (guardBlocked) {
			return;
		}
		setCapturing(true);
		let photoBase64 = "";
		try {
			if (skipCameraOnSimulator) {
				photoBase64 = await devCapturePhotoBase64();
				// #region agent log
				agentLog({
					location: "capture-screen.tsx:shutter:photo",
					message: "dev placeholder photo loaded",
					data: {
						hasBase64: !!photoBase64,
						base64Length: photoBase64.length,
						skipCameraOnSimulator: true,
					},
					hypothesisId: "H2,H4",
				});
				// #endregion
			} else {
				const photo = await cameraRef.current?.takePictureAsync({
					base64: true,
					quality: 0.8,
				});
				photoBase64 = photo?.base64 ?? "";
				// #region agent log
				agentLog({
					location: "capture-screen.tsx:shutter:photo",
					message: "takePictureAsync result",
					data: {
						hasPhoto: !!photo,
						hasBase64: !!photoBase64,
						base64Length: photoBase64.length,
						hasUri: !!photo?.uri,
						uriPrefix: photo?.uri?.slice(0, 30) ?? null,
					},
					hypothesisId: "H2,H4",
				});
				// #endregion
			}
		} catch (photoError) {
			// #region agent log
			agentLog({
				location: "capture-screen.tsx:shutter:photo-error",
				message: skipCameraOnSimulator
					? "dev placeholder photo failed"
					: "takePictureAsync threw",
				data: {
					error:
						photoError instanceof Error
							? photoError.message
							: String(photoError),
				},
				hypothesisId: "H2",
			});
			// #endregion
			setCapturing(false);
			return;
		}
		if (!photoBase64) {
			// #region agent log
			agentLog({
				location: "capture-screen.tsx:shutter:no-base64",
				message: "empty base64 after takePictureAsync",
				data: {},
				hypothesisId: "H4",
			});
			// #endregion
			setCapturing(false);
			return;
		}
		setFlashed(true);
		try {
			// #region agent log
			agentLog({
				location: "capture-screen.tsx:shutter:before-api",
				message: "calling capturePlace",
				data: {
					placeId,
					latitude: userLoc.latitude,
					longitude: userLoc.longitude,
					photoBase64Length: photoBase64.length,
				},
				hypothesisId: "H1",
			});
			// #endregion
			const capture = await capturePlace({
				placeId,
				latitude: userLoc.latitude,
				longitude: userLoc.longitude,
				photoBase64,
			});
			// #region agent log
			agentLog({
				location: "capture-screen.tsx:shutter:api-success",
				message: "capturePlace succeeded",
				data: { photoPath: capture.photoPath },
				hypothesisId: "H1,H5",
			});
			// #endregion
			celebrate();
			markCaptured(placeId, capture.photoPath);
			setFlashed(false);
			// #region agent log
			agentLog({
				location: "capture-screen.tsx:shutter:navigate",
				message: "navigating to reveal",
				data: { placeId },
				hypothesisId: "H5",
			});
			// #endregion
			router.replace(`/capture/reveal/${placeId}`);
		} catch (apiError) {
			// #region agent log
			agentLog({
				location: "capture-screen.tsx:shutter:api-error",
				message: "capturePlace failed",
				data: {
					error:
						apiError instanceof Error ? apiError.message : String(apiError),
					errorName:
						apiError instanceof Error ? apiError.name : typeof apiError,
				},
				hypothesisId: "H1",
			});
			// #endregion
			Alert.alert(
				"Capture failed",
				apiError instanceof Error
					? apiError.message
					: "Something went wrong saving your photo. Try again.",
			);
		} finally {
			setFlashed(false);
			setCapturing(false);
		}
	};

	return (
		<View style={{ flex: 1, backgroundColor: "#0D0F15" }}>
			<View
				style={{
					position: "absolute",
					top: insets.top + 8,
					left: 14,
					right: 14,
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					zIndex: 5,
				}}
			>
				<Pressable
					onPress={closeCapture}
					style={{
						width: 44,
						height: 44,
						borderRadius: 22,
						backgroundColor: "rgba(255,255,255,.14)",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<CloseIcon />
				</Pressable>
				<View
					style={{
						paddingVertical: 8,
						paddingHorizontal: 16,
						borderRadius: 14,
						backgroundColor: "rgba(255,255,255,.12)",
					}}
				>
					<Text style={{ fontFamily: MONO, fontSize: 12, color: "#fff" }}>
						{place.name}
					</Text>
				</View>
				<View
					style={{
						width: 44,
						height: 44,
						borderRadius: 22,
						backgroundColor: "rgba(255,255,255,.14)",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
						<Path d="M13 2L4 13h6l-1 9 9-12h-6l1-8z" fill="#F4D06F" />
					</Svg>
				</View>
			</View>

			<View
				style={{
					position: "absolute",
					left: 26,
					right: 26,
					top: insets.top + 80,
					bottom: insets.bottom + 200,
					borderRadius: 26,
					overflow: "hidden",
					backgroundColor: place.color,
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				{skipCameraOnSimulator ? (
					<Image
						source={DEV_CAPTURE_ICON}
						resizeMode="cover"
						style={{
							position: "absolute",
							top: 0,
							right: 0,
							bottom: 0,
							left: 0,
						}}
					/>
				) : permission?.granted ? (
					<CameraView
						ref={cameraRef}
						facing="back"
						mode="picture"
						onCameraReady={() => setCameraReady(true)}
						style={{
							position: "absolute",
							top: 0,
							right: 0,
							bottom: 0,
							left: 0,
						}}
					/>
				) : (
					<View style={{ alignItems: "center", gap: 14, padding: 24 }}>
						<Text style={{ color: "#fff", fontSize: 15 }}>
							{permission ? "Camera access is required" : "Loading camera..."}
						</Text>
						{permission ? (
							<Pressable
								onPress={requestPermission}
								style={{
									borderRadius: 16,
									backgroundColor: "rgba(255,255,255,.16)",
									paddingHorizontal: 18,
									paddingVertical: 12,
								}}
							>
								<Text style={{ color: "#fff", fontWeight: "700" }}>
									Grant access
								</Text>
							</Pressable>
						) : null}
					</View>
				)}
				<View
					style={{
						position: "absolute",
						left: 20,
						top: 20,
						width: 34,
						height: 34,
						borderLeftWidth: 3,
						borderTopWidth: 3,
						borderColor: "#fff",
						borderTopLeftRadius: 8,
					}}
				/>
				<View
					style={{
						position: "absolute",
						right: 20,
						top: 20,
						width: 34,
						height: 34,
						borderRightWidth: 3,
						borderTopWidth: 3,
						borderColor: "#fff",
						borderTopRightRadius: 8,
					}}
				/>
				<View
					style={{
						position: "absolute",
						left: 20,
						bottom: 20,
						width: 34,
						height: 34,
						borderLeftWidth: 3,
						borderBottomWidth: 3,
						borderColor: "#fff",
						borderBottomLeftRadius: 8,
					}}
				/>
				<View
					style={{
						position: "absolute",
						right: 20,
						bottom: 20,
						width: 34,
						height: 34,
						borderRightWidth: 3,
						borderBottomWidth: 3,
						borderColor: "#fff",
						borderBottomRightRadius: 8,
					}}
				/>
				<Reticle />
				<Text
					style={{
						position: "absolute",
						left: 18,
						bottom: 18,
						fontFamily: MONO,
						fontSize: 10,
						letterSpacing: 1,
						color: "rgba(255,255,255,.85)",
					}}
				>
					● REC · {place.coord}
				</Text>
			</View>

			<Text
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					bottom: insets.bottom + 168,
					textAlign: "center",
					fontSize: 13,
					color: "rgba(255,255,255,.78)",
				}}
			>
				{skipCameraOnSimulator
					? "Simulator dev mode — tap to capture with placeholder"
					: "Frame the landmark and tap to capture"}
			</Text>

			<View
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					bottom: insets.bottom + 64,
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "center",
					gap: 48,
				}}
			>
				<View
					style={{
						width: 48,
						height: 48,
						borderRadius: 13,
						backgroundColor: "rgba(255,255,255,.12)",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
						<Path
							d="M4 8h3l1.5-2.2h7L17 8h3v11H4z"
							stroke="#fff"
							strokeWidth={1.6}
							strokeLinejoin="round"
						/>
						<Path d="M9 13.5a3 3 0 0 0 6 0" stroke="#fff" strokeWidth={1.6} />
					</Svg>
				</View>
				<Pressable
					onPress={shutter}
					style={{
						width: 80,
						height: 80,
						borderRadius: 40,
						borderWidth: 5,
						borderColor: "#fff",
						padding: 5,
					}}
				>
					<View
						style={{ flex: 1, borderRadius: 35, backgroundColor: ACCENT }}
					/>
				</Pressable>
				<Pressable
					onPress={goAlbum}
					style={{
						width: 48,
						height: 48,
						borderRadius: 13,
						backgroundColor: "rgba(255,255,255,.12)",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<AlbumIcon />
				</Pressable>
			</View>

			{flashed ? (
				<Animated.View
					entering={FadeIn.duration(80)}
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: "#fff",
						zIndex: 30,
					}}
				/>
			) : null}
		</View>
	);
}
