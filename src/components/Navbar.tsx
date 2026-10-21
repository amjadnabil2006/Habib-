import React from 'react';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  QrCode, 
  History, 
  Settings, 
  CheckCircle2, 
  AlertCircle,
  FlaskConical,
  Store,
  Maximize2
} from 'lucide-react';
import { TabType, MerchantConfig } from '../types';

interface NavbarProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  config: MerchantConfig;
  isConnected: boolean;
  activeSockets: number;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  speechEnabled: boolean;
  setSpeechEnabled: (v: boolean) => void;
  onOpenSimulator: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  config,
  isConnected,
  soundEnabled,
  setSoundEnabled,
  speechEnabled,
  setSpeechEnabled,
  onOpenSimulator
}) => {
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Store Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 font-black text-xl tracking-tighter">
              جـ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                  جيب كاشير
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                    مباشر
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Store className="w-3 h-3 text-slate-500" />
                {config.storeName || "نظام إشعارات محفظة جيب"}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Bell className="w-4 h-4" />
              شاشة الكاشير
            </button>

            <button
              onClick={() => setCurrentTab('phone_connect')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all ${
                currentTab === 'phone_connect'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              ربط الهاتف
            </button>

            <button
              onClick={() => setCurrentTab('qr_pay')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all ${
                currentTab === 'qr_pay'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <QrCode className="w-4 h-4" />
              طلب دفع QR
            </button>

            <button
              onClick={() => setCurrentTab('history')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all ${
                currentTab === 'history'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <History className="w-4 h-4" />
              سجل العمليات
            </button>
          </nav>

          {/* Right Status & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Connection Badge */}
            <div 
              title={isConnected ? "النظام متصل بالسيرفر وجاهز لتلقي إشعارات الدفع" : "انقطع الاتصال، جاري إعادة المحاولة..."}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
              <span className="hidden sm:inline">
                {isConnected ? 'متصل بالمحفظة' : 'جاري الاتصال...'}
              </span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'تنبيه الجرس الصوتي مفعل' : 'تنبيه الصوت معطل'}
              className={`p-2 rounded-lg border transition-all ${
                soundEnabled 
                  ? 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-700' 
                  : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Voice Read Announcement Toggle */}
            <button
              onClick={() => setSpeechEnabled(!speechEnabled)}
              title={speechEnabled ? 'النطق الصوتي للمبلغ واسم الزبون مفعل' : 'النطق الصوتي معطل'}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all hidden sm:flex items-center gap-1.5 ${
                speechEnabled 
                  ? 'bg-teal-500/10 text-teal-300 border-teal-500/30 hover:bg-teal-500/20' 
                  : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
            >
              <span>🔊</span>
              <span>نطق المبلغ</span>
            </button>

            {/* Quick Test / Simulator Button */}
            <button
              onClick={onOpenSimulator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 text-xs font-bold transition-all"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>تجربة دفعة</span>
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullScreen}
              title="ملء شاشة الكاشير"
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-all hidden lg:block"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Settings Tab */}
            <button
              onClick={() => setCurrentTab('settings')}
              title="إعدادات المتجر والمحفظة"
              className={`p-2 rounded-lg border transition-all ${
                currentTab === 'settings'
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800 text-xs font-bold">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`py-1 px-2.5 rounded-lg flex items-center gap-1.5 ${
              currentTab === 'dashboard' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            الكاشير
          </button>
          <button
            onClick={() => setCurrentTab('phone_connect')}
            className={`py-1 px-2.5 rounded-lg flex items-center gap-1.5 ${
              currentTab === 'phone_connect' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            ربط الهاتف
          </button>
          <button
            onClick={() => setCurrentTab('qr_pay')}
            className={`py-1 px-2.5 rounded-lg flex items-center gap-1.5 ${
              currentTab === 'qr_pay' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            دفع QR
          </button>
          <button
            onClick={() => setCurrentTab('history')}
            className={`py-1 px-2.5 rounded-lg flex items-center gap-1.5 ${
              currentTab === 'history' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            السجل
          </button>
        </div>
      </div>
    </header>
  );
};
