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
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(0); // -1, 0, 1

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
    const size = newLevel === -1 ? '13.5px' : newLevel === 1 ? '16.5px' : '15px';
    document.documentElement.style.setProperty('--gov-font-size-base', size);
  };

  return (
    <header className="border-b bg-white no-print">
      {/* ── National Tricolor Top Strip ── */}
      <div className="tiranga-strip" />

      {/* ── Top Citizen Utility Strip (GIGW 3.0 Standard) ── */}
      <div className="top-utility-bar px-4 sm:px-8 py-1.5 flex flex-wrap items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-gray-800">
            भारत सरकार | GOVERNMENT OF INDIA
          </span>
          <span className="hidden md:inline text-gray-400">|</span>
          <span className="hidden md:inline text-gray-600">
            उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय (Ministry of Consumer Affairs)
          </span>
        </div>

        <div className="flex items-center gap-4 mt-1 sm:mt-0">
          <span className="font-mono text-gray-700 hidden lg:inline font-medium">
            {currentTime}
          </span>
          <span className="text-gray-300 hidden lg:inline">|</span>

          {/* Text Resize Controls */}
          <div className="flex items-center gap-1 bg-white border border-gray-300 rounded px-1.5 py-0.5">
            <span className="text-gray-500 mr-1 text-[11px] font-medium hidden sm:inline">Text Size:</span>
            <button
              onClick={() => handleFontSize(-1)}
              title="Decrease Font Size"
              className={`px-1.5 font-bold hover:text-blue-700 ${fontSizeLevel === -1 ? 'text-blue-800' : 'text-gray-600'}`}
            >
              A-
            </button>
            <button
              onClick={() => handleFontSize(0)}
              title="Reset Font Size"
              className={`px-1.5 font-bold hover:text-blue-700 ${fontSizeLevel === 0 ? 'text-blue-800' : 'text-gray-600'}`}
            >
              A
            </button>
            <button
              onClick={() => handleFontSize(1)}
              title="Increase Font Size"
              className={`px-1.5 font-bold hover:text-blue-700 ${fontSizeLevel === 1 ? 'text-blue-800' : 'text-gray-600'}`}
            >
              A+
            </button>
          </div>

          {/* Contrast Toggle */}
          <button
            onClick={toggleContrast}
            title="Toggle High Contrast Display"
            className="flex items-center gap-1 px-2 py-0.5 border border-gray-300 rounded bg-white hover:bg-gray-100 text-gray-700 text-[11.5px] font-medium"
          >
            <Sun size={12} />
            <span className="hidden sm:inline">Contrast</span>
          </button>

          {/* Helpdesk */}
          <span className="text-gray-700 font-medium">
            Toll Free: <strong className="text-blue-900">1915</strong>
          </span>
        </div>
      </div>

      {/* ── Main Government Portal Header ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Official Emblem & BIS Identity */}
        <div className="flex items-center gap-4 text-center md:text-left">
          {/* State Emblem of India */}
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
            alt="State Emblem of India - Lion Capital"
            className="h-16 w-auto flex-shrink-0"
          />

          <div className="border-l-2 border-gray-300 pl-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 leading-tight">
              भारतीय मानक ब्यूरो
            </h2>
            <h1 className="text-lg sm:text-xl font-extrabold text-[#003366] leading-tight tracking-normal">
              BUREAU OF INDIAN STANDARDS
            </h1>
            <p className="text-xs text-gray-600 font-medium flex items-center gap-2 mt-0.5">
              <span className="text-[#f37021] font-bold">मानक: पथप्रदर्शक:</span>
              <span>·</span>
              <span>The National Standards Body of India</span>
            </p>
          </div>
        </div>

        {/* Right: Hackathon Flagship & GeM Portal Stamp */}
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-right">
            <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-amber-900">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
              SMART INDIA HACKATHON
            </div>
            <div className="text-[11px] text-amber-800 font-semibold">
              PS-2 · Applicable Standards AI Engine
            </div>
            <div className="text-[10px] text-gray-600 font-mono mt-0.5">
              GeM Compliance & Verification Suite
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center justify-center p-2 rounded border border-blue-200 bg-blue-50 text-center">
            <ShieldCheck size={20} className="text-[#003366]" />
            <span className="text-[10px] font-bold text-[#003366] uppercase mt-0.5">
              Verified BIS Engine
            </span>
          </div>
        </div>
      </div>

      {/* ── Official Government Navigation Bar ── */}
      <nav className="gov-nav text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center overflow-x-auto scrollbar-none">
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
