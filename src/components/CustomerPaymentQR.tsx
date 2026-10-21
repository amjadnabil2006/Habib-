import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Copy, 
  Check, 
  Smartphone, 
  Sparkles, 
  RefreshCw, 
  Printer, 
  DollarSign, 
  Share2 
} from 'lucide-react';
import { MerchantConfig } from '../types';

interface CustomerPaymentQRProps {
  config: MerchantConfig;
  onSimulateCustomerScan?: (amount: number) => void;
}

export const CustomerPaymentQR: React.FC<CustomerPaymentQRProps> = ({
  config,
  onSimulateCustomerScan
}) => {
  const [amount, setAmount] = useState<string>('5000');
  const [note, setNote] = useState<string>('سداد مشتريات');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedWallet, setCopiedWallet] = useState<boolean>(false);

  // Quick preset amount buttons popular in Yemen
  const quickAmounts = [500, 1000, 2000, 3000, 5000, 10000, 15000, 20000];

  useEffect(() => {
    // Generate standard Jeeb payment URI / payload:
    // Format compatible with Yemeni wallet QR scanners
    const numAmount = parseFloat(amount) || 0;
    const qrPayload = JSON.stringify({
      app: "jeeb_pay",
      merchantId: config.jeebWalletId,
      merchantName: config.storeName || config.merchantName,
      amount: numAmount,
      currency: config.defaultCurrency || "ر.ي",
      note: note,
      ts: Date.now()
    });

    QRCode.toDataURL(qrPayload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#022c22',
        light: '#ffffff'
      }
    }).then(setQrCodeUrl).catch(console.error);
  }, [amount, note, config]);

  const copyWalletId = () => {
    navigator.clipboard.writeText(config.jeebWalletId);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Input & Calculator (6 cols) */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              مولد كود QR للدفع الفوري
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
              طلب دفع جديد للزبون
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              أدخل المبلغ المطلوب ليقوم الزبون بمسح الباركود بهاتفه عبر تطبيق محفظة جيب مباشرة.
            </p>
          </div>

          {/* Amount input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              المبلغ المطلوب تحصيله ({config.defaultCurrency}):
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-950 border-2 border-slate-700 focus:border-emerald-500 rounded-2xl py-3.5 px-4 text-2xl font-black text-white outline-none tracking-wider text-left dir-ltr transition-all"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-sm">
                {config.defaultCurrency}
              </span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-semibold block">مبالغ سريعة شائعة:</span>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
                    amount === val.toString()
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {val.toLocaleString()} {config.defaultCurrency}
                </button>
              ))}
            </div>
          </div>

          {/* Order Note */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              ملاحظة أو بيان الفاتورة (اختياري):
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="مثال: فاتورة رقم 412 - مشتريات عامة"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
            />
          </div>

          {/* Merchant Wallet Info */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 block">رقم محفظة جيب الخاصة بالمتجر:</span>
              <strong className="text-sm font-mono text-emerald-400">
                {config.jeebWalletId}
              </strong>
            </div>
            <button
              onClick={copyWalletId}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {copiedWallet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedWallet ? 'تم النسخ' : 'نسخ الرقم'}
            </button>
          </div>
        </div>
      </div>

      {/* Right QR Display for Customer to Scan (6 cols) */}
      <div className="lg:col-span-6 flex flex-col items-center">
        <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/40 rounded-3xl p-7 text-center shadow-2xl relative overflow-hidden">
          {/* Header */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full mb-2">
              <Smartphone className="w-3.5 h-3.5" />
              امسح عبر تطبيق محفظة جيب
            </span>
            <h3 className="text-lg font-black text-white">
              {config.storeName || "نقطة بيع محفظة جيب"}
            </h3>
            <p className="text-xs text-slate-400">
              افتح محفظة جيب ➔ اختر مسح رمز QR ➔ ادفع مباشرة
            </p>
          </div>

          {/* Scannable QR Code */}
          <div className="bg-white p-4 rounded-3xl inline-block shadow-2xl my-2 border-4 border-emerald-500/20 relative group">
            {qrCodeUrl ? (
              <img 
                src={qrCodeUrl} 
                alt="Jeeb Payment QR" 
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto rounded-xl"
              />
            ) : (
              <div className="w-56 h-56 sm:w-64 sm:h-64 bg-slate-100 flex items-center justify-center rounded-xl animate-pulse text-slate-400 text-xs">
                جاري توليد الرمز...
              </div>
            )}
          </div>

          {/* Amount Badge */}
          <div className="mt-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl py-3 px-4">
            <span className="text-[11px] text-slate-400 font-semibold block">المبلغ المطلوب للدفع:</span>
            <div className="text-3xl font-black text-emerald-400">
              {(parseFloat(amount) || 0).toLocaleString()} {config.defaultCurrency}
            </div>
            {note && (
              <span className="text-xs text-slate-400 mt-1 block">
                {note}
              </span>
            )}
          </div>

          {/* Quick simulator shortcut */}
          {onSimulateCustomerScan && (
            <div className="mt-5 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => onSimulateCustomerScan(parseFloat(amount) || 5000)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-all border border-slate-700"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                محاكاة قيام الزبون بالمسح والدفع الآن (تجربة سريعة)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
