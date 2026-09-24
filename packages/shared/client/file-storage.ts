import {
	chmodSync,
	mkdirSync,
	readFileSync,
	renameSync,
	writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import {
	AUTH_STORAGE_KEYS,
	type AuthStorage,
	type AuthStorageKey,
} from "./storage.ts";

function readFile(filePath: string): Partial<Record<AuthStorageKey, string>> {
	try {
		const parsed = JSON.parse(readFileSync(filePath, "utf8")) as unknown;
		if (!parsed || typeof parsed !== "object") return {};
		const data: Partial<Record<AuthStorageKey, string>> = {};
		for (const key of Object.values(AUTH_STORAGE_KEYS)) {
			const value = (parsed as Record<string, unknown>)[key];
			if (typeof value === "string") data[key] = value;
		}
		return data;
	} catch {
		return {};
	}
}

function writeFile(
	filePath: string,
	data: Partial<Record<AuthStorageKey, string>>,
) {
	mkdirSync(dirname(filePath), { recursive: true, mode: 0o700 });
	const tmp = `${filePath}.${process.pid}.tmp`;
	writeFileSync(tmp, JSON.stringify(data), { mode: 0o600 });
	renameSync(tmp, filePath);
	chmodSync(filePath, 0o600);
}

export function fileAuthStorage(filePath: string): AuthStorage {
	return {
		get(key) {
			return readFile(filePath)[key] ?? null;
		},
		set(key, value) {
			const data = readFile(filePath);
			data[key] = value;
			writeFile(filePath, data);
		},
		remove(key) {
			const data = readFile(filePath);
			delete data[key];
			writeFile(filePath, data);
		},
	};
}
