import { Component, type ReactNode } from "react";
import { Icon } from "./icon";

export class ErrorBoundary extends Component<
	{ children: ReactNode },
	{ error: Error | null }
> {
	constructor(props: { children: ReactNode }) {
		super(props);
		this.state = { error: null };
	}

	static getDerivedStateFromError(error: Error) {
		return { error };
	}
	//@ts-expect-error
	render() {
		if (this.state.error) {
			return (
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
					<div className="flex flex-col items-center justify-center py-20">
						<div className="relative mb-6">
							<div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl scale-150" />
							<div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-red-900/40 border border-red-700/50">
								<Icon
									icon="lucide:alert-circle"
									className="w-10 h-10 text-red-400"
								/>
							</div>
						</div>
						<h2 className="text-xl font-semibold text-white mb-2">
							Something went wrong
						</h2>
						<p className="text-red-300 text-sm text-center max-w-md mb-8">
							{this.state.error.message}
						</p>
						<a
							href="/dashboard"
							className="inline-flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors"
						>
							<Icon icon="lucide:arrow-left" className="w-4 h-4" />
							<span>Back to Dashboard</span>
						</a>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
