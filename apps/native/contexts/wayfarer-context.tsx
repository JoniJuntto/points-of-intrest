import { useMutation, useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import {
	createContext,
	type ReactNode,
	type RefObject,
	use,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import type { LatLng, MapRef } from "@/lib/common-types";
import { nearestUncaptured } from "@/lib/common-values";
import { today } from "@/lib/wayfarer-utils";
import { type Place, queryClient, trpc } from "@/utils/trpc";

const POI_REFETCH_DISTANCE_M = 100;
const DEFAULT_PLACE_NAME = "Nearby";

type WayfarerContextValue = {
	userLoc: LatLng | null;
	displayPlaceName: string;
	locationDenied: boolean;
	places: Place[];
	albumPlaces: Place[];
	total: number;
	capturedCount: number;
	progress: number;
	nearestPlace: Place | null;
	mapRef: RefObject<MapRef | null>;
	recenter: () => void;
	getPlace: (id: string) => Place | undefined;
	markCaptured: (placeId: string, photoPath?: string | null) => void;
	capturePlace: (input: {
		placeId: string;
		latitude: number;
		longitude: number;
		photoBase64: string;
	}) => Promise<{ ok: boolean; photoPath: string | null }>;
};

const WayfarerContext = createContext<WayfarerContextValue | null>(null);

export function WayfarerProvider({ children }: { children: ReactNode }) {
	const [localPlaces, setLocalPlaces] = useState<Place[]>([]);
	const mapRef = useRef<MapRef | null>(null);
	const [userLoc, setUserLoc] = useState<LatLng | null>(null);
	const [poiFetchLoc, setPoiFetchLoc] = useState<LatLng | null>(null);
	const [displayPlaceName, setDisplayPlaceName] = useState(DEFAULT_PLACE_NAME);
	const [locationDenied, setLocationDenied] = useState(false);

	const nearbyPlaces = useQuery({
		...trpc.places.nearby.queryOptions(
			poiFetchLoc ?? { latitude: 0, longitude: 0 },
		),
		enabled: !!poiFetchLoc,
	});
	const collectedPlaces = useQuery(trpc.places.collected.queryOptions());
	const capturePlace = useMutation(
		trpc.places.capture.mutationOptions({
			onSuccess: () => {
				void queryClient.invalidateQueries();
			},
		}),
	);

	const places = localPlaces;
	const albumPlaces = collectedPlaces.data?.length
		? collectedPlaces.data
		: places.filter((p) => p.captured);

	const total = places.length;
	const capturedCount = places.filter((p) => p.captured).length;
	const progress = total ? Math.round((capturedCount / total) * 100) : 0;
	const nearestPlace = nearestUncaptured(places);

	useEffect(() => {
		let mounted = true;
		let subscription: Location.LocationSubscription | null = null;
		const setPosition = (pos: Location.LocationObject) => {
			if (!mounted) return;
			const nextLoc = {
				latitude: pos.coords.latitude,
				longitude: pos.coords.longitude,
			};
			setUserLoc(nextLoc);
			setPoiFetchLoc((prev) =>
				!prev || distanceMeters(prev, nextLoc) >= POI_REFETCH_DISTANCE_M
					? nextLoc
					: prev,
			);
		};
		const startLocation = async () => {
			try {
				const { status } = await Location.requestForegroundPermissionsAsync();
				if (status !== "granted") {
					if (mounted) setLocationDenied(true);
					return;
				}
				if (mounted) setLocationDenied(false);
				const pos = await Location.getCurrentPositionAsync({
					accuracy: Location.Accuracy.Balanced,
				});
				setPosition(pos);
				subscription = await Location.watchPositionAsync(
					{
						accuracy: Location.Accuracy.Balanced,
						distanceInterval: 5,
						timeInterval: 3000,
					},
					setPosition,
					() => {
						if (mounted) setLocationDenied(true);
					},
				);
			} catch {
				if (mounted) setLocationDenied(true);
			}
		};
		startLocation();
		return () => {
			mounted = false;
			subscription?.remove();
		};
	}, []);

	useEffect(() => {
		if (!nearbyPlaces.data) return;
		setLocalPlaces(updatePlaceDistances(nearbyPlaces.data, userLoc));
	}, [nearbyPlaces.data]);

	useEffect(() => {
		if (!userLoc) return;
		setLocalPlaces((ps) => updatePlaceDistances(ps, userLoc));
	}, [userLoc]);

	useEffect(() => {
		if (!poiFetchLoc) return;
		let cancelled = false;
		const updatePlaceName = async () => {
			try {
				const [address] = await Location.reverseGeocodeAsync(poiFetchLoc);
				const name = address ? displayNameFromAddress(address) : null;
				if (!cancelled && name) setDisplayPlaceName(name);
			} catch {
				// Keep the previous/default label when the platform geocoder fails.
			}
		};
		void updatePlaceName();
		return () => {
			cancelled = true;
		};
	}, [poiFetchLoc]);

	const recenter = () => {
		if (!userLoc) return;
		mapRef.current?.setCameraPosition({
			coordinates: userLoc,
			zoom: 15,
		});
	};

	const getPlace = (id: string) => places.find((p) => p.id === id);

	const markCaptured = (placeId: string, photoPath?: string | null) => {
		setLocalPlaces((ps) =>
			ps.map((p) =>
				p.id === placeId
					? {
							...p,
							captured: true,
							dist: 0,
							date: today(),
							photoPath: photoPath ?? null,
						}
					: p,
			),
		);
	};

	const value = useMemo<WayfarerContextValue>(
		() => ({
			userLoc,
			displayPlaceName,
			locationDenied,
			places,
			albumPlaces,
			total,
			capturedCount,
			progress,
			nearestPlace,
			mapRef,
			recenter,
			getPlace,
			markCaptured,
			capturePlace: capturePlace.mutateAsync,
		}),
		[
			userLoc,
			displayPlaceName,
			locationDenied,
			places,
			albumPlaces,
			total,
			capturedCount,
			progress,
			nearestPlace,
			capturePlace.mutateAsync,
		],
	);

	return <WayfarerContext value={value}>{children}</WayfarerContext>;
}

export function useWayfarer() {
	const ctx = use(WayfarerContext);
	if (!ctx) {
		throw new Error("useWayfarer must be used within WayfarerProvider");
	}
	return ctx;
}

function updatePlaceDistances(places: Place[], userLoc: LatLng | null) {
	if (!userLoc) return places;
	return places.map((place) => ({
		...place,
		dist: Math.round(
			distanceMeters(userLoc, {
				latitude: place.lat,
				longitude: place.lng,
			}),
		),
	}));
}

function distanceMeters(a: LatLng, b: LatLng) {
	const r = 6_371_000;
	const toRad = (value: number) => (value * Math.PI) / 180;
	const dLat = toRad(b.latitude - a.latitude);
	const dLng = toRad(b.longitude - a.longitude);
	const lat1 = toRad(a.latitude);
	const lat2 = toRad(b.latitude);
	const h =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
	return 2 * r * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function displayNameFromAddress(address: Location.LocationGeocodedAddress) {
	return (
		address.district?.trim() ||
		address.name?.trim() ||
		address.city?.trim() ||
		address.subregion?.trim() ||
		address.region?.trim() ||
		address.country?.trim() ||
		null
	);
}
