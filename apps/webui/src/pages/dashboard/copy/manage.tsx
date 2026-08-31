import { useCopyTemplate, useCopyTemplates } from "@hooks/useCopyTemplates";
import type { CodeUICopy } from "@kagii/openauth/ui/code";
import { navigate } from "@utils";
import type { PasswordUICopy } from "openauth-webui-shared-types";
import { useEffect, useState } from "react";

// ──────────────────────────────────────────────
// Default values (from @openauthjs/openauth source)
// ──────────────────────────────────────────────

const PROVIDER_DEFAULTS = {
	code: {
		email_placeholder: "Email",
		email_invalid: "Email address is not valid",
		button_continue: "Continue",
		code_info: "We'll send a pin code to your email.",
		code_placeholder: "Code",
		code_invalid: "Invalid code",
		code_sent: "Code sent to ",
		code_resent: "Code resent to ",
		code_didnt_get: "Didn't get code?",
		code_resend: "Resend",
	},
	password: {
		error_email_taken: "There is already an account with this email.",
		error_invalid_code: "Code is incorrect.",
		error_invalid_email: "Email is not valid.",
		error_invalid_password: "Password is incorrect.",
		error_password_mismatch: "Passwords do not match.",
		error_validation_error: "Password does not meet requirements.",
		register_title: "Welcome to the app",
		register_description: "Sign in with your email",
		login_title: "Welcome to the app",
		login_description: "Sign in with your email",
		register: "Register",
		register_prompt: "Don't have an account?",
		login_prompt: "Already have an account?",
		login: "Login",
		change_prompt: "Forgot password?",
		code_resend: "Resend code",
		code_return: "Back to",
		logo: "A",
		input_email: "Email",
		input_password: "Password",
		input_code: "Code",
		input_repeat: "Repeat password",
		button_continue: "Continue",
		shortPasswordMsg: "Password is too short (minimum {min} characters)",
		requireUppercaseMsg: "Password must contain at least one uppercase letter",
		requireNumberMsg: "Password must contain at least one number",
		requireSpecialCharMsg:
			"Password must contain at least one special character",
	},
	qr: {
		title: "Sign in with QR Code",
		description: "Scan this QR Code with your mobile app to sign in.",
	},
	passkey: {
		title: "Sign in with Passkey",
	},
} as {
	code: CodeUICopy;
	password: PasswordUICopy;
	qr: Record<string, string>;
	passkey: Record<string, string>;
};

type ProviderKey = keyof typeof PROVIDER_DEFAULTS;

const PROVIDERS: { key: ProviderKey; label: string }[] = [
	{ key: "code", label: "Code (OTP)" },
	{ key: "password", label: "Password" },
	{ key: "qr", label: "QR Code" },
	{ key: "passkey", label: "Passkey" },
];

type PerProviderCopy = Record<ProviderKey, Record<string, string>>;

const EMPTY_COPY: PerProviderCopy = {
	code: {},
	password: {},
	qr: {},
	passkey: {},
};

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function CopyManagePage() {
	const [urlParams, setUrlParams] = useState<URLSearchParams | null>(null);

	useEffect(() => {
		setUrlParams(new URLSearchParams(window.location.search));
	}, []);

	const editName = urlParams?.get("edit");
	const isEditing = !!editName;

	const {
		template,
		isLoading: isLoadingTemplate,
		updateTemplate,
	} = useCopyTemplate(editName || "");
	const { createTemplate } = useCopyTemplates();

	const [name, setName] = useState("");
	const [activeProvider, setActiveProvider] = useState<ProviderKey>("code");
	const [perProviderCopy, setPerProviderCopy] =
		useState<PerProviderCopy>(EMPTY_COPY);
	const [isSaving, setIsSaving] = useState(false);
	const [notification, setNotification] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	// Load existing template data
	useEffect(() => {
		if (!template) return;
		setName(template.name);
		const loaded: PerProviderCopy = { ...EMPTY_COPY };
		const data = template.copyData as Partial<PerProviderCopy>;
		for (const p of PROVIDERS) {
			if (data[p.key]) {
				loaded[p.key] = { ...(data[p.key] as Record<string, string>) };
			}
		}
		setPerProviderCopy(loaded);
	}, [template]);

	const showNotification = (type: "success" | "error", message: string) => {
		setNotification({ type, message });
		setTimeout(() => setNotification(null), 3000);
	};

	const handleFieldChange = (key: string, value: string) => {
		setPerProviderCopy((prev) => {
			const current = { ...prev[activeProvider] };
			if (value === "") {
				delete current[key];
			} else {
				current[key] = value;
			}
			return { ...prev, [activeProvider]: current };
		});
	};

	const buildCopyData = () => {
		const copyData: Record<string, Record<string, string>> = {};
		for (const p of PROVIDERS) {
			const nonEmpty: Record<string, string> = {};
			for (const [k, v] of Object.entries(perProviderCopy[p.key])) {
				if (v.trim()) nonEmpty[k] = v.trim();
			}
			if (Object.keys(nonEmpty).length > 0) {
				copyData[p.key] = nonEmpty;
			}
		}
		return copyData;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim()) {
			showNotification("error", "Template name is required");
			return;
		}

		setIsSaving(true);
		try {
			const copyData = buildCopyData();
			if (isEditing) {
				await updateTemplate({ copyData });
				showNotification("success", "Copy template updated successfully");
			} else {
				await createTemplate({ name: name.trim(), copyData });
				showNotification("success", "Copy template created successfully");
				setTimeout(() => {
					navigate("/dashboard/copy");
				}, 1000);
			}
		} catch (err) {
			showNotification(
				"error",
				err instanceof Error ? err.message : "Failed to save copy template",
			);
		} finally {
			setIsSaving(false);
		}
	};

	const providerFilledCount = (provider: ProviderKey) =>
		Object.values(perProviderCopy[provider]).filter((v) => v.trim()).length;

	const totalCustomized = PROVIDERS.reduce(
		(sum, p) => sum + providerFilledCount(p.key),
		0,
	);

	const totalFields = PROVIDERS.reduce(
		(sum, p) => sum + Object.keys(PROVIDER_DEFAULTS[p.key]).length,
		0,
	);

	const currentDefaults = PROVIDER_DEFAULTS[activeProvider];

	if (isEditing && isLoadingTemplate) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
			{/* Notification */}
			{notification && (
				<div
					className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${
						notification.type === "success"
							? "bg-green-600 text-white"
							: "bg-red-600 text-white"
					}`}
				>
					{notification.message}
				</div>
			)}

			{/* Header */}
			<div className="flex items-center gap-4 mb-6">
				<a
					href="/dashboard/copy"
					className="p-2 text-gray-400 hover:text-white transition-colors"
				>
					<svg
						className="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<title>Back</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15 19l-7-7 7-7"
						/>
					</svg>
				</a>
				<div>
					<h1 className="text-xl sm:text-2xl font-bold text-white">
						{isEditing ? "Edit Copy Template" : "Create Copy Template"}
					</h1>
					<p className="text-gray-400 text-sm mt-1">
						Customize UI text for all authentication providers under one name
					</p>
				</div>
				{isEditing && editName && (
					<a
						href={`/dashboard/copy/collaborator?template_name=${encodeURIComponent(editName)}`}
						className="ml-auto inline-flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors"
					>
						<svg
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<title>Collaborators</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
						<span className="hidden sm:inline">Collaborators</span>
					</a>
				)}
			</div>

			<form onSubmit={handleSubmit}>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Settings Panel */}
					<div className="lg:col-span-1 space-y-6">
						<div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6">
							<h2 className="text-lg font-semibold text-white mb-4">
								Template Settings
							</h2>

							{/* Name */}
							<div className="mb-4">
								<label
									className="block text-sm font-medium text-gray-300 mb-2"
									htmlFor="template-name"
								>
									Template Name
								</label>
								<input
									type="text"
									id="template-name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									disabled={isEditing}
									placeholder="e.g., fr_FR, es_ES, my-brand"
									className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
								/>
								<p className="text-gray-500 text-xs mt-1">
									One name covers all providers for consistent multilingual
									support.
								</p>
							</div>

							{/* Stats */}
							<div className="pt-4 border-t border-gray-700">
								<div className="flex items-center justify-between text-sm">
									<span className="text-gray-400">Total fields</span>
									<span className="text-white">{totalFields}</span>
								</div>
								<div className="flex items-center justify-between text-sm mt-2">
									<span className="text-gray-400">Customized</span>
									<span className="text-blue-400">{totalCustomized}</span>
								</div>
								<div className="mt-3 space-y-1">
									{PROVIDERS.map((p) => {
										const count = providerFilledCount(p.key);
										return (
											count > 0 && (
												<div
													key={p.key}
													className="flex items-center justify-between text-xs"
												>
													<span className="text-gray-500">{p.label}</span>
													<span className="text-blue-400/80">{count}</span>
												</div>
											)
										);
									})}
								</div>
							</div>
						</div>

						{/* Actions */}
						<div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6">
							<button
								type="submit"
								disabled={isSaving}
								className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
							>
								{isSaving ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
										Saving...
									</>
								) : isEditing ? (
									"Update Template"
								) : (
									"Create Template"
								)}
							</button>
							<a
								href="/dashboard/copy"
								className="block w-full mt-3 px-4 py-2 text-center bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
							>
								Cancel
							</a>
						</div>
					</div>

					{/* Copy Fields */}
					<div className="lg:col-span-2">
						<div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
							{/* Provider Tabs */}
							<div className="flex border-b border-gray-700 overflow-x-auto">
								{PROVIDERS.map((p) => {
									const count = providerFilledCount(p.key);
									return (
										<button
											key={p.key}
											type="button"
											onClick={() => setActiveProvider(p.key)}
											className={`flex-1 min-w-max px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
												activeProvider === p.key
													? "bg-gray-900 text-white border-b-2 border-blue-500"
													: "text-gray-400 hover:text-gray-200"
											}`}
										>
											{p.label}
											{count > 0 && (
												<span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
													{count}
												</span>
											)}
										</button>
									);
								})}
							</div>

							<div className="p-4 sm:p-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-lg font-semibold text-white">
										Copy Fields
									</h2>
									<span className="text-gray-400 text-sm">
										Leave blank to use default
									</span>
								</div>

								<div className="space-y-4">
									{Object.entries(currentDefaults).map(
										([key, defaultValue]) => (
											<CopyFieldInput
												key={`${activeProvider}-${key}`}
												fieldKey={key}
												defaultValue={defaultValue}
												value={perProviderCopy[activeProvider][key] ?? ""}
												onChange={(value) => handleFieldChange(key, value)}
											/>
										),
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</form>
		</div>
	);
}

function CopyFieldInput({
	fieldKey,
	defaultValue,
	value,
	onChange,
}: {
	fieldKey: string;
	defaultValue: string;
	value: string;
	onChange: (value: string) => void;
}) {
	const isCustomized = value !== "";

	const displayKey = fieldKey
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");

	return (
		<div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
			<div className="flex items-center justify-between mb-2">
				<label className="text-sm font-medium text-gray-300" htmlFor={fieldKey}>
					{displayKey}
				</label>
				{isCustomized && (
					<span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">
						Customized
					</span>
				)}
			</div>
			<input
				type="text"
				id={fieldKey}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={defaultValue}
				className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
			/>
			<p className="text-gray-500 text-xs mt-1">
				Default: <span className="text-gray-400">{defaultValue}</span>
			</p>
		</div>
	);
}
