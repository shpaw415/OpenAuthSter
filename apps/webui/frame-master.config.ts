import type { FrameMasterConfig } from "frame-master/server/types";
import ApplyReact from "frame-master-plugin-apply-react/plugin";
import CloudflareAction from "frame-master-plugin-cloudflare-pages-functions-action";
import EnvInHtml from "frame-master-plugin-env-in-html";
import ImageOptimizerPlugin from "frame-master-plugin-image-optimizer";
import mdxLoaderPlugin from "frame-master-plugin-mdx-to-js-loader";
import ReactToHtml from "frame-master-plugin-react-to-html";
import framemasterpluginserverobject from "frame-master-plugin-server-object";
import TailwindPlugin from "frame-master-plugin-tailwind";
import svgToJsxPlugin from "frame-master-svg-to-jsx-loader";
import type { OpenAuthsterClient } from "openauth-webui-shared-types/client/user";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

export default {
	HTTPServer: {
		port: 3001,
	},
	plugins: [
		ReactToHtml({
			shellPath: "src/shell.tsx",
			srcDir: "src/pages",
		}),
		ApplyReact({
			clientShellPath: "src/client-wrapper.tsx",
			route: "src/pages",
			style: "nextjs",
		}),
		TailwindPlugin({
			inputFile: "static/tailwind.css",
			outputFile: "static/style.css",
			options: {
				autoInjectInBuild: true,
				runtime: "bun",
			},
		}),
		{
			name: "static-assets",
			version: "1.0.0",
			build: {
				buildConfig: {
					naming: {
						asset: "[dir]/[name].[ext]",
					},
				},
			},
		},
		EnvInHtml({
			prefix: "PUBLIC_",
			entries: ["NODE_ENV"],
		}),
		CloudflareAction({
			actionBasePath: "src/actions",
			outDir: ".frame-master/build",
			//@ts-expect-error
			customFetch: async (input, init) => {
				return (
					(
						globalThis as {
							__OPENAUTHSTER_CLIENT_INSTANCE__?: OpenAuthsterClient<
								Record<string, unknown>,
								Record<string, unknown>
							>;
						}
					).__OPENAUTHSTER_CLIENT_INSTANCE__ as OpenAuthsterClient<
						Record<string, unknown>,
						Record<string, unknown>
					>
				).fetch(input as RequestInfo, init);
			},
		}),
		svgToJsxPlugin(),
		mdxLoaderPlugin({
			mdxOptions: {
				remarkPlugins: [remarkGfm],
				rehypePlugins: [
					rehypeSlug,
					rehypeAutolinkHeadings,
					[rehypePrettyCode, { theme: "one-dark-pro" }],
				],
				recmaPlugins: [],
			},
		}),
		ImageOptimizerPlugin({
			input: "static",
			output: "optimized",
			formats: ["webp"],
			quality: 100,
			sizes: [320],
			skipExisting: true,
			enableImports: true,
			keepOriginal: true,
		}),
		framemasterpluginserverobject({
			prefix: "OBJECT_",
			src: "src",
		}),
	],
} satisfies FrameMasterConfig;
