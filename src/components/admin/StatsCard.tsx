import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  iconBgColor?: string;
  iconColor?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  subtitle,
  iconBgColor = "bg-blue-100",
  iconColor = "text-blue-600",
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${iconBgColor} ${iconColor} p-3 rounded-lg`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
}
