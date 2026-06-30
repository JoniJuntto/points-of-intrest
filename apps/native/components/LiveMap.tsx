import { AppleMaps, GoogleMaps } from "expo-maps";
import { useEffect } from "react";
import { Platform } from "react-native";
import type { LatLng, MapRef } from "@/lib/common-types";
import type { Place, PlaceCategory } from "@/utils/trpc";
import MapBackground from "./MapWebFallback";

export default function LiveMap({
	places,
	onMarkerTap,
	mapRef,
	userLoc,
}: {
	places: Place[];
	onMarkerTap: (id: string) => void;
	mapRef: React.RefObject<MapRef | null>;
	userLoc: LatLng;
}) {
	const cameraPosition = { coordinates: userLoc, zoom: 15 };

	const SF: Record<PlaceCategory, string> = {
		monument: "building.columns",
		park: "tree",
		culture: "books.vertical",
	};

	useEffect(() => {
		mapRef.current?.setCameraPosition({ coordinates: userLoc, zoom: 15 });
	}, [userLoc, mapRef]);

	if (Platform.OS === "ios") {
		return (
			<AppleMaps.View
				ref={mapRef as React.Ref<AppleMaps.MapView>}
				style={{ flex: 1 }}
				cameraPosition={cameraPosition}
				properties={{ isMyLocationEnabled: true, selectionEnabled: true }}
				uiSettings={{ myLocationButtonEnabled: false, compassEnabled: true }}
				markers={places.map((p) => ({
					id: p.id,
					coordinates: { latitude: p.lat, longitude: p.lng },
					title: p.name,
					tintColor: p.color,
					systemImage: p.captured ? "checkmark.seal.fill" : SF[p.cat],
				}))}
				onMarkerClick={(m) => m.id && onMarkerTap(m.id)}
			/>
		);
	}
	if (Platform.OS === "android") {
		return (
			<GoogleMaps.View
				ref={mapRef as React.Ref<GoogleMaps.MapView>}
				style={{ flex: 1 }}
				cameraPosition={cameraPosition}
				properties={{ isMyLocationEnabled: true }}
				uiSettings={{ myLocationButtonEnabled: false }}
				markers={places.map((p) => ({
					id: p.id,
					coordinates: { latitude: p.lat, longitude: p.lng },
					title: p.name,
					snippet: p.captured ? "Captured" : p.catLabel,
				}))}
				onMarkerClick={(m) => m.id && onMarkerTap(m.id)}
			/>
		);
	}
	return <MapBackground />;
}
