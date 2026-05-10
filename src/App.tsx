/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Volume2, VolumeX, Sparkles, Star, Gift } from "lucide-react";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Betty's Birthday Experience:
 * - Theme: Blush Pink, Pearl, Rose Gold.
 * - Feel: Ethereal, gentle, high-end stationery.
 * - Logic: No button escapes twice, stands still on 3rd click.
 */

enum Step {
  START = "start",
  LANDING = "landing",
  MESSAGE = "message",
  CHOICE = "choice",
  RESULT_YES = "result_yes",
  RESULT_NO = "result_no",
}

const MESSAGE_LINES = [
  "I’ve been thinking a lot about what to say to you today, Betty.",
  "I was the one who initiated the break and I was supposed to reach out.",
  "I stayed quiet because I wasn’t sure if I still had the right.",
  "I'm truly sorry for the silence.",
  "The truth is… I’ve missed you more than I let on.",
  "Especially in the moments when I used to tell you everything."
];

const BIRTHDAY_WISHES = [
  "I hope your day is as radiant as you are.",
  "May this year bring you peace.",
  "You deserve all the magic in the world.",
  "May every moment today feel like a warm hug you used to love."
];

function FloatingEmoji({ emoji, delay }: any) {
  const targetX = useMemo(() => (Math.random() * 140 - 20) + "vw", []);
  
  return (
    <motion.div
      initial={{ y: "105vh", x: "50vw", opacity: 0, scale: 0.5 }}
      animate={{ 
        y: "-10vh",
        x: targetX,
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1.8, 1.2, 0.8],
        rotate: [0, 45, 90, 180, 450]
      }}
      transition={{ 
        duration: 5 + Math.random() * 5, 
        repeat: Infinity, 
        delay, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      className="fixed pointer-events-none text-4xl md:text-6xl z-0 -ml-6 md:-ml-8"
    >
      {emoji}
    </motion.div>
  );
}

function GiftBox({ onOpen, videoId }: { onOpen: () => void, videoId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    onOpen();
  };

  return (
    <div className="relative w-full max-w-[320px] aspect-[9/16] md:max-w-[360px] flex items-center justify-center">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="closed"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, -2, 2, 0],
              opacity: 1 
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ 
              animate: { duration: 2, repeat: Infinity },
              scale: { duration: 0.2 }
            }}
            onClick={handleOpen}
            className="cursor-pointer group relative"
          >
            <div className="absolute -inset-4 bg-white/20 blur-xl rounded-full group-hover:bg-white/40 transition-colors animate-pulse" />
            <div className="relative bg-gradient-to-br from-pink-400 to-rose-500 p-8 rounded-3xl shadow-2xl border-4 border-white/30 flex flex-col items-center gap-4">
              <Gift className="w-20 h-20 text-white drop-shadow-lg" />
              <p className="text-white font-serif italic text-lg tracking-widest uppercase">Tap to Open</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="opened"
            initial={{ scale: 0, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            className="w-full h-full bg-black rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 relative"
          >
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title="Birthday Surprise"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute inset-0 bg-white pointer-events-none"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FloatingParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100 + "%",
      y: Math.random() * 100 + "%",
      size: Math.random() * 3 + 1,
      duration: 15 + Math.random() * 20,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/20 blur-[1px]"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: ["0%", "-20%", "0%"],
            x: ["0%", "5%", "0%"],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

function SilkBackground() {
  const blobs = useMemo(() => [
    { id: 1, x: '-20%', y: '-20%', scale: 7, color: 'bg-[#ff0066]' },
    { id: 2, x: '80%', y: '-10%', scale: 6, color: 'bg-[#ff00ff]' },
    { id: 3, x: '-10%', y: '60%', scale: 8, color: 'bg-[#ff00cc]' },
    { id: 4, x: '90%', y: '100%', scale: 7, color: 'bg-[#ff3399]' },
    { id: 5, x: '50%', y: '40%', scale: 6, color: 'bg-[#ff66b2]' },
    { id: 6, x: '120%', y: '40%', scale: 5.5, color: 'bg-[#ff1493]' },
    { id: 7, x: '30%', y: '10%', scale: 4, color: 'bg-[#ff0080]' },
    { id: 8, x: '50%', y: '50%', scale: 9, color: 'bg-[#ff007f]/40' },
  ], []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {blobs.map((b) => (
        <motion.div
          key={b.id}
          className={`absolute rounded-full blur-[140px] ${b.color}`}
          style={{
            left: b.x,
            top: b.y,
            width: '45vw',
            height: '45vw',
          }}
          animate={{
            x: [0, 60, -60, 0],
            y: [0, -40, 40, 0],
            scale: [1, 1.15, 0.85, 1],
            rotate: [0, 45, -45, 0],
            filter: [
              "hue-rotate(0deg) brightness(1)",
              "hue-rotate(20deg) brightness(1.1)",
              "hue-rotate(-10deg) brightness(0.9)",
              "hue-rotate(0deg) brightness(1)"
            ]
          }}
          transition={{
            duration: 12 + b.id * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState<Step>(Step.START);
  const [noClicks, setNoClicks] = useState(0);
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [isMuted, setIsMuted] = useState(true);
  const [currentLineIdx, setCurrentLineIdx] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  const saveResponse = async (choice: 'yes' | 'no') => {
    const path = 'responses';
    try {
      await addDoc(collection(db, path), {
        choice,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioRef.current && isMuted && step !== Step.LANDING) {
        audioRef.current.play().catch(e => console.log("Playback blocked:", e));
        audioRef.current.muted = false;
        setIsMuted(false);
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      // Just ensure sync, don't force play here as it can be blocked
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (step === Step.LANDING) {
      const timer = setTimeout(() => {
        setStep(Step.MESSAGE);
      }, 9000); // Transition after 9 seconds of greeting animations
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    if (step === Step.MESSAGE) {
      const showNextLine = (idx: number) => {
        if (idx < MESSAGE_LINES.length) {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            setCurrentLineIdx(idx);
            setTimeout(() => showNextLine(idx + 1), 2200);
          }, 1500);
        }
      };
      showNextLine(0);
    }
  }, [step]);

  const startExperience = () => {
    setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.play().catch((err) => console.log("Audio play failed:", err));
    }
    setStep(Step.MESSAGE);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play().catch(e => console.log("Play failed:", e));
        audioRef.current.muted = false;
      } else {
        audioRef.current.pause();
        audioRef.current.muted = true;
      }
      setIsMuted(!isMuted);
    }
  };

  const handleNoClick = () => {
    const isMobile = window.innerWidth < 768;
    const desktopRange = 250;
    const mobileRange = 60;
    const currentRange = isMobile ? mobileRange : desktopRange;

    if (noClicks === 0) {
      setNoClicks(1);
      setNoButtonPos({ 
        x: (Math.random() > 0.5 ? 1 : -1) * currentRange, 
        y: (Math.random() > 0.5 ? 1 : -1) * (currentRange * 0.4) 
      });
    } else if (noClicks === 1) {
      setNoClicks(2);
      setNoButtonPos({ 
        x: (noButtonPos.x > 0 ? -1 : 1) * currentRange, 
        y: (noButtonPos.y > 0 ? -1 : 1) * (currentRange * 0.3) 
      });
    } else if (noClicks === 2) {
      // 3rd click: Button stops moving, reset pos
      setNoClicks(3);
      setNoButtonPos({ x: 0, y: 0 });
    } else {
      // 4th click: Finalize
      saveResponse('no');
      setStep(Step.RESULT_NO);
    }
  };

  const handleYesClick = () => {
    saveResponse('yes');
    setStep(Step.RESULT_YES);
  };

  const buttonStyle = "px-16 md:px-20 py-4 md:py-5 rounded-full border border-white/40 bg-white/10 backdrop-blur-md transition-all hover:border-white hover:bg-white/20 text-xl font-light tracking-[0.1em] text-white shadow-[0_0_20px_rgba(255,20,147,0.6)] hover:shadow-[0_0_40px_rgba(255,20,147,0.8)]";

  return (
    <div className="relative min-h-screen w-full bg-[#ff00ff] overflow-hidden text-white font-sans selection:bg-white selection:text-[#ff00ff]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff0080] via-[#ff00ff] to-[#ff1493] animate-gradient-shift" />
      <SilkBackground />
      <FloatingParticles />
      <div className="absolute inset-0 bg-white/5 pointer-events-none" />

      {/* Smooth Piano Soundtrack */}
      <audio 
        ref={audioRef}
        loop
        preload="auto"
        muted={isMuted}
        src="/background-music.mp3" 
      />

      <button 
        onClick={toggleMute}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] p-4 rounded-full border border-rose-100 bg-white/80 hover:bg-white transition-all text-rose-500 shadow-lg backdrop-blur-md"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        <AnimatePresence mode="wait">
          {/* 0. Start Screen (Gift Box) */}
          {step === Step.START && (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ scale: 2, opacity: 0, filter: "blur(40px)" }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center justify-center space-y-12 cursor-pointer"
              onClick={() => {
                setStep(Step.LANDING);
                if (audioRef.current) {
                  audioRef.current.play().catch(e => console.log("Init play failed:", e));
                  audioRef.current.muted = false;
                  setIsMuted(false);
                }
              }}
            >
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  scale: [1, 1.05, 1],
                  rotate: [0, -1, 1, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="absolute -inset-10 bg-white/20 blur-3xl animate-pulse rounded-full" />
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/30 p-12 rounded-[3rem] shadow-2xl flex flex-col items-center space-y-6">
                  <div className="p-6 bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl shadow-inner">
                    <Gift size={64} className="text-white drop-shadow-lg" />
                  </div>
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-serif italic text-white tracking-widest uppercase">For Betty</h2>
                    <p className="text-[10px] uppercase tracking-[0.6em] text-pink-200 opacity-60">A special delivery</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center"
              >
                <p className="text-sm font-light tracking-[0.5em] uppercase text-white/40 animate-pulse">Tap to open present</p>
              </motion.div>
            </motion.div>
          )}

          {/* 1. Landing Screen */}
          {step === Step.LANDING && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
              transition={{ duration: 1.5 }}
              className="text-center relative"
            >
              {/* Floating Emojis */}
              {['🐨', '✨', '🎈', '🎂', '💖', '🐨', '🌸', '🎁', '🐨', '✨', '🎈', '🎂'].map((emoji, idx) => (
                <FloatingEmoji key={idx} emoji={emoji} delay={idx * 0.8} />
              ))}

              <motion.div
                initial={{ scale: 0.8, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ 
                  duration: 2, 
                  ease: [0.34, 1.56, 0.64, 1], // Bouncy spring
                  opacity: { duration: 1 }
                }}
                className="space-y-10 relative z-10"
              >
                <h1 className="text-6xl md:text-8xl font-serif font-light italic tracking-tight text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">
                  <motion.span
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    Happy Birthday,
                  </motion.span> <br/>
                  <motion.span 
                    animate={{ 
                      scale: [1, 1.05, 1],
                      filter: ["drop-shadow(0 0 10px rgba(255,255,255,0.4))", "drop-shadow(0 0 20px rgba(255,255,255,0.7))", "drop-shadow(0 0 10px rgba(255,255,255,0.4))"]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="text-white font-medium relative inline-block pt-2"
                  >
                    Betty.
                    <motion.span
                      animate={{ 
                        opacity: [0, 1, 0], 
                        scale: [0.5, 1.5, 0.5], 
                        rotate: [0, 30, 0],
                        filter: ["drop-shadow(0 0 0px white)", "drop-shadow(0 0 10px white)", "drop-shadow(0 0 0px white)"]
                      }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                      className="absolute -top-8 -right-10 text-white/80"
                    >
                      <Sparkles size={32} />
                    </motion.span>
                  </motion.span>
                </h1>

                <div className="space-y-4 max-w-sm mx-auto px-4">
                  {BIRTHDAY_WISHES.map((wish, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 0.9, y: 0 }}
                      transition={{ 
                        delay: 2.2 + i * 0.5, 
                        duration: 1.2,
                        ease: [0.33, 1, 0.68, 1]
                      }}
                      className="text-pink-100 text-base md:text-lg font-light italic tracking-wide leading-relaxed border-l border-white/20 pl-4 text-left group"
                    >
                      {wish.split(" ").map((word, wordIdx) => (
                        <motion.span
                          key={wordIdx}
                          initial={{ opacity: 0, filter: "blur(4px)" }}
                          animate={{ opacity: 1, filter: "blur(0px)" }}
                          transition={{ delay: 2.2 + i * 0.5 + wordIdx * 0.1, duration: 0.5 }}
                          className="inline-block mr-1"
                        >
                          {word}
                        </motion.span>
                      ))}
                    </motion.p>
                  ))}
                </div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 6, duration: 1.5 }}
                  className="pt-12 text-center"
                >
                  <p className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-pink-200 italic opacity-40">
                    The journey continues shortly...
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* 2. Message Section */}
          {step === Step.MESSAGE && (
            <motion.div
              key="message"
              className="max-w-xl w-full text-center"
              exit={{ opacity: 0, filter: "blur(8px)" }}
            >
              <div className="space-y-10 md:space-y-12">
                {MESSAGE_LINES.map((line, i) => (
                  <AnimatePresence key={i}>
                    {i <= currentLineIdx && (
                      <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className={`text-xl md:text-2xl font-light leading-relaxed tracking-wide drop-shadow-[0_0_10px_rgba(255,105,180,0.4)]
                          ${i === 3 ? "font-serif italic text-rose-200 text-3xl" : "text-white"}
                        `}
                      >
                        {line}
                      </motion.p>
                    )}
                  </AnimatePresence>
                ))}

                {isTyping && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    className="flex gap-2 justify-center py-6"
                  >
                    {[0, 1, 2].map((d) => (
                      <motion.div
                        key={d}
                        className="w-1.5 h-1.5 bg-rose-300 rounded-full"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                      />
                    ))}
                  </motion.div>
                )}
              </div>

              {currentLineIdx === MESSAGE_LINES.length - 1 && !isTyping && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  onClick={() => setStep(Step.CHOICE)}
                  className="mt-24 px-12 py-3 rounded-full border border-rose-100 hover:bg-rose-50/30 text-[10px] uppercase tracking-[0.4em] text-rose-300 transition-all font-light"
                >
                  Continue
                </motion.button>
              )}
            </motion.div>
          )}

          {/* 3. Choice Section */}
          {step === Step.CHOICE && (
            <motion.div
              key="choice"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-20 text-center"
            >
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-serif italic text-stone-800 leading-tight">
                  Will you forgive me?
                </h2>
                <div className="h-[1px] w-20 bg-rose-100 mx-auto" />
                <p className="text-rose-300 text-xs font-light tracking-[0.3em] uppercase">
                  Take your time.
                </p>
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-10 relative md:min-h-[160px] w-full">
                <button
                  onClick={handleYesClick}
                  className={buttonStyle}
                >
                  Yes
                </button>

                <motion.div
                  animate={{ x: noButtonPos.x, y: noButtonPos.y }}
                  transition={{ type: "spring", stiffness: 150, damping: 20 }}
                  className="relative z-20"
                >
                  <button
                    onClick={handleNoClick}
                    className={buttonStyle}
                  >
                    No
                  </button>
                  
                  <AnimatePresence>
                    {noClicks > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-20 left-1/2 -translate-x-1/2 w-80 text-center"
                      >
                        <p className="text-[11px] uppercase tracking-[0.2em] text-rose-400 italic font-medium">
                          {noClicks === 1 
                            ? "I hope you can hear me out, Betty." 
                            : noClicks === 2 
                            ? "I know I don't deserve it, but please..."
                            : "I understand."}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* 4. Result Screens */}
          {(step === Step.RESULT_YES || step === Step.RESULT_NO) && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`fixed inset-0 z-50 flex flex-col items-center overflow-y-auto backdrop-blur-3xl px-6 py-12 md:py-20 ${
                step === Step.RESULT_YES 
                  ? "bg-[#ff0080]/60" 
                  : "bg-rose-50/90"
              }`}
            >
              {step === Step.RESULT_YES && (
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0, x: "50%", y: "50%" }}
                      animate={{ 
                        opacity: [0, 0.4, 0], 
                        scale: [0.5, 1.5, 0.5],
                        x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                        y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`]
                      }}
                      transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
                      className="absolute text-pink-300"
                    >
                      <Heart size={20 + i * 5} fill="currentColor" />
                    </motion.div>
                  ))}
                </div>
              )}
              <div className="max-w-xl w-full text-center space-y-12 md:space-y-16 relative z-10 my-auto">
                <div className="space-y-8 md:space-y-10">
                  {step === Step.RESULT_YES ? (
                    <>
                      <div className="space-y-8 md:space-y-12">
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 100 }}
                          className="flex justify-center"
                        >
                          <GiftBox 
                            onOpen={() => {
                              setIsMuted(true); // Mute background music for the video
                            }} 
                            videoId="nhbZOhpDq_U" 
                          />
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                        >
                          
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.2, duration: 2 }}
                        >
                          <p className="text-pink-100 font-serif italic text-2xl md:text-4xl font-light drop-shadow-lg">
                            Can't wait to hear your voice and Happy Birthday. Truly.
                          </p>
                        </motion.div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-12">
                      <p className="text-4xl md:text-5xl text-stone-800 leading-tight font-serif italic">
                        I understand.
                      </p>
                      <div className="space-y-8">
                        <p className="text-xl text-stone-500 font-light leading-relaxed max-w-md mx-auto">
                          Choices don't change the past, <br/>
                          but I'm glad I could finally say it.
                        </p>
                        <p className="text-2xl text-rose-300 font-serif italic pt-12">
                          Happy Birthday. Truly.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-12 md:pt-20 space-y-8 md:space-y-10">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.2, duration: 2 }}
                    className="text-[10px] uppercase tracking-[0.5em] text-rose-300 font-light"
                  >
                    I meant what I said.
                  </motion.p>

                  <button 
                    onClick={() => window.location.reload()}
                    className="text-[10px] uppercase tracking-[0.5em] text-rose-600 hover:text-rose-800 transition-all border border-rose-200 px-12 py-5 rounded-full bg-white shadow-xl hover:shadow-2xl active:scale-95"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Decorative Signature */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 text-rose-200/50 pointer-events-none group">
        <div className="w-16 h-[1px] bg-current transition-all group-hover:w-24" />
        <Star size={10} />
        <div className="w-16 h-[1px] bg-current transition-all group-hover:w-24" />
      </div>
    </div>
  );
}
