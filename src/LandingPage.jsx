import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const COLS = 24;
const TOTAL = 24 * 20; // 480

function randHex(len = 4) {
  const chars = "0123456789ABCDEF";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function TickerCell({ data, index }) {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  
  // Calculate base position with some randomness
  const baseX = (col / COLS) * 100;
  const baseY = (row / 20) * 100;
  const xOffset = (Math.random() - 0.5) * 2; // ±1% random offset
  const yOffset = (Math.random() - 0.5) * 3; // ±1.5% random offset

  // Calculate distance from center for ripple/influx effect
  const centerX = COLS / 2;
  const centerY = 10; // 20 rows / 2
  const distance = Math.sqrt(Math.pow(col - centerX, 2) + Math.pow(row - centerY, 2));
  const waveDelay = (distance * 0.1) % 3; // Slower, more dramatic ripples

  const [scramble, setScramble] = useState(false);
  const [symTxt, setSymTxt] = useState("");
  const [priceTxt, setPriceTxt] = useState("");
  const [chgTxt, setChgTxt] = useState("");
  const [scrUp, setScrUp] = useState(true);
  const [popped, setPopped] = useState(false);

  useEffect(() => {
    const popTimer = setInterval(() => {
      if (Math.random() < 0.06) {
        setPopped(true);
        setTimeout(() => setPopped(false), 120 + Math.random() * 120);
      }
      if (Math.random() < 0.25) {  // Increased from 0.08 to 0.25 (3x more likely)
        setScramble(true);
        const t0 = Date.now();
        const scrInt = setInterval(() => {
          setSymTxt(randHex(3));
          setPriceTxt(randHex(4));
          setChgTxt(randHex(2) + "%");
          setScrUp(Math.random() > 0.5);
          if (Date.now() - t0 > 260) {
            clearInterval(scrInt);
            setScramble(false);
          }
        }, 30);
      }
    }, 300 + Math.random() * 400);  // Reduced from 600-1200ms to 300-700ms
    return () => clearInterval(popTimer);
  }, []);

  const depth = (col + row) % 3;
  const blur = depth === 0 ? "backdrop-blur-[8px]" : depth === 1 ? "backdrop-blur-[5px]" : "backdrop-blur-[3px]";
  const baseOpacity = depth === 0 ? 0.38 : depth === 1 ? 0.55 : 0.72;

  const upNow = scramble ? scrUp : data.up;
  const dirCls = upNow ? "text-green-400/80" : "text-red-400/80";
  const arrow = upNow ? "▲" : "▼";

  return (
    <motion.div
      className={`absolute px-2 py-1 ${blur} transition-all duration-500 hover:backdrop-blur-0 hover:scale-110 hover:z-10`}
      style={{
        left: `${baseX + xOffset}%`,
        top: `${baseY + yOffset}%`,
        transform: 'translate(-50%, -50%)'
      }}
      initial={{ 
        opacity: 0, 
        scale: 0.9
      }}
      animate={{
        opacity: [baseOpacity * 0.7, baseOpacity * 1.1, baseOpacity * 0.7],
        scale: popped ? 0.8 : [0.9, 1.15, 0.9],
        filter: ["brightness(0.8) hue-rotate(0deg)", "brightness(1.3) hue-rotate(10deg)", "brightness(0.8) hue-rotate(0deg)"],
        boxShadow: [
          "0 0 0px rgba(20, 183, 211, 0)",
          "0 0 10px rgba(20, 183, 211, 0.4)",
          "0 0 0px rgba(20, 183, 211, 0)"
        ]
      }}
      transition={{ 
        duration: 2,
        delay: waveDelay,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut"
      }}    
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold tracking-tight select-none">{scramble ? symTxt : data.symbol}</span>
        <span className="select-none">{scramble ? `$${priceTxt}` : `$${Number(data.price).toLocaleString()}`}</span>
        <span className={`flex items-center gap-1 text-[11px] ${dirCls} select-none`}>
          <span className="leading-none">{arrow}</span>
          <span>{scramble ? chgTxt : data.change}</span>
        </span>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const [tickers, setTickers] = useState([]);

  useEffect(() => {
    const symbols = [
      "AAPL","TSLA","ETH","BTC","AMZN","NFLX","META","SOL","INJ","GOOG","NVDA","MSFT","AVAX","DOT","UNI","LINK","ATOM","MKR","USDT","USDC",
      "ARB","OP","SUI","APT","BNB","XRP","ADA","DOGE","LTC","FIL","NEAR","ICP"
    ];

    const arr = Array.from({ length: TOTAL }, (_, i) => {
      const s = symbols[(i * 7 + Math.floor(Math.random() * symbols.length)) % symbols.length];
      const price = (Math.random() * 4000 + 1).toFixed(2);
      const up = Math.random() > 0.48;
      const change = `${up ? "+" : "-"}${(Math.random() * 4).toFixed(2)}%`;
      return { symbol: s, price, change, up };
    });
    setTickers(arr);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* FULL-SCREEN dense ticker matrix with parallax layers and raindrop wave */}
      <div className="absolute inset-0 font-mono text-[11px] text-cyan-200/70 overflow-hidden">
        <div className="relative w-full h-full p-6">
          {tickers.map((t, i) => (
            <TickerCell key={i} data={t} index={i} />
          ))}
        </div>
      </div>

      {/* readability vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/75 via-black/40 to-black/85"></div>

      {/* Hero Section */}
      <div className="relative flex flex-col justify-center items-center h-screen text-center px-6">
        <motion.h1
          className="text-6xl md:text-8xl font-bold tracking-tight"
          style={{ color: "#114170" }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Influx <span style={{ color: "#14b7d3" }}>Market</span>
        </motion.h1>

        <motion.p
          className="mt-6 max-w-2xl text-lg text-gray-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          Earn on everything
        </motion.p>

        <motion.div
          className="mt-10 flex gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <a
            href="#"
            className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 rounded-2xl font-semibold text-black shadow-lg"
          >
            Launch App
          </a>
          <a
            href="#"
            className="border border-gray-600 px-6 py-3 rounded-2xl font-semibold hover:border-cyan-400"
          >
            Docs
          </a>
        </motion.div>
      </div>
    </div>
  );
}
