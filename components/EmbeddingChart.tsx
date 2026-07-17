"use client";

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis
} from "recharts";
import { ProjectedPoint, QueryPoint } from "@/types/embedding";

function DocTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const point: ProjectedPoint = payload[0].payload;
  if (!point.text) return null;

  return (
    <div className="glass-panel-chart p-4 max-w-xs border border-white/10 shadow-lg backdrop-blur-2xl">
      <p className="text-[11px] font-mono text-base-400 mb-2">
        bloco {String(point.index + 1).padStart(2, "0")} · {point.charCount} caracteres
      </p>
      <p className="text-sm text-base-100 leading-relaxed line-clamp-5">{point.text}</p>
    </div>
  );
}

function QueryTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const point: QueryPoint = payload[0].payload;

  return (
    <div className="glass-panel-chart p-4 max-w-xs border border-white/20 shadow-lg backdrop-blur-2xl">
      <p className="text-[11px] font-mono text-base-400 mb-2">vetor da query</p>
      <p className="text-sm text-base-50 leading-relaxed line-clamp-3 italic">
        {point.text}
      </p>
    </div>
  );
}

interface EmbeddingChartProps {
  points: ProjectedPoint[];
  queryPoint?: QueryPoint | null;
}

export default function EmbeddingChart({ points, queryPoint }: EmbeddingChartProps) {
  if (points.length === 0) return null;

  const queryData = queryPoint ? [queryPoint] : [];

  return (
    <div className="glass-panel-chart p-6 flex flex-col gap-4 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label-eyebrow">Etapa 05</p>
          <h2 className="text-lg font-medium text-base-50 mt-1">Espaco semantico em 2D</h2>
          <p className="text-sm text-base-400 mt-1">
            Cada ponto representa um bloco projetado via PCA para duas componentes principais.
            {queryPoint && (
              <span className="text-base-200">
                {" "}O ponto branco maior e o vetor da sua busca posicionado no mesmo espaco.
              </span>
            )}
          </p>
        </div>
        {queryPoint && (
          <div className="flex items-center gap-4 shrink-0 pt-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-base-400" />
              <span className="text-xs text-base-400">blocos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-base-50 ring-2 ring-white/30" />
              <span className="text-xs text-base-200">query</span>
            </div>
          </div>
        )}
      </div>

      <div className="w-full h-[420px] -ml-4 relative">
        {/* Glass overlay effect */}
        <div className="absolute inset-0 rounded-xl pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl"></div>
          <div className="absolute inset-0 rounded-xl opacity-5 animate-float" style={{
            backgroundImage: `radial-gradient(circle at 15% 50%, rgba(255,255,255,0.1) 1px, transparent 1px),
                              radial-gradient(circle at 85% 30%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="Componente 1"
              tick={{ fill: "#7a7a82", fontSize: 11, fontFamily: "SF Mono, monospace" }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Componente 2"
              tick={{ fill: "#7a7a82", fontSize: 11, fontFamily: "SF Mono, monospace" }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
            />
            <ZAxis range={[70, 70]} />
            <Tooltip content={<DocTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />
            <Scatter
              name="Blocos"
              data={points}
              fill="url(#pointGradient)"
              fillOpacity={0.7}
              stroke="#54545c"
              strokeWidth={0.5}
              isAnimationActive={true}
              animationBegin={0}
              animationDuration={500}
            />
            {queryData.length > 0 && (
              <Scatter
                name="Query"
                data={queryData}
                fill="#f7f7f9"
                fillOpacity={1}
                shape={(props: any) => {
                  const { cx, cy } = props;
                  return (
                    <g>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={12}
                        fill="rgba(247,247,249,0.1)"
                        stroke="rgba(247,247,249,0.3)"
                        strokeWidth={1}
                        filter="url(#glow)"
                      />
                      <circle
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill="url(#queryPointGradient)"
                        filter="url(#glow)"
                      />
                    </g>
                  );
                }}
              >
                <Tooltip content={<QueryTooltip />} />
              </Scatter>
            )}
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#ffffff" floodOpacity="0.2" />
              </filter>
              <radialGradient id="pointGradient" cx="30%" cy="30%" r="70%" fx="30%" fy="30%">
                <stop offset="0%" stopColor="#8a8a92" stopOpacity={0.9} />
                <stop offset="50%" stopColor="#54545c" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#3a3a40" stopOpacity={0.4} />
              </radialGradient>
              <radialGradient id="queryPointGradient" cx="30%" cy="30%" r="70%" fx="30%" fy="30%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
                <stop offset="50%" stopColor="#f0f0f0" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#e0e0e0" stopOpacity={0.4} />
              </radialGradient>
            </defs>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
