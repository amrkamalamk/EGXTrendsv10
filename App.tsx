import React, { useState, useMemo, useEffect } from 'react';
import { Stock, TimeFrame, MarketIndex, AnalysisData } from './types';
import { cleanSymbol, EGX30_FALLBACK, fetchMarketAnalysis, onApiUsageUpdate, DAILY_QUOTA } from './services/geminiService';
import TradingViewWidget from './components/TradingViewWidget';
import AnalysisTable from './components/AnalysisTable';
import { BarChart2, Search, ArrowLeft, Play, RefreshCw, AlertTriangle, FileText, Table, Activity, Zap } from 'lucide-react';

const App: React.FC = () => {
  // Mode: 'input' or 'dashboard'
  const [isDashboardActive, setIsDashboardActive] = useState(false);
  // View: 'charts' or 'table'
  const [viewMode, setViewMode] = useState<'charts' | 'table'>('charts');
  // Index Toggle for Table
  const [tableIndex, setTableIndex] = useState<MarketIndex>('EGX30');
  
  // Data State
  const [inputData, setInputData] = useState('');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('D');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Analysis Data
  const [analysisData, setAnalysisData] = useState<AnalysisData[]>([]);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [analysisRefreshKey, setAnalysisRefreshKey] = useState(0);

  // API Quota State
  const [apiUsage, setApiUsage] = useState(0);

  useEffect(() => {
    // Subscribe to API usage updates
    const unsubscribe = onApiUsageUpdate((count) => {
        setApiUsage(count);
    });
    return unsubscribe;
  }, []);

  // Load analysis data when switching to table mode or changing index
  useEffect(() => {
    if (viewMode === 'table') {
        // Clear data first to show loading spinner (prevent instant load of old data)
        setAnalysisData([]);
        setIsAnalysisLoading(true);
        
        fetchMarketAnalysis(tableIndex).then(data => {
            setAnalysisData(data);
            setIsAnalysisLoading(false);
        });
    }
  }, [viewMode, tableIndex, analysisRefreshKey]);

  const handleScan = () => {
    if (!inputData.trim()) return;

    // Split by semicolon, clean, and map
    const rawSymbols = inputData.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    // Use a Set to remove duplicates immediately
    const uniqueSymbols = new Set<string>();
    
    const parsedStocks: Stock[] = [];

    rawSymbols.forEach(raw => {
        const symbol = cleanSymbol(raw);
        if (symbol && !uniqueSymbols.has(symbol)) {
            uniqueSymbols.add(symbol);
            
            // Try to find metadata from fallback list
            const meta = EGX30_FALLBACK.find(s => s.symbol === symbol);
            
            parsedStocks.push({
                symbol: symbol,
                name: meta ? meta.name : `${symbol} Stock`,
                sector: meta ? meta.sector : 'General'
            });
        }
    });

    // Limit to 40 max
    const finalStocks = parsedStocks.slice(0, 40);

    setStocks(finalStocks);
    setIsDashboardActive(true);
  };

  const handleReset = () => {
    setIsDashboardActive(false);
    setStocks([]);
    setInputData('');
  };

  const handleRefreshCharts = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleRefreshAnalysis = () => {
    setAnalysisRefreshKey(prev => prev + 1);
  };

  const filteredStocks = useMemo(() => {
    return stocks.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stocks, searchTerm]);

  // Check if data is simulated (fallback)
  const isSimulatedData = analysisData.length > 0 && analysisData[0].isSimulated;

  const TimeFrameButton = ({ tf, label }: { tf: TimeFrame, label: string }) => (
    <button
      onClick={() => setTimeFrame(tf)}
      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all border ${
        timeFrame === tf 
          ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/20' 
          : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700 hover:text-slate-200'
      }`}
    >
      {label}
    </button>
  );

  // --- VIEW: INPUT MODE ---
  if (!isDashboardActive) {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[100px]"></div>
            </div>

            <div className="max-w-2xl w-full bg-slate-900/50 border border-slate-800 rounded-2xl shadow-2xl p-8 z-10 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-500/20">
                        <BarChart2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">EGX-<span className="text-blue-500">Trends</span></h1>
                        <p className="text-slate-400">Professional Market Scanner</p>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-500" />
                        Paste Stock List (Semicolon Separated)
                    </label>
                    <textarea
                        value={inputData}
                        onChange={(e) => setInputData(e.target.value)}
                        placeholder="ABUK.CA; ADIB.CA; AMOC.CA; COMI.CA; ..."
                        className="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-200 font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none shadow-inner"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                        Format: <span className="font-mono text-slate-400">SYMBOL; SYMBOL; ...</span> (Max 40 stocks). Suffixes like .CA are handled automatically.
                    </p>
                </div>

                <button
                    onClick={handleScan}
                    disabled={!inputData.trim()}
                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] ${
                        inputData.trim() 
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                >
                    <Play className="w-5 h-5 fill-current" />
                    Scan Market
                </button>
            </div>
            
            <p className="mt-8 text-slate-600 text-sm">Powered by TradingView Charts</p>
        </div>
    );
  }

  // --- VIEW: DASHBOARD MODE ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-lg backdrop-blur-sm bg-opacity-90">
        <div className="max-w-[1920px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
            {/* Title & Brand */}
            <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg shadow-blue-500/20 shadow-lg hidden sm:block">
                    <BarChart2 className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                    <h1 className="text-lg font-bold text-white tracking-tight leading-tight whitespace-nowrap">EGX-<span className="text-blue-500">Trends</span></h1>
                </div>
            </div>

            {/* View Tabs (Charts vs Analysis) */}
            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button 
                  onClick={() => setViewMode('charts')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 transition-all ${
                    viewMode === 'charts' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                   <Activity className="w-3.5 h-3.5" />
                   Charts
                </button>
                <button 
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md flex items-center gap-2 transition-all ${
                    viewMode === 'table' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                   <Table className="w-3.5 h-3.5" />
                   Analysis
                </button>
            </div>

            {/* Controls (Context sensitive) */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
               {/* Global Controls */}
               <div 
                 className={`hidden md:flex items-center gap-1 text-[10px] px-3 py-1.5 rounded-lg border font-mono ${
                    apiUsage > DAILY_QUOTA * 0.9 ? 'bg-rose-900/30 text-rose-400 border-rose-800' : 
                    apiUsage > DAILY_QUOTA * 0.5 ? 'bg-amber-900/30 text-amber-400 border-amber-800' : 
                    'bg-slate-800 text-slate-400 border-slate-700'
                 }`}
                 title="API Calls vs Daily Quota"
               >
                 <Zap className="w-3 h-3" />
                 <span>{apiUsage}</span>
                 <span className="opacity-50">/</span>
                 <span>{DAILY_QUOTA}</span>
               </div>

               <button
                  onClick={handleReset}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs font-bold hover:bg-slate-700 hover:text-white transition-all mr-2 flex items-center gap-2 whitespace-nowrap"
                  title="New Stock Scan"
               >
                  <ArrowLeft className="w-3 h-3" />
                  New Scan
               </button>

               {/* CHART VIEW SPECIFIC CONTROLS */}
               {viewMode === 'charts' && (
                 <>
                   <div className="flex-1 max-w-xs relative hidden lg:block mr-2">
                      <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-slate-500" />
                      <input 
                          type="text" 
                          placeholder="Filter..." 
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-blue-500 transition-colors text-slate-200 placeholder-slate-500"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                      />
                  </div>

                   <button
                      onClick={handleRefreshCharts}
                      className="px-3 py-1.5 bg-emerald-900/30 border border-emerald-800 rounded-lg text-emerald-400 text-xs font-bold hover:bg-emerald-800 hover:text-emerald-100 transition-all mr-2 flex items-center gap-2"
                      title="Force Refresh Charts"
                   >
                      <RefreshCw className="w-3 h-3" />
                      Refresh
                   </button>

                   <div className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-lg">
                      <TimeFrameButton tf="1" label="1m" />
                      <TimeFrameButton tf="5" label="5m" />
                      <TimeFrameButton tf="15" label="15m" />
                      <TimeFrameButton tf="60" label="1H" />
                      <TimeFrameButton tf="240" label="4H" />
                   </div>
                   <div className="w-px h-6 bg-slate-800 mx-1 hidden sm:block"></div>
                   <div className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-lg">
                      <TimeFrameButton tf="D" label="D" />
                      <TimeFrameButton tf="W" label="W" />
                      <TimeFrameButton tf="M" label="M" />
                   </div>
                 </>
               )}

               {/* TABLE VIEW SPECIFIC CONTROLS */}
               {viewMode === 'table' && (
                 <div className="flex items-center gap-2">
                     <button 
                        onClick={handleRefreshAnalysis}
                        className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs font-bold hover:bg-slate-700 hover:text-white transition-all flex items-center gap-2"
                     >
                        <RefreshCw className="w-3 h-3" />
                        Refresh
                     </button>
                     <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-700">
                        <button 
                           onClick={() => setTableIndex('EGX30')}
                           className={`px-3 py-1 text-xs font-bold rounded transition-colors ${tableIndex === 'EGX30' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                           EGX 30
                        </button>
                        <button 
                           onClick={() => setTableIndex('EGX70')}
                           className={`px-3 py-1 text-xs font-bold rounded transition-colors ${tableIndex === 'EGX70' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                           EGX 70
                        </button>
                     </div>
                 </div>
               )}
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-2 md:p-4 max-w-[1920px] mx-auto w-full overflow-hidden flex flex-col">
        
        {viewMode === 'charts' ? (
            /* --- CHART GRID --- */
            filteredStocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <AlertTriangle className="w-8 h-8 text-slate-500" />
                    <p className="text-slate-400 text-sm">No stocks found in filter.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-4">
                    {filteredStocks.map((stock) => (
                        <div key={stock.symbol} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden shadow-xl flex flex-col h-[400px] md:h-[450px]">
                            
                            {/* Card Header */}
                            <div className="px-3 py-2 border-b border-slate-700 bg-slate-800 flex justify-between items-center h-12">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 border border-slate-600">
                                        {stock.symbol.substring(0, 2)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-100 text-sm leading-none">{stock.symbol}</div>
                                        <div className="text-[10px] text-slate-400 truncate w-24 leading-tight opacity-75">{stock.name}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-700/50 text-slate-400 border border-slate-600">
                                        {stock.sector || 'EGX'}
                                    </span>
                                    {['1', '5', '15', '60', '240'].includes(timeFrame) && (
                                      <div className="flex items-center gap-1">
                                        <span className="relative flex h-2 w-2">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                      </div>
                                    )}
                                </div>
                            </div>

                            {/* Chart Area */}
                            <div className="flex-1 relative bg-slate-900">
                               <TradingViewWidget key={`${stock.symbol}-${refreshKey}`} symbol={stock.symbol} timeFrame={timeFrame} />
                            </div>
                        </div>
                    ))}
                </div>
            )
        ) : (
            /* --- ANALYSIS TABLE --- */
            <div className="flex-1 flex flex-col">
                {isAnalysisLoading ? (
                    <div className="flex flex-col items-center justify-center h-96 gap-4">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-400 animate-pulse">Analyzing {tableIndex} Data...</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden relative flex flex-col">
                         {isSimulatedData && (
                            <div className="bg-amber-900/50 border-b border-amber-800 px-4 py-2 text-center text-xs text-amber-200 flex items-center justify-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Live API connection unavailable. Showing estimated historical data based on recent volatility.
                            </div>
                         )}
                         <AnalysisTable data={analysisData} />
                    </div>
                )}
                <div className="mt-2 text-center text-[10px] text-slate-500">
                    * Analysis data is retrieved via AI search. Charts are Real-Time from TradingView. For official financial decisions, consult your broker.
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;