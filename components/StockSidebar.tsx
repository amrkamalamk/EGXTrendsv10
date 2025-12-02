import React, { useState } from 'react';
import { Stock } from '../types';
import { Search, TrendingUp, Activity } from 'lucide-react';

interface StockSidebarProps {
  stocks: Stock[];
  selectedStock: Stock | null;
  onSelectStock: (stock: Stock) => void;
  isLoading: boolean;
}

const StockSidebar: React.FC<StockSidebarProps> = ({ stocks, selectedStock, onSelectStock, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStocks = stocks.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full md:w-80 bg-slate-800 border-r border-slate-700 flex flex-col h-full">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2 mb-4">
          <Activity className="w-6 h-6" />
          EGX 30 Tracker
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search symbol or name..."
            className="w-full bg-slate-900 text-slate-200 pl-10 pr-4 py-2 rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-700/50 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {filteredStocks.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => onSelectStock(stock)}
                className={`w-full text-left p-4 hover:bg-slate-700/50 transition-colors flex items-center justify-between group ${
                  selectedStock?.symbol === stock.symbol ? 'bg-slate-700 border-l-4 border-emerald-500' : 'border-l-4 border-transparent'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-200 flex items-center gap-2">
                    {stock.symbol}
                    {selectedStock?.symbol === stock.symbol && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <div className="text-xs text-slate-400 truncate max-w-[180px]">{stock.name}</div>
                </div>
                {stock.sector && (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded-full border border-slate-600">
                    {stock.sector}
                  </span>
                )}
              </button>
            ))}
            {filteredStocks.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No stocks found matching "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="p-3 text-[10px] text-slate-500 text-center border-t border-slate-700">
        Data sourced via Gemini & Search Grounding
      </div>
    </div>
  );
};

export default StockSidebar;