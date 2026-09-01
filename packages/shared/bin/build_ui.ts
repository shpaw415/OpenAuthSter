const root = "providers/custom";
const outdir = "providers/build";

const clients = Array.from(
	new Bun.Glob("**/client.ts").scanSync({ cwd: root, absolute: true }),
);

if (clients.length === 0) {
	console.error("No client.ts entrypoints found under providers/custom");
	process.exit(1);
}

const result = await Bun.build({
	entrypoints: clients,
	outdir,
	splitting: false,
	target: "browser",
	jsx: {
		importSource: "hono/jsx",
	},
	root,
});

if (!result.success) {
	for (const log of result.logs) {
		console.error(log);
	}
	process.exit(1);
}

console.log("Build terminé !");
