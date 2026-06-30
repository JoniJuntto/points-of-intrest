import type { AppRouter } from "@poigame/api/routers/index";
import { env } from "@poigame/env/native";
import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { inferRouterOutputs } from "@trpc/server";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { Platform } from "react-native";

import { authClient } from "@/lib/auth-client";

type RouterOutputs = inferRouterOutputs<AppRouter>;
export type Place = RouterOutputs["places"]["nearby"][number];
export type PlaceCategory = Place["cat"];

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
		},
	},
});

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${env.EXPO_PUBLIC_SERVER_URL}/trpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          // Better Auth Expo forwards the session cookie manually on native.
          credentials: Platform.OS === "web" ? "include" : "omit",
        });
      },
      headers() {
        if (Platform.OS === "web") {
          return {};
        }
        const headers = new Map<string, string>();
        const cookies = authClient.getCookie();
        if (cookies) {
          headers.set("Cookie", cookies);
        }
        return Object.fromEntries(headers);
      },
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
