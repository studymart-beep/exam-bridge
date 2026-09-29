interface DataPoint {
  label: string;
  value: number;
}

interface RevenueChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  formatValue?: (v: number) => string;
}

export default function RevenueChart({
  data,
  height = 160,
  color = "#1D4ED8",
  formatValue = (v) => String(v),
}: RevenueChartProps) {
  if (data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 100 / data.length;

  return (
    <div className="w-full" style={{ height }}>
      <svg
        viewBox={`0 0 100 ${height}`}
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((frac) => (
          <line
            key={frac}
            x1="0"
            y1={height * (1 - frac)}
            x2="100"
            y2={height * (1 - frac)}
            stroke="#E2E8F0"
            strokeWidth="0.3"
          />
        ))}

        {data.map((d, i) => {
          const barH = (d.value / max) * (height - 24);
          const x = i * barWidth + barWidth * 0.2;
          const w = barWidth * 0.6;
          const y = height - 20 - barH;

          return (
            <g key={d.label}>
              <rect
                x={x}
                y={y}
                width={w}
                height={barH}
                fill={color}
                rx="1.5"
                opacity="0.85"
              />
              <text
                x={i * barWidth + barWidth / 2}
                y={height - 6}
                textAnchor="middle"
                fontSize="3.5"
                fill="#94A3B8"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between mt-1 px-1">
        <span className="text-[10px] text-text-muted">
          Max: {formatValue(max)}
        </span>
      </div>
    </div>
  );
}
