"use client";

import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";
import { BookOpen, Lock, User } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

const LoginButtons = () => {
  // Typed variants for entrance + tap only
  const btnVariant: Variants = {
    hidden: { opacity: 0, y: 18, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] }, // cubic-bezier
    },
    tap: { scale: 0.97 },
  };

  useEffect(() => {
    const css = `
      @keyframes shimmer {
        0% { background-position: -150% 0; }
        100% { background-position: 150% 0; }
      }
      .btn-shimmer {
        background-size: 220% 100%;
        animation: shimmer 2.6s linear infinite;
      }
      .focus-glow:focus {
        outline: none;
        box-shadow: 0 0 0 4px rgba(99,102,241,0.12), 0 8px 30px rgba(2,6,23,0.08);
      }
    `;
    const s = document.createElement("style");
    s.innerHTML = css;
    document.head.appendChild(s);
    return () => {
      document.head.removeChild(s);
    };
  }, []);

  const buttons = [
    {
      href: "/login/student",
      text: "Student Login",
      icon: <User className="w-4 h-4 mr-2" />,
      classes:
        "relative overflow-hidden rounded-xl px-8 py-4 text-lg font-semibold text-white transition-all duration-300 btn-shimmer focus-glow",
      inlineStyle: {
        backgroundImage: "linear-gradient(90deg,#2563eb 0%,#7c3aed 100%)",
      },
      shimmerOverlay:
        "absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-60 pointer-events-none",
      glow: "rgba(59,130,246,0.34)",
    },
    {
      href: "/login/faculty",
      text: "Faculty Login",
      icon: <BookOpen className="w-4 h-4 mr-2" />,
      classes:
        "relative overflow-hidden rounded-xl px-8 py-4 text-lg font-semibold text-white transition-all duration-300 btn-shimmer focus-glow",
      inlineStyle: {
        backgroundImage: "linear-gradient(90deg,#059669 0%,#06b6d4 100%)",
      },
      shimmerOverlay:
        "absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/8 to-transparent opacity-55 pointer-events-none",
      glow: "rgba(6,182,212,0.28)",
    },
    {
      href: "/login/admin",
      text: "Admin Login",
      icon: <Lock className="w-4 h-4 mr-2" />,
      classes:
        "relative overflow-hidden rounded-xl px-8 py-4 text-lg font-semibold text-white transition-all duration-300 btn-shimmer focus-glow",
      inlineStyle: {
        backgroundImage: "linear-gradient(90deg,#7c3aed 0%,#ec4899 100%)",
      },
      shimmerOverlay:
        "absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/12 to-transparent opacity-60 pointer-events-none",
      glow: "rgba(124,58,237,0.28)",
    },
  ];

  return (
    <motion.div
      className="flex flex-col md:flex-row gap-6 items-center justify-center mt-10"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
    >
      {buttons.map((btn, i) => (
        <motion.div
          key={btn.text}
          variants={btnVariant}
          initial="hidden"
          animate="visible"
          whileTap="tap"
          whileHover={{ scale: 1.04, boxShadow: `0 8px 30px ${btn.glow}` }} // type-safe
          style={{ display: "inline-block" }}
        >
          {/* subtle floating micro-animation (independent, typed) */}
          <motion.div
            aria-hidden="true"
            className="rounded-xl"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity as unknown as number, // keep type-safety for Infinity in some TS configs
              ease: [0.42, 0, 0.58, 1],
              repeatDelay: 6,
            }}
          />

          <Link href={btn.href} aria-label={btn.text}>
            <Button
              size="lg"
              className={`${btn.classes} inline-flex items-center justify-center cursor-pointer`}
              style={btn.inlineStyle}
            >
              <span className="flex items-center z-10">
                {btn.icon}
                <span>{btn.text}</span>
              </span>

              <span
                aria-hidden="true"
                className={
                  btn.shimmerOverlay +
                  " z-0 transition-opacity duration-700"
                }
              />

              <span className="pointer-events-none absolute inset-0 rounded-xl ring-0"></span>
            </Button>
          </Link>

          <span className="sr-only">
            {btn.text} — opens the {btn.text.split(" ")[0]} sign-in page
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default LoginButtons;
