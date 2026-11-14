/**
 * 🤖 Telegram Auto-Payment Alert Dispatcher
 * Automatically dispatches structured Telegram messages when users submit
 * Bkash / Nagad / Recharge withdrawal requests or achieve big milestones.
 */

export interface TelegramConfig {
  botToken?: string;
  chatId?: string;
}

export const sendTelegramWithdrawalAlert = async (
  withdrawal: {
    id: string;
    userName: string;
    userPhone: string;
    method: string;
    accountNumber: string;
    coins: number;
    amountBDT: number;
    createdAt?: string;
  },
  config?: TelegramConfig
): Promise<boolean> => {
  try {
    const token = config?.botToken || 'DEFAULT_BOT';
    const chatId = config?.chatId || 'DEFAULT_CHAT';

    const message = `🚨 *নতুন পেমেন্ট উইথড্র রিকোয়েস্ট!* 🇧🇩

👤 *ইউজার:* ${withdrawal.userName || 'গেস্ট মেম্বার'}
📱 *ফোন:* \`${withdrawal.userPhone || 'N/A'}\`
💳 *মেথড:* *${withdrawal.method}*
🔢 *একাউন্ট নাম্বার:* \`${withdrawal.accountNumber}\`
🪙 *কয়েন দেওয়া হয়েছে:* ${withdrawal.coins.toLocaleString()} কয়েন
৳ *টাকার পরিমাণ:* *৳${withdrawal.amountBDT.toFixed(2)} টাকা*
⏱️ *সময়:* ${withdrawal.createdAt ? new Date(withdrawal.createdAt).toLocaleTimeString('bn-BD') : 'এইমাত্র'}

👉 _অ্যাডমিন প্যানেল (Admin Panel -> Withdrawals) থেকে বিকাশ/নগদ পাঠিয়ে এপ্রুভ করুন!_`;

    // If actual Telegram Bot Token & Chat ID are provided in Settings:
    if (token && chatId && token !== 'DEFAULT_BOT' && chatId !== 'DEFAULT_CHAT') {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });
      return true;
    } else {
      console.log('📱 Telegram Alert Payload (Ready for Bot):', message);
      return true;
    }
  } catch (err) {
    console.warn('Telegram Notification Dispatch Notice:', err);
    return false;
  }
};
