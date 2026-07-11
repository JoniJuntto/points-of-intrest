import { useForm } from "@tanstack/react-form";
import { useToast } from "heroui-native";
import { useRef } from "react";
import { Text, type TextInput, View } from "react-native";
import z from "zod";

import {
	FieldLabel,
	PaperCard,
	PaperInput,
	PrimaryButton,
} from "@/components/wayfarer/form-ui";
import { authClient } from "@/lib/auth-client";
import { ACCENT } from "@/lib/common-values";
import { queryClient } from "@/utils/trpc";

const signInSchema = z.object({
	email: z
		.string()
		.trim()
		.min(1, "Email is required")
		.email("Enter a valid email address"),
	password: z
		.string()
		.min(1, "Password is required")
		.min(8, "Use at least 8 characters"),
});

function getErrorMessage(error: unknown): string | null {
	if (!error) return null;

	if (typeof error === "string") {
		return error;
	}

	if (Array.isArray(error)) {
		for (const issue of error) {
			const message = getErrorMessage(issue);
			if (message) {
				return message;
			}
		}
		return null;
	}

	if (typeof error === "object" && error !== null) {
		const maybeError = error as { message?: unknown };
		if (typeof maybeError.message === "string") {
			return maybeError.message;
		}
	}

	return null;
}

function SignIn() {
	const passwordInputRef = useRef<TextInput>(null);
	const { toast } = useToast();
	const { data: session } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		validators: {
			onSubmit: signInSchema,
		},
		onSubmit: async ({ value, formApi }) => {
			await authClient.signIn.email(
				{
					email: value.email.trim(),
					password: value.password,
				},
				{
					onError(error) {
						toast.show({
							variant: "danger",
							label: error.error?.message || "Failed to sign in",
						});
					},
					onSuccess() {
						formApi.reset();
						toast.show({
							variant: "success",
							label: session?.user.isAnonymous
								? "Account linked — your captures were saved."
								: "Signed in successfully",
						});
						queryClient.refetchQueries();
					},
				},
			);
		},
	});

	return (
		<PaperCard title="Sign in">
			<form.Subscribe
				selector={(state) => ({
					isSubmitting: state.isSubmitting,
					validationError: getErrorMessage(state.errorMap.onSubmit),
				})}
			>
				{({ isSubmitting, validationError }) => (
					<>
						{validationError ? (
							<Text style={{ color: ACCENT, fontSize: 13, marginBottom: 12 }}>
								{validationError}
							</Text>
						) : null}

						<View style={{ gap: 14 }}>
							<form.Field name="email">
								{(field) => (
									<View>
										<FieldLabel>Email</FieldLabel>
										<PaperInput
											value={field.state.value}
											onBlur={field.handleBlur}
											onChangeText={field.handleChange}
											placeholder="email@example.com"
											keyboardType="email-address"
											autoCapitalize="none"
											autoComplete="email"
											textContentType="emailAddress"
											returnKeyType="next"
											submitBehavior="submit"
											onSubmitEditing={() => {
												passwordInputRef.current?.focus();
											}}
										/>
									</View>
								)}
							</form.Field>

							<form.Field name="password">
								{(field) => (
									<View>
										<FieldLabel>Password</FieldLabel>
										<PaperInput
											ref={passwordInputRef}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChangeText={field.handleChange}
											placeholder="••••••••"
											secureTextEntry
											autoComplete="password"
											textContentType="password"
											returnKeyType="go"
											onSubmitEditing={() => form.handleSubmit()}
										/>
									</View>
								)}
							</form.Field>

							<PrimaryButton
								label="Sign in"
								loading={isSubmitting}
								onPress={() => form.handleSubmit()}
							/>
						</View>
					</>
				)}
			</form.Subscribe>
		</PaperCard>
	);
}

export { SignIn };
