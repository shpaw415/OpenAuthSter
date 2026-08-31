import { AppSnackbar } from "@components/AppSnackbar";
import { ProviderIcon } from "@components/provider-icons";
import { Toggle, ToggleBase } from "@components/toggle";
import { useEmailTemplates } from "@hooks/useEmailTemplates";
import { useParams } from "@hooks/useParams";
import { useProject } from "@hooks/useProjects";
import { Icon } from "@iconify/react";
import formParser from "@shpaw415/formdata-parser";
import { navigate } from "@utils";
import type {
	AppleOAuthProviderConfig,
	AppleOIDCProviderConfig,
	CodeProviderConfig,
	CognitoProviderConfig,
	GenericOAuthProviderConfig,
	KeycloakProviderConfig,
	MicrosoftProviderConfig,
	OAuth2ProviderConfig,
	OIDCProviderConfig,
	PasswordProviderConfig,
	ProviderConfig,
	ProviderMeta,
	ProviderType,
	QRProviderConfig,
	SlackProviderConfig,
} from "openauth-webui-shared-types";
import { getProviderMeta } from "openauth-webui-shared-types";
import React, {
	type ComponentType,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	getDefaultProviderScopes,
	getProviderScopeOptions,
	normalizeProviderScopes,
	type ScopeOption,
	uniqueScopeValues,
} from "./providerScopes";

type ProviderDocProps = {
	redirectURI: string;
	RedirectURI: ComponentType<{ value: string }>;
};

// MDX documentation imports
const providerDocs: Record<
	ProviderType | "default",
	() => Promise<{ default: ComponentType<ProviderDocProps> }>
> = {
	google: () => import("@docs/providers/google.mdx"),
	github: () => import("@docs/providers/github.mdx"),
	discord: () => import("@docs/providers/discord.mdx"),
	microsoft: () => import("@docs/providers/microsoft.mdx"),
	keycloak: () => import("@docs/providers/keycloak.mdx"),
	oidc: () => import("@docs/providers/oidc.mdx"),
	oauth: () => import("@docs/providers/oauth.mdx"),
	code: () => import("@docs/providers/code.mdx"),
	password: () => import("@docs/providers/password.mdx"),
	slack: () => import("@docs/providers/slack.mdx"),
	cognito: () => import("@docs/providers/cognito.mdx"),
	apple: () => import("@docs/providers/apple.mdx"),
	appleoidc: () => import("@docs/providers/appleoidc.mdx"),
	appleoauth: () => import("@docs/providers/appleoauth.mdx"),
	facebook: () => import("@docs/providers/facebook.mdx"),
	spotify: () => import("@docs/providers/spotify.mdx"),
	twitch: () => import("@docs/providers/twitch.mdx"),
	x: () => import("@docs/providers/x.mdx"),
	yahoo: () => import("@docs/providers/yahoo.mdx"),
	jumpcloud: () => import("@docs/providers/jumpcloud.mdx"),
	qr: () => import("@docs/providers/QRCode.mdx"),
	passkey: () => import("@docs/providers/passkey.mdx"),
	default: () => import("@docs/providers/default.mdx"),
};

type ProviderFormState<T extends ProviderConfig> = {
	clientID: string;
	provider_type: ProviderType;
	showSecret: boolean;
	setShowSecret: React.Dispatch<React.SetStateAction<boolean>>;
	meta: ProviderMeta | undefined;
	data: Partial<T["data"]> | null;
};

const providerFormStateContext =
	createContext<ProviderFormState<ProviderConfig> | null>(null);

function useProviderFormState<T extends ProviderConfig>() {
	return useContext(providerFormStateContext) as ProviderFormState<T>;
}

export default function ProviderForm() {
	const { project_id, provider_type } = useParams<{
		project_id: string;
		provider_type: ProviderType;
	}>();

	if (typeof window !== "undefined" && (!project_id || !provider_type)) {
		throw new Error("Missing project_id or provider_type in URL parameters");
	}

	const projectHook = useProject(
		typeof window === "undefined"
			? undefined
			: new URLSearchParams(window.location.search).get("project_id") || "",
	);

	const meta = useMemo(
		() => provider_type && getProviderMeta(provider_type),
		[provider_type],
	);

	const [config, setConfig] = useState<
		ProviderConfig | Partial<ProviderConfig>
	>({});
	const [showSecret, setShowSecret] = useState(false);
	const [DocComponent, setDocComponent] =
		useState<ComponentType<ProviderDocProps> | null>(null);
	const redirectURI = useMemo(
		() =>
			buildProviderRedirectURI(
				projectHook.project?.authEndpointURL,
				provider_type,
			),
		[projectHook.project?.authEndpointURL, provider_type],
	);

	const formRef = useRef<HTMLFormElement | null>(null);
	const [notification, setNotification] = useState<{
		message: string;
		type?: "success" | "error";
	} | null>(null);
	const RedirectURIComponent = useMemo(
		() =>
			function RedirectURIComponent({ value }: { value: string }) {
				return (
					<CopyableInlineCode
						value={value}
						onCopy={() =>
							setNotification({
								message: "Callback URL copied to clipboard",
								type: "success",
							})
						}
						onError={(message) =>
							setNotification({
								message,
								type: "error",
							})
						}
					/>
				);
			},
		[],
	);

	const [isSaving, setIsSaving] = useState<boolean>(false);

	const onSave = (updatedConfig: ProviderConfig) => {
		setIsSaving(true);
		console.log("Saving provider config:", updatedConfig);
		projectHook
			.updateProvider(updatedConfig)
			.then(() =>
				setNotification({
					message: "Provider saved successfully",
					type: "success",
				}),
			)
			.catch((err) =>
				setNotification({
					message:
						"" +
						(err instanceof Error ? err.message : "Failed to save provider"),
					type: "error",
				}),
			)
			.finally(() => setIsSaving(false));
	};

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const res = parseFormToProviderConfig({
			formData: new FormData(formRef.current as HTMLFormElement),
			providerType: provider_type as ProviderConfig["type"],
			providerEnabled: config.enabled ?? false,
		});
		console.log(res);

		onSave(res);
	};

	useEffect(() => {
		if (!projectHook.project) return;

		const providerType = provider_type as Exclude<ProviderType, "apple">;

		let initialConfig: Partial<ProviderConfig> | null = {
			enabled: false,
			type: providerType,
			data: {} as never,
		};

		if (providerType) {
			initialConfig = {
				type: providerType,
				enabled: true,
				data: projectHook.project?.providers_data?.find(
					(p) => p.type === providerType,
				)?.data as ProviderConfig["data"],
			} as ProviderConfig;
		}

		if (initialConfig) {
			setConfig(initialConfig);
		} else {
			// Invalid state, navigate back to providers list
			navigate(`/project?project_id=${projectHook.project?.clientID}`);
		}
	}, [projectHook.project, provider_type]);

	// Load MDX documentation based on provider type
	useEffect(() => {
		const loadDocs = async () => {
			const loader = providerDocs[provider_type] ?? providerDocs.default;
			console.log({ loader, provider_type });
			try {
				const module = await loader();
				setDocComponent(() => module?.default || null);
			} catch {
				const defaultModule = await providerDocs.default();
				setDocComponent(() => defaultModule?.default || null);
			}
		};
		loadDocs();
	}, [provider_type]);

	const formState: ProviderFormState<ProviderConfig> = {
		clientID: project_id as string,
		provider_type: config?.type as ProviderType,
		showSecret,
		setShowSecret,
		meta,
		data: config?.data || null,
	};

	if (!config?.type) {
		return (
			<div className="min-h-screen bg-gray-900 flex items-center justify-center">
				<p className="text-white">Loading project...</p>
			</div>
		);
	}

	return (
		<>
			<AppSnackbar
				notification={notification}
				onClose={() => setNotification(null)}
			/>
			<div className="min-h-screen bg-gray-900">
				{/* Header */}
				<div className="bg-gray-800 border-b border-gray-700">
					<div className="px-6 py-6">
						<div className="flex items-center space-x-4">
							<a
								href={
									"/dashboard/project?project_id=" +
									projectHook.project?.clientID
								}
								className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
							>
								←
							</a>
							<ProviderIcon
								type={provider_type as ProviderType}
								className="w-10 h-10 text-gray-300"
							/>
							<div>
								<h1 className="text-2xl font-bold text-white">{meta?.name}</h1>
								<p className="text-gray-400">{meta?.description}</p>
							</div>
						</div>
					</div>
				</div>

				<div className="flex flex-col lg:flex-row min-h-[calc(100vh-120px)]">
					{/* Configuration Panel */}
					<div className="lg:w-1/2 bg-gray-900 border-r border-gray-700">
						<div className="p-6">
							<h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
								<span className="w-2 h-2 bg-blue-500 rounded-full"></span>
								Configuration
							</h2>

							<div className="space-y-5 mb-8">
								{/* Enable Toggle */}
								<div className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-xl">
									<div>
										<span className="text-white font-medium block">
											Enable this provider
										</span>
										<span className="text-gray-500 text-sm">
											Allow users to authenticate with this provider
										</span>
									</div>
									<Toggle
										enabled={config?.enabled ?? false}
										onChange={(enabled) =>
											setConfig((prev) => ({
												...(prev || {}),
												enabled,
											}))
										}
									/>
								</div>

								<div className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-5">
									<providerFormStateContext.Provider value={formState}>
										<form ref={formRef} onSubmit={onSubmit}>
											<FormFields type={config?.type} />
										</form>
									</providerFormStateContext.Provider>
								</div>
							</div>

							<div className="flex gap-3">
								<a
									href={
										"/dashboard/project?project_id=" +
										projectHook.project?.clientID
									}
									className="flex-1 px-5 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-medium rounded-xl transition-colors text-center"
								>
									Cancel
								</a>
								<button
									type="button"
									onClick={() => formRef.current?.requestSubmit()}
									disabled={isSaving}
									className="flex-1 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Save Provider
								</button>
							</div>
						</div>
					</div>

					{/* Documentation Panel */}
					<div className="lg:w-1/2 bg-gray-850 bg-gray-800/50">
						<div className="p-6">
							<h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
								<span className="w-2 h-2 bg-green-500 rounded-full"></span>
								Documentation
							</h2>

							<DocComponentWrapper>
								{DocComponent ? (
									<DocComponent
										redirectURI={redirectURI}
										RedirectURI={RedirectURIComponent}
									/>
								) : (
									<div className="flex items-center gap-2 text-gray-400">
										<span className="animate-spin">⏳</span>
										Loading documentation...
									</div>
								)}
							</DocComponentWrapper>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

function parseFormToProviderConfig({
	formData,
	providerType,
	providerEnabled,
}: {
	formData: FormData;
	providerType: ProviderConfig["type"];
	providerEnabled: boolean;
}): ProviderConfig {
	return {
		data: formParser(formData),
		type: providerType,
		enabled: providerEnabled,
	} as ProviderConfig;
}

function buildProviderRedirectURI(
	authEndpointURL?: string,
	providerType?: ProviderType,
) {
	const providerPath = providerType || "provider";

	if (!authEndpointURL) {
		return `https://your-auth-endpoint.com/${providerPath}/callback`;
	}

	const baseURL = /^(https?:)?\/\//.test(authEndpointURL)
		? authEndpointURL
		: `https://${authEndpointURL}`;

	return `${baseURL.replace(/\/+$/, "")}/${providerPath}/callback`;
}

function CopyableInlineCode({
	value,
	onCopy,
	onError,
}: {
	value: string;
	onCopy?: (value: string) => void;
	onError?: (message: string) => void;
}) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;

		const timeout = globalThis.setTimeout(() => setCopied(false), 1600);
		return () => globalThis.clearTimeout(timeout);
	}, [copied]);

	const handleCopy = useCallback(async () => {
		try {
			if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
				throw new Error("Clipboard access is not available in this browser");
			}

			await navigator.clipboard.writeText(value);
			setCopied(true);
			onCopy?.(value);
		} catch (error) {
			onError?.(
				error instanceof Error ? error.message : "Failed to copy callback URL",
			);
		}
	}, [onCopy, onError, value]);

	return (
		<span className="not-prose inline-flex max-w-full items-center gap-2 align-middle rounded-lg border border-gray-700 bg-gray-900/90 px-2 py-1">
			<code className="max-w-full overflow-x-auto whitespace-nowrap rounded-md bg-transparent px-0 py-0 font-mono text-xs text-emerald-300">
				{value}
			</code>
			<button
				type="button"
				onClick={handleCopy}
				className="inline-flex shrink-0 items-center gap-1 rounded-md border border-gray-600 bg-gray-800 px-2 py-1 text-xs font-medium text-gray-200 transition-colors hover:border-gray-500 hover:text-white"
				aria-label="Copy callback URL"
			>
				<Icon
					icon={copied ? "lucide:check" : "lucide:clipboard-copy"}
					className="h-3.5 w-3.5"
				/>
				<span>{copied ? "Copied" : "Copy"}</span>
			</button>
		</span>
	);
}

function DocComponentWrapper({ children }: { children: React.ReactNode }) {
	return (
		<div
			className="prose prose-invert prose-sm max-w-none 
              prose-headings:text-blue-400 prose-headings:font-semibold
              prose-h1:text-xl prose-h1:mb-4 prose-h1:mt-0
              prose-h2:text-lg prose-h2:mb-3 prose-h2:mt-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-700
              prose-h3:text-base prose-h3:mb-2 prose-h3:mt-4
              prose-p:text-gray-300 prose-p:leading-relaxed
              prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white prose-strong:font-semibold
              prose-code:text-emerald-400 prose-code:bg-gray-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-xl
              prose-table:border-collapse prose-table:w-full
              prose-th:bg-gray-900 prose-th:text-gray-200 prose-th:font-medium prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:border prose-th:border-gray-700
              prose-td:text-gray-300 prose-td:px-4 prose-td:py-2 prose-td:border prose-td:border-gray-700
              prose-li:text-gray-300 prose-li:marker:text-gray-500
              prose-ul:my-2 prose-ol:my-2
              prose-hr:border-gray-700"
		>
			{children}
		</div>
	);
}

const RequiredContext = createContext<boolean>(false);

function InputField(
	props: React.InputHTMLAttributes<HTMLInputElement> & { name: string },
) {
	return (
		<input
			required={useContext(RequiredContext)}
			{...props}
			className={`w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
				props.className || ""
			}`}
		/>
	);
}

function KeyValueEditor({
	keyPlaceholder = "Key",
	valuePlaceholder = "Value",
	value,
	name,
}: {
	keyPlaceholder?: string;
	valuePlaceholder?: string;
	name: string;
	value?: Record<string, string>;
}) {
	const [new_value, setNewValue] = useState<
		Array<{ key: string; val: string; hash: string }>
	>(
		Object.entries(value || {}).map(([key, val]) => ({
			key,
			val,
			hash: crypto.randomUUID(),
		})),
	);
	const keyList = useMemo(() => new_value.map((item) => item.key), [new_value]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const checkedKeys: string[] = [];
		keyList.forEach((k, _i) => {
			if (k !== "") {
				checkedKeys.push(k);
			}
		});
		const hasDuplicates = checkedKeys.some(
			(k, i) => checkedKeys.indexOf(k) !== i && k !== "",
		);
		if (hasDuplicates) {
			setError("Duplicate keys are not allowed");
		} else setError(null);
	}, [keyList]);

	const handleChange = useCallback((type: "key" | "value", index: number) => {
		return (e: React.ChangeEvent<HTMLInputElement>) => {
			const content = e.target.value || "";
			if (type === "key") {
				setNewValue((current) =>
					current.map((item, i) =>
						i === index ? { ...item, key: content } : item,
					),
				);
			} else if (type === "value") {
				setNewValue((current) =>
					current.map((item, i) =>
						i === index ? { ...item, val: content } : item,
					),
				);
			}
		};
	}, []);

	const handleAdd = useCallback(() => {
		setNewValue((current) => [
			...current,
			{ key: "", val: "", hash: crypto.randomUUID() },
		]);
	}, []);

	const handleRemove = useCallback((index: number) => {
		setNewValue((current) => current.filter((_, i) => i !== index));
	}, []);

	return (
		<div className="space-y-2">
			{new_value.map(({ key, val, hash }, index) => (
				<div key={hash} className="flex items-center gap-2">
					<input
						name={`list::key::${name}::${index}`}
						type="text"
						defaultValue={key}
						placeholder={keyPlaceholder}
						onChange={handleChange("key", index)}
						className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
					/>
					<span className="text-gray-500">=</span>
					<input
						type="text"
						name={`list::value::${name}::${index}`}
						defaultValue={val}
						placeholder={valuePlaceholder}
						onChange={handleChange("value", index)}
						className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
					/>
					<button
						type="button"
						onClick={() => handleRemove(index)}
						className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded-lg transition-colors"
						title="Remove parameter"
					>
						<Icon icon="lucide:x" className="w-4 h-4" />
					</button>
				</div>
			))}
			<button
				type="button"
				onClick={handleAdd}
				className="flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-lg transition-colors"
			>
				<span>+</span> Add parameter
			</button>
			{new_value.length === 0 && (
				<p className="text-gray-500 text-sm">
					No additional query parameters configured
				</p>
			)}
			{error && <p className="text-red-400 text-sm mt-1">{error}</p>}
		</div>
	);
}

function InputFieldForm({
	required,
	label,
	children,
	help,
	action,
}: {
	children: React.ReactNode;
	required?: boolean;
	label: string;
	help?: string;
	action?: React.ReactNode;
}) {
	return (
		<div>
			<label
				className="block text-sm font-medium text-gray-300 mb-2"
				htmlFor=""
			>
				{label} {required && <span className="text-red-400">*</span>}
			</label>
			<RequiredContext.Provider value={Boolean(required)}>
				{children}
			</RequiredContext.Provider>
			<div className="flex-row flex justify-between">
				{help && <p className="text-gray-500 text-sm mt-1">{help}</p>}
				{action && <div>{action}</div>}
			</div>
		</div>
	);
}

function FormFields({ type }: { type: ProviderType }) {
	switch (type) {
		case "code":
			return <CodeFields />;
		case "password":
			return <PasswordFields />;
		case "oidc":
			return <OIDCFields />;
		case "oauth":
			return <GenericOAuthFields />;
		case "keycloak":
			return <KeycloakFields />;
		case "slack":
			return <SlackFields />;
		case "cognito":
			return <CognitoFields />;
		case "microsoft":
			return <MicrosoftFields />;
		case "appleoauth":
			return <AppleOAuthFields />;
		case "appleoidc":
			return <AppleOIDCFields />;
		case "qr":
			return <QrCodeFields />;
		case "passkey":
			return <PasskeyFields />;
		case "spotify":
			return <OAuth2Fields query pkce />;
		case "github":
			return <OAuth2Fields query pkce />;
		case "x":
			return <OAuth2Fields query pkce />;
		default:
			return <OAuth2Fields query pkce />;
	}
}

function OAuth2DefaultFields({
	clientId,
	clientSecret,
}: {
	clientId?: string;
	clientSecret?: string;
}) {
	const [showSecret, setShowSecret] = useState(false);

	return (
		<>
			<InputFieldForm label="Client ID" required>
				<InputField
					type="text"
					name="clientID"
					defaultValue={clientId || ""}
					placeholder="Your OAuth client ID"
				/>
			</InputFieldForm>
			<InputFieldForm label="Client Secret" required>
				<div className="relative">
					<InputField
						type={showSecret ? "text" : "password"}
						name="clientSecret"
						defaultValue={clientSecret || ""}
						placeholder="Your OAuth client secret"
					/>
					<button
						type="button"
						onClick={() => setShowSecret((c) => !c)}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
					>
						{showSecret ? (
							<Icon icon="lucide:eye-off" className="w-4 h-4" />
						) : (
							<Icon icon="lucide:eye" className="w-4 h-4" />
						)}
					</button>
				</div>
			</InputFieldForm>
		</>
	);
}
function PkceField({ enabled }: { enabled?: boolean }) {
	return (
		<InputFieldForm label="Enable PKCE">
			<ToggleBase defaultChecked={enabled || false} name="boolean::pkce" />
		</InputFieldForm>
	);
}

function QueryParametersField({ value }: { value?: Record<string, string> }) {
	return (
		<InputFieldForm label="Additional Query Parameters">
			<KeyValueEditor
				name="query"
				keyPlaceholder="Parameter name"
				valuePlaceholder="Parameter value"
				value={value}
			/>
		</InputFieldForm>
	);
}

function ScopeOptionCard({
	option,
	selected,
	onToggle,
}: {
	option: ScopeOption;
	selected: boolean;
	onToggle: (scope: string) => void;
}) {
	const locked = option.mandatory && selected;

	return (
		<button
			type="button"
			disabled={locked}
			onClick={() => onToggle(option.value)}
			aria-pressed={selected}
			className={`rounded-xl border p-3 text-left transition-colors ${
				selected
					? "border-blue-500 bg-blue-500/10"
					: "border-gray-700 bg-gray-900/40 hover:border-gray-600 hover:bg-gray-700/40"
			}`}
		>
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="text-sm font-medium text-white">
						{option.label || option.value}
					</p>
					<p className="mt-1 text-xs leading-5 text-gray-400">
						{option.description}
					</p>
				</div>
				<div className="flex items-center gap-2">
					{option.mandatory ? (
						<span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-300">
							Required
						</span>
					) : null}
					{option.recommended ? (
						<span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
							Recommended
						</span>
					) : null}
					<span
						className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
							selected
								? "border-blue-400 bg-blue-500 text-white"
								: "border-gray-500 text-gray-400"
						}`}
					>
						{selected ? (
							locked ? (
								<Icon icon="lucide:lock" className="h-3 w-3" />
							) : (
								<Icon icon="lucide:check" className="h-3 w-3" />
							)
						) : (
							<Icon icon="lucide:plus" className="h-3 w-3" />
						)}
					</span>
				</div>
			</div>
		</button>
	);
}

function ScopesField({ value }: { value?: string[] }) {
	const { provider_type } = useProviderFormState<ProviderConfig>();
	const options = useMemo(
		() => getProviderScopeOptions(provider_type),
		[provider_type],
	);
	const mandatoryScopeValues = useMemo(
		() =>
			new Set(
				options
					.filter((option) => option.mandatory)
					.map((option) => option.value),
			),
		[options],
	);
	const initialScopes = useMemo(() => {
		const configuredScopes = uniqueScopeValues(value || []);
		if (configuredScopes.length > 0) {
			return normalizeProviderScopes(provider_type, configuredScopes);
		}

		return normalizeProviderScopes(
			provider_type,
			getDefaultProviderScopes(provider_type),
		);
	}, [provider_type, value]);
	const [selectedScopes, setSelectedScopes] = useState<string[]>(initialScopes);
	const [customScope, setCustomScope] = useState("");

	useEffect(() => {
		setSelectedScopes(initialScopes);
	}, [initialScopes]);

	const optionValues = useMemo(
		() => new Set(options.map((option) => option.value)),
		[options],
	);
	const customScopes = useMemo(
		() => selectedScopes.filter((scope) => !optionValues.has(scope)),
		[selectedScopes, optionValues],
	);

	const toggleScope = useCallback(
		(scope: string) => {
			setSelectedScopes((current) => {
				if (current.includes(scope)) {
					if (mandatoryScopeValues.has(scope)) return current;

					return normalizeProviderScopes(
						provider_type,
						current.filter((item) => item !== scope),
					);
				}

				return normalizeProviderScopes(provider_type, [...current, scope]);
			});
		},
		[mandatoryScopeValues, provider_type],
	);

	const removeScope = useCallback(
		(scope: string) => {
			setSelectedScopes((current) => {
				if (mandatoryScopeValues.has(scope)) return current;

				return normalizeProviderScopes(
					provider_type,
					current.filter((item) => item !== scope),
				);
			});
		},
		[mandatoryScopeValues, provider_type],
	);

	const addCustomScope = useCallback(() => {
		const normalized = customScope.trim();
		if (!normalized) return;

		setSelectedScopes((current) =>
			normalizeProviderScopes(provider_type, [...current, normalized]),
		);
		setCustomScope("");
	}, [customScope, provider_type]);

	const handleCustomScopeKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key !== "Enter") return;

			e.preventDefault();
			addCustomScope();
		},
		[addCustomScope],
	);

	return (
		<InputFieldForm
			label="Scopes"
			required
			help="Select the provider scopes to request. Required scopes stay enabled automatically, existing custom scopes are preserved, and you can add extra values when your provider exposes more options."
		>
			<div className="space-y-4">
				<input
					readOnly
					required
					value={selectedScopes.join(",")}
					tabIndex={-1}
					aria-hidden="true"
					className="sr-only absolute h-0 w-0 opacity-0 pointer-events-none"
				/>

				{selectedScopes.length > 0 ? (
					<div className="flex flex-wrap gap-2">
						{selectedScopes.map((scope) =>
							mandatoryScopeValues.has(scope) ? (
								<span
									key={scope}
									className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200"
								>
									<span>{scope}</span>
									<span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
										Required
									</span>
								</span>
							) : (
								<button
									key={scope}
									type="button"
									onClick={() => removeScope(scope)}
									className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200 hover:border-blue-400"
								>
									<span>{scope}</span>
									<span className="text-blue-300">×</span>
								</button>
							),
						)}
					</div>
				) : (
					<p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
						Select at least one scope.
					</p>
				)}

				{options.length > 0 ? (
					<div className="grid gap-2 sm:grid-cols-2">
						{options.map((option) => (
							<ScopeOptionCard
								key={option.value}
								option={option}
								selected={selectedScopes.includes(option.value)}
								onToggle={toggleScope}
							/>
						))}
					</div>
				) : (
					<p className="text-sm text-gray-400">
						No predefined scopes are registered for this provider. Add them
						manually below.
					</p>
				)}

				<div className="rounded-xl border border-gray-700 bg-gray-900/40 p-4">
					<p className="mb-2 block text-sm font-medium text-gray-300">
						Add custom scope
					</p>
					<div className="flex gap-2">
						<input
							type="text"
							value={customScope}
							onChange={(e) => setCustomScope(e.target.value)}
							onKeyDown={handleCustomScopeKeyDown}
							placeholder="Enter an additional scope value"
							className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<button
							type="button"
							onClick={addCustomScope}
							className="shrink-0 rounded-lg bg-gray-700 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-600"
						>
							Add
						</button>
					</div>
					<p className="mt-2 text-xs text-gray-500">
						Use this when your provider supports additional scopes beyond the
						curated list.
					</p>
					{customScopes.length > 0 ? (
						<p className="mt-2 text-xs text-gray-400">
							Custom scopes: {customScopes.join(", ")}
						</p>
					) : null}
				</div>

				{selectedScopes.map((scope) => (
					<input key={scope} type="hidden" name="array::scopes" value={scope} />
				))}
			</div>
		</InputFieldForm>
	);
}

function SelectField(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
	return (
		<select
			{...props}
			className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
		>
			{props.children}
		</select>
	);
}

function TemplateSelection(
	props: React.SelectHTMLAttributes<HTMLSelectElement> & {
		defaultValue: number | undefined;
		label: string;
		help?: string;
		name: string;
	},
) {
	const templates = useEmailTemplates();
	const [currentSelect, setCurrentSelect] = useState<number | undefined>(
		props.defaultValue,
	);
	const params = useParams<{ project_id: string }>();
	const onChange = useCallback<React.ChangeEventHandler<HTMLSelectElement>>(
		(e) => {
			setCurrentSelect(Number(e.target.value));
		},
		[],
	);

	const opt = useMemo(() => {
		const { defaultValue, label, help, name, onChange, ...rest } = props;
		return rest;
	}, [props]);

	if (templates.isLoading) {
		return (
			<div className="flex items-center gap-2 text-gray-400">
				<Icon icon="lucide:loader" className="w-4 h-4 animate-spin" />
				Loading templates...
			</div>
		);
	}
	return (
		<InputFieldForm
			label={props.label}
			help={props.help}
			required
			action={
				currentSelect ? (
					<a
						href={`/dashboard/templates/manage?project_id=${params.project_id}&edit=${templates.templates.find((t) => t.id === currentSelect)?.name}`}
						className="text-sm text-blue-400 hover:text-blue-300"
					>
						Manage templates
					</a>
				) : null
			}
		>
			<SelectField
				{...opt}
				required
				name={`number::${props.name}`}
				defaultValue={props.defaultValue}
				onChange={onChange}
			>
				<option value="">Chose a template</option>
				{templates.templates.map((template) => (
					<option key={template.id} value={template.id}>
						{template.name}
					</option>
				))}
			</SelectField>
		</InputFieldForm>
	);
}

// Provider setups /////////////////////////////////////////

function QrCodeFields() {
	const data = useProviderFormState<QRProviderConfig>();
	return (
		<InputFieldForm
			label="Require MFA"
			help="If the user has MFA set up, the MFA token will be required"
			required
		>
			<ToggleBase
				defaultChecked={data.data?.requireMFA || false}
				name="boolean::requireMFA"
			/>
		</InputFieldForm>
	);
}

function OAuth2Fields({ query, pkce }: { query?: boolean; pkce?: boolean }) {
	const data = useProviderFormState<OAuth2ProviderConfig>();
	return (
		<>
			<OAuth2DefaultFields
				clientId={data.data?.clientID}
				clientSecret={data.data?.clientSecret}
			/>
			<ScopesField value={data.data?.scopes} />
			{pkce && <PkceField enabled={data.data?.pkce} />}
			{query && <QueryParametersField value={data.data?.query} />}
		</>
	);
}

function OIDCFields() {
	const data = useProviderFormState<OIDCProviderConfig>();

	return (
		<>
			<InputFieldForm label="Client ID" required>
				<InputField
					type="text"
					name="clientID"
					defaultValue={data.data?.clientID || ""}
					placeholder="Your OIDC client ID"
				/>
			</InputFieldForm>
			<InputFieldForm label="Issuer URL" required>
				<InputField
					type="url"
					name="issuer"
					defaultValue={data.data?.issuer || ""}
					placeholder="https://auth.example.com"
				/>
			</InputFieldForm>
			<ScopesField value={data.data?.scopes} />
			<QueryParametersField value={data.data?.query} />
		</>
	);
}

function GenericOAuthFields() {
	const data = useProviderFormState<GenericOAuthProviderConfig>();

	return (
		<>
			<OAuth2DefaultFields
				clientId={data.data?.clientID}
				clientSecret={data.data?.clientSecret}
			/>
			<InputFieldForm label="Authorization Endpoint" required>
				<InputField
					type="url"
					name="endpoint.authorization"
					defaultValue={data.data?.endpoint?.authorization || ""}
					placeholder="https://auth.example.com/authorize"
				/>
			</InputFieldForm>
			<InputFieldForm label="Token Endpoint" required>
				<InputField
					type="url"
					name="endpoint.token"
					defaultValue={data.data?.endpoint?.token || ""}
					placeholder="https://auth.example.com/token"
				/>
			</InputFieldForm>
			<ScopesField value={data.data?.scopes} />
			<QueryParametersField value={data.data?.query} />
			<span className="block my-4 border-t border-gray-600" />
			<h2 className="text-white">
				User Info Getter <span className="text-red-500">*</span>
			</h2>
			<p className="text-gray-500 text-sm mb-3">
				Configuration for fetching user information from the provider
			</p>
			<InputFieldForm label="Endpoint" required>
				<InputField
					type="text"
					name="userInfoGetter.url"
					defaultValue={data.data?.userInfoGetter?.url || ""}
					placeholder="https://auth.example.com/userinfo"
				/>
			</InputFieldForm>
			<InputFieldForm label="User info getter method" required>
				<SelectField
					name="userInfoGetter.method"
					defaultValue={data.data?.userInfoGetter?.method || "GET"}
				>
					<option value="GET">GET</option>
					<option value="POST">POST</option>
				</SelectField>
			</InputFieldForm>
			<InputFieldForm label="Dot notation path to user ID" required>
				<InputField
					type="text"
					name="userInfoGetter.idPath"
					defaultValue={data.data?.userInfoGetter?.idPath || ""}
					placeholder="user.id"
				/>
			</InputFieldForm>
			<InputFieldForm label="Request headers">
				<KeyValueEditor
					name="userInfoGetter.headers"
					keyPlaceholder="Header name"
					valuePlaceholder="Header value"
					value={data.data?.userInfoGetter?.headers}
				/>
			</InputFieldForm>
		</>
	);
}

function KeycloakFields() {
	const data = useProviderFormState<KeycloakProviderConfig>();
	return (
		<>
			<OAuth2DefaultFields
				clientId={data.data?.clientID}
				clientSecret={data.data?.clientSecret}
			/>

			<InputFieldForm label="Realm" required>
				<InputField
					type="text"
					name="realm"
					defaultValue={data.data?.realm || ""}
					placeholder="master"
				/>
			</InputFieldForm>

			<InputFieldForm label="Base URL" required>
				<InputField
					type="url"
					defaultValue={data.data?.baseUrl || ""}
					name="baseUrl"
					placeholder="https://keycloak.example.com"
				/>
			</InputFieldForm>

			<ScopesField value={data.data?.scopes} />
		</>
	);
}

function CodeFields() {
	const data = useProviderFormState<CodeProviderConfig>();
	return (
		<>
			<InputFieldForm label="Code Length">
				<InputField
					type="number"
					name="number::length"
					min="4"
					max="8"
					defaultValue={data.data?.length || 4}
				/>
				<p className="text-gray-500 text-sm mt-1">
					Number of digits in the verification code (4-8)
				</p>
			</InputFieldForm>
			<InputFieldForm label="Confirmation type">
				<SelectField
					name="codeMode"
					defaultValue={data.data?.codeMode || "email"}
				>
					<option value="email">email</option>
					<option value="phone">phone</option>
				</SelectField>
			</InputFieldForm>
			<TemplateSelection
				label="Email Template for Login Code Sending"
				help="the template used while sending a OTP code for login"
				defaultValue={data.data?.registerTemplateId ?? undefined}
				name="registerTemplateId"
			/>
		</>
	);
}

function PasswordFields() {
	const data = useProviderFormState<PasswordProviderConfig>();
	return (
		<>
			<InputFieldForm label="Password Policy: Minimum Length" required>
				<InputField
					type="number"
					min="6"
					max="32"
					name="number::minLength"
					defaultValue={data.data?.minLength || 8}
					placeholder="Minimum password length"
				/>
			</InputFieldForm>
			<InputFieldForm
				label="Password Policy: Require Uppercase Letter"
				required
			>
				<ToggleBase
					name="boolean::requireUppercase"
					defaultChecked={data.data?.requireUppercase}
				/>
			</InputFieldForm>
			<InputFieldForm label="Password Policy: Require Number" required>
				<ToggleBase
					name="boolean::requireNumber"
					defaultChecked={data.data?.requireNumber}
				/>
			</InputFieldForm>
			<InputFieldForm
				label="Password Policy: Require Special Character"
				required
			>
				<ToggleBase
					name="boolean::requireSpecialChar"
					defaultChecked={data.data?.requireSpecialChar}
				/>
			</InputFieldForm>
			<TemplateSelection
				label="Email Template for Registration Code Sending"
				help="the template used while sending a OTP code for registration"
				name="registerTemplateId"
				defaultValue={data.data?.registerTemplateId || undefined}
			/>
			<TemplateSelection
				label="Email Template for Password Code Sending"
				help="the template used while sending a OTP code for password reset"
				name="resetPasswordTemplateId"
				defaultValue={data.data?.resetPasswordTemplateId || undefined}
			/>
		</>
	);
}

function SlackFields() {
	const data = useProviderFormState<SlackProviderConfig>();

	return (
		<>
			<InputFieldForm label="Client ID" required>
				<InputField
					type="text"
					name="clientID"
					defaultValue={data.data?.clientID || ""}
					placeholder="Your Slack client ID"
				/>
			</InputFieldForm>
			<InputFieldForm label="Client Secret" required>
				<div className="relative">
					<InputField
						type={data.showSecret ? "text" : "password"}
						name="clientSecret"
						defaultValue={data.data?.clientSecret || ""}
						placeholder="Your Slack client secret"
						className="pr-12"
					/>
					<button
						type="button"
						onClick={() => data.setShowSecret((c) => !c)}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
					>
						{data.showSecret ? (
							<Icon icon="lucide:eye-off" className="w-4 h-4" />
						) : (
							<Icon icon="lucide:eye" className="w-4 h-4" />
						)}
					</button>
				</div>
			</InputFieldForm>
			<InputFieldForm label="team" required>
				<InputField
					type="text"
					name="team"
					defaultValue={data.data?.team || ""}
					placeholder="Your Slack workspace team ID"
				/>
			</InputFieldForm>
			<ScopesField value={data.data?.scopes} />
			<InputFieldForm label="PKCE">
				<ToggleBase name="boolean::pkce" defaultChecked={data.data?.pkce} />
			</InputFieldForm>
		</>
	);
}

function CognitoFields() {
	const data = useProviderFormState<CognitoProviderConfig>();

	return (
		<>
			<OAuth2DefaultFields
				clientId={data.data?.clientID}
				clientSecret={data.data?.clientSecret}
			/>
			<InputFieldForm label="Region" required>
				<InputField
					type="text"
					name="region"
					defaultValue={data.data?.region || ""}
					placeholder="Your AWS region"
				/>
			</InputFieldForm>
			<InputFieldForm label="Domain" required>
				<InputField
					type="text"
					name="domain"
					defaultValue={data.data?.domain || ""}
					placeholder="Your AWS Cognito domain"
				/>
			</InputFieldForm>
			<ScopesField value={data.data?.scopes} />
			<PkceField enabled={data.data?.pkce} />
			<QueryParametersField value={data.data?.query} />
		</>
	);
}

function MicrosoftFields() {
	const data = useProviderFormState<MicrosoftProviderConfig>();

	return (
		<>
			<OAuth2DefaultFields
				clientId={data.data?.clientID}
				clientSecret={data.data?.clientSecret}
			/>
			<ScopesField value={data.data?.scopes} />
			<InputFieldForm label="Tenant ID" required>
				<InputField
					type="text"
					name="tenant"
					defaultValue={data.data?.tenant || ""}
					placeholder="Your Microsoft Tenant ID"
				/>
			</InputFieldForm>
			<PkceField enabled={data.data?.pkce} />
			<QueryParametersField value={data.data?.query} />
		</>
	);
}

function AppleOAuthFields() {
	const data = useProviderFormState<AppleOAuthProviderConfig>();

	return (
		<>
			<OAuth2DefaultFields
				clientId={data.data?.clientID}
				clientSecret={data.data?.clientSecret}
			/>
			<ScopesField value={data.data?.scopes} />
			<InputFieldForm label="Response Mode">
				<SelectField
					name="responseMode"
					defaultValue={data.data?.responseMode || "form_post"}
				>
					<option value="form_post">form_post</option>
					<option value="query">query</option>
				</SelectField>
			</InputFieldForm>
			<PkceField enabled={data.data?.pkce} />
			<QueryParametersField value={data.data?.query} />
		</>
	);
}

function AppleOIDCFields() {
	const data = useProviderFormState<AppleOIDCProviderConfig>();

	return (
		<>
			<InputFieldForm label="Client ID" required>
				<InputField
					type="text"
					name="clientID"
					defaultValue={data.data?.clientID || ""}
					placeholder="Your Apple OIDC client ID"
				/>
			</InputFieldForm>
			<ScopesField value={data.data?.scopes} />
			<QueryParametersField value={data.data?.query} />
		</>
	);
}

function PasskeyFields() {
	return (
		<p className="text-sm text-white mb-4">
			There is no specific configuration required for Passkeys.
		</p>
	);
}
