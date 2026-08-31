import { useCallback, useState } from "react";

export function Toggle({
	onChange,
	enabled,
	name,
}: {
	onChange: (enabled: boolean) => void;
	enabled: boolean;
	name?: string;
}) {
	return (
		<button
			type="button"
			onClick={() => onChange(!enabled)}
			className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
				enabled ? "bg-blue-600" : "bg-gray-600"
			}`}
		>
			<span
				className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
					enabled ? "translate-x-6" : "translate-x-1"
				}`}
			/>
			<input type="hidden" value={enabled ? "true" : "false"} name={name} />
		</button>
	);
}

export function ToggleBase(
	props: React.DetailedHTMLProps<
		React.InputHTMLAttributes<HTMLInputElement>,
		HTMLInputElement
	>,
) {
	const [enabled, setEnabled] = useState(props.defaultChecked || false);
	return <Toggle enabled={enabled} onChange={setEnabled} name={props.name} />;
}
