import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Printer, 
  X, 
  Volume2, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Clock,
  User,
  Phone,
  FileText
} from 'lucide-react';
import { Transaction } from '../types';

interface IncomingPaymentModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onPrintReceipt: (tx: Transaction) => void;
  onReplayAudio: () => void;
}

export const IncomingPaymentModal: React.FC<IncomingPaymentModalProps> = ({
  transaction,
  onClose,
  onPrintReceipt,
  onReplayAudio
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (transaction) {
      // Trigger festive confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b']
      });
    }
  }, [transaction]);

  if (!transaction) return null;

  const copyRef = () => {
    navigator.clipboard.writeText(transaction.referenceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/80 rounded-3xl shadow-2xl shadow-emerald-500/20 overflow-hidden text-right">
        {/* Glow header banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-4 flex items-center justify-between text-white shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-emerald-100 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                إشعار دفع مؤكد - محفظة جيب
              </span>
              <h2 className="text-lg font-black leading-tight">
                تم استلام دفعة جديدة بنجاح!
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Huge Amount Card */}
          <div className="text-center py-6 px-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl relative overflow-hidden">
            <span className="text-xs font-extrabold text-emerald-400 tracking-wider mb-1 block">
              المبلغ المستلم
            </span>
            <div className="flex items-baseline justify-center gap-2 font-black text-emerald-400">
              <span className="text-5xl sm:text-6xl tracking-tight">
                {transaction.amount.toLocaleString('ar-YE')}
              </span>
              <span className="text-2xl font-bold text-emerald-300">
                {transaction.currency}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {new Date(transaction.timestamp).toLocaleTimeString('ar-YE', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </p>
          </div>

          {/* Transaction Metadata Details */}
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3.5 text-sm">
            {/* Sender Name */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1.5 text-xs font-semibold">
                <User className="w-4 h-4 text-emerald-400" />
                المرسل / الزبون:
              </span>
              <span className="font-bold text-white text-base">
                {transaction.senderName || "زبون محفظة جيب"}
              </span>
            </div>

            {/* Sender Phone */}
            {transaction.senderPhone && (
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-1.5 text-xs font-semibold">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  رقم حساب/هاتف المرسل:
                </span>
                <span className="font-mono font-bold text-slate-200 dir-ltr text-sm">
                  {transaction.senderPhone}
                </span>
              </div>
            )}

            {/* Reference Number */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-1.5 text-xs font-semibold">
                <FileText className="w-4 h-4 text-emerald-400" />
                رقم العملية / المرجع:
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-emerald-300 text-sm bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                  {transaction.referenceNumber}
                </span>
                <button
                  onClick={copyRef}
                  title="نسخ رقم العملية"
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Source */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">طريقة الاستلام:</span>
              <span className="text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-full font-medium">
                {transaction.source === 'webhook' 
                  ? '📱 مزامنة تلقائية من هاتف الكاشير' 
                  : transaction.source === 'jeeb_app' 
                  ? 'إشعار تطبيق جيب' 
                  : transaction.source === 'jeeb_sms' 
                  ? 'رسالة SMS بنكية' 
                  : 'محاكاة فحص'}
              </span>
            </div>

            {/* Raw Text Preview */}
            {transaction.rawText && (
              <div className="pt-2">
                <p className="text-[11px] text-slate-500 bg-slate-950/60 p-2 rounded-lg border border-slate-800/50 leading-relaxed font-mono">
                  {transaction.rawText}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => {
                onPrintReceipt(transaction);
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all text-sm shadow-md"
            >
              <Printer className="w-4 h-4 text-teal-400" />
              طباعة وصل حراري
            </button>

            <button
              onClick={onReplayAudio}
              title="إعادة نطق التنبيه الصوتي"
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all hidden sm:flex items-center justify-center"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all text-sm"
            >
              <Check className="w-5 h-5" />
              تأكيد وإتمام
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
