import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Smartphone, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  ArrowRight, 
  Zap, 
  BellRing, 
  ShieldCheck, 
  HelpCircle,
  Download,
  Send,
  Play,
  Share2
} from 'lucide-react';
import { MerchantConfig } from '../types';

interface PhoneConnectionGuideProps {
  config: MerchantConfig;
  isConnected: boolean;
  onSendTestNotification: () => void;
}

export const PhoneConnectionGuide: React.FC<PhoneConnectionGuideProps> = ({
  config,
  isConnected,
  onSendTestNotification
}) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [activeMethod, setActiveMethod] = useState<'macrodroid' | 'companion' | 'sms'>('macrodroid');

  useEffect(() => {
    const origin = window.location.origin;
    const fullWebhook = `${origin}/api/webhook/jeeb`;
    setWebhookUrl(fullWebhook);

    // Generate QR Code containing the Webhook / Companion URL
    QRCode.toDataURL(fullWebhook, {
      width: 260,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    }).then(setQrDataUrl).catch(console.error);
  }, []);

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const macroDroidJson = JSON.stringify({
    title: "{not_title}",
    text: "{not_body}",
    time: "{time}",
    wallet: config.jeebWalletId
  }, null, 2);

  const copyJson = () => {
    navigator.clipboard.writeText(macroDroidJson);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/30">
            <Zap className="w-3.5 h-3.5" />
            ربط ذكي بدون الحاجة لفتح شاشة الهاتف
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            كيف يربط هذا النظام محفظة جيب بجهاز الكمبيوتر؟
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
            عندما يحول لك الزبون المبلغ عبر <strong className="text-emerald-400">محفظة جيب</strong>، يصل إشعار فوري إلى هاتفك.
            نقوم بضبط أداة تحويل تلقائية خفيفة على الهاتف (مرة واحدة فقط)، لتقوم بقراءة إشعار محفظة جيب وإرساله فوراً إلى هذه الشاشة، فيصدر صوت الكاشير ويظهر المبلغ واسم الزبون مباشرة دون أن تلمس هاتفك!
          </p>
        </div>
      </div>

      {/* Tabs for Methods */}
      <div className="flex border-b border-slate-800 text-sm font-bold gap-2">
        <button
          onClick={() => setActiveMethod('macrodroid')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeMethod === 'macrodroid'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          الطريقة 1: تطبيق MacroDroid (التلقائية الموصى بها)
        </button>

        <button
          onClick={() => setActiveMethod('companion')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeMethod === 'companion'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Share2 className="w-4 h-4" />
          الطريقة 2: رفيق الموبايل السريع (Web Companion)
        </button>

        <button
          onClick={() => setActiveMethod('sms')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeMethod === 'sms'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BellRing className="w-4 h-4" />
          الطريقة 3: تحويل رسائل SMS البنكية
        </button>
      </div>

      {/* Method 1: MacroDroid */}
      {activeMethod === 'macrodroid' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Steps */}
          <div className="lg:col-span-2 space-y-4">
            {/* Step 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
              <div className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-sm shadow-md shadow-emerald-600/30">
                  1
                </span>
                <div className="space-y-2 flex-1">
                  <h3 className="text-base font-bold text-white flex items-center justify-between">
                    <span>تنزيل تطبيق MacroDroid على هاتف الكاشير</span>
                    <span className="text-xs text-emerald-400 font-normal bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                      مجاني من Google Play
                    </span>
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    قم بفتح متجر Google Play على هاتفك وثبّت تطبيق <strong>MacroDroid - Device Automation</strong>. (تطبيق آمن وشهير جداً يعمل في الخلفية باستهلاك بطارية شبه منعدم).
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
              <div className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-sm shadow-md shadow-emerald-600/30">
                  2
                </span>
                <div className="space-y-3 flex-1">
                  <h3 className="text-base font-bold text-white">
                    إضافة ماكرو جديد وضبط المحفز (المُشغّل)
                  </h3>
                  <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 text-xs text-slate-300 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">1. المُشغّل (Triggers):</span>
                      <span>اختر <strong>إشعار (Notification)</strong> ثم <strong>تم استلام إشعار</strong>.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">2. اختيار التطبيق:</span>
                      <span>حدد تطبيق <strong>محفظة جيب (Jeeb)</strong> من قائمة التطبيقات.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">3. النص المتطابق:</span>
                      <span>(اختياري) يحتوي على: <strong>استلام</strong> أو <strong>حوالة</strong> أو اتركه للكل.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-lg shadow-emerald-950/40">
              <div className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-sm shadow-md shadow-emerald-600/30">
                  3
                </span>
                <div className="space-y-3 flex-1">
                  <h3 className="text-base font-bold text-white">
                    ضبط الإجراء (Action): إرسال طلب HTTP للكمبيوتر
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm">
                    في قسم <strong>الإجراءات (Actions)</strong>، اختر <strong>تطبيقات</strong> ➔ <strong>طلب HTTP (HTTP Request)</strong>:
                  </p>

                  {/* Webhook URL Input with Copy */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-semibold block">
                      الرابط المطلوب وضعه في خانة الـ URL:
                    </label>
                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={webhookUrl}
                        className="bg-transparent text-emerald-400 font-mono text-xs flex-1 outline-none select-all"
                      />
                      <button
                        onClick={copyWebhook}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-all shrink-0"
                      >
                        {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedUrl ? 'تم النسخ' : 'نسخ الرابط'}
                      </button>
                    </div>
                  </div>

                  {/* Configuration parameters */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block">طريقة الطلب (Method):</span>
                      <strong className="text-white font-mono">POST</strong>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block">نوع المحتوى (Content-Type):</span>
                      <strong className="text-white font-mono">application/json</strong>
                    </div>
                  </div>

                  {/* JSON Payload */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-semibold">محتوى الرسالة (Request Body):</span>
                      <button
                        onClick={copyJson}
                        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
                      >
                        {copiedJson ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedJson ? 'تم نسخ الكود' : 'نسخ كود JSON'}
                      </button>
                    </div>
                    <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-emerald-300 text-xs overflow-x-auto text-left dir-ltr">
                      {macroDroidJson}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code & Direct Phone Pairing Box */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-xl">
              <span className="inline-block p-2 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold text-xs border border-emerald-500/20">
                امسح الكاميرا من هاتفك
              </span>
              <h3 className="font-bold text-white text-base">
                مسح رابط الربط عبر كاميرا الهاتف
              </h3>
              
              <div className="bg-white p-3 rounded-2xl inline-block shadow-lg mx-auto">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Pairing QR" className="w-48 h-48 mx-auto" />
                ) : (
                  <div className="w-48 h-48 bg-slate-200 animate-pulse rounded-xl" />
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                افتح كاميرا الهاتف أو تطبيق قارئ QR لمسح الرابط وفتحه مباشرة على متصفح هاتفك لتفادي كتابة الرابط الطويل يدوياً.
              </p>

              {/* Test Button */}
              <div className="pt-2">
                <button
                  onClick={onSendTestNotification}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <Send className="w-4 h-4" />
                  إرسال فحص تجريبي للتأكد من الشاشة
                </button>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                ملاحظات أمان وحماية الكاشير:
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 leading-relaxed">
                <li>لا يطلب النظام كلمة مرور محفظتك ولا رقمك السري إطلاقاً.</li>
                <li>يتم فقط قراءة عنوان ونص الإشعار البنكي الوارد.</li>
                <li>يمكن تشغيل النظام على عدة أجهزة كمبيوتر بنفس الوقت (للمتاجر متعددة نقاط البيع).</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Method 2: Web Companion */}
      {activeMethod === 'companion' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="max-w-2xl space-y-3">
            <h3 className="text-xl font-bold text-white">
              الطريقة السريعة: فتح رفيق الكاشير على الهاتف
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              إذا لم ترغب في تثبيت أي تطبيق خارجي، يمكنك فتح شاشة رفيق الكاشير على هاتفك المحمول. من خلالها تستطيع لصق أي رسالة دفع أو اختبار وصول الإشعارات فورياً إلى الكمبيوتر بلمسة زر واحدة.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 max-w-xl flex items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-500 block">رابط رفيق الهاتف:</span>
              <span className="text-emerald-400 font-mono text-sm font-bold">
                {window.location.origin}/#mobile-sync
              </span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/#mobile-sync`);
                alert('تم نسخ الرابط! افتحه في متصفح هاتفك');
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <Copy className="w-4 h-4" />
              نسخ الرابط للهاتف
            </button>
          </div>
        </div>
      )}

      {/* Method 3: SMS Forwarder */}
      {activeMethod === 'sms' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="text-xl font-bold text-white">
            تحويل رسائل محفظة جيب القصيرة (SMS)
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
            إذا كان حسابك في محفظة جيب مفعلاً عليه استلام إشعارات العمليات كرسائل SMS (مثلاً من CAC Bank أو خدمة جيب):
          </p>
          <div className="space-y-3 max-w-2xl text-xs sm:text-sm text-slate-300">
            <div className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">1</span>
              <span>يمكنك تثبيت أي تطبيق <strong>SMS Forwarder</strong> من متجر Play.</span>
            </div>
            <div className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">2</span>
              <span>حدد شرط الرسالة الواردة من رقم بنك التسليف أو محفظة جيب (مثل CAC Bank أو Jeeb).</span>
            </div>
            <div className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">3</span>
              <span>حدد الوجهة: <strong>Webhook URL</strong> ثم الصق الرابط الموضح أعلاه.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
