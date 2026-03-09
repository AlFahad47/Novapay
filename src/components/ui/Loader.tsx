"use client";
import React from "react";

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 dark:bg-black/50 backdrop-blur-sm">
      <div className="relative flex flex-col items-center gap-4 p-6">
        <div className="relative w-40 h-28 flex items-center justify-center perspective-1000">
          <div className="bill bill-1 bg-gradient-to-r from-green-400 to-green-600 shadow-lg"></div>
          <div className="bill bill-2 bg-gradient-to-r from-green-300 to-green-500 shadow-lg"></div>
          <div className="bill bill-3 bg-gradient-to-r from-emerald-200 to-emerald-400 shadow-lg"></div>

          <div className="absolute -bottom-6 right-2 flex items-center gap-2">
            <div className="coin bg-yellow-400"></div>
            <div className="coin bg-amber-400 delay-150"></div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Processing transaction</div>
          <div className="text-xs text-slate-500 dark:text-slate-300">Secure payment • please wait</div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          .perspective-1000 { perspective: 1000px; }
          .bill { width: 160px; height: 56px; border-radius: 10px; position: absolute; top: 24px; left: 50%; transform-origin: 50% 50%; transform: translateX(-50%); box-shadow: 0 10px 30px rgba(2,6,23,0.25); display: flex; align-items: center; justify-content: center; }
          .bill::after { content: '\\\u0024'; font-size: 22px; color: rgba(255,255,255,0.95); font-weight: 700; transform: translateZ(10px); }
          .bill-1 { animation: billPop 1200ms cubic-bezier(.2,.9,.3,1) infinite; z-index: 40; }
          .bill-2 { animation: billPop 1200ms cubic-bezier(.2,.9,.3,1) 160ms infinite; z-index: 30; }
          .bill-3 { animation: billPop 1200ms cubic-bezier(.2,.9,.3,1) 320ms infinite; z-index: 20; }

          @keyframes billPop {
            0% { transform: translateX(-50%) translateY(0) rotateX(0deg) rotateZ(0deg) scale(1); opacity: 1; }
            35% { transform: translateX(-50%) translateY(-14px) rotateX(110deg) rotateZ(-6deg) scale(1.02); opacity: 0.95; }
            70% { transform: translateX(-50%) translateY(-32px) rotateX(180deg) rotateZ(-12deg) scale(0.98); opacity: 0.6; }
            100% { transform: translateX(-50%) translateY(-48px) rotateX(220deg) rotateZ(-18deg) scale(0.96); opacity: 0; }
          }

          .coin { width: 28px; height: 28px; border-radius: 9999px; box-shadow: 0 6px 18px rgba(2,6,23,0.18); transform-style: preserve-3d; animation: coinSpin 900ms linear infinite; border: 2px solid rgba(255,255,255,0.6); }
          .coin.delay-150 { animation-delay: 160ms; }

          @keyframes coinSpin { from { transform: translateY(0) rotateY(0deg); } 50% { transform: translateY(-8px) rotateY(180deg); } to { transform: translateY(0) rotateY(360deg); } }

          @media (max-width: 480px) { .bill { width: 130px; height: 46px; } }
        ` }} />
      </div>
    </div>
  );
};

export default Loader;