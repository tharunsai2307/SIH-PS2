import { useEffect, useState } from 'react';
import { 
  FileText, 
  GitFork, 
  HelpCircle, 
  Layers, 
  Scale, 
  Search, 
  ShieldCheck, 
  Sun 
} from 'lucide-react';

export type NavTab = 'evaluator' | 'catalogue' | 'graph' | 'gem-clauses' | 'qco-orders' | 'guidelines';

interface HeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(0);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }) + ' | ' + now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }) + ' IST'
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleContrast = () => {
    setIsHighContrast(!isHighContrast);
    document.body.classList.toggle('high-contrast');
  };

  const handleFontSize = (delta: number) => {
    const newLevel = Math.max(-1, Math.min(1, fontSizeLevel + delta));
    setFontSizeLevel(newLevel);
    const size = newLevel === -1 ? '14px' : newLevel === 1 ? '16.5px' : '15px';
    document.documentElement.style.setProperty('--gov-font-size-base', size);
  };

  return (
    <header className="border-b border-slate-200 bg-white no-print shadow-xs">
      {/* ── National Tricolor Top Strip ── */}
      <div className="tiranga-strip" />

      {/* ── Top Citizen Utility Strip (GIGW 3.0 Standard) ── */}
      <div className="top-utility-bar px-4 sm:px-8 lg:px-12 py-2 flex flex-wrap items-center justify-between text-xs">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="font-semibold text-gray-800 tracking-wide">
            भारत सरकार | GOVERNMENT OF INDIA
          </span>
          <span className="hidden md:inline text-gray-300">|</span>
          <span className="hidden md:inline text-gray-600 font-medium">
            उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय (Ministry of Consumer Affairs)
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-5 mt-1 sm:mt-0">
          <span className="font-mono text-gray-600 hidden lg:inline font-medium">
            {currentTime}
          </span>
          <span className="text-gray-200 hidden lg:inline">|</span>

          {/* Text Resize Controls */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-md px-2 py-0.5 shadow-2xs">
            <span className="text-gray-500 mr-1 text-[11px] font-medium hidden sm:inline">Text Size:</span>
            <button
              onClick={() => handleFontSize(-1)}
              title="Decrease Font Size"
              className={`px-1.5 font-bold hover:text-blue-700 transition-colors ${fontSizeLevel === -1 ? 'text-blue-800' : 'text-gray-600'}`}
            >
              A-
            </button>
            <button
              onClick={() => handleFontSize(0)}
              title="Reset Font Size"
              className={`px-1.5 font-bold hover:text-blue-700 transition-colors ${fontSizeLevel === 0 ? 'text-blue-800' : 'text-gray-600'}`}
            >
              A
            </button>
            <button
              onClick={() => handleFontSize(1)}
              title="Increase Font Size"
              className={`px-1.5 font-bold hover:text-blue-700 transition-colors ${fontSizeLevel === 1 ? 'text-blue-800' : 'text-gray-600'}`}
            >
              A+
            </button>
          </div>

          {/* Contrast Toggle */}
          <button
            onClick={toggleContrast}
            title="Toggle High Contrast Display"
            className="flex items-center gap-1.5 px-2.5 py-1 border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium shadow-2xs transition-colors"
          >
            <Sun size={12} className="text-amber-500" />
            <span className="hidden sm:inline">Contrast</span>
          </button>

          {/* Helpdesk */}
          <span className="text-gray-700 font-medium">
            Toll Free: <strong className="text-[#003366] font-bold">1915</strong>
          </span>
        </div>
      </div>

      {/* ── Main Government Portal Header ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex flex-col md:flex-row items-center justify-between gap-5">
        {/* Left: Official Emblem & BIS Identity */}
        <div className="flex items-center gap-5 text-center md:text-left">
          {/* State Emblem of India */}
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
            alt="State Emblem of India - Lion Capital"
            className="h-16 sm:h-18 w-auto flex-shrink-0 drop-shadow-xs"
          />

          <div className="border-l-2 border-slate-200 pl-5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 leading-tight">
              भारतीय मानक ब्यूरो
            </h2>
            <h1 className="text-lg sm:text-xl font-extrabold text-[#003366] tracking-tight mt-0.5">
              BUREAU OF INDIAN STANDARDS
            </h1>
            <p className="text-xs text-gray-600 font-medium flex items-center gap-2 mt-1">
              <span className="text-[#f37021] font-bold tracking-wide">मानक: पथप्रदर्शक:</span>
              <span className="text-gray-300">·</span>
              <span>The National Standards Body of India</span>
            </p>
          </div>
        </div>

        {/* Right: Hackathon Flagship & GeM Portal Stamp */}
        <div className="flex items-center gap-4">
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg px-4 py-2.5 text-right shadow-2xs">
            <div className="flex items-center justify-end gap-2 text-xs font-bold text-amber-950">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              SMART INDIA HACKATHON
            </div>
            <div className="text-[11.5px] text-amber-900 font-semibold mt-0.5">
              PS-2 · Applicable Standards AI Engine
            </div>
            <div className="text-[10.5px] text-gray-600 font-mono mt-0.5">
              GeM Compliance & Verification Suite
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center justify-center px-3.5 py-2.5 rounded-lg border border-blue-200 bg-blue-50/70 text-center shadow-2xs">
            <ShieldCheck size={22} className="text-[#003366]" />
            <span className="text-[10.5px] font-bold text-[#003366] uppercase mt-1 tracking-wider">
              Verified BIS Engine
            </span>
          </div>
        </div>
      </div>

      {/* ── Official Government Navigation Bar ── */}
      <nav className="gov-nav text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => onTabChange('evaluator')}
            className={`gov-nav-tab ${activeTab === 'evaluator' ? 'active' : ''}`}
          >
            <Search size={15} />
            <span>Tender Specification Evaluator</span>
          </button>

          <button
            onClick={() => onTabChange('catalogue')}
            className={`gov-nav-tab ${activeTab === 'catalogue' ? 'active' : ''}`}
          >
            <Layers size={15} />
            <span>BIS Standards Repository (11)</span>
          </button>

          <button
            onClick={() => onTabChange('graph')}
            className={`gov-nav-tab ${activeTab === 'graph' ? 'active' : ''}`}
          >
            <GitFork size={15} />
            <span>Normative Knowledge Network</span>
          </button>

          <button
            onClick={() => onTabChange('gem-clauses')}
            className={`gov-nav-tab ${activeTab === 'gem-clauses' ? 'active' : ''}`}
          >
            <FileText size={15} />
            <span>GeM Tender Clause Drafter</span>
          </button>

          <button
            onClick={() => onTabChange('qco-orders')}
            className={`gov-nav-tab ${activeTab === 'qco-orders' ? 'active' : ''}`}
          >
            <Scale size={15} />
            <span>Quality Control Orders (QCO)</span>
          </button>

          <button
            onClick={() => onTabChange('guidelines')}
            className={`gov-nav-tab ${activeTab === 'guidelines' ? 'active' : ''}`}
          >
            <HelpCircle size={15} />
            <span>CVC Guidelines & FAQ</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
