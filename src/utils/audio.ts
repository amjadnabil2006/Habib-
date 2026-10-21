// Audio synthesis and speech notification utilities

// Web Audio API Synthesizer for instant crisp sound effects without external audio file loading lag
export function playAlertSound(type: 'cash_register' | 'chime' | 'bell' | 'marimba' = 'cash_register') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'cash_register') {
      // Create a bright, joyful cash register "ka-ching" harmonic
      // 1. Initial mechanical clink
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(987.77, now); // B5
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // 2. High metallic ring (Ching!)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      osc2.frequency.exponentialRampToValueAtTime(2637.02, now + 0.35); // E7
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(0.5, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 1.2);

      // 3. Resonant sparkle
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(3135.96, now + 0.12); // G7
      gain3.gain.setValueAtTime(0, now);
      gain3.gain.setValueAtTime(0.25, now + 0.12);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.12);
      osc3.stop(now + 0.9);

    } else if (type === 'bell') {
      // Service desk bell ding
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now); // A6
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.5);

    } else if (type === 'marimba') {
      // Soft modern tone
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.09);
        gain.gain.setValueAtTime(0.3, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.5);
      });

    } else {
      // Classic Chime (Ding-Dong)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(800, now);
      gain1.gain.setValueAtTime(0.4, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1200, now + 0.18);
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(0.45, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.9);
    }
  } catch (err) {
    console.warn('Audio playback not allowed or failed:', err);
  }
}

// General message reader
export function speakMessage(text: string) {
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis failed:', err);
  }
}

// Arabic Text to Speech synthesizer for cashier announcement
export function speakPaymentAlert(amount: number, senderName: string, currency: string = "ريال") {
  if (!('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech
    const formattedAmount = amount.toLocaleString('ar-YE');
    const currencyWord = currency === 'USD' ? 'دولار' : currency === 'ر.س' ? 'ريال سعودي' : 'ريال';
    const text = `تم استلام دفعة بقيمة ${formattedAmount} ${currencyWord} من ${senderName}`;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick an Arabic voice if available
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis failed:', err);
  }
}

// Desktop Notification trigger
export async function triggerDesktopNotification(title: string, body: string) {
  if (!('Notification' in window)) return;

  try {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'jeeb-payment'
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: 'jeeb-payment'
        });
      }
    }
  } catch (err) {
    console.warn('Desktop notification failed:', err);
  }
}
