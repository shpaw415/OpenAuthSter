import { Icon as IconifyIcon } from "@iconify/react";

export function Icon({
	icon,
	className,
	...props
}: {
	icon: string;
	className?: string;
} & React.ComponentProps<typeof IconifyIcon>) {
	return <IconifyIcon icon={icon} className={className} {...props} />;
}
