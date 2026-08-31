var __defProp = Object.defineProperty;
var __name = (target, value) =>
	__defProp(target, "name", { value, configurable: true });

// ../node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
	return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
	const fn = /* @__PURE__ */ __name(() => {
		throw /* @__PURE__ */ createNotImplementedError(name);
	}, "fn");
	return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
	return class {
		__unenv__ = true;
		constructor() {
			throw new Error(`[unenv] ${name} is not implemented yet!`);
		}
	};
}
__name(notImplementedClass, "notImplementedClass");

// ../node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now
	? globalThis.performance.now.bind(globalThis.performance)
	: () => Date.now() - _timeOrigin;
var nodeTiming = {
	name: "node",
	entryType: "node",
	startTime: 0,
	duration: 0,
	nodeStart: 0,
	v8Start: 0,
	bootstrapComplete: 0,
	environment: 0,
	loopStart: 0,
	loopExit: 0,
	idleTime: 0,
	uvMetricsInfo: {
		loopCount: 0,
		events: 0,
		eventsWaiting: 0,
	},
	detail: void 0,
	toJSON() {
		return this;
	},
};
var PerformanceEntry = class {
	static {
		__name(this, "PerformanceEntry");
	}
	__unenv__ = true;
	detail;
	entryType = "event";
	name;
	startTime;
	constructor(name, options) {
		this.name = name;
		this.startTime = options?.startTime || _performanceNow();
		this.detail = options?.detail;
	}
	get duration() {
		return _performanceNow() - this.startTime;
	}
	toJSON() {
		return {
			name: this.name,
			entryType: this.entryType,
			startTime: this.startTime,
			duration: this.duration,
			detail: this.detail,
		};
	}
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
	static {
		__name(PerformanceMark2, "PerformanceMark");
	}
	entryType = "mark";
	constructor() {
		super(...arguments);
	}
	get duration() {
		return 0;
	}
};
var PerformanceMeasure = class extends PerformanceEntry {
	static {
		__name(this, "PerformanceMeasure");
	}
	entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
	static {
		__name(this, "PerformanceResourceTiming");
	}
	entryType = "resource";
	serverTiming = [];
	connectEnd = 0;
	connectStart = 0;
	decodedBodySize = 0;
	domainLookupEnd = 0;
	domainLookupStart = 0;
	encodedBodySize = 0;
	fetchStart = 0;
	initiatorType = "";
	name = "";
	nextHopProtocol = "";
	redirectEnd = 0;
	redirectStart = 0;
	requestStart = 0;
	responseEnd = 0;
	responseStart = 0;
	secureConnectionStart = 0;
	startTime = 0;
	transferSize = 0;
	workerStart = 0;
	responseStatus = 0;
};
var PerformanceObserverEntryList = class {
	static {
		__name(this, "PerformanceObserverEntryList");
	}
	__unenv__ = true;
	getEntries() {
		return [];
	}
	getEntriesByName(_name, _type) {
		return [];
	}
	getEntriesByType(type) {
		return [];
	}
};
var Performance = class {
	static {
		__name(this, "Performance");
	}
	__unenv__ = true;
	timeOrigin = _timeOrigin;
	eventCounts = /* @__PURE__ */ new Map();
	_entries = [];
	_resourceTimingBufferSize = 0;
	navigation = void 0;
	timing = void 0;
	timerify(_fn, _options) {
		throw createNotImplementedError("Performance.timerify");
	}
	get nodeTiming() {
		return nodeTiming;
	}
	eventLoopUtilization() {
		return {};
	}
	markResourceTiming() {
		return new PerformanceResourceTiming("");
	}
	onresourcetimingbufferfull = null;
	now() {
		if (this.timeOrigin === _timeOrigin) {
			return _performanceNow();
		}
		return Date.now() - this.timeOrigin;
	}
	clearMarks(markName) {
		this._entries = markName
			? this._entries.filter((e) => e.name !== markName)
			: this._entries.filter((e) => e.entryType !== "mark");
	}
	clearMeasures(measureName) {
		this._entries = measureName
			? this._entries.filter((e) => e.name !== measureName)
			: this._entries.filter((e) => e.entryType !== "measure");
	}
	clearResourceTimings() {
		this._entries = this._entries.filter(
			(e) => e.entryType !== "resource" || e.entryType !== "navigation",
		);
	}
	getEntries() {
		return this._entries;
	}
	getEntriesByName(name, type) {
		return this._entries.filter(
			(e) => e.name === name && (!type || e.entryType === type),
		);
	}
	getEntriesByType(type) {
		return this._entries.filter((e) => e.entryType === type);
	}
	mark(name, options) {
		const entry = new PerformanceMark(name, options);
		this._entries.push(entry);
		return entry;
	}
	measure(measureName, startOrMeasureOptions, endMark) {
		let start;
		let end;
		if (typeof startOrMeasureOptions === "string") {
			start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]
				?.startTime;
			end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
		} else {
			start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
			end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
		}
		const entry = new PerformanceMeasure(measureName, {
			startTime: start,
			detail: {
				start,
				end,
			},
		});
		this._entries.push(entry);
		return entry;
	}
	setResourceTimingBufferSize(maxSize) {
		this._resourceTimingBufferSize = maxSize;
	}
	addEventListener(type, listener, options) {
		throw createNotImplementedError("Performance.addEventListener");
	}
	removeEventListener(type, listener, options) {
		throw createNotImplementedError("Performance.removeEventListener");
	}
	dispatchEvent(event) {
		throw createNotImplementedError("Performance.dispatchEvent");
	}
	toJSON() {
		return this;
	}
};
var PerformanceObserver = class {
	static {
		__name(this, "PerformanceObserver");
	}
	__unenv__ = true;
	static supportedEntryTypes = [];
	_callback = null;
	constructor(callback) {
		this._callback = callback;
	}
	takeRecords() {
		return [];
	}
	disconnect() {
		throw createNotImplementedError("PerformanceObserver.disconnect");
	}
	observe(options) {
		throw createNotImplementedError("PerformanceObserver.observe");
	}
	bind(fn) {
		return fn;
	}
	runInAsyncScope(fn, thisArg, ...args) {
		return fn.call(thisArg, ...args);
	}
	asyncId() {
		return 0;
	}
	triggerAsyncId() {
		return 0;
	}
	emitDestroy() {
		return this;
	}
};
var performance =
	globalThis.performance && "addEventListener" in globalThis.performance
		? globalThis.performance
		: new Performance();

// ../node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {}, { __unenv__: true });

// ../node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask =
	_console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console =
	_console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
	assert,
	clear: clear2,
	// @ts-expect-error undocumented public API
	context,
	count: count2,
	countReset: countReset2,
	// @ts-expect-error undocumented public API
	createTask: createTask2,
	debug: debug2,
	dir: dir2,
	dirxml: dirxml2,
	error: error2,
	group: group2,
	groupCollapsed: groupCollapsed2,
	groupEnd: groupEnd2,
	info: info2,
	log: log2,
	profile: profile2,
	profileEnd: profileEnd2,
	table: table2,
	time: time2,
	timeEnd: timeEnd2,
	timeLog: timeLog2,
	timeStamp: timeStamp2,
	trace: trace2,
	warn: warn2,
} = workerdConsole;
Object.assign(workerdConsole, {
	Console,
	_ignoreErrors,
	_stderr,
	_stderrErrorHandler,
	_stdout,
	_stdoutErrorHandler,
	_times,
});
var console_default = workerdConsole;

// ../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(
	/* @__PURE__ */ __name(function hrtime2(startTime) {
		const now = Date.now();
		const seconds = Math.trunc(now / 1e3);
		const nanos = (now % 1e3) * 1e6;
		if (startTime) {
			let diffSeconds = seconds - startTime[0];
			let diffNanos = nanos - startTime[0];
			if (diffNanos < 0) {
				diffSeconds = diffSeconds - 1;
				diffNanos = 1e9 + diffNanos;
			}
			return [diffSeconds, diffNanos];
		}
		return [seconds, nanos];
	}, "hrtime"),
	{
		bigint: /* @__PURE__ */ __name(function bigint() {
			return BigInt(Date.now() * 1e6);
		}, "bigint"),
	},
);

// ../node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
	static {
		__name(this, "ReadStream");
	}
	fd;
	isRaw = false;
	isTTY = false;
	constructor(fd) {
		this.fd = fd;
	}
	setRawMode(mode) {
		this.isRaw = mode;
		return this;
	}
};

// ../node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
	static {
		__name(this, "WriteStream");
	}
	fd;
	columns = 80;
	rows = 24;
	isTTY = false;
	constructor(fd) {
		this.fd = fd;
	}
	clearLine(dir3, callback) {
		callback && callback();
		return false;
	}
	clearScreenDown(callback) {
		callback && callback();
		return false;
	}
	cursorTo(x, y, callback) {
		callback && typeof callback === "function" && callback();
		return false;
	}
	moveCursor(dx, dy, callback) {
		callback && callback();
		return false;
	}
	getColorDepth(env2) {
		return 1;
	}
	hasColors(count3, env2) {
		return false;
	}
	getWindowSize() {
		return [this.columns, this.rows];
	}
	write(str, encoding, cb) {
		if (str instanceof Uint8Array) {
			str = new TextDecoder().decode(str);
		}
		try {
			console.log(str);
		} catch {}
		cb && typeof cb === "function" && cb();
		return false;
	}
};

// ../node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
	static {
		__name(_Process, "Process");
	}
	env;
	hrtime;
	nextTick;
	constructor(impl) {
		super();
		this.env = impl.env;
		this.hrtime = impl.hrtime;
		this.nextTick = impl.nextTick;
		for (const prop of [
			...Object.getOwnPropertyNames(_Process.prototype),
			...Object.getOwnPropertyNames(EventEmitter.prototype),
		]) {
			const value = this[prop];
			if (typeof value === "function") {
				this[prop] = value.bind(this);
			}
		}
	}
	// --- event emitter ---
	emitWarning(warning, type, code) {
		console.warn(
			`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`,
		);
	}
	emit(...args) {
		return super.emit(...args);
	}
	listeners(eventName) {
		return super.listeners(eventName);
	}
	// --- stdio (lazy initializers) ---
	#stdin;
	#stdout;
	#stderr;
	get stdin() {
		return (this.#stdin ??= new ReadStream(0));
	}
	get stdout() {
		return (this.#stdout ??= new WriteStream(1));
	}
	get stderr() {
		return (this.#stderr ??= new WriteStream(2));
	}
	// --- cwd ---
	#cwd = "/";
	chdir(cwd2) {
		this.#cwd = cwd2;
	}
	cwd() {
		return this.#cwd;
	}
	// --- dummy props and getters ---
	arch = "";
	platform = "";
	argv = [];
	argv0 = "";
	execArgv = [];
	execPath = "";
	title = "";
	pid = 200;
	ppid = 100;
	get version() {
		return `v${NODE_VERSION}`;
	}
	get versions() {
		return { node: NODE_VERSION };
	}
	get allowedNodeEnvironmentFlags() {
		return /* @__PURE__ */ new Set();
	}
	get sourceMapsEnabled() {
		return false;
	}
	get debugPort() {
		return 0;
	}
	get throwDeprecation() {
		return false;
	}
	get traceDeprecation() {
		return false;
	}
	get features() {
		return {};
	}
	get release() {
		return {};
	}
	get connected() {
		return false;
	}
	get config() {
		return {};
	}
	get moduleLoadList() {
		return [];
	}
	constrainedMemory() {
		return 0;
	}
	availableMemory() {
		return 0;
	}
	uptime() {
		return 0;
	}
	resourceUsage() {
		return {};
	}
	// --- noop methods ---
	ref() {}
	unref() {}
	// --- unimplemented methods ---
	umask() {
		throw createNotImplementedError("process.umask");
	}
	getBuiltinModule() {
		return void 0;
	}
	getActiveResourcesInfo() {
		throw createNotImplementedError("process.getActiveResourcesInfo");
	}
	exit() {
		throw createNotImplementedError("process.exit");
	}
	reallyExit() {
		throw createNotImplementedError("process.reallyExit");
	}
	kill() {
		throw createNotImplementedError("process.kill");
	}
	abort() {
		throw createNotImplementedError("process.abort");
	}
	dlopen() {
		throw createNotImplementedError("process.dlopen");
	}
	setSourceMapsEnabled() {
		throw createNotImplementedError("process.setSourceMapsEnabled");
	}
	loadEnvFile() {
		throw createNotImplementedError("process.loadEnvFile");
	}
	disconnect() {
		throw createNotImplementedError("process.disconnect");
	}
	cpuUsage() {
		throw createNotImplementedError("process.cpuUsage");
	}
	setUncaughtExceptionCaptureCallback() {
		throw createNotImplementedError(
			"process.setUncaughtExceptionCaptureCallback",
		);
	}
	hasUncaughtExceptionCaptureCallback() {
		throw createNotImplementedError(
			"process.hasUncaughtExceptionCaptureCallback",
		);
	}
	initgroups() {
		throw createNotImplementedError("process.initgroups");
	}
	openStdin() {
		throw createNotImplementedError("process.openStdin");
	}
	assert() {
		throw createNotImplementedError("process.assert");
	}
	binding() {
		throw createNotImplementedError("process.binding");
	}
	// --- attached interfaces ---
	permission = {
		has: /* @__PURE__ */ notImplemented("process.permission.has"),
	};
	report = {
		directory: "",
		filename: "",
		signal: "SIGUSR2",
		compact: false,
		reportOnFatalError: false,
		reportOnSignal: false,
		reportOnUncaughtException: false,
		getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
		writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport"),
	};
	finalization = {
		register: /* @__PURE__ */ notImplemented("process.finalization.register"),
		unregister: /* @__PURE__ */ notImplemented(
			"process.finalization.unregister",
		),
		registerBeforeExit: /* @__PURE__ */ notImplemented(
			"process.finalization.registerBeforeExit",
		),
	};
	memoryUsage = Object.assign(
		() => ({
			arrayBuffers: 0,
			rss: 0,
			external: 0,
			heapTotal: 0,
			heapUsed: 0,
		}),
		{ rss: /* @__PURE__ */ __name(() => 0, "rss") },
	);
	// --- undefined props ---
	mainModule = void 0;
	domain = void 0;
	// optional
	send = void 0;
	exitCode = void 0;
	channel = void 0;
	getegid = void 0;
	geteuid = void 0;
	getgid = void 0;
	getgroups = void 0;
	getuid = void 0;
	setegid = void 0;
	seteuid = void 0;
	setgid = void 0;
	setgroups = void 0;
	setuid = void 0;
	// internals
	_events = void 0;
	_eventsCount = void 0;
	_exiting = void 0;
	_maxListeners = void 0;
	_debugEnd = void 0;
	_debugProcess = void 0;
	_fatalException = void 0;
	_getActiveHandles = void 0;
	_getActiveRequests = void 0;
	_kill = void 0;
	_preload_modules = void 0;
	_rawDebug = void 0;
	_startProfilerIdleNotifier = void 0;
	_stopProfilerIdleNotifier = void 0;
	_tickCallback = void 0;
	_disconnect = void 0;
	_handleQueue = void 0;
	_pendingMessage = void 0;
	_channel = void 0;
	_send = void 0;
	_linkedBinding = void 0;
};

// ../node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var isWorkerdProcessV2 =
	globalThis.Cloudflare.compatibilityFlags.enable_nodejs_process_v2;
var unenvProcess = new Process({
	env: globalProcess.env,
	// `hrtime` is only available from workerd process v2
	hrtime: isWorkerdProcessV2 ? workerdProcess.hrtime : hrtime,
	// `nextTick` is available from workerd process v1
	nextTick: workerdProcess.nextTick,
});
var { exit, features, platform } = workerdProcess;
var {
	// Always implemented by workerd
	env,
	// Only implemented in workerd v2
	hrtime: hrtime3,
	// Always implemented by workerd
	nextTick,
} = unenvProcess;
var {
	_channel,
	_disconnect,
	_events,
	_eventsCount,
	_handleQueue,
	_maxListeners,
	_pendingMessage,
	_send,
	assert: assert2,
	disconnect,
	mainModule,
} = unenvProcess;
var {
	// @ts-expect-error `_debugEnd` is missing typings
	_debugEnd,
	// @ts-expect-error `_debugProcess` is missing typings
	_debugProcess,
	// @ts-expect-error `_exiting` is missing typings
	_exiting,
	// @ts-expect-error `_fatalException` is missing typings
	_fatalException,
	// @ts-expect-error `_getActiveHandles` is missing typings
	_getActiveHandles,
	// @ts-expect-error `_getActiveRequests` is missing typings
	_getActiveRequests,
	// @ts-expect-error `_kill` is missing typings
	_kill,
	// @ts-expect-error `_linkedBinding` is missing typings
	_linkedBinding,
	// @ts-expect-error `_preload_modules` is missing typings
	_preload_modules,
	// @ts-expect-error `_rawDebug` is missing typings
	_rawDebug,
	// @ts-expect-error `_startProfilerIdleNotifier` is missing typings
	_startProfilerIdleNotifier,
	// @ts-expect-error `_stopProfilerIdleNotifier` is missing typings
	_stopProfilerIdleNotifier,
	// @ts-expect-error `_tickCallback` is missing typings
	_tickCallback,
	abort,
	addListener,
	allowedNodeEnvironmentFlags,
	arch,
	argv,
	argv0,
	availableMemory,
	// @ts-expect-error `binding` is missing typings
	binding,
	channel,
	chdir,
	config,
	connected,
	constrainedMemory,
	cpuUsage,
	cwd,
	debugPort,
	dlopen,
	// @ts-expect-error `domain` is missing typings
	domain,
	emit,
	emitWarning,
	eventNames,
	execArgv,
	execPath,
	exitCode,
	finalization,
	getActiveResourcesInfo,
	getegid,
	geteuid,
	getgid,
	getgroups,
	getMaxListeners,
	getuid,
	hasUncaughtExceptionCaptureCallback,
	// @ts-expect-error `initgroups` is missing typings
	initgroups,
	kill,
	listenerCount,
	listeners,
	loadEnvFile,
	memoryUsage,
	// @ts-expect-error `moduleLoadList` is missing typings
	moduleLoadList,
	off,
	on,
	once,
	// @ts-expect-error `openStdin` is missing typings
	openStdin,
	permission,
	pid,
	ppid,
	prependListener,
	prependOnceListener,
	rawListeners,
	// @ts-expect-error `reallyExit` is missing typings
	reallyExit,
	ref,
	release,
	removeAllListeners,
	removeListener,
	report,
	resourceUsage,
	send,
	setegid,
	seteuid,
	setgid,
	setgroups,
	setMaxListeners,
	setSourceMapsEnabled,
	setuid,
	setUncaughtExceptionCaptureCallback,
	sourceMapsEnabled,
	stderr,
	stdin,
	stdout,
	throwDeprecation,
	title,
	traceDeprecation,
	umask,
	unref,
	uptime,
	version,
	versions,
} = isWorkerdProcessV2 ? workerdProcess : unenvProcess;
var _process = {
	abort,
	addListener,
	allowedNodeEnvironmentFlags,
	hasUncaughtExceptionCaptureCallback,
	setUncaughtExceptionCaptureCallback,
	loadEnvFile,
	sourceMapsEnabled,
	arch,
	argv,
	argv0,
	chdir,
	config,
	connected,
	constrainedMemory,
	availableMemory,
	cpuUsage,
	cwd,
	debugPort,
	dlopen,
	disconnect,
	emit,
	emitWarning,
	env,
	eventNames,
	execArgv,
	execPath,
	exit,
	finalization,
	features,
	getBuiltinModule,
	getActiveResourcesInfo,
	getMaxListeners,
	hrtime: hrtime3,
	kill,
	listeners,
	listenerCount,
	memoryUsage,
	nextTick,
	on,
	off,
	once,
	pid,
	platform,
	ppid,
	prependListener,
	prependOnceListener,
	rawListeners,
	release,
	removeAllListeners,
	removeListener,
	report,
	resourceUsage,
	setMaxListeners,
	setSourceMapsEnabled,
	stderr,
	stdin,
	stdout,
	title,
	throwDeprecation,
	traceDeprecation,
	umask,
	uptime,
	version,
	versions,
	// @ts-expect-error old API
	domain,
	initgroups,
	moduleLoadList,
	reallyExit,
	openStdin,
	assert: assert2,
	binding,
	send,
	exitCode,
	channel,
	getegid,
	geteuid,
	getgid,
	getgroups,
	getuid,
	setegid,
	seteuid,
	setgid,
	setgroups,
	setuid,
	permission,
	mainModule,
	_events,
	_eventsCount,
	_exiting,
	_maxListeners,
	_debugEnd,
	_debugProcess,
	_fatalException,
	_getActiveHandles,
	_getActiveRequests,
	_kill,
	_preload_modules,
	_rawDebug,
	_startProfilerIdleNotifier,
	_stopProfilerIdleNotifier,
	_tickCallback,
	_disconnect,
	_handleQueue,
	_pendingMessage,
	_channel,
	_send,
	_linkedBinding,
};
var process_default = _process;

// ../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// chunk-0t41ngqp.js
var __defProp2 = Object.defineProperty;
var __export = /* @__PURE__ */ __name((target, all) => {
	for (var name in all)
		__defProp2(target, name, {
			get: all[name],
			enumerable: true,
			configurable: true,
			set: /* @__PURE__ */ __name(
				(newValue) => (all[name] = () => newValue),
				"set",
			),
		});
}, "__export");

// chunk-zc0xabes.js
function createSubjects(types2) {
	return { ...types2 };
}
__name(createSubjects, "createSubjects");
var webcrypto_default = crypto;
var isCryptoKey = /* @__PURE__ */ __name(
	(key) => key instanceof CryptoKey,
	"isCryptoKey",
);
var encoder = new TextEncoder();
var decoder = new TextDecoder();
var MAX_INT32 = 2 ** 32;
function concat(...buffers) {
	const size = buffers.reduce((acc, { length }) => acc + length, 0);
	const buf = new Uint8Array(size);
	let i = 0;
	for (const buffer of buffers) {
		buf.set(buffer, i);
		i += buffer.length;
	}
	return buf;
}
__name(concat, "concat");
var encodeBase64 = /* @__PURE__ */ __name((input) => {
	let unencoded = input;
	if (typeof unencoded === "string") {
		unencoded = encoder.encode(unencoded);
	}
	const CHUNK_SIZE = 32768;
	const arr = [];
	for (let i = 0; i < unencoded.length; i += CHUNK_SIZE) {
		arr.push(
			String.fromCharCode.apply(null, unencoded.subarray(i, i + CHUNK_SIZE)),
		);
	}
	return btoa(arr.join(""));
}, "encodeBase64");
var encode = /* @__PURE__ */ __name((input) => {
	return encodeBase64(input)
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
}, "encode");
var decodeBase64 = /* @__PURE__ */ __name((encoded) => {
	const binary = atob(encoded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}, "decodeBase64");
var decode = /* @__PURE__ */ __name((input) => {
	let encoded = input;
	if (encoded instanceof Uint8Array) {
		encoded = decoder.decode(encoded);
	}
	encoded = encoded.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
	try {
		return decodeBase64(encoded);
	} catch {
		throw new TypeError("The input to be decoded is not correctly encoded.");
	}
}, "decode");
var exports_errors = {};
__export(exports_errors, {
	JWTInvalid: /* @__PURE__ */ __name(() => JWTInvalid, "JWTInvalid"),
	JWTExpired: /* @__PURE__ */ __name(() => JWTExpired, "JWTExpired"),
	JWTClaimValidationFailed: /* @__PURE__ */ __name(
		() => JWTClaimValidationFailed,
		"JWTClaimValidationFailed",
	),
	JWSSignatureVerificationFailed: /* @__PURE__ */ __name(
		() => JWSSignatureVerificationFailed,
		"JWSSignatureVerificationFailed",
	),
	JWSInvalid: /* @__PURE__ */ __name(() => JWSInvalid, "JWSInvalid"),
	JWKSTimeout: /* @__PURE__ */ __name(() => JWKSTimeout, "JWKSTimeout"),
	JWKSNoMatchingKey: /* @__PURE__ */ __name(
		() => JWKSNoMatchingKey,
		"JWKSNoMatchingKey",
	),
	JWKSMultipleMatchingKeys: /* @__PURE__ */ __name(
		() => JWKSMultipleMatchingKeys,
		"JWKSMultipleMatchingKeys",
	),
	JWKSInvalid: /* @__PURE__ */ __name(() => JWKSInvalid, "JWKSInvalid"),
	JWKInvalid: /* @__PURE__ */ __name(() => JWKInvalid, "JWKInvalid"),
	JWEInvalid: /* @__PURE__ */ __name(() => JWEInvalid, "JWEInvalid"),
	JWEDecryptionFailed: /* @__PURE__ */ __name(
		() => JWEDecryptionFailed,
		"JWEDecryptionFailed",
	),
	JOSENotSupported: /* @__PURE__ */ __name(
		() => JOSENotSupported,
		"JOSENotSupported",
	),
	JOSEError: /* @__PURE__ */ __name(() => JOSEError, "JOSEError"),
	JOSEAlgNotAllowed: /* @__PURE__ */ __name(
		() => JOSEAlgNotAllowed,
		"JOSEAlgNotAllowed",
	),
});
var JOSEError = class extends Error {
	static {
		__name(this, "JOSEError");
	}
	constructor(message2, options) {
		super(message2, options);
		this.code = "ERR_JOSE_GENERIC";
		this.name = this.constructor.name;
		Error.captureStackTrace?.(this, this.constructor);
	}
};
JOSEError.code = "ERR_JOSE_GENERIC";
var JWTClaimValidationFailed = class extends JOSEError {
	static {
		__name(this, "JWTClaimValidationFailed");
	}
	constructor(
		message2,
		payload,
		claim = "unspecified",
		reason = "unspecified",
	) {
		super(message2, { cause: { claim, reason, payload } });
		this.code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
		this.claim = claim;
		this.reason = reason;
		this.payload = payload;
	}
};
JWTClaimValidationFailed.code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
var JWTExpired = class extends JOSEError {
	static {
		__name(this, "JWTExpired");
	}
	constructor(
		message2,
		payload,
		claim = "unspecified",
		reason = "unspecified",
	) {
		super(message2, { cause: { claim, reason, payload } });
		this.code = "ERR_JWT_EXPIRED";
		this.claim = claim;
		this.reason = reason;
		this.payload = payload;
	}
};
JWTExpired.code = "ERR_JWT_EXPIRED";
var JOSEAlgNotAllowed = class extends JOSEError {
	static {
		__name(this, "JOSEAlgNotAllowed");
	}
	constructor() {
		super(...arguments);
		this.code = "ERR_JOSE_ALG_NOT_ALLOWED";
	}
};
JOSEAlgNotAllowed.code = "ERR_JOSE_ALG_NOT_ALLOWED";
var JOSENotSupported = class extends JOSEError {
	static {
		__name(this, "JOSENotSupported");
	}
	constructor() {
		super(...arguments);
		this.code = "ERR_JOSE_NOT_SUPPORTED";
	}
};
JOSENotSupported.code = "ERR_JOSE_NOT_SUPPORTED";
var JWEDecryptionFailed = class extends JOSEError {
	static {
		__name(this, "JWEDecryptionFailed");
	}
	constructor(message2 = "decryption operation failed", options) {
		super(message2, options);
		this.code = "ERR_JWE_DECRYPTION_FAILED";
	}
};
JWEDecryptionFailed.code = "ERR_JWE_DECRYPTION_FAILED";
var JWEInvalid = class extends JOSEError {
	static {
		__name(this, "JWEInvalid");
	}
	constructor() {
		super(...arguments);
		this.code = "ERR_JWE_INVALID";
	}
};
JWEInvalid.code = "ERR_JWE_INVALID";
var JWSInvalid = class extends JOSEError {
	static {
		__name(this, "JWSInvalid");
	}
	constructor() {
		super(...arguments);
		this.code = "ERR_JWS_INVALID";
	}
};
JWSInvalid.code = "ERR_JWS_INVALID";
var JWTInvalid = class extends JOSEError {
	static {
		__name(this, "JWTInvalid");
	}
	constructor() {
		super(...arguments);
		this.code = "ERR_JWT_INVALID";
	}
};
JWTInvalid.code = "ERR_JWT_INVALID";
var JWKInvalid = class extends JOSEError {
	static {
		__name(this, "JWKInvalid");
	}
	constructor() {
		super(...arguments);
		this.code = "ERR_JWK_INVALID";
	}
};
JWKInvalid.code = "ERR_JWK_INVALID";
var JWKSInvalid = class extends JOSEError {
	static {
		__name(this, "JWKSInvalid");
	}
	constructor() {
		super(...arguments);
		this.code = "ERR_JWKS_INVALID";
	}
};
JWKSInvalid.code = "ERR_JWKS_INVALID";
var JWKSNoMatchingKey = class extends JOSEError {
	static {
		__name(this, "JWKSNoMatchingKey");
	}
	constructor(
		message2 = "no applicable key found in the JSON Web Key Set",
		options,
	) {
		super(message2, options);
		this.code = "ERR_JWKS_NO_MATCHING_KEY";
	}
};
JWKSNoMatchingKey.code = "ERR_JWKS_NO_MATCHING_KEY";
var JWKSMultipleMatchingKeys = class extends JOSEError {
	static {
		__name(this, "JWKSMultipleMatchingKeys");
	}
	constructor(
		message2 = "multiple matching keys found in the JSON Web Key Set",
		options,
	) {
		super(message2, options);
		this.code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
	}
};
JWKSMultipleMatchingKeys.code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
var JWKSTimeout = class extends JOSEError {
	static {
		__name(this, "JWKSTimeout");
	}
	constructor(message2 = "request timed out", options) {
		super(message2, options);
		this.code = "ERR_JWKS_TIMEOUT";
	}
};
JWKSTimeout.code = "ERR_JWKS_TIMEOUT";
var JWSSignatureVerificationFailed = class extends JOSEError {
	static {
		__name(this, "JWSSignatureVerificationFailed");
	}
	constructor(message2 = "signature verification failed", options) {
		super(message2, options);
		this.code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
	}
};
JWSSignatureVerificationFailed.code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
function unusable(name, prop = "algorithm.name") {
	return new TypeError(
		`CryptoKey does not support this operation, its ${prop} must be ${name}`,
	);
}
__name(unusable, "unusable");
function isAlgorithm(algorithm, name) {
	return algorithm.name === name;
}
__name(isAlgorithm, "isAlgorithm");
function getHashLength(hash) {
	return parseInt(hash.name.slice(4), 10);
}
__name(getHashLength, "getHashLength");
function getNamedCurve(alg) {
	switch (alg) {
		case "ES256":
			return "P-256";
		case "ES384":
			return "P-384";
		case "ES512":
			return "P-521";
		default:
			throw new Error("unreachable");
	}
}
__name(getNamedCurve, "getNamedCurve");
function checkUsage(key, usages) {
	if (
		usages.length &&
		!usages.some((expected) => key.usages.includes(expected))
	) {
		let msg =
			"CryptoKey does not support this operation, its usages must include ";
		if (usages.length > 2) {
			const last = usages.pop();
			msg += `one of ${usages.join(", ")}, or ${last}.`;
		} else if (usages.length === 2) {
			msg += `one of ${usages[0]} or ${usages[1]}.`;
		} else {
			msg += `${usages[0]}.`;
		}
		throw new TypeError(msg);
	}
}
__name(checkUsage, "checkUsage");
function checkSigCryptoKey(key, alg, ...usages) {
	switch (alg) {
		case "HS256":
		case "HS384":
		case "HS512": {
			if (!isAlgorithm(key.algorithm, "HMAC")) throw unusable("HMAC");
			const expected = parseInt(alg.slice(2), 10);
			const actual = getHashLength(key.algorithm.hash);
			if (actual !== expected)
				throw unusable(`SHA-${expected}`, "algorithm.hash");
			break;
		}
		case "RS256":
		case "RS384":
		case "RS512": {
			if (!isAlgorithm(key.algorithm, "RSASSA-PKCS1-v1_5"))
				throw unusable("RSASSA-PKCS1-v1_5");
			const expected = parseInt(alg.slice(2), 10);
			const actual = getHashLength(key.algorithm.hash);
			if (actual !== expected)
				throw unusable(`SHA-${expected}`, "algorithm.hash");
			break;
		}
		case "PS256":
		case "PS384":
		case "PS512": {
			if (!isAlgorithm(key.algorithm, "RSA-PSS")) throw unusable("RSA-PSS");
			const expected = parseInt(alg.slice(2), 10);
			const actual = getHashLength(key.algorithm.hash);
			if (actual !== expected)
				throw unusable(`SHA-${expected}`, "algorithm.hash");
			break;
		}
		case "EdDSA": {
			if (key.algorithm.name !== "Ed25519" && key.algorithm.name !== "Ed448") {
				throw unusable("Ed25519 or Ed448");
			}
			break;
		}
		case "ES256":
		case "ES384":
		case "ES512": {
			if (!isAlgorithm(key.algorithm, "ECDSA")) throw unusable("ECDSA");
			const expected = getNamedCurve(alg);
			const actual = key.algorithm.namedCurve;
			if (actual !== expected) throw unusable(expected, "algorithm.namedCurve");
			break;
		}
		default:
			throw new TypeError("CryptoKey does not support this operation");
	}
	checkUsage(key, usages);
}
__name(checkSigCryptoKey, "checkSigCryptoKey");
function message(msg, actual, ...types2) {
	types2 = types2.filter(Boolean);
	if (types2.length > 2) {
		const last = types2.pop();
		msg += `one of type ${types2.join(", ")}, or ${last}.`;
	} else if (types2.length === 2) {
		msg += `one of type ${types2[0]} or ${types2[1]}.`;
	} else {
		msg += `of type ${types2[0]}.`;
	}
	if (actual == null) {
		msg += ` Received ${actual}`;
	} else if (typeof actual === "function" && actual.name) {
		msg += ` Received function ${actual.name}`;
	} else if (typeof actual === "object" && actual != null) {
		if (actual.constructor?.name) {
			msg += ` Received an instance of ${actual.constructor.name}`;
		}
	}
	return msg;
}
__name(message, "message");
var invalid_key_input_default = /* @__PURE__ */ __name((actual, ...types2) => {
	return message("Key must be ", actual, ...types2);
}, "invalid_key_input_default");
function withAlg(alg, actual, ...types2) {
	return message(`Key for the ${alg} algorithm must be `, actual, ...types2);
}
__name(withAlg, "withAlg");
var is_key_like_default = /* @__PURE__ */ __name((key) => {
	if (isCryptoKey(key)) {
		return true;
	}
	return key?.[Symbol.toStringTag] === "KeyObject";
}, "is_key_like_default");
var types = ["CryptoKey"];
var isDisjoint = /* @__PURE__ */ __name((...headers) => {
	const sources = headers.filter(Boolean);
	if (sources.length === 0 || sources.length === 1) {
		return true;
	}
	let acc;
	for (const header of sources) {
		const parameters = Object.keys(header);
		if (!acc || acc.size === 0) {
			acc = new Set(parameters);
			continue;
		}
		for (const parameter of parameters) {
			if (acc.has(parameter)) {
				return false;
			}
			acc.add(parameter);
		}
	}
	return true;
}, "isDisjoint");
var is_disjoint_default = isDisjoint;
function isObjectLike(value) {
	return typeof value === "object" && value !== null;
}
__name(isObjectLike, "isObjectLike");
function isObject(input) {
	if (
		!isObjectLike(input) ||
		Object.prototype.toString.call(input) !== "[object Object]"
	) {
		return false;
	}
	if (Object.getPrototypeOf(input) === null) {
		return true;
	}
	let proto = input;
	while (Object.getPrototypeOf(proto) !== null) {
		proto = Object.getPrototypeOf(proto);
	}
	return Object.getPrototypeOf(input) === proto;
}
__name(isObject, "isObject");
var check_key_length_default = /* @__PURE__ */ __name((alg, key) => {
	if (alg.startsWith("RS") || alg.startsWith("PS")) {
		const { modulusLength } = key.algorithm;
		if (typeof modulusLength !== "number" || modulusLength < 2048) {
			throw new TypeError(
				`${alg} requires key modulusLength to be 2048 bits or larger`,
			);
		}
	}
}, "check_key_length_default");
function isJWK(key) {
	return isObject(key) && typeof key.kty === "string";
}
__name(isJWK, "isJWK");
function isPrivateJWK(key) {
	return key.kty !== "oct" && typeof key.d === "string";
}
__name(isPrivateJWK, "isPrivateJWK");
function isPublicJWK(key) {
	return key.kty !== "oct" && typeof key.d === "undefined";
}
__name(isPublicJWK, "isPublicJWK");
function isSecretJWK(key) {
	return isJWK(key) && key.kty === "oct" && typeof key.k === "string";
}
__name(isSecretJWK, "isSecretJWK");
function subtleMapping(jwk) {
	let algorithm;
	let keyUsages;
	switch (jwk.kty) {
		case "RSA": {
			switch (jwk.alg) {
				case "PS256":
				case "PS384":
				case "PS512":
					algorithm = { name: "RSA-PSS", hash: `SHA-${jwk.alg.slice(-3)}` };
					keyUsages = jwk.d ? ["sign"] : ["verify"];
					break;
				case "RS256":
				case "RS384":
				case "RS512":
					algorithm = {
						name: "RSASSA-PKCS1-v1_5",
						hash: `SHA-${jwk.alg.slice(-3)}`,
					};
					keyUsages = jwk.d ? ["sign"] : ["verify"];
					break;
				case "RSA-OAEP":
				case "RSA-OAEP-256":
				case "RSA-OAEP-384":
				case "RSA-OAEP-512":
					algorithm = {
						name: "RSA-OAEP",
						hash: `SHA-${parseInt(jwk.alg.slice(-3), 10) || 1}`,
					};
					keyUsages = jwk.d ? ["decrypt", "unwrapKey"] : ["encrypt", "wrapKey"];
					break;
				default:
					throw new JOSENotSupported(
						'Invalid or unsupported JWK "alg" (Algorithm) Parameter value',
					);
			}
			break;
		}
		case "EC": {
			switch (jwk.alg) {
				case "ES256":
					algorithm = { name: "ECDSA", namedCurve: "P-256" };
					keyUsages = jwk.d ? ["sign"] : ["verify"];
					break;
				case "ES384":
					algorithm = { name: "ECDSA", namedCurve: "P-384" };
					keyUsages = jwk.d ? ["sign"] : ["verify"];
					break;
				case "ES512":
					algorithm = { name: "ECDSA", namedCurve: "P-521" };
					keyUsages = jwk.d ? ["sign"] : ["verify"];
					break;
				case "ECDH-ES":
				case "ECDH-ES+A128KW":
				case "ECDH-ES+A192KW":
				case "ECDH-ES+A256KW":
					algorithm = { name: "ECDH", namedCurve: jwk.crv };
					keyUsages = jwk.d ? ["deriveBits"] : [];
					break;
				default:
					throw new JOSENotSupported(
						'Invalid or unsupported JWK "alg" (Algorithm) Parameter value',
					);
			}
			break;
		}
		case "OKP": {
			switch (jwk.alg) {
				case "EdDSA":
					algorithm = { name: jwk.crv };
					keyUsages = jwk.d ? ["sign"] : ["verify"];
					break;
				case "ECDH-ES":
				case "ECDH-ES+A128KW":
				case "ECDH-ES+A192KW":
				case "ECDH-ES+A256KW":
					algorithm = { name: jwk.crv };
					keyUsages = jwk.d ? ["deriveBits"] : [];
					break;
				default:
					throw new JOSENotSupported(
						'Invalid or unsupported JWK "alg" (Algorithm) Parameter value',
					);
			}
			break;
		}
		default:
			throw new JOSENotSupported(
				'Invalid or unsupported JWK "kty" (Key Type) Parameter value',
			);
	}
	return { algorithm, keyUsages };
}
__name(subtleMapping, "subtleMapping");
var parse = /* @__PURE__ */ __name(async (jwk) => {
	if (!jwk.alg) {
		throw new TypeError(
			'"alg" argument is required when "jwk.alg" is not present',
		);
	}
	const { algorithm, keyUsages } = subtleMapping(jwk);
	const rest = [algorithm, jwk.ext ?? false, jwk.key_ops ?? keyUsages];
	const keyData = { ...jwk };
	delete keyData.alg;
	delete keyData.use;
	return webcrypto_default.subtle.importKey("jwk", keyData, ...rest);
}, "parse");
var jwk_to_key_default = parse;
var exportKeyValue = /* @__PURE__ */ __name((k) => decode(k), "exportKeyValue");
var privCache;
var pubCache;
var isKeyObject = /* @__PURE__ */ __name((key) => {
	return key?.[Symbol.toStringTag] === "KeyObject";
}, "isKeyObject");
var importAndCache = /* @__PURE__ */ __name(
	async (cache, key, jwk, alg, freeze = false) => {
		const cached = cache.get(key);
		if (cached?.[alg]) {
			return cached[alg];
		}
		const cryptoKey = await jwk_to_key_default({ ...jwk, alg });
		if (freeze) Object.freeze(key);
		if (!cached) {
			cache.set(key, { [alg]: cryptoKey });
		} else {
			cached[alg] = cryptoKey;
		}
		return cryptoKey;
	},
	"importAndCache",
);
var normalizePublicKey = /* @__PURE__ */ __name((key, alg) => {
	if (isKeyObject(key)) {
		const jwk = key.export({ format: "jwk" });
		delete jwk.d;
		delete jwk.dp;
		delete jwk.dq;
		delete jwk.p;
		delete jwk.q;
		delete jwk.qi;
		if (jwk.k) {
			return exportKeyValue(jwk.k);
		}
		pubCache || (pubCache = /* @__PURE__ */ new WeakMap());
		return importAndCache(pubCache, key, jwk, alg);
	}
	if (isJWK(key)) {
		if (key.k) return decode(key.k);
		pubCache || (pubCache = /* @__PURE__ */ new WeakMap());
		const cryptoKey = importAndCache(pubCache, key, key, alg, true);
		return cryptoKey;
	}
	return key;
}, "normalizePublicKey");
var normalizePrivateKey = /* @__PURE__ */ __name((key, alg) => {
	if (isKeyObject(key)) {
		const jwk = key.export({ format: "jwk" });
		if (jwk.k) {
			return exportKeyValue(jwk.k);
		}
		privCache || (privCache = /* @__PURE__ */ new WeakMap());
		return importAndCache(privCache, key, jwk, alg);
	}
	if (isJWK(key)) {
		if (key.k) return decode(key.k);
		privCache || (privCache = /* @__PURE__ */ new WeakMap());
		const cryptoKey = importAndCache(privCache, key, key, alg, true);
		return cryptoKey;
	}
	return key;
}, "normalizePrivateKey");
var normalize_key_default = { normalizePublicKey, normalizePrivateKey };
async function importJWK(jwk, alg) {
	if (!isObject(jwk)) {
		throw new TypeError("JWK must be an object");
	}
	alg || (alg = jwk.alg);
	switch (jwk.kty) {
		case "oct":
			if (typeof jwk.k !== "string" || !jwk.k) {
				throw new TypeError('missing "k" (Key Value) Parameter value');
			}
			return decode(jwk.k);
		case "RSA":
			if (jwk.oth !== void 0) {
				throw new JOSENotSupported(
					'RSA JWK "oth" (Other Primes Info) Parameter value is not supported',
				);
			}
		case "EC":
		case "OKP":
			return jwk_to_key_default({ ...jwk, alg });
		default:
			throw new JOSENotSupported(
				'Unsupported "kty" (Key Type) Parameter value',
			);
	}
}
__name(importJWK, "importJWK");
var tag = /* @__PURE__ */ __name((key) => key?.[Symbol.toStringTag], "tag");
var jwkMatchesOp = /* @__PURE__ */ __name((alg, key, usage) => {
	if (key.use !== void 0 && key.use !== "sig") {
		throw new TypeError(
			"Invalid key for this operation, when present its use must be sig",
		);
	}
	if (key.key_ops !== void 0 && key.key_ops.includes?.(usage) !== true) {
		throw new TypeError(
			`Invalid key for this operation, when present its key_ops must include ${usage}`,
		);
	}
	if (key.alg !== void 0 && key.alg !== alg) {
		throw new TypeError(
			`Invalid key for this operation, when present its alg must be ${alg}`,
		);
	}
	return true;
}, "jwkMatchesOp");
var symmetricTypeCheck = /* @__PURE__ */ __name((alg, key, usage, allowJwk) => {
	if (key instanceof Uint8Array) return;
	if (allowJwk && isJWK(key)) {
		if (isSecretJWK(key) && jwkMatchesOp(alg, key, usage)) return;
		throw new TypeError(
			`JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present`,
		);
	}
	if (!is_key_like_default(key)) {
		throw new TypeError(
			withAlg(
				alg,
				key,
				...types,
				"Uint8Array",
				allowJwk ? "JSON Web Key" : null,
			),
		);
	}
	if (key.type !== "secret") {
		throw new TypeError(
			`${tag(key)} instances for symmetric algorithms must be of type "secret"`,
		);
	}
}, "symmetricTypeCheck");
var asymmetricTypeCheck = /* @__PURE__ */ __name(
	(alg, key, usage, allowJwk) => {
		if (allowJwk && isJWK(key)) {
			switch (usage) {
				case "sign":
					if (isPrivateJWK(key) && jwkMatchesOp(alg, key, usage)) return;
					throw new TypeError(
						`JSON Web Key for this operation be a private JWK`,
					);
				case "verify":
					if (isPublicJWK(key) && jwkMatchesOp(alg, key, usage)) return;
					throw new TypeError(
						`JSON Web Key for this operation be a public JWK`,
					);
			}
		}
		if (!is_key_like_default(key)) {
			throw new TypeError(
				withAlg(alg, key, ...types, allowJwk ? "JSON Web Key" : null),
			);
		}
		if (key.type === "secret") {
			throw new TypeError(
				`${tag(key)} instances for asymmetric algorithms must not be of type "secret"`,
			);
		}
		if (usage === "sign" && key.type === "public") {
			throw new TypeError(
				`${tag(key)} instances for asymmetric algorithm signing must be of type "private"`,
			);
		}
		if (usage === "decrypt" && key.type === "public") {
			throw new TypeError(
				`${tag(key)} instances for asymmetric algorithm decryption must be of type "private"`,
			);
		}
		if (key.algorithm && usage === "verify" && key.type === "private") {
			throw new TypeError(
				`${tag(key)} instances for asymmetric algorithm verifying must be of type "public"`,
			);
		}
		if (key.algorithm && usage === "encrypt" && key.type === "private") {
			throw new TypeError(
				`${tag(key)} instances for asymmetric algorithm encryption must be of type "public"`,
			);
		}
	},
	"asymmetricTypeCheck",
);
function checkKeyType(allowJwk, alg, key, usage) {
	const symmetric =
		alg.startsWith("HS") ||
		alg === "dir" ||
		alg.startsWith("PBES2") ||
		/^A\d{3}(?:GCM)?KW$/.test(alg);
	if (symmetric) {
		symmetricTypeCheck(alg, key, usage, allowJwk);
	} else {
		asymmetricTypeCheck(alg, key, usage, allowJwk);
	}
}
__name(checkKeyType, "checkKeyType");
var check_key_type_default = checkKeyType.bind(void 0, false);
var checkKeyTypeWithJwk = checkKeyType.bind(void 0, true);
function validateCrit(
	Err,
	recognizedDefault,
	recognizedOption,
	protectedHeader,
	joseHeader,
) {
	if (joseHeader.crit !== void 0 && protectedHeader?.crit === void 0) {
		throw new Err(
			'"crit" (Critical) Header Parameter MUST be integrity protected',
		);
	}
	if (!protectedHeader || protectedHeader.crit === void 0) {
		return /* @__PURE__ */ new Set();
	}
	if (
		!Array.isArray(protectedHeader.crit) ||
		protectedHeader.crit.length === 0 ||
		protectedHeader.crit.some(
			(input) => typeof input !== "string" || input.length === 0,
		)
	) {
		throw new Err(
			'"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present',
		);
	}
	let recognized;
	if (recognizedOption !== void 0) {
		recognized = new Map([
			...Object.entries(recognizedOption),
			...recognizedDefault.entries(),
		]);
	} else {
		recognized = recognizedDefault;
	}
	for (const parameter of protectedHeader.crit) {
		if (!recognized.has(parameter)) {
			throw new JOSENotSupported(
				`Extension Header Parameter "${parameter}" is not recognized`,
			);
		}
		if (joseHeader[parameter] === void 0) {
			throw new Err(`Extension Header Parameter "${parameter}" is missing`);
		}
		if (recognized.get(parameter) && protectedHeader[parameter] === void 0) {
			throw new Err(
				`Extension Header Parameter "${parameter}" MUST be integrity protected`,
			);
		}
	}
	return new Set(protectedHeader.crit);
}
__name(validateCrit, "validateCrit");
var validate_crit_default = validateCrit;
var validateAlgorithms = /* @__PURE__ */ __name((option, algorithms) => {
	if (
		algorithms !== void 0 &&
		(!Array.isArray(algorithms) ||
			algorithms.some((s) => typeof s !== "string"))
	) {
		throw new TypeError(`"${option}" option must be an array of strings`);
	}
	if (!algorithms) {
		return;
	}
	return new Set(algorithms);
}, "validateAlgorithms");
var validate_algorithms_default = validateAlgorithms;
function subtleDsa(alg, algorithm) {
	const hash = `SHA-${alg.slice(-3)}`;
	switch (alg) {
		case "HS256":
		case "HS384":
		case "HS512":
			return { hash, name: "HMAC" };
		case "PS256":
		case "PS384":
		case "PS512":
			return { hash, name: "RSA-PSS", saltLength: alg.slice(-3) >> 3 };
		case "RS256":
		case "RS384":
		case "RS512":
			return { hash, name: "RSASSA-PKCS1-v1_5" };
		case "ES256":
		case "ES384":
		case "ES512":
			return { hash, name: "ECDSA", namedCurve: algorithm.namedCurve };
		case "EdDSA":
			return { name: algorithm.name };
		default:
			throw new JOSENotSupported(
				`alg ${alg} is not supported either by JOSE or your javascript runtime`,
			);
	}
}
__name(subtleDsa, "subtleDsa");
async function getCryptoKey(alg, key, usage) {
	if (usage === "sign") {
		key = await normalize_key_default.normalizePrivateKey(key, alg);
	}
	if (usage === "verify") {
		key = await normalize_key_default.normalizePublicKey(key, alg);
	}
	if (isCryptoKey(key)) {
		checkSigCryptoKey(key, alg, usage);
		return key;
	}
	if (key instanceof Uint8Array) {
		if (!alg.startsWith("HS")) {
			throw new TypeError(invalid_key_input_default(key, ...types));
		}
		return webcrypto_default.subtle.importKey(
			"raw",
			key,
			{ hash: `SHA-${alg.slice(-3)}`, name: "HMAC" },
			false,
			[usage],
		);
	}
	throw new TypeError(
		invalid_key_input_default(key, ...types, "Uint8Array", "JSON Web Key"),
	);
}
__name(getCryptoKey, "getCryptoKey");
var verify = /* @__PURE__ */ __name(async (alg, key, signature, data) => {
	const cryptoKey = await getCryptoKey(alg, key, "verify");
	check_key_length_default(alg, cryptoKey);
	const algorithm = subtleDsa(alg, cryptoKey.algorithm);
	try {
		return await webcrypto_default.subtle.verify(
			algorithm,
			cryptoKey,
			signature,
			data,
		);
	} catch {
		return false;
	}
}, "verify");
var verify_default = verify;
async function flattenedVerify(jws, key, options) {
	if (!isObject(jws)) {
		throw new JWSInvalid("Flattened JWS must be an object");
	}
	if (jws.protected === void 0 && jws.header === void 0) {
		throw new JWSInvalid(
			'Flattened JWS must have either of the "protected" or "header" members',
		);
	}
	if (jws.protected !== void 0 && typeof jws.protected !== "string") {
		throw new JWSInvalid("JWS Protected Header incorrect type");
	}
	if (jws.payload === void 0) {
		throw new JWSInvalid("JWS Payload missing");
	}
	if (typeof jws.signature !== "string") {
		throw new JWSInvalid("JWS Signature missing or incorrect type");
	}
	if (jws.header !== void 0 && !isObject(jws.header)) {
		throw new JWSInvalid("JWS Unprotected Header incorrect type");
	}
	let parsedProt = {};
	if (jws.protected) {
		try {
			const protectedHeader = decode(jws.protected);
			parsedProt = JSON.parse(decoder.decode(protectedHeader));
		} catch {
			throw new JWSInvalid("JWS Protected Header is invalid");
		}
	}
	if (!is_disjoint_default(parsedProt, jws.header)) {
		throw new JWSInvalid(
			"JWS Protected and JWS Unprotected Header Parameter names must be disjoint",
		);
	}
	const joseHeader = {
		...parsedProt,
		...jws.header,
	};
	const extensions = validate_crit_default(
		JWSInvalid,
		/* @__PURE__ */ new Map([["b64", true]]),
		options?.crit,
		parsedProt,
		joseHeader,
	);
	let b64 = true;
	if (extensions.has("b64")) {
		b64 = parsedProt.b64;
		if (typeof b64 !== "boolean") {
			throw new JWSInvalid(
				'The "b64" (base64url-encode payload) Header Parameter must be a boolean',
			);
		}
	}
	const { alg } = joseHeader;
	if (typeof alg !== "string" || !alg) {
		throw new JWSInvalid(
			'JWS "alg" (Algorithm) Header Parameter missing or invalid',
		);
	}
	const algorithms =
		options && validate_algorithms_default("algorithms", options.algorithms);
	if (algorithms && !algorithms.has(alg)) {
		throw new JOSEAlgNotAllowed(
			'"alg" (Algorithm) Header Parameter value not allowed',
		);
	}
	if (b64) {
		if (typeof jws.payload !== "string") {
			throw new JWSInvalid("JWS Payload must be a string");
		}
	} else if (
		typeof jws.payload !== "string" &&
		!(jws.payload instanceof Uint8Array)
	) {
		throw new JWSInvalid(
			"JWS Payload must be a string or an Uint8Array instance",
		);
	}
	let resolvedKey = false;
	if (typeof key === "function") {
		key = await key(parsedProt, jws);
		resolvedKey = true;
		checkKeyTypeWithJwk(alg, key, "verify");
		if (isJWK(key)) {
			key = await importJWK(key, alg);
		}
	} else {
		checkKeyTypeWithJwk(alg, key, "verify");
	}
	const data = concat(
		encoder.encode(jws.protected ?? ""),
		encoder.encode("."),
		typeof jws.payload === "string" ? encoder.encode(jws.payload) : jws.payload,
	);
	let signature;
	try {
		signature = decode(jws.signature);
	} catch {
		throw new JWSInvalid("Failed to base64url decode the signature");
	}
	const verified = await verify_default(alg, key, signature, data);
	if (!verified) {
		throw new JWSSignatureVerificationFailed();
	}
	let payload;
	if (b64) {
		try {
			payload = decode(jws.payload);
		} catch {
			throw new JWSInvalid("Failed to base64url decode the payload");
		}
	} else if (typeof jws.payload === "string") {
		payload = encoder.encode(jws.payload);
	} else {
		payload = jws.payload;
	}
	const result = { payload };
	if (jws.protected !== void 0) {
		result.protectedHeader = parsedProt;
	}
	if (jws.header !== void 0) {
		result.unprotectedHeader = jws.header;
	}
	if (resolvedKey) {
		return { ...result, key };
	}
	return result;
}
__name(flattenedVerify, "flattenedVerify");
async function compactVerify(jws, key, options) {
	if (jws instanceof Uint8Array) {
		jws = decoder.decode(jws);
	}
	if (typeof jws !== "string") {
		throw new JWSInvalid("Compact JWS must be a string or Uint8Array");
	}
	const {
		0: protectedHeader,
		1: payload,
		2: signature,
		length,
	} = jws.split(".");
	if (length !== 3) {
		throw new JWSInvalid("Invalid Compact JWS");
	}
	const verified = await flattenedVerify(
		{ payload, protected: protectedHeader, signature },
		key,
		options,
	);
	const result = {
		payload: verified.payload,
		protectedHeader: verified.protectedHeader,
	};
	if (typeof key === "function") {
		return { ...result, key: verified.key };
	}
	return result;
}
__name(compactVerify, "compactVerify");
var epoch_default = /* @__PURE__ */ __name(
	(date) => Math.floor(date.getTime() / 1e3),
	"epoch_default",
);
var minute = 60;
var hour = minute * 60;
var day = hour * 24;
var week = day * 7;
var year = day * 365.25;
var REGEX =
	/^(\+|-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
var secs_default = /* @__PURE__ */ __name((str) => {
	const matched = REGEX.exec(str);
	if (!matched || (matched[4] && matched[1])) {
		throw new TypeError("Invalid time period format");
	}
	const value = parseFloat(matched[2]);
	const unit = matched[3].toLowerCase();
	let numericDate;
	switch (unit) {
		case "sec":
		case "secs":
		case "second":
		case "seconds":
		case "s":
			numericDate = Math.round(value);
			break;
		case "minute":
		case "minutes":
		case "min":
		case "mins":
		case "m":
			numericDate = Math.round(value * minute);
			break;
		case "hour":
		case "hours":
		case "hr":
		case "hrs":
		case "h":
			numericDate = Math.round(value * hour);
			break;
		case "day":
		case "days":
		case "d":
			numericDate = Math.round(value * day);
			break;
		case "week":
		case "weeks":
		case "w":
			numericDate = Math.round(value * week);
			break;
		default:
			numericDate = Math.round(value * year);
			break;
	}
	if (matched[1] === "-" || matched[4] === "ago") {
		return -numericDate;
	}
	return numericDate;
}, "secs_default");
var normalizeTyp = /* @__PURE__ */ __name(
	(value) => value.toLowerCase().replace(/^application\//, ""),
	"normalizeTyp",
);
var checkAudiencePresence = /* @__PURE__ */ __name((audPayload, audOption) => {
	if (typeof audPayload === "string") {
		return audOption.includes(audPayload);
	}
	if (Array.isArray(audPayload)) {
		return audOption.some(Set.prototype.has.bind(new Set(audPayload)));
	}
	return false;
}, "checkAudiencePresence");
var jwt_claims_set_default = /* @__PURE__ */ __name(
	(protectedHeader, encodedPayload, options = {}) => {
		let payload;
		try {
			payload = JSON.parse(decoder.decode(encodedPayload));
		} catch {}
		if (!isObject(payload)) {
			throw new JWTInvalid("JWT Claims Set must be a top-level JSON object");
		}
		const { typ } = options;
		if (
			typ &&
			(typeof protectedHeader.typ !== "string" ||
				normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ))
		) {
			throw new JWTClaimValidationFailed(
				'unexpected "typ" JWT header value',
				payload,
				"typ",
				"check_failed",
			);
		}
		const {
			requiredClaims = [],
			issuer,
			subject: subject2,
			audience,
			maxTokenAge,
		} = options;
		const presenceCheck = [...requiredClaims];
		if (maxTokenAge !== void 0) presenceCheck.push("iat");
		if (audience !== void 0) presenceCheck.push("aud");
		if (subject2 !== void 0) presenceCheck.push("sub");
		if (issuer !== void 0) presenceCheck.push("iss");
		for (const claim of new Set(presenceCheck.reverse())) {
			if (!(claim in payload)) {
				throw new JWTClaimValidationFailed(
					`missing required "${claim}" claim`,
					payload,
					claim,
					"missing",
				);
			}
		}
		if (
			issuer &&
			!(Array.isArray(issuer) ? issuer : [issuer]).includes(payload.iss)
		) {
			throw new JWTClaimValidationFailed(
				'unexpected "iss" claim value',
				payload,
				"iss",
				"check_failed",
			);
		}
		if (subject2 && payload.sub !== subject2) {
			throw new JWTClaimValidationFailed(
				'unexpected "sub" claim value',
				payload,
				"sub",
				"check_failed",
			);
		}
		if (
			audience &&
			!checkAudiencePresence(
				payload.aud,
				typeof audience === "string" ? [audience] : audience,
			)
		) {
			throw new JWTClaimValidationFailed(
				'unexpected "aud" claim value',
				payload,
				"aud",
				"check_failed",
			);
		}
		let tolerance;
		switch (typeof options.clockTolerance) {
			case "string":
				tolerance = secs_default(options.clockTolerance);
				break;
			case "number":
				tolerance = options.clockTolerance;
				break;
			case "undefined":
				tolerance = 0;
				break;
			default:
				throw new TypeError("Invalid clockTolerance option type");
		}
		const { currentDate } = options;
		const now = epoch_default(currentDate || /* @__PURE__ */ new Date());
		if (
			(payload.iat !== void 0 || maxTokenAge) &&
			typeof payload.iat !== "number"
		) {
			throw new JWTClaimValidationFailed(
				'"iat" claim must be a number',
				payload,
				"iat",
				"invalid",
			);
		}
		if (payload.nbf !== void 0) {
			if (typeof payload.nbf !== "number") {
				throw new JWTClaimValidationFailed(
					'"nbf" claim must be a number',
					payload,
					"nbf",
					"invalid",
				);
			}
			if (payload.nbf > now + tolerance) {
				throw new JWTClaimValidationFailed(
					'"nbf" claim timestamp check failed',
					payload,
					"nbf",
					"check_failed",
				);
			}
		}
		if (payload.exp !== void 0) {
			if (typeof payload.exp !== "number") {
				throw new JWTClaimValidationFailed(
					'"exp" claim must be a number',
					payload,
					"exp",
					"invalid",
				);
			}
			if (payload.exp <= now - tolerance) {
				throw new JWTExpired(
					'"exp" claim timestamp check failed',
					payload,
					"exp",
					"check_failed",
				);
			}
		}
		if (maxTokenAge) {
			const age = now - payload.iat;
			const max =
				typeof maxTokenAge === "number"
					? maxTokenAge
					: secs_default(maxTokenAge);
			if (age - tolerance > max) {
				throw new JWTExpired(
					'"iat" claim timestamp check failed (too far in the past)',
					payload,
					"iat",
					"check_failed",
				);
			}
			if (age < 0 - tolerance) {
				throw new JWTClaimValidationFailed(
					'"iat" claim timestamp check failed (it should be in the past)',
					payload,
					"iat",
					"check_failed",
				);
			}
		}
		return payload;
	},
	"jwt_claims_set_default",
);
async function jwtVerify(jwt, key, options) {
	const verified = await compactVerify(jwt, key, options);
	if (
		verified.protectedHeader.crit?.includes("b64") &&
		verified.protectedHeader.b64 === false
	) {
		throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
	}
	const payload = jwt_claims_set_default(
		verified.protectedHeader,
		verified.payload,
		options,
	);
	const result = { payload, protectedHeader: verified.protectedHeader };
	if (typeof key === "function") {
		return { ...result, key: verified.key };
	}
	return result;
}
__name(jwtVerify, "jwtVerify");
function getKtyFromAlg(alg) {
	switch (typeof alg === "string" && alg.slice(0, 2)) {
		case "RS":
		case "PS":
			return "RSA";
		case "ES":
			return "EC";
		case "Ed":
			return "OKP";
		default:
			throw new JOSENotSupported(
				'Unsupported "alg" value for a JSON Web Key Set',
			);
	}
}
__name(getKtyFromAlg, "getKtyFromAlg");
function isJWKSLike(jwks) {
	return (
		jwks &&
		typeof jwks === "object" &&
		Array.isArray(jwks.keys) &&
		jwks.keys.every(isJWKLike)
	);
}
__name(isJWKSLike, "isJWKSLike");
function isJWKLike(key) {
	return isObject(key);
}
__name(isJWKLike, "isJWKLike");
function clone(obj) {
	if (typeof structuredClone === "function") {
		return structuredClone(obj);
	}
	return JSON.parse(JSON.stringify(obj));
}
__name(clone, "clone");
var LocalJWKSet = class {
	static {
		__name(this, "LocalJWKSet");
	}
	constructor(jwks) {
		this._cached = /* @__PURE__ */ new WeakMap();
		if (!isJWKSLike(jwks)) {
			throw new JWKSInvalid("JSON Web Key Set malformed");
		}
		this._jwks = clone(jwks);
	}
	async getKey(protectedHeader, token) {
		const { alg, kid } = { ...protectedHeader, ...token?.header };
		const kty = getKtyFromAlg(alg);
		const candidates = this._jwks.keys.filter((jwk2) => {
			let candidate = kty === jwk2.kty;
			if (candidate && typeof kid === "string") {
				candidate = kid === jwk2.kid;
			}
			if (candidate && typeof jwk2.alg === "string") {
				candidate = alg === jwk2.alg;
			}
			if (candidate && typeof jwk2.use === "string") {
				candidate = jwk2.use === "sig";
			}
			if (candidate && Array.isArray(jwk2.key_ops)) {
				candidate = jwk2.key_ops.includes("verify");
			}
			if (candidate && alg === "EdDSA") {
				candidate = jwk2.crv === "Ed25519" || jwk2.crv === "Ed448";
			}
			if (candidate) {
				switch (alg) {
					case "ES256":
						candidate = jwk2.crv === "P-256";
						break;
					case "ES256K":
						candidate = jwk2.crv === "secp256k1";
						break;
					case "ES384":
						candidate = jwk2.crv === "P-384";
						break;
					case "ES512":
						candidate = jwk2.crv === "P-521";
						break;
				}
			}
			return candidate;
		});
		const { 0: jwk, length } = candidates;
		if (length === 0) {
			throw new JWKSNoMatchingKey();
		}
		if (length !== 1) {
			const error3 = new JWKSMultipleMatchingKeys();
			const { _cached } = this;
			error3[Symbol.asyncIterator] = async function* () {
				for (const jwk2 of candidates) {
					try {
						yield await importWithAlgCache(_cached, jwk2, alg);
					} catch {}
				}
			};
			throw error3;
		}
		return importWithAlgCache(this._cached, jwk, alg);
	}
};
async function importWithAlgCache(cache, jwk, alg) {
	const cached = cache.get(jwk) || cache.set(jwk, {}).get(jwk);
	if (cached[alg] === void 0) {
		const key = await importJWK({ ...jwk, ext: true }, alg);
		if (key instanceof Uint8Array || key.type !== "public") {
			throw new JWKSInvalid("JSON Web Key Set members must be public keys");
		}
		cached[alg] = key;
	}
	return cached[alg];
}
__name(importWithAlgCache, "importWithAlgCache");
function createLocalJWKSet(jwks) {
	const set = new LocalJWKSet(jwks);
	const localJWKSet = /* @__PURE__ */ __name(
		async (protectedHeader, token) => set.getKey(protectedHeader, token),
		"localJWKSet",
	);
	Object.defineProperties(localJWKSet, {
		jwks: {
			value: /* @__PURE__ */ __name(() => clone(set._jwks), "value"),
			enumerable: true,
			configurable: false,
			writable: false,
		},
	});
	return localJWKSet;
}
__name(createLocalJWKSet, "createLocalJWKSet");
var exports_base64url = {};
__export(exports_base64url, {
	encode: /* @__PURE__ */ __name(() => encode2, "encode"),
	decode: /* @__PURE__ */ __name(() => decode2, "decode"),
});
var encode2 = encode;
var decode2 = decode;
function decodeJwt(jwt) {
	if (typeof jwt !== "string")
		throw new JWTInvalid(
			"JWTs must use Compact JWS serialization, JWT must be a string",
		);
	const { 1: payload, length } = jwt.split(".");
	if (length === 5)
		throw new JWTInvalid(
			"Only JWTs using Compact JWS serialization can be decoded",
		);
	if (length !== 3) throw new JWTInvalid("Invalid JWT");
	if (!payload) throw new JWTInvalid("JWTs must contain a payload");
	let decoded;
	try {
		decoded = decode2(payload);
	} catch {
		throw new JWTInvalid("Failed to base64url decode the payload");
	}
	let result;
	try {
		result = JSON.parse(decoder.decode(decoded));
	} catch {
		throw new JWTInvalid("Failed to parse the decoded payload as JSON");
	}
	if (!isObject(result)) throw new JWTInvalid("Invalid JWT Claims Set");
	return result;
}
__name(decodeJwt, "decodeJwt");
var InvalidSubjectError = class extends Error {
	static {
		__name(this, "InvalidSubjectError");
	}
	constructor() {
		super("Invalid subject");
	}
};
var InvalidRefreshTokenError = class extends Error {
	static {
		__name(this, "InvalidRefreshTokenError");
	}
	constructor() {
		super("Invalid refresh token");
	}
};
var InvalidAccessTokenError = class extends Error {
	static {
		__name(this, "InvalidAccessTokenError");
	}
	constructor() {
		super("Invalid access token");
	}
};
var InvalidAuthorizationCodeError = class extends Error {
	static {
		__name(this, "InvalidAuthorizationCodeError");
	}
	constructor() {
		super("Invalid authorization code");
	}
};
function generateVerifier(length) {
	const buffer = new Uint8Array(length);
	crypto.getRandomValues(buffer);
	return exports_base64url.encode(buffer);
}
__name(generateVerifier, "generateVerifier");
async function generateChallenge(verifier, method) {
	if (method === "plain") return verifier;
	const encoder2 = new TextEncoder();
	const data = encoder2.encode(verifier);
	const hash = await crypto.subtle.digest("SHA-256", data);
	return exports_base64url.encode(new Uint8Array(hash));
}
__name(generateChallenge, "generateChallenge");
async function generatePKCE(length = 64) {
	if (length < 43 || length > 128) {
		throw new Error(
			"Code verifier length must be between 43 and 128 characters",
		);
	}
	const verifier = generateVerifier(length);
	const challenge = await generateChallenge(verifier, "S256");
	return {
		verifier,
		challenge,
		method: "S256",
	};
}
__name(generatePKCE, "generatePKCE");
function createClient(input) {
	const jwksCache = /* @__PURE__ */ new Map();
	const issuerCache = /* @__PURE__ */ new Map();
	const issuer = input.issuer || process.env.OPENAUTH_ISSUER;
	if (!issuer) throw new Error("No issuer");
	const f = input.fetch ?? fetch;
	async function getIssuer() {
		const cached = issuerCache.get(issuer);
		if (cached) return cached;
		const wellKnown = await (f || fetch)(
			`${issuer}/.well-known/oauth-authorization-server`,
		).then((r) => r.json());
		issuerCache.set(issuer, wellKnown);
		return wellKnown;
	}
	__name(getIssuer, "getIssuer");
	async function getJWKS() {
		const wk = await getIssuer();
		const cached = jwksCache.get(issuer);
		if (cached) return cached;
		const keyset = await (f || fetch)(wk.jwks_uri).then((r) => r.json());
		const result2 = createLocalJWKSet(keyset);
		jwksCache.set(issuer, result2);
		return result2;
	}
	__name(getJWKS, "getJWKS");
	const result = {
		async authorize(redirectURI, response, opts) {
			const result2 = new URL(issuer + "/authorize");
			const challenge = {
				state: crypto.randomUUID(),
			};
			result2.searchParams.set("client_id", input.clientID);
			result2.searchParams.set("redirect_uri", redirectURI);
			result2.searchParams.set("response_type", response);
			result2.searchParams.set("state", challenge.state);
			if (opts?.provider) result2.searchParams.set("provider", opts.provider);
			if (opts?.pkce && response === "code") {
				const pkce = await generatePKCE();
				result2.searchParams.set("code_challenge_method", "S256");
				result2.searchParams.set("code_challenge", pkce.challenge);
				challenge.verifier = pkce.verifier;
			}
			return {
				challenge,
				url: result2.toString(),
			};
		},
		async pkce(redirectURI, opts) {
			const result2 = new URL(issuer + "/authorize");
			if (opts?.provider) result2.searchParams.set("provider", opts.provider);
			result2.searchParams.set("client_id", input.clientID);
			result2.searchParams.set("redirect_uri", redirectURI);
			result2.searchParams.set("response_type", "code");
			const pkce = await generatePKCE();
			result2.searchParams.set("code_challenge_method", "S256");
			result2.searchParams.set("code_challenge", pkce.challenge);
			return [pkce.verifier, result2.toString()];
		},
		async exchange(code, redirectURI, verifier) {
			const tokens = await f(issuer + "/token", {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					code,
					redirect_uri: redirectURI,
					grant_type: "authorization_code",
					client_id: input.clientID,
					code_verifier: verifier || "",
				}).toString(),
			});
			const json = await tokens.json();
			if (!tokens.ok) {
				return {
					err: new InvalidAuthorizationCodeError(),
				};
			}
			return {
				err: false,
				tokens: {
					access: json.access_token,
					refresh: json.refresh_token,
					expiresIn: json.expires_in,
				},
			};
		},
		async refresh(refresh, opts) {
			if (opts && opts.access) {
				const decoded = decodeJwt(opts.access);
				if (!decoded) {
					return {
						err: new InvalidAccessTokenError(),
					};
				}
				if ((decoded.exp || 0) > Date.now() / 1e3 + 30) {
					return {
						err: false,
					};
				}
			}
			const tokens = await f(issuer + "/token", {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					grant_type: "refresh_token",
					refresh_token: refresh,
				}).toString(),
			});
			const json = await tokens.json();
			if (!tokens.ok) {
				return {
					err: new InvalidRefreshTokenError(),
				};
			}
			return {
				err: false,
				tokens: {
					access: json.access_token,
					refresh: json.refresh_token,
					expiresIn: json.expires_in,
				},
			};
		},
		async verify(subjects, token, options) {
			const jwks = await getJWKS();
			try {
				const result2 = await jwtVerify(token, jwks, {
					issuer,
				});
				const validated = await subjects[result2.payload.type][
					"~standard"
				].validate(result2.payload.properties);
				if (!validated.issues && result2.payload.mode === "access")
					return {
						aud: result2.payload.aud,
						subject: {
							type: result2.payload.type,
							properties: validated.value,
						},
					};
				return {
					err: new InvalidSubjectError(),
				};
			} catch (e) {
				if (e instanceof exports_errors.JWTExpired && options?.refresh) {
					const refreshed = await this.refresh(options.refresh);
					if (refreshed.err) return refreshed;
					const verified = await result.verify(
						subjects,
						refreshed.tokens.access,
						{
							refresh: refreshed.tokens.refresh,
							issuer,
							fetch: options?.fetch,
						},
					);
					if (verified.err) return verified;
					verified.tokens = refreshed.tokens;
					return verified;
				}
				return {
					err: new InvalidAccessTokenError(),
				};
			}
		},
	};
	return result;
}
__name(createClient, "createClient");
var COOKIE_NAME = "oauth_client_id";
var createClient2 = /* @__PURE__ */ __name(
	({ clientID, issuer }) =>
		createClient({
			clientID,
			issuer,
			fetch(input, init) {
				const header = new Headers(init?.headers);
				header.append("Cookie", `${COOKIE_NAME}=${clientID}`);
				return fetch(input, {
					...init,
					headers: header,
				});
			},
		}),
	"createClient2",
);
var store$4;
function getGlobalConfig(config$1) {
	return {
		lang: config$1?.lang ?? store$4?.lang,
		message: config$1?.message,
		abortEarly: config$1?.abortEarly ?? store$4?.abortEarly,
		abortPipeEarly: config$1?.abortPipeEarly ?? store$4?.abortPipeEarly,
	};
}
__name(getGlobalConfig, "getGlobalConfig");
var store$3;
function getGlobalMessage(lang) {
	return store$3?.get(lang);
}
__name(getGlobalMessage, "getGlobalMessage");
var store$2;
function getSchemaMessage(lang) {
	return store$2?.get(lang);
}
__name(getSchemaMessage, "getSchemaMessage");
var store$1;
function getSpecificMessage(reference, lang) {
	return store$1?.get(reference)?.get(lang);
}
__name(getSpecificMessage, "getSpecificMessage");
function _stringify(input) {
	const type = typeof input;
	if (type === "string") return `"${input}"`;
	if (type === "number" || type === "bigint" || type === "boolean")
		return `${input}`;
	if (type === "object" || type === "function")
		return (input && Object.getPrototypeOf(input)?.constructor?.name) ?? "null";
	return type;
}
__name(_stringify, "_stringify");
function _addIssue(context2, label, dataset, config$1, other) {
	const input = other && "input" in other ? other.input : dataset.value;
	const expected = other?.expected ?? context2.expects ?? null;
	const received = other?.received ?? /* @__PURE__ */ _stringify(input);
	const issue = {
		kind: context2.kind,
		type: context2.type,
		input,
		expected,
		received,
		message: `Invalid ${label}: ${expected ? `Expected ${expected} but r` : "R"}eceived ${received}`,
		requirement: context2.requirement,
		path: other?.path,
		issues: other?.issues,
		lang: config$1.lang,
		abortEarly: config$1.abortEarly,
		abortPipeEarly: config$1.abortPipeEarly,
	};
	const isSchema = context2.kind === "schema";
	const message$1 =
		other?.message ??
		context2.message ??
		/* @__PURE__ */ getSpecificMessage(context2.reference, issue.lang) ??
		(isSchema ? /* @__PURE__ */ getSchemaMessage(issue.lang) : null) ??
		config$1.message ??
		/* @__PURE__ */ getGlobalMessage(issue.lang);
	if (message$1 !== void 0)
		issue.message =
			typeof message$1 === "function" ? message$1(issue) : message$1;
	if (isSchema) dataset.typed = false;
	if (dataset.issues) dataset.issues.push(issue);
	else dataset.issues = [issue];
}
__name(_addIssue, "_addIssue");
function _getStandardProps(context2) {
	return {
		version: 1,
		vendor: "valibot",
		validate(value$1) {
			return context2["~run"](
				{ value: value$1 },
				/* @__PURE__ */ getGlobalConfig(),
			);
		},
	};
}
__name(_getStandardProps, "_getStandardProps");
function getFallback(schema, dataset, config$1) {
	return typeof schema.fallback === "function"
		? schema.fallback(dataset, config$1)
		: schema.fallback;
}
__name(getFallback, "getFallback");
function getDefault(schema, dataset, config$1) {
	return typeof schema.default === "function"
		? schema.default(dataset, config$1)
		: schema.default;
}
__name(getDefault, "getDefault");
function object(entries$1, message$1) {
	return {
		kind: "schema",
		type: "object",
		reference: object,
		expects: "Object",
		async: false,
		entries: entries$1,
		message: message$1,
		get "~standard"() {
			return /* @__PURE__ */ _getStandardProps(this);
		},
		"~run"(dataset, config$1) {
			const input = dataset.value;
			if (input && typeof input === "object") {
				dataset.typed = true;
				dataset.value = {};
				for (const key in this.entries) {
					const valueSchema = this.entries[key];
					if (
						key in input ||
						((valueSchema.type === "exact_optional" ||
							valueSchema.type === "optional" ||
							valueSchema.type === "nullish") &&
							valueSchema.default !== void 0)
					) {
						const value$1 =
							key in input
								? input[key]
								: /* @__PURE__ */ getDefault(valueSchema);
						const valueDataset = valueSchema["~run"](
							{ value: value$1 },
							config$1,
						);
						if (valueDataset.issues) {
							const pathItem = {
								type: "object",
								origin: "value",
								input,
								key,
								value: value$1,
							};
							for (const issue of valueDataset.issues) {
								if (issue.path) issue.path.unshift(pathItem);
								else issue.path = [pathItem];
								dataset.issues?.push(issue);
							}
							if (!dataset.issues) dataset.issues = valueDataset.issues;
							if (config$1.abortEarly) {
								dataset.typed = false;
								break;
							}
						}
						if (!valueDataset.typed) dataset.typed = false;
						dataset.value[key] = valueDataset.value;
					} else if (valueSchema.fallback !== void 0)
						dataset.value[key] = /* @__PURE__ */ getFallback(valueSchema);
					else if (
						valueSchema.type !== "exact_optional" &&
						valueSchema.type !== "optional" &&
						valueSchema.type !== "nullish"
					) {
						_addIssue(this, "key", dataset, config$1, {
							input: void 0,
							expected: `"${key}"`,
							path: [
								{
									type: "object",
									origin: "key",
									input,
									key,
									value: input[key],
								},
							],
						});
						if (config$1.abortEarly) break;
					}
				}
			} else _addIssue(this, "type", dataset, config$1);
			return dataset;
		},
	};
}
__name(object, "object");
function string(message$1) {
	return {
		kind: "schema",
		type: "string",
		reference: string,
		expects: "string",
		async: false,
		message: message$1,
		get "~standard"() {
			return /* @__PURE__ */ _getStandardProps(this);
		},
		"~run"(dataset, config$1) {
			if (typeof dataset.value === "string") dataset.typed = true;
			else _addIssue(this, "type", dataset, config$1);
			return dataset;
		},
	};
}
__name(string, "string");
var client = createClient2({
	clientID: process.env.PUBLIC_CLIENT_ID,
	issuer: process.env.PUBLIC_ISSUER,
});
var subject = createSubjects({
	user: object({
		id: string(),
	}),
});

// chunk-6apyt2n2.js
var entityKind = Symbol.for("drizzle:entityKind");
var hasOwnEntityKind = Symbol.for("drizzle:hasOwnEntityKind");
function is(value, type) {
	if (!value || typeof value !== "object") {
		return false;
	}
	if (value instanceof type) {
		return true;
	}
	if (!Object.hasOwn(type, entityKind)) {
		throw new Error(
			`Class "${type.name ?? "<unknown>"}" doesn't look like a Drizzle entity. If this is incorrect and the class is provided by Drizzle, please report this as a bug.`,
		);
	}
	let cls = Object.getPrototypeOf(value).constructor;
	if (cls) {
		while (cls) {
			if (entityKind in cls && cls[entityKind] === type[entityKind]) {
				return true;
			}
			cls = Object.getPrototypeOf(cls);
		}
	}
	return false;
}
__name(is, "is");
var Column = class {
	static {
		__name(this, "Column");
	}
	constructor(table3, config2) {
		this.table = table3;
		this.config = config2;
		this.name = config2.name;
		this.keyAsName = config2.keyAsName;
		this.notNull = config2.notNull;
		this.default = config2.default;
		this.defaultFn = config2.defaultFn;
		this.onUpdateFn = config2.onUpdateFn;
		this.hasDefault = config2.hasDefault;
		this.primary = config2.primaryKey;
		this.isUnique = config2.isUnique;
		this.uniqueName = config2.uniqueName;
		this.uniqueType = config2.uniqueType;
		this.dataType = config2.dataType;
		this.columnType = config2.columnType;
		this.generated = config2.generated;
		this.generatedIdentity = config2.generatedIdentity;
	}
	static [entityKind] = "Column";
	name;
	keyAsName;
	primary;
	notNull;
	default;
	defaultFn;
	onUpdateFn;
	hasDefault;
	isUnique;
	uniqueName;
	uniqueType;
	dataType;
	columnType;
	enumValues = void 0;
	generated = void 0;
	generatedIdentity = void 0;
	config;
	mapFromDriverValue(value) {
		return value;
	}
	mapToDriverValue(value) {
		return value;
	}
	shouldDisableInsert() {
		return (
			this.config.generated !== void 0 &&
			this.config.generated.type !== "byDefault"
		);
	}
};
var TableName = Symbol.for("drizzle:Name");
var Schema = Symbol.for("drizzle:Schema");
var Columns = Symbol.for("drizzle:Columns");
var ExtraConfigColumns = Symbol.for("drizzle:ExtraConfigColumns");
var OriginalName = Symbol.for("drizzle:OriginalName");
var BaseName = Symbol.for("drizzle:BaseName");
var IsAlias = Symbol.for("drizzle:IsAlias");
var ExtraConfigBuilder = Symbol.for("drizzle:ExtraConfigBuilder");
var IsDrizzleTable = Symbol.for("drizzle:IsDrizzleTable");
var Table = class {
	static {
		__name(this, "Table");
	}
	static [entityKind] = "Table";
	static Symbol = {
		Name: TableName,
		Schema,
		OriginalName,
		Columns,
		ExtraConfigColumns,
		BaseName,
		IsAlias,
		ExtraConfigBuilder,
	};
	[TableName];
	[OriginalName];
	[Schema];
	[Columns];
	[ExtraConfigColumns];
	[BaseName];
	[IsAlias] = false;
	[IsDrizzleTable] = true;
	[ExtraConfigBuilder] = void 0;
	constructor(name, schema, baseName) {
		this[TableName] = this[OriginalName] = name;
		this[Schema] = schema;
		this[BaseName] = baseName;
	}
};
function getTableName(table3) {
	return table3[TableName];
}
__name(getTableName, "getTableName");
function getTableUniqueName(table3) {
	return `${table3[Schema] ?? "public"}.${table3[TableName]}`;
}
__name(getTableUniqueName, "getTableUniqueName");
var ColumnBuilder = class {
	static {
		__name(this, "ColumnBuilder");
	}
	static [entityKind] = "ColumnBuilder";
	config;
	constructor(name, dataType, columnType) {
		this.config = {
			name,
			keyAsName: name === "",
			notNull: false,
			default: void 0,
			hasDefault: false,
			primaryKey: false,
			isUnique: false,
			uniqueName: void 0,
			uniqueType: void 0,
			dataType,
			columnType,
			generated: void 0,
		};
	}
	$type() {
		return this;
	}
	notNull() {
		this.config.notNull = true;
		return this;
	}
	default(value) {
		this.config.default = value;
		this.config.hasDefault = true;
		return this;
	}
	$defaultFn(fn) {
		this.config.defaultFn = fn;
		this.config.hasDefault = true;
		return this;
	}
	$default = this.$defaultFn;
	$onUpdateFn(fn) {
		this.config.onUpdateFn = fn;
		this.config.hasDefault = true;
		return this;
	}
	$onUpdate = this.$onUpdateFn;
	primaryKey() {
		this.config.primaryKey = true;
		this.config.notNull = true;
		return this;
	}
	setName(name) {
		if (this.config.name !== "") return;
		this.config.name = name;
	}
};
function iife(fn, ...args) {
	return fn(...args);
}
__name(iife, "iife");
function uniqueKeyName(table3, columns) {
	return `${table3[TableName]}_${columns.join("_")}_unique`;
}
__name(uniqueKeyName, "uniqueKeyName");
var PgColumn = class extends Column {
	static {
		__name(this, "PgColumn");
	}
	constructor(table3, config2) {
		if (!config2.uniqueName) {
			config2.uniqueName = uniqueKeyName(table3, [config2.name]);
		}
		super(table3, config2);
		this.table = table3;
	}
	static [entityKind] = "PgColumn";
};
var ExtraConfigColumn = class extends PgColumn {
	static {
		__name(this, "ExtraConfigColumn");
	}
	static [entityKind] = "ExtraConfigColumn";
	getSQLType() {
		return this.getSQLType();
	}
	indexConfig = {
		order: this.config.order ?? "asc",
		nulls: this.config.nulls ?? "last",
		opClass: this.config.opClass,
	};
	defaultConfig = {
		order: "asc",
		nulls: "last",
		opClass: void 0,
	};
	asc() {
		this.indexConfig.order = "asc";
		return this;
	}
	desc() {
		this.indexConfig.order = "desc";
		return this;
	}
	nullsFirst() {
		this.indexConfig.nulls = "first";
		return this;
	}
	nullsLast() {
		this.indexConfig.nulls = "last";
		return this;
	}
	op(opClass) {
		this.indexConfig.opClass = opClass;
		return this;
	}
};
var PgEnumObjectColumn = class extends PgColumn {
	static {
		__name(this, "PgEnumObjectColumn");
	}
	static [entityKind] = "PgEnumObjectColumn";
	enum;
	enumValues = this.config.enum.enumValues;
	constructor(table3, config2) {
		super(table3, config2);
		this.enum = config2.enum;
	}
	getSQLType() {
		return this.enum.enumName;
	}
};
var isPgEnumSym = Symbol.for("drizzle:isPgEnum");
function isPgEnum(obj) {
	return (
		!!obj &&
		typeof obj === "function" &&
		isPgEnumSym in obj &&
		obj[isPgEnumSym] === true
	);
}
__name(isPgEnum, "isPgEnum");
var PgEnumColumn = class extends PgColumn {
	static {
		__name(this, "PgEnumColumn");
	}
	static [entityKind] = "PgEnumColumn";
	enum = this.config.enum;
	enumValues = this.config.enum.enumValues;
	constructor(table3, config2) {
		super(table3, config2);
		this.enum = config2.enum;
	}
	getSQLType() {
		return this.enum.enumName;
	}
};
var Subquery = class {
	static {
		__name(this, "Subquery");
	}
	static [entityKind] = "Subquery";
	constructor(sql2, fields, alias, isWith = false, usedTables = []) {
		this._ = {
			brand: "Subquery",
			sql: sql2,
			selectedFields: fields,
			alias,
			isWith,
			usedTables,
		};
	}
};
var WithSubquery = class extends Subquery {
	static {
		__name(this, "WithSubquery");
	}
	static [entityKind] = "WithSubquery";
};
var version2 = "0.45.1";
var otel;
var rawTracer;
var tracer = {
	startActiveSpan(name, fn) {
		if (!otel) {
			return fn();
		}
		if (!rawTracer) {
			rawTracer = otel.trace.getTracer("drizzle-orm", version2);
		}
		return iife(
			(otel2, rawTracer2) =>
				rawTracer2.startActiveSpan(name, (span) => {
					try {
						return fn(span);
					} catch (e) {
						span.setStatus({
							code: otel2.SpanStatusCode.ERROR,
							message: e instanceof Error ? e.message : "Unknown error",
						});
						throw e;
					} finally {
						span.end();
					}
				}),
			otel,
			rawTracer,
		);
	},
};
var ViewBaseConfig = Symbol.for("drizzle:ViewBaseConfig");
function isSQLWrapper(value) {
	return (
		value !== null && value !== void 0 && typeof value.getSQL === "function"
	);
}
__name(isSQLWrapper, "isSQLWrapper");
function mergeQueries(queries) {
	const result = { sql: "", params: [] };
	for (const query of queries) {
		result.sql += query.sql;
		result.params.push(...query.params);
		if (query.typings?.length) {
			if (!result.typings) {
				result.typings = [];
			}
			result.typings.push(...query.typings);
		}
	}
	return result;
}
__name(mergeQueries, "mergeQueries");
var StringChunk = class {
	static {
		__name(this, "StringChunk");
	}
	static [entityKind] = "StringChunk";
	value;
	constructor(value) {
		this.value = Array.isArray(value) ? value : [value];
	}
	getSQL() {
		return new SQL([this]);
	}
};
var SQL = class _SQL {
	static {
		__name(_SQL, "SQL");
	}
	constructor(queryChunks) {
		this.queryChunks = queryChunks;
		for (const chunk of queryChunks) {
			if (is(chunk, Table)) {
				const schemaName = chunk[Table.Symbol.Schema];
				this.usedTables.push(
					schemaName === void 0
						? chunk[Table.Symbol.Name]
						: schemaName + "." + chunk[Table.Symbol.Name],
				);
			}
		}
	}
	static [entityKind] = "SQL";
	decoder = noopDecoder;
	shouldInlineParams = false;
	usedTables = [];
	append(query) {
		this.queryChunks.push(...query.queryChunks);
		return this;
	}
	toQuery(config2) {
		return tracer.startActiveSpan("drizzle.buildSQL", (span) => {
			const query = this.buildQueryFromSourceParams(this.queryChunks, config2);
			span?.setAttributes({
				"drizzle.query.text": query.sql,
				"drizzle.query.params": JSON.stringify(query.params),
			});
			return query;
		});
	}
	buildQueryFromSourceParams(chunks, _config) {
		const config2 = Object.assign({}, _config, {
			inlineParams: _config.inlineParams || this.shouldInlineParams,
			paramStartIndex: _config.paramStartIndex || { value: 0 },
		});
		const {
			casing,
			escapeName,
			escapeParam,
			prepareTyping,
			inlineParams,
			paramStartIndex,
		} = config2;
		return mergeQueries(
			chunks.map((chunk) => {
				if (is(chunk, StringChunk)) {
					return { sql: chunk.value.join(""), params: [] };
				}
				if (is(chunk, Name)) {
					return { sql: escapeName(chunk.value), params: [] };
				}
				if (chunk === void 0) {
					return { sql: "", params: [] };
				}
				if (Array.isArray(chunk)) {
					const result = [new StringChunk("(")];
					for (const [i, p] of chunk.entries()) {
						result.push(p);
						if (i < chunk.length - 1) {
							result.push(new StringChunk(", "));
						}
					}
					result.push(new StringChunk(")"));
					return this.buildQueryFromSourceParams(result, config2);
				}
				if (is(chunk, _SQL)) {
					return this.buildQueryFromSourceParams(chunk.queryChunks, {
						...config2,
						inlineParams: inlineParams || chunk.shouldInlineParams,
					});
				}
				if (is(chunk, Table)) {
					const schemaName = chunk[Table.Symbol.Schema];
					const tableName = chunk[Table.Symbol.Name];
					return {
						sql:
							schemaName === void 0 || chunk[IsAlias]
								? escapeName(tableName)
								: escapeName(schemaName) + "." + escapeName(tableName),
						params: [],
					};
				}
				if (is(chunk, Column)) {
					const columnName = casing.getColumnCasing(chunk);
					if (_config.invokeSource === "indexes") {
						return { sql: escapeName(columnName), params: [] };
					}
					const schemaName = chunk.table[Table.Symbol.Schema];
					return {
						sql:
							chunk.table[IsAlias] || schemaName === void 0
								? escapeName(chunk.table[Table.Symbol.Name]) +
									"." +
									escapeName(columnName)
								: escapeName(schemaName) +
									"." +
									escapeName(chunk.table[Table.Symbol.Name]) +
									"." +
									escapeName(columnName),
						params: [],
					};
				}
				if (is(chunk, View)) {
					const schemaName = chunk[ViewBaseConfig].schema;
					const viewName = chunk[ViewBaseConfig].name;
					return {
						sql:
							schemaName === void 0 || chunk[ViewBaseConfig].isAlias
								? escapeName(viewName)
								: escapeName(schemaName) + "." + escapeName(viewName),
						params: [],
					};
				}
				if (is(chunk, Param)) {
					if (is(chunk.value, Placeholder)) {
						return {
							sql: escapeParam(paramStartIndex.value++, chunk),
							params: [chunk],
							typings: ["none"],
						};
					}
					const mappedValue =
						chunk.value === null
							? null
							: chunk.encoder.mapToDriverValue(chunk.value);
					if (is(mappedValue, _SQL)) {
						return this.buildQueryFromSourceParams([mappedValue], config2);
					}
					if (inlineParams) {
						return {
							sql: this.mapInlineParam(mappedValue, config2),
							params: [],
						};
					}
					let typings = ["none"];
					if (prepareTyping) {
						typings = [prepareTyping(chunk.encoder)];
					}
					return {
						sql: escapeParam(paramStartIndex.value++, mappedValue),
						params: [mappedValue],
						typings,
					};
				}
				if (is(chunk, Placeholder)) {
					return {
						sql: escapeParam(paramStartIndex.value++, chunk),
						params: [chunk],
						typings: ["none"],
					};
				}
				if (is(chunk, _SQL.Aliased) && chunk.fieldAlias !== void 0) {
					return { sql: escapeName(chunk.fieldAlias), params: [] };
				}
				if (is(chunk, Subquery)) {
					if (chunk._.isWith) {
						return { sql: escapeName(chunk._.alias), params: [] };
					}
					return this.buildQueryFromSourceParams(
						[
							new StringChunk("("),
							chunk._.sql,
							new StringChunk(") "),
							new Name(chunk._.alias),
						],
						config2,
					);
				}
				if (isPgEnum(chunk)) {
					if (chunk.schema) {
						return {
							sql: escapeName(chunk.schema) + "." + escapeName(chunk.enumName),
							params: [],
						};
					}
					return { sql: escapeName(chunk.enumName), params: [] };
				}
				if (isSQLWrapper(chunk)) {
					if (chunk.shouldOmitSQLParens?.()) {
						return this.buildQueryFromSourceParams([chunk.getSQL()], config2);
					}
					return this.buildQueryFromSourceParams(
						[new StringChunk("("), chunk.getSQL(), new StringChunk(")")],
						config2,
					);
				}
				if (inlineParams) {
					return { sql: this.mapInlineParam(chunk, config2), params: [] };
				}
				return {
					sql: escapeParam(paramStartIndex.value++, chunk),
					params: [chunk],
					typings: ["none"],
				};
			}),
		);
	}
	mapInlineParam(chunk, { escapeString: escapeString2 }) {
		if (chunk === null) {
			return "null";
		}
		if (typeof chunk === "number" || typeof chunk === "boolean") {
			return chunk.toString();
		}
		if (typeof chunk === "string") {
			return escapeString2(chunk);
		}
		if (typeof chunk === "object") {
			const mappedValueAsString = chunk.toString();
			if (mappedValueAsString === "[object Object]") {
				return escapeString2(JSON.stringify(chunk));
			}
			return escapeString2(mappedValueAsString);
		}
		throw new Error("Unexpected param value: " + chunk);
	}
	getSQL() {
		return this;
	}
	as(alias) {
		if (alias === void 0) {
			return this;
		}
		return new _SQL.Aliased(this, alias);
	}
	mapWith(decoder2) {
		this.decoder =
			typeof decoder2 === "function"
				? { mapFromDriverValue: decoder2 }
				: decoder2;
		return this;
	}
	inlineParams() {
		this.shouldInlineParams = true;
		return this;
	}
	if(condition) {
		return condition ? this : void 0;
	}
};
var Name = class {
	static {
		__name(this, "Name");
	}
	constructor(value) {
		this.value = value;
	}
	static [entityKind] = "Name";
	brand;
	getSQL() {
		return new SQL([this]);
	}
};
function isDriverValueEncoder(value) {
	return (
		typeof value === "object" &&
		value !== null &&
		"mapToDriverValue" in value &&
		typeof value.mapToDriverValue === "function"
	);
}
__name(isDriverValueEncoder, "isDriverValueEncoder");
var noopDecoder = {
	mapFromDriverValue: /* @__PURE__ */ __name(
		(value) => value,
		"mapFromDriverValue",
	),
};
var noopEncoder = {
	mapToDriverValue: /* @__PURE__ */ __name(
		(value) => value,
		"mapToDriverValue",
	),
};
var noopMapper = {
	...noopDecoder,
	...noopEncoder,
};
var Param = class {
	static {
		__name(this, "Param");
	}
	constructor(value, encoder2 = noopEncoder) {
		this.value = value;
		this.encoder = encoder2;
	}
	static [entityKind] = "Param";
	brand;
	getSQL() {
		return new SQL([this]);
	}
};
function sql(strings, ...params) {
	const queryChunks = [];
	if (params.length > 0 || (strings.length > 0 && strings[0] !== "")) {
		queryChunks.push(new StringChunk(strings[0]));
	}
	for (const [paramIndex, param2] of params.entries()) {
		queryChunks.push(param2, new StringChunk(strings[paramIndex + 1]));
	}
	return new SQL(queryChunks);
}
__name(sql, "sql");
((sql2) => {
	function empty() {
		return new SQL([]);
	}
	__name(empty, "empty");
	sql2.empty = empty;
	function fromList(list) {
		return new SQL(list);
	}
	__name(fromList, "fromList");
	sql2.fromList = fromList;
	function raw(str) {
		return new SQL([new StringChunk(str)]);
	}
	__name(raw, "raw");
	sql2.raw = raw;
	function join(chunks, separator) {
		const result = [];
		for (const [i, chunk] of chunks.entries()) {
			if (i > 0 && separator !== void 0) {
				result.push(separator);
			}
			result.push(chunk);
		}
		return new SQL(result);
	}
	__name(join, "join");
	sql2.join = join;
	function identifier(value) {
		return new Name(value);
	}
	__name(identifier, "identifier");
	sql2.identifier = identifier;
	function placeholder2(name2) {
		return new Placeholder(name2);
	}
	__name(placeholder2, "placeholder2");
	sql2.placeholder = placeholder2;
	function param2(value, encoder2) {
		return new Param(value, encoder2);
	}
	__name(param2, "param2");
	sql2.param = param2;
})(sql || (sql = {}));
((SQL2) => {
	class Aliased {
		static {
			__name(Aliased, "Aliased");
		}
		constructor(sql2, fieldAlias) {
			this.sql = sql2;
			this.fieldAlias = fieldAlias;
		}
		static [entityKind] = "SQL.Aliased";
		isSelectionField = false;
		getSQL() {
			return this.sql;
		}
		clone() {
			return new Aliased(this.sql, this.fieldAlias);
		}
	}
	SQL2.Aliased = Aliased;
})(SQL || (SQL = {}));
var Placeholder = class {
	static {
		__name(this, "Placeholder");
	}
	constructor(name2) {
		this.name = name2;
	}
	static [entityKind] = "Placeholder";
	getSQL() {
		return new SQL([this]);
	}
};
function fillPlaceholders(params, values) {
	return params.map((p) => {
		if (is(p, Placeholder)) {
			if (!(p.name in values)) {
				throw new Error(`No value for placeholder "${p.name}" was provided`);
			}
			return values[p.name];
		}
		if (is(p, Param) && is(p.value, Placeholder)) {
			if (!(p.value.name in values)) {
				throw new Error(
					`No value for placeholder "${p.value.name}" was provided`,
				);
			}
			return p.encoder.mapToDriverValue(values[p.value.name]);
		}
		return p;
	});
}
__name(fillPlaceholders, "fillPlaceholders");
var IsDrizzleView = Symbol.for("drizzle:IsDrizzleView");
var View = class {
	static {
		__name(this, "View");
	}
	static [entityKind] = "View";
	[ViewBaseConfig];
	[IsDrizzleView] = true;
	constructor({ name: name2, schema, selectedFields, query }) {
		this[ViewBaseConfig] = {
			name: name2,
			originalName: name2,
			schema,
			selectedFields,
			query,
			isExisting: !query,
			isAlias: false,
		};
	}
	getSQL() {
		return new SQL([this]);
	}
};
Column.prototype.getSQL = function () {
	return new SQL([this]);
};
Table.prototype.getSQL = function () {
	return new SQL([this]);
};
Subquery.prototype.getSQL = function () {
	return new SQL([this]);
};
function bindIfParam(value, column) {
	if (
		isDriverValueEncoder(column) &&
		!isSQLWrapper(value) &&
		!is(value, Param) &&
		!is(value, Placeholder) &&
		!is(value, Column) &&
		!is(value, Table) &&
		!is(value, View)
	) {
		return new Param(value, column);
	}
	return value;
}
__name(bindIfParam, "bindIfParam");
var eq = /* @__PURE__ */ __name((left, right) => {
	return sql`${left} = ${bindIfParam(right, left)}`;
}, "eq");
var ne = /* @__PURE__ */ __name((left, right) => {
	return sql`${left} <> ${bindIfParam(right, left)}`;
}, "ne");
function and(...unfilteredConditions) {
	const conditions = unfilteredConditions.filter((c) => c !== void 0);
	if (conditions.length === 0) {
		return;
	}
	if (conditions.length === 1) {
		return new SQL(conditions);
	}
	return new SQL([
		new StringChunk("("),
		sql.join(conditions, new StringChunk(" and ")),
		new StringChunk(")"),
	]);
}
__name(and, "and");
function or(...unfilteredConditions) {
	const conditions = unfilteredConditions.filter((c) => c !== void 0);
	if (conditions.length === 0) {
		return;
	}
	if (conditions.length === 1) {
		return new SQL(conditions);
	}
	return new SQL([
		new StringChunk("("),
		sql.join(conditions, new StringChunk(" or ")),
		new StringChunk(")"),
	]);
}
__name(or, "or");
function not(condition) {
	return sql`not ${condition}`;
}
__name(not, "not");
var gt = /* @__PURE__ */ __name((left, right) => {
	return sql`${left} > ${bindIfParam(right, left)}`;
}, "gt");
var gte = /* @__PURE__ */ __name((left, right) => {
	return sql`${left} >= ${bindIfParam(right, left)}`;
}, "gte");
var lt = /* @__PURE__ */ __name((left, right) => {
	return sql`${left} < ${bindIfParam(right, left)}`;
}, "lt");
var lte = /* @__PURE__ */ __name((left, right) => {
	return sql`${left} <= ${bindIfParam(right, left)}`;
}, "lte");
function inArray(column, values) {
	if (Array.isArray(values)) {
		if (values.length === 0) {
			return sql`false`;
		}
		return sql`${column} in ${values.map((v) => bindIfParam(v, column))}`;
	}
	return sql`${column} in ${bindIfParam(values, column)}`;
}
__name(inArray, "inArray");
function notInArray(column, values) {
	if (Array.isArray(values)) {
		if (values.length === 0) {
			return sql`true`;
		}
		return sql`${column} not in ${values.map((v) => bindIfParam(v, column))}`;
	}
	return sql`${column} not in ${bindIfParam(values, column)}`;
}
__name(notInArray, "notInArray");
function isNull(value) {
	return sql`${value} is null`;
}
__name(isNull, "isNull");
function isNotNull(value) {
	return sql`${value} is not null`;
}
__name(isNotNull, "isNotNull");
function exists(subquery) {
	return sql`exists ${subquery}`;
}
__name(exists, "exists");
function notExists(subquery) {
	return sql`not exists ${subquery}`;
}
__name(notExists, "notExists");
function between(column, min, max) {
	return sql`${column} between ${bindIfParam(min, column)} and ${bindIfParam(max, column)}`;
}
__name(between, "between");
function notBetween(column, min, max) {
	return sql`${column} not between ${bindIfParam(min, column)} and ${bindIfParam(max, column)}`;
}
__name(notBetween, "notBetween");
function like(column, value) {
	return sql`${column} like ${value}`;
}
__name(like, "like");
function notLike(column, value) {
	return sql`${column} not like ${value}`;
}
__name(notLike, "notLike");
function ilike(column, value) {
	return sql`${column} ilike ${value}`;
}
__name(ilike, "ilike");
function notIlike(column, value) {
	return sql`${column} not ilike ${value}`;
}
__name(notIlike, "notIlike");
var ColumnAliasProxyHandler = class {
	static {
		__name(this, "ColumnAliasProxyHandler");
	}
	constructor(table3) {
		this.table = table3;
	}
	static [entityKind] = "ColumnAliasProxyHandler";
	get(columnObj, prop) {
		if (prop === "table") {
			return this.table;
		}
		return columnObj[prop];
	}
};
var TableAliasProxyHandler = class {
	static {
		__name(this, "TableAliasProxyHandler");
	}
	constructor(alias, replaceOriginalName) {
		this.alias = alias;
		this.replaceOriginalName = replaceOriginalName;
	}
	static [entityKind] = "TableAliasProxyHandler";
	get(target, prop) {
		if (prop === Table.Symbol.IsAlias) {
			return true;
		}
		if (prop === Table.Symbol.Name) {
			return this.alias;
		}
		if (this.replaceOriginalName && prop === Table.Symbol.OriginalName) {
			return this.alias;
		}
		if (prop === ViewBaseConfig) {
			return {
				...target[ViewBaseConfig],
				name: this.alias,
				isAlias: true,
			};
		}
		if (prop === Table.Symbol.Columns) {
			const columns = target[Table.Symbol.Columns];
			if (!columns) {
				return columns;
			}
			const proxiedColumns = {};
			Object.keys(columns).map((key) => {
				proxiedColumns[key] = new Proxy(
					columns[key],
					new ColumnAliasProxyHandler(new Proxy(target, this)),
				);
			});
			return proxiedColumns;
		}
		const value = target[prop];
		if (is(value, Column)) {
			return new Proxy(
				value,
				new ColumnAliasProxyHandler(new Proxy(target, this)),
			);
		}
		return value;
	}
};
function aliasedTable(table3, tableAlias) {
	return new Proxy(table3, new TableAliasProxyHandler(tableAlias, false));
}
__name(aliasedTable, "aliasedTable");
function aliasedTableColumn(column, tableAlias) {
	return new Proxy(
		column,
		new ColumnAliasProxyHandler(
			new Proxy(column.table, new TableAliasProxyHandler(tableAlias, false)),
		),
	);
}
__name(aliasedTableColumn, "aliasedTableColumn");
function mapColumnsInAliasedSQLToAlias(query, alias) {
	return new SQL.Aliased(
		mapColumnsInSQLToAlias(query.sql, alias),
		query.fieldAlias,
	);
}
__name(mapColumnsInAliasedSQLToAlias, "mapColumnsInAliasedSQLToAlias");
function mapColumnsInSQLToAlias(query, alias) {
	return sql.join(
		query.queryChunks.map((c) => {
			if (is(c, Column)) {
				return aliasedTableColumn(c, alias);
			}
			if (is(c, SQL)) {
				return mapColumnsInSQLToAlias(c, alias);
			}
			if (is(c, SQL.Aliased)) {
				return mapColumnsInAliasedSQLToAlias(c, alias);
			}
			return c;
		}),
	);
}
__name(mapColumnsInSQLToAlias, "mapColumnsInSQLToAlias");
function mapResultRow(columns, row, joinsNotNullableMap) {
	const nullifyMap = {};
	const result = columns.reduce((result2, { path, field }, columnIndex) => {
		let decoder2;
		if (is(field, Column)) {
			decoder2 = field;
		} else if (is(field, SQL)) {
			decoder2 = field.decoder;
		} else if (is(field, Subquery)) {
			decoder2 = field._.sql.decoder;
		} else {
			decoder2 = field.sql.decoder;
		}
		let node = result2;
		for (const [pathChunkIndex, pathChunk] of path.entries()) {
			if (pathChunkIndex < path.length - 1) {
				if (!(pathChunk in node)) {
					node[pathChunk] = {};
				}
				node = node[pathChunk];
			} else {
				const rawValue = row[columnIndex];
				const value = (node[pathChunk] =
					rawValue === null ? null : decoder2.mapFromDriverValue(rawValue));
				if (joinsNotNullableMap && is(field, Column) && path.length === 2) {
					const objectName = path[0];
					if (!(objectName in nullifyMap)) {
						nullifyMap[objectName] =
							value === null ? getTableName(field.table) : false;
					} else if (
						typeof nullifyMap[objectName] === "string" &&
						nullifyMap[objectName] !== getTableName(field.table)
					) {
						nullifyMap[objectName] = false;
					}
				}
			}
		}
		return result2;
	}, {});
	if (joinsNotNullableMap && Object.keys(nullifyMap).length > 0) {
		for (const [objectName, tableName] of Object.entries(nullifyMap)) {
			if (typeof tableName === "string" && !joinsNotNullableMap[tableName]) {
				result[objectName] = null;
			}
		}
	}
	return result;
}
__name(mapResultRow, "mapResultRow");
function orderSelectedFields(fields, pathPrefix) {
	return Object.entries(fields).reduce((result, [name, field]) => {
		if (typeof name !== "string") {
			return result;
		}
		const newPath = pathPrefix ? [...pathPrefix, name] : [name];
		if (
			is(field, Column) ||
			is(field, SQL) ||
			is(field, SQL.Aliased) ||
			is(field, Subquery)
		) {
			result.push({ path: newPath, field });
		} else if (is(field, Table)) {
			result.push(...orderSelectedFields(field[Table.Symbol.Columns], newPath));
		} else {
			result.push(...orderSelectedFields(field, newPath));
		}
		return result;
	}, []);
}
__name(orderSelectedFields, "orderSelectedFields");
function haveSameKeys(left, right) {
	const leftKeys = Object.keys(left);
	const rightKeys = Object.keys(right);
	if (leftKeys.length !== rightKeys.length) {
		return false;
	}
	for (const [index, key] of leftKeys.entries()) {
		if (key !== rightKeys[index]) {
			return false;
		}
	}
	return true;
}
__name(haveSameKeys, "haveSameKeys");
function mapUpdateSet(table3, values) {
	const entries = Object.entries(values)
		.filter(([, value]) => value !== void 0)
		.map(([key, value]) => {
			if (is(value, SQL) || is(value, Column)) {
				return [key, value];
			} else {
				return [key, new Param(value, table3[Table.Symbol.Columns][key])];
			}
		});
	if (entries.length === 0) {
		throw new Error("No values to set");
	}
	return Object.fromEntries(entries);
}
__name(mapUpdateSet, "mapUpdateSet");
function applyMixins(baseClass, extendedClasses) {
	for (const extendedClass of extendedClasses) {
		for (const name of Object.getOwnPropertyNames(extendedClass.prototype)) {
			if (name === "constructor") continue;
			Object.defineProperty(
				baseClass.prototype,
				name,
				Object.getOwnPropertyDescriptor(extendedClass.prototype, name) ||
					/* @__PURE__ */ Object.create(null),
			);
		}
	}
}
__name(applyMixins, "applyMixins");
function getTableColumns(table3) {
	return table3[Table.Symbol.Columns];
}
__name(getTableColumns, "getTableColumns");
function getTableLikeName(table3) {
	return is(table3, Subquery)
		? table3._.alias
		: is(table3, View)
			? table3[ViewBaseConfig].name
			: is(table3, SQL)
				? void 0
				: table3[Table.Symbol.IsAlias]
					? table3[Table.Symbol.Name]
					: table3[Table.Symbol.BaseName];
}
__name(getTableLikeName, "getTableLikeName");
function getColumnNameAndConfig(a, b) {
	return {
		name: typeof a === "string" && a.length > 0 ? a : "",
		config: typeof a === "object" ? a : b,
	};
}
__name(getColumnNameAndConfig, "getColumnNameAndConfig");
var textDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder();
var ForeignKeyBuilder = class {
	static {
		__name(this, "ForeignKeyBuilder");
	}
	static [entityKind] = "SQLiteForeignKeyBuilder";
	reference;
	_onUpdate;
	_onDelete;
	constructor(config2, actions) {
		this.reference = () => {
			const { name, columns, foreignColumns } = config2();
			return {
				name,
				columns,
				foreignTable: foreignColumns[0].table,
				foreignColumns,
			};
		};
		if (actions) {
			this._onUpdate = actions.onUpdate;
			this._onDelete = actions.onDelete;
		}
	}
	onUpdate(action) {
		this._onUpdate = action;
		return this;
	}
	onDelete(action) {
		this._onDelete = action;
		return this;
	}
	build(table3) {
		return new ForeignKey(table3, this);
	}
};
var ForeignKey = class {
	static {
		__name(this, "ForeignKey");
	}
	constructor(table3, builder) {
		this.table = table3;
		this.reference = builder.reference;
		this.onUpdate = builder._onUpdate;
		this.onDelete = builder._onDelete;
	}
	static [entityKind] = "SQLiteForeignKey";
	reference;
	onUpdate;
	onDelete;
	getName() {
		const { name, columns, foreignColumns } = this.reference();
		const columnNames = columns.map((column) => column.name);
		const foreignColumnNames = foreignColumns.map((column) => column.name);
		const chunks = [
			this.table[TableName],
			...columnNames,
			foreignColumns[0].table[TableName],
			...foreignColumnNames,
		];
		return name ?? `${chunks.join("_")}_fk`;
	}
};
function uniqueKeyName2(table3, columns) {
	return `${table3[TableName]}_${columns.join("_")}_unique`;
}
__name(uniqueKeyName2, "uniqueKeyName2");
var SQLiteColumnBuilder = class extends ColumnBuilder {
	static {
		__name(this, "SQLiteColumnBuilder");
	}
	static [entityKind] = "SQLiteColumnBuilder";
	foreignKeyConfigs = [];
	references(ref2, actions = {}) {
		this.foreignKeyConfigs.push({ ref: ref2, actions });
		return this;
	}
	unique(name) {
		this.config.isUnique = true;
		this.config.uniqueName = name;
		return this;
	}
	generatedAlwaysAs(as, config2) {
		this.config.generated = {
			as,
			type: "always",
			mode: config2?.mode ?? "virtual",
		};
		return this;
	}
	buildForeignKeys(column, table3) {
		return this.foreignKeyConfigs.map(({ ref: ref2, actions }) => {
			return ((ref22, actions2) => {
				const builder = new ForeignKeyBuilder(() => {
					const foreignColumn = ref22();
					return { columns: [column], foreignColumns: [foreignColumn] };
				});
				if (actions2.onUpdate) {
					builder.onUpdate(actions2.onUpdate);
				}
				if (actions2.onDelete) {
					builder.onDelete(actions2.onDelete);
				}
				return builder.build(table3);
			})(ref2, actions);
		});
	}
};
var SQLiteColumn = class extends Column {
	static {
		__name(this, "SQLiteColumn");
	}
	constructor(table3, config2) {
		if (!config2.uniqueName) {
			config2.uniqueName = uniqueKeyName2(table3, [config2.name]);
		}
		super(table3, config2);
		this.table = table3;
	}
	static [entityKind] = "SQLiteColumn";
};
var SQLiteBigIntBuilder = class extends SQLiteColumnBuilder {
	static {
		__name(this, "SQLiteBigIntBuilder");
	}
	static [entityKind] = "SQLiteBigIntBuilder";
	constructor(name) {
		super(name, "bigint", "SQLiteBigInt");
	}
	build(table3) {
		return new SQLiteBigInt(table3, this.config);
	}
};
var SQLiteBigInt = class extends SQLiteColumn {
	static {
		__name(this, "SQLiteBigInt");
	}
	static [entityKind] = "SQLiteBigInt";
	getSQLType() {
		return "blob";
	}
	mapFromDriverValue(value) {
		if (typeof Buffer !== "undefined" && Buffer.from) {
			const buf = Buffer.isBuffer(value)
				? value
				: value instanceof ArrayBuffer
					? Buffer.from(value)
					: value.buffer
						? Buffer.from(value.buffer, value.byteOffset, value.byteLength)
						: Buffer.from(value);
			return BigInt(buf.toString("utf8"));
		}
		return BigInt(textDecoder.decode(value));
	}
	mapToDriverValue(value) {
		return Buffer.from(value.toString());
	}
};
var SQLiteBlobJsonBuilder = class extends SQLiteColumnBuilder {
	static {
		__name(this, "SQLiteBlobJsonBuilder");
	}
	static [entityKind] = "SQLiteBlobJsonBuilder";
	constructor(name) {
		super(name, "json", "SQLiteBlobJson");
	}
	build(table3) {
		return new SQLiteBlobJson(table3, this.config);
	}
};
var SQLiteBlobJson = class extends SQLiteColumn {
	static {
		__name(this, "SQLiteBlobJson");
	}
	static [entityKind] = "SQLiteBlobJson";
	getSQLType() {
		return "blob";
	}
	mapFromDriverValue(value) {
		if (typeof Buffer !== "undefined" && Buffer.from) {
			const buf = Buffer.isBuffer(value)
				? value
				: value instanceof ArrayBuffer
					? Buffer.from(value)
					: value.buffer
						? Buffer.from(value.buffer, value.byteOffset, value.byteLength)
						: Buffer.from(value);
			return JSON.parse(buf.toString("utf8"));
		}
		return JSON.parse(textDecoder.decode(value));
	}
	mapToDriverValue(value) {
		return Buffer.from(JSON.stringify(value));
	}
};
var SQLiteBlobBufferBuilder = class extends SQLiteColumnBuilder {
	static {
		__name(this, "SQLiteBlobBufferBuilder");
	}
	static [entityKind] = "SQLiteBlobBufferBuilder";
	constructor(name) {
		super(name, "buffer", "SQLiteBlobBuffer");
	}
	build(table3) {
		return new SQLiteBlobBuffer(table3, this.config);
	}
};
var SQLiteBlobBuffer = class extends SQLiteColumn {
	static {
		__name(this, "SQLiteBlobBuffer");
	}
	static [entityKind] = "SQLiteBlobBuffer";
	mapFromDriverValue(value) {
		if (Buffer.isBuffer(value)) {
			return value;
		}
		return Buffer.from(value);
	}
	getSQLType() {
		return "blob";
	}
};
function blob(a, b) {
	const { name, config: config2 } = getColumnNameAndConfig(a, b);
	if (config2?.mode === "json") {
		return new SQLiteBlobJsonBuilder(name);
	}
	if (config2?.mode === "bigint") {
		return new SQLiteBigIntBuilder(name);
	}
	return new SQLiteBlobBufferBuilder(name);
}
__name(blob, "blob");
var SQLiteCustomColumnBuilder = class extends SQLiteColumnBuilder {
	static {
		__name(this, "SQLiteCustomColumnBuilder");
	}
	static [entityKind] = "SQLiteCustomColumnBuilder";
	constructor(name, fieldConfig, customTypeParams) {
		super(name, "custom", "SQLiteCustomColumn");
		this.config.fieldConfig = fieldConfig;
		this.config.customTypeParams = customTypeParams;
	}
	build(table3) {
		return new SQLiteCustomColumn(table3, this.config);
	}
};
var SQLiteCustomColumn = class extends SQLiteColumn {
	static {
		__name(this, "SQLiteCustomColumn");
	}
	static [entityKind] = "SQLiteCustomColumn";
	sqlName;
	mapTo;
	mapFrom;
	constructor(table3, config2) {
		super(table3, config2);
		this.sqlName = config2.customTypeParams.dataType(config2.fieldConfig);
		this.mapTo = config2.customTypeParams.toDriver;
		this.mapFrom = config2.customTypeParams.fromDriver;
	}
	getSQLType() {
		return this.sqlName;
	}
	mapFromDriverValue(value) {
		return typeof this.mapFrom === "function" ? this.mapFrom(value) : value;
	}
	mapToDriverValue(value) {
		return typeof this.mapTo === "function" ? this.mapTo(value) : value;
	}
};
function customType(customTypeParams) {
	return (a, b) => {
		const { name, config: config2 } = getColumnNameAndConfig(a, b);
		return new SQLiteCustomColumnBuilder(name, config2, customTypeParams);
	};
}
__name(customType, "customType");
var SQLiteBaseIntegerBuilder = class extends SQLiteColumnBuilder {
	static {
		__name(this, "SQLiteBaseIntegerBuilder");
	}
	static [entityKind] = "SQLiteBaseIntegerBuilder";
	constructor(name, dataType, columnType) {
		super(name, dataType, columnType);
		this.config.autoIncrement = false;
	}
	primaryKey(config2) {
		if (config2?.autoIncrement) {
			this.config.autoIncrement = true;
		}
		this.config.hasDefault = true;
		return super.primaryKey();
	}
};
var SQLiteBaseInteger = class extends SQLiteColumn {
	static {
		__name(this, "SQLiteBaseInteger");
	}
	static [entityKind] = "SQLiteBaseInteger";
	autoIncrement = this.config.autoIncrement;
	getSQLType() {
		return "integer";
	}
};
var SQLiteIntegerBuilder = class extends SQLiteBaseIntegerBuilder {
	static {
		__name(this, "SQLiteIntegerBuilder");
	}
	static [entityKind] = "SQLiteIntegerBuilder";
	constructor(name) {
		super(name, "number", "SQLiteInteger");
	}
	build(table3) {
		return new SQLiteInteger(table3, this.config);
	}
};
var SQLiteInteger = class extends SQLiteBaseInteger {
	static {
		__name(this, "SQLiteInteger");
	}
	static [entityKind] = "SQLiteInteger";
};
var SQLiteTimestampBuilder = class extends SQLiteBaseIntegerBuilder {
	static {
		__name(this, "SQLiteTimestampBuilder");
	}
	static [entityKind] = "SQLiteTimestampBuilder";
	constructor(name, mode) {
		super(name, "date", "SQLiteTimestamp");
		this.config.mode = mode;
	}
	defaultNow() {
		return this.default(
			sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`,
		);
	}
	build(table3) {
		return new SQLiteTimestamp(table3, this.config);
	}
};
var SQLiteTimestamp = class extends SQLiteBaseInteger {
	static {
		__name(this, "SQLiteTimestamp");
	}
	static [entityKind] = "SQLiteTimestamp";
	mode = this.config.mode;
	mapFromDriverValue(value) {
		if (this.config.mode === "timestamp") {
			return new Date(value * 1e3);
		}
		return new Date(value);
	}
	mapToDriverValue(value) {
		const unix = value.getTime();
		if (this.config.mode === "timestamp") {
			return Math.floor(unix / 1e3);
		}
		return unix;
	}
};
var SQLiteBooleanBuilder = class extends SQLiteBaseIntegerBuilder {
	static {
		__name(this, "SQLiteBooleanBuilder");
	}
	static [entityKind] = "SQLiteBooleanBuilder";
	constructor(name, mode) {
		super(name, "boolean", "SQLiteBoolean");
		this.config.mode = mode;
	}
	build(table3) {
		return new SQLiteBoolean(table3, this.config);
	}
};
var SQLiteBoolean = class extends SQLiteBaseInteger {
	static {
		__name(this, "SQLiteBoolean");
	}
	static [entityKind] = "SQLiteBoolean";
	mode = this.config.mode;
	mapFromDriverValue(value) {
		return Number(value) === 1;
	}
	mapToDriverValue(value) {
		return value ? 1 : 0;
	}
};
function integer(a, b) {
	const { name, config: config2 } = getColumnNameAndConfig(a, b);
	if (config2?.mode === "timestamp" || config2?.mode === "timestamp_ms") {
		return new SQLiteTimestampBuilder(name, config2.mode);
	}
	if (config2?.mode === "boolean") {
		return new SQLiteBooleanBuilder(name, config2.mode);
	}
	return new SQLiteIntegerBuilder(name);
}
__name(integer, "integer");
var SQLiteNumericBuilder = class extends SQLiteColumnBuilder {
	static {
		__name(this, "SQLiteNumericBuilder");
	}
	static [entityKind] = "SQLiteNumericBuilder";
	constructor(name) {
		super(name, "string", "SQLiteNumeric");
	}
	build(table3) {
		return new SQLiteNumeric(table3, this.config);
	}
};
var SQLiteNumeric = class extends SQLiteColumn {
	static {
		__name(this, "SQLiteNumeric");
	}
	static [entityKind] = "SQLiteNumeric";
	mapFromDriverValue(value) {
		if (typeof value === "string") return value;
		return String(value);
	}
	getSQLType() {
		return "numeric";
	}
};
var SQLiteNumericNumberBuilder = class extends SQLiteColumnBuilder {
	static {
		__name(this, "SQLiteNumericNumberBuilder");
	}
	static [entityKind] = "SQLiteNumericNumberBuilder";
	constructor(name) {
		super(name, "number", "SQLiteNumericNumber");
	}
	build(table3) {
		return new SQLiteNumericNumber(table3, this.config);
	}
};
var SQLiteNumericNumber = class extends SQLiteColumn {
	static {
		__name(this, "SQLiteNumericNumber");
	}
	static [entityKind] = "SQLiteNumericNumber";
	mapFromDriverValue(value) {
		if (typeof value === "number") return value;
		return Number(value);
	}
	mapToDriverValue = String;
	getSQLType() {
		return "numeric";
	}
};
var SQLiteNumericBigIntBuilder = class extends SQLiteColumnBuilder {
	static {
		__name(this, "SQLiteNumericBigIntBuilder");
	}
	static [entityKind] = "SQLiteNumericBigIntBuilder";
	constructor(name) {
		super(name, "bigint", "SQLiteNumericBigInt");
	}
	build(table3) {
		return new SQLiteNumericBigInt(table3, this.config);
	}
};
var SQLiteNumericBigInt = class extends SQLiteColumn {
	static {
		__name(this, "SQLiteNumericBigInt");
	}
	static [entityKind] = "SQLiteNumericBigInt";
	mapFromDriverValue = BigInt;
	mapToDriverValue = String;
	getSQLType() {
		return "numeric";
	}
};
function numeric(a, b) {
	const { name, config: config2 } = getColumnNameAndConfig(a, b);
	const mode = config2?.mode;
	return mode === "number"
		? new SQLiteNumericNumberBuilder(name)
		: mode === "bigint"
			? new SQLiteNumericBigIntBuilder(name)
			: new SQLiteNumericBuilder(name);
}
__name(numeric, "numeric");
var SQLiteRealBuilder = class extends SQLiteColumnBuilder {
	static {
		__name(this, "SQLiteRealBuilder");
	}
	static [entityKind] = "SQLiteRealBuilder";
	constructor(name) {
		super(name, "number", "SQLiteReal");
	}
	build(table3) {
		return new SQLiteReal(table3, this.config);
	}
};
var SQLiteReal = class extends SQLiteColumn {
	static {
		__name(this, "SQLiteReal");
	}
	static [entityKind] = "SQLiteReal";
	getSQLType() {
		return "real";
	}
};
function real(name) {
	return new SQLiteRealBuilder(name ?? "");
}
__name(real, "real");
var SQLiteTextBuilder = class extends SQLiteColumnBuilder {
	static {
		__name(this, "SQLiteTextBuilder");
	}
	static [entityKind] = "SQLiteTextBuilder";
	constructor(name, config2) {
		super(name, "string", "SQLiteText");
		this.config.enumValues = config2.enum;
		this.config.length = config2.length;
	}
	build(table3) {
		return new SQLiteText(table3, this.config);
	}
};
var SQLiteText = class extends SQLiteColumn {
	static {
		__name(this, "SQLiteText");
	}
	static [entityKind] = "SQLiteText";
	enumValues = this.config.enumValues;
	length = this.config.length;
	constructor(table3, config2) {
		super(table3, config2);
	}
	getSQLType() {
		return `text${this.config.length ? `(${this.config.length})` : ""}`;
	}
};
var SQLiteTextJsonBuilder = class extends SQLiteColumnBuilder {
	static {
		__name(this, "SQLiteTextJsonBuilder");
	}
	static [entityKind] = "SQLiteTextJsonBuilder";
	constructor(name) {
		super(name, "json", "SQLiteTextJson");
	}
	build(table3) {
		return new SQLiteTextJson(table3, this.config);
	}
};
var SQLiteTextJson = class extends SQLiteColumn {
	static {
		__name(this, "SQLiteTextJson");
	}
	static [entityKind] = "SQLiteTextJson";
	getSQLType() {
		return "text";
	}
	mapFromDriverValue(value) {
		return JSON.parse(value);
	}
	mapToDriverValue(value) {
		return JSON.stringify(value);
	}
};
function text(a, b = {}) {
	const { name, config: config2 } = getColumnNameAndConfig(a, b);
	if (config2.mode === "json") {
		return new SQLiteTextJsonBuilder(name);
	}
	return new SQLiteTextBuilder(name, config2);
}
__name(text, "text");
var SelectionProxyHandler = class _SelectionProxyHandler {
	static {
		__name(_SelectionProxyHandler, "SelectionProxyHandler");
	}
	static [entityKind] = "SelectionProxyHandler";
	config;
	constructor(config2) {
		this.config = { ...config2 };
	}
	get(subquery, prop) {
		if (prop === "_") {
			return {
				...subquery["_"],
				selectedFields: new Proxy(subquery._.selectedFields, this),
			};
		}
		if (prop === ViewBaseConfig) {
			return {
				...subquery[ViewBaseConfig],
				selectedFields: new Proxy(
					subquery[ViewBaseConfig].selectedFields,
					this,
				),
			};
		}
		if (typeof prop === "symbol") {
			return subquery[prop];
		}
		const columns = is(subquery, Subquery)
			? subquery._.selectedFields
			: is(subquery, View)
				? subquery[ViewBaseConfig].selectedFields
				: subquery;
		const value = columns[prop];
		if (is(value, SQL.Aliased)) {
			if (this.config.sqlAliasedBehavior === "sql" && !value.isSelectionField) {
				return value.sql;
			}
			const newValue = value.clone();
			newValue.isSelectionField = true;
			return newValue;
		}
		if (is(value, SQL)) {
			if (this.config.sqlBehavior === "sql") {
				return value;
			}
			throw new Error(
				`You tried to reference "${prop}" field from a subquery, which is a raw SQL field, but it doesn't have an alias declared. Please add an alias to the field using ".as('alias')" method.`,
			);
		}
		if (is(value, Column)) {
			if (this.config.alias) {
				return new Proxy(
					value,
					new ColumnAliasProxyHandler(
						new Proxy(
							value.table,
							new TableAliasProxyHandler(
								this.config.alias,
								this.config.replaceOriginalName ?? false,
							),
						),
					),
				);
			}
			return value;
		}
		if (typeof value !== "object" || value === null) {
			return value;
		}
		return new Proxy(value, new _SelectionProxyHandler(this.config));
	}
};
var QueryPromise = class {
	static {
		__name(this, "QueryPromise");
	}
	static [entityKind] = "QueryPromise";
	[Symbol.toStringTag] = "QueryPromise";
	catch(onRejected) {
		return this.then(void 0, onRejected);
	}
	finally(onFinally) {
		return this.then(
			(value) => {
				onFinally?.();
				return value;
			},
			(reason) => {
				onFinally?.();
				throw reason;
			},
		);
	}
	then(onFulfilled, onRejected) {
		return this.execute().then(onFulfilled, onRejected);
	}
};
function getSQLiteColumnBuilders() {
	return {
		blob,
		customType,
		integer,
		numeric,
		real,
		text,
	};
}
__name(getSQLiteColumnBuilders, "getSQLiteColumnBuilders");
var InlineForeignKeys = Symbol.for("drizzle:SQLiteInlineForeignKeys");
var SQLiteTable = class extends Table {
	static {
		__name(this, "SQLiteTable");
	}
	static [entityKind] = "SQLiteTable";
	static Symbol = Object.assign({}, Table.Symbol, {
		InlineForeignKeys,
	});
	[Table.Symbol.Columns];
	[InlineForeignKeys] = [];
	[Table.Symbol.ExtraConfigBuilder] = void 0;
};
function sqliteTableBase(name, columns, extraConfig, schema, baseName = name) {
	const rawTable = new SQLiteTable(name, schema, baseName);
	const parsedColumns =
		typeof columns === "function"
			? columns(getSQLiteColumnBuilders())
			: columns;
	const builtColumns = Object.fromEntries(
		Object.entries(parsedColumns).map(([name2, colBuilderBase]) => {
			const colBuilder = colBuilderBase;
			colBuilder.setName(name2);
			const column = colBuilder.build(rawTable);
			rawTable[InlineForeignKeys].push(
				...colBuilder.buildForeignKeys(column, rawTable),
			);
			return [name2, column];
		}),
	);
	const table3 = Object.assign(rawTable, builtColumns);
	table3[Table.Symbol.Columns] = builtColumns;
	table3[Table.Symbol.ExtraConfigColumns] = builtColumns;
	if (extraConfig) {
		table3[SQLiteTable.Symbol.ExtraConfigBuilder] = extraConfig;
	}
	return table3;
}
__name(sqliteTableBase, "sqliteTableBase");
var sqliteTable = /* @__PURE__ */ __name((name, columns, extraConfig) => {
	return sqliteTableBase(name, columns, extraConfig);
}, "sqliteTable");
function extractUsedTable(table3) {
	if (is(table3, SQLiteTable)) {
		return [`${table3[Table.Symbol.BaseName]}`];
	}
	if (is(table3, Subquery)) {
		return table3._.usedTables ?? [];
	}
	if (is(table3, SQL)) {
		return table3.usedTables ?? [];
	}
	return [];
}
__name(extractUsedTable, "extractUsedTable");
var SQLiteDeleteBase = class extends QueryPromise {
	static {
		__name(this, "SQLiteDeleteBase");
	}
	constructor(table3, session, dialect, withList) {
		super();
		this.table = table3;
		this.session = session;
		this.dialect = dialect;
		this.config = { table: table3, withList };
	}
	static [entityKind] = "SQLiteDelete";
	config;
	where(where) {
		this.config.where = where;
		return this;
	}
	orderBy(...columns) {
		if (typeof columns[0] === "function") {
			const orderBy = columns[0](
				new Proxy(
					this.config.table[Table.Symbol.Columns],
					new SelectionProxyHandler({
						sqlAliasedBehavior: "alias",
						sqlBehavior: "sql",
					}),
				),
			);
			const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
			this.config.orderBy = orderByArray;
		} else {
			const orderByArray = columns;
			this.config.orderBy = orderByArray;
		}
		return this;
	}
	limit(limit) {
		this.config.limit = limit;
		return this;
	}
	returning(fields = this.table[SQLiteTable.Symbol.Columns]) {
		this.config.returning = orderSelectedFields(fields);
		return this;
	}
	getSQL() {
		return this.dialect.buildDeleteQuery(this.config);
	}
	toSQL() {
		const { typings: _typings, ...rest } = this.dialect.sqlToQuery(
			this.getSQL(),
		);
		return rest;
	}
	_prepare(isOneTimeQuery = true) {
		return this.session[
			isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"
		](
			this.dialect.sqlToQuery(this.getSQL()),
			this.config.returning,
			this.config.returning ? "all" : "run",
			true,
			void 0,
			{
				type: "delete",
				tables: extractUsedTable(this.config.table),
			},
		);
	}
	prepare() {
		return this._prepare(false);
	}
	run = /* @__PURE__ */ __name((placeholderValues) => {
		return this._prepare().run(placeholderValues);
	}, "run");
	all = /* @__PURE__ */ __name((placeholderValues) => {
		return this._prepare().all(placeholderValues);
	}, "all");
	get = /* @__PURE__ */ __name((placeholderValues) => {
		return this._prepare().get(placeholderValues);
	}, "get");
	values = /* @__PURE__ */ __name((placeholderValues) => {
		return this._prepare().values(placeholderValues);
	}, "values");
	async execute(placeholderValues) {
		return this._prepare().execute(placeholderValues);
	}
	$dynamic() {
		return this;
	}
};
function toSnakeCase(input) {
	const words =
		input
			.replace(/['\u2019]/g, "")
			.match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? [];
	return words.map((word) => word.toLowerCase()).join("_");
}
__name(toSnakeCase, "toSnakeCase");
function toCamelCase(input) {
	const words =
		input
			.replace(/['\u2019]/g, "")
			.match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? [];
	return words.reduce((acc, word, i) => {
		const formattedWord =
			i === 0 ? word.toLowerCase() : `${word[0].toUpperCase()}${word.slice(1)}`;
		return acc + formattedWord;
	}, "");
}
__name(toCamelCase, "toCamelCase");
function noopCase(input) {
	return input;
}
__name(noopCase, "noopCase");
var CasingCache = class {
	static {
		__name(this, "CasingCache");
	}
	static [entityKind] = "CasingCache";
	cache = {};
	cachedTables = {};
	convert;
	constructor(casing) {
		this.convert =
			casing === "snake_case"
				? toSnakeCase
				: casing === "camelCase"
					? toCamelCase
					: noopCase;
	}
	getColumnCasing(column) {
		if (!column.keyAsName) return column.name;
		const schema = column.table[Table.Symbol.Schema] ?? "public";
		const tableName = column.table[Table.Symbol.OriginalName];
		const key = `${schema}.${tableName}.${column.name}`;
		if (!this.cache[key]) {
			this.cacheTable(column.table);
		}
		return this.cache[key];
	}
	cacheTable(table3) {
		const schema = table3[Table.Symbol.Schema] ?? "public";
		const tableName = table3[Table.Symbol.OriginalName];
		const tableKey = `${schema}.${tableName}`;
		if (!this.cachedTables[tableKey]) {
			for (const column of Object.values(table3[Table.Symbol.Columns])) {
				const columnKey = `${tableKey}.${column.name}`;
				this.cache[columnKey] = this.convert(column.name);
			}
			this.cachedTables[tableKey] = true;
		}
	}
	clearCache() {
		this.cache = {};
		this.cachedTables = {};
	}
};
var DrizzleError = class extends Error {
	static {
		__name(this, "DrizzleError");
	}
	static [entityKind] = "DrizzleError";
	constructor({ message: message2, cause }) {
		super(message2);
		this.name = "DrizzleError";
		this.cause = cause;
	}
};
var DrizzleQueryError = class _DrizzleQueryError extends Error {
	static {
		__name(_DrizzleQueryError, "DrizzleQueryError");
	}
	constructor(query, params, cause) {
		super(`Failed query: ${query}
params: ${params}`);
		this.query = query;
		this.params = params;
		this.cause = cause;
		Error.captureStackTrace(this, _DrizzleQueryError);
		if (cause) this.cause = cause;
	}
};
var TransactionRollbackError = class extends DrizzleError {
	static {
		__name(this, "TransactionRollbackError");
	}
	static [entityKind] = "TransactionRollbackError";
	constructor() {
		super({ message: "Rollback" });
	}
};
var InlineForeignKeys2 = Symbol.for("drizzle:PgInlineForeignKeys");
var EnableRLS = Symbol.for("drizzle:EnableRLS");
var PgTable = class extends Table {
	static {
		__name(this, "PgTable");
	}
	static [entityKind] = "PgTable";
	static Symbol = Object.assign({}, Table.Symbol, {
		InlineForeignKeys: InlineForeignKeys2,
		EnableRLS,
	});
	[InlineForeignKeys2] = [];
	[EnableRLS] = false;
	[Table.Symbol.ExtraConfigBuilder] = void 0;
	[Table.Symbol.ExtraConfigColumns] = {};
};
var PrimaryKeyBuilder = class {
	static {
		__name(this, "PrimaryKeyBuilder");
	}
	static [entityKind] = "PgPrimaryKeyBuilder";
	columns;
	name;
	constructor(columns, name) {
		this.columns = columns;
		this.name = name;
	}
	build(table3) {
		return new PrimaryKey(table3, this.columns, this.name);
	}
};
var PrimaryKey = class {
	static {
		__name(this, "PrimaryKey");
	}
	constructor(table3, columns, name) {
		this.table = table3;
		this.columns = columns;
		this.name = name;
	}
	static [entityKind] = "PgPrimaryKey";
	columns;
	name;
	getName() {
		return (
			this.name ??
			`${this.table[PgTable.Symbol.Name]}_${this.columns.map((column) => column.name).join("_")}_pk`
		);
	}
};
function asc(column) {
	return sql`${column} asc`;
}
__name(asc, "asc");
function desc(column) {
	return sql`${column} desc`;
}
__name(desc, "desc");
var Relation = class {
	static {
		__name(this, "Relation");
	}
	constructor(sourceTable, referencedTable, relationName) {
		this.sourceTable = sourceTable;
		this.referencedTable = referencedTable;
		this.relationName = relationName;
		this.referencedTableName = referencedTable[Table.Symbol.Name];
	}
	static [entityKind] = "Relation";
	referencedTableName;
	fieldName;
};
var Relations = class {
	static {
		__name(this, "Relations");
	}
	constructor(table3, config2) {
		this.table = table3;
		this.config = config2;
	}
	static [entityKind] = "Relations";
};
var One = class _One extends Relation {
	static {
		__name(_One, "One");
	}
	constructor(sourceTable, referencedTable, config2, isNullable) {
		super(sourceTable, referencedTable, config2?.relationName);
		this.config = config2;
		this.isNullable = isNullable;
	}
	static [entityKind] = "One";
	withFieldName(fieldName) {
		const relation = new _One(
			this.sourceTable,
			this.referencedTable,
			this.config,
			this.isNullable,
		);
		relation.fieldName = fieldName;
		return relation;
	}
};
var Many = class _Many extends Relation {
	static {
		__name(_Many, "Many");
	}
	constructor(sourceTable, referencedTable, config2) {
		super(sourceTable, referencedTable, config2?.relationName);
		this.config = config2;
	}
	static [entityKind] = "Many";
	withFieldName(fieldName) {
		const relation = new _Many(
			this.sourceTable,
			this.referencedTable,
			this.config,
		);
		relation.fieldName = fieldName;
		return relation;
	}
};
function getOperators() {
	return {
		and,
		between,
		eq,
		exists,
		gt,
		gte,
		ilike,
		inArray,
		isNull,
		isNotNull,
		like,
		lt,
		lte,
		ne,
		not,
		notBetween,
		notExists,
		notLike,
		notIlike,
		notInArray,
		or,
		sql,
	};
}
__name(getOperators, "getOperators");
function getOrderByOperators() {
	return {
		sql,
		asc,
		desc,
	};
}
__name(getOrderByOperators, "getOrderByOperators");
function extractTablesRelationalConfig(schema, configHelpers) {
	if (
		Object.keys(schema).length === 1 &&
		"default" in schema &&
		!is(schema["default"], Table)
	) {
		schema = schema["default"];
	}
	const tableNamesMap = {};
	const relationsBuffer = {};
	const tablesConfig = {};
	for (const [key, value] of Object.entries(schema)) {
		if (is(value, Table)) {
			const dbName = getTableUniqueName(value);
			const bufferedRelations = relationsBuffer[dbName];
			tableNamesMap[dbName] = key;
			tablesConfig[key] = {
				tsName: key,
				dbName: value[Table.Symbol.Name],
				schema: value[Table.Symbol.Schema],
				columns: value[Table.Symbol.Columns],
				relations: bufferedRelations?.relations ?? {},
				primaryKey: bufferedRelations?.primaryKey ?? [],
			};
			for (const column of Object.values(value[Table.Symbol.Columns])) {
				if (column.primary) {
					tablesConfig[key].primaryKey.push(column);
				}
			}
			const extraConfig = value[Table.Symbol.ExtraConfigBuilder]?.(
				value[Table.Symbol.ExtraConfigColumns],
			);
			if (extraConfig) {
				for (const configEntry of Object.values(extraConfig)) {
					if (is(configEntry, PrimaryKeyBuilder)) {
						tablesConfig[key].primaryKey.push(...configEntry.columns);
					}
				}
			}
		} else if (is(value, Relations)) {
			const dbName = getTableUniqueName(value.table);
			const tableName = tableNamesMap[dbName];
			const relations2 = value.config(configHelpers(value.table));
			let primaryKey;
			for (const [relationName, relation] of Object.entries(relations2)) {
				if (tableName) {
					const tableConfig = tablesConfig[tableName];
					tableConfig.relations[relationName] = relation;
					if (primaryKey) {
						tableConfig.primaryKey.push(...primaryKey);
					}
				} else {
					if (!(dbName in relationsBuffer)) {
						relationsBuffer[dbName] = {
							relations: {},
							primaryKey,
						};
					}
					relationsBuffer[dbName].relations[relationName] = relation;
				}
			}
		}
	}
	return { tables: tablesConfig, tableNamesMap };
}
__name(extractTablesRelationalConfig, "extractTablesRelationalConfig");
function createOne(sourceTable) {
	return /* @__PURE__ */ __name(function one(table3, config2) {
		return new One(
			sourceTable,
			table3,
			config2,
			config2?.fields.reduce((res, f) => res && f.notNull, true) ?? false,
		);
	}, "one");
}
__name(createOne, "createOne");
function createMany(sourceTable) {
	return /* @__PURE__ */ __name(function many(referencedTable, config2) {
		return new Many(sourceTable, referencedTable, config2);
	}, "many");
}
__name(createMany, "createMany");
function normalizeRelation(schema, tableNamesMap, relation) {
	if (is(relation, One) && relation.config) {
		return {
			fields: relation.config.fields,
			references: relation.config.references,
		};
	}
	const referencedTableTsName =
		tableNamesMap[getTableUniqueName(relation.referencedTable)];
	if (!referencedTableTsName) {
		throw new Error(
			`Table "${relation.referencedTable[Table.Symbol.Name]}" not found in schema`,
		);
	}
	const referencedTableConfig = schema[referencedTableTsName];
	if (!referencedTableConfig) {
		throw new Error(`Table "${referencedTableTsName}" not found in schema`);
	}
	const sourceTable = relation.sourceTable;
	const sourceTableTsName = tableNamesMap[getTableUniqueName(sourceTable)];
	if (!sourceTableTsName) {
		throw new Error(
			`Table "${sourceTable[Table.Symbol.Name]}" not found in schema`,
		);
	}
	const reverseRelations = [];
	for (const referencedTableRelation of Object.values(
		referencedTableConfig.relations,
	)) {
		if (
			(relation.relationName &&
				relation !== referencedTableRelation &&
				referencedTableRelation.relationName === relation.relationName) ||
			(!relation.relationName &&
				referencedTableRelation.referencedTable === relation.sourceTable)
		) {
			reverseRelations.push(referencedTableRelation);
		}
	}
	if (reverseRelations.length > 1) {
		throw relation.relationName
			? new Error(
					`There are multiple relations with name "${relation.relationName}" in table "${referencedTableTsName}"`,
				)
			: new Error(
					`There are multiple relations between "${referencedTableTsName}" and "${relation.sourceTable[Table.Symbol.Name]}". Please specify relation name`,
				);
	}
	if (
		reverseRelations[0] &&
		is(reverseRelations[0], One) &&
		reverseRelations[0].config
	) {
		return {
			fields: reverseRelations[0].config.references,
			references: reverseRelations[0].config.fields,
		};
	}
	throw new Error(
		`There is not enough information to infer relation "${sourceTableTsName}.${relation.fieldName}"`,
	);
}
__name(normalizeRelation, "normalizeRelation");
function createTableRelationsHelpers(sourceTable) {
	return {
		one: createOne(sourceTable),
		many: createMany(sourceTable),
	};
}
__name(createTableRelationsHelpers, "createTableRelationsHelpers");
function mapRelationalRow(
	tablesConfig,
	tableConfig,
	row,
	buildQueryResultSelection,
	mapColumnValue = (value) => value,
) {
	const result = {};
	for (const [
		selectionItemIndex,
		selectionItem,
	] of buildQueryResultSelection.entries()) {
		if (selectionItem.isJson) {
			const relation = tableConfig.relations[selectionItem.tsKey];
			const rawSubRows = row[selectionItemIndex];
			const subRows =
				typeof rawSubRows === "string" ? JSON.parse(rawSubRows) : rawSubRows;
			result[selectionItem.tsKey] = is(relation, One)
				? subRows &&
					mapRelationalRow(
						tablesConfig,
						tablesConfig[selectionItem.relationTableTsKey],
						subRows,
						selectionItem.selection,
						mapColumnValue,
					)
				: subRows.map((subRow) =>
						mapRelationalRow(
							tablesConfig,
							tablesConfig[selectionItem.relationTableTsKey],
							subRow,
							selectionItem.selection,
							mapColumnValue,
						),
					);
		} else {
			const value = mapColumnValue(row[selectionItemIndex]);
			const field = selectionItem.field;
			let decoder2;
			if (is(field, Column)) {
				decoder2 = field;
			} else if (is(field, SQL)) {
				decoder2 = field.decoder;
			} else {
				decoder2 = field.sql.decoder;
			}
			result[selectionItem.tsKey] =
				value === null ? null : decoder2.mapFromDriverValue(value);
		}
	}
	return result;
}
__name(mapRelationalRow, "mapRelationalRow");
var SQLiteViewBase = class extends View {
	static {
		__name(this, "SQLiteViewBase");
	}
	static [entityKind] = "SQLiteViewBase";
};
var SQLiteDialect = class {
	static {
		__name(this, "SQLiteDialect");
	}
	static [entityKind] = "SQLiteDialect";
	casing;
	constructor(config2) {
		this.casing = new CasingCache(config2?.casing);
	}
	escapeName(name) {
		return `"${name}"`;
	}
	escapeParam(_num) {
		return "?";
	}
	escapeString(str) {
		return `'${str.replace(/'/g, "''")}'`;
	}
	buildWithCTE(queries) {
		if (!queries?.length) return;
		const withSqlChunks = [sql`with `];
		for (const [i, w] of queries.entries()) {
			withSqlChunks.push(sql`${sql.identifier(w._.alias)} as (${w._.sql})`);
			if (i < queries.length - 1) {
				withSqlChunks.push(sql`, `);
			}
		}
		withSqlChunks.push(sql` `);
		return sql.join(withSqlChunks);
	}
	buildDeleteQuery({
		table: table3,
		where,
		returning,
		withList,
		limit,
		orderBy,
	}) {
		const withSql = this.buildWithCTE(withList);
		const returningSql = returning
			? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}`
			: void 0;
		const whereSql = where ? sql` where ${where}` : void 0;
		const orderBySql = this.buildOrderBy(orderBy);
		const limitSql = this.buildLimit(limit);
		return sql`${withSql}delete from ${table3}${whereSql}${returningSql}${orderBySql}${limitSql}`;
	}
	buildUpdateSet(table3, set) {
		const tableColumns = table3[Table.Symbol.Columns];
		const columnNames = Object.keys(tableColumns).filter(
			(colName) =>
				set[colName] !== void 0 || tableColumns[colName]?.onUpdateFn !== void 0,
		);
		const setSize = columnNames.length;
		return sql.join(
			columnNames.flatMap((colName, i) => {
				const col = tableColumns[colName];
				const onUpdateFnResult = col.onUpdateFn?.();
				const value =
					set[colName] ??
					(is(onUpdateFnResult, SQL)
						? onUpdateFnResult
						: sql.param(onUpdateFnResult, col));
				const res = sql`${sql.identifier(this.casing.getColumnCasing(col))} = ${value}`;
				if (i < setSize - 1) {
					return [res, sql.raw(", ")];
				}
				return [res];
			}),
		);
	}
	buildUpdateQuery({
		table: table3,
		set,
		where,
		returning,
		withList,
		joins,
		from,
		limit,
		orderBy,
	}) {
		const withSql = this.buildWithCTE(withList);
		const setSql = this.buildUpdateSet(table3, set);
		const fromSql =
			from && sql.join([sql.raw(" from "), this.buildFromTable(from)]);
		const joinsSql = this.buildJoins(joins);
		const returningSql = returning
			? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}`
			: void 0;
		const whereSql = where ? sql` where ${where}` : void 0;
		const orderBySql = this.buildOrderBy(orderBy);
		const limitSql = this.buildLimit(limit);
		return sql`${withSql}update ${table3} set ${setSql}${fromSql}${joinsSql}${whereSql}${returningSql}${orderBySql}${limitSql}`;
	}
	buildSelection(fields, { isSingleTable = false } = {}) {
		const columnsLen = fields.length;
		const chunks = fields.flatMap(({ field }, i) => {
			const chunk = [];
			if (is(field, SQL.Aliased) && field.isSelectionField) {
				chunk.push(sql.identifier(field.fieldAlias));
			} else if (is(field, SQL.Aliased) || is(field, SQL)) {
				const query = is(field, SQL.Aliased) ? field.sql : field;
				if (isSingleTable) {
					chunk.push(
						new SQL(
							query.queryChunks.map((c) => {
								if (is(c, Column)) {
									return sql.identifier(this.casing.getColumnCasing(c));
								}
								return c;
							}),
						),
					);
				} else {
					chunk.push(query);
				}
				if (is(field, SQL.Aliased)) {
					chunk.push(sql` as ${sql.identifier(field.fieldAlias)}`);
				}
			} else if (is(field, Column)) {
				const tableName = field.table[Table.Symbol.Name];
				if (field.columnType === "SQLiteNumericBigInt") {
					if (isSingleTable) {
						chunk.push(
							sql`cast(${sql.identifier(this.casing.getColumnCasing(field))} as text)`,
						);
					} else {
						chunk.push(
							sql`cast(${sql.identifier(tableName)}.${sql.identifier(this.casing.getColumnCasing(field))} as text)`,
						);
					}
				} else {
					if (isSingleTable) {
						chunk.push(sql.identifier(this.casing.getColumnCasing(field)));
					} else {
						chunk.push(
							sql`${sql.identifier(tableName)}.${sql.identifier(this.casing.getColumnCasing(field))}`,
						);
					}
				}
			} else if (is(field, Subquery)) {
				const entries = Object.entries(field._.selectedFields);
				if (entries.length === 1) {
					const entry = entries[0][1];
					const fieldDecoder = is(entry, SQL)
						? entry.decoder
						: is(entry, Column)
							? {
									mapFromDriverValue: /* @__PURE__ */ __name(
										(v) => entry.mapFromDriverValue(v),
										"mapFromDriverValue",
									),
								}
							: entry.sql.decoder;
					if (fieldDecoder) field._.sql.decoder = fieldDecoder;
				}
				chunk.push(field);
			}
			if (i < columnsLen - 1) {
				chunk.push(sql`, `);
			}
			return chunk;
		});
		return sql.join(chunks);
	}
	buildJoins(joins) {
		if (!joins || joins.length === 0) {
			return;
		}
		const joinsArray = [];
		if (joins) {
			for (const [index, joinMeta] of joins.entries()) {
				if (index === 0) {
					joinsArray.push(sql` `);
				}
				const table3 = joinMeta.table;
				const onSql = joinMeta.on ? sql` on ${joinMeta.on}` : void 0;
				if (is(table3, SQLiteTable)) {
					const tableName = table3[SQLiteTable.Symbol.Name];
					const tableSchema = table3[SQLiteTable.Symbol.Schema];
					const origTableName = table3[SQLiteTable.Symbol.OriginalName];
					const alias = tableName === origTableName ? void 0 : joinMeta.alias;
					joinsArray.push(
						sql`${sql.raw(joinMeta.joinType)} join ${tableSchema ? sql`${sql.identifier(tableSchema)}.` : void 0}${sql.identifier(origTableName)}${alias && sql` ${sql.identifier(alias)}`}${onSql}`,
					);
				} else {
					joinsArray.push(
						sql`${sql.raw(joinMeta.joinType)} join ${table3}${onSql}`,
					);
				}
				if (index < joins.length - 1) {
					joinsArray.push(sql` `);
				}
			}
		}
		return sql.join(joinsArray);
	}
	buildLimit(limit) {
		return typeof limit === "object" ||
			(typeof limit === "number" && limit >= 0)
			? sql` limit ${limit}`
			: void 0;
	}
	buildOrderBy(orderBy) {
		const orderByList = [];
		if (orderBy) {
			for (const [index, orderByValue] of orderBy.entries()) {
				orderByList.push(orderByValue);
				if (index < orderBy.length - 1) {
					orderByList.push(sql`, `);
				}
			}
		}
		return orderByList.length > 0
			? sql` order by ${sql.join(orderByList)}`
			: void 0;
	}
	buildFromTable(table3) {
		if (is(table3, Table) && table3[Table.Symbol.IsAlias]) {
			return sql`${sql`${sql.identifier(table3[Table.Symbol.Schema] ?? "")}.`.if(table3[Table.Symbol.Schema])}${sql.identifier(table3[Table.Symbol.OriginalName])} ${sql.identifier(table3[Table.Symbol.Name])}`;
		}
		return table3;
	}
	buildSelectQuery({
		withList,
		fields,
		fieldsFlat,
		where,
		having,
		table: table3,
		joins,
		orderBy,
		groupBy,
		limit,
		offset,
		distinct,
		setOperators,
	}) {
		const fieldsList = fieldsFlat ?? orderSelectedFields(fields);
		for (const f of fieldsList) {
			if (
				is(f.field, Column) &&
				getTableName(f.field.table) !==
					(is(table3, Subquery)
						? table3._.alias
						: is(table3, SQLiteViewBase)
							? table3[ViewBaseConfig].name
							: is(table3, SQL)
								? void 0
								: getTableName(table3)) &&
				!((table22) =>
					joins?.some(
						({ alias }) =>
							alias ===
							(table22[Table.Symbol.IsAlias]
								? getTableName(table22)
								: table22[Table.Symbol.BaseName]),
					))(f.field.table)
			) {
				const tableName = getTableName(f.field.table);
				throw new Error(
					`Your "${f.path.join("->")}" field references a column "${tableName}"."${f.field.name}", but the table "${tableName}" is not part of the query! Did you forget to join it?`,
				);
			}
		}
		const isSingleTable = !joins || joins.length === 0;
		const withSql = this.buildWithCTE(withList);
		const distinctSql = distinct ? sql` distinct` : void 0;
		const selection = this.buildSelection(fieldsList, { isSingleTable });
		const tableSql = this.buildFromTable(table3);
		const joinsSql = this.buildJoins(joins);
		const whereSql = where ? sql` where ${where}` : void 0;
		const havingSql = having ? sql` having ${having}` : void 0;
		const groupByList = [];
		if (groupBy) {
			for (const [index, groupByValue] of groupBy.entries()) {
				groupByList.push(groupByValue);
				if (index < groupBy.length - 1) {
					groupByList.push(sql`, `);
				}
			}
		}
		const groupBySql =
			groupByList.length > 0 ? sql` group by ${sql.join(groupByList)}` : void 0;
		const orderBySql = this.buildOrderBy(orderBy);
		const limitSql = this.buildLimit(limit);
		const offsetSql = offset ? sql` offset ${offset}` : void 0;
		const finalQuery = sql`${withSql}select${distinctSql} ${selection} from ${tableSql}${joinsSql}${whereSql}${groupBySql}${havingSql}${orderBySql}${limitSql}${offsetSql}`;
		if (setOperators.length > 0) {
			return this.buildSetOperations(finalQuery, setOperators);
		}
		return finalQuery;
	}
	buildSetOperations(leftSelect, setOperators) {
		const [setOperator, ...rest] = setOperators;
		if (!setOperator) {
			throw new Error("Cannot pass undefined values to any set operator");
		}
		if (rest.length === 0) {
			return this.buildSetOperationQuery({ leftSelect, setOperator });
		}
		return this.buildSetOperations(
			this.buildSetOperationQuery({ leftSelect, setOperator }),
			rest,
		);
	}
	buildSetOperationQuery({
		leftSelect,
		setOperator: { type, isAll, rightSelect, limit, orderBy, offset },
	}) {
		const leftChunk = sql`${leftSelect.getSQL()} `;
		const rightChunk = sql`${rightSelect.getSQL()}`;
		let orderBySql;
		if (orderBy && orderBy.length > 0) {
			const orderByValues = [];
			for (const singleOrderBy of orderBy) {
				if (is(singleOrderBy, SQLiteColumn)) {
					orderByValues.push(sql.identifier(singleOrderBy.name));
				} else if (is(singleOrderBy, SQL)) {
					for (let i = 0; i < singleOrderBy.queryChunks.length; i++) {
						const chunk = singleOrderBy.queryChunks[i];
						if (is(chunk, SQLiteColumn)) {
							singleOrderBy.queryChunks[i] = sql.identifier(
								this.casing.getColumnCasing(chunk),
							);
						}
					}
					orderByValues.push(sql`${singleOrderBy}`);
				} else {
					orderByValues.push(sql`${singleOrderBy}`);
				}
			}
			orderBySql = sql` order by ${sql.join(orderByValues, sql`, `)}`;
		}
		const limitSql =
			typeof limit === "object" || (typeof limit === "number" && limit >= 0)
				? sql` limit ${limit}`
				: void 0;
		const operatorChunk = sql.raw(`${type} ${isAll ? "all " : ""}`);
		const offsetSql = offset ? sql` offset ${offset}` : void 0;
		return sql`${leftChunk}${operatorChunk}${rightChunk}${orderBySql}${limitSql}${offsetSql}`;
	}
	buildInsertQuery({
		table: table3,
		values: valuesOrSelect,
		onConflict,
		returning,
		withList,
		select,
	}) {
		const valuesSqlList = [];
		const columns = table3[Table.Symbol.Columns];
		const colEntries = Object.entries(columns).filter(
			([_, col]) => !col.shouldDisableInsert(),
		);
		const insertOrder = colEntries.map(([, column]) =>
			sql.identifier(this.casing.getColumnCasing(column)),
		);
		if (select) {
			const select2 = valuesOrSelect;
			if (is(select2, SQL)) {
				valuesSqlList.push(select2);
			} else {
				valuesSqlList.push(select2.getSQL());
			}
		} else {
			const values = valuesOrSelect;
			valuesSqlList.push(sql.raw("values "));
			for (const [valueIndex, value] of values.entries()) {
				const valueList = [];
				for (const [fieldName, col] of colEntries) {
					const colValue = value[fieldName];
					if (
						colValue === void 0 ||
						(is(colValue, Param) && colValue.value === void 0)
					) {
						let defaultValue;
						if (col.default !== null && col.default !== void 0) {
							defaultValue = is(col.default, SQL)
								? col.default
								: sql.param(col.default, col);
						} else if (col.defaultFn !== void 0) {
							const defaultFnResult = col.defaultFn();
							defaultValue = is(defaultFnResult, SQL)
								? defaultFnResult
								: sql.param(defaultFnResult, col);
						} else if (!col.default && col.onUpdateFn !== void 0) {
							const onUpdateFnResult = col.onUpdateFn();
							defaultValue = is(onUpdateFnResult, SQL)
								? onUpdateFnResult
								: sql.param(onUpdateFnResult, col);
						} else {
							defaultValue = sql`null`;
						}
						valueList.push(defaultValue);
					} else {
						valueList.push(colValue);
					}
				}
				valuesSqlList.push(valueList);
				if (valueIndex < values.length - 1) {
					valuesSqlList.push(sql`, `);
				}
			}
		}
		const withSql = this.buildWithCTE(withList);
		const valuesSql = sql.join(valuesSqlList);
		const returningSql = returning
			? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}`
			: void 0;
		const onConflictSql = onConflict?.length ? sql.join(onConflict) : void 0;
		return sql`${withSql}insert into ${table3} ${insertOrder} ${valuesSql}${onConflictSql}${returningSql}`;
	}
	sqlToQuery(sql2, invokeSource) {
		return sql2.toQuery({
			casing: this.casing,
			escapeName: this.escapeName,
			escapeParam: this.escapeParam,
			escapeString: this.escapeString,
			invokeSource,
		});
	}
	buildRelationalQuery({
		fullSchema,
		schema,
		tableNamesMap,
		table: table3,
		tableConfig,
		queryConfig: config2,
		tableAlias,
		nestedQueryRelation,
		joinOn,
	}) {
		let selection = [];
		let limit,
			offset,
			orderBy = [],
			where;
		const joins = [];
		if (config2 === true) {
			const selectionEntries = Object.entries(tableConfig.columns);
			selection = selectionEntries.map(([key, value]) => ({
				dbKey: value.name,
				tsKey: key,
				field: aliasedTableColumn(value, tableAlias),
				relationTableTsKey: void 0,
				isJson: false,
				selection: [],
			}));
		} else {
			const aliasedColumns = Object.fromEntries(
				Object.entries(tableConfig.columns).map(([key, value]) => [
					key,
					aliasedTableColumn(value, tableAlias),
				]),
			);
			if (config2.where) {
				const whereSql =
					typeof config2.where === "function"
						? config2.where(aliasedColumns, getOperators())
						: config2.where;
				where = whereSql && mapColumnsInSQLToAlias(whereSql, tableAlias);
			}
			const fieldsSelection = [];
			let selectedColumns = [];
			if (config2.columns) {
				let isIncludeMode = false;
				for (const [field, value] of Object.entries(config2.columns)) {
					if (value === void 0) {
						continue;
					}
					if (field in tableConfig.columns) {
						if (!isIncludeMode && value === true) {
							isIncludeMode = true;
						}
						selectedColumns.push(field);
					}
				}
				if (selectedColumns.length > 0) {
					selectedColumns = isIncludeMode
						? selectedColumns.filter((c) => config2.columns?.[c] === true)
						: Object.keys(tableConfig.columns).filter(
								(key) => !selectedColumns.includes(key),
							);
				}
			} else {
				selectedColumns = Object.keys(tableConfig.columns);
			}
			for (const field of selectedColumns) {
				const column = tableConfig.columns[field];
				fieldsSelection.push({ tsKey: field, value: column });
			}
			let selectedRelations = [];
			if (config2.with) {
				selectedRelations = Object.entries(config2.with)
					.filter((entry) => !!entry[1])
					.map(([tsKey, queryConfig]) => ({
						tsKey,
						queryConfig,
						relation: tableConfig.relations[tsKey],
					}));
			}
			let extras;
			if (config2.extras) {
				extras =
					typeof config2.extras === "function"
						? config2.extras(aliasedColumns, { sql })
						: config2.extras;
				for (const [tsKey, value] of Object.entries(extras)) {
					fieldsSelection.push({
						tsKey,
						value: mapColumnsInAliasedSQLToAlias(value, tableAlias),
					});
				}
			}
			for (const { tsKey, value } of fieldsSelection) {
				selection.push({
					dbKey: is(value, SQL.Aliased)
						? value.fieldAlias
						: tableConfig.columns[tsKey].name,
					tsKey,
					field: is(value, Column)
						? aliasedTableColumn(value, tableAlias)
						: value,
					relationTableTsKey: void 0,
					isJson: false,
					selection: [],
				});
			}
			let orderByOrig =
				typeof config2.orderBy === "function"
					? config2.orderBy(aliasedColumns, getOrderByOperators())
					: (config2.orderBy ?? []);
			if (!Array.isArray(orderByOrig)) {
				orderByOrig = [orderByOrig];
			}
			orderBy = orderByOrig.map((orderByValue) => {
				if (is(orderByValue, Column)) {
					return aliasedTableColumn(orderByValue, tableAlias);
				}
				return mapColumnsInSQLToAlias(orderByValue, tableAlias);
			});
			limit = config2.limit;
			offset = config2.offset;
			for (const {
				tsKey: selectedRelationTsKey,
				queryConfig: selectedRelationConfigValue,
				relation,
			} of selectedRelations) {
				const normalizedRelation = normalizeRelation(
					schema,
					tableNamesMap,
					relation,
				);
				const relationTableName = getTableUniqueName(relation.referencedTable);
				const relationTableTsName = tableNamesMap[relationTableName];
				const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
				const joinOn2 = and(
					...normalizedRelation.fields.map((field2, i) =>
						eq(
							aliasedTableColumn(
								normalizedRelation.references[i],
								relationTableAlias,
							),
							aliasedTableColumn(field2, tableAlias),
						),
					),
				);
				const builtRelation = this.buildRelationalQuery({
					fullSchema,
					schema,
					tableNamesMap,
					table: fullSchema[relationTableTsName],
					tableConfig: schema[relationTableTsName],
					queryConfig: is(relation, One)
						? selectedRelationConfigValue === true
							? { limit: 1 }
							: { ...selectedRelationConfigValue, limit: 1 }
						: selectedRelationConfigValue,
					tableAlias: relationTableAlias,
					joinOn: joinOn2,
					nestedQueryRelation: relation,
				});
				const field = sql`(${builtRelation.sql})`.as(selectedRelationTsKey);
				selection.push({
					dbKey: selectedRelationTsKey,
					tsKey: selectedRelationTsKey,
					field,
					relationTableTsKey: relationTableTsName,
					isJson: true,
					selection: builtRelation.selection,
				});
			}
		}
		if (selection.length === 0) {
			throw new DrizzleError({
				message: `No fields selected for table "${tableConfig.tsName}" ("${tableAlias}"). You need to have at least one item in "columns", "with" or "extras". If you need to select all columns, omit the "columns" key or set it to undefined.`,
			});
		}
		let result;
		where = and(joinOn, where);
		if (nestedQueryRelation) {
			let field = sql`json_array(${sql.join(
				selection.map(({ field: field2 }) =>
					is(field2, SQLiteColumn)
						? sql.identifier(this.casing.getColumnCasing(field2))
						: is(field2, SQL.Aliased)
							? field2.sql
							: field2,
				),
				sql`, `,
			)})`;
			if (is(nestedQueryRelation, Many)) {
				field = sql`coalesce(json_group_array(${field}), json_array())`;
			}
			const nestedSelection = [
				{
					dbKey: "data",
					tsKey: "data",
					field: field.as("data"),
					isJson: true,
					relationTableTsKey: tableConfig.tsName,
					selection,
				},
			];
			const needsSubquery =
				limit !== void 0 || offset !== void 0 || orderBy.length > 0;
			if (needsSubquery) {
				result = this.buildSelectQuery({
					table: aliasedTable(table3, tableAlias),
					fields: {},
					fieldsFlat: [
						{
							path: [],
							field: sql.raw("*"),
						},
					],
					where,
					limit,
					offset,
					orderBy,
					setOperators: [],
				});
				where = void 0;
				limit = void 0;
				offset = void 0;
				orderBy = void 0;
			} else {
				result = aliasedTable(table3, tableAlias);
			}
			result = this.buildSelectQuery({
				table: is(result, SQLiteTable)
					? result
					: new Subquery(result, {}, tableAlias),
				fields: {},
				fieldsFlat: nestedSelection.map(({ field: field2 }) => ({
					path: [],
					field: is(field2, Column)
						? aliasedTableColumn(field2, tableAlias)
						: field2,
				})),
				joins,
				where,
				limit,
				offset,
				orderBy,
				setOperators: [],
			});
		} else {
			result = this.buildSelectQuery({
				table: aliasedTable(table3, tableAlias),
				fields: {},
				fieldsFlat: selection.map(({ field }) => ({
					path: [],
					field: is(field, Column)
						? aliasedTableColumn(field, tableAlias)
						: field,
				})),
				joins,
				where,
				limit,
				offset,
				orderBy,
				setOperators: [],
			});
		}
		return {
			tableTsKey: tableConfig.tsName,
			sql: result,
			selection,
		};
	}
};
var SQLiteSyncDialect = class extends SQLiteDialect {
	static {
		__name(this, "SQLiteSyncDialect");
	}
	static [entityKind] = "SQLiteSyncDialect";
	migrate(migrations, session, config2) {
		const migrationsTable =
			config2 === void 0
				? "__drizzle_migrations"
				: typeof config2 === "string"
					? "__drizzle_migrations"
					: (config2.migrationsTable ?? "__drizzle_migrations");
		const migrationTableCreate = sql`
			CREATE TABLE IF NOT EXISTS ${sql.identifier(migrationsTable)} (
				id SERIAL PRIMARY KEY,
				hash text NOT NULL,
				created_at numeric
			)
		`;
		session.run(migrationTableCreate);
		const dbMigrations = session.values(
			sql`SELECT id, hash, created_at FROM ${sql.identifier(migrationsTable)} ORDER BY created_at DESC LIMIT 1`,
		);
		const lastDbMigration = dbMigrations[0] ?? void 0;
		session.run(sql`BEGIN`);
		try {
			for (const migration of migrations) {
				if (
					!lastDbMigration ||
					Number(lastDbMigration[2]) < migration.folderMillis
				) {
					for (const stmt of migration.sql) {
						session.run(sql.raw(stmt));
					}
					session.run(
						sql`INSERT INTO ${sql.identifier(migrationsTable)} ("hash", "created_at") VALUES(${migration.hash}, ${migration.folderMillis})`,
					);
				}
			}
			session.run(sql`COMMIT`);
		} catch (e) {
			session.run(sql`ROLLBACK`);
			throw e;
		}
	}
};
var SQLiteAsyncDialect = class extends SQLiteDialect {
	static {
		__name(this, "SQLiteAsyncDialect");
	}
	static [entityKind] = "SQLiteAsyncDialect";
	async migrate(migrations, session, config2) {
		const migrationsTable =
			config2 === void 0
				? "__drizzle_migrations"
				: typeof config2 === "string"
					? "__drizzle_migrations"
					: (config2.migrationsTable ?? "__drizzle_migrations");
		const migrationTableCreate = sql`
			CREATE TABLE IF NOT EXISTS ${sql.identifier(migrationsTable)} (
				id SERIAL PRIMARY KEY,
				hash text NOT NULL,
				created_at numeric
			)
		`;
		await session.run(migrationTableCreate);
		const dbMigrations = await session.values(
			sql`SELECT id, hash, created_at FROM ${sql.identifier(migrationsTable)} ORDER BY created_at DESC LIMIT 1`,
		);
		const lastDbMigration = dbMigrations[0] ?? void 0;
		await session.transaction(async (tx) => {
			for (const migration of migrations) {
				if (
					!lastDbMigration ||
					Number(lastDbMigration[2]) < migration.folderMillis
				) {
					for (const stmt of migration.sql) {
						await tx.run(sql.raw(stmt));
					}
					await tx.run(
						sql`INSERT INTO ${sql.identifier(migrationsTable)} ("hash", "created_at") VALUES(${migration.hash}, ${migration.folderMillis})`,
					);
				}
			}
		});
	}
};
var TypedQueryBuilder = class {
	static {
		__name(this, "TypedQueryBuilder");
	}
	static [entityKind] = "TypedQueryBuilder";
	getSelectedFields() {
		return this._.selectedFields;
	}
};
var SQLiteSelectBuilder = class {
	static {
		__name(this, "SQLiteSelectBuilder");
	}
	static [entityKind] = "SQLiteSelectBuilder";
	fields;
	session;
	dialect;
	withList;
	distinct;
	constructor(config2) {
		this.fields = config2.fields;
		this.session = config2.session;
		this.dialect = config2.dialect;
		this.withList = config2.withList;
		this.distinct = config2.distinct;
	}
	from(source) {
		const isPartialSelect = !!this.fields;
		let fields;
		if (this.fields) {
			fields = this.fields;
		} else if (is(source, Subquery)) {
			fields = Object.fromEntries(
				Object.keys(source._.selectedFields).map((key) => [key, source[key]]),
			);
		} else if (is(source, SQLiteViewBase)) {
			fields = source[ViewBaseConfig].selectedFields;
		} else if (is(source, SQL)) {
			fields = {};
		} else {
			fields = getTableColumns(source);
		}
		return new SQLiteSelectBase({
			table: source,
			fields,
			isPartialSelect,
			session: this.session,
			dialect: this.dialect,
			withList: this.withList,
			distinct: this.distinct,
		});
	}
};
var SQLiteSelectQueryBuilderBase = class extends TypedQueryBuilder {
	static {
		__name(this, "SQLiteSelectQueryBuilderBase");
	}
	static [entityKind] = "SQLiteSelectQueryBuilder";
	_;
	config;
	joinsNotNullableMap;
	tableName;
	isPartialSelect;
	session;
	dialect;
	cacheConfig = void 0;
	usedTables = /* @__PURE__ */ new Set();
	constructor({
		table: table3,
		fields,
		isPartialSelect,
		session,
		dialect,
		withList,
		distinct,
	}) {
		super();
		this.config = {
			withList,
			table: table3,
			fields: { ...fields },
			distinct,
			setOperators: [],
		};
		this.isPartialSelect = isPartialSelect;
		this.session = session;
		this.dialect = dialect;
		this._ = {
			selectedFields: fields,
			config: this.config,
		};
		this.tableName = getTableLikeName(table3);
		this.joinsNotNullableMap =
			typeof this.tableName === "string" ? { [this.tableName]: true } : {};
		for (const item of extractUsedTable(table3)) this.usedTables.add(item);
	}
	getUsedTables() {
		return [...this.usedTables];
	}
	createJoin(joinType) {
		return (table3, on2) => {
			const baseTableName = this.tableName;
			const tableName = getTableLikeName(table3);
			for (const item of extractUsedTable(table3)) this.usedTables.add(item);
			if (
				typeof tableName === "string" &&
				this.config.joins?.some((join) => join.alias === tableName)
			) {
				throw new Error(`Alias "${tableName}" is already used in this query`);
			}
			if (!this.isPartialSelect) {
				if (
					Object.keys(this.joinsNotNullableMap).length === 1 &&
					typeof baseTableName === "string"
				) {
					this.config.fields = {
						[baseTableName]: this.config.fields,
					};
				}
				if (typeof tableName === "string" && !is(table3, SQL)) {
					const selection = is(table3, Subquery)
						? table3._.selectedFields
						: is(table3, View)
							? table3[ViewBaseConfig].selectedFields
							: table3[Table.Symbol.Columns];
					this.config.fields[tableName] = selection;
				}
			}
			if (typeof on2 === "function") {
				on2 = on2(
					new Proxy(
						this.config.fields,
						new SelectionProxyHandler({
							sqlAliasedBehavior: "sql",
							sqlBehavior: "sql",
						}),
					),
				);
			}
			if (!this.config.joins) {
				this.config.joins = [];
			}
			this.config.joins.push({
				on: on2,
				table: table3,
				joinType,
				alias: tableName,
			});
			if (typeof tableName === "string") {
				switch (joinType) {
					case "left": {
						this.joinsNotNullableMap[tableName] = false;
						break;
					}
					case "right": {
						this.joinsNotNullableMap = Object.fromEntries(
							Object.entries(this.joinsNotNullableMap).map(([key]) => [
								key,
								false,
							]),
						);
						this.joinsNotNullableMap[tableName] = true;
						break;
					}
					case "cross":
					case "inner": {
						this.joinsNotNullableMap[tableName] = true;
						break;
					}
					case "full": {
						this.joinsNotNullableMap = Object.fromEntries(
							Object.entries(this.joinsNotNullableMap).map(([key]) => [
								key,
								false,
							]),
						);
						this.joinsNotNullableMap[tableName] = false;
						break;
					}
				}
			}
			return this;
		};
	}
	leftJoin = this.createJoin("left");
	rightJoin = this.createJoin("right");
	innerJoin = this.createJoin("inner");
	fullJoin = this.createJoin("full");
	crossJoin = this.createJoin("cross");
	createSetOperator(type, isAll) {
		return (rightSelection) => {
			const rightSelect =
				typeof rightSelection === "function"
					? rightSelection(getSQLiteSetOperators())
					: rightSelection;
			if (
				!haveSameKeys(this.getSelectedFields(), rightSelect.getSelectedFields())
			) {
				throw new Error(
					"Set operator error (union / intersect / except): selected fields are not the same or are in a different order",
				);
			}
			this.config.setOperators.push({ type, isAll, rightSelect });
			return this;
		};
	}
	union = this.createSetOperator("union", false);
	unionAll = this.createSetOperator("union", true);
	intersect = this.createSetOperator("intersect", false);
	except = this.createSetOperator("except", false);
	addSetOperators(setOperators) {
		this.config.setOperators.push(...setOperators);
		return this;
	}
	where(where) {
		if (typeof where === "function") {
			where = where(
				new Proxy(
					this.config.fields,
					new SelectionProxyHandler({
						sqlAliasedBehavior: "sql",
						sqlBehavior: "sql",
					}),
				),
			);
		}
		this.config.where = where;
		return this;
	}
	having(having) {
		if (typeof having === "function") {
			having = having(
				new Proxy(
					this.config.fields,
					new SelectionProxyHandler({
						sqlAliasedBehavior: "sql",
						sqlBehavior: "sql",
					}),
				),
			);
		}
		this.config.having = having;
		return this;
	}
	groupBy(...columns) {
		if (typeof columns[0] === "function") {
			const groupBy = columns[0](
				new Proxy(
					this.config.fields,
					new SelectionProxyHandler({
						sqlAliasedBehavior: "alias",
						sqlBehavior: "sql",
					}),
				),
			);
			this.config.groupBy = Array.isArray(groupBy) ? groupBy : [groupBy];
		} else {
			this.config.groupBy = columns;
		}
		return this;
	}
	orderBy(...columns) {
		if (typeof columns[0] === "function") {
			const orderBy = columns[0](
				new Proxy(
					this.config.fields,
					new SelectionProxyHandler({
						sqlAliasedBehavior: "alias",
						sqlBehavior: "sql",
					}),
				),
			);
			const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
			if (this.config.setOperators.length > 0) {
				this.config.setOperators.at(-1).orderBy = orderByArray;
			} else {
				this.config.orderBy = orderByArray;
			}
		} else {
			const orderByArray = columns;
			if (this.config.setOperators.length > 0) {
				this.config.setOperators.at(-1).orderBy = orderByArray;
			} else {
				this.config.orderBy = orderByArray;
			}
		}
		return this;
	}
	limit(limit) {
		if (this.config.setOperators.length > 0) {
			this.config.setOperators.at(-1).limit = limit;
		} else {
			this.config.limit = limit;
		}
		return this;
	}
	offset(offset) {
		if (this.config.setOperators.length > 0) {
			this.config.setOperators.at(-1).offset = offset;
		} else {
			this.config.offset = offset;
		}
		return this;
	}
	getSQL() {
		return this.dialect.buildSelectQuery(this.config);
	}
	toSQL() {
		const { typings: _typings, ...rest } = this.dialect.sqlToQuery(
			this.getSQL(),
		);
		return rest;
	}
	as(alias) {
		const usedTables = [];
		usedTables.push(...extractUsedTable(this.config.table));
		if (this.config.joins) {
			for (const it of this.config.joins)
				usedTables.push(...extractUsedTable(it.table));
		}
		return new Proxy(
			new Subquery(this.getSQL(), this.config.fields, alias, false, [
				...new Set(usedTables),
			]),
			new SelectionProxyHandler({
				alias,
				sqlAliasedBehavior: "alias",
				sqlBehavior: "error",
			}),
		);
	}
	getSelectedFields() {
		return new Proxy(
			this.config.fields,
			new SelectionProxyHandler({
				alias: this.tableName,
				sqlAliasedBehavior: "alias",
				sqlBehavior: "error",
			}),
		);
	}
	$dynamic() {
		return this;
	}
};
var SQLiteSelectBase = class extends SQLiteSelectQueryBuilderBase {
	static {
		__name(this, "SQLiteSelectBase");
	}
	static [entityKind] = "SQLiteSelect";
	_prepare(isOneTimeQuery = true) {
		if (!this.session) {
			throw new Error(
				"Cannot execute a query on a query builder. Please use a database instance instead.",
			);
		}
		const fieldsList = orderSelectedFields(this.config.fields);
		const query = this.session[
			isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"
		](
			this.dialect.sqlToQuery(this.getSQL()),
			fieldsList,
			"all",
			true,
			void 0,
			{
				type: "select",
				tables: [...this.usedTables],
			},
			this.cacheConfig,
		);
		query.joinsNotNullableMap = this.joinsNotNullableMap;
		return query;
	}
	$withCache(config2) {
		this.cacheConfig =
			config2 === void 0
				? { config: {}, enable: true, autoInvalidate: true }
				: config2 === false
					? { enable: false }
					: { enable: true, autoInvalidate: true, ...config2 };
		return this;
	}
	prepare() {
		return this._prepare(false);
	}
	run = /* @__PURE__ */ __name((placeholderValues) => {
		return this._prepare().run(placeholderValues);
	}, "run");
	all = /* @__PURE__ */ __name((placeholderValues) => {
		return this._prepare().all(placeholderValues);
	}, "all");
	get = /* @__PURE__ */ __name((placeholderValues) => {
		return this._prepare().get(placeholderValues);
	}, "get");
	values = /* @__PURE__ */ __name((placeholderValues) => {
		return this._prepare().values(placeholderValues);
	}, "values");
	async execute() {
		return this.all();
	}
};
applyMixins(SQLiteSelectBase, [QueryPromise]);
function createSetOperator(type, isAll) {
	return (leftSelect, rightSelect, ...restSelects) => {
		const setOperators = [rightSelect, ...restSelects].map((select) => ({
			type,
			isAll,
			rightSelect: select,
		}));
		for (const setOperator of setOperators) {
			if (
				!haveSameKeys(
					leftSelect.getSelectedFields(),
					setOperator.rightSelect.getSelectedFields(),
				)
			) {
				throw new Error(
					"Set operator error (union / intersect / except): selected fields are not the same or are in a different order",
				);
			}
		}
		return leftSelect.addSetOperators(setOperators);
	};
}
__name(createSetOperator, "createSetOperator");
var getSQLiteSetOperators = /* @__PURE__ */ __name(
	() => ({
		union,
		unionAll,
		intersect,
		except,
	}),
	"getSQLiteSetOperators",
);
var union = createSetOperator("union", false);
var unionAll = createSetOperator("union", true);
var intersect = createSetOperator("intersect", false);
var except = createSetOperator("except", false);
var QueryBuilder = class {
	static {
		__name(this, "QueryBuilder");
	}
	static [entityKind] = "SQLiteQueryBuilder";
	dialect;
	dialectConfig;
	constructor(dialect) {
		this.dialect = is(dialect, SQLiteDialect) ? dialect : void 0;
		this.dialectConfig = is(dialect, SQLiteDialect) ? void 0 : dialect;
	}
	$with = /* @__PURE__ */ __name((alias, selection) => {
		const queryBuilder = this;
		const as = /* @__PURE__ */ __name((qb) => {
			if (typeof qb === "function") {
				qb = qb(queryBuilder);
			}
			return new Proxy(
				new WithSubquery(
					qb.getSQL(),
					selection ??
						("getSelectedFields" in qb ? (qb.getSelectedFields() ?? {}) : {}),
					alias,
					true,
				),
				new SelectionProxyHandler({
					alias,
					sqlAliasedBehavior: "alias",
					sqlBehavior: "error",
				}),
			);
		}, "as");
		return { as };
	}, "$with");
	with(...queries) {
		const self = this;
		function select(fields) {
			return new SQLiteSelectBuilder({
				fields: fields ?? void 0,
				session: void 0,
				dialect: self.getDialect(),
				withList: queries,
			});
		}
		__name(select, "select");
		function selectDistinct(fields) {
			return new SQLiteSelectBuilder({
				fields: fields ?? void 0,
				session: void 0,
				dialect: self.getDialect(),
				withList: queries,
				distinct: true,
			});
		}
		__name(selectDistinct, "selectDistinct");
		return { select, selectDistinct };
	}
	select(fields) {
		return new SQLiteSelectBuilder({
			fields: fields ?? void 0,
			session: void 0,
			dialect: this.getDialect(),
		});
	}
	selectDistinct(fields) {
		return new SQLiteSelectBuilder({
			fields: fields ?? void 0,
			session: void 0,
			dialect: this.getDialect(),
			distinct: true,
		});
	}
	getDialect() {
		if (!this.dialect) {
			this.dialect = new SQLiteSyncDialect(this.dialectConfig);
		}
		return this.dialect;
	}
};
var SQLiteInsertBuilder = class {
	static {
		__name(this, "SQLiteInsertBuilder");
	}
	constructor(table3, session, dialect, withList) {
		this.table = table3;
		this.session = session;
		this.dialect = dialect;
		this.withList = withList;
	}
	static [entityKind] = "SQLiteInsertBuilder";
	values(values) {
		values = Array.isArray(values) ? values : [values];
		if (values.length === 0) {
			throw new Error("values() must be called with at least one value");
		}
		const mappedValues = values.map((entry) => {
			const result = {};
			const cols = this.table[Table.Symbol.Columns];
			for (const colKey of Object.keys(entry)) {
				const colValue = entry[colKey];
				result[colKey] = is(colValue, SQL)
					? colValue
					: new Param(colValue, cols[colKey]);
			}
			return result;
		});
		return new SQLiteInsertBase(
			this.table,
			mappedValues,
			this.session,
			this.dialect,
			this.withList,
		);
	}
	select(selectQuery) {
		const select =
			typeof selectQuery === "function"
				? selectQuery(new QueryBuilder())
				: selectQuery;
		if (
			!is(select, SQL) &&
			!haveSameKeys(this.table[Columns], select._.selectedFields)
		) {
			throw new Error(
				"Insert select error: selected fields are not the same or are in a different order compared to the table definition",
			);
		}
		return new SQLiteInsertBase(
			this.table,
			select,
			this.session,
			this.dialect,
			this.withList,
			true,
		);
	}
};
var SQLiteInsertBase = class extends QueryPromise {
	static {
		__name(this, "SQLiteInsertBase");
	}
	constructor(table3, values, session, dialect, withList, select) {
		super();
		this.session = session;
		this.dialect = dialect;
		this.config = { table: table3, values, withList, select };
	}
	static [entityKind] = "SQLiteInsert";
	config;
	returning(fields = this.config.table[SQLiteTable.Symbol.Columns]) {
		this.config.returning = orderSelectedFields(fields);
		return this;
	}
	onConflictDoNothing(config2 = {}) {
		if (!this.config.onConflict) this.config.onConflict = [];
		if (config2.target === void 0) {
			this.config.onConflict.push(sql` on conflict do nothing`);
		} else {
			const targetSql = Array.isArray(config2.target)
				? sql`${config2.target}`
				: sql`${[config2.target]}`;
			const whereSql = config2.where ? sql` where ${config2.where}` : sql``;
			this.config.onConflict.push(
				sql` on conflict ${targetSql} do nothing${whereSql}`,
			);
		}
		return this;
	}
	onConflictDoUpdate(config2) {
		if (config2.where && (config2.targetWhere || config2.setWhere)) {
			throw new Error(
				'You cannot use both "where" and "targetWhere"/"setWhere" at the same time - "where" is deprecated, use "targetWhere" or "setWhere" instead.',
			);
		}
		if (!this.config.onConflict) this.config.onConflict = [];
		const whereSql = config2.where ? sql` where ${config2.where}` : void 0;
		const targetWhereSql = config2.targetWhere
			? sql` where ${config2.targetWhere}`
			: void 0;
		const setWhereSql = config2.setWhere
			? sql` where ${config2.setWhere}`
			: void 0;
		const targetSql = Array.isArray(config2.target)
			? sql`${config2.target}`
			: sql`${[config2.target]}`;
		const setSql = this.dialect.buildUpdateSet(
			this.config.table,
			mapUpdateSet(this.config.table, config2.set),
		);
		this.config.onConflict.push(
			sql` on conflict ${targetSql}${targetWhereSql} do update set ${setSql}${whereSql}${setWhereSql}`,
		);
		return this;
	}
	getSQL() {
		return this.dialect.buildInsertQuery(this.config);
	}
	toSQL() {
		const { typings: _typings, ...rest } = this.dialect.sqlToQuery(
			this.getSQL(),
		);
		return rest;
	}
	_prepare(isOneTimeQuery = true) {
		return this.session[
			isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"
		](
			this.dialect.sqlToQuery(this.getSQL()),
			this.config.returning,
			this.config.returning ? "all" : "run",
			true,
			void 0,
			{
				type: "insert",
				tables: extractUsedTable(this.config.table),
			},
		);
	}
	prepare() {
		return this._prepare(false);
	}
	run = /* @__PURE__ */ __name((placeholderValues) => {
		return this._prepare().run(placeholderValues);
	}, "run");
	all = /* @__PURE__ */ __name((placeholderValues) => {
		return this._prepare().all(placeholderValues);
	}, "all");
	get = /* @__PURE__ */ __name((placeholderValues) => {
		return this._prepare().get(placeholderValues);
	}, "get");
	values = /* @__PURE__ */ __name((placeholderValues) => {
		return this._prepare().values(placeholderValues);
	}, "values");
	async execute() {
		return this.config.returning ? this.all() : this.run();
	}
	$dynamic() {
		return this;
	}
};
var SQLiteUpdateBuilder = class {
	static {
		__name(this, "SQLiteUpdateBuilder");
	}
	constructor(table3, session, dialect, withList) {
		this.table = table3;
		this.session = session;
		this.dialect = dialect;
		this.withList = withList;
	}
	static [entityKind] = "SQLiteUpdateBuilder";
	set(values) {
		return new SQLiteUpdateBase(
			this.table,
			mapUpdateSet(this.table, values),
			this.session,
			this.dialect,
			this.withList,
		);
	}
};
var SQLiteUpdateBase = class extends QueryPromise {
	static {
		__name(this, "SQLiteUpdateBase");
	}
	constructor(table3, set, session, dialect, withList) {
		super();
		this.session = session;
		this.dialect = dialect;
		this.config = { set, table: table3, withList, joins: [] };
	}
	static [entityKind] = "SQLiteUpdate";
	config;
	from(source) {
		this.config.from = source;
		return this;
	}
	createJoin(joinType) {
		return (table3, on2) => {
			const tableName = getTableLikeName(table3);
			if (
				typeof tableName === "string" &&
				this.config.joins.some((join) => join.alias === tableName)
			) {
				throw new Error(`Alias "${tableName}" is already used in this query`);
			}
			if (typeof on2 === "function") {
				const from = this.config.from
					? is(table3, SQLiteTable)
						? table3[Table.Symbol.Columns]
						: is(table3, Subquery)
							? table3._.selectedFields
							: is(table3, SQLiteViewBase)
								? table3[ViewBaseConfig].selectedFields
								: void 0
					: void 0;
				on2 = on2(
					new Proxy(
						this.config.table[Table.Symbol.Columns],
						new SelectionProxyHandler({
							sqlAliasedBehavior: "sql",
							sqlBehavior: "sql",
						}),
					),
					from &&
						new Proxy(
							from,
							new SelectionProxyHandler({
								sqlAliasedBehavior: "sql",
								sqlBehavior: "sql",
							}),
						),
				);
			}
			this.config.joins.push({
				on: on2,
				table: table3,
				joinType,
				alias: tableName,
			});
			return this;
		};
	}
	leftJoin = this.createJoin("left");
	rightJoin = this.createJoin("right");
	innerJoin = this.createJoin("inner");
	fullJoin = this.createJoin("full");
	where(where) {
		this.config.where = where;
		return this;
	}
	orderBy(...columns) {
		if (typeof columns[0] === "function") {
			const orderBy = columns[0](
				new Proxy(
					this.config.table[Table.Symbol.Columns],
					new SelectionProxyHandler({
						sqlAliasedBehavior: "alias",
						sqlBehavior: "sql",
					}),
				),
			);
			const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
			this.config.orderBy = orderByArray;
		} else {
			const orderByArray = columns;
			this.config.orderBy = orderByArray;
		}
		return this;
	}
	limit(limit) {
		this.config.limit = limit;
		return this;
	}
	returning(fields = this.config.table[SQLiteTable.Symbol.Columns]) {
		this.config.returning = orderSelectedFields(fields);
		return this;
	}
	getSQL() {
		return this.dialect.buildUpdateQuery(this.config);
	}
	toSQL() {
		const { typings: _typings, ...rest } = this.dialect.sqlToQuery(
			this.getSQL(),
		);
		return rest;
	}
	_prepare(isOneTimeQuery = true) {
		return this.session[
			isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"
		](
			this.dialect.sqlToQuery(this.getSQL()),
			this.config.returning,
			this.config.returning ? "all" : "run",
			true,
			void 0,
			{
				type: "insert",
				tables: extractUsedTable(this.config.table),
			},
		);
	}
	prepare() {
		return this._prepare(false);
	}
	run = /* @__PURE__ */ __name((placeholderValues) => {
		return this._prepare().run(placeholderValues);
	}, "run");
	all = /* @__PURE__ */ __name((placeholderValues) => {
		return this._prepare().all(placeholderValues);
	}, "all");
	get = /* @__PURE__ */ __name((placeholderValues) => {
		return this._prepare().get(placeholderValues);
	}, "get");
	values = /* @__PURE__ */ __name((placeholderValues) => {
		return this._prepare().values(placeholderValues);
	}, "values");
	async execute() {
		return this.config.returning ? this.all() : this.run();
	}
	$dynamic() {
		return this;
	}
};
var SQLiteCountBuilder = class _SQLiteCountBuilder extends SQL {
	static {
		__name(_SQLiteCountBuilder, "SQLiteCountBuilder");
	}
	constructor(params) {
		super(
			_SQLiteCountBuilder.buildEmbeddedCount(params.source, params.filters)
				.queryChunks,
		);
		this.params = params;
		this.session = params.session;
		this.sql = _SQLiteCountBuilder.buildCount(params.source, params.filters);
	}
	sql;
	static [entityKind] = "SQLiteCountBuilderAsync";
	[Symbol.toStringTag] = "SQLiteCountBuilderAsync";
	session;
	static buildEmbeddedCount(source, filters) {
		return sql`(select count(*) from ${source}${sql.raw(" where ").if(filters)}${filters})`;
	}
	static buildCount(source, filters) {
		return sql`select count(*) from ${source}${sql.raw(" where ").if(filters)}${filters}`;
	}
	then(onfulfilled, onrejected) {
		return Promise.resolve(this.session.count(this.sql)).then(
			onfulfilled,
			onrejected,
		);
	}
	catch(onRejected) {
		return this.then(void 0, onRejected);
	}
	finally(onFinally) {
		return this.then(
			(value) => {
				onFinally?.();
				return value;
			},
			(reason) => {
				onFinally?.();
				throw reason;
			},
		);
	}
};
var RelationalQueryBuilder = class {
	static {
		__name(this, "RelationalQueryBuilder");
	}
	constructor(
		mode,
		fullSchema,
		schema,
		tableNamesMap,
		table3,
		tableConfig,
		dialect,
		session,
	) {
		this.mode = mode;
		this.fullSchema = fullSchema;
		this.schema = schema;
		this.tableNamesMap = tableNamesMap;
		this.table = table3;
		this.tableConfig = tableConfig;
		this.dialect = dialect;
		this.session = session;
	}
	static [entityKind] = "SQLiteAsyncRelationalQueryBuilder";
	findMany(config2) {
		return this.mode === "sync"
			? new SQLiteSyncRelationalQuery(
					this.fullSchema,
					this.schema,
					this.tableNamesMap,
					this.table,
					this.tableConfig,
					this.dialect,
					this.session,
					config2 ? config2 : {},
					"many",
				)
			: new SQLiteRelationalQuery(
					this.fullSchema,
					this.schema,
					this.tableNamesMap,
					this.table,
					this.tableConfig,
					this.dialect,
					this.session,
					config2 ? config2 : {},
					"many",
				);
	}
	findFirst(config2) {
		return this.mode === "sync"
			? new SQLiteSyncRelationalQuery(
					this.fullSchema,
					this.schema,
					this.tableNamesMap,
					this.table,
					this.tableConfig,
					this.dialect,
					this.session,
					config2 ? { ...config2, limit: 1 } : { limit: 1 },
					"first",
				)
			: new SQLiteRelationalQuery(
					this.fullSchema,
					this.schema,
					this.tableNamesMap,
					this.table,
					this.tableConfig,
					this.dialect,
					this.session,
					config2 ? { ...config2, limit: 1 } : { limit: 1 },
					"first",
				);
	}
};
var SQLiteRelationalQuery = class extends QueryPromise {
	static {
		__name(this, "SQLiteRelationalQuery");
	}
	constructor(
		fullSchema,
		schema,
		tableNamesMap,
		table3,
		tableConfig,
		dialect,
		session,
		config2,
		mode,
	) {
		super();
		this.fullSchema = fullSchema;
		this.schema = schema;
		this.tableNamesMap = tableNamesMap;
		this.table = table3;
		this.tableConfig = tableConfig;
		this.dialect = dialect;
		this.session = session;
		this.config = config2;
		this.mode = mode;
	}
	static [entityKind] = "SQLiteAsyncRelationalQuery";
	mode;
	getSQL() {
		return this.dialect.buildRelationalQuery({
			fullSchema: this.fullSchema,
			schema: this.schema,
			tableNamesMap: this.tableNamesMap,
			table: this.table,
			tableConfig: this.tableConfig,
			queryConfig: this.config,
			tableAlias: this.tableConfig.tsName,
		}).sql;
	}
	_prepare(isOneTimeQuery = false) {
		const { query, builtQuery } = this._toSQL();
		return this.session[
			isOneTimeQuery ? "prepareOneTimeQuery" : "prepareQuery"
		](
			builtQuery,
			void 0,
			this.mode === "first" ? "get" : "all",
			true,
			(rawRows, mapColumnValue) => {
				const rows = rawRows.map((row) =>
					mapRelationalRow(
						this.schema,
						this.tableConfig,
						row,
						query.selection,
						mapColumnValue,
					),
				);
				if (this.mode === "first") {
					return rows[0];
				}
				return rows;
			},
		);
	}
	prepare() {
		return this._prepare(false);
	}
	_toSQL() {
		const query = this.dialect.buildRelationalQuery({
			fullSchema: this.fullSchema,
			schema: this.schema,
			tableNamesMap: this.tableNamesMap,
			table: this.table,
			tableConfig: this.tableConfig,
			queryConfig: this.config,
			tableAlias: this.tableConfig.tsName,
		});
		const builtQuery = this.dialect.sqlToQuery(query.sql);
		return { query, builtQuery };
	}
	toSQL() {
		return this._toSQL().builtQuery;
	}
	executeRaw() {
		if (this.mode === "first") {
			return this._prepare(false).get();
		}
		return this._prepare(false).all();
	}
	async execute() {
		return this.executeRaw();
	}
};
var SQLiteSyncRelationalQuery = class extends SQLiteRelationalQuery {
	static {
		__name(this, "SQLiteSyncRelationalQuery");
	}
	static [entityKind] = "SQLiteSyncRelationalQuery";
	sync() {
		return this.executeRaw();
	}
};
var SQLiteRaw = class extends QueryPromise {
	static {
		__name(this, "SQLiteRaw");
	}
	constructor(execute, getSQL, action, dialect, mapBatchResult) {
		super();
		this.execute = execute;
		this.getSQL = getSQL;
		this.dialect = dialect;
		this.mapBatchResult = mapBatchResult;
		this.config = { action };
	}
	static [entityKind] = "SQLiteRaw";
	config;
	getQuery() {
		return {
			...this.dialect.sqlToQuery(this.getSQL()),
			method: this.config.action,
		};
	}
	mapResult(result, isFromBatch) {
		return isFromBatch ? this.mapBatchResult(result) : result;
	}
	_prepare() {
		return this;
	}
	isResponseInArrayMode() {
		return false;
	}
};
var BaseSQLiteDatabase = class {
	static {
		__name(this, "BaseSQLiteDatabase");
	}
	constructor(resultKind, dialect, session, schema) {
		this.resultKind = resultKind;
		this.dialect = dialect;
		this.session = session;
		this._ = schema
			? {
					schema: schema.schema,
					fullSchema: schema.fullSchema,
					tableNamesMap: schema.tableNamesMap,
				}
			: {
					schema: void 0,
					fullSchema: {},
					tableNamesMap: {},
				};
		this.query = {};
		const query = this.query;
		if (this._.schema) {
			for (const [tableName, columns] of Object.entries(this._.schema)) {
				query[tableName] = new RelationalQueryBuilder(
					resultKind,
					schema.fullSchema,
					this._.schema,
					this._.tableNamesMap,
					schema.fullSchema[tableName],
					columns,
					dialect,
					session,
				);
			}
		}
		this.$cache = {
			invalidate: /* @__PURE__ */ __name(async (_params) => {}, "invalidate"),
		};
	}
	static [entityKind] = "BaseSQLiteDatabase";
	query;
	$with = /* @__PURE__ */ __name((alias, selection) => {
		const self = this;
		const as = /* @__PURE__ */ __name((qb) => {
			if (typeof qb === "function") {
				qb = qb(new QueryBuilder(self.dialect));
			}
			return new Proxy(
				new WithSubquery(
					qb.getSQL(),
					selection ??
						("getSelectedFields" in qb ? (qb.getSelectedFields() ?? {}) : {}),
					alias,
					true,
				),
				new SelectionProxyHandler({
					alias,
					sqlAliasedBehavior: "alias",
					sqlBehavior: "error",
				}),
			);
		}, "as");
		return { as };
	}, "$with");
	$count(source, filters) {
		return new SQLiteCountBuilder({ source, filters, session: this.session });
	}
	with(...queries) {
		const self = this;
		function select(fields) {
			return new SQLiteSelectBuilder({
				fields: fields ?? void 0,
				session: self.session,
				dialect: self.dialect,
				withList: queries,
			});
		}
		__name(select, "select");
		function selectDistinct(fields) {
			return new SQLiteSelectBuilder({
				fields: fields ?? void 0,
				session: self.session,
				dialect: self.dialect,
				withList: queries,
				distinct: true,
			});
		}
		__name(selectDistinct, "selectDistinct");
		function update(table3) {
			return new SQLiteUpdateBuilder(
				table3,
				self.session,
				self.dialect,
				queries,
			);
		}
		__name(update, "update");
		function insert(into) {
			return new SQLiteInsertBuilder(into, self.session, self.dialect, queries);
		}
		__name(insert, "insert");
		function delete_(from) {
			return new SQLiteDeleteBase(from, self.session, self.dialect, queries);
		}
		__name(delete_, "delete_");
		return { select, selectDistinct, update, insert, delete: delete_ };
	}
	select(fields) {
		return new SQLiteSelectBuilder({
			fields: fields ?? void 0,
			session: this.session,
			dialect: this.dialect,
		});
	}
	selectDistinct(fields) {
		return new SQLiteSelectBuilder({
			fields: fields ?? void 0,
			session: this.session,
			dialect: this.dialect,
			distinct: true,
		});
	}
	update(table3) {
		return new SQLiteUpdateBuilder(table3, this.session, this.dialect);
	}
	$cache;
	insert(into) {
		return new SQLiteInsertBuilder(into, this.session, this.dialect);
	}
	delete(from) {
		return new SQLiteDeleteBase(from, this.session, this.dialect);
	}
	run(query) {
		const sequel = typeof query === "string" ? sql.raw(query) : query.getSQL();
		if (this.resultKind === "async") {
			return new SQLiteRaw(
				async () => this.session.run(sequel),
				() => sequel,
				"run",
				this.dialect,
				this.session.extractRawRunValueFromBatchResult.bind(this.session),
			);
		}
		return this.session.run(sequel);
	}
	all(query) {
		const sequel = typeof query === "string" ? sql.raw(query) : query.getSQL();
		if (this.resultKind === "async") {
			return new SQLiteRaw(
				async () => this.session.all(sequel),
				() => sequel,
				"all",
				this.dialect,
				this.session.extractRawAllValueFromBatchResult.bind(this.session),
			);
		}
		return this.session.all(sequel);
	}
	get(query) {
		const sequel = typeof query === "string" ? sql.raw(query) : query.getSQL();
		if (this.resultKind === "async") {
			return new SQLiteRaw(
				async () => this.session.get(sequel),
				() => sequel,
				"get",
				this.dialect,
				this.session.extractRawGetValueFromBatchResult.bind(this.session),
			);
		}
		return this.session.get(sequel);
	}
	values(query) {
		const sequel = typeof query === "string" ? sql.raw(query) : query.getSQL();
		if (this.resultKind === "async") {
			return new SQLiteRaw(
				async () => this.session.values(sequel),
				() => sequel,
				"values",
				this.dialect,
				this.session.extractRawValuesValueFromBatchResult.bind(this.session),
			);
		}
		return this.session.values(sequel);
	}
	transaction(transaction, config2) {
		return this.session.transaction(transaction, config2);
	}
};
var Cache = class {
	static {
		__name(this, "Cache");
	}
	static [entityKind] = "Cache";
};
var NoopCache = class extends Cache {
	static {
		__name(this, "NoopCache");
	}
	strategy() {
		return "all";
	}
	static [entityKind] = "NoopCache";
	async get(_key) {
		return;
	}
	async put(_hashedQuery, _response, _tables, _config) {}
	async onMutate(_params) {}
};
async function hashQuery(sql2, params) {
	const dataToHash = `${sql2}-${JSON.stringify(params)}`;
	const encoder2 = new TextEncoder();
	const data = encoder2.encode(dataToHash);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = [...new Uint8Array(hashBuffer)];
	const hashHex = hashArray
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	return hashHex;
}
__name(hashQuery, "hashQuery");
var ExecuteResultSync = class extends QueryPromise {
	static {
		__name(this, "ExecuteResultSync");
	}
	constructor(resultCb) {
		super();
		this.resultCb = resultCb;
	}
	static [entityKind] = "ExecuteResultSync";
	async execute() {
		return this.resultCb();
	}
	sync() {
		return this.resultCb();
	}
};
var SQLitePreparedQuery = class {
	static {
		__name(this, "SQLitePreparedQuery");
	}
	constructor(mode, executeMethod, query, cache, queryMetadata, cacheConfig) {
		this.mode = mode;
		this.executeMethod = executeMethod;
		this.query = query;
		this.cache = cache;
		this.queryMetadata = queryMetadata;
		this.cacheConfig = cacheConfig;
		if (cache && cache.strategy() === "all" && cacheConfig === void 0) {
			this.cacheConfig = { enable: true, autoInvalidate: true };
		}
		if (!this.cacheConfig?.enable) {
			this.cacheConfig = void 0;
		}
	}
	static [entityKind] = "PreparedQuery";
	joinsNotNullableMap;
	async queryWithCache(queryString, params, query) {
		if (
			this.cache === void 0 ||
			is(this.cache, NoopCache) ||
			this.queryMetadata === void 0
		) {
			try {
				return await query();
			} catch (e) {
				throw new DrizzleQueryError(queryString, params, e);
			}
		}
		if (this.cacheConfig && !this.cacheConfig.enable) {
			try {
				return await query();
			} catch (e) {
				throw new DrizzleQueryError(queryString, params, e);
			}
		}
		if (
			(this.queryMetadata.type === "insert" ||
				this.queryMetadata.type === "update" ||
				this.queryMetadata.type === "delete") &&
			this.queryMetadata.tables.length > 0
		) {
			try {
				const [res] = await Promise.all([
					query(),
					this.cache.onMutate({ tables: this.queryMetadata.tables }),
				]);
				return res;
			} catch (e) {
				throw new DrizzleQueryError(queryString, params, e);
			}
		}
		if (!this.cacheConfig) {
			try {
				return await query();
			} catch (e) {
				throw new DrizzleQueryError(queryString, params, e);
			}
		}
		if (this.queryMetadata.type === "select") {
			const fromCache = await this.cache.get(
				this.cacheConfig.tag ?? (await hashQuery(queryString, params)),
				this.queryMetadata.tables,
				this.cacheConfig.tag !== void 0,
				this.cacheConfig.autoInvalidate,
			);
			if (fromCache === void 0) {
				let result;
				try {
					result = await query();
				} catch (e) {
					throw new DrizzleQueryError(queryString, params, e);
				}
				await this.cache.put(
					this.cacheConfig.tag ?? (await hashQuery(queryString, params)),
					result,
					this.cacheConfig.autoInvalidate ? this.queryMetadata.tables : [],
					this.cacheConfig.tag !== void 0,
					this.cacheConfig.config,
				);
				return result;
			}
			return fromCache;
		}
		try {
			return await query();
		} catch (e) {
			throw new DrizzleQueryError(queryString, params, e);
		}
	}
	getQuery() {
		return this.query;
	}
	mapRunResult(result, _isFromBatch) {
		return result;
	}
	mapAllResult(_result, _isFromBatch) {
		throw new Error("Not implemented");
	}
	mapGetResult(_result, _isFromBatch) {
		throw new Error("Not implemented");
	}
	execute(placeholderValues) {
		if (this.mode === "async") {
			return this[this.executeMethod](placeholderValues);
		}
		return new ExecuteResultSync(() =>
			this[this.executeMethod](placeholderValues),
		);
	}
	mapResult(response, isFromBatch) {
		switch (this.executeMethod) {
			case "run": {
				return this.mapRunResult(response, isFromBatch);
			}
			case "all": {
				return this.mapAllResult(response, isFromBatch);
			}
			case "get": {
				return this.mapGetResult(response, isFromBatch);
			}
		}
	}
};
var SQLiteSession = class {
	static {
		__name(this, "SQLiteSession");
	}
	constructor(dialect) {
		this.dialect = dialect;
	}
	static [entityKind] = "SQLiteSession";
	prepareOneTimeQuery(
		query,
		fields,
		executeMethod,
		isResponseInArrayMode,
		customResultMapper,
		queryMetadata,
		cacheConfig,
	) {
		return this.prepareQuery(
			query,
			fields,
			executeMethod,
			isResponseInArrayMode,
			customResultMapper,
			queryMetadata,
			cacheConfig,
		);
	}
	run(query) {
		const staticQuery = this.dialect.sqlToQuery(query);
		try {
			return this.prepareOneTimeQuery(staticQuery, void 0, "run", false).run();
		} catch (err) {
			throw new DrizzleError({
				cause: err,
				message: `Failed to run the query '${staticQuery.sql}'`,
			});
		}
	}
	extractRawRunValueFromBatchResult(result) {
		return result;
	}
	all(query) {
		return this.prepareOneTimeQuery(
			this.dialect.sqlToQuery(query),
			void 0,
			"run",
			false,
		).all();
	}
	extractRawAllValueFromBatchResult(_result) {
		throw new Error("Not implemented");
	}
	get(query) {
		return this.prepareOneTimeQuery(
			this.dialect.sqlToQuery(query),
			void 0,
			"run",
			false,
		).get();
	}
	extractRawGetValueFromBatchResult(_result) {
		throw new Error("Not implemented");
	}
	values(query) {
		return this.prepareOneTimeQuery(
			this.dialect.sqlToQuery(query),
			void 0,
			"run",
			false,
		).values();
	}
	async count(sql2) {
		const result = await this.values(sql2);
		return result[0][0];
	}
	extractRawValuesValueFromBatchResult(_result) {
		throw new Error("Not implemented");
	}
};
var SQLiteTransaction = class extends BaseSQLiteDatabase {
	static {
		__name(this, "SQLiteTransaction");
	}
	constructor(resultType, dialect, session, schema, nestedIndex = 0) {
		super(resultType, dialect, session, schema);
		this.schema = schema;
		this.nestedIndex = nestedIndex;
	}
	static [entityKind] = "SQLiteTransaction";
	rollback() {
		throw new TransactionRollbackError();
	}
};
var projectTable = sqliteTable("openauth_webui_projects", {
	clientID: text().primaryKey(),
	created_at: text().notNull(),
	active: integer({
		mode: "boolean",
	}).default(true),
	providers_data: text({
		mode: "json",
	}).default("[]"),
	themeId: text(),
	emailTemplateId: text(),
	projectData: text({
		mode: "json",
	}).default("{}"),
});
var emailTemplatesTable = sqliteTable("openauth_webui_email_templates", {
	name: text().primaryKey(),
	body: text().notNull(),
	subject: text().notNull(),
	created_at: text().notNull(),
	updated_at: text().notNull(),
});
var uiStyleTable = sqliteTable("openauth_webui_ui_styles", {
	id: text().primaryKey(),
	themeData: text({
		mode: "json",
	}).notNull(),
});
var webuiProjectTable = sqliteTable("openauth_webui", {
	key: text().primaryKey(),
	value: text().notNull(),
	expiry: integer(),
});
var WebUiProjectUserTable = sqliteTable("openauth_webui_users", {
	id: text().primaryKey(),
	email: text().notNull().unique(),
	data: text({
		mode: "json",
	}).notNull(),
	created_at: text().notNull(),
});
var ConsoleLogWriter = class {
	static {
		__name(this, "ConsoleLogWriter");
	}
	static [entityKind] = "ConsoleLogWriter";
	write(message2) {
		console.log(message2);
	}
};
var DefaultLogger = class {
	static {
		__name(this, "DefaultLogger");
	}
	static [entityKind] = "DefaultLogger";
	writer;
	constructor(config2) {
		this.writer = config2?.writer ?? new ConsoleLogWriter();
	}
	logQuery(query, params) {
		const stringifiedParams = params.map((p) => {
			try {
				return JSON.stringify(p);
			} catch {
				return String(p);
			}
		});
		const paramsStr = stringifiedParams.length
			? ` -- params: [${stringifiedParams.join(", ")}]`
			: "";
		this.writer.write(`Query: ${query}${paramsStr}`);
	}
};
var NoopLogger = class {
	static {
		__name(this, "NoopLogger");
	}
	static [entityKind] = "NoopLogger";
	logQuery() {}
};
var SQLiteD1Session = class extends SQLiteSession {
	static {
		__name(this, "SQLiteD1Session");
	}
	constructor(client2, dialect, schema, options = {}) {
		super(dialect);
		this.client = client2;
		this.schema = schema;
		this.options = options;
		this.logger = options.logger ?? new NoopLogger();
		this.cache = options.cache ?? new NoopCache();
	}
	static [entityKind] = "SQLiteD1Session";
	logger;
	cache;
	prepareQuery(
		query,
		fields,
		executeMethod,
		isResponseInArrayMode,
		customResultMapper,
		queryMetadata,
		cacheConfig,
	) {
		const stmt = this.client.prepare(query.sql);
		return new D1PreparedQuery(
			stmt,
			query,
			this.logger,
			this.cache,
			queryMetadata,
			cacheConfig,
			fields,
			executeMethod,
			isResponseInArrayMode,
			customResultMapper,
		);
	}
	async batch(queries) {
		const preparedQueries = [];
		const builtQueries = [];
		for (const query of queries) {
			const preparedQuery = query._prepare();
			const builtQuery = preparedQuery.getQuery();
			preparedQueries.push(preparedQuery);
			if (builtQuery.params.length > 0) {
				builtQueries.push(preparedQuery.stmt.bind(...builtQuery.params));
			} else {
				const builtQuery2 = preparedQuery.getQuery();
				builtQueries.push(
					this.client.prepare(builtQuery2.sql).bind(...builtQuery2.params),
				);
			}
		}
		const batchResults = await this.client.batch(builtQueries);
		return batchResults.map((result, i) =>
			preparedQueries[i].mapResult(result, true),
		);
	}
	extractRawAllValueFromBatchResult(result) {
		return result.results;
	}
	extractRawGetValueFromBatchResult(result) {
		return result.results[0];
	}
	extractRawValuesValueFromBatchResult(result) {
		return d1ToRawMapping(result.results);
	}
	async transaction(transaction, config2) {
		const tx = new D1Transaction("async", this.dialect, this, this.schema);
		await this.run(
			sql.raw(`begin${config2?.behavior ? " " + config2.behavior : ""}`),
		);
		try {
			const result = await transaction(tx);
			await this.run(sql`commit`);
			return result;
		} catch (err) {
			await this.run(sql`rollback`);
			throw err;
		}
	}
};
var D1Transaction = class _D1Transaction extends SQLiteTransaction {
	static {
		__name(_D1Transaction, "D1Transaction");
	}
	static [entityKind] = "D1Transaction";
	async transaction(transaction) {
		const savepointName = `sp${this.nestedIndex}`;
		const tx = new _D1Transaction(
			"async",
			this.dialect,
			this.session,
			this.schema,
			this.nestedIndex + 1,
		);
		await this.session.run(sql.raw(`savepoint ${savepointName}`));
		try {
			const result = await transaction(tx);
			await this.session.run(sql.raw(`release savepoint ${savepointName}`));
			return result;
		} catch (err) {
			await this.session.run(sql.raw(`rollback to savepoint ${savepointName}`));
			throw err;
		}
	}
};
function d1ToRawMapping(results) {
	const rows = [];
	for (const row of results) {
		const entry = Object.keys(row).map((k) => row[k]);
		rows.push(entry);
	}
	return rows;
}
__name(d1ToRawMapping, "d1ToRawMapping");
var D1PreparedQuery = class extends SQLitePreparedQuery {
	static {
		__name(this, "D1PreparedQuery");
	}
	constructor(
		stmt,
		query,
		logger,
		cache,
		queryMetadata,
		cacheConfig,
		fields,
		executeMethod,
		_isResponseInArrayMode,
		customResultMapper,
	) {
		super("async", executeMethod, query, cache, queryMetadata, cacheConfig);
		this.logger = logger;
		this._isResponseInArrayMode = _isResponseInArrayMode;
		this.customResultMapper = customResultMapper;
		this.fields = fields;
		this.stmt = stmt;
	}
	static [entityKind] = "D1PreparedQuery";
	customResultMapper;
	fields;
	stmt;
	async run(placeholderValues) {
		const params = fillPlaceholders(this.query.params, placeholderValues ?? {});
		this.logger.logQuery(this.query.sql, params);
		return await this.queryWithCache(this.query.sql, params, async () => {
			return this.stmt.bind(...params).run();
		});
	}
	async all(placeholderValues) {
		const { fields, query, logger, stmt, customResultMapper } = this;
		if (!fields && !customResultMapper) {
			const params = fillPlaceholders(query.params, placeholderValues ?? {});
			logger.logQuery(query.sql, params);
			return await this.queryWithCache(query.sql, params, async () => {
				return stmt
					.bind(...params)
					.all()
					.then(({ results }) => this.mapAllResult(results));
			});
		}
		const rows = await this.values(placeholderValues);
		return this.mapAllResult(rows);
	}
	mapAllResult(rows, isFromBatch) {
		if (isFromBatch) {
			rows = d1ToRawMapping(rows.results);
		}
		if (!this.fields && !this.customResultMapper) {
			return rows;
		}
		if (this.customResultMapper) {
			return this.customResultMapper(rows);
		}
		return rows.map((row) =>
			mapResultRow(this.fields, row, this.joinsNotNullableMap),
		);
	}
	async get(placeholderValues) {
		const {
			fields,
			joinsNotNullableMap,
			query,
			logger,
			stmt,
			customResultMapper,
		} = this;
		if (!fields && !customResultMapper) {
			const params = fillPlaceholders(query.params, placeholderValues ?? {});
			logger.logQuery(query.sql, params);
			return await this.queryWithCache(query.sql, params, async () => {
				return stmt
					.bind(...params)
					.all()
					.then(({ results }) => results[0]);
			});
		}
		const rows = await this.values(placeholderValues);
		if (!rows[0]) {
			return;
		}
		if (customResultMapper) {
			return customResultMapper(rows);
		}
		return mapResultRow(fields, rows[0], joinsNotNullableMap);
	}
	mapGetResult(result, isFromBatch) {
		if (isFromBatch) {
			result = d1ToRawMapping(result.results)[0];
		}
		if (!this.fields && !this.customResultMapper) {
			return result;
		}
		if (this.customResultMapper) {
			return this.customResultMapper([result]);
		}
		return mapResultRow(this.fields, result, this.joinsNotNullableMap);
	}
	async values(placeholderValues) {
		const params = fillPlaceholders(this.query.params, placeholderValues ?? {});
		this.logger.logQuery(this.query.sql, params);
		return await this.queryWithCache(this.query.sql, params, async () => {
			return this.stmt.bind(...params).raw();
		});
	}
	isResponseInArrayMode() {
		return this._isResponseInArrayMode;
	}
};
var DrizzleD1Database = class extends BaseSQLiteDatabase {
	static {
		__name(this, "DrizzleD1Database");
	}
	static [entityKind] = "D1Database";
	async batch(batch) {
		return this.session.batch(batch);
	}
};
function drizzle(client2, config2 = {}) {
	const dialect = new SQLiteAsyncDialect({ casing: config2.casing });
	let logger;
	if (config2.logger === true) {
		logger = new DefaultLogger();
	} else if (config2.logger !== false) {
		logger = config2.logger;
	}
	let schema;
	if (config2.schema) {
		const tablesConfig = extractTablesRelationalConfig(
			config2.schema,
			createTableRelationsHelpers,
		);
		schema = {
			fullSchema: config2.schema,
			schema: tablesConfig.tables,
			tableNamesMap: tablesConfig.tableNamesMap,
		};
	}
	const session = new SQLiteD1Session(client2, dialect, schema, {
		logger,
		cache: config2.cache,
	});
	const db = new DrizzleD1Database("async", dialect, session, schema);
	db.$client = client2;
	db.$cache = config2.cache;
	if (db.$cache) {
		db.$cache["invalidate"] = config2.cache?.onMutate;
	}
	return db;
}
__name(drizzle, "drizzle");
async function requireAuth(request) {
	const cookies = requestToCookie(request);
	const authToken = cookies["access_token"];
	const refresh = cookies["refresh_token"];
	if (!authToken) {
		return new Response("Unauthorized", { status: 401 });
	}
	return client
		.verify(subject, authToken, { refresh })
		.then((res) => {
			return res.err ? new Response("Unauthorized", { status: 401 }) : true;
		})
		.catch(() => {
			return new Response("Unauthorized", { status: 401 });
		});
}
__name(requireAuth, "requireAuth");
function requestToCookie(request) {
	const cookieHeader = request.headers.get("Cookie");
	const cookies = {};
	if (cookieHeader) {
		const cookiePairs = cookieHeader.split(";");
		for (const pair of cookiePairs) {
			const [name, value] = pair.trim().split("=");
			cookies[name] = decodeURIComponent(value);
		}
	}
	return cookies;
}
__name(requestToCookie, "requestToCookie");
function getContext(args) {
	const len = args.length;
	return args[len - 1];
}
__name(getContext, "getContext");

// projects/manage.js
async function GET(params) {
	const ctx = getContext(arguments);
	const auth = await requireAuth(ctx.request);
	if (auth instanceof Response)
		return {
			success: false,
			error: "Unauthorized",
		};
	const db = drizzle(ctx.env.PROJECT_DB);
	const projects = await db
		.select()
		.from(projectTable)
		.where(eq(projectTable.clientID, params.clientID))
		.limit(1);
	const project = projects.at(0);
	if (!project) {
		return {
			success: false,
			error: "Project not found",
		};
	}
	return {
		success: true,
		data: {
			...project,
			providers_data:
				typeof project.providers_data === "string"
					? JSON.parse(project.providers_data)
					: project.providers_data,
			projectData:
				typeof project.projectData === "string"
					? JSON.parse(project.projectData)
					: project.projectData || {},
		},
	};
}
__name(GET, "GET");
async function PUT2(params) {
	const ctx = getContext(arguments);
	const { request, env: env2 } = ctx;
	const auth = await requireAuth(request);
	if (auth instanceof Response)
		return {
			success: false,
			error: "Unauthorized",
		};
	try {
		const db = drizzle(env2.PROJECT_DB);
		const existing = (
			await db
				.select()
				.from(projectTable)
				.where(eq(projectTable.clientID, params.clientID))
				.limit(1)
		).at(0);
		if (!existing) {
			return {
				success: false,
				error: "Project not found",
			};
		}
		const updates = {};
		if (typeof params.data.active === "boolean") {
			updates.active = params.data.active;
		}
		if (params.data.providers_data !== void 0) {
			updates.providers_data = JSON.stringify(params.data.providers_data);
		}
		if (params.data.themeId !== void 0) {
			updates.themeId = params.data.themeId;
		}
		if (params.data.emailTemplateId !== void 0) {
			updates.emailTemplateId = params.data.emailTemplateId;
		}
		if (params.data.projectData !== void 0) {
			updates.projectData = JSON.stringify(params.data.projectData);
		}
		if (Object.keys(updates).length === 0)
			return {
				success: false,
				error: "No valid fields to update",
			};
		await db
			.update(projectTable)
			.set(updates)
			.where(eq(projectTable.clientID, params.clientID));
		const updatedProjects = await db
			.select()
			.from(projectTable)
			.where(eq(projectTable.clientID, params.clientID))
			.limit(1);
		const updated = updatedProjects.at(0);
		if (!updated)
			return {
				success: false,
				error: "Project not found after update",
			};
		return {
			success: true,
			data: {
				...updated,
				providers_data:
					typeof updated.providers_data === "string"
						? JSON.parse(updated.providers_data)
						: updated.providers_data,
				projectData:
					typeof updated.projectData === "string"
						? JSON.parse(updated.projectData)
						: updated.projectData || {},
			},
		};
	} catch (error3) {
		return {
			success: false,
			error: "Invalid request body",
		};
	}
}
__name(PUT2, "PUT");
async function DELETE2(params) {
	const ctx = getContext(arguments);
	const { request, env: env2 } = ctx;
	const auth = await requireAuth(request);
	if (auth instanceof Response)
		return {
			success: false,
			error: "Unauthorized",
		};
	const db = drizzle(env2.PROJECT_DB);
	const existing = await db
		.select()
		.from(projectTable)
		.where(eq(projectTable.clientID, params.clientID))
		.limit(1);
	if (existing.length === 0)
		return {
			success: false,
			error: "Project not found",
		};
	await db
		.delete(projectTable)
		.where(eq(projectTable.clientID, params.clientID));
	return { success: true };
}
__name(DELETE2, "DELETE");
function parseData(formData) {
	const propsArray = [];
	if (!formData) return propsArray;
	const batchsIDs = [];
	for (const [key, value] of Array.from(formData.entries())) {
		if (key.startsWith("FILE_")) propsArray.push(value);
		else if (key.startsWith("FILES_")) {
			if (batchsIDs.includes(key)) continue;
			batchsIDs.push(key);
			propsArray.push(formData.getAll(key));
		} else {
			propsArray.push(JSON.parse(decodeURI(value)));
		}
	}
	return propsArray;
}
__name(parseData, "parseData");
function paramsFromURL(url) {
	const params = url.searchParams
		.entries()
		.toArray()
		.map(([_, v]) => v);
	return params.map((param) => JSON.parse(decodeURIComponent(param)));
}
__name(paramsFromURL, "paramsFromURL");
async function WrapRequestHandler(context2, endpoint) {
	const isServerAction =
		context2.request.headers.get("x-server-action") === "true";
	if (!isServerAction) {
		return new Response("Not Found", { status: 404 });
	}
	const parsedData =
		context2.request.method === "GET" || context2.request.method === "HEAD"
			? paramsFromURL(new URL(context2.request.url))
			: parseData(
					context2.request.headers.get("content-type")
						? await context2.request.formData()
						: void 0,
				);
	const missingProps = endpoint.length - parsedData.length;
	for (let i = 0; i < missingProps; i++) {
		parsedData.push(void 0);
	}
	parsedData.push(context2);
	const result = await endpoint(...parsedData);
	switch (typeof result) {
		case "string":
		case "number":
		case "boolean":
		case "bigint": {
			const res = new Response(JSON.stringify(result));
			res.headers.set("Content-Type", "application/json");
			res.headers.set("dataType", "json");
			return res;
		}
		case "undefined":
			return new Response(null, { status: 204 });
		case "object":
			if (result instanceof Response) {
				result.headers.set("dataType", "response");
				return result;
			} else if (result instanceof Blob) {
				const res2 = new Response(await result.arrayBuffer());
				res2.headers.set("dataType", "blob");
				res2.headers.set("Content-Type", result.type);
				return res2;
			} else if (result instanceof File) {
				const res2 = new Response(await result.arrayBuffer());
				res2.headers.set("dataType", "file");
				res2.headers.set("Content-Type", result.type);
				res2.headers.set(
					"fileData",
					JSON.stringify({
						name: result.name,
						lastModified: result.lastModified,
					}),
				);
				return res2;
			} else {
				return new Response(JSON.stringify(result), {
					headers: { "Content-Type": "application/json", dataType: "json" },
				});
			}
		default:
			throw new Error(`Unsupported return type from action: ${typeof result}`);
	}
}
__name(WrapRequestHandler, "WrapRequestHandler");
var onRequest = /* @__PURE__ */ __name(async (context2) => {
	const method = context2.request.method;
	const options = {
		GET: typeof GET === "function" ? GET : void 0,
		POST: typeof POST === "function" ? POST : void 0,
		PUT: typeof PUT2 === "function" ? PUT2 : void 0,
		DELETE: typeof DELETE2 === "function" ? DELETE2 : void 0,
		PATCH: typeof PATCH === "function" ? PATCH : void 0,
		HEAD: typeof HEAD === "function" ? HEAD : void 0,
		OPTIONS: typeof OPTIONS === "function" ? OPTIONS : void 0,
	};
	if (!options[method]) {
		return new Response(`Method "${method}" Not Allowed`, {
			status: 405,
		});
	}
	return await WrapRequestHandler(context2, options[method]);
}, "onRequest");

// templates/id.js
async function GET2(params) {
	const ctx = getContext(arguments);
	const { request, env: env2 } = ctx;
	const auth = await requireAuth(request);
	if (auth instanceof Response)
		return {
			success: false,
			error: "Unauthorized",
		};
	const db = drizzle(env2.PROJECT_DB);
	const template = await db
		.select()
		.from(emailTemplatesTable)
		.where(eq(emailTemplatesTable.name, params.name))
		.limit(1)
		.get();
	if (!template)
		return {
			success: false,
			error: "Template not found",
		};
	return {
		success: true,
		data: template,
	};
}
__name(GET2, "GET");
async function PUT3(params) {
	const ctx = getContext(arguments);
	const { request, env: env2 } = ctx;
	const auth = await requireAuth(request);
	if (auth instanceof Response)
		return {
			success: false,
			error: "Unauthorized",
		};
	try {
		const db = drizzle(env2.PROJECT_DB);
		const existing = await db
			.select()
			.from(emailTemplatesTable)
			.where(eq(emailTemplatesTable.name, params.name))
			.limit(1)
			.get();
		if (!existing) {
			return {
				success: false,
				error: "Template not found",
			};
		}
		const now = /* @__PURE__ */ new Date().toISOString();
		const updateData = {
			...params.data,
			updated_at: now,
		};
		await db
			.update(emailTemplatesTable)
			.set(updateData)
			.where(eq(emailTemplatesTable.name, params.name));
		const updated = await db
			.select()
			.from(emailTemplatesTable)
			.where(eq(emailTemplatesTable.name, params.name))
			.limit(1)
			.get();
		return {
			success: true,
			data: updated,
		};
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : "Failed to update template",
		};
	}
}
__name(PUT3, "PUT");
async function DELETE3(params) {
	const ctx = getContext(arguments);
	const { request, env: env2 } = ctx;
	const auth = await requireAuth(request);
	if (auth instanceof Response)
		return {
			success: false,
			error: "Unauthorized",
		};
	try {
		const db = drizzle(env2.PROJECT_DB);
		const existing = await db
			.select()
			.from(emailTemplatesTable)
			.where(eq(emailTemplatesTable.name, params.name))
			.limit(1)
			.get();
		if (!existing) {
			return {
				success: false,
				error: "Template not found",
			};
		}
		await db
			.delete(emailTemplatesTable)
			.where(eq(emailTemplatesTable.name, params.name));
		return {
			success: true,
		};
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : "Failed to delete template",
		};
	}
}
__name(DELETE3, "DELETE");
function parseData2(formData) {
	const propsArray = [];
	if (!formData) return propsArray;
	const batchsIDs = [];
	for (const [key, value] of Array.from(formData.entries())) {
		if (key.startsWith("FILE_")) propsArray.push(value);
		else if (key.startsWith("FILES_")) {
			if (batchsIDs.includes(key)) continue;
			batchsIDs.push(key);
			propsArray.push(formData.getAll(key));
		} else {
			propsArray.push(JSON.parse(decodeURI(value)));
		}
	}
	return propsArray;
}
__name(parseData2, "parseData");
function paramsFromURL2(url) {
	const params = url.searchParams
		.entries()
		.toArray()
		.map(([_, v]) => v);
	return params.map((param) => JSON.parse(decodeURIComponent(param)));
}
__name(paramsFromURL2, "paramsFromURL");
async function WrapRequestHandler2(context2, endpoint) {
	const isServerAction =
		context2.request.headers.get("x-server-action") === "true";
	if (!isServerAction) {
		return new Response("Not Found", { status: 404 });
	}
	const parsedData =
		context2.request.method === "GET" || context2.request.method === "HEAD"
			? paramsFromURL2(new URL(context2.request.url))
			: parseData2(
					context2.request.headers.get("content-type")
						? await context2.request.formData()
						: void 0,
				);
	const missingProps = endpoint.length - parsedData.length;
	for (let i = 0; i < missingProps; i++) {
		parsedData.push(void 0);
	}
	parsedData.push(context2);
	const result = await endpoint(...parsedData);
	switch (typeof result) {
		case "string":
		case "number":
		case "boolean":
		case "bigint": {
			const res = new Response(JSON.stringify(result));
			res.headers.set("Content-Type", "application/json");
			res.headers.set("dataType", "json");
			return res;
		}
		case "undefined":
			return new Response(null, { status: 204 });
		case "object":
			if (result instanceof Response) {
				result.headers.set("dataType", "response");
				return result;
			} else if (result instanceof Blob) {
				const res2 = new Response(await result.arrayBuffer());
				res2.headers.set("dataType", "blob");
				res2.headers.set("Content-Type", result.type);
				return res2;
			} else if (result instanceof File) {
				const res2 = new Response(await result.arrayBuffer());
				res2.headers.set("dataType", "file");
				res2.headers.set("Content-Type", result.type);
				res2.headers.set(
					"fileData",
					JSON.stringify({
						name: result.name,
						lastModified: result.lastModified,
					}),
				);
				return res2;
			} else {
				return new Response(JSON.stringify(result), {
					headers: { "Content-Type": "application/json", dataType: "json" },
				});
			}
		default:
			throw new Error(`Unsupported return type from action: ${typeof result}`);
	}
}
__name(WrapRequestHandler2, "WrapRequestHandler");
var onRequest2 = /* @__PURE__ */ __name(async (context2) => {
	const method = context2.request.method;
	const options = {
		GET: typeof GET2 === "function" ? GET2 : void 0,
		POST: typeof POST === "function" ? POST : void 0,
		PUT: typeof PUT3 === "function" ? PUT3 : void 0,
		DELETE: typeof DELETE3 === "function" ? DELETE3 : void 0,
		PATCH: typeof PATCH === "function" ? PATCH : void 0,
		HEAD: typeof HEAD === "function" ? HEAD : void 0,
		OPTIONS: typeof OPTIONS === "function" ? OPTIONS : void 0,
	};
	if (!options[method]) {
		return new Response(`Method "${method}" Not Allowed`, {
			status: 405,
		});
	}
	return await WrapRequestHandler2(context2, options[method]);
}, "onRequest");

// themes/id.js
async function GET3(params) {
	const ctx = getContext(arguments);
	const { request, env: env2 } = ctx;
	const auth = await requireAuth(request);
	if (auth instanceof Response)
		return {
			success: false,
			error: "Unauthorized",
		};
	const { id } = params;
	if (!id) {
		return {
			success: false,
			error: "Theme ID is required",
		};
	}
	const db = drizzle(env2.PROJECT_DB);
	const themes = (
		await db.select().from(uiStyleTable).where(eq(uiStyleTable.id, id)).limit(1)
	).at(0);
	if (!themes) {
		return {
			success: false,
			error: "Theme not found",
		};
	}
	return {
		success: true,
		data: {
			id: themes.id,
			themeData: themes.themeData,
		},
	};
}
__name(GET3, "GET");
async function PUT4(params) {
	const ctx = getContext(arguments);
	const { request, env: env2 } = ctx;
	const auth = await requireAuth(request);
	if (auth instanceof Response)
		return {
			success: false,
			error: "Unauthorized",
		};
	const { id, data } = params;
	if (!id) {
		return {
			success: false,
			error: "Theme ID is required",
		};
	}
	const db = drizzle(env2.PROJECT_DB);
	const existing = await db
		.select()
		.from(uiStyleTable)
		.where(eq(uiStyleTable.id, id))
		.limit(1);
	if (existing.length === 0) {
		return {
			success: false,
			error: "Theme not found",
		};
	}
	const currentTheme = existing.at(0)?.themeData || {};
	const updatedTheme = {
		...currentTheme,
		...data,
	};
	await db
		.update(uiStyleTable)
		.set({
			themeData: updatedTheme,
		})
		.where(eq(uiStyleTable.id, id));
	return {
		success: true,
		data: {
			id,
			themeData: updatedTheme,
		},
	};
}
__name(PUT4, "PUT");
async function DELETE4(params) {
	const ctx = getContext(arguments);
	const { request, env: env2 } = ctx;
	const auth = await requireAuth(request);
	if (auth instanceof Response)
		return {
			success: false,
			error: "Unauthorized",
		};
	const { id } = params;
	if (!id) {
		return {
			success: false,
			error: "Theme ID is required",
		};
	}
	const db = drizzle(env2.PROJECT_DB);
	const existing = await db
		.select()
		.from(uiStyleTable)
		.where(eq(uiStyleTable.id, id))
		.limit(1);
	if (existing.length === 0) {
		return {
			success: false,
			error: "Theme not found",
		};
	}
	await db.delete(uiStyleTable).where(eq(uiStyleTable.id, id));
	return {
		success: true,
	};
}
__name(DELETE4, "DELETE");
function parseData3(formData) {
	const propsArray = [];
	if (!formData) return propsArray;
	const batchsIDs = [];
	for (const [key, value] of Array.from(formData.entries())) {
		if (key.startsWith("FILE_")) propsArray.push(value);
		else if (key.startsWith("FILES_")) {
			if (batchsIDs.includes(key)) continue;
			batchsIDs.push(key);
			propsArray.push(formData.getAll(key));
		} else {
			propsArray.push(JSON.parse(decodeURI(value)));
		}
	}
	return propsArray;
}
__name(parseData3, "parseData");
function paramsFromURL3(url) {
	const params = url.searchParams
		.entries()
		.toArray()
		.map(([_, v]) => v);
	return params.map((param) => JSON.parse(decodeURIComponent(param)));
}
__name(paramsFromURL3, "paramsFromURL");
async function WrapRequestHandler3(context2, endpoint) {
	const isServerAction =
		context2.request.headers.get("x-server-action") === "true";
	if (!isServerAction) {
		return new Response("Not Found", { status: 404 });
	}
	const parsedData =
		context2.request.method === "GET" || context2.request.method === "HEAD"
			? paramsFromURL3(new URL(context2.request.url))
			: parseData3(
					context2.request.headers.get("content-type")
						? await context2.request.formData()
						: void 0,
				);
	const missingProps = endpoint.length - parsedData.length;
	for (let i = 0; i < missingProps; i++) {
		parsedData.push(void 0);
	}
	parsedData.push(context2);
	const result = await endpoint(...parsedData);
	switch (typeof result) {
		case "string":
		case "number":
		case "boolean":
		case "bigint": {
			const res = new Response(JSON.stringify(result));
			res.headers.set("Content-Type", "application/json");
			res.headers.set("dataType", "json");
			return res;
		}
		case "undefined":
			return new Response(null, { status: 204 });
		case "object":
			if (result instanceof Response) {
				result.headers.set("dataType", "response");
				return result;
			} else if (result instanceof Blob) {
				const res2 = new Response(await result.arrayBuffer());
				res2.headers.set("dataType", "blob");
				res2.headers.set("Content-Type", result.type);
				return res2;
			} else if (result instanceof File) {
				const res2 = new Response(await result.arrayBuffer());
				res2.headers.set("dataType", "file");
				res2.headers.set("Content-Type", result.type);
				res2.headers.set(
					"fileData",
					JSON.stringify({
						name: result.name,
						lastModified: result.lastModified,
					}),
				);
				return res2;
			} else {
				return new Response(JSON.stringify(result), {
					headers: { "Content-Type": "application/json", dataType: "json" },
				});
			}
		default:
			throw new Error(`Unsupported return type from action: ${typeof result}`);
	}
}
__name(WrapRequestHandler3, "WrapRequestHandler");
var onRequest3 = /* @__PURE__ */ __name(async (context2) => {
	const method = context2.request.method;
	const options = {
		GET: typeof GET3 === "function" ? GET3 : void 0,
		POST: typeof POST === "function" ? POST : void 0,
		PUT: typeof PUT4 === "function" ? PUT4 : void 0,
		DELETE: typeof DELETE4 === "function" ? DELETE4 : void 0,
		PATCH: typeof PATCH === "function" ? PATCH : void 0,
		HEAD: typeof HEAD === "function" ? HEAD : void 0,
		OPTIONS: typeof OPTIONS === "function" ? OPTIONS : void 0,
	};
	if (!options[method]) {
		return new Response(`Method "${method}" Not Allowed`, {
			status: 405,
		});
	}
	return await WrapRequestHandler3(context2, options[method]);
}, "onRequest");

// chunk-ehayxbqv.js
var COOKIE_NAME2 = "oauth_client_id";
var AuthManager = class {
	static {
		__name(this, "AuthManager");
	}
	client;
	redirectURI;
	client_id;
	props;
	publicPath;
	issuer;
	constructor(props) {
		this.client = props.client;
		this.issuer = props.issuer;
		this.redirectURI = props.redirectURI;
		this.props = { callback: props.callback, verify: props.verify };
		this.publicPath = props.publicPath ?? "/auth";
		this.client_id = props.client_id;
	}
	run(request) {
		switch (new URL(request.url).pathname) {
			case `${this.publicPath}/callback`:
				return this.callback({ ...this.props.callback, request });
			case `${this.publicPath}/authorize`:
				return this.authorize();
			case `${this.publicPath}`:
				return this.verify(request);
			default:
				return new Response("Not Found", { status: 404 });
		}
	}
	async callback({ onError, onSuccess, request, ...props }) {
		const url = new URL(request.url);
		const code = url.searchParams.get("code");
		console.log("Received code:", code);
		try {
			if (!code) throw new Error("No code provided");
			const exchanged = await this.client.exchange(code, this.redirectURI);
			if (exchanged.err) {
				throw new Error("Code exchange failed", { cause: exchanged });
			}
			const response = new Response(props.response?.body ?? null, {
				status: 302,
				headers: {},
				...(props.response?.init || {}),
			});
			response.headers.set("Location", url.origin);
			setSession(response, exchanged.tokens.access, exchanged.tokens.refresh);
			await onSuccess?.(exchanged);
			return response;
		} catch (e) {
			await onError?.(e.cause);
			throw e;
		}
	}
	async authorize() {
		return Response.redirect(
			await this.client.authorize(this.redirectURI, "code").then((v) => v.url),
			302,
		);
	}
	async verify(request) {
		const cookies = new URLSearchParams(
			request.headers.get("cookie")?.replaceAll("; ", "&"),
		);
		const verified = await this.client.verify(
			this.props.verify.subjects,
			cookies.get("access_token"),
			{
				refresh: cookies.get("refresh_token") || void 0,
				fetch: /* @__PURE__ */ __name((body, init) => {
					const header = new Headers(init?.headers || {});
					header.append("Cookie", cookies.get(COOKIE_NAME2) || "");
					init.headers = header;
					return fetch(body, init);
				}, "fetch"),
			},
		);
		if (verified.err) {
			const res = await this.props.verify.onError?.(verified);
			return (
				res ||
				Response.redirect(new URL(request.url).origin + "/authorize", 302)
			);
		}
		const resp = await this.props.verify.onSuccess(verified);
		if (verified.tokens)
			setSession(resp, verified.tokens.access, verified.tokens.refresh);
		return resp;
	}
};
function setSession(response, access, refresh) {
	if (access) {
		response.headers.append(
			"Set-Cookie",
			`access_token=${access}; HttpOnly; SameSite=Strict; Path=/; Max-Age=2147483647`,
		);
	}
	if (refresh) {
		response.headers.append(
			"Set-Cookie",
			`refresh_token=${refresh}; HttpOnly; SameSite=Strict; Path=/; Max-Age=2147483647`,
		);
	}
}
__name(setSession, "setSession");

// auth/[action].js
var onRequest4 = /* @__PURE__ */ __name((ctx) => {
	return new AuthManager({
		issuer: ctx.env.PUBLIC_ISSUER,
		client,
		client_id: ctx.env.PUBLIC_CLIENT_ID,
		redirectURI: ctx.env.PUBLIC_REDIRECT_URI,
		callback: {
			onError(error3) {
				console.error(error3);
			},
			onSuccess(success) {
				console.log("Successful authentication:", success);
			},
		},
		verify: {
			subjects: subject,
			onSuccess(subject2) {
				return new Response("Authentication successful", { status: 200 });
			},
			onError(error3) {
				return new Response(`Authentication failed: ${error3.err.message}`, {
					status: 401,
				});
			},
		},
	}).run(ctx.request);
}, "onRequest");

// auth/index.js
var onRequest5 = /* @__PURE__ */ __name((ctx) => {
	return new AuthManager({
		issuer: ctx.env.PUBLIC_ISSUER,
		client_id: ctx.env.PUBLIC_CLIENT_ID,
		client,
		redirectURI: ctx.env.PUBLIC_REDIRECT_URI,
		verify: {
			subjects: subject,
			onSuccess(subject2) {
				return Response.json(subject2.subject.properties);
			},
			onError(error3) {
				return new Response(`Authentication failed: ${error3.err.message}`, {
					status: 401,
				});
			},
		},
	}).run(ctx.request);
}, "onRequest");

// healthcheck.js
async function GET4() {
	return new Response("OK", { status: 200 });
}
__name(GET4, "GET");
function parseData4(formData) {
	const propsArray = [];
	if (!formData) return propsArray;
	const batchsIDs = [];
	for (const [key, value] of Array.from(formData.entries())) {
		if (key.startsWith("FILE_")) propsArray.push(value);
		else if (key.startsWith("FILES_")) {
			if (batchsIDs.includes(key)) continue;
			batchsIDs.push(key);
			propsArray.push(formData.getAll(key));
		} else {
			propsArray.push(JSON.parse(decodeURI(value)));
		}
	}
	return propsArray;
}
__name(parseData4, "parseData");
function paramsFromURL4(url) {
	const params = url.searchParams
		.entries()
		.toArray()
		.map(([_, v]) => v);
	return params.map((param) => JSON.parse(decodeURIComponent(param)));
}
__name(paramsFromURL4, "paramsFromURL");
async function WrapRequestHandler4(context2, endpoint) {
	const isServerAction =
		context2.request.headers.get("x-server-action") === "true";
	if (!isServerAction) {
		return new Response("Not Found", { status: 404 });
	}
	const parsedData =
		context2.request.method === "GET" || context2.request.method === "HEAD"
			? paramsFromURL4(new URL(context2.request.url))
			: parseData4(
					context2.request.headers.get("content-type")
						? await context2.request.formData()
						: void 0,
				);
	const missingProps = endpoint.length - parsedData.length;
	for (let i = 0; i < missingProps; i++) {
		parsedData.push(void 0);
	}
	parsedData.push(context2);
	const result = await endpoint(...parsedData);
	switch (typeof result) {
		case "string":
		case "number":
		case "boolean":
		case "bigint": {
			const res = new Response(JSON.stringify(result));
			res.headers.set("Content-Type", "application/json");
			res.headers.set("dataType", "json");
			return res;
		}
		case "undefined":
			return new Response(null, { status: 204 });
		case "object":
			if (result instanceof Response) {
				result.headers.set("dataType", "response");
				return result;
			} else if (result instanceof Blob) {
				const res2 = new Response(await result.arrayBuffer());
				res2.headers.set("dataType", "blob");
				res2.headers.set("Content-Type", result.type);
				return res2;
			} else if (result instanceof File) {
				const res2 = new Response(await result.arrayBuffer());
				res2.headers.set("dataType", "file");
				res2.headers.set("Content-Type", result.type);
				res2.headers.set(
					"fileData",
					JSON.stringify({
						name: result.name,
						lastModified: result.lastModified,
					}),
				);
				return res2;
			} else {
				return new Response(JSON.stringify(result), {
					headers: { "Content-Type": "application/json", dataType: "json" },
				});
			}
		default:
			throw new Error(`Unsupported return type from action: ${typeof result}`);
	}
}
__name(WrapRequestHandler4, "WrapRequestHandler");
var onRequest6 = /* @__PURE__ */ __name(async (context2) => {
	const method = context2.request.method;
	const options = {
		GET: typeof GET4 === "function" ? GET4 : void 0,
		POST: typeof POST === "function" ? POST : void 0,
		PUT: typeof PUT === "function" ? PUT : void 0,
		DELETE: typeof DELETE === "function" ? DELETE : void 0,
		PATCH: typeof PATCH === "function" ? PATCH : void 0,
		HEAD: typeof HEAD === "function" ? HEAD : void 0,
		OPTIONS: typeof OPTIONS === "function" ? OPTIONS : void 0,
	};
	if (!options[method]) {
		return new Response(`Method "${method}" Not Allowed`, {
			status: 405,
		});
	}
	return await WrapRequestHandler4(context2, options[method]);
}, "onRequest");

// projects/index.js
async function GET5() {
	const ctx = getContext(arguments);
	const { request, env: env2 } = ctx;
	const auth = await requireAuth(request);
	if (auth instanceof Response)
		return {
			success: false,
			error: "Unauthorized",
			data: [],
		};
	const db = drizzle(env2.PROJECT_DB);
	const projects = await db.select().from(projectTable);
	return {
		success: true,
		data: projects.map((p) => ({
			...p,
			providers_data:
				typeof p.providers_data === "string"
					? JSON.parse(p.providers_data)
					: p.providers_data,
		})),
	};
}
__name(GET5, "GET");
function isClientIdValid(name) {
	const regex = /^[a-zA-Z_][a-zA-Z0-9_]{2,29}$/;
	return regex.test(name);
}
__name(isClientIdValid, "isClientIdValid");
async function POST2(params) {
	const ctx = getContext(arguments);
	const { request, env: env2 } = ctx;
	const auth = await requireAuth(request);
	if (auth instanceof Response)
		return {
			success: false,
			error: "Unauthorized",
		};
	try {
		const { clientID, providers_data = [] } = params;
		if (!isClientIdValid(clientID)) {
			return {
				success: false,
				error:
					"Invalid clientID format only alphanumeric and underscores, 3-30 characters, must start with a letter or underscore",
			};
		}
		if (!clientID || typeof clientID !== "string") {
			return {
				success: false,
				error: "Invalid or missing clientID",
			};
		}
		const db = drizzle(env2.PROJECT_DB);
		const existing = await db
			.select()
			.from(projectTable)
			.where(eq(projectTable.clientID, clientID))
			.limit(1);
		if (existing.length > 0) {
			return {
				success: false,
				error: "Project with this clientID already exists",
			};
		}
		const newProject = {
			clientID,
			created_at: /* @__PURE__ */ new Date().toISOString(),
			active: true,
			providers_data: JSON.stringify(providers_data),
		};
		await db.insert(projectTable).values(newProject);
		return {
			success: true,
			data: {
				clientID: newProject.clientID,
				active: true,
				providers_data,
				created_at: newProject.created_at,
			},
		};
	} catch (error3) {
		return {
			success: false,
			error: "Invalid request body",
		};
	}
}
__name(POST2, "POST");
function parseData5(formData) {
	const propsArray = [];
	if (!formData) return propsArray;
	const batchsIDs = [];
	for (const [key, value] of Array.from(formData.entries())) {
		if (key.startsWith("FILE_")) propsArray.push(value);
		else if (key.startsWith("FILES_")) {
			if (batchsIDs.includes(key)) continue;
			batchsIDs.push(key);
			propsArray.push(formData.getAll(key));
		} else {
			propsArray.push(JSON.parse(decodeURI(value)));
		}
	}
	return propsArray;
}
__name(parseData5, "parseData");
function paramsFromURL5(url) {
	const params = url.searchParams
		.entries()
		.toArray()
		.map(([_, v]) => v);
	return params.map((param) => JSON.parse(decodeURIComponent(param)));
}
__name(paramsFromURL5, "paramsFromURL");
async function WrapRequestHandler5(context2, endpoint) {
	const isServerAction =
		context2.request.headers.get("x-server-action") === "true";
	if (!isServerAction) {
		return new Response("Not Found", { status: 404 });
	}
	const parsedData =
		context2.request.method === "GET" || context2.request.method === "HEAD"
			? paramsFromURL5(new URL(context2.request.url))
			: parseData5(
					context2.request.headers.get("content-type")
						? await context2.request.formData()
						: void 0,
				);
	const missingProps = endpoint.length - parsedData.length;
	for (let i = 0; i < missingProps; i++) {
		parsedData.push(void 0);
	}
	parsedData.push(context2);
	const result = await endpoint(...parsedData);
	switch (typeof result) {
		case "string":
		case "number":
		case "boolean":
		case "bigint": {
			const res = new Response(JSON.stringify(result));
			res.headers.set("Content-Type", "application/json");
			res.headers.set("dataType", "json");
			return res;
		}
		case "undefined":
			return new Response(null, { status: 204 });
		case "object":
			if (result instanceof Response) {
				result.headers.set("dataType", "response");
				return result;
			} else if (result instanceof Blob) {
				const res2 = new Response(await result.arrayBuffer());
				res2.headers.set("dataType", "blob");
				res2.headers.set("Content-Type", result.type);
				return res2;
			} else if (result instanceof File) {
				const res2 = new Response(await result.arrayBuffer());
				res2.headers.set("dataType", "file");
				res2.headers.set("Content-Type", result.type);
				res2.headers.set(
					"fileData",
					JSON.stringify({
						name: result.name,
						lastModified: result.lastModified,
					}),
				);
				return res2;
			} else {
				return new Response(JSON.stringify(result), {
					headers: { "Content-Type": "application/json", dataType: "json" },
				});
			}
		default:
			throw new Error(`Unsupported return type from action: ${typeof result}`);
	}
}
__name(WrapRequestHandler5, "WrapRequestHandler");
var onRequest7 = /* @__PURE__ */ __name(async (context2) => {
	const method = context2.request.method;
	const options = {
		GET: typeof GET5 === "function" ? GET5 : void 0,
		POST: typeof POST2 === "function" ? POST2 : void 0,
		PUT: typeof PUT === "function" ? PUT : void 0,
		DELETE: typeof DELETE === "function" ? DELETE : void 0,
		PATCH: typeof PATCH === "function" ? PATCH : void 0,
		HEAD: typeof HEAD === "function" ? HEAD : void 0,
		OPTIONS: typeof OPTIONS === "function" ? OPTIONS : void 0,
	};
	if (!options[method]) {
		return new Response(`Method "${method}" Not Allowed`, {
			status: 405,
		});
	}
	return await WrapRequestHandler5(context2, options[method]);
}, "onRequest");

// providers/index.js
var PROVIDER_REGISTRY = [
	{
		type: "google",
		name: "Google",
		category: "social",
		icon: "\u{1F535}",
		description: "Sign in with Google OAuth2",
		requiredFields: ["clientID", "clientSecret"],
		optionalFields: ["scopes"],
	},
	{
		type: "github",
		name: "GitHub",
		category: "social",
		icon: "\u26AB",
		description: "Sign in with GitHub OAuth2",
		requiredFields: ["clientID", "clientSecret"],
		optionalFields: ["scopes"],
	},
	{
		type: "discord",
		name: "Discord",
		category: "social",
		icon: "\u{1F49C}",
		description: "Sign in with Discord OAuth2",
		requiredFields: ["clientID", "clientSecret"],
		optionalFields: ["scopes"],
	},
	{
		type: "twitter",
		name: "Twitter",
		category: "social",
		icon: "\u{1F426}",
		description: "Sign in with Twitter OAuth2",
		requiredFields: ["clientID", "clientSecret"],
		optionalFields: ["scopes"],
	},
	{
		type: "x",
		name: "X (Twitter)",
		category: "social",
		icon: "\u2716\uFE0F",
		description: "Sign in with X OAuth2",
		requiredFields: ["clientID", "clientSecret"],
		optionalFields: ["scopes"],
	},
	{
		type: "facebook",
		name: "Facebook",
		category: "social",
		icon: "\u{1F4D8}",
		description: "Sign in with Facebook OAuth2",
		requiredFields: ["clientID", "clientSecret"],
		optionalFields: ["scopes"],
	},
	{
		type: "linkedin",
		name: "LinkedIn",
		category: "social",
		icon: "\u{1F4BC}",
		description: "Sign in with LinkedIn OAuth2",
		requiredFields: ["clientID", "clientSecret"],
		optionalFields: ["scopes"],
	},
	{
		type: "apple",
		name: "Apple",
		category: "social",
		icon: "\u{1F34E}",
		description: "Sign in with Apple",
		requiredFields: ["clientID", "clientSecret"],
		optionalFields: ["scopes"],
	},
	{
		type: "slack",
		name: "Slack",
		category: "social",
		icon: "\u{1F4AC}",
		description: "Sign in with Slack OAuth2",
		requiredFields: ["clientID", "clientSecret"],
		optionalFields: ["scopes"],
	},
	{
		type: "spotify",
		name: "Spotify",
		category: "social",
		icon: "\u{1F3B5}",
		description: "Sign in with Spotify OAuth2",
		requiredFields: ["clientID", "clientSecret"],
		optionalFields: ["scopes"],
	},
	{
		type: "twitch",
		name: "Twitch",
		category: "social",
		icon: "\u{1F3AE}",
		description: "Sign in with Twitch OAuth2",
		requiredFields: ["clientID", "clientSecret"],
		optionalFields: ["scopes"],
	},
	{
		type: "yahoo",
		name: "Yahoo",
		category: "social",
		icon: "\u{1F7E3}",
		description: "Sign in with Yahoo OAuth2",
		requiredFields: ["clientID", "clientSecret"],
		optionalFields: ["scopes"],
	},
	{
		type: "microsoft",
		name: "Microsoft",
		category: "enterprise",
		icon: "\u{1FA9F}",
		description: "Sign in with Microsoft Azure AD",
		requiredFields: ["clientID", "clientSecret"],
		optionalFields: ["scopes"],
	},
	{
		type: "cognito",
		name: "AWS Cognito",
		category: "enterprise",
		icon: "\u2601\uFE0F",
		description: "Sign in with AWS Cognito",
		requiredFields: ["clientID", "clientSecret"],
		optionalFields: ["scopes"],
	},
	{
		type: "keycloak",
		name: "Keycloak",
		category: "enterprise",
		icon: "\u{1F510}",
		description: "Sign in with Keycloak",
		requiredFields: ["clientID", "clientSecret", "realm", "baseUrl"],
		optionalFields: ["scopes"],
	},
	{
		type: "jumpcloud",
		name: "JumpCloud",
		category: "enterprise",
		icon: "\u2601\uFE0F",
		description: "Sign in with JumpCloud",
		requiredFields: ["clientID", "clientSecret"],
		optionalFields: ["scopes"],
	},
	{
		type: "oidc",
		name: "Custom OIDC",
		category: "custom",
		icon: "\u{1F517}",
		description: "Connect to any OIDC provider",
		requiredFields: ["clientID", "issuer"],
		optionalFields: ["scopes"],
	},
	{
		type: "oauth",
		name: "Custom OAuth2",
		category: "custom",
		icon: "\u{1F511}",
		description: "Connect to any OAuth2 provider",
		requiredFields: [
			"clientID",
			"clientSecret",
			"authorizationEndpoint",
			"tokenEndpoint",
		],
		optionalFields: ["jwksEndpoint", "scopes"],
	},
	{
		type: "code",
		name: "Pin Code",
		category: "form",
		icon: "\u{1F4E7}",
		description: "Email or SMS verification code",
		requiredFields: ["mode"],
		optionalFields: ["length"],
	},
	{
		type: "password",
		name: "Password",
		category: "form",
		icon: "\u{1F512}",
		description: "Traditional email and password",
		requiredFields: [],
		optionalFields: [
			"minLength",
			"requireUppercase",
			"requireNumber",
			"requireSpecialChar",
		],
	},
];
async function GET6() {
	return {
		success: true,
		data: PROVIDER_REGISTRY,
	};
}
__name(GET6, "GET");
function parseData6(formData) {
	const propsArray = [];
	if (!formData) return propsArray;
	const batchsIDs = [];
	for (const [key, value] of Array.from(formData.entries())) {
		if (key.startsWith("FILE_")) propsArray.push(value);
		else if (key.startsWith("FILES_")) {
			if (batchsIDs.includes(key)) continue;
			batchsIDs.push(key);
			propsArray.push(formData.getAll(key));
		} else {
			propsArray.push(JSON.parse(decodeURI(value)));
		}
	}
	return propsArray;
}
__name(parseData6, "parseData");
function paramsFromURL6(url) {
	const params = url.searchParams
		.entries()
		.toArray()
		.map(([_, v]) => v);
	return params.map((param) => JSON.parse(decodeURIComponent(param)));
}
__name(paramsFromURL6, "paramsFromURL");
async function WrapRequestHandler6(context2, endpoint) {
	const isServerAction =
		context2.request.headers.get("x-server-action") === "true";
	if (!isServerAction) {
		return new Response("Not Found", { status: 404 });
	}
	const parsedData =
		context2.request.method === "GET" || context2.request.method === "HEAD"
			? paramsFromURL6(new URL(context2.request.url))
			: parseData6(
					context2.request.headers.get("content-type")
						? await context2.request.formData()
						: void 0,
				);
	const missingProps = endpoint.length - parsedData.length;
	for (let i = 0; i < missingProps; i++) {
		parsedData.push(void 0);
	}
	parsedData.push(context2);
	const result = await endpoint(...parsedData);
	switch (typeof result) {
		case "string":
		case "number":
		case "boolean":
		case "bigint": {
			const res = new Response(JSON.stringify(result));
			res.headers.set("Content-Type", "application/json");
			res.headers.set("dataType", "json");
			return res;
		}
		case "undefined":
			return new Response(null, { status: 204 });
		case "object":
			if (result instanceof Response) {
				result.headers.set("dataType", "response");
				return result;
			} else if (result instanceof Blob) {
				const res2 = new Response(await result.arrayBuffer());
				res2.headers.set("dataType", "blob");
				res2.headers.set("Content-Type", result.type);
				return res2;
			} else if (result instanceof File) {
				const res2 = new Response(await result.arrayBuffer());
				res2.headers.set("dataType", "file");
				res2.headers.set("Content-Type", result.type);
				res2.headers.set(
					"fileData",
					JSON.stringify({
						name: result.name,
						lastModified: result.lastModified,
					}),
				);
				return res2;
			} else {
				return new Response(JSON.stringify(result), {
					headers: { "Content-Type": "application/json", dataType: "json" },
				});
			}
		default:
			throw new Error(`Unsupported return type from action: ${typeof result}`);
	}
}
__name(WrapRequestHandler6, "WrapRequestHandler");
var onRequest8 = /* @__PURE__ */ __name(async (context2) => {
	const method = context2.request.method;
	const options = {
		GET: typeof GET6 === "function" ? GET6 : void 0,
		POST: typeof POST === "function" ? POST : void 0,
		PUT: typeof PUT === "function" ? PUT : void 0,
		DELETE: typeof DELETE === "function" ? DELETE : void 0,
		PATCH: typeof PATCH === "function" ? PATCH : void 0,
		HEAD: typeof HEAD === "function" ? HEAD : void 0,
		OPTIONS: typeof OPTIONS === "function" ? OPTIONS : void 0,
	};
	if (!options[method]) {
		return new Response(`Method "${method}" Not Allowed`, {
			status: 405,
		});
	}
	return await WrapRequestHandler6(context2, options[method]);
}, "onRequest");

// templates/index.js
async function GET7() {
	const ctx = getContext(arguments);
	const { request, env: env2 } = ctx;
	const auth = await requireAuth(request);
	if (auth instanceof Response)
		return {
			success: false,
			error: "Unauthorized",
			data: [],
		};
	const db = drizzle(env2.PROJECT_DB);
	const templates = await db.select().from(emailTemplatesTable);
	return {
		success: true,
		data: templates,
	};
}
__name(GET7, "GET");
async function POST3(params) {
	const ctx = getContext(arguments);
	const { request, env: env2 } = ctx;
	const auth = await requireAuth(request);
	if (auth instanceof Response)
		return {
			success: false,
			error: "Unauthorized",
		};
	try {
		const { name, body, subject: subject2 } = params;
		if (!name || typeof name !== "string" || name.trim().length === 0) {
			return {
				success: false,
				error: "Invalid or missing template name",
			};
		}
		if (!subject2 || typeof subject2 !== "string") {
			return {
				success: false,
				error: "Invalid or missing subject",
			};
		}
		if (!body || typeof body !== "string") {
			return {
				success: false,
				error: "Invalid or missing body",
			};
		}
		const db = drizzle(env2.PROJECT_DB);
		const now = /* @__PURE__ */ new Date().toISOString();
		const newTemplate = {
			name: name.trim(),
			body,
			subject: subject2,
			created_at: now,
			updated_at: now,
		};
		await db.insert(emailTemplatesTable).values(newTemplate);
		return {
			success: true,
			data: newTemplate,
		};
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : "Failed to create template",
		};
	}
}
__name(POST3, "POST");
function parseData7(formData) {
	const propsArray = [];
	if (!formData) return propsArray;
	const batchsIDs = [];
	for (const [key, value] of Array.from(formData.entries())) {
		if (key.startsWith("FILE_")) propsArray.push(value);
		else if (key.startsWith("FILES_")) {
			if (batchsIDs.includes(key)) continue;
			batchsIDs.push(key);
			propsArray.push(formData.getAll(key));
		} else {
			propsArray.push(JSON.parse(decodeURI(value)));
		}
	}
	return propsArray;
}
__name(parseData7, "parseData");
function paramsFromURL7(url) {
	const params = url.searchParams
		.entries()
		.toArray()
		.map(([_, v]) => v);
	return params.map((param) => JSON.parse(decodeURIComponent(param)));
}
__name(paramsFromURL7, "paramsFromURL");
async function WrapRequestHandler7(context2, endpoint) {
	const isServerAction =
		context2.request.headers.get("x-server-action") === "true";
	if (!isServerAction) {
		return new Response("Not Found", { status: 404 });
	}
	const parsedData =
		context2.request.method === "GET" || context2.request.method === "HEAD"
			? paramsFromURL7(new URL(context2.request.url))
			: parseData7(
					context2.request.headers.get("content-type")
						? await context2.request.formData()
						: void 0,
				);
	const missingProps = endpoint.length - parsedData.length;
	for (let i = 0; i < missingProps; i++) {
		parsedData.push(void 0);
	}
	parsedData.push(context2);
	const result = await endpoint(...parsedData);
	switch (typeof result) {
		case "string":
		case "number":
		case "boolean":
		case "bigint": {
			const res = new Response(JSON.stringify(result));
			res.headers.set("Content-Type", "application/json");
			res.headers.set("dataType", "json");
			return res;
		}
		case "undefined":
			return new Response(null, { status: 204 });
		case "object":
			if (result instanceof Response) {
				result.headers.set("dataType", "response");
				return result;
			} else if (result instanceof Blob) {
				const res2 = new Response(await result.arrayBuffer());
				res2.headers.set("dataType", "blob");
				res2.headers.set("Content-Type", result.type);
				return res2;
			} else if (result instanceof File) {
				const res2 = new Response(await result.arrayBuffer());
				res2.headers.set("dataType", "file");
				res2.headers.set("Content-Type", result.type);
				res2.headers.set(
					"fileData",
					JSON.stringify({
						name: result.name,
						lastModified: result.lastModified,
					}),
				);
				return res2;
			} else {
				return new Response(JSON.stringify(result), {
					headers: { "Content-Type": "application/json", dataType: "json" },
				});
			}
		default:
			throw new Error(`Unsupported return type from action: ${typeof result}`);
	}
}
__name(WrapRequestHandler7, "WrapRequestHandler");
var onRequest9 = /* @__PURE__ */ __name(async (context2) => {
	const method = context2.request.method;
	const options = {
		GET: typeof GET7 === "function" ? GET7 : void 0,
		POST: typeof POST3 === "function" ? POST3 : void 0,
		PUT: typeof PUT === "function" ? PUT : void 0,
		DELETE: typeof DELETE === "function" ? DELETE : void 0,
		PATCH: typeof PATCH === "function" ? PATCH : void 0,
		HEAD: typeof HEAD === "function" ? HEAD : void 0,
		OPTIONS: typeof OPTIONS === "function" ? OPTIONS : void 0,
	};
	if (!options[method]) {
		return new Response(`Method "${method}" Not Allowed`, {
			status: 405,
		});
	}
	return await WrapRequestHandler7(context2, options[method]);
}, "onRequest");

// themes/index.js
async function GET8() {
	const ctx = getContext(arguments);
	const { request, env: env2 } = ctx;
	const auth = await requireAuth(request);
	if (auth instanceof Response)
		return {
			success: false,
			error: "Unauthorized",
			data: [],
		};
	const db = drizzle(env2.PROJECT_DB);
	const themes = await db.select().from(uiStyleTable);
	return {
		success: true,
		data: themes.map((t) => ({
			id: t.id,
			themeData: t.themeData,
		})),
	};
}
__name(GET8, "GET");
async function POST4(params) {
	const ctx = getContext(arguments);
	const { request, env: env2 } = ctx;
	const auth = await requireAuth(request);
	if (auth instanceof Response)
		return {
			success: false,
			error: "Unauthorized",
		};
	try {
		const { id, themeData } = params;
		if (!id || typeof id !== "string" || id.trim().length === 0) {
			return {
				success: false,
				error: "Invalid or missing theme ID",
			};
		}
		if (!themeData || typeof themeData !== "object") {
			return {
				success: false,
				error: "Invalid or missing theme data",
			};
		}
		if (!themeData.primary) {
			return {
				success: false,
				error: "Primary color is required",
			};
		}
		const db = drizzle(env2.PROJECT_DB);
		const existing = await db
			.select()
			.from(uiStyleTable)
			.where(eq(uiStyleTable.id, id.trim()))
			.limit(1);
		if (existing.length > 0) {
			return {
				success: false,
				error: "A theme with this ID already exists",
			};
		}
		const newTheme = {
			id: id.trim(),
			themeData,
		};
		await db.insert(uiStyleTable).values(newTheme);
		return {
			success: true,
			data: {
				id: newTheme.id,
				themeData,
			},
		};
	} catch (err) {
		console.error("Error creating theme:", err);
		return {
			success: false,
			error: err instanceof Error ? err.message : "Failed to create theme",
		};
	}
}
__name(POST4, "POST");
function parseData8(formData) {
	const propsArray = [];
	if (!formData) return propsArray;
	const batchsIDs = [];
	for (const [key, value] of Array.from(formData.entries())) {
		if (key.startsWith("FILE_")) propsArray.push(value);
		else if (key.startsWith("FILES_")) {
			if (batchsIDs.includes(key)) continue;
			batchsIDs.push(key);
			propsArray.push(formData.getAll(key));
		} else {
			propsArray.push(JSON.parse(decodeURI(value)));
		}
	}
	return propsArray;
}
__name(parseData8, "parseData");
function paramsFromURL8(url) {
	const params = url.searchParams
		.entries()
		.toArray()
		.map(([_, v]) => v);
	return params.map((param) => JSON.parse(decodeURIComponent(param)));
}
__name(paramsFromURL8, "paramsFromURL");
async function WrapRequestHandler8(context2, endpoint) {
	const isServerAction =
		context2.request.headers.get("x-server-action") === "true";
	if (!isServerAction) {
		return new Response("Not Found", { status: 404 });
	}
	const parsedData =
		context2.request.method === "GET" || context2.request.method === "HEAD"
			? paramsFromURL8(new URL(context2.request.url))
			: parseData8(
					context2.request.headers.get("content-type")
						? await context2.request.formData()
						: void 0,
				);
	const missingProps = endpoint.length - parsedData.length;
	for (let i = 0; i < missingProps; i++) {
		parsedData.push(void 0);
	}
	parsedData.push(context2);
	const result = await endpoint(...parsedData);
	switch (typeof result) {
		case "string":
		case "number":
		case "boolean":
		case "bigint": {
			const res = new Response(JSON.stringify(result));
			res.headers.set("Content-Type", "application/json");
			res.headers.set("dataType", "json");
			return res;
		}
		case "undefined":
			return new Response(null, { status: 204 });
		case "object":
			if (result instanceof Response) {
				result.headers.set("dataType", "response");
				return result;
			} else if (result instanceof Blob) {
				const res2 = new Response(await result.arrayBuffer());
				res2.headers.set("dataType", "blob");
				res2.headers.set("Content-Type", result.type);
				return res2;
			} else if (result instanceof File) {
				const res2 = new Response(await result.arrayBuffer());
				res2.headers.set("dataType", "file");
				res2.headers.set("Content-Type", result.type);
				res2.headers.set(
					"fileData",
					JSON.stringify({
						name: result.name,
						lastModified: result.lastModified,
					}),
				);
				return res2;
			} else {
				return new Response(JSON.stringify(result), {
					headers: { "Content-Type": "application/json", dataType: "json" },
				});
			}
		default:
			throw new Error(`Unsupported return type from action: ${typeof result}`);
	}
}
__name(WrapRequestHandler8, "WrapRequestHandler");
var onRequest10 = /* @__PURE__ */ __name(async (context2) => {
	const method = context2.request.method;
	const options = {
		GET: typeof GET8 === "function" ? GET8 : void 0,
		POST: typeof POST4 === "function" ? POST4 : void 0,
		PUT: typeof PUT === "function" ? PUT : void 0,
		DELETE: typeof DELETE === "function" ? DELETE : void 0,
		PATCH: typeof PATCH === "function" ? PATCH : void 0,
		HEAD: typeof HEAD === "function" ? HEAD : void 0,
		OPTIONS: typeof OPTIONS === "function" ? OPTIONS : void 0,
	};
	if (!options[method]) {
		return new Response(`Method "${method}" Not Allowed`, {
			status: 405,
		});
	}
	return await WrapRequestHandler8(context2, options[method]);
}, "onRequest");

// ../.wrangler/tmp/pages-JOrNq5/functionsRoutes-0.40837343009997007.mjs
var routes = [
	{
		routePath: "/projects/manage",
		mountPath: "/projects",
		method: "",
		middlewares: [],
		modules: [onRequest],
	},
	{
		routePath: "/templates/id",
		mountPath: "/templates",
		method: "",
		middlewares: [],
		modules: [onRequest2],
	},
	{
		routePath: "/themes/id",
		mountPath: "/themes",
		method: "",
		middlewares: [],
		modules: [onRequest3],
	},
	{
		routePath: "/auth/:action",
		mountPath: "/auth",
		method: "",
		middlewares: [],
		modules: [onRequest4],
	},
	{
		routePath: "/auth",
		mountPath: "/auth",
		method: "",
		middlewares: [],
		modules: [onRequest5],
	},
	{
		routePath: "/healthcheck",
		mountPath: "/",
		method: "",
		middlewares: [],
		modules: [onRequest6],
	},
	{
		routePath: "/projects",
		mountPath: "/projects",
		method: "",
		middlewares: [],
		modules: [onRequest7],
	},
	{
		routePath: "/providers",
		mountPath: "/providers",
		method: "",
		middlewares: [],
		modules: [onRequest8],
	},
	{
		routePath: "/templates",
		mountPath: "/templates",
		method: "",
		middlewares: [],
		modules: [onRequest9],
	},
	{
		routePath: "/themes",
		mountPath: "/themes",
		method: "",
		middlewares: [],
		modules: [onRequest10],
	},
];

// ../node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
	var tokens = [];
	var i = 0;
	while (i < str.length) {
		var char = str[i];
		if (char === "*" || char === "+" || char === "?") {
			tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
			continue;
		}
		if (char === "\\") {
			tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
			continue;
		}
		if (char === "{") {
			tokens.push({ type: "OPEN", index: i, value: str[i++] });
			continue;
		}
		if (char === "}") {
			tokens.push({ type: "CLOSE", index: i, value: str[i++] });
			continue;
		}
		if (char === ":") {
			var name = "";
			var j = i + 1;
			while (j < str.length) {
				var code = str.charCodeAt(j);
				if (
					// `0-9`
					(code >= 48 && code <= 57) || // `A-Z`
					(code >= 65 && code <= 90) || // `a-z`
					(code >= 97 && code <= 122) || // `_`
					code === 95
				) {
					name += str[j++];
					continue;
				}
				break;
			}
			if (!name) throw new TypeError("Missing parameter name at ".concat(i));
			tokens.push({ type: "NAME", index: i, value: name });
			i = j;
			continue;
		}
		if (char === "(") {
			var count3 = 1;
			var pattern = "";
			var j = i + 1;
			if (str[j] === "?") {
				throw new TypeError('Pattern cannot start with "?" at '.concat(j));
			}
			while (j < str.length) {
				if (str[j] === "\\") {
					pattern += str[j++] + str[j++];
					continue;
				}
				if (str[j] === ")") {
					count3--;
					if (count3 === 0) {
						j++;
						break;
					}
				} else if (str[j] === "(") {
					count3++;
					if (str[j + 1] !== "?") {
						throw new TypeError(
							"Capturing groups are not allowed at ".concat(j),
						);
					}
				}
				pattern += str[j++];
			}
			if (count3) throw new TypeError("Unbalanced pattern at ".concat(i));
			if (!pattern) throw new TypeError("Missing pattern at ".concat(i));
			tokens.push({ type: "PATTERN", index: i, value: pattern });
			i = j;
			continue;
		}
		tokens.push({ type: "CHAR", index: i, value: str[i++] });
	}
	tokens.push({ type: "END", index: i, value: "" });
	return tokens;
}
__name(lexer, "lexer");
function parse2(str, options) {
	if (options === void 0) {
		options = {};
	}
	var tokens = lexer(str);
	var _a = options.prefixes,
		prefixes = _a === void 0 ? "./" : _a,
		_b = options.delimiter,
		delimiter = _b === void 0 ? "/#?" : _b;
	var result = [];
	var key = 0;
	var i = 0;
	var path = "";
	var tryConsume = /* @__PURE__ */ __name((type) => {
		if (i < tokens.length && tokens[i].type === type) return tokens[i++].value;
	}, "tryConsume");
	var mustConsume = /* @__PURE__ */ __name((type) => {
		var value2 = tryConsume(type);
		if (value2 !== void 0) return value2;
		var _a2 = tokens[i],
			nextType = _a2.type,
			index = _a2.index;
		throw new TypeError(
			"Unexpected "
				.concat(nextType, " at ")
				.concat(index, ", expected ")
				.concat(type),
		);
	}, "mustConsume");
	var consumeText = /* @__PURE__ */ __name(() => {
		var result2 = "";
		var value2;
		while ((value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR"))) {
			result2 += value2;
		}
		return result2;
	}, "consumeText");
	var isSafe = /* @__PURE__ */ __name((value2) => {
		for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
			var char2 = delimiter_1[_i];
			if (value2.indexOf(char2) > -1) return true;
		}
		return false;
	}, "isSafe");
	var safePattern = /* @__PURE__ */ __name((prefix2) => {
		var prev = result[result.length - 1];
		var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
		if (prev && !prevText) {
			throw new TypeError(
				'Must have text between two parameters, missing text after "'.concat(
					prev.name,
					'"',
				),
			);
		}
		if (!prevText || isSafe(prevText))
			return "[^".concat(escapeString(delimiter), "]+?");
		return "(?:(?!"
			.concat(escapeString(prevText), ")[^")
			.concat(escapeString(delimiter), "])+?");
	}, "safePattern");
	while (i < tokens.length) {
		var char = tryConsume("CHAR");
		var name = tryConsume("NAME");
		var pattern = tryConsume("PATTERN");
		if (name || pattern) {
			var prefix = char || "";
			if (prefixes.indexOf(prefix) === -1) {
				path += prefix;
				prefix = "";
			}
			if (path) {
				result.push(path);
				path = "";
			}
			result.push({
				name: name || key++,
				prefix,
				suffix: "",
				pattern: pattern || safePattern(prefix),
				modifier: tryConsume("MODIFIER") || "",
			});
			continue;
		}
		var value = char || tryConsume("ESCAPED_CHAR");
		if (value) {
			path += value;
			continue;
		}
		if (path) {
			result.push(path);
			path = "";
		}
		var open = tryConsume("OPEN");
		if (open) {
			var prefix = consumeText();
			var name_1 = tryConsume("NAME") || "";
			var pattern_1 = tryConsume("PATTERN") || "";
			var suffix = consumeText();
			mustConsume("CLOSE");
			result.push({
				name: name_1 || (pattern_1 ? key++ : ""),
				pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
				prefix,
				suffix,
				modifier: tryConsume("MODIFIER") || "",
			});
			continue;
		}
		mustConsume("END");
	}
	return result;
}
__name(parse2, "parse");
function match(str, options) {
	var keys = [];
	var re = pathToRegexp(str, keys, options);
	return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
	if (options === void 0) {
		options = {};
	}
	var _a = options.decode,
		decode3 = _a === void 0 ? (x) => x : _a;
	return (pathname) => {
		var m = re.exec(pathname);
		if (!m) return false;
		var path = m[0],
			index = m.index;
		var params = /* @__PURE__ */ Object.create(null);
		var _loop_1 = /* @__PURE__ */ __name((i2) => {
			if (m[i2] === void 0) return "continue";
			var key = keys[i2 - 1];
			if (key.modifier === "*" || key.modifier === "+") {
				params[key.name] = m[i2]
					.split(key.prefix + key.suffix)
					.map((value) => decode3(value, key));
			} else {
				params[key.name] = decode3(m[i2], key);
			}
		}, "_loop_1");
		for (var i = 1; i < m.length; i++) {
			_loop_1(i);
		}
		return { path, index, params };
	};
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
	return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
	return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
	if (!keys) return path;
	var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
	var index = 0;
	var execResult = groupsRegex.exec(path.source);
	while (execResult) {
		keys.push({
			// Use parenthesized substring match if available, index otherwise
			name: execResult[1] || index++,
			prefix: "",
			suffix: "",
			modifier: "",
			pattern: "",
		});
		execResult = groupsRegex.exec(path.source);
	}
	return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
	var parts = paths.map((path) => pathToRegexp(path, keys, options).source);
	return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
	return tokensToRegexp(parse2(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
	if (options === void 0) {
		options = {};
	}
	var _a = options.strict,
		strict = _a === void 0 ? false : _a,
		_b = options.start,
		start = _b === void 0 ? true : _b,
		_c = options.end,
		end = _c === void 0 ? true : _c,
		_d = options.encode,
		encode3 = _d === void 0 ? (x) => x : _d,
		_e = options.delimiter,
		delimiter = _e === void 0 ? "/#?" : _e,
		_f = options.endsWith,
		endsWith = _f === void 0 ? "" : _f;
	var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
	var delimiterRe = "[".concat(escapeString(delimiter), "]");
	var route = start ? "^" : "";
	for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
		var token = tokens_1[_i];
		if (typeof token === "string") {
			route += escapeString(encode3(token));
		} else {
			var prefix = escapeString(encode3(token.prefix));
			var suffix = escapeString(encode3(token.suffix));
			if (token.pattern) {
				if (keys) keys.push(token);
				if (prefix || suffix) {
					if (token.modifier === "+" || token.modifier === "*") {
						var mod = token.modifier === "*" ? "?" : "";
						route += "(?:"
							.concat(prefix, "((?:")
							.concat(token.pattern, ")(?:")
							.concat(suffix)
							.concat(prefix, "(?:")
							.concat(token.pattern, "))*)")
							.concat(suffix, ")")
							.concat(mod);
					} else {
						route += "(?:"
							.concat(prefix, "(")
							.concat(token.pattern, ")")
							.concat(suffix, ")")
							.concat(token.modifier);
					}
				} else {
					if (token.modifier === "+" || token.modifier === "*") {
						throw new TypeError(
							'Can not repeat "'.concat(
								token.name,
								'" without a prefix and suffix',
							),
						);
					}
					route += "(".concat(token.pattern, ")").concat(token.modifier);
				}
			} else {
				route += "(?:"
					.concat(prefix)
					.concat(suffix, ")")
					.concat(token.modifier);
			}
		}
	}
	if (end) {
		if (!strict) route += "".concat(delimiterRe, "?");
		route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
	} else {
		var endToken = tokens[tokens.length - 1];
		var isEndDelimited =
			typeof endToken === "string"
				? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1
				: endToken === void 0;
		if (!strict) {
			route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
		}
		if (!isEndDelimited) {
			route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
		}
	}
	return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
	if (path instanceof RegExp) return regexpToRegexp(path, keys);
	if (Array.isArray(path)) return arrayToRegexp(path, keys, options);
	return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
	const requestPath = new URL(request.url).pathname;
	for (const route of [...routes].reverse()) {
		if (route.method && route.method !== request.method) {
			continue;
		}
		const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
			end: false,
		});
		const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
			end: false,
		});
		const matchResult = routeMatcher(requestPath);
		const mountMatchResult = mountMatcher(requestPath);
		if (matchResult && mountMatchResult) {
			for (const handler of route.middlewares.flat()) {
				yield {
					handler,
					params: matchResult.params,
					path: mountMatchResult.path,
				};
			}
		}
	}
	for (const route of routes) {
		if (route.method && route.method !== request.method) {
			continue;
		}
		const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
			end: true,
		});
		const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
			end: false,
		});
		const matchResult = routeMatcher(requestPath);
		const mountMatchResult = mountMatcher(requestPath);
		if (matchResult && mountMatchResult && route.modules.length) {
			for (const handler of route.modules.flat()) {
				yield {
					handler,
					params: matchResult.params,
					path: matchResult.path,
				};
			}
			break;
		}
	}
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
	async fetch(originalRequest, env2, workerContext) {
		let request = originalRequest;
		const handlerIterator = executeRequest(request);
		let data = {};
		let isFailOpen = false;
		const next = /* @__PURE__ */ __name(async (input, init) => {
			if (input !== void 0) {
				let url = input;
				if (typeof input === "string") {
					url = new URL(input, request.url).toString();
				}
				request = new Request(url, init);
			}
			const result = handlerIterator.next();
			if (result.done === false) {
				const { handler, params, path } = result.value;
				const context2 = {
					request: new Request(request.clone()),
					functionPath: path,
					next,
					params,
					get data() {
						return data;
					},
					set data(value) {
						if (typeof value !== "object" || value === null) {
							throw new Error("context.data must be an object");
						}
						data = value;
					},
					env: env2,
					waitUntil: workerContext.waitUntil.bind(workerContext),
					passThroughOnException: /* @__PURE__ */ __name(() => {
						isFailOpen = true;
					}, "passThroughOnException"),
				};
				const response = await handler(context2);
				if (!(response instanceof Response)) {
					throw new Error("Your Pages function should return a Response");
				}
				return cloneResponse(response);
			} else if ("ASSETS") {
				const response = await env2["ASSETS"].fetch(request);
				return cloneResponse(response);
			} else {
				const response = await fetch(request);
				return cloneResponse(response);
			}
		}, "next");
		try {
			return await next();
		} catch (error3) {
			if (isFailOpen) {
				const response = await env2["ASSETS"].fetch(request);
				return cloneResponse(response);
			}
			throw error3;
		}
	},
};
var cloneResponse = /* @__PURE__ */ __name(
	(response) =>
		// https://fetch.spec.whatwg.org/#null-body-status
		new Response(
			[101, 204, 205, 304].includes(response.status) ? null : response.body,
			response,
		),
	"cloneResponse",
);

// ../node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(
	async (request, env2, _ctx, middlewareCtx) => {
		try {
			return await middlewareCtx.next(request, env2);
		} finally {
			try {
				if (request.body !== null && !request.bodyUsed) {
					const reader = request.body.getReader();
					while (!(await reader.read()).done) {}
				}
			} catch (e) {
				console.error("Failed to drain the unused request body.", e);
			}
		}
	},
	"drainBody",
);
var middleware_ensure_req_body_drained_default = drainBody;

// ../node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
	return {
		name: e?.name,
		message: e?.message ?? String(e),
		stack: e?.stack,
		cause: e?.cause === void 0 ? void 0 : reduceError(e.cause),
	};
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(
	async (request, env2, _ctx, middlewareCtx) => {
		try {
			return await middlewareCtx.next(request, env2);
		} catch (e) {
			const error3 = reduceError(e);
			return Response.json(error3, {
				status: 500,
				headers: { "MF-Experimental-Error-Stack": "true" },
			});
		}
	},
	"jsonError",
);
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-Zq5Jwf/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
	middleware_ensure_req_body_drained_default,
	middleware_miniflare3_json_error_default,
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
	__facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
	const [head, ...tail] = middlewareChain;
	const middlewareCtx = {
		dispatch,
		next(newRequest, newEnv) {
			return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
		},
	};
	return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
	return __facade_invokeChain__(request, env2, ctx, dispatch, [
		...__facade_middleware__,
		finalMiddleware,
	]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-Zq5Jwf/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
	constructor(scheduledTime, cron, noRetry) {
		this.scheduledTime = scheduledTime;
		this.cron = cron;
		this.#noRetry = noRetry;
	}
	static {
		__name(___Facade_ScheduledController__, "__Facade_ScheduledController__");
	}
	#noRetry;
	noRetry() {
		if (!(this instanceof ___Facade_ScheduledController__)) {
			throw new TypeError("Illegal invocation");
		}
		this.#noRetry();
	}
};
function wrapExportedHandler(worker) {
	if (
		__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 ||
		__INTERNAL_WRANGLER_MIDDLEWARE__.length === 0
	) {
		return worker;
	}
	for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
		__facade_register__(middleware);
	}
	const fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
		if (worker.fetch === void 0) {
			throw new Error("Handler does not export a fetch() function.");
		}
		return worker.fetch(request, env2, ctx);
	}, "fetchDispatcher");
	return {
		...worker,
		fetch(request, env2, ctx) {
			const dispatcher = /* @__PURE__ */ __name((type, init) => {
				if (type === "scheduled" && worker.scheduled !== void 0) {
					const controller = new __Facade_ScheduledController__(
						Date.now(),
						init.cron ?? "",
						() => {},
					);
					return worker.scheduled(controller, env2, ctx);
				}
			}, "dispatcher");
			return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
		},
	};
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
	if (
		__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 ||
		__INTERNAL_WRANGLER_MIDDLEWARE__.length === 0
	) {
		return klass;
	}
	for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
		__facade_register__(middleware);
	}
	return class extends klass {
		#fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
			this.env = env2;
			this.ctx = ctx;
			if (super.fetch === void 0) {
				throw new Error("Entrypoint class does not define a fetch() function.");
			}
			return super.fetch(request);
		}, "#fetchDispatcher");
		#dispatcher = /* @__PURE__ */ __name((type, init) => {
			if (type === "scheduled" && super.scheduled !== void 0) {
				const controller = new __Facade_ScheduledController__(
					Date.now(),
					init.cron ?? "",
					() => {},
				);
				return super.scheduled(controller);
			}
		}, "#dispatcher");
		fetch(request) {
			return __facade_invoke__(
				request,
				this.env,
				this.ctx,
				this.#dispatcher,
				this.#fetchDispatcher,
			);
		}
	};
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
	WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
	WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

export {
	__INTERNAL_WRANGLER_MIDDLEWARE__,
	middleware_loader_entry_default as default,
};
//# sourceMappingURL=functionsWorker-0.4492528550132633.mjs.map
