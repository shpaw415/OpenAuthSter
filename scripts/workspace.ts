import { existsSync } from "node:fs";
import { join } from "node:path";

type TaskName = "install" | "check" | "test" | "build";
type ScopeName = "core" | "all";
type RepoKey = "issuer" | "webui" | "shared" | "tester" | "docs";

type RepoConfig = {
	key: RepoKey;
	label: string;
	relPath: string;
	scope: "core" | "docs";
	tasks: Partial<Record<TaskName, string[]>>;
};

const ROOT_DIR = process.cwd();

const REPOS: RepoConfig[] = [
	{
		key: "issuer",
		label: "Issuer",
		relPath: "../openauth-multitenant-server",
		scope: "core",
		tasks: {
			install: ["bun", "install"],
			check: ["bun", "run", "check"],
			test: ["bun", "test"],
			build: ["bun", "run", "check"],
		},
	},
	{
		key: "webui",
		label: "Web UI",
		relPath: "../openauth-webui",
		scope: "core",
		tasks: {
			install: ["bun", "install"],
			check: ["bun", "x", "tsc", "--noEmit"],
			test: ["bun", "test"],
			build: ["bun", "run", "build"],
		},
	},
	{
		key: "shared",
		label: "Shared Types",
		relPath: "../openauth-webui-shared-types",
		scope: "core",
		tasks: {
			install: ["bun", "install"],
			check: ["bun", "x", "tsc", "--noEmit"],
			test: ["bun", "test"],
			build: ["bun", "run", "build:ui"],
		},
	},
	{
		key: "tester",
		label: "Tester",
		relPath: "../openauth-webui-tester",
		scope: "core",
		tasks: {
			install: ["bun", "install"],
			check: ["bun", "x", "tsc", "--noEmit"],
			test: ["bun", "test"],
			build: ["bun", "run", "build"],
		},
	},
	{
		key: "docs",
		label: "Docs",
		relPath: "../openauthster-doc",
		scope: "docs",
		tasks: {
			install: ["bun", "install"],
			check: ["bun", "x", "tsc", "--noEmit"],
			build: ["bun", "run", "build"],
		},
	},
];

function printUsage(): void {
	console.log(
		[
			"Usage: bun run ./scripts/workspace.ts <task> [--scope=core|all] [--repo=name1,name2] [--continue-on-error]",
			"",
			"Tasks:",
			"  install  Install dependencies in the selected repositories",
			"  check    Run type/build validation in the selected repositories",
			"  test     Run tests in the selected repositories",
			"  build    Run build commands in the selected repositories",
		].join("\n"),
	);
}

function isTaskName(value: string | undefined): value is TaskName {
	return (
		value === "install" ||
		value === "check" ||
		value === "test" ||
		value === "build"
	);
}

function parseRepoList(value: string | undefined): RepoKey[] {
	if (!value) return [];

	return value
		.split(",")
		.map((item) => item.trim())
		.filter((item): item is RepoKey => REPOS.some((repo) => repo.key === item));
}

function parseArgs(argv: string[]) {
	const task = argv[0];
	const flags = new Map<string, string | boolean>();

	for (const arg of argv.slice(1)) {
		if (!arg.startsWith("--")) continue;
		const [key, rawValue] = arg.slice(2).split("=", 2);
		flags.set(key, rawValue ?? true);
	}

	const scopeFlag = flags.get("scope");
	const scope: ScopeName = scopeFlag === "all" ? "all" : "core";
	const selectedRepos = parseRepoList(
		typeof flags.get("repo") === "string"
			? String(flags.get("repo"))
			: undefined,
	);
	const continueOnError = flags.get("continue-on-error") === true;

	return {
		task,
		scope,
		selectedRepos,
		continueOnError,
	};
}

function selectRepos(scope: ScopeName, selectedRepos: RepoKey[]): RepoConfig[] {
	if (selectedRepos.length > 0) {
		return REPOS.filter((repo) => selectedRepos.includes(repo.key));
	}

	if (scope === "all") {
		return REPOS;
	}

	return REPOS.filter((repo) => repo.scope === "core");
}

async function runRepoTask(repo: RepoConfig, task: TaskName): Promise<number> {
	const command = repo.tasks[task];
	if (!command) {
		console.log(`Skipping ${repo.label}: no ${task} command configured.`);
		return 0;
	}

	const cwd = join(ROOT_DIR, repo.relPath);
	if (!existsSync(cwd)) {
		console.error(`Skipping ${repo.label}: missing path ${cwd}`);
		return 1;
	}

	console.log(`\n==> ${repo.label} (${task})`);
	console.log(`cwd: ${cwd}`);
	console.log(`cmd: ${command.join(" ")}`);

	const proc = Bun.spawn({
		cmd: command,
		cwd,
		stdout: "inherit",
		stderr: "inherit",
		stdin: "inherit",
	});

	return await proc.exited;
}

async function main(): Promise<void> {
	const { task, scope, selectedRepos, continueOnError } = parseArgs(
		Bun.argv.slice(2),
	);

	if (!isTaskName(task)) {
		printUsage();
		process.exitCode = 1;
		return;
	}

	const repos = selectRepos(scope, selectedRepos);
	if (repos.length === 0) {
		console.error("No repositories matched the requested filters.");
		process.exitCode = 1;
		return;
	}

	const failures: RepoKey[] = [];

	for (const repo of repos) {
		const exitCode = await runRepoTask(repo, task);
		if (exitCode !== 0) {
			failures.push(repo.key);
			if (!continueOnError) {
				break;
			}
		}
	}

	if (failures.length > 0) {
		console.error(`\nWorkspace ${task} failed for: ${failures.join(", ")}`);
		process.exitCode = 1;
		return;
	}

	console.log(`\nWorkspace ${task} completed for ${repos.length} repos.`);
}

await main();
