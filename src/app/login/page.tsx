// "use client";

// import React, { useState } from "react";

// import {
//   Chrome,
//   Facebook,
//   Linkedin,
//   Eye,
//   EyeOff,
//   Shield,
//   Unlock,
//   Lock,
// } from "lucide-react";

// import Link from "next/link";

// import { signIn } from "next-auth/react";

// import { useRouter } from "next/navigation";

// import toast from "react-hot-toast";

// const PandaLogin: React.FC = () => {
//   const [activeField, setActiveField] = useState<
//     "none" | "username" | "password"
//   >("none");

//   const [showPassword, setShowPassword] = useState(false);

//   const [passwordInput, setPasswordInput] = useState("");

//   const [usernameInput, setUsernameInput] = useState("");

//   const router = useRouter();

//   const calculateStrength = (pass: string) => {
//     let score = 0;

//     if (!pass) return 0;

//     if (pass.length > 5) score += 1;

//     if (pass.length > 7) score += 1;

//     if (/[A-Z]/.test(pass)) score += 1;

//     if (/[0-9]/.test(pass)) score += 1;

//     if (/[^A-Za-z0-9]/.test(pass)) score += 1;

//     return Math.min(4, score);
//   };

//   const strength = calculateStrength(passwordInput);

//   // --- BRAND COLORS ---

//   const brandDark = "#050B14";

//   const brandSurface = "#0F172A";

//   const brandPrimary = "#2C64FF";

//   const brandLight = "#4DA1FF";

//   // --- CREATIVE MODERN TOAST HANDLER ---

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // 1. Creative Loading Toast (Radar Scan Effect)

//     const toastId = toast.custom(
//       (t) => (
//         <div
//           className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-sm w-full bg-[#0F172A]/90 backdrop-blur-xl border border-[#2C64FF]/30 shadow-[0_20px_50px_rgba(44,100,255,0.2)] rounded-[1.2rem] pointer-events-auto p-4 flex items-center gap-5 relative overflow-hidden`}
//         >
//           {/* Animated Background Line */}

//           <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#4DA1FF] to-transparent animate-[pulse_1.5s_ease-in-out_infinite]"></div>

//           {/* Custom Spinning Rings with Shield */}

//           <div className="relative flex items-center justify-center w-12 h-12">
//             <div className="absolute inset-0 border-[3px] border-transparent border-t-[#4DA1FF] border-r-[#4DA1FF] rounded-full animate-spin"></div>

//             <div
//               className="absolute inset-1.5 border-[3px] border-transparent border-b-[#2C64FF] border-l-[#2C64FF] rounded-full animate-spin"
//               style={{ animationDirection: "reverse" }}
//             ></div>

//             <Shield className="text-[#4DA1FF]" size={18} />
//           </div>

//           <div className="flex-1">
//             <p className="text-[1em] font-black text-[#4DA1FF] tracking-widest uppercase">
//               Verifying
//             </p>

//             <p className="text-[0.75em] font-medium text-slate-400 mt-0.5 tracking-wide">
//               Establishing secure connection...
//             </p>
//           </div>
//         </div>
//       ),
//       { duration: Infinity },
//     );

//     const result = await signIn("credentials", {
//       email: usernameInput,

//       password: passwordInput,

//       redirect: false,
//     });

//     toast.dismiss(toastId);

//     if (result?.error) {
//       // 2. Creative Error Toast (Security Locked Effect)

//       toast.custom((t) => (
//         <div
//           className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-sm w-full bg-[#0F172A]/95 backdrop-blur-xl border border-red-500/30 shadow-[0_0_40px_-10px_rgba(239,68,68,0.4)] rounded-[1.2rem] pointer-events-auto overflow-hidden relative p-4 flex items-center gap-5`}
//         >
//           <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/20 blur-2xl rounded-full z-0"></div>

//           <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/50 z-10">
//             <Lock className="text-red-400 animate-bounce" size={22} />
//           </div>

//           <div className="flex-1 z-10">
//             <p className="text-[1em] font-black text-red-400 tracking-widest uppercase">
//               Access Denied
//             </p>

//             <p className="text-[0.75em] font-medium text-slate-400 mt-0.5 tracking-wide">
//               Invalid security credentials.
//             </p>
//           </div>
//         </div>
//       ));
//     } else {
//       // 3. Creative Success Toast (Access Granted Effect)

//       toast.custom((t) => (
//         <div
//           className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-sm w-full bg-[#0F172A]/95 backdrop-blur-xl border border-[#4DA1FF]/40 shadow-[0_0_40px_-10px_rgba(44,100,255,0.3)] rounded-[1.2rem] pointer-events-auto overflow-hidden relative p-4 flex items-center gap-5`}
//         >
//           <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#4DA1FF]/20 blur-2xl rounded-full z-0"></div>

//           <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#2C64FF] border border-[#4DA1FF]/50 z-10">
//             <div className="absolute inset-0 bg-[#4DA1FF] animate-ping opacity-20 rounded-full"></div>

//             <Unlock className="text-white" size={22} />
//           </div>

//           <div className="flex-1 z-10">
//             <p className="text-[1em] font-black text-[#4DA1FF] tracking-widest uppercase">
//               Access Granted
//             </p>

//             <p className="text-[0.75em] font-medium text-slate-400 mt-0.5 tracking-wide">
//               Identity confirmed. Routing to homapage...
//             </p>
//           </div>
//         </div>
//       ));

//       setTimeout(() => {
//         router.push("/");
//       }, 2000);
//     }
//   };

//   // Panda Animation Logic

//   const eyeLeftStyle =
//     activeField === "username"
//       ? { left: "0.75em", top: "1.12em", transform: "rotate(20deg)" }
//       : { left: "0.6em", top: "0.6em", transform: "rotate(20deg)" };

//   const eyeRightStyle =
//     activeField === "username"
//       ? { right: "0.75em", top: "1.12em", transform: "rotate(-20deg)" }
//       : { right: "0.6em", top: "0.6em", transform: "rotate(-20deg)" };

//   const leftHandStyle =
//     activeField === "password" && !showPassword
//       ? {
//           height: "6.56em",
//           top: "3.87em",
//           left: "11.75em",
//           transform: "rotate(-155deg)",
//         }
//       : {
//           height: "2.81em",
//           top: "8.4em",
//           left: "7.5em",
//           transform: "rotate(0deg)",
//         };

//   const rightHandStyle =
//     activeField === "password" && !showPassword
//       ? {
//           height: "6.56em",
//           top: "3.87em",
//           right: "11.75em",
//           transform: "rotate(155deg)",
//         }
//       : {
//           height: "2.81em",
//           top: "8.4em",
//           right: "7.5em",
//           transform: "rotate(0deg)",
//         };

//   return (
//     <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden selection:bg-[#4DA1FF]/30 selection:text-[#2C64FF]">
//       {/* Local Video Background */}

//       <div className="absolute inset-0 w-full h-full overflow-hidden -z-20 bg-[#050B14]">
//         <video
//           autoPlay
//           loop
//           muted
//           playsInline
//           className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-50"
//         >
//           <source src="/loginpagebgvideo.mp4" type="video/mp4" />
//           Your browser does not support the video tag.
//         </video>
//       </div>

//       {/* Glassmorphism Overlay (Deep Space Theme) */}

//       <div className="absolute inset-0 bg-[#050B14]/60 backdrop-blur-[4px] -z-10"></div>

//       {/* Panda & Form Container */}

//       <div className="relative w-[31.25em] h-[45em] text-[12px] sm:text-[14px] md:text-[16px] mt-16">
//         {/* --- PANDA FACE --- */}

//         {/* Ears */}

//         <div className="absolute top-[1.75em] left-[10.75em] h-[2.5em] w-[2.81em] border-[0.18em] border-[#02050A] rounded-[2.5em_2.5em_0_0] rotate-[-38deg] z-10 bg-[#0F172A]"></div>

//         <div className="absolute top-[1.75em] right-[10.75em] h-[2.5em] w-[2.81em] border-[0.18em] border-[#02050A] rounded-[2.5em_2.5em_0_0] rotate-[38deg] z-10 bg-[#0F172A]"></div>

//         {/* Head */}

//         <div className="absolute top-[2em] left-0 right-0 mx-auto h-[7.5em] w-[8.4em] bg-[#F8FAFC] border-[0.18em] border-[#02050A] rounded-[7.5em_7.5em_5.62em_5.62em] z-20 shadow-sm">
//           {/* Blush */}

//           <div className="absolute top-[4em] left-[1em] bg-[#4DA1FF] h-[1em] w-[1.37em] rounded-full rotate-[25deg] opacity-30 blur-[2px]"></div>

//           <div className="absolute top-[4em] right-[1em] bg-[#4DA1FF] h-[1em] w-[1.37em] rounded-full rotate-[-25deg] opacity-30 blur-[2px]"></div>

//           {/* Eyes Base */}

//           <div className="absolute top-[2.18em] left-[1.37em] h-[2.18em] w-[2em] rounded-[2em] rotate-[-20deg] bg-[#0F172A]">
//             <div
//               className="absolute h-[0.6em] w-[0.6em] bg-white rounded-full transition-all duration-[400ms] ease-out shadow-[0_0_5px_rgba(255,255,255,0.8)]"
//               style={eyeLeftStyle}
//             ></div>
//           </div>

//           <div className="absolute top-[2.18em] right-[1.37em] h-[2.18em] w-[2em] rounded-[2em] rotate-[20deg] bg-[#0F172A]">
//             <div
//               className="absolute h-[0.6em] w-[0.6em] bg-white rounded-full transition-all duration-[400ms] ease-out shadow-[0_0_5px_rgba(255,255,255,0.8)]"
//               style={eyeRightStyle}
//             ></div>
//           </div>

//           {/* Nose */}

//           <div className="absolute top-[4.37em] left-0 right-0 mx-auto h-[1em] w-[1em] rounded-[1.2em_0_0_0.25em] rotate-[45deg] bg-[#0F172A]">
//             <div className="absolute top-[0.75em] left-[1em] h-[0.6em] w-[0.1em] rotate-[-45deg] bg-[#0F172A]"></div>
//           </div>

//           {/* Mouth */}

//           <div className="absolute top-[5.31em] left-[3.12em] h-[0.75em] w-[0.93em] bg-transparent rounded-full shadow-[0_0.18em_#0F172A]">
//             <div className="absolute left-[0.87em] top-0 h-[0.75em] w-[0.93em] bg-transparent rounded-full shadow-[0_0.18em_#0F172A]"></div>
//           </div>
//         </div>

//         {/* --- FORM SECTION --- */}

//         <form
//           onSubmit={handleLogin}
//           className="absolute top-[9.35em] left-1/2 -translate-x-1/2 w-[25em] h-[32em] bg-[#FFFFFF] px-[2.5em] py-[2em] flex flex-col rounded-[1em] z-10 shadow-[0_30px_60px_rgba(5,11,20,0.6)] border border-slate-200"
//         >
//           <div className="text-center w-full mt-2">
//             <h2 className="text-[1.8em] font-extrabold text-[#0F172A] tracking-tight">
//               Sign in to Account
//             </h2>

//             {/* Gradient Divider */}

//             <div className="w-[3em] h-[0.25em] bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] mx-auto mt-2 mb-4 rounded-full"></div>

//             <div className="flex justify-center gap-4 mb-4">
//               <button
//                 type="button"
//                 className="p-2.5 rounded-full border border-slate-200 hover:border-[#2C64FF] hover:bg-[#2C64FF]/5 transition-colors group"
//               >
//                 <Facebook
//                   size={18}
//                   className="text-slate-500 group-hover:text-[#2C64FF]"
//                 />
//               </button>

//               <button
//                 type="button"
//                 onClick={() => signIn("google", { callbackUrl: "/" })}
//                 className="p-2.5 rounded-full border border-slate-200 hover:border-[#2C64FF] hover:bg-[#2C64FF]/5 transition-colors group"
//                 title="Sign in with Google"
//               >
//                 <Chrome
//                   size={18}
//                   className="text-slate-500 group-hover:text-[#2C64FF]"
//                 />
//               </button>

//               <button
//                 type="button"
//                 className="p-2.5 rounded-full border border-slate-200 hover:border-[#2C64FF] hover:bg-[#2C64FF]/5 transition-colors group"
//               >
//                 <Linkedin
//                   size={18}
//                   className="text-slate-500 group-hover:text-[#2C64FF]"
//                 />
//               </button>
//             </div>

//             <p className="text-[0.8em] font-medium text-slate-500 mb-6">
//               Don't have an account?{" "}
//               <Link
//                 href="/register"
//                 className="text-[#2C64FF] font-bold hover:underline"
//               >
//                 Sign up
//               </Link>
//             </p>
//           </div>

//           <div className="flex-1 w-full px-2">
//             {/* Email Field */}

//             <div className="relative mb-[1.5em]">
//               <label
//                 htmlFor="username"
//                 className="absolute -top-[0.6em] left-[1em] bg-white px-1 text-[0.7em] font-bold text-[#2C64FF] z-10"
//               >
//                 Email
//               </label>

//               <input
//                 type="text"
//                 id="username"
//                 value={usernameInput}
//                 onChange={(e) => setUsernameInput(e.target.value)}
//                 placeholder="example@email.com"
//                 onFocus={() => setActiveField("username")}
//                 onBlur={() => setActiveField("none")}
//                 className="text-[0.9em] font-medium text-[#0F172A] p-[1em] border border-slate-300 rounded-[0.5em] bg-transparent focus:border-[#2C64FF] focus:ring-1 focus:ring-[#2C64FF]/20 outline-none transition-all w-full"
//               />
//             </div>

//             {/* Password Field */}

//             <div className="relative mb-[1.5em]">
//               <label
//                 htmlFor="password"
//                 className="absolute -top-[0.6em] left-[1em] bg-white px-1 text-[0.7em] font-bold text-[#2C64FF] z-10"
//               >
//                 Password
//               </label>

//               <div className="relative w-full border border-slate-300 rounded-[0.5em] focus-within:border-[#2C64FF] focus-within:ring-1 focus-within:ring-[#2C64FF]/20 transition-all bg-transparent">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   id="password"
//                   value={passwordInput}
//                   onChange={(e) => setPasswordInput(e.target.value)}
//                   placeholder="••••••••"
//                   onFocus={() => setActiveField("password")}
//                   onBlur={() => setActiveField("none")}
//                   className="text-[0.9em] font-medium text-[#0F172A] p-[1em] pr-[2.5em] w-full bg-transparent outline-none tracking-widest"
//                 />

//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-[0.8em] top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2C64FF] transition-colors z-10"
//                 >
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>

//               {/* Password Strength Indicator */}

//               {activeField === "password" && passwordInput.length > 0 && (
//                 <div className="absolute -bottom-[1.2em] left-0 w-full flex items-center justify-between px-1">
//                   <div className="flex gap-1 w-full mr-2">
//                     <div
//                       className={`h-1 flex-1 rounded-full ${strength >= 1 ? (strength === 1 ? "bg-red-400" : strength === 2 ? "bg-yellow-400" : strength >= 3 ? "bg-green-500" : "bg-slate-200") : "bg-slate-200"}`}
//                     ></div>

//                     <div
//                       className={`h-1 flex-1 rounded-full ${strength >= 2 ? (strength === 2 ? "bg-yellow-400" : strength >= 3 ? "bg-green-500" : "bg-slate-200") : "bg-slate-200"}`}
//                     ></div>

//                     <div
//                       className={`h-1 flex-1 rounded-full ${strength >= 3 ? "bg-green-500" : "bg-slate-200"}`}
//                     ></div>

//                     <div
//                       className={`h-1 flex-1 rounded-full ${strength >= 4 ? "bg-green-600" : "bg-slate-200"}`}
//                     ></div>
//                   </div>

//                   <span
//                     className="text-[0.6em] font-bold whitespace-nowrap"
//                     style={{
//                       color:
//                         strength <= 1
//                           ? "#f87171"
//                           : strength === 2
//                             ? "#facc15"
//                             : "#22c55e",
//                     }}
//                   >
//                     {strength <= 1
//                       ? "Weak"
//                       : strength === 2
//                         ? "Fair"
//                         : strength === 3
//                           ? "Good"
//                           : "Strong"}
//                   </span>
//                 </div>
//               )}
//             </div>

//             <div className="flex items-center justify-between mb-6 px-1 mt-[1.2em]">
//               <label className="flex items-center gap-2 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   className="w-[1.1em] h-[1.1em] rounded border-slate-300 text-[#2C64FF] focus:ring-[#2C64FF]"
//                 />

//                 <span className="text-[0.8em] font-bold text-[#64748B]">
//                   Remember me
//                 </span>
//               </label>

//               <Link
//                 href="/forgot-password"
//                 className="text-[0.8em] font-bold text-[#64748B] hover:text-[#2C64FF] transition-colors"
//               >
//                 Forgot Password?
//               </Link>
//             </div>

//             {/* Submit Button (Gradient) */}

//             <button
//               type="submit"
//               className="relative overflow-hidden text-[0.95em] py-[1em] rounded-[2em] border-none outline-none text-white font-bold tracking-[0.05em] cursor-pointer transition-all duration-300 hover:-translate-y-[2px] shadow-[0_8px_20px_-5px_rgba(44,100,255,0.4)] hover:shadow-[0_12px_25px_-5px_rgba(44,100,255,0.6)] w-full group"
//             >
//               <div className="absolute inset-0 bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] transition-transform duration-500 ease-out group-hover:scale-[1.05]"></div>

//               <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent opacity-30 rounded-t-full pointer-events-none"></div>

//               <span className="relative z-10 drop-shadow-sm"><T>Sign In</T></span>
//             </button>
//           </div>

//           <div className="mt-4 text-center">
//             <p className="text-[0.7em] font-medium text-slate-400">
//               <Link href="#" className="hover:text-[#2C64FF]">
//                 Privacy Policy
//               </Link>

//               <span className="mx-2">•</span>

//               <Link href="#" className="hover:text-[#2C64FF]">
//                 Terms & Conditions
//               </Link>
//             </p>
//           </div>
//         </form>

//         {/* --- PANDA HANDS & PAWS --- */}

//         <div
//           className="absolute w-[2.5em] border-[0.18em] border-[#02050A] rounded-[0.6em_0.6em_2.18em_2.18em] z-40 transition-all duration-[600ms] ease-in-out shadow-sm bg-[#0F172A]"
//           style={leftHandStyle}
//         ></div>

//         <div
//           className="absolute w-[2.5em] border-[0.18em] border-[#02050A] rounded-[0.6em_0.6em_2.18em_2.18em] z-40 transition-all duration-[600ms] ease-in-out shadow-sm bg-[#0F172A]"
//           style={rightHandStyle}
//         ></div>

//         <div className="absolute top-[39.81em] left-[9.5em] h-[3.12em] w-[3.12em] border-[0.18em] border-[#02050A] rounded-[2.5em_2.5em_1.2em_1.2em] z-20 shadow-md bg-[#0F172A]">
//           <div className="absolute top-[1.12em] left-[0.55em] bg-[#4DA1FF]/80 h-[1.37em] w-[1.75em] rounded-[1.56em_1.56em_0.6em_0.6em]"></div>

//           <div className="absolute top-[0.31em] left-[1.12em] bg-[#4DA1FF]/80 h-[0.5em] w-[0.5em] rounded-full shadow-[0.87em_0.37em_rgba(77,161,255,0.8),-0.87em_0.37em_rgba(77,161,255,0.8)]"></div>
//         </div>

//         <div className="absolute top-[39.81em] right-[9.5em] h-[3.12em] w-[3.12em] border-[0.18em] border-[#02050A] rounded-[2.5em_2.5em_1.2em_1.2em] z-20 shadow-md bg-[#0F172A]">
//           <div className="absolute top-[1.12em] left-[0.55em] bg-[#4DA1FF]/80 h-[1.37em] w-[1.75em] rounded-[1.56em_1.56em_0.6em_0.6em]"></div>

//           <div className="absolute top-[0.31em] left-[1.12em] bg-[#4DA1FF]/80 h-[0.5em] w-[0.5em] rounded-full shadow-[0.87em_0.37em_rgba(77,161,255,0.8),-0.87em_0.37em_rgba(77,161,255,0.8)]"></div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PandaLogin;

"use client";

import React, { useState } from "react";
import {
  Chrome,
  Facebook,
  Linkedin,
  Eye,
  EyeOff,
  Shield,
  Unlock,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import T from "@/components/T";

const PandaLogin: React.FC = () => {
  const [activeField, setActiveField] = useState<
    "none" | "username" | "password"
  >("none");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const router = useRouter();

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length > 5) score += 1;
    if (pass.length > 7) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return Math.min(4, score);
  };

  const strength = calculateStrength(passwordInput);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const toastId = toast.custom(
      (t) => (
        <div
          className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-sm w-full bg-[#0F172A]/90 backdrop-blur-xl border border-[#2C64FF]/30 shadow-[0_20px_50px_rgba(44,100,255,0.2)] rounded-[1.2rem] pointer-events-auto p-4 flex items-center gap-5 relative overflow-hidden`}
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#4DA1FF] to-transparent animate-[pulse_1.5s_ease-in-out_infinite]"></div>
          <div className="relative flex items-center justify-center w-12 h-12">
            <div className="absolute inset-0 border-[3px] border-transparent border-t-[#4DA1FF] border-r-[#4DA1FF] rounded-full animate-spin"></div>
            <div
              className="absolute inset-1.5 border-[3px] border-transparent border-b-[#2C64FF] border-l-[#2C64FF] rounded-full animate-spin"
              style={{ animationDirection: "reverse" }}
            ></div>
            <Shield className="text-[#4DA1FF]" size={18} />
          </div>
          <div className="flex-1">
            <p className="text-[1em] font-black text-[#4DA1FF] tracking-widest uppercase">
              {" "}
              <T>Verifying</T>{" "}
            </p>
            <p className="text-[0.75em] font-medium text-slate-400 mt-0.5 tracking-wide">
              {" "}
              <T>Establishing secure connection...</T>{" "}
            </p>
          </div>
        </div>
      ),
      { duration: Infinity },
    );

    const result = await signIn("credentials", {
      email: usernameInput,
      password: passwordInput,
      redirect: false,
    });

    toast.dismiss(toastId);

    if (!result?.ok || result?.error) {
      const isFraud = result?.error === "FRAUD_BLOCKED";

      if (isFraud) {
        Swal.fire({
          title: "ACCOUNT RESTRICTED",
          text: "Our security systems have flagged this account for suspicious activity. Access has been suspended to protect your assets.",
          icon: "error",
          background: "#0F172A",
          color: "#F8FAFC",
          confirmButtonColor: "#2C64FF",
          confirmButtonText: "Contact for Support",
          showCancelButton: true,
          cancelButtonText: "Close",
          backdrop: `rgba(5, 11, 20, 0.8) blur(8px)`,
          customClass: {
            popup: "rounded-[1.5rem] border border-red-500/30",
            title: "font-black tracking-widest text-red-500",
          },
        }).then((swalResult) => {
          // ✅ REDIRECT LOGIC: Triggers when "Contact Support" is clicked
          if (swalResult.isConfirmed) {
            router.push("/chat/support");
          }
        });
      } else {
        toast.custom((t) => (
          <div
            className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-sm w-full bg-[#0F172A]/95 backdrop-blur-xl border border-red-500/30 shadow-[0_0_40px_-10px_rgba(239,68,68,0.4)] rounded-[1.2rem] pointer-events-auto overflow-hidden relative p-4 flex items-center gap-5`}
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/20 blur-2xl rounded-full z-0"></div>
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/50 z-10">
              <Lock className="text-red-400 animate-bounce" size={22} />
            </div>
            <div className="flex-1 z-10">
              <p className="text-[1em] font-black text-red-400 tracking-widest uppercase">
                {" "}
                <T>Access Denied</T>{" "}
              </p>
              <p className="text-[0.75em] font-medium text-slate-400 mt-0.5 tracking-wide">
                {" "}
                <T>Invalid security credentials.</T>{" "}
              </p>
            </div>
          </div>
        ));
      }
    } else {
      toast.custom((t) => (
        <div
          className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-sm w-full bg-[#0F172A]/95 backdrop-blur-xl border border-[#4DA1FF]/40 shadow-[0_0_40px_-10px_rgba(44,100,255,0.3)] rounded-[1.2rem] pointer-events-auto overflow-hidden relative p-4 flex items-center gap-5`}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#4DA1FF]/20 blur-2xl rounded-full z-0"></div>
          <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#2C64FF] border border-[#4DA1FF]/50 z-10">
            <div className="absolute inset-0 bg-[#4DA1FF] animate-ping opacity-20 rounded-full"></div>
            <Unlock className="text-white" size={22} />
          </div>
          <div className="flex-1 z-10">
            <p className="text-[1em] font-black text-[#4DA1FF] tracking-widest uppercase">
              {" "}
              <T>Access Granted</T>{" "}
            </p>
            <p className="text-[0.75em] font-medium text-slate-400 mt-0.5 tracking-wide">
              {" "}
              <T>Identity confirmed. Routing to homepage...</T>{" "}
            </p>
          </div>
        </div>
      ));

      // Check role and redirect accordingly
      const userRes = await fetch(`/api/user/update?email=${usernameInput}`);
      const userData = await userRes.json();

      setTimeout(() => {
        if (userData?.role?.toLowerCase() === "admin") {
          router.push("/adminDashboard");
        } else {
          router.push("/");
        }
        router.refresh();
      }, 2000);
    }
  };

  // Panda Animation Logic
  const eyeLeftStyle =
    activeField === "username"
      ? { left: "0.75em", top: "1.12em", transform: "rotate(20deg)" }
      : { left: "0.6em", top: "0.6em", transform: "rotate(20deg)" };
  const eyeRightStyle =
    activeField === "username"
      ? { right: "0.75em", top: "1.12em", transform: "rotate(-20deg)" }
      : { right: "0.6em", top: "0.6em", transform: "rotate(-20deg)" };
  const leftHandStyle =
    activeField === "password" && !showPassword
      ? {
          height: "6.56em",
          top: "3.87em",
          left: "11.75em",
          transform: "rotate(-155deg)",
        }
      : {
          height: "2.81em",
          top: "8.4em",
          left: "7.5em",
          transform: "rotate(0deg)",
        };
  const rightHandStyle =
    activeField === "password" && !showPassword
      ? {
          height: "6.56em",
          top: "3.87em",
          right: "11.75em",
          transform: "rotate(155deg)",
        }
      : {
          height: "2.81em",
          top: "8.4em",
          right: "7.5em",
          transform: "rotate(0deg)",
        };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden selection:bg-[#4DA1FF]/30 selection:text-[#2C64FF]">
      <div className="absolute inset-0 w-full h-full overflow-hidden -z-20 bg-[#050B14]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-50"
        >
          <source src="/loginpagebgvideo.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="absolute inset-0 bg-[#050B14]/60 backdrop-blur-[4px] -z-10"></div>

      <div className="relative w-[31.25em] h-[45em] text-[12px] sm:text-[14px] md:text-[16px] mt-16">
        <div className="absolute top-[1.75em] left-[10.75em] h-[2.5em] w-[2.81em] border-[0.18em] border-[#02050A] rounded-[2.5em_2.5em_0_0] rotate-[-38deg] z-10 bg-[#0F172A]"></div>
        <div className="absolute top-[1.75em] right-[10.75em] h-[2.5em] w-[2.81em] border-[0.18em] border-[#02050A] rounded-[2.5em_2.5em_0_0] rotate-[38deg] z-10 bg-[#0F172A]"></div>

        <div className="absolute top-[2em] left-0 right-0 mx-auto h-[7.5em] w-[8.4em] bg-[#F8FAFC] border-[0.18em] border-[#02050A] rounded-[7.5em_7.5em_5.62em_5.62em] z-20 shadow-sm">
          <div className="absolute top-[4em] left-[1em] bg-[#4DA1FF] h-[1em] w-[1.37em] rounded-full rotate-[25deg] opacity-30 blur-[2px]"></div>
          <div className="absolute top-[4em] right-[1em] bg-[#4DA1FF] h-[1em] w-[1.37em] rounded-full rotate-[-25deg] opacity-30 blur-[2px]"></div>
          <div className="absolute top-[2.18em] left-[1.37em] h-[2.18em] w-[2em] rounded-[2em] rotate-[-20deg] bg-[#0F172A]">
            <div
              className="absolute h-[0.6em] w-[0.6em] bg-white rounded-full transition-all duration-[400ms] ease-out shadow-[0_0_5px_rgba(255,255,255,0.8)]"
              style={eyeLeftStyle}
            ></div>
          </div>
          <div className="absolute top-[2.18em] right-[1.37em] h-[2.18em] w-[2em] rounded-[2em] rotate-[20deg] bg-[#0F172A]">
            <div
              className="absolute h-[0.6em] w-[0.6em] bg-white rounded-full transition-all duration-[400ms] ease-out shadow-[0_0_5px_rgba(255,255,255,0.8)]"
              style={eyeRightStyle}
            ></div>
          </div>
          <div className="absolute top-[4.37em] left-0 right-0 mx-auto h-[1em] w-[1em] rounded-[1.2em_0_0_0.25em] rotate-[45deg] bg-[#0F172A]">
            <div className="absolute top-[0.75em] left-[1em] h-[0.6em] w-[0.1em] rotate-[-45deg] bg-[#0F172A]"></div>
          </div>
          <div className="absolute top-[5.31em] left-[3.12em] h-[0.75em] w-[0.93em] bg-transparent rounded-full shadow-[0_0.18em_#0F172A]">
            <div className="absolute left-[0.87em] top-0 h-[0.75em] w-[0.93em] bg-transparent rounded-full shadow-[0_0.18em_#0F172A]"></div>
          </div>
        </div>

        <form
          onSubmit={handleLogin}
          className="absolute top-[9.35em] left-1/2 -translate-x-1/2 w-[25em] h-[32em] bg-[#FFFFFF] px-[2.5em] py-[2em] flex flex-col rounded-[1em] z-10 shadow-[0_30px_60px_rgba(5,11,20,0.6)] border border-slate-200"
        >
          <div className="text-center w-full mt-2">
            <h2 className="text-[1.8em] font-extrabold text-[#0F172A] tracking-tight">
              {" "}
              <T>Sign in to Account</T>{" "}
            </h2>
            <div className="w-[3em] h-[0.25em] bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] mx-auto mt-2 mb-4 rounded-full"></div>
            <div className="flex justify-center gap-4 mb-4">
              <button
                type="button"
                className="p-2.5 rounded-full border border-slate-200 hover:border-[#2C64FF] hover:bg-[#2C64FF]/5 transition-colors group"
              >
                <Facebook
                  size={18}
                  className="text-slate-500 group-hover:text-[#2C64FF]"
                />
              </button>
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="p-2.5 rounded-full border border-slate-200 hover:border-[#2C64FF] hover:bg-[#2C64FF]/5 transition-colors group"
                title="Sign in with Google"
              >
                <Chrome
                  size={18}
                  className="text-slate-500 group-hover:text-[#2C64FF]"
                />
              </button>
              <button
                type="button"
                className="p-2.5 rounded-full border border-slate-200 hover:border-[#2C64FF] hover:bg-[#2C64FF]/5 transition-colors group"
              >
                <Linkedin
                  size={18}
                  className="text-slate-500 group-hover:text-[#2C64FF]"
                />
              </button>
            </div>
            <p className="text-[0.8em] font-medium text-slate-500 mb-6">
              <T>Don't have an account?</T>{" "}
              <Link
                href="/register"
                className="text-[#2C64FF] font-bold hover:underline"
              >
                {" "}
                <T>Sign up</T>{" "}
              </Link>
            </p>
          </div>

          <div className="flex-1 w-full px-2">
            <div className="relative mb-[1.5em]">
              <label
                htmlFor="username"
                className="absolute -top-[0.6em] left-[1em] bg-white px-1 text-[0.7em] font-bold text-[#2C64FF] z-10"
              >
                {" "}
                <T>Email</T>{" "}
              </label>
              <input
                type="text"
                id="username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="example@email.com"
                onFocus={() => setActiveField("username")}
                onBlur={() => setActiveField("none")}
                className="text-[0.9em] font-medium text-[#0F172A] p-[1em] border border-slate-300 rounded-[0.5em] bg-transparent focus:border-[#2C64FF] focus:ring-1 focus:ring-[#2C64FF]/20 outline-none transition-all w-full"
              />
            </div>

            <div className="relative mb-[1.5em]">
              <label
                htmlFor="password"
                className="absolute -top-[0.6em] left-[1em] bg-white px-1 text-[0.7em] font-bold text-[#2C64FF] z-10"
              >
                {" "}
                <T>Password</T>{" "}
              </label>
              <div className="relative w-full border border-slate-300 rounded-[0.5em] focus-within:border-[#2C64FF] focus-within:ring-1 focus-within:ring-[#2C64FF]/20 transition-all bg-transparent">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  onFocus={() => setActiveField("password")}
                  onBlur={() => setActiveField("none")}
                  className="text-[0.9em] font-medium text-[#0F172A] p-[1em] pr-[2.5em] w-full bg-transparent outline-none tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-[0.8em] top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2C64FF] transition-colors z-10"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6 px-1 mt-[1.2em]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-[1.1em] h-[1.1em] rounded border-slate-300 text-[#2C64FF] focus:ring-[#2C64FF]"
                />
                <span className="text-[0.8em] font-bold text-[#64748B]">
                  {" "}
                  <T>Remember me</T>{" "}
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-[0.8em] font-bold text-[#64748B] hover:text-[#2C64FF] transition-colors"
              >
                {" "}
                <T>Forgot Password?</T>{" "}
              </Link>
            </div>

            <button
              type="submit"
              className="relative overflow-hidden text-[0.95em] py-[1em] rounded-[2em] border-none outline-none text-white font-bold tracking-[0.05em] cursor-pointer transition-all duration-300 hover:-translate-y-[2px] shadow-[0_8px_20px_-5px_rgba(44,100,255,0.4)] hover:shadow-[0_12px_25px_-5px_rgba(44,100,255,0.6)] w-full group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] transition-transform duration-500 ease-out group-hover:scale-[1.05]"></div>
              <span className="relative z-10 drop-shadow-sm"><T>Sign In</T></span>
            </button>
          </div>
        </form>

        <div
          className="absolute w-[2.5em] border-[0.18em] border-[#02050A] rounded-[0.6em_0.6em_2.18em_2.18em] z-40 transition-all duration-[600ms] ease-in-out bg-[#0F172A]"
          style={leftHandStyle}
        ></div>
        <div
          className="absolute w-[2.5em] border-[0.18em] border-[#02050A] rounded-[0.6em_0.6em_2.18em_2.18em] z-40 transition-all duration-[600ms] ease-in-out bg-[#0F172A]"
          style={rightHandStyle}
        ></div>
        <div className="absolute top-[39.81em] left-[9.5em] h-[3.12em] w-[3.12em] border-[0.18em] border-[#02050A] rounded-[2.5em_2.5em_1.2em_1.2em] z-20 bg-[#0F172A]">
          <div className="absolute top-[1.12em] left-[0.55em] bg-[#4DA1FF]/80 h-[1.37em] w-[1.75em] rounded-[1.56em_1.56em_0.6em_0.6em]"></div>
          <div className="absolute top-[0.31em] left-[1.12em] bg-[#4DA1FF]/80 h-[0.5em] w-[0.5em] rounded-full shadow-[0.87em_0.37em_rgba(77,161,255,0.8),-0.87em_0.37em_rgba(77,161,255,0.8)]"></div>
        </div>
        <div className="absolute top-[39.81em] right-[9.5em] h-[3.12em] w-[3.12em] border-[0.18em] border-[#02050A] rounded-[2.5em_2.5em_1.2em_1.2em] z-20 bg-[#0F172A]">
          <div className="absolute top-[1.12em] left-[0.55em] bg-[#4DA1FF]/80 h-[1.37em] w-[1.75em] rounded-[1.56em_1.56em_0.6em_0.6em]"></div>
          <div className="absolute top-[0.31em] left-[1.12em] bg-[#4DA1FF]/80 h-[0.5em] w-[0.5em] rounded-full shadow-[0.87em_0.37em_rgba(77,161,255,0.8),-0.87em_0.37em_rgba(77,161,255,0.8)]"></div>
        </div>
      </div>
    </div>
  );
};

export default PandaLogin;
