import { useCallback, useSyncExternalStore } from "react";

type CacheRecord<T> = {
	data: T | undefined;
	updatedAt: number;
	inflightPromise: Promise<T> | null;
	listeners: Set<() => void>;
};

export type CacheFetchOptions = {
	force?: boolean;
};

export interface ServerCache<T> {
	getSnapshot(key: string): T | undefined;
	subscribe(key: string, listener: () => void): () => void;
	fetch(
		key: string,
		loader: () => Promise<T>,
		options?: CacheFetchOptions,
	): Promise<T>;
	set(key: string, value: T): void;
	update(key: string, updater: (current: T | undefined) => T | undefined): void;
	invalidate(key: string): void;
	clear(key: string): void;
	clearMatching(predicate: (key: string) => boolean): void;
}

export function createServerCache<T>(ttl = 60_000): ServerCache<T> {
	const records = new Map<string, CacheRecord<T>>();

	const getRecord = (key: string): CacheRecord<T> => {
		const record = records.get(key);
		if (record) {
			return record;
		}

		const nextRecord: CacheRecord<T> = {
			data: undefined,
			updatedAt: 0,
			inflightPromise: null,
			listeners: new Set(),
		};
		records.set(key, nextRecord);
		return nextRecord;
	};

	const notify = (record: CacheRecord<T>) => {
		for (const listener of record.listeners) {
			listener();
		}
	};

	return {
		getSnapshot(key) {
			return getRecord(key).data;
		},
		subscribe(key, listener) {
			const record = getRecord(key);
			record.listeners.add(listener);

			return () => {
				record.listeners.delete(listener);
				if (record.listeners.size === 0 && record.data === undefined) {
					records.delete(key);
				}
			};
		},
		async fetch(key, loader, options = {}) {
			const record = getRecord(key);
			const isFresh =
				record.data !== undefined && Date.now() - record.updatedAt < ttl;

			if (!options.force && isFresh) {
				return record.data as T;
			}

			if (record.inflightPromise) {
				return record.inflightPromise;
			}

			record.inflightPromise = loader()
				.then((value) => {
					record.data = value;
					record.updatedAt = Date.now();
					notify(record);
					return value;
				})
				.finally(() => {
					record.inflightPromise = null;
				});

			return record.inflightPromise;
		},
		set(key, value) {
			const record = getRecord(key);
			record.data = value;
			record.updatedAt = Date.now();
			notify(record);
		},
		update(key, updater) {
			const record = getRecord(key);
			record.data = updater(record.data);
			record.updatedAt = record.data === undefined ? 0 : Date.now();
			notify(record);
		},
		invalidate(key) {
			const record = getRecord(key);
			record.updatedAt = 0;
		},
		clear(key) {
			const record = getRecord(key);
			record.data = undefined;
			record.updatedAt = 0;
			record.inflightPromise = null;
			notify(record);

			if (record.listeners.size === 0) {
				records.delete(key);
			}
		},
		clearMatching(predicate) {
			for (const [key, record] of records) {
				if (!predicate(key)) {
					continue;
				}

				record.data = undefined;
				record.updatedAt = 0;
				record.inflightPromise = null;
				notify(record);

				if (record.listeners.size === 0) {
					records.delete(key);
				}
			}
		},
	};
}

export function useServerCacheValue<T>(
	cache: ServerCache<T>,
	key: string,
): T | undefined {
	const subscribe = useCallback(
		(listener: () => void) => cache.subscribe(key, listener),
		[cache, key],
	);
	const getSnapshot = useCallback(() => cache.getSnapshot(key), [cache, key]);

	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
