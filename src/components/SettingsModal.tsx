import React, { useState } from 'react';
import { 
  Settings, 
  Store, 
  Smartphone, 
  Volume2, 
  Save, 
  Check, 
  DollarSign, 
  Play, 
  Key,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { MerchantConfig } from '../types';
import { playAlertSound } from '../utils/audio';

interface SettingsModalProps {
  config: MerchantConfig;
  onSave: (newConfig: MerchantConfig) => Promise<void>;
  onClearTransactions: () => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  config,
  onSave,
  onClearTransactions
}) => {
  const [formData, setFormData] = useState<MerchantConfig>({ ...config });
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const testSelectedSound = () => {
    playAlertSound(formData.alertSound);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-800 mb-6">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              إعدادات المتجر ومحفظة جيب
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              قم بتخصيص بيانات المتجر وحساب محفظة جيب ونوع التنبيهات الصوتية
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Store Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <Store className="w-4 h-4" />
              بيانات المتجر ونقطة البيع
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  اسم المتجر / المنشأة:
                </label>
                <input
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  placeholder="مثال: سوبرماركت التميز"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  اسم التاجر / الكاشير:
                </label>
                <input
                  type="text"
                  required
                  value={formData.merchantName}
                  onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                  placeholder="مثال: أحمد عبد الله"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none focus:border-emerald-500 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Wallet Info */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              بيانات حساب محفظة جيب
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  رقم محفظة جيب (رقم الهاتف أو كود التاجر):
                </label>
                <input
                  type="text"
                  required
                  value={formData.jeebWalletId}
                  onChange={(e) => setFormData({ ...formData, jeebWalletId: e.target.value })}
                  placeholder="77xxxxxxx"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none focus:border-emerald-500 font-mono font-bold dir-ltr text-right"
                />
                <span className="text-[11px] text-slate-500 block mt-1">
                  يُستخدم هذا الرقم في كود QR لتمكين الزبائن من مسحه والدفع لك مباشرة.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  العملة الافتراضية:
                </label>
                <select
                  value={formData.defaultCurrency}
                  onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none focus:border-emerald-500 font-bold"
                >
                  <option value="ر.ي">ريال يمني (ر.ي / YER)</option>
                  <option value="ر.س">ريال سعودي (SAR)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Alert Sounds */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              التنبيهات الصوتية ونطق الدفعات
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  نغمة تنبيه الكاشير:
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.alertSound}
                    onChange={(e) => setFormData({ ...formData, alertSound: e.target.value as any })}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-emerald-500"
                  >
                    <option value="cash_register">كاشير المتجر (كاشينج - Cash Register)</option>
                    <option value="chime">نغمة جرس ناعمة (Chime)</option>
                    <option value="bell">جرس الاستقبال (Service Bell)</option>
                    <option value="marimba">ماريمبا حديثة (Marimba)</option>
                  </select>
                  <button
                    type="button"
                    onClick={testSelectedSound}
                    className="px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 border border-slate-700"
                  >
                    <Play className="w-3.5 h-3.5" />
                    تجربة
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  id="speechToggle"
                  checked={formData.speechEnabled}
                  onChange={(e) => setFormData({ ...formData, speechEnabled: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
                <label htmlFor="speechToggle" className="text-xs text-slate-200 cursor-pointer select-none">
                  <strong>نطق المبلغ واسم الزبون باللغة العربية</strong>
                  <span className="block text-[11px] text-slate-500">
                    يقرأ صوتياً: "تم استلام دفعة بقيمة..." فور وصول الإشعار
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-800">
            <button
              type="submit"
              disabled={isSaving}
              className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {isSaved ? 'تم حفظ التعديلات بنجاح' : isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </button>

            {/* Clear All Transactions */}
            <button
              type="button"
              onClick={() => {
                if (confirm('هل أنت متأكد من رغبتك في مسح كافة سجل العمليات الحالية؟')) {
                  onClearTransactions();
                }
              }}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 p-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              تصفير سجل العمليات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
