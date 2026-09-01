declare module "*.svg" {
	import type { FC, SVGProps } from "react";
	const content: FC<SVGProps<SVGElement>>;
	export default content;
}

declare module "*.mdx" {
	import type { FC } from "react";
	const content: FC;
	export default content;
}
