import { Button } from "heroui-native";
import { useState } from "react";
import { Text, View } from "react-native";
import { Container } from "@/components/container";
import { SignIn } from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";
import { INK, SERIF } from "@/lib/common-values";

export function AuthScreen() {
	const [showSignIn, setShowSignIn] = useState(true);

	return (
		<Container className="px-4">
			<View className="flex-1 justify-center gap-6 py-8">
				<View className="gap-2">
					<Text
						style={{
							fontFamily: SERIF,
							fontSize: 28,
							fontWeight: "700",
							color: INK,
							textAlign: "center",
						}}
					>
						Wayfarer
					</Text>
					<Text className="text-center text-muted text-sm">
						Sign in to explore and capture places near you.
					</Text>
				</View>

				{showSignIn ? <SignIn /> : <SignUp />}

				<Button variant="ghost" onPress={() => setShowSignIn((prev) => !prev)}>
					<Button.Label>
						{showSignIn
							? "Need an account? Sign up"
							: "Already have an account? Sign in"}
					</Button.Label>
				</Button>
			</View>
		</Container>
	);
}
