import { Icon } from "@iconify/react";
import Editor from "@monaco-editor/react";
import type * as monacoModule from "monaco-editor";
import type { IPosition, editor as MonacoEditor } from "monaco-editor";
import { useCallback, useEffect, useRef, useState } from "react";

const IF_SNIPPET =
	"if (" +
	"$" +
	'{1:props.type === "register"}) {\n\treturn ' +
	"$" +
	'{2:"Welcome"};\n}\n\nreturn ' +
	"$" +
	'{3:""};';
const LANGUAGE_SWITCH_SNIPPET =
	'const requestedLanguages = (props.AcceptLanguage || "")\n' +
	'\t.split(",")\n' +
	'\t.map((entry) => entry.split(";")[0].trim())\n' +
	"\t.filter(Boolean);\n\n" +
	"const resolvedLanguage = requestedLanguages.find((language) =>\n" +
	'\t["' +
	"$" +
	'{1:fr-CA}", "' +
	"$" +
	'{2:en-CA}", "' +
	"$" +
	'{3:en-US}"].includes(language),\n' +
	') || "' +
	"$" +
	'{4:en-US}";\n\n' +
	"switch (resolvedLanguage) {\n" +
	'\tcase "' +
	"$" +
	'{1:fr-CA}":\n' +
	'\t\treturn "' +
	"$" +
	'{5:Bonjour}";\n' +
	'\tcase "' +
	"$" +
	'{2:en-CA}":\n' +
	'\t\treturn "' +
	"$" +
	'{6:Hello}";\n' +
	'\tcase "' +
	"$" +
	'{3:en-US}":\n' +
	'\t\treturn "' +
	"$" +
	'{7:Howdy}";\n' +
	"\tdefault:\n" +
	'\t\treturn "' +
	"$" +
	'{8:Hello}";\n' +
	"}";

const TOP_LEVEL_RETURN_DIAGNOSTIC = 1108;

const RESERVED_PROP_DOCS = {
	AcceptLanguage: {
		detail: "(string)",
		documentation: "User's preferred language from the Accept-Language header.",
		typeDefinition: "string",
	},
	type: {
		detail: "(string)",
		documentation:
			"Type of action that triggered the template, such as register, login, or change_password.",
		typeDefinition: "string",
	},
	to: {
		detail: "(string)",
		documentation:
			"Recipient of the message being generated, such as an email or phone number.",
		typeDefinition: "string",
	},
} as const;

type EditorPropEntry = {
	key: string;
	detail: string;
	documentation: string;
	typeDefinition: string;
	isFunction: boolean;
};

type MonacoWithTypeScriptDefaults = typeof monacoModule & {
	languages: typeof monacoModule.languages & {
		typescript: {
			javascriptDefaults: {
				addExtraLib: (
					content: string,
					filePath?: string,
				) => { dispose: () => void };
				setEagerModelSync: (value: boolean) => void;
				setDiagnosticsOptions: (options: {
					noSemanticValidation?: boolean;
					noSyntaxValidation?: boolean;
					noSuggestionDiagnostics?: boolean;
					diagnosticCodesToIgnore?: number[];
				}) => void;
			};
			typescriptDefaults: {
				addExtraLib: (
					content: string,
					filePath?: string,
				) => { dispose: () => void };
				setEagerModelSync: (value: boolean) => void;
				setDiagnosticsOptions: (options: {
					noSemanticValidation?: boolean;
					noSyntaxValidation?: boolean;
					noSuggestionDiagnostics?: boolean;
					diagnosticCodesToIgnore?: number[];
				}) => void;
			};
		};
	};
};

function isValidIdentifier(value: string) {
	return /^[A-Za-z_$][\w$]*$/.test(value);
}

function toInlinePreview(value: string | string[]) {
	if (Array.isArray(value)) {
		value = value.join(", ");
	}
	const compact = value.replace(/\s+/g, " ").trim();
	if (!compact) return "(empty string)";
	return compact.length > 60 ? `${compact.slice(0, 57)}...` : compact;
}

function escapeJSDoc(value: string) {
	return value.replace(/\*\//g, "* /").replace(/\r?\n/g, " ");
}

function buildEditorPropEntries(
	sourceProps: Record<string, string | string[]>,
) {
	const entries = new Map<string, EditorPropEntry>();

	for (const [key, value] of Object.entries(sourceProps)) {
		const isFunction =
			typeof value === "string" && value.startsWith("function::");
		entries.set(key, {
			key,
			detail: isFunction ? "() => unknown" : toInlinePreview(value),
			documentation: isFunction
				? `Function value stored in ${key}. Call it to resolve the derived value with the current props.`
				: `Current mock value: ${toInlinePreview(value)}`,
			typeDefinition: isFunction ? "() => unknown" : "string",
			isFunction,
		});
	}

	for (const [key, meta] of Object.entries(RESERVED_PROP_DOCS)) {
		entries.set(key, {
			key,
			detail: meta.detail,
			documentation: meta.documentation,
			typeDefinition: meta.typeDefinition,
			isFunction: false,
		});
	}

	return [...entries.values()].sort((left, right) =>
		left.key.localeCompare(right.key),
	);
}

function buildPropsTypeDeclaration(
	sourceProps: Record<string, string | string[]>,
) {
	const properties = buildEditorPropEntries(sourceProps).map(
		({ key, documentation, typeDefinition }) =>
			`\t/** ${escapeJSDoc(documentation)} */\n\t${JSON.stringify(key)}: ${typeDefinition};`,
	);

	return ["declare const props: {", ...properties, "};"].join("\n");
}

interface Props {
	/** Variable name shown in the modal header. */
	variableKey: string;
	/**
	 * Function body (without the `function::` prefix).
	 * Pass `null` to close/hide the modal.
	 */
	value: string | string[] | null;
	/** Mock data whose keys are offered as `props.<key>` completions. */
	props: Record<string, string | string[]>;
	onAccept: (body: string | string[]) => void;
	onClose: () => void;
	onRemove: () => void;
}

export function FunctionEditorModal({
	variableKey,
	value,
	props,
	onAccept,
	onClose,
	onRemove,
}: Props) {
	const [draft, setDraft] = useState(value ?? "");
	const [editorLanguage, setEditorLanguage] = useState<
		"typescript" | "javascript"
	>("typescript");
	const propsRef = useRef({ ...props });
	const draftRef = useRef(value ?? "");
	const onAcceptRef = useRef(onAccept);
	const monacoRef = useRef<typeof monacoModule | null>(null);
	const completionDisposables = useRef<Array<{ dispose: () => void }>>([]);
	const extraLibDisposables = useRef<Array<{ dispose: () => void }>>([]);

	useEffect(() => {
		draftRef.current = draft;
	}, [draft]);

	useEffect(() => {
		onAcceptRef.current = onAccept;
	}, [onAccept]);

	// Sync draft when the modal is (re-)opened with a new value
	useEffect(() => {
		if (value !== null) {
			setDraft(value);
			draftRef.current = value;
		}
	}, [value]);

	const syncTypeHints = useCallback(() => {
		const monaco = monacoRef.current;
		if (!monaco) return;
		const tsMonaco = monaco as MonacoWithTypeScriptDefaults;
		const declaration = buildPropsTypeDeclaration(propsRef.current);

		for (const disposable of extraLibDisposables.current) {
			disposable.dispose();
		}

		extraLibDisposables.current = [
			tsMonaco.languages.typescript.typescriptDefaults.addExtraLib(
				declaration,
				`ts:openauth/function-editor/${variableKey}.d.ts`,
			),
			tsMonaco.languages.typescript.javascriptDefaults.addExtraLib(
				declaration,
				`ts:openauth/function-editor/${variableKey}.js.d.ts`,
			),
		];
	}, [variableKey]);

	useEffect(() => {
		propsRef.current = { ...props };
		syncTypeHints();
	}, [props, syncTypeHints]);

	// Dispose the completion provider when the component unmounts
	useEffect(() => {
		return () => {
			for (const disposable of extraLibDisposables.current) {
				disposable.dispose();
			}
			for (const disposable of completionDisposables.current) {
				disposable.dispose();
			}
		};
	}, []);

	const handleMount = useCallback(
		(
			editor: MonacoEditor.IStandaloneCodeEditor,
			monaco: typeof monacoModule,
		) => {
			const tsMonaco = monaco as MonacoWithTypeScriptDefaults;
			monacoRef.current = monaco;
			tsMonaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
			tsMonaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
			tsMonaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
				diagnosticCodesToIgnore: [TOP_LEVEL_RETURN_DIAGNOSTIC],
			});
			tsMonaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
				diagnosticCodesToIgnore: [TOP_LEVEL_RETURN_DIAGNOSTIC],
			});
			syncTypeHints();

			editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
				onAcceptRef.current(draftRef.current);
			});

			editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
				onAcceptRef.current(draftRef.current);
			});

			editor.focus();
			for (const disposable of completionDisposables.current) {
				disposable.dispose();
			}

			const createCompletionProvider = (
				language: "typescript" | "javascript",
			) =>
				monaco.languages.registerCompletionItemProvider(language, {
					triggerCharacters: [".", "("],
					provideCompletionItems(
						model: MonacoEditor.ITextModel,
						position: IPosition,
					) {
						const editorPropEntries = buildEditorPropEntries(propsRef.current);
						const lineUpToCursor = model.getValueInRange({
							startLineNumber: position.lineNumber,
							startColumn: 1,
							endLineNumber: position.lineNumber,
							endColumn: position.column,
						});
						const word = model.getWordUntilPosition(position);
						const range = {
							startLineNumber: position.lineNumber,
							endLineNumber: position.lineNumber,
							startColumn: word.startColumn,
							endColumn: word.endColumn,
						};

						if (/props(?:\?\.|\.)\w*$/.test(lineUpToCursor)) {
							return {
								suggestions: editorPropEntries
									.filter(({ key }) => isValidIdentifier(key))
									.map(
										({ key, detail, documentation, isFunction }) =>
											({
												label: key,
												kind: isFunction
													? monaco.languages.CompletionItemKind.Method
													: monaco.languages.CompletionItemKind.Field,
												insertText: isFunction ? `${key}()` : key,
												range,
												detail,
												documentation,
												sortText: isFunction ? `0-${key}` : `1-${key}`,
											}) as monacoModule.languages.CompletionItem,
									),
							};
						}

						const suggestions: Array<monacoModule.languages.CompletionItem> =
							[];

						if (word.word.length > 0 && "props".startsWith(word.word)) {
							suggestions.push({
								label: "props",
								kind: monaco.languages.CompletionItemKind.Variable,
								insertText: "props",
								range,
								detail: "Template props object",
								documentation: `Available keys: ${editorPropEntries.map(({ key }) => key).join(", ")}`,
								sortText: "0-props",
							});
						}

						if (word.word.length > 0 && "if".startsWith(word.word)) {
							suggestions.push({
								label: "if",
								kind: monaco.languages.CompletionItemKind.Snippet,
								insertText: IF_SNIPPET,
								insertTextRules:
									monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
								range,
								detail: "Conditional return block",
								documentation:
									"Create a small conditional branch and return a fallback value.",
								sortText: "1-if",
							});
						}

						if (word.word.length > 0 && "switch".startsWith(word.word)) {
							suggestions.push({
								label: "switch",
								kind: monaco.languages.CompletionItemKind.Snippet,
								insertText: LANGUAGE_SWITCH_SNIPPET,
								insertTextRules:
									monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
								range,
								detail: "Language switch by Accept-Language",
								documentation:
									"Match the first supported locale from props.AcceptLanguage and return a language-specific value.",
								sortText: "2-switch",
							});
						}

						if (suggestions.length > 0) {
							return {
								suggestions,
							};
						}

						return { suggestions: [] };
					},
				});

			completionDisposables.current = [
				createCompletionProvider("typescript"),
				createCompletionProvider("javascript"),
			];
		},
		[syncTypeHints],
	);

	if (value === null) return null;

	return (
		<>
			<button
				type="button"
				aria-label="Close function editor"
				className="fixed inset-0 z-40 bg-black/60 cursor-default min-h-screen"
				onClick={onClose}
			/>
			<div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
				<div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-350 h-[92vh] flex flex-col shadow-2xl">
					<div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-700">
						<div>
							<h2 className="text-white font-semibold flex items-center gap-2">
								<Icon
									icon="lucide:code-2"
									className="w-4 h-4 text-purple-400"
								/>
								Edit Function
							</h2>
							<p className="text-gray-400 text-xs mt-0.5">
								Variable:{" "}
								<code className="text-emerald-400">{`{{${variableKey}}}`}</code>
								{" — receives "}
								<code className="text-gray-300">props</code>
								{", return value replaces the variable in preview"}
							</p>
						</div>
						<div className="flex items-center gap-2">
							<div className="flex items-center rounded-lg border border-gray-700 bg-gray-800 p-1">
								<button
									type="button"
									onClick={() => setEditorLanguage("typescript")}
									className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
										editorLanguage === "typescript"
											? "bg-blue-600 text-white"
											: "text-gray-400 hover:text-white"
									}`}
								>
									TypeScript
								</button>
								<button
									type="button"
									onClick={() => setEditorLanguage("javascript")}
									className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
										editorLanguage === "javascript"
											? "bg-blue-600 text-white"
											: "text-gray-400 hover:text-white"
									}`}
								>
									JavaScript
								</button>
							</div>
							<button
								type="button"
								onClick={onClose}
								className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700 transition-colors"
								aria-label="Close"
							>
								<Icon icon="lucide:x" className="w-5 h-5" />
							</button>
						</div>
					</div>
					<div className="flex-1 min-h-0 p-2">
						<Editor
							height="100%"
							language={editorLanguage}
							path={`function-editor-${variableKey}.${editorLanguage === "typescript" ? "ts" : "js"}`}
							value={Array.isArray(draft) ? draft.join("\n") : draft}
							onMount={handleMount}
							onChange={(val) => setDraft(val ?? "")}
							theme="vs-dark"
							options={{
								minimap: { enabled: false },
								fontSize: 13,
								lineNumbers: "on",
								wordWrap: "on",
								scrollBeyondLastLine: false,
								automaticLayout: true,
								tabSize: 2,
								formatOnPaste: true,
								formatOnType: true,
								quickSuggestions: {
									other: true,
									comments: false,
									strings: true,
								},
								suggestOnTriggerCharacters: true,
								acceptSuggestionOnEnter: "smart",
								tabCompletion: "on",
								fixedOverflowWidgets: true,
								padding: { top: 12, bottom: 12 },
							}}
						/>
					</div>
					<div className="shrink-0 flex items-center justify-between px-5 py-4 border-t border-gray-700">
						<button
							type="button"
							onClick={onRemove}
							className="text-xs text-red-400 hover:text-red-300 transition-colors"
						>
							Remove function
						</button>
						<div className="flex items-center gap-4">
							<p className="text-xs text-gray-500">
								Use <code className="text-gray-300">props</code> with
								autocomplete. Save with{" "}
								<code className="text-gray-300">Ctrl/Cmd+Enter</code>.
							</p>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={onClose}
									className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors text-sm"
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={() => onAccept(draft)}
									className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
								>
									Accept
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
