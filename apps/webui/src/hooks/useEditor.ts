import { useMonaco } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import OneDarkProTheme from "../../static/monaco.one-dark-pro.json";

export function useEditor() {
	const monaco = useMonaco();
	const [inited, setInited] = useState(false);
	useEffect(() => {
		if (!monaco) return;
		monaco.editor.defineTheme("one-dark-pro", OneDarkProTheme as any);
		setInited(true);
	}, [monaco]);

	return { inited };
}
