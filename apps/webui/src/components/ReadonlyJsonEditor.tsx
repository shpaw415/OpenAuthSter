import Editor from "@monaco-editor/react";
import { useMemo } from "react";
import OneDarkProTheme from "../../static/monaco.one-dark-pro.json";

interface ReadonlyJsonEditorProps {
	value: unknown;
	height?: string;
	path?: string;
}

export function ReadonlyJsonEditor({
	value,
	height = "100%",
	path = "readonly-json-viewer.json",
}: ReadonlyJsonEditorProps) {
	const serializedValue = useMemo(() => {
		if (typeof value === "string") return value;
		return JSON.stringify(value ?? {}, null, 2);
	}, [value]);

	return (
		<Editor
			height={height}
			defaultLanguage="json"
			path={path}
			value={serializedValue}
			theme="one-dark-pro"
			beforeMount={(monaco) => {
				monaco.editor.defineTheme("one-dark-pro", OneDarkProTheme as any);
			}}
			options={{
				readOnly: true,
				minimap: { enabled: false },
				fontSize: 13,
				lineNumbers: "on",
				wordWrap: "on",
				scrollBeyondLastLine: false,
				automaticLayout: true,
				formatOnPaste: false,
				formatOnType: false,
				renderValidationDecorations: "off",
				padding: { top: 12, bottom: 12 },
			}}
		/>
	);
}