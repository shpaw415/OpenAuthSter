import AndroidGuide from "@docs/sdks/android.mdx";
import CliGuide from "@docs/sdks/cli.mdx";
import IosGuide from "@docs/sdks/ios.mdx";
import { Icon } from "@iconify/react";

const prose =
	"prose prose-invert prose-sm max-w-none prose-headings:text-blue-400 prose-headings:font-semibold prose-h1:text-xl prose-h1:mb-4 prose-h1:mt-0 prose-h2:text-lg prose-h2:mb-3 prose-h2:mt-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-700 prose-h3:text-base prose-h3:mb-2 prose-h3:mt-4 prose-p:text-gray-300 prose-p:leading-relaxed prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-strong:font-semibold prose-code:text-emerald-400 prose-code:bg-gray-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-xl prose-table:border-collapse prose-table:w-full prose-th:bg-gray-900 prose-th:text-gray-200 prose-th:font-medium prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:border prose-th:border-gray-700 prose-td:text-gray-300 prose-td:px-4 prose-td:py-2 prose-td:border prose-td:border-gray-700 prose-li:text-gray-300 prose-li:marker:text-gray-500 prose-ul:my-2 prose-ol:my-2 prose-hr:border-gray-700";

const sdks: {
	name: string;
	icon: string;
	detail: string;
	href?: string;
}[] = [
	{
		name: "CLI",
		icon: "lucide:terminal",
		detail: "Loopback PKCE, access token, and refresh token",
		href: "#cli",
	},
	{
		name: "Browser",
		icon: "lucide:globe",
		detail: "openauthster-shared/client/user",
	},
	{
		name: "iOS",
		icon: "lucide:smartphone",
		detail: "sdk/ios public PKCE client",
		href: "#ios",
	},
	{
		name: "Android",
		icon: "lucide:smartphone",
		detail: "sdk/android public PKCE client",
		href: "#android",
	},
];

export default function SdksPage() {
	return (
		<div className="min-h-screen bg-gray-900">
			<div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-white">SDKs</h1>
					<p className="mt-2 text-gray-400">
						Public clients share one authorization-code flow: PKCE, an access
						token, and a refresh token. CLI uses a loopback callback. iOS and
						Android use a custom-scheme redirect.
					</p>
				</div>

				<div className="mb-8 grid gap-3 sm:grid-cols-2">
					{sdks.map((sdk) => {
						const className =
							"rounded-lg border border-gray-700 bg-gray-800 p-4";
						const body = (
							<div className="flex items-center gap-3">
								<Icon icon={sdk.icon} className="h-5 w-5 text-blue-300" />
								<div>
									<p className="font-medium text-white">{sdk.name}</p>
									<p className="text-sm text-gray-400">{sdk.detail}</p>
								</div>
							</div>
						);
						if (sdk.href) {
							return (
								<a
									key={sdk.name}
									href={sdk.href}
									className={`${className} hover:border-blue-500`}
								>
									{body}
								</a>
							);
						}
						return (
							<div key={sdk.name} className={className}>
								{body}
							</div>
						);
					})}
				</div>

				<div className="space-y-6">
					<div
						id="cli"
						className="scroll-mt-8 rounded-lg border border-gray-700 bg-gray-800 p-6"
					>
						<div className={prose}>
							<CliGuide />
						</div>
					</div>
					<div
						id="ios"
						className="scroll-mt-8 rounded-lg border border-gray-700 bg-gray-800 p-6"
					>
						<div className={prose}>
							<IosGuide />
						</div>
					</div>
					<div
						id="android"
						className="scroll-mt-8 rounded-lg border border-gray-700 bg-gray-800 p-6"
					>
						<div className={prose}>
							<AndroidGuide />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
