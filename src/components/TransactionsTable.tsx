import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Printer, 
  Copy, 
  Check, 
  Download, 
  Calendar, 
  Clock, 
  Smartphone, 
  Eye, 
  ArrowUpDown,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Transaction } from '../types';

interface TransactionsTableProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onPrintReceipt: (tx: Transaction) => void;
  onToggleStatus: (id: string, newStatus: 'verified' | 'pending') => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  onSelectTransaction,
  onPrintReceipt,
  onToggleStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today'>('today');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Copy ref helper
  const handleCopy = (ref: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ref);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Filter logic
  const filtered = transactions.filter((tx) => {
    // Search
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || 
      tx.senderName.toLowerCase().includes(term) ||
      tx.referenceNumber.toLowerCase().includes(term) ||
      (tx.senderPhone && tx.senderPhone.includes(term)) ||
      tx.amount.toString().includes(term);

    // Status filter
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;

    // Date filter
    let matchesDate = true;
    if (dateFilter === 'today') {
      const txDate = new Date(tx.timestamp).toDateString();
      const today = new Date().toDateString();
      matchesDate = txDate === today;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["رقم المرجع", "اسم الزبون", "رقم الهاتف", "المبلغ", "العملة", "التاريخ والوقت", "الحالة", "البيان"];
    const rows = filtered.map(t => [
      t.referenceNumber,
      `"${t.senderName}"`,
      t.senderPhone || "-",
      t.amount,
      t.currency,
      new Date(t.timestamp).toLocaleString('ar-YE'),
      t.status === 'verified' ? 'مؤكدة' : 'قيد المراجعة',
      `"${t.note || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `تقرير_عمليات_جيب_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <span>سجل دفعات محفظة جيب</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
              {filtered.length} عملية
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            عرض كافة الحوالات المستلمة فورياً مع إمكانية البحث والطباعة الحرارية
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>تصدير إكسل (CSV)</span>
          </button>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث بالاسم، رقم المرجع JB-xxxx، المبلغ، أو رقم الهاتف..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pr-10 pl-4 py-2 text-xs text-white placeholder-slate-500 outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Date filter */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1 rounded-lg transition-all ${
                dateFilter === 'today' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              اليوم فقط
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                dateFilter === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              كافة الأيام
            </button>
          </div>

          {/* Status filter */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                statusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setStatusFilter('verified')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                statusFilter === 'verified' ? 'bg-emerald-700/80 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              مؤكدة
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                statusFilter === 'pending' ? 'bg-amber-600/80 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              قيد المراجعة
            </button>
          </div>
        </div>
      </div>

      {/* Table / List View */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
          <Smartphone className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-300">لا توجد عمليات تطابق البحث</h3>
          <p className="text-xs text-slate-500 mt-1">
            عند قيام أي زبون بالدفع عبر محفظة جيب ستظهر هنا فورياً
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold select-none">
                <th className="pb-3 pr-3">المبلغ المستلم</th>
                <th className="pb-3">الزبون / المرسل</th>
                <th className="pb-3">رقم المرجع / العملية</th>
                <th className="pb-3">الوقت والتاريخ</th>
                <th className="pb-3">طريقة الاستلام</th>
                <th className="pb-3">الحالة</th>
                <th className="pb-3 pl-3 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.map((tx) => (
                <tr 
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  {/* Amount */}
                  <td className="py-3.5 pr-3 font-black text-sm text-emerald-400 whitespace-nowrap">
                    {tx.amount.toLocaleString('ar-YE')}{' '}
                    <span className="text-xs font-bold text-emerald-300/80">
                      {tx.currency}
                    </span>
                  </td>

                  {/* Customer info */}
                  <td className="py-3.5 whitespace-nowrap">
                    <span className="font-bold text-white block">
                      {tx.senderName}
                    </span>
                    {tx.senderPhone && (
                      <span className="text-[11px] text-slate-400 font-mono dir-ltr inline-block">
                        {tx.senderPhone}
                      </span>
                    )}
                  </td>

                  {/* Ref number */}
                  <td className="py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {tx.referenceNumber}
                      </span>
                      <button
                        onClick={(e) => handleCopy(tx.referenceNumber, tx.id, e)}
                        title="نسخ رقم العملية"
                        className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                      >
                        {copiedId === tx.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>

                  {/* Timestamp */}
                  <td className="py-3.5 text-slate-400 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-slate-300">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>
                        {new Date(tx.timestamp).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      {new Date(tx.timestamp).toLocaleDateString('ar-YE')}
                    </span>
                  </td>

                  {/* Source */}
                  <td className="py-3.5 whitespace-nowrap">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400">
                      {tx.source === 'webhook' ? '📱 مزامنة تلقائية' : tx.source === 'jeeb_app' ? 'إشعار جيب' : tx.source === 'jeeb_sms' ? 'رسالة SMS' : 'فحص'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStatus(tx.id, tx.status === 'verified' ? 'pending' : 'verified');
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-all ${
                        tx.status === 'verified'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {tx.status === 'verified' ? 'مؤكدة' : 'قيد المراجعة'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 pl-3 text-left whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPrintReceipt(tx);
                        }}
                        title="طباعة وصل حراري POS"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
                      >
                        <Printer className="w-3.5 h-3.5 text-teal-400" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTransaction(tx);
                        }}
                        title="عرض التفاصيل"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
