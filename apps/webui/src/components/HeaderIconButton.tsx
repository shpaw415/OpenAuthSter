import { Icon } from "@iconify/react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

const BASE_CLASS =
	"p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	as?: "button";
	icon: string;
};

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
	as: "a";
	icon: string;
};

type Props = ButtonProps | AnchorProps;

export function HeaderIconButton(props: Props) {
	if (props.as === "a") {
		const { as: _as, icon, className, ...rest } = props;
		return (
			<a className={`${BASE_CLASS} inline-flex ${className ?? ""}`} {...rest}>
				<Icon icon={icon} className="w-4 h-4" />
			</a>
		);
	}

	const { as: _as, icon, className, ...rest } = props as ButtonProps;
	return (
		<button
			type="button"
			className={`${BASE_CLASS} ${className ?? ""}`}
			{...rest}
		>
			<Icon icon={icon} className="w-4 h-4" />
		</button>
	);
}
