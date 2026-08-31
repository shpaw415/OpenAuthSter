import type { UsageOverTime } from "@api/dashboard";
import { Icon } from "@iconify/react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

function formatBucketLabel(bucket: string): string {
	try {
		const d = new Date(bucket);
		return `${d.getHours()}h`;
	} catch {
		return bucket;
	}
}

function transformToChartData(usage: UsageOverTime) {
	return usage.buckets.map((bucket, i) => {
		const point: Record<string, string | number> = {
			bucket: formatBucketLabel(bucket),
		};
		for (const s of usage.series) {
			point[s.name] = s.counts[i] ?? 0;
		}
		return point;
	});
}

export function UsageChart({
	usageOverTime,
	isLoading,
}: {
	usageOverTime: UsageOverTime | null | undefined;
	isLoading?: boolean;
}) {
	if (isLoading) {
		return (
			<div className="bg-gray-800 rounded-lg border border-gray-700 p-4 h-64 flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
			</div>
		);
	}

	if (!usageOverTime || usageOverTime.series.length === 0) {
		return (
			<div className="bg-gray-800 rounded-lg border border-gray-700 p-4 h-64 flex items-center justify-center">
				<p className="text-gray-400">No usage data yet</p>
			</div>
		);
	}

	const chartData = transformToChartData(usageOverTime);
	const hasAnyData = usageOverTime.series.some((s) =>
		s.counts.some((c) => c > 0),
	);

	if (!hasAnyData) {
		return (
			<div className="bg-gray-800 rounded-lg border border-gray-700 p-4 h-64 flex items-center justify-center">
				<p className="text-gray-400">No activity in the last 24 hours</p>
			</div>
		);
	}

	return (
		<div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
			<h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
				<Icon icon="lucide:bar-chart-3" className="w-5 h-5 text-blue-400" />
				Activity by project (24h)
			</h3>
			<div className="h-64">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart
						data={chartData}
						margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
					>
						<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
						<XAxis
							dataKey="bucket"
							stroke="#9CA3AF"
							tick={{ fill: "#9CA3AF", fontSize: 12 }}
							axisLine={{ stroke: "#4B5563" }}
							tickLine={{ stroke: "#4B5563" }}
						/>
						<YAxis
							stroke="#9CA3AF"
							tick={{ fill: "#9CA3AF", fontSize: 12 }}
							axisLine={{ stroke: "#4B5563" }}
							tickLine={{ stroke: "#4B5563" }}
							allowDecimals={false}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: "#1F2937",
								border: "1px solid #374151",
								borderRadius: "8px",
							}}
							labelStyle={{ color: "#E5E7EB" }}
							labelFormatter={(label) => `Heure: ${label}`}
						/>
						<Legend
							wrapperStyle={{ paddingTop: "16px" }}
							formatter={(value) => (
								<span className="text-gray-300 text-sm">{value}</span>
							)}
						/>
						{usageOverTime.series.map((s) => (
							<Area
								key={s.name}
								type="monotone"
								dataKey={s.name}
								stackId="1"
								stroke={s.color}
								fill={s.color}
								fillOpacity={0.6}
								name={s.name}
							/>
						))}
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
