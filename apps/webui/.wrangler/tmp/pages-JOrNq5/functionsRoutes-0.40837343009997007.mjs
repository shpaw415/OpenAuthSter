import { onRequest as __auth__action__js_onRequest } from "/home/shpaw415/openauth-projects/openauth-webui/functions/auth/[action].js";
import { onRequest as __auth_index_js_onRequest } from "/home/shpaw415/openauth-projects/openauth-webui/functions/auth/index.js";
import { onRequest as __healthcheck_js_onRequest } from "/home/shpaw415/openauth-projects/openauth-webui/functions/healthcheck.js";
import { onRequest as __projects_index_js_onRequest } from "/home/shpaw415/openauth-projects/openauth-webui/functions/projects/index.js";
import { onRequest as __projects_manage_js_onRequest } from "/home/shpaw415/openauth-projects/openauth-webui/functions/projects/manage.js";
import { onRequest as __providers_index_js_onRequest } from "/home/shpaw415/openauth-projects/openauth-webui/functions/providers/index.js";
import { onRequest as __templates_id_js_onRequest } from "/home/shpaw415/openauth-projects/openauth-webui/functions/templates/id.js";
import { onRequest as __templates_index_js_onRequest } from "/home/shpaw415/openauth-projects/openauth-webui/functions/templates/index.js";
import { onRequest as __themes_id_js_onRequest } from "/home/shpaw415/openauth-projects/openauth-webui/functions/themes/id.js";
import { onRequest as __themes_index_js_onRequest } from "/home/shpaw415/openauth-projects/openauth-webui/functions/themes/index.js";

export const routes = [
	{
		routePath: "/projects/manage",
		mountPath: "/projects",
		method: "",
		middlewares: [],
		modules: [__projects_manage_js_onRequest],
	},
	{
		routePath: "/templates/id",
		mountPath: "/templates",
		method: "",
		middlewares: [],
		modules: [__templates_id_js_onRequest],
	},
	{
		routePath: "/themes/id",
		mountPath: "/themes",
		method: "",
		middlewares: [],
		modules: [__themes_id_js_onRequest],
	},
	{
		routePath: "/auth/:action",
		mountPath: "/auth",
		method: "",
		middlewares: [],
		modules: [__auth__action__js_onRequest],
	},
	{
		routePath: "/auth",
		mountPath: "/auth",
		method: "",
		middlewares: [],
		modules: [__auth_index_js_onRequest],
	},
	{
		routePath: "/healthcheck",
		mountPath: "/",
		method: "",
		middlewares: [],
		modules: [__healthcheck_js_onRequest],
	},
	{
		routePath: "/projects",
		mountPath: "/projects",
		method: "",
		middlewares: [],
		modules: [__projects_index_js_onRequest],
	},
	{
		routePath: "/providers",
		mountPath: "/providers",
		method: "",
		middlewares: [],
		modules: [__providers_index_js_onRequest],
	},
	{
		routePath: "/templates",
		mountPath: "/templates",
		method: "",
		middlewares: [],
		modules: [__templates_index_js_onRequest],
	},
	{
		routePath: "/themes",
		mountPath: "/themes",
		method: "",
		middlewares: [],
		modules: [__themes_index_js_onRequest],
	},
];
