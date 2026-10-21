import React, { useRef } from 'react';
import { Printer, X, Download, Check, ShieldCheck } from 'lucide-react';
import { Transaction, MerchantConfig } from '../types';

interface ThermalReceiptProps {
  transaction: Transaction | null;
  config: MerchantConfig;
  onClose: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  transaction,
  config,
  onClose
}) => {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            معاينة وصل الدفع الحراري (80mm)
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Printable Paper Container */}
        <div 
          id="thermal-receipt"
          className="bg-white text-neutral-900 p-5 rounded-xl shadow font-mono text-xs leading-relaxed border border-neutral-300"
        >
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-neutral-400">
            <h2 className="text-base font-black tracking-tight text-black font-sans">
              {config.storeName || "سوبرماركت التميز"}
            </h2>
            <p className="text-[11px] text-neutral-600 font-sans mt-0.5">
              {config.merchantName}
            </p>
            <p className="text-[10px] text-neutral-500 mt-0.5">
              محفظة جيب: {config.jeebWalletId}
            </p>
            <p className="text-[10px] text-neutral-500">
              هاتف المتجر: {config.phone}
            </p>
          </div>

          {/* Receipt Info */}
          <div className="py-2.5 border-b border-dashed border-neutral-400 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-neutral-500">التاريخ:</span>
              <span className="font-bold">
                {new Date(transaction.timestamp).toLocaleDateString('ar-YE')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">الوقت:</span>
              <span className="font-bold">
                {new Date(transaction.timestamp).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">رقم المرجع:</span>
              <span className="font-bold">{transaction.referenceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">حساب العميل:</span>
              <span className="font-bold">{transaction.senderPhone || "غير مسجل"}</span>
            </div>
          </div>

          {/* Main Transaction Body */}
          <div className="py-3 border-b border-dashed border-neutral-400 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span>البيان:</span>
              <span className="font-bold font-sans">دفع إلكتروني (محفظة جيب)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span>اسم العميل:</span>
              <span className="font-bold font-sans">{transaction.senderName}</span>
            </div>

            <div className="bg-neutral-100 p-2.5 rounded-lg text-center my-2 border border-neutral-200">
              <span className="block text-[10px] text-neutral-600 font-sans">
                المبلغ المقبوض
              </span>
              <span className="text-xl font-black text-black">
                {transaction.amount.toLocaleString()} {transaction.currency}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-3 text-[10px] text-neutral-500 space-y-1 font-sans">
            <p className="font-bold text-neutral-700">شكراً لتسوقكم وثقتكم بنا</p>
            <p>تم تأكيد الحوالة إلكترونياً عبر محفظة جيب بنجاح</p>
            <p className="text-[9px] text-neutral-400 pt-1">
              نظام جيب كاشير للربط الفوري
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-600/20"
          >
            <Printer className="w-4 h-4" />
            طباعة الآن (Ctrl+P)
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};
