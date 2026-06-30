export type LatLng = {
	latitude: number;
	longitude: number;
};

export type MapRef = {
	setCameraPosition: (options: {
		coordinates: LatLng;
		zoom?: number;
	}) => void;
};
