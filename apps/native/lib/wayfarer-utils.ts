export const firstParam = (value: string | string[] | undefined) =>
	Array.isArray(value) ? value[0] : value;

export const today = () => new Date().toISOString().slice(0, 10);
