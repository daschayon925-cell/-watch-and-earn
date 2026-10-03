import { api } from './api';
import { soundService } from './audio';

// Universal Ad Reward Dispatcher: Guarantees +10 coins whenever an ad is seen or clicked anywhere!
export const triggerAdReward = async (
  source: string,
  awardLocally?: (coins: number) => void,
  showToast?: (title: string, msg: string, type: any) => void
) => {
  const coins = 10;
  
  // 1. Zero-latency instant local credit
  if (awardLocally) {
    awardLocally(coins);
  }

  // 2. Audible and visual delight
  try {
    soundService.playCoinReward();
  } catch (e) {}

  if (showToast) {
    showToast(
      `🎉 +${coins} কয়েন বোনাস যোগ হয়েছে! 🪙`,
      `${source} দেখার জন্য ধন্যবাদ! টাকা লোভে আরও অ্যাড দেখুন।`,
      'coin'
    );
  }

  // 3. Persist to server and database disk
  try {
    await api.claimInstantAdBonus(source, coins);
  } catch (e) {
    console.error('Ad bonus claim error', e);
  }
};
