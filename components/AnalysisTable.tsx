import React from 'react';
import { AnalysisData } from '../types';

interface AnalysisTableProps {
  data: AnalysisData[];
}

const AnalysisTable: React.FC<AnalysisTableProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const dates = data[0].history.map(h => h.date);

  // Helper to format date MM-DD
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="w-full h-full overflow-auto bg-slate-900 border border-slate-700 rounded-xl shadow-xl">
      <table className="w-full text-xs text-left text-slate-300 border-collapse">
        <thead className="text-xs text-slate-400 uppercase bg-slate-800 sticky top-0 z-20 shadow-lg">
          <tr>
            <th scope="col" className="px-4 py-3 border-b border-r border-slate-700 min-w-[120px] sticky left-0 bg-slate-800 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
              Stock
            </th>
            {dates.map((date, i) => (
              <th key={date} scope="col" className="px-2 py-3 border-b border-slate-700 min-w-[80px] text-center font-medium">
                <div className="text-[10px] text-slate-500 mb-1">{i === dates.length - 1 ? 'Latest' : ''}</div>
                {formatDate(date)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <React.Fragment key={row.stock.symbol}>
              {/* Row 1: Price */}
              <tr className="bg-slate-900/50 hover:bg-slate-800/50 transition-colors border-t border-slate-700/50">
                <td className="px-4 py-2 font-bold text-slate-200 border-r border-slate-700 bg-slate-900 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                  <div className="flex flex-col">
                    <span className="text-emerald-400">{row.stock.symbol}</span>
                    <span className="text-[9px] text-slate-500 font-normal">{row.stock.name}</span>
                  </div>
                </td>
                {row.history.map((day) => (
                  <td key={`${row.stock.symbol}-${day.date}-price`} className="px-2 py-2 text-center text-slate-300 font-mono border-r border-slate-800/50">
                    {day.price.toFixed(2)}
                  </td>
                ))}
              </tr>
              
              {/* Row 2: % Change */}
              <tr className="bg-slate-900/30 hover:bg-slate-800/50 transition-colors border-b border-slate-700">
                <td className="px-4 py-2 text-[10px] text-slate-500 border-r border-slate-700 bg-slate-900 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                   Daily %
                </td>
                {row.history.map((day) => (
                  <td key={`${row.stock.symbol}-${day.date}-pct`} className={`px-2 py-2 text-center font-bold font-mono border-r border-slate-800/50 ${
                    day.changePercent > 0 ? 'text-emerald-500' : day.changePercent < 0 ? 'text-rose-500' : 'text-slate-500'
                  }`}>
                    {day.changePercent > 0 ? '+' : ''}{day.changePercent}%
                  </td>
                ))}
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AnalysisTable;