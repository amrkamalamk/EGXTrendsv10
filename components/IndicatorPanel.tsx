import React from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Line,
  Cell,
  ReferenceLine
} from 'recharts';
import { OHLCVData } from '../types';

interface IndicatorPanelProps {
  data: OHLCVData[];
  height?: number;
  minimal?: boolean;
}

const IndicatorPanel: React.FC<IndicatorPanelProps> = ({ data, height = 200, minimal = false }) => {
  // Split height effectively for two small charts
  const rowHeight = height ? height / 2 : 50;

  return (
    <div className="w-full mt-1 flex flex-col gap-1">
      
      {/* MACD Section */}
      <div style={{ height: rowHeight }} className="w-full relative">
        <div className="absolute top-0 left-1 text-[8px] text-slate-500 font-bold z-10 pointer-events-none">MACD</div>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', fontSize: '10px', padding: '4px' }}
              itemStyle={{ padding: 0 }}
              labelStyle={{ display: 'none' }}
              formatter={(value: number, name: string) => [value.toFixed(2), name === "macd.histogram" ? "Hist" : "MACD"]}
            />
            {/* Histogram */}
            <Bar dataKey="macd.histogram" barSize={3} isAnimationActive={false}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={(entry.macd?.histogram || 0) > 0 ? '#10b981' : '#ef4444'} 
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* RSI Section */}
      <div style={{ height: rowHeight }} className="w-full relative border-t border-slate-700/30">
        <div className="absolute top-0 left-1 text-[8px] text-purple-400 font-bold z-10 pointer-events-none">RSI</div>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 2 }}>
            <YAxis hide domain={[0, 100]} />
            <ReferenceLine 
              y={70} 
              stroke="#ef4444" 
              strokeDasharray="3 3" 
              strokeOpacity={0.6}
              label={{ value: 'Overbought', position: 'insideTopRight', fill: '#ef4444', fontSize: 9 }}
            />
            <ReferenceLine 
              y={30} 
              stroke="#10b981" 
              strokeDasharray="3 3" 
              strokeOpacity={0.6} 
              label={{ value: 'Oversold', position: 'insideBottomRight', fill: '#10b981', fontSize: 9 }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', fontSize: '10px', padding: '4px' }}
              itemStyle={{ padding: 0 }}
              labelStyle={{ display: 'none' }}
              formatter={(value: number) => [value.toFixed(0), "RSI"]}
            />
            <Line 
              type="monotone" 
              dataKey="rsi" 
              stroke="#c084fc" // Purple
              strokeWidth={1.5} 
              dot={false} 
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IndicatorPanel;