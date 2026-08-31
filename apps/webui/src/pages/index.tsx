import { Icon } from "@components/icon";
import { useAuth } from "@hooks/useAuth";
import Logo from "@static/logo.webp";

const features = [
	{
		icon: "lucide:layers",
		title: "Multi-Tenant",
		description:
			"Manage multiple projects and isolated user pools from a single admin dashboard.",
	},
	{
		icon: "lucide:shield-check",
		title: "Secure by Default",
		description:
			"HMAC-signed requests, two-tier sessions, TOTP and WebAuthn MFA built in.",
	},
	{
		icon: "lucide:zap",
		title: "Cloudflare-Native",
		description:
			"Runs on Cloudflare Workers + D1. Zero cold starts, globally distributed.",
	},
	{
		icon: "lucide:plug",
		title: "Extensible Providers",
		description:
			"Social, enterprise, custom QR and WebAuthn flows — all configurable per project.",
	},
];

const techStack = [
	{ icon: "simple-icons:cloudflare", label: "Workers" },
	{ icon: "simple-icons:hono", label: "Hono" },
	{ icon: "simple-icons:react", label: "React" },
	{ icon: "simple-icons:tailwindcss", label: "Tailwind" },
	{ icon: "simple-icons:drizzle", label: "Drizzle" },
];

export default function LandingPage() {
	const auth = useAuth();

	return (
		<div className="min-h-screen bg-[#09090b] text-zinc-300 font-sans selection:bg-sky-400 selection:text-black flex flex-col relative overflow-hidden">
			{/* Grid Background */}
			<div
				className="absolute inset-0 z-0 opacity-20 pointer-events-none"
				style={{
					backgroundImage:
						"linear-gradient(#27272a 1px, transparent 1px), linear-gradient(90deg, #27272a 1px, transparent 1px)",
					backgroundSize: "40px 40px",
				}}
			/>

			{/* Header */}
			<header className="relative z-10 w-full border-b flex-none border-zinc-800 bg-[#09090b]/80 backdrop-blur-md px-6 py-4">
				<div className="max-w-6xl mx-auto flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-9 h-9 bg-zinc-900 flex items-center justify-center -rotate-3 border border-sky-400 shadow-[2px_2px_0px_0px_rgba(56,189,248,0.2)]">
							<img
								src={Logo.src()}
								alt="Logo"
								className="w-6 h-6 object-contain"
							/>
						</div>
						<span className="font-mono font-bold text-lg tracking-tighter text-white uppercase">
							openauthster_
						</span>
					</div>

					{auth.isLoaded && (
						<div>
							{auth.isAuthenticated ? (
								<a
									href="/dashboard"
									className="group inline-flex items-center gap-2 px-5 py-2 text-sm bg-zinc-900 text-white border border-zinc-700 hover:border-sky-400 hover:text-sky-300 transition-colors font-mono uppercase tracking-wider"
								>
									<Icon icon="lucide:cpu" className="w-4 h-4" />[ Initialize ]
								</a>
							) : (
								<button
									type="button"
									onClick={() => auth.login()}
									className="inline-flex items-center gap-2 px-5 py-2 text-sm bg-sky-400 text-black hover:bg-sky-300 transition-colors font-mono font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]"
								>
									<Icon icon="lucide:key" className="w-4 h-4" />
									Access
								</button>
							)}
						</div>
					)}
				</div>
			</header>

			{/* Hero */}
			<section className="relative z-10 flex flex-col items-start justify-center px-6 pt-32 pb-24 gap-8 max-w-6xl mx-auto w-full flex-grow">
				<div className="inline-flex items-center gap-3 px-4 py-2 bg-zinc-900 border-l-4 border-sky-400 text-zinc-400 text-xs font-mono font-bold uppercase tracking-widest shadow-sm">
					<Icon icon="lucide:server" className="w-4 h-4 text-sky-400" />
					Self-Hosted Identity Matrix
				</div>

				<h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter max-w-4xl leading-[0.9] text-white uppercase">
					Auth Infrastructure,
					<br />
					<span className="text-transparent bg-clip-text bg-linear-to-r from-sky-300 to-sky-500 drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]">
						Built Raw.
					</span>
				</h1>

				<p className="text-zinc-400 text-lg sm:text-xl font-mono max-w-2xl leading-relaxed pl-4 border-l-2 border-zinc-800">
					OpenAuthster is a brutalist, multi-tenant authentication engine
					running on Cloudflare edge. Own your identity layer. Zero fluff,
					absolute control.
				</p>

				<div className="flex flex-wrap gap-4 mt-4">
					{auth.isLoaded ? (
						auth.isAuthenticated ? (
							<a
								href="/dashboard"
								className="inline-flex items-center gap-3 px-8 py-4 bg-sky-400 text-black font-mono font-bold uppercase tracking-widest text-sm hover:bg-sky-300 transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] active:translate-y-[3px] active:translate-x-[3px] active:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]"
							>
								<Icon icon="lucide:terminal-square" className="w-5 h-5" />
								Enter Dashboard
							</a>
						) : (
							<button
								type="button"
								onClick={() => auth.login()}
								className="inline-flex items-center gap-3 px-8 py-4 bg-sky-400 text-black font-mono font-bold uppercase tracking-widest text-sm hover:bg-sky-300 transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] active:translate-y-[3px] active:translate-x-[3px] active:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]"
							>
								<Icon icon="lucide:zap" className="w-5 h-5" />
								Deploy Instance
							</button>
						)
					) : (
						<div className="h-14 w-48 bg-zinc-800 animate-pulse border border-zinc-700" />
					)}
					<a
						href="https://github.com/openauthster/openauthster"
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-3 px-8 py-4 bg-transparent text-white border-2 border-zinc-700 font-mono font-bold uppercase tracking-widest text-sm hover:border-white transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)] active:translate-y-[3px] active:translate-x-[3px] active:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.05)]"
					>
						<Icon icon="simple-icons:github" className="w-5 h-5" />
						Source
					</a>
				</div>

				{/* Tech stack */}
				<div className="flex flex-col gap-3 mt-12 bg-zinc-900 border border-zinc-800 p-4 w-full max-w-2xl">
					<div className="text-xs font-mono text-zinc-500 uppercase tracking-widest pb-2 border-b border-zinc-800">
						System_Architecture
					</div>
					<div className="flex flex-wrap items-center gap-x-6 gap-y-4 pt-2">
						{techStack.map((t) => (
							<div
								key={t.label}
								className="flex items-center gap-2 font-mono text-zinc-400 text-sm hover:text-sky-400 transition-colors cursor-default"
							>
								<Icon icon={t.icon} className="w-4 h-4 opacity-70" />
								{t.label}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Features Matrix */}
			<section className="relative z-10 w-full bg-zinc-950 border-t border-zinc-800">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-800 border-b border-zinc-800">
					{features.map((f, i) => (
						<div
							key={f.title}
							className="group p-8 flex flex-col gap-5 hover:bg-zinc-900 transition-colors relative overflow-hidden"
						>
							<div className="absolute top-0 right-0 p-4 text-zinc-800 font-mono text-4xl font-black opacity-30 select-none group-hover:text-sky-400 group-hover:opacity-10 transition-all">
								0{i + 1}
							</div>
							<div className="w-12 h-12 bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-sky-400 group-hover:border-sky-400 transition-colors relative z-10">
								<Icon icon={f.icon} className="w-6 h-6" />
							</div>
							<div className="relative z-10">
								<h3 className="font-mono font-bold text-lg text-white mb-2 uppercase tracking-wide">
									{f.title}
								</h3>
								<p className="text-sm font-sans text-zinc-500 leading-relaxed">
									{f.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Brutalist Footer */}
			<footer className="relative z-10 w-full flex-none border-t border-zinc-800 bg-black text-zinc-600 font-mono text-xs py-8 px-6">
				<div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 bg-sky-400 animate-pulse" />
						STATUS: SYSTEM_ONLINE
					</div>
					<div className="uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
						OpenAuthster Protocol © {new Date().getFullYear()}
					</div>
				</div>
			</footer>
		</div>
	);
}
