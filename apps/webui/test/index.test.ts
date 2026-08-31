import { describe, expect, test } from "bun:test";
import { isClientIdValid } from "openauth-webui-shared-types/database";

describe("isClientIdValid - SQLite table name safety", () => {
	describe("valid client IDs", () => {
		test("simple alphanumeric", () => {
			expect(isClientIdValid("myproject")).toBe(true);
			expect(isClientIdValid("project123")).toBe(true);
			expect(isClientIdValid("MyProject")).toBe(true);
		});

		test("with underscores", () => {
			expect(isClientIdValid("my_project")).toBe(true);
			expect(isClientIdValid("my_project_123")).toBe(true);
			expect(isClientIdValid("_private")).toBe(true);
		});

		test("minimum length (3 characters)", () => {
			expect(isClientIdValid("abc")).toBe(true);
			expect(isClientIdValid("a_1")).toBe(true);
		});

		test("maximum length (250 characters)", () => {
			expect(isClientIdValid("a".repeat(250))).toBe(true);
			expect(isClientIdValid("project_" + "a".repeat(242))).toBe(true);
		});
	});

	describe("invalid client IDs", () => {
		test("too short (less than 3 characters)", () => {
			expect(isClientIdValid("ab")).toBe(false);
			expect(isClientIdValid("a")).toBe(false);
			expect(isClientIdValid("")).toBe(false);
		});

		test("too long (more than 250 characters)", () => {
			expect(isClientIdValid("a".repeat(260))).toBe(false);
		});

		test("starts with number (invalid for SQLite)", () => {
			expect(isClientIdValid("123project")).toBe(false);
			expect(isClientIdValid("1_project")).toBe(false);
		});

		test("contains hyphens (unsafe for unquoted SQLite table names)", () => {
			expect(isClientIdValid("my-project")).toBe(false);
			expect(isClientIdValid("project-123")).toBe(false);
		});

		test("contains special characters", () => {
			expect(isClientIdValid("my.project")).toBe(false);
			expect(isClientIdValid("my project")).toBe(false);
			expect(isClientIdValid("project@123")).toBe(false);
			expect(isClientIdValid("project$test")).toBe(false);
			expect(isClientIdValid("project;drop")).toBe(false);
		});

		test("SQL injection attempts", () => {
			expect(isClientIdValid("'; DROP TABLE--")).toBe(false);
			expect(isClientIdValid("test; DELETE FROM")).toBe(false);
			expect(isClientIdValid("1=1")).toBe(false);
			expect(isClientIdValid("' OR '1'='1")).toBe(false);
		});

		test("contains quotes", () => {
			expect(isClientIdValid("project'test")).toBe(false);
			expect(isClientIdValid('project"test')).toBe(false);
			expect(isClientIdValid("project`test")).toBe(false);
		});

		test("contains parentheses or brackets", () => {
			expect(isClientIdValid("project(test)")).toBe(false);
			expect(isClientIdValid("project[test]")).toBe(false);
		});
	});
});
