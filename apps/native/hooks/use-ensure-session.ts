import { useCallback, useEffect, useRef, useState } from "react";

import { authClient } from "@/lib/auth-client";

export function useEnsureSession() {
	const { data: session, isPending, refetch } = authClient.useSession();
	const [creating, setCreating] = useState(false);
	const [needsAuth, setNeedsAuth] = useState(false);
	const creatingRef = useRef(false);

	const createAnonymousSession = useCallback(async () => {
		if (creatingRef.current || session) return;

		creatingRef.current = true;
		setCreating(true);
		setNeedsAuth(false);

		await authClient.signIn.anonymous(
			{},
			{
				onSuccess: async () => {
					creatingRef.current = false;
					setCreating(false);
					await refetch();
				},
				onError: () => {
					creatingRef.current = false;
					setCreating(false);
					setNeedsAuth(true);
				},
			},
		);
	}, [refetch, session]);

	useEffect(() => {
		if (session) {
			setNeedsAuth(false);
		}
	}, [session]);

	useEffect(() => {
		if (isPending || session || creating || needsAuth) return;
		void createAnonymousSession();
	}, [createAnonymousSession, creating, needsAuth, isPending, session]);

	return {
		session,
		isReady: !!session && !isPending && !creating,
		isPending: isPending || creating,
		needsAuth,
	};
}
