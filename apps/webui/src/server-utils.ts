import { eq, or, type SQL } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";

export function ownerGroupConditions<
	Column extends SQLiteColumn,
	OtherEq extends SQL<unknown>,
>({
	user_group_ids,
	ownerGroupIdColumn,
	otherEq = [],
	self_host,
}: {
	user_group_ids: string[];
	ownerGroupIdColumn: Column;
	otherEq: Array<OtherEq>;
	self_host: "true" | "false" | boolean;
}) {
	const isSelfHosted = self_host === "true" || self_host === true;

	return isSelfHosted
		? undefined
		: or(
				...otherEq,
				...user_group_ids.map((groupId) => eq(ownerGroupIdColumn, groupId)),
			);
}

export function onSelfHosted<T>(
	selfHosted: "true" | "false" | boolean,
	selfHostCallback: T | (() => T),
	otherWiseCallback: T | (() => T),
): T | Promise<T> {
	const isSelfHosted = selfHosted === "true" || selfHosted === true;
	if (isSelfHosted) {
		return typeof selfHostCallback === "function"
			? (selfHostCallback as () => T)()
			: selfHostCallback;
	} else
		return typeof otherWiseCallback === "function"
			? (otherWiseCallback as () => T)()
			: otherWiseCallback;
}
