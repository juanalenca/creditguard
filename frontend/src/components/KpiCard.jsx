import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const KpiCard = ({ title, value, icon: Icon, colorClass, borderClass, trend, trendValue, invertTrendColor }) => {
  // Determine trend display
  let TrendIcon = Minus;
  let trendColor = 'text-gray-500';
  let trendBg = 'bg-gray-800';
  
  if (trend === 'up') {
    TrendIcon = TrendingUp;
    trendColor = invertTrendColor ? 'text-emerald-400' : 'text-red-400';
    trendBg = invertTrendColor ? 'bg-emerald-900/30' : 'bg-red-900/30';
  } else if (trend === 'down') {
    TrendIcon = TrendingDown;
    trendColor = invertTrendColor ? 'text-red-400' : 'text-emerald-400';
    trendBg = invertTrendColor ? 'bg-red-900/30' : 'bg-emerald-900/30';
  }

  return (
    <div className={`bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 border-t-4 ${borderClass} group hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">
            {value}
          </h3>
          {trendValue && (
            <div className={`inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-xs font-semibold ${trendBg} ${trendColor}`}>
              {trend !== 'neutral' && <TrendIcon className="w-3 h-3 mr-1" />}
              {trendValue}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-gray-900 shadow-inner ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
