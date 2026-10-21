import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Smartphone, 
  Trash2, 
  Copy, 
  Check, 
  Search, 
  Clock, 
  CheckCircle2, 
  X,
  History,
  Download
} from 'lucide-react';
import QRCode from 'qrcode';
import { PhoneMessage } from './types';

export default function App() {
  const [messages, setMessages] = useState<PhoneMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>('large');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  // Webhook and QR
  const [webhookUrl, setWebhookUrl] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    const fullUrl = `${window.location.origin}/api/messages`;
    setWebhookUrl(fullUrl);

    QRCode.toDataURL(fullUrl, {
      width: 220,
      margin: 1.5,
      color: { dark: '#0f172a', light: '#ffffff' }
    }).then(setQrUrl).catch(console.error);

    // Initial fetch of messages
    fetch('/api/messages')
      .then(res => res.json())
      .then(data => {
        if (data.messages) {
          setMessages(data.messages);
          setIsConnected(true);
        }
      })
      .catch(console.error);
  }, []);

  // Bulletproof Real-time Sync with Server-Sent Events (SSE) & WebSocket fallback
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let ws: WebSocket | null = null;
    let isMounted = true;

    // 1. Primary Real-Time Channel: EventSource (SSE) - 100% reliable across Cloud Run / proxies
    try {
      eventSource = new EventSource('/api/events');

      eventSource.onopen = () => {
        if (isMounted) setIsConnected(true);
      };

      eventSource.onmessage = (e) => {
        if (!isMounted) return;
        try {
          const payload = JSON.parse(e.data);
          handleRealtimeEvent(payload);
        } catch {
          // ignore
        }
      };

      eventSource.onerror = () => {
        // SSE will automatically try to reconnect; fallback to polling if needed
        if (isMounted) setIsConnected(false);
      };
    } catch (err) {
      console.warn('SSE fallback to polling/WS');
    }

    // 2. Secondary WebSocket check without throwing unhandled exceptions
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

      ws.onopen = () => {
        if (isMounted) setIsConnected(true);
      };

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const payload = JSON.parse(event.data);
          handleRealtimeEvent(payload);
        } catch {
          // ignore
        }
      };

      ws.onerror = () => {
        // Suppress websocket errors silently
      };

      ws.onclose = () => {
        // Suppress
      };
    } catch {
      // ignore
    }

    // Periodic poll every 5s as a fail-safe backup
    const pollInterval = setInterval(() => {
      fetch('/api/messages')
        .then(res => res.json())
        .then(data => {
          if (data.messages && isMounted) {
            setMessages(data.messages);
            setIsConnected(true);
          }
        })
        .catch(() => {});
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      if (eventSource) eventSource.close();
      if (ws) {
        ws.onclose = null;
        ws.onerror = null;
        ws.close();
      }
    };
  }, []);

  // Handler for real-time messages
  const handleRealtimeEvent = (payload: { event: string; data: any }) => {
    if (payload.event === 'init' && payload.data?.messages) {
      setMessages(payload.data.messages);
      setIsConnected(true);
    } else if (payload.event === 'message:new' && payload.data) {
      const newMsg: PhoneMessage = payload.data;
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [newMsg, ...prev];
      });
      setIsConnected(true);
    } else if (payload.event === 'messages:cleared') {
      setMessages([]);
    } else if (payload.event === 'message:deleted') {
      setMessages(prev => prev.filter(m => m.id !== payload.data?.id));
    }
  };

  // Delete single message
  const handleDeleteMessage = async (id: string) => {
    try {
      await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Clear all messages
  const handleClearAll = async () => {
    if (!confirm('هل تريد مسح جميع الرسائل من الشاشة؟')) return;
    try {
      await fetch('/api/messages', { method: 'DELETE' });
      setMessages([]);
    } catch (err) {
      console.error(err);
    }
  };

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy webhook URL
  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Filter messages for main screen
  const filteredMessages = messages.filter(msg => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return msg.text.toLowerCase().includes(term) ||
      msg.sender.toLowerCase().includes(term) ||
      (msg.referenceNumber && msg.referenceNumber.toLowerCase().includes(term));
  });

  // Filter messages for history modal
  const historyFiltered = messages.filter(msg => {
    const term = historySearch.toLowerCase().trim();
    if (!term) return true;
    return msg.text.toLowerCase().includes(term) ||
      msg.sender.toLowerCase().includes(term) ||
      (msg.referenceNumber && msg.referenceNumber.toLowerCase().includes(term));
  });

  // Calculate stats for History Modal
  const totalPaymentsAmount = messages.reduce((sum, m) => sum + (m.amount || 0), 0);
  const totalPaymentsCount = messages.filter(m => m.isPayment).length;

  // Export History to CSV
  const exportHistoryCSV = () => {
    const headers = ["المرسل", "المبلغ", "العملة", "رقم المرجع", "الوقت", "نص الرسالة"];
    const rows = historyFiltered.map(m => [
      `"${m.sender}"`,
      m.amount || 0,
      `"${m.currency || 'ر.ي'}"`,
      `"${m.referenceNumber || '-'}"`,
      `"${new Date(m.timestamp).toLocaleString('ar-YE')}"`,
      `"${m.text.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `سجل_رسائل_جيب_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format time relative or exact
  const formatMsgTime = (isoString: string) => {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'الآن';
    if (diffSeconds < 3600) return `منذ ${Math.floor(diffSeconds / 60)} دقيقة`;
    
    return date.toLocaleTimeString('ar-YE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Logo & App Name - Clean and responsive */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                  رسائل محفظة جيب
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${
                  isConnected 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                  <span>{isConnected ? 'متصل' : 'جاري الاتصال'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate hidden sm:block">
                استقبال إشعارات ورسائل الدفع فورياً
              </p>
            </div>
          </div>

          {/* Quick Toolbar (Speech and Sound buttons deleted as requested) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* زر سجل */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 text-xs font-black transition-all shadow-md shadow-emerald-600/20"
            >
              <History className="w-4 h-4" />
              <span>سجل</span>
              <span className="bg-emerald-950/60 text-emerald-200 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                {messages.length}
              </span>
            </button>

            {/* Font Size Selector */}
            <div className="hidden sm:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setFontSize('normal')}
                title="حجم خط عادي"
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  fontSize === 'normal' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                عادي
              </button>
              <button
                onClick={() => setFontSize('large')}
                title="حجم خط كبير"
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  fontSize === 'large' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                كبير
              </button>
              <button
                onClick={() => setFontSize('xl')}
                title="حجم خط عريض"
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  fontSize === 'xl' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ضخم
              </button>
            </div>

            {/* How to Connect Phone Button */}
            <button
              onClick={() => setIsGuideOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-sm"
            >
              <Smartphone className="w-3.5 h-3.5 text-teal-400" />
              <span>ربط الهاتف</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Messages Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 space-y-4">
        
        {/* Simple & Clean Search Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 flex items-center gap-3 shadow-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث في نص الرسائل أو رقم المرسل..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pr-10 pl-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>

          {/* Clear All Button */}
          {messages.length > 0 && (
            <button
              onClick={handleClearAll}
              title="مسح كافة الرسائل من الشاشة"
              className="p-2 rounded-xl bg-slate-950 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 border border-slate-800 transition-all shrink-0 flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Messages List Stream */}
        {filteredMessages.length === 0 ? (
          <div className="text-center py-20 px-4 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-800/80 text-slate-500 mx-auto flex items-center justify-center">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-300">
                لا توجد رسائل معروضة حالياً
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                الشاشة جاهزة وبانتظار وصول رسائل SMS أو إشعارات محفظة جيب من هاتفك فوراً.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredMessages.map((msg, index) => {
              const isFirst = index === 0;
              return (
                <div
                  key={msg.id}
                  className={`bg-slate-900 border rounded-2xl p-4 sm:p-5 transition-all shadow-md relative overflow-hidden group ${
                    isFirst 
                      ? 'border-emerald-500/60 shadow-emerald-950/40 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/20' 
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Bar of the Card */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      {/* Sender badge */}
                      <span className="font-bold text-white text-sm sm:text-base flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                        {msg.sender}
                      </span>

                      {/* Payment tag */}
                      {msg.isPayment && (
                        <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          إشعار استلام دفعة
                        </span>
                      )}

                      {/* New badge for the first item */}
                      {isFirst && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md animate-pulse">
                          جديدة
                        </span>
                      )}
                    </div>

                    {/* Time & Actions */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {formatMsgTime(msg.timestamp)}
                      </span>

                      {/* Copy message button */}
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        title="نسخ نص الرسالة"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        title="حذف الرسالة"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Payment Highlight Box (if it contains payment info) */}
                  {msg.isPayment && msg.amount && (
                    <div className="mt-3.5 mb-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-emerald-300 font-bold">المبلغ المستلم:</span>
                        <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight font-mono">
                          {msg.amount.toLocaleString('ar-YE')}
                        </span>
                        <span className="text-sm font-bold text-emerald-300">
                          {msg.currency || 'ر.ي'}
                        </span>
                      </div>

                      {msg.senderName && msg.senderName !== msg.sender && (
                        <div className="text-xs">
                          <span className="text-slate-400">المرسل: </span>
                          <strong className="text-white font-bold">{msg.senderName}</strong>
                        </div>
                      )}

                      {msg.referenceNumber && (
                        <div className="text-xs flex items-center gap-1.5">
                          <span className="text-slate-400">رقم المرجع: </span>
                          <span className="font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-emerald-300 font-bold">
                            {msg.referenceNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Full Message Text */}
                  <div className="mt-3 text-right">
                    <p className={`text-slate-100 font-medium leading-relaxed select-text ${
                      fontSize === 'xl' 
                        ? 'text-xl sm:text-2xl' 
                        : fontSize === 'large' 
                        ? 'text-base sm:text-lg' 
                        : 'text-sm'
                    }`}>
                      {msg.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL: سجل العمليات والرسائل (History Modal) */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative text-right flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base sm:text-lg">
                    سجل العمليات والرسائل
                  </h3>
                  <p className="text-xs text-slate-400">
                    أرشيف الحوالات والرسائل المستلمة مع إمكانية التصدير
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-3 gap-3 my-4 shrink-0">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block font-bold">إجمالي الحوالات:</span>
                <span className="text-lg font-black text-emerald-400">
                  {totalPaymentsAmount.toLocaleString('ar-YE')} ر.ي
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block font-bold">عدد الدفعات:</span>
                <span className="text-lg font-black text-white font-mono">
                  {totalPaymentsCount} عملية
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block font-bold">إجمالي الرسائل:</span>
                <span className="text-lg font-black text-slate-300 font-mono">
                  {messages.length} رسالة
                </span>
              </div>
            </div>

            {/* Search & Export in History */}
            <div className="flex items-center gap-2 mb-3 shrink-0">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="ابحث في السجل..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
              <button
                onClick={exportHistoryCSV}
                className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>تصدير إكسل</span>
              </button>
            </div>

            {/* History Items Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {historyFiltered.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  لا توجد رسائل مسجلة
                </div>
              ) : (
                historyFiltered.map((m) => (
                  <div
                    key={m.id}
                    className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{m.sender}</span>
                        {m.isPayment && m.amount && (
                          <span className="bg-emerald-500/20 text-emerald-400 font-black px-2 py-0.5 rounded font-mono">
                            {m.amount.toLocaleString('ar-YE')} {m.currency || 'ر.ي'}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(m.timestamp).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}{' '}
                        - {new Date(m.timestamp).toLocaleDateString('ar-YE')}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {m.text}
                    </p>
                    {m.referenceNumber && (
                      <div className="text-[10px] text-slate-500 font-mono">
                        رقم المرجع: <span className="text-emerald-400">{m.referenceNumber}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-800 mt-3 flex justify-end shrink-0">
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                إغلاق السجل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phone Connection Guide Modal */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-right space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    طريقة ربط رسائل هاتفك بالشاشة
                  </h3>
                  <p className="text-xs text-slate-400">
                    كيف تجعل رسائل محفظة جيب تصل هنا تلقائياً
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGuideOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simple Step Explanation */}
            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
                <span className="text-emerald-400 font-bold block">
                  الخطوة 1: تنزيل تطبيق تحويل الرسائل
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  على هاتف الأندرويد، ثبّت تطبيق <strong>SMS Forwarder</strong> أو تطبيق <strong>MacroDroid</strong> (مجاني من متجر Google Play).
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-bold block">
                  الخطوة 2: وضع رابط الاستقبال في التطبيق
                </span>
                <p className="text-xs text-slate-400">
                  اختر التحويل عبر Webhook / HTTP POST وضع الرابط التالي:
                </p>
                <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700">
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="bg-transparent text-emerald-400 font-mono text-xs flex-1 outline-none select-all dir-ltr"
                  />
                  <button
                    onClick={copyWebhookUrl}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shrink-0"
                  >
                    {copiedUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedUrl ? 'تم النسخ' : 'نسخ الرابط'}
                  </button>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-4">
                {qrUrl ? (
                  <img src={qrUrl} alt="QR" className="w-24 h-24 rounded-xl bg-white p-1 shrink-0" />
                ) : null}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">
                    مسح الرابط بكاميرا هاتفك
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    امسح هذا الرمز بكاميرا هاتفك لفتح الرابط أو نسخه في التطبيق دون كتابته يدوياً.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsGuideOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              فهمت، إغلاق الدليل
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
