import React, { useState } from 'react';
import { 
  X, 
  FlaskConical, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Smartphone, 
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { MerchantConfig } from '../types';

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MerchantConfig;
  onSimulate: (data: {
    amount: number;
    senderName: string;
    senderPhone?: string;
    note?: string;
    currency?: string;
    rawText?: string;
  }) => Promise<void>;
}

export const SimulatorModal: React.FC<SimulatorModalProps> = ({
  isOpen,
  onClose,
  config,
  onSimulate
}) => {
  const [activeMode, setActiveMode] = useState<'quick' | 'raw'>('quick');
  const [amount, setAmount] = useState('6500');
  const [senderName, setSenderName] = useState('محمد عبد الله الكبسي');
  const [senderPhone, setSenderPhone] = useState('773129845');
  const [note, setNote] = useState('شراء مواد تموينية وسوبرماركت');
  const [rawText, setRawText] = useState(
    'محفظة جيب: تم استلام حوالة بمبلغ 8,500 ر.ي من حساب 771234900 (طارق أحمد الوادعي). رقم العملية JB-82910471'
  );
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await onSimulate({
        amount: parseFloat(amount) || 1000,
        senderName,
        senderPhone,
        note,
        currency: config.defaultCurrency
      });
      onClose();
    } finally {
      setIsSending(false);
    }
  };

  const handleRawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await onSimulate({
        amount: 0,
        senderName: '',
        rawText,
        currency: config.defaultCurrency
      });
      onClose();
    } finally {
      setIsSending(false);
    }
  };

  const sampleQuickPayments = [
    { name: 'يحيى حميد الدين', amount: 1200, phone: '772981240', label: 'مشتريات 1,200 ر.ي' },
    { name: 'سامي ناصر اليافعي', amount: 5000, phone: '733819203', label: 'دفعة 5,000 ر.ي' },
    { name: 'شركة التضامن للتجارة', amount: 24500, phone: '770112948', label: 'طلبية 24,500 ر.ي' },
    { name: 'عبد الرحمن الصبري', amount: 48000, phone: '777459012', label: 'دفعة كبيرة 48,000 ر.ي' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                مختبر الفحص ومحاكاة إشعارات جيب
              </h3>
              <p className="text-xs text-slate-400">
                اختبر استجابة شاشة الكاشير وتنبيه الصوت والنطق الفوري
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 my-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveMode('quick')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeMode === 'quick'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            محاكاة دفعة محددة
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('raw')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeMode === 'raw'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            اختبار نص إشعار حقيقي (SMS / App)
          </button>
        </div>

        {activeMode === 'quick' ? (
          <form onSubmit={handleQuickSubmit} className="space-y-4">
            {/* Quick buttons */}
            <div>
              <span className="text-xs text-slate-400 font-semibold block mb-2">
                نماذج جاهزة للتجربة بضغطة زر:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {sampleQuickPayments.map((sample, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setAmount(sample.amount.toString());
                      setSenderName(sample.name);
                      setSenderPhone(sample.phone);
                    }}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-right text-xs transition-all"
                  >
                    <span className="font-bold text-emerald-400 block">{sample.label}</span>
                    <span className="text-[11px] text-slate-400 block truncate">{sample.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  المبلغ ({config.defaultCurrency}):
                </label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white font-mono font-bold outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  رقم هاتف الزبون:
                </label>
                <input
                  type="text"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="77xxxxxxx"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white font-mono outline-none focus:border-emerald-500 dir-ltr text-right"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                اسم الزبون / صاحب الحساب:
              </label>
              <input
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                البيان / ملاحظة:
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all mt-4"
            >
              <Send className="w-4 h-4" />
              {isSending ? 'جاري الإرسال...' : 'إرسال التنبيه الآن إلى شاشة الكاشير'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRawSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                نص الإشعار أو رسالة SMS كما تظهر في الهاتف:
              </label>
              <textarea
                rows={4}
                required
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-emerald-500 leading-relaxed font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                سيقوم النظام بتحليل النص تلقائياً واستخراج المبلغ واسم العميل ورقم العملية.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              {isSending ? 'جاري المعالجة...' : 'تحليل النص وإظهار التنبيه فوراً'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
