import React from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
} from 'recharts';
import { OHLCVData } from '../types';

interface CandleStickChartProps {
  data: OHLCVData[];
  minimal?: boolean;
}

const CandleStickShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  const { open, close, high, low } = payload;
  const isUp = close >= open;

  const yScale = props.yAxis?.scale;
  if (!yScale) return null;

  const yOpen = yScale(open);
  const yClose = yScale(close);
  const yHigh = yScale(high);
  const yLow = yScale(low);
  
  // Make candles visually distinct
  const barWidth = Math.max(6, width * 0.7); 
  const xCenter = x + width / 2;
  const color = isUp ? '#10b981' : '#ef4444'; // Emerald 500 or Red 500
  
  // Ensure minimum visual height for flat moves
  const bodyHeight = Math.max(3, Math.abs(yOpen - yClose));
  const bodyY = isUp ? yClose : yOpen;

  return (
    <g>
      {/* Wick */}
      <line
        x1={xCenter}
        y1={yHigh}
        x2={xCenter}
        y2={yLow}
        stroke={color}
        strokeWidth={2} 
      />
      {/* Body */}
      <rect
        x={xCenter - barWidth / 2}
        y={Math.min(yOpen, yClose)} // Use math min to find top edge
        width={barWidth}
        height={bodyHeight}
        fill={color}
        stroke={color}
      />
    </g>
  );
};

const CustomTooltip = ({ active, payload, label, minimal }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={`bg-slate-800 border border-slate-600 rounded shadow-lg z-50 ${minimal ? 'p-2 text-[10px]' : 'p-3 text-sm'}`}>
        {!minimal && <p className="text-slate-400 mb-1">{label}</p>}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <span className="text-slate-400">O:</span> <span className="text-slate-200 font-mono">{data.open.toFixed(2)}</span>
            <span className="text-slate-400">H:</span> <span className="text-slate-200 font-mono">{data.high.toFixed(2)}</span>
            <span className="text-slate-400">L:</span> <span className="text-slate-200 font-mono">{data.low.toFixed(2)}</span>
            <span className="text-slate-400">C:</span> <span className="text-slate-200 font-mono">{data.close.toFixed(2)}</span>
        </div>
        {data.vwap && <p className="text-yellow-400 mt-2 border-t border-slate-700 pt-1 font-bold">VWAP: {data.vwap.toFixed(2)}</p>}
      </div>
    );
  }
  return null;
};

const CandleStickChart: React.FC<CandleStickChartProps> = ({ data, minimal = false }) => {
  const safeData = data.filter(d => 
    !isNaN(d.low) && !isNaN(d.high) && !isNaN(d.open) && !isNaN(d.close)
  );
  
  if (safeData.length === 0) return null;

  const minLow = Math.min(...safeData.map(d => d.low));
  const maxHigh = Math.max(...safeData.map(d => d.high));
  
  // Reduced padding to zoom in on candles and avoid flat lines
  const domainPadding = (maxHigh - minLow) * 0.02; 
  const domainMin = minLow - domainPadding;
  const domainMax = maxHigh + domainPadding;
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart 
        data={safeData} 
        margin={minimal ? { top: 5, right: 0, left: 0, bottom: 0 } : { top: 20, right: 30, left: 0, bottom: 0 }}
      >
        {!minimal && <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />}
        {!minimal && (
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8" 
            tick={{fontSize: 12}} 
            tickLine={false} 
            axisLine={false}
            minTickGap={30}
          />
        )}
        <YAxis 
          domain={[domainMin, domainMax]} 
          orientation="right" 
          stroke="#94a3b8"
          tick={{fontSize: minimal ? 0 : 12}}
          width={minimal ? 0 : 40}
          hide={minimal}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
            content={<CustomTooltip minimal={minimal} />} 
            cursor={{stroke: '#475569', strokeDasharray: '3 3'}}
            isAnimationActive={false}
        />
        
        {/* VWAP line */}
        <Line 
          type="monotone" 
          dataKey="vwap" 
          stroke="#facc15" 
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
          activeDot={false}
        />

        {/* The Bar drives the custom shape. */}
        <Bar 
            dataKey="close" 
            shape={<CandleStickShape />} 
            isAnimationActive={false} 
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default CandleStickChart;