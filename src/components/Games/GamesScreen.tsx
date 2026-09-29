import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Trophy, 
  Play, 
  RotateCcw, 
  Sparkles, 
  Coins, 
  ShieldCheck, 
  Layers, 
  ArrowLeft,
  Flame,
  CheckCircle2,
  Dice5,
  CircleDot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { soundService } from '../../services/audio';
import { AdInterstitial } from '../Feed/AdInterstitial';
import { MiniBannerAd } from '../Common/MiniBannerAd';

type GameId = 'ludo' | 'carrom' | 'spin' | 'tictactoe' | 'snake';

export const GamesScreen: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { language, showToast, triggerConfetti } = useApp();

  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);
  
  // Two-stage Ad System for Max Profit
  // 1. Pre-Game Ad (before starting)
  // 2. Post-Game Ad (immediately upon winning/finishing)
  const [adStage, setAdStage] = useState<'NONE' | 'PRE_GAME' | 'POST_GAME'>('NONE');
  const [gameResultCoins, setGameResultCoins] = useState<number>(0);

  // ---------------- LUDO STATE ----------------
  const [diceRoll, setDiceRoll] = useState<number>(6);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [cpuScore, setCpuScore] = useState<number>(0);
  const [ludoTurn, setLudoTurn] = useState<'player' | 'cpu'>('player');

  // ---------------- CARROM BOARD STATE ----------------
  const [whiteCoinsPocketed, setWhiteCoinsPocketed] = useState<number>(0);
  const [blackCoinsPocketed, setBlackCoinsPocketed] = useState<number>(0);
  const [strikerPos, setStrikerPos] = useState<number>(50);

  // ---------------- SPIN WHEEL STATE ----------------
  const [spinning, setSpinning] = useState(false);
  const [wheelDegree, setWheelDegree] = useState(0);

  // ---------------- TIC-TAC-TOE STATE ----------------
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  // ---------------- SNAKE GAME STATE ----------------
  const [snakeScore, setSnakeScore] = useState(0);

  const gamesList: { id: GameId; titleBn: string; titleEn: string; icon: string; descBn: string; reward: number; tag: string }[] = [
    {
      id: 'ludo',
      titleBn: 'লুডু চ্যাম্পিয়ন 🎲',
      titleEn: 'Ludo Champion',
      icon: '🎲',
      descBn: 'কম্পিউটারের সাথে লুডু ডাইস ফেলে হোম পৌঁছান',
      reward: 15,
      tag: 'জনপ্রিয়'
    },
    {
      id: 'carrom',
      titleBn: 'ক্যারাম বোর্ড 🎯',
      titleEn: 'Carrom Board',
      icon: '🎯',
      descBn: 'স্ট্রাইকার দিয়ে ঘুঁটি পকেটে ফেলে কয়েন জিতুন',
      reward: 15,
      tag: 'হিট গেম'
    },
    {
      id: 'spin',
      titleBn: 'লাকি স্পিন হুইল 🎡',
      titleEn: 'Lucky Spin Wheel',
      icon: '🎡',
      descBn: 'চাকা ঘুরিয়ে নিশ্চিত বোনাস কয়েন সংগ্রহ করুন',
      reward: 12,
      tag: 'ইনস্ট্যান্ট'
    },
    {
      id: 'tictactoe',
      titleBn: 'টিক-ট্যাক-টো (কাটাকুটি) ❌⭕',
      titleEn: 'Tic-Tac-Toe',
      icon: '❌',
      descBn: 'স্মার্ট বুদ্ধিমত্তা দিয়ে রোবটকে পরাস্ত করুন',
      reward: 10,
      tag: 'কুইক গেম'
    },
    {
      id: 'snake',
      titleBn: 'ক্লাসিক স্নেক গেম 🐍',
      titleEn: 'Classic Snake Game',
      icon: '🐍',
      descBn: 'খাবার খেয়ে সাপকে বড় করুন এবং কয়েন আর্ন করুন',
      reward: 12,
      tag: 'ক্লাসিক'
    }
  ];

  // Step 1: User clicks on a game -> SHOW PRE-GAME AD FIRST (Maximum revenue)
  const handleSelectGame = (gameId: GameId) => {
    setSelectedGame(gameId);
    setAdStage('PRE_GAME');
  };

  // Step 2: Pre-game ad finished -> START THE ACTUAL GAME
  const handlePreAdFinished = () => {
    setAdStage('NONE');
    resetGameStates();
  };

  const resetGameStates = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setPlayerScore(0);
    setCpuScore(0);
    setWhiteCoinsPocketed(0);
    setSnakeScore(0);
  };

  // Step 3: Game completed/won -> SHOW POST-GAME AD BEFORE GIVING COINS
  const triggerGameFinish = (earned: number) => {
    setGameResultCoins(earned);
    setAdStage('POST_GAME');
  };

  // Step 4: Post-game ad finished -> CLAIM REWARD IN BACKEND
  const handlePostAdFinished = async () => {
    setAdStage('NONE');
    try {
      const res = await api.claimGameReward(selectedGame || 'game', gameResultCoins);
      if (res.success) {
        soundService.playSuccessFanfare();
        triggerConfetti();
        await refreshUser();
        showToast(
          language === 'bn' ? `+${res.earnedCoins} গেম রিওয়ার্ড যোগ হয়েছে! 🎮` : `+${res.earnedCoins} Game Reward Added!`,
          language === 'bn' ? 'ওয়ালেটে সরাসরি কয়েন জমা হয়েছে।' : 'Added to your wallet.',
          'coin'
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ---------- TIC-TAC-TOE LOGIC ----------
  const handleTicClick = (index: number) => {
    if (board[index] || checkWinner(board)) return;
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    if (checkWinner(newBoard) === 'X') {
      triggerGameFinish(10);
      return;
    }

    // CPU Move
    setTimeout(() => {
      const emptyIdxs = newBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
      if (emptyIdxs.length > 0) {
        const randomEmpty = emptyIdxs[Math.floor(Math.random() * emptyIdxs.length)];
        newBoard[randomEmpty] = 'O';
        setBoard([...newBoard]);
        if (checkWinner(newBoard) === 'O') {
          showToast('রোবট জিতেছে! আবার চেষ্টা করুন।', '', 'info');
        }
      }
    }, 400);
  };

  const checkWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  // ---------- LUDO ROLL LOGIC ----------
  const rollLudoDice = () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceRoll(roll);
    soundService.playCoinReward();

    const newScore = playerScore + roll;
    setPlayerScore(newScore);

    if (newScore >= 30) {
      triggerGameFinish(15);
      return;
    }

    // CPU turn
    setLudoTurn('cpu');
    setTimeout(() => {
      const cpuRoll = Math.floor(Math.random() * 6) + 1;
      setCpuScore(prev => prev + cpuRoll);
      setLudoTurn('player');
    }, 600);
  };

  // ---------- CARROM STRIKE LOGIC ----------
  const strikeCarrom = () => {
    soundService.playCoinReward();
    const hit = Math.random() > 0.3;
    if (hit) {
      const updated = whiteCoinsPocketed + 1;
      setWhiteCoinsPocketed(updated);
      showToast('পারফেক্ট শট! ঘুঁটি পকেটে পড়েছে 🎯', '', 'coin');
      if (updated >= 4) {
        triggerGameFinish(15);
      }
    } else {
      showToast('মিস হয়েছে! আবার স্ট্রাইক করুন।', '', 'info');
    }
  };

  // ---------- SPIN WHEEL LOGIC ----------
  const handleSpinWheel = () => {
    if (spinning) return;
    setSpinning(true);
    soundService.playCoinReward();

    const extraDegree = Math.floor(Math.random() * 360) + 1440; // 4+ full rotations
    const newDegree = wheelDegree + extraDegree;
    setWheelDegree(newDegree);

    setTimeout(() => {
      setSpinning(false);
      triggerGameFinish(12);
    }, 3000);
  };

  // ---------- SNAKE EAT LOGIC ----------
  const feedSnake = () => {
    soundService.playCoinReward();
    const newScore = snakeScore + 1;
    setSnakeScore(newScore);
    if (newScore >= 5) {
      triggerGameFinish(12);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 pb-24 space-y-4">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0B1528] via-[#0E2038] to-[#0A1A1E] border border-blue-500/30 p-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Gamepad2 className="w-4 h-4" />
            <span>গেমিং আর্নিং হাব 🎮</span>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            গেম খেলুন ও কয়েন জিতুন
          </span>
        </div>

        <h2 className="text-xl font-black text-white font-['Outfit'] mb-1">
          ৫টি সেরা বাংলাদেশি মিনি গেম
        </h2>
        <p className="text-xs text-slate-300">
          প্রতিটি গেম খেলার শুরুতে ও শেষে স্পনসরড বিজ্ঞাপনে অংশ নিয়ে বাড়তি ক্যাশআউট কয়েন আয় করুন।
        </p>

        {/* Profit strategy banner */}
        <div className="mt-3 p-2.5 rounded-2xl bg-slate-950/70 border border-amber-500/30 flex items-center justify-between text-[11px]">
          <span className="text-amber-300 font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ডাবল অ্যাড রিওয়ার্ড সিস্টেম সক্রিয়</span>
          </span>
          <span className="text-emerald-400 font-mono font-black">
            +১০ হতে +১৫ কয়েন
          </span>
        </div>
      </div>

      {/* Main Game Selector or Active Game Board */}
      {!selectedGame ? (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            আপনার পছন্দের গেম বেছে নিন
          </h3>

          <div className="grid grid-cols-1 gap-2.5">
            {gamesList.map((g) => (
              <div
                key={g.id}
                onClick={() => handleSelectGame(g.id)}
                className="p-4 rounded-3xl bg-[#090E18] border border-slate-800 hover:border-blue-500/50 cursor-pointer transition flex items-center justify-between group active:scale-98"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition">
                    {g.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{g.titleBn}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold border border-slate-700">
                        {g.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{g.descBn}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-emerald-400 font-mono block">
                    +{g.reward} কয়েন
                  </span>
                  <button className="mt-1 px-3 py-1 rounded-xl bg-blue-600 group-hover:bg-blue-500 text-white font-black text-[10px] shadow transition">
                    খেলুন ▶
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 📢 খালি জায়গায় ছোট ব্যানার অ্যাড (Gaming Mini Banner) */}
          <MiniBannerAd slotId="games_bottom_slot" category="gaming" />
        </div>
      ) : (
        /* ACTIVE GAME ARENA */
        <div className="p-4 rounded-3xl bg-[#090E18] border border-blue-500/40 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <button
              onClick={() => setSelectedGame(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>মেনুতে ফিরুন</span>
            </button>
            <span className="text-xs font-black text-amber-400 uppercase">
              {selectedGame.toUpperCase()} ARENA
            </span>
          </div>

          {/* 1. LUDO GAME */}
          {selectedGame === 'ludo' && (
            <div className="space-y-4 text-center py-2">
              <div className="flex justify-around items-center bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400 block">আপনার স্কোর</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">{playerScore} / ৩০</span>
                </div>
                <div className="text-3xl font-black text-amber-400">VS</div>
                <div>
                  <span className="text-[11px] text-slate-400 block">রোবট স্কোর</span>
                  <span className="text-xl font-black text-rose-400 font-mono">{cpuScore} / ৩০</span>
                </div>
              </div>

              {/* Dice roll animation */}
              <div className="py-4">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 border-4 border-amber-300 shadow-2xl flex items-center justify-center text-4xl font-black text-slate-950">
                  {diceRoll}
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium">
                  {ludoTurn === 'player' ? '🎲 আপনার দান! ডাইস রোল করুন' : '⏳ রোবটের দান চলছে...'}
                </p>
              </div>

              <button
                onClick={rollLudoDice}
                disabled={ludoTurn === 'cpu'}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition disabled:opacity-50"
              >
                ডাইস রোল করুন 🎲
              </button>
            </div>
          )}

          {/* 2. CARROM BOARD */}
          {selectedGame === 'carrom' && (
            <div className="space-y-4 text-center py-2">
              <div className="relative w-64 h-64 mx-auto bg-[#3D2314] rounded-3xl border-4 border-[#24130A] shadow-2xl p-4 flex flex-col justify-between">
                {/* 4 Corner Pockets */}
                <div className="flex justify-between">
                  <div className="w-6 h-6 rounded-full bg-black border border-amber-900" />
                  <div className="w-6 h-6 rounded-full bg-black border border-amber-900" />
                </div>

                {/* Center Circle & Coins */}
                <div className="my-auto mx-auto w-24 h-24 rounded-full border-2 border-amber-600/40 flex items-center justify-center">
                  <CircleDot className="w-10 h-10 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                </div>

                <div className="flex justify-between">
                  <div className="w-6 h-6 rounded-full bg-black border border-amber-900" />
                  <div className="w-6 h-6 rounded-full bg-black border border-amber-900" />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">পকেটে ফেলা ঘুঁটি:</span>
                <span className="font-black text-emerald-400 text-base">{whiteCoinsPocketed} / ৪ টি</span>
              </div>

              <button
                onClick={strikeCarrom}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition"
              >
                🎯 স্ট্রাইক মারুন!
              </button>
            </div>
          )}

          {/* 3. LUCKY SPIN WHEEL */}
          {selectedGame === 'spin' && (
            <div className="space-y-4 text-center py-2">
              <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
                {/* Indicator needle */}
                <div className="absolute -top-3 z-20 text-red-500 text-2xl font-black">
                  ▼
                </div>
                {/* Wheel */}
                <div
                  style={{
                    transform: `rotate(${wheelDegree}deg)`,
                    transition: spinning ? 'transform 3s cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
                  }}
                  className="w-48 h-48 rounded-full border-4 border-amber-400 shadow-2xl bg-gradient-to-tr from-pink-600 via-amber-500 to-indigo-600 flex items-center justify-center relative overflow-hidden"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-950 border-2 border-white flex items-center justify-center text-xs font-black text-white">
                    SPIN
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400">
                চাকা ঘুরিয়ে নিশ্চিত ১২ কয়েন সংগ্রহ করুন!
              </p>

              <button
                onClick={handleSpinWheel}
                disabled={spinning}
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-black text-sm rounded-2xl shadow-xl transition disabled:opacity-50"
              >
                {spinning ? 'চাকা ঘুরছে...' : '🎡 চাকা ঘুরান (স্পিন)'}
              </button>
            </div>
          )}

          {/* 4. TIC-TAC-TOE */}
          {selectedGame === 'tictactoe' && (
            <div className="space-y-4 text-center py-2">
              <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto">
                {board.map((cell, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleTicClick(idx)}
                    className="w-16 h-16 rounded-2xl bg-slate-950 border-2 border-slate-800 hover:border-emerald-500 flex items-center justify-center text-2xl font-black text-white cursor-pointer transition active:scale-95"
                  >
                    {cell === 'X' ? <span className="text-emerald-400">❌</span> : cell === 'O' ? <span className="text-amber-400">⭕</span> : ''}
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-400">
                ৩টি ❌ পরপর মিলিয়ে রোবটকে হারান ও ১০ কয়েন নিন!
              </p>

              <button
                onClick={() => setBoard(Array(9).fill(null))}
                className="w-full py-2.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
              >
                বোর্ড রিসেট করুন 🔄
              </button>
            </div>
          )}

          {/* 5. CLASSIC SNAKE */}
          {selectedGame === 'snake' && (
            <div className="space-y-4 text-center py-2">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">সাপের খাদ্য সংগ্রহ</span>
                <span className="text-3xl font-black text-emerald-400 font-mono">{snakeScore} / ৫</span>
                <div className="flex justify-center gap-2 mt-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                        i < snakeScore ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      🍎
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={feedSnake}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition"
              >
                🐍 সাপের দিকে খাবার ছুড়ে দিন (+১)
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 📢 PRE-GAME AND POST-GAME INTERSTITIAL ADS (MAX PROFIT) */}
      {/* ========================================================= */}
      {adStage === 'PRE_GAME' && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-3 animate-in fade-in">
          <div className="relative w-full max-w-md h-[90vh] bg-black rounded-3xl overflow-hidden border-2 border-blue-500/60 shadow-2xl flex flex-col justify-center">
            <AdInterstitial
              durationSeconds={15} // Quick 15s pre-game ad
              rewardCoins={0}
              onAdCompleted={handlePreAdFinished}
              onAdSkipped={handlePreAdFinished}
            />
          </div>
        </div>
      )}

      {adStage === 'POST_GAME' && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-3 animate-in fade-in">
          <div className="relative w-full max-w-md h-[90vh] bg-black rounded-3xl overflow-hidden border-2 border-emerald-500/60 shadow-2xl flex flex-col justify-center">
            <AdInterstitial
              durationSeconds={20} // 20s post-game ad
              rewardCoins={gameResultCoins}
              onAdCompleted={handlePostAdFinished}
              onAdSkipped={handlePostAdFinished}
            />
          </div>
        </div>
      )}
    </div>
  );
};
