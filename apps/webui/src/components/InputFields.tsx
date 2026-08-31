import { useEmailTemplates } from "@hooks/useEmailTemplates";
import { useCallback, useState } from "react";
import { Icon } from "./icon";

export function TemplateSelection({ project_id }: { project_id: string }) {
	const templates = useEmailTemplates();
	const [currentSelect, setCurrentSelect] = useState<number | undefined>();
	const onChange = useCallback<React.ChangeEventHandler<HTMLSelectElement>>(
		(e) => {
			setCurrentSelect(Number(e.target.value));
		},
		[],
	);

	if (templates.isLoading) {
		return (
			<div className="flex items-center gap-2 text-gray-400">
				<Icon icon="lucide:loader" className="w-4 h-4 animate-spin" />
				Loading templates...
			</div>
		);
	}
	return (
		<SelectWrapper
			name="email-template"
			icon={<Icon icon="lucide:mail" />}
			helpText="Select an email template to test with this project."
			action={
				currentSelect && (
					<a
						href={`/dashboard/templates/manage?project_id=${project_id}&edit=${templates.templates.find((t) => t.id === currentSelect)?.name || ""}`}
						className="text-sm text-blue-500 hover:underline"
					>
						Manage template with this project
					</a>
				)
			}
		>
			<select
				onChange={onChange}
				className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
			>
				<option value="">Choose a template</option>
				{templates.templates.map((template) => (
					<option key={template.id} value={template.id}>
						{template.name}
					</option>
				))}
			</select>
		</SelectWrapper>
	);
}

export function SelectWrapper({
	children,
	name,
	icon,
	action,
	helpText,
}: {
	children: React.ReactNode;
	name: string;
	icon: React.ReactNode;
	action?: React.ReactNode;
	helpText?: string | React.ReactNode;
}) {
	return (
		<div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center space-x-2">
					{icon}
					<h3 className="text-base font-medium text-white">{name}</h3>
				</div>
				{action}
			</div>
			{children}
			{helpText && (
				<div className="flex items-center justify-between mt-2">
					<p className="text-gray-500 text-xs">{helpText}</p>
					<span></span>
				</div>
			)}
		</div>
	);
}
