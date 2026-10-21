import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: ['text/plain', 'text/html', '*/*'] }));

// Ensure data folder exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const messagesFile = path.join(dataDir, 'messages.json');
const configFile = path.join(dataDir, 'config.json');

export interface PhoneMessage {
  id: string;
  sender: string;              // e.g. "Jeeb", "CACBank", "771234567"
  text: string;                // Full raw text of message
  timestamp: string;
  isPayment: boolean;
  amount?: number;
  currency?: string;
  referenceNumber?: string;
  senderName?: string;
}

// Initial sample messages for immediate preview
let messages: PhoneMessage[] = [
  {
    id: "msg-101",
    sender: "محفظة جيب (Jeeb)",
    text: "تم استلام حوالة بمبلغ 12,500 ر.ي من حساب 771239841 (خالد عبد الله المنصوري). رقم العملية JB-98214301",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    isPayment: true,
    amount: 12500,
    currency: "ر.ي",
    referenceNumber: "JB-98214301",
    senderName: "خالد عبد الله المنصوري"
  },
  {
    id: "msg-102",
    sender: "CAC Bank",
    text: "عزيزي العميل، تم إيداع مبلغ 3,500 ر.ي في محفظتك الإلكترونية بنجاح. المرجع: 77182934",
    timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    isPayment: true,
    amount: 3500,
    currency: "ر.ي",
    referenceNumber: "77182934",
    senderName: "زبون محفظة جيب"
  },
  {
    id: "msg-103",
    sender: "773129845",
    text: "حولت لك الآن 5000 ريال حق الحساب يا غالي تأكد من وصولها",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    isPayment: false,
    senderName: "773129845"
  }
];

if (fs.existsSync(messagesFile)) {
  try {
    const loaded = JSON.parse(fs.readFileSync(messagesFile, 'utf-8'));
    if (Array.isArray(loaded) && loaded.length > 0) {
      messages = loaded;
    }
  } catch (e) {
    console.error('Error reading messages.json:', e);
  }
}

function saveMessages() {
  try {
    fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save messages:', err);
  }
}

// Broadcast WebSocket event
function broadcast(event: string, payload: any) {
  const message = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// WebSocket connection
wss.on('connection', (ws: WebSocket) => {
  ws.send(JSON.stringify({
    event: 'init',
    data: {
      messages,
      activeClients: wss.clients.size
    }
  }));

  broadcast('clients:count', { count: wss.clients.size });

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.event === 'ping') {
        ws.send(JSON.stringify({ event: 'pong' }));
      }
    } catch {
      // ignore
    }
  });

  ws.on('close', () => {
    broadcast('clients:count', { count: wss.clients.size });
  });
});

// Helper parser to check if message contains money payment details
export function parseMessageDetails(text: string, rawSender?: string): {
  isPayment: boolean;
  amount?: number;
  currency?: string;
  referenceNumber?: string;
  senderName?: string;
} {
  const combined = text || '';
  
  // Amount regex
  let amount: number | undefined;
  const amountMatch = combined.match(/(?:بمبلغ|مبلغ|استلام|إيداع|بقيمة|اضافة|إضافة|قيمة|حوالة|Amount)[:\s]*([0-9,.]+)\s*(ر\.ي|ريال|YER|SAR|ر\.س|USD|\$)?/i)
    || combined.match(/([0-9,.]+)\s*(ر\.ي|ريال|YER|SAR|ر\.س|USD|\$)/i);

  if (amountMatch) {
    const rawNum = amountMatch[1].replace(/,/g, '');
    const parsed = parseFloat(rawNum);
    if (!isNaN(parsed) && parsed > 0) {
      amount = parsed;
    }
  }

  // Currency
  let currency = "ر.ي";
  if (combined.includes("SAR") || combined.includes("سعودي") || combined.includes("ر.س")) {
    currency = "ر.س";
  } else if (combined.includes("USD") || combined.includes("دولار") || combined.includes("$")) {
    currency = "USD";
  }

  // Reference number
  let referenceNumber: string | undefined;
  const refMatch = combined.match(/(?:المرجع|مرجع|رقم العملية|العملية|حوالة رقم|كود العملية|Ref|Reference|Txn|TxId)[:\s#]*([A-Za-z0-9\-_]+)/i);
  if (refMatch && refMatch[1] && refMatch[1].length >= 4) {
    referenceNumber = refMatch[1];
  }

  // Sender Name
  let senderName: string | undefined;
  const parenMatch = combined.match(/\(([\p{L}\s]{3,35})\)/u);
  if (parenMatch && parenMatch[1] && !parenMatch[1].includes('محفظة')) {
    senderName = parenMatch[1].trim();
  } else {
    const senderMatch = combined.match(/(?:من العميل|من حساب|من محفظة|من|بواسطة|From)[:\s]*([\p{L}\s]{3,35})(?:\s+(?:حساب|رقم|المحفظة|المرجع|ر\.ي|ريال|بتاريخ|\.|$))/u);
    if (senderMatch && senderMatch[1]) {
      const cleanName = senderMatch[1].trim();
      if (cleanName && cleanName.length > 2 && !cleanName.match(/^(محفظة|جيب|بنك|رسالة|إشعار|حساب)/)) {
        senderName = cleanName;
      }
    }
  }

  const isPayment = Boolean(amount && amount > 0);

  return {
    isPayment,
    amount,
    currency,
    referenceNumber,
    senderName: senderName || rawSender || "مرسل الرسالة"
  };
}

// REST API

// 1. Get All Messages
app.get('/api/messages', (req, res) => {
  res.json({
    success: true,
    messages,
    count: messages.length
  });
});

// 2. Clear All Messages
app.delete('/api/messages', (req, res) => {
  messages = [];
  saveMessages();
  broadcast('messages:cleared', {});
  res.json({ success: true, message: 'تم مسح كافة الرسائل' });
});

// 3. Delete single message
app.delete('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  messages = messages.filter(m => m.id !== id);
  saveMessages();
  broadcast('message:deleted', { id });
  res.json({ success: true, id });
});

// 4. Universal Webhook Endpoint (Accepts messages from any phone app: MacroDroid, Tasker, SMS Forwarder, etc.)
app.all(['/api/messages', '/api/webhook/jeeb', '/api/webhook/sms', '/api/webhook'], (req, res) => {
  try {
    const body = req.body;
    let sender = "رسالة هاتف";
    let text = "";

    if (typeof body === 'string') {
      text = body;
    } else if (body && typeof body === 'object') {
      sender = body.sender || body.from || body.title || body.address || body.phone || body.notification_title || "محفظة جيب";
      text = body.text || body.body || body.message || body.content || body.extra_text || body.notification_text || "";

      // If user passed amount directly in test payload
      if (!text && body.amount) {
        text = `تم استلام مبلغ ${body.amount} ${body.currency || 'ر.ي'} من ${body.senderName || sender}.`;
      }
    }

    if (!text.trim()) {
      text = JSON.stringify(body || "رسالة واردة فارغة");
    }

    const details = parseMessageDetails(text, sender);

    const newMessage: PhoneMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sender: sender || "محفظة جيب",
      text: text.trim(),
      timestamp: new Date().toISOString(),
      isPayment: details.isPayment,
      amount: details.amount,
      currency: details.currency,
      referenceNumber: details.referenceNumber,
      senderName: details.senderName
    };

    messages.unshift(newMessage);
    if (messages.length > 500) {
      messages = messages.slice(0, 500);
    }
    saveMessages();

    // Broadcast in real-time to the screen!
    broadcast('message:new', newMessage);

    res.json({
      success: true,
      message: 'تم استلام الرسالة وعرضها على الشاشة فوراً',
      data: newMessage
    });
  } catch (err: any) {
    console.error('Error receiving message:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Setup Vite / Static Server
async function startServer() {
  const PORT = process.env.PORT || 3000;
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`[Messages Viewer Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
