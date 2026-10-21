export interface PhoneMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isPayment: boolean;
  amount?: number;
  currency?: string;
  referenceNumber?: string;
  senderName?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  senderName: string;
  senderPhone?: string;
  referenceNumber: string;
  source: 'jeeb_app' | 'jeeb_sms' | 'webhook' | 'manual' | 'simulation';
  rawText?: string;
  status: 'verified' | 'pending' | 'flagged';
  note?: string;
  timestamp: string;
}

export interface MerchantConfig {
  merchantName: string;
  storeName: string;
  jeebWalletId: string;
  phone: string;
  defaultCurrency: string;
  alertSound: 'chime' | 'cash_register' | 'bell' | 'marimba';
  speechEnabled: boolean;
  webhookToken: string;
}

export type TabType = 'dashboard' | 'qr_pay' | 'phone_connect' | 'history' | 'simulator' | 'settings';
