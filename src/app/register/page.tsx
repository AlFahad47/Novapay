"use client";
import React, { useState } from 'react';
import { Chrome, Facebook, Linkedin, Eye, EyeOff, Shield, Unlock, Lock } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const PandaRegister: React.FC = () => {
  const router = useRouter();
  const [activeField, setActiveField] = useState<'none' | 'text' | 'password'>('none');
  const [showPassword, setShowPassword] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [profileImage, setProfileImage] = useState<string>('');
  const [selectedFileName, setSelectedFileName] = useState('');

  // Password strength calculation
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setProfileImage('');
      setSelectedFileName('');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setProfileImage(result);
        setSelectedFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  // --- CREATIVE PROFESSIONAL REGISTRATION HANDLER ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if(!nameInput || !emailInput || !passwordInput) {
        // ❌ Validation Error
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-[#0F172A]/95 backdrop-blur-xl border border-red-500/30 shadow-[0_0_40px_-10px_rgba(239,68,68,0.4)] rounded-[1.2rem] pointer-events-auto overflow-hidden relative p-4 flex items-center gap-5`}>
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/20 blur-2xl rounded-full z-0"></div>
              <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/50 z-10">
                <Lock className="text-red-400" size={22} />
              </div>
              <div className="flex-1 z-10">
                <p className="text-[1em] font-black text-red-400 tracking-widest uppercase">Validation Failed</p>
                <p className="text-[0.75em] font-medium text-slate-400 mt-0.5 tracking-wide">Please fill in all fields!</p>
              </div>
            </div>
        ));
      return;
    }

    // 1. Radar Scan Loading Toast
    const toastId = toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-[#0F172A]/90 backdrop-blur-xl border border-[#2C64FF]/30 shadow-[0_20px_50px_rgba(44,100,255,0.2)] rounded-[1.2rem] pointer-events-auto p-4 flex items-center gap-5 relative overflow-hidden`}>
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#4DA1FF] to-transparent animate-[pulse_1.5s_ease-in-out_infinite]"></div>
        
        <div className="relative flex items-center justify-center w-12 h-12">
          <div className="absolute inset-0 border-[3px] border-transparent border-t-[#4DA1FF] border-r-[#4DA1FF] rounded-full animate-spin"></div>
          <div className="absolute inset-1.5 border-[3px] border-transparent border-b-[#2C64FF] border-l-[#2C64FF] rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
          <Shield className="text-[#4DA1FF]" size={18} />
        </div>

        <div className="flex-1">
          <p className="text-[1em] font-black text-[#4DA1FF] tracking-widest uppercase">Processing</p>
          <p className="text-[0.75em] font-medium text-slate-400 mt-0.5 tracking-wide">Creating secure account...</p>
        </div>
      </div>
    ), { duration: Infinity });

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: nameInput, 
          email: emailInput, 
          password: passwordInput,
          image: profileImage,
        })
      });

      const data = await res.json();
      toast.dismiss(toastId);

      if(res.ok) {
         // 2. Success: Identity Created
         toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-[#0F172A]/95 backdrop-blur-xl border border-[#4DA1FF]/40 shadow-[0_0_40px_-10px_rgba(44,100,255,0.3)] rounded-[1.2rem] pointer-events-auto overflow-hidden relative p-4 flex items-center gap-5`}>
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#4DA1FF]/20 blur-2xl rounded-full z-0"></div>
              
              <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#2C64FF] border border-[#4DA1FF]/50 z-10">
                <div className="absolute inset-0 bg-[#4DA1FF] animate-ping opacity-20 rounded-full"></div>
                <Unlock className="text-white" size={22} />
              </div>
    
              <div className="flex-1 z-10">
                <p className="text-[1em] font-black text-[#4DA1FF] tracking-widest uppercase">Identity Created</p>
                <p className="text-[0.75em] font-medium text-slate-400 mt-0.5 tracking-wide">Account created successfully.</p>
              </div>
            </div>
         ));

        const signInResult = await signIn('credentials', {
         email: emailInput,
         password: passwordInput,
         redirect: false,
        });

        if (signInResult?.ok) {
         router.push('/dashboard');
         router.refresh();
        } else {
         toast.error('Account created, please login to continue.');
         router.push('/login');
        }
         
      } else {
         // 3. Error Case
         toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-[#0F172A]/95 backdrop-blur-xl border border-red-500/30 shadow-[0_0_40px_-10px_rgba(239,68,68,0.4)] rounded-[1.2rem] pointer-events-auto overflow-hidden relative p-4 flex items-center gap-5`}>
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/20 blur-2xl rounded-full z-0"></div>
              <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/50 z-10">
                <Lock className="text-red-400 animate-pulse" size={22} />
              </div>
              <div className="flex-1 z-10">
                <p className="text-[1em] font-black text-red-400 tracking-widest uppercase">Request Denied</p>
                <p className="text-[0.75em] font-medium text-slate-400 mt-0.5 tracking-wide">{data.message || "Could not create account!"}</p>
              </div>
            </div>
         ));
      }
    } catch {
      toast.dismiss(toastId);
      toast.error("Server connection failed!");
    }
  };

  // Panda Animation Logic
  const eyeLeftStyle = activeField === 'text' 
    ? { left: '0.75em', top: '1.12em', transform: 'rotate(20deg)' } 
    : { left: '0.6em', top: '0.6em', transform: 'rotate(20deg)' };

  const eyeRightStyle = activeField === 'text' 
    ? { right: '0.75em', top: '1.12em', transform: 'rotate(-20deg)' } 
    : { right: '0.6em', top: '0.6em', transform: 'rotate(-20deg)' };

  const leftHandStyle = activeField === 'password' && !showPassword
    ? { height: '6.56em', top: '3.87em', left: '11.75em', transform: 'rotate(-155deg)' }
    : { height: '2.81em', top: '8.4em', left: '7.5em', transform: 'rotate(0deg)' };

  const rightHandStyle = activeField === 'password' && !showPassword
    ? { height: '6.56em', top: '3.87em', right: '11.75em', transform: 'rotate(155deg)' }
    : { height: '2.81em', top: '8.4em', right: '7.5em', transform: 'rotate(0deg)' };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden selection:bg-[#4DA1FF]/30 selection:text-[#2C64FF] py-10">
      
      {/* Local Video Background */}
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

      {/* Glassmorphism Overlay */}
      <div className="absolute inset-0 bg-[#050B14]/60 backdrop-blur-[4px] -z-10"></div>

      {/* Container height increased for the extra input field */}
      <div className="relative w-[31.25em] h-[50em] text-[12px] sm:text-[14px] md:text-[16px] mt-16">
        
        {/* --- PANDA FACE --- */}
        <div className="absolute top-[1.75em] left-[10.75em] h-[2.5em] w-[2.81em] border-[0.18em] border-[#02050A] rounded-[2.5em_2.5em_0_0] rotate-[-38deg] z-10 bg-[#0F172A]"></div>
        <div className="absolute top-[1.75em] right-[10.75em] h-[2.5em] w-[2.81em] border-[0.18em] border-[#02050A] rounded-[2.5em_2.5em_0_0] rotate-[38deg] z-10 bg-[#0F172A]"></div>
        
        <div className="absolute top-[2em] left-0 right-0 mx-auto h-[7.5em] w-[8.4em] bg-[#F8FAFC] border-[0.18em] border-[#02050A] rounded-[7.5em_7.5em_5.62em_5.62em] z-20 shadow-sm">
          <div className="absolute top-[4em] left-[1em] bg-[#4DA1FF] h-[1em] w-[1.37em] rounded-full rotate-[25deg] opacity-30 blur-[2px]"></div>
          <div className="absolute top-[4em] right-[1em] bg-[#4DA1FF] h-[1em] w-[1.37em] rounded-full rotate-[-25deg] opacity-30 blur-[2px]"></div>
          
          <div className="absolute top-[2.18em] left-[1.37em] h-[2.18em] w-[2em] rounded-[2em] rotate-[-20deg] bg-[#0F172A]">
            <div className="absolute h-[0.6em] w-[0.6em] bg-white rounded-full transition-all duration-[400ms] ease-out shadow-[0_0_5px_rgba(255,255,255,0.8)]" style={eyeLeftStyle}></div>
          </div>
          <div className="absolute top-[2.18em] right-[1.37em] h-[2.18em] w-[2em] rounded-[2em] rotate-[20deg] bg-[#0F172A]">
            <div className="absolute h-[0.6em] w-[0.6em] bg-white rounded-full transition-all duration-[400ms] ease-out shadow-[0_0_5px_rgba(255,255,255,0.8)]" style={eyeRightStyle}></div>
          </div>

          <div className="absolute top-[4.37em] left-0 right-0 mx-auto h-[1em] w-[1em] rounded-[1.2em_0_0_0.25em] rotate-[45deg] bg-[#0F172A]">
            <div className="absolute top-[0.75em] left-[1em] h-[0.6em] w-[0.1em] rotate-[-45deg] bg-[#0F172A]"></div>
          </div>

          <div className="absolute top-[5.31em] left-[3.12em] h-[0.75em] w-[0.93em] bg-transparent rounded-full shadow-[0_0.18em_#0F172A]">
            <div className="absolute left-[0.87em] top-0 h-[0.75em] w-[0.93em] bg-transparent rounded-full shadow-[0_0.18em_#0F172A]"></div>
          </div>
        </div>

        {/* --- FORM SECTION --- */}
        <form onSubmit={handleRegister} className="absolute top-[9.35em] left-1/2 -translate-x-1/2 w-[25em] h-[37em] bg-[#FFFFFF] px-[2.5em] py-[2em] flex flex-col rounded-[1em] z-10 shadow-[0_30px_60px_rgba(5,11,20,0.6)] border border-slate-200">
          <div className="text-center w-full mt-1">
            <h2 className="text-[1.8em] font-extrabold text-[#0F172A] tracking-tight">Create Account</h2>
            <div className="w-[3em] h-[0.25em] bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] mx-auto mt-2 mb-3 rounded-full"></div>
            
            <div className="flex justify-center gap-4 mb-3">
              <button type="button" className="p-2 rounded-full border border-slate-200 hover:border-[#2C64FF] hover:bg-[#2C64FF]/5 transition-colors group">
                <Facebook size={16} className="text-slate-500 group-hover:text-[#2C64FF]" />
              </button>
              <button type="button" className="p-2 rounded-full border border-slate-200 hover:border-[#2C64FF] hover:bg-[#2C64FF]/5 transition-colors group">
                <Chrome size={16} className="text-slate-500 group-hover:text-[#2C64FF]" />
              </button>
              <button type="button" className="p-2 rounded-full border border-slate-200 hover:border-[#2C64FF] hover:bg-[#2C64FF]/5 transition-colors group">
                <Linkedin size={16} className="text-slate-500 group-hover:text-[#2C64FF]" />
              </button>
            </div>
            
            <p className="text-[0.8em] font-medium text-slate-500 mb-4">
              Already have an account? <Link href="/login" className="text-[#2C64FF] font-bold hover:underline">Log in</Link>
            </p>
          </div>

          <div className="flex-1 w-full px-2">
            
            {/* Name Field */}
            <div className="relative mb-[1.2em]">
              <label htmlFor="name" className="absolute -top-[0.6em] left-[1em] bg-white px-1 text-[0.7em] font-bold text-[#2C64FF] z-10">Full Name</label>
              <input type="text" id="name" value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="John Doe" onFocus={() => setActiveField('text')} onBlur={() => setActiveField('none')} className="text-[0.9em] font-medium text-[#0F172A] p-[1em] border border-slate-300 rounded-[0.5em] bg-transparent focus:border-[#2C64FF] focus:ring-1 focus:ring-[#2C64FF]/20 outline-none transition-all w-full" />
            </div>

            {/* Email Field */}
            <div className="relative mb-[1.2em]">
              <label htmlFor="email" className="absolute -top-[0.6em] left-[1em] bg-white px-1 text-[0.7em] font-bold text-[#2C64FF] z-10">Email</label>
              <input type="email" id="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="example@email.com" onFocus={() => setActiveField('text')} onBlur={() => setActiveField('none')} className="text-[0.9em] font-medium text-[#0F172A] p-[1em] border border-slate-300 rounded-[0.5em] bg-transparent focus:border-[#2C64FF] focus:ring-1 focus:ring-[#2C64FF]/20 outline-none transition-all w-full" />
            </div>
            
            {/* Password Field */}
            <div className="relative mb-[1em]">
              <label htmlFor="password" className="absolute -top-[0.6em] left-[1em] bg-white px-1 text-[0.7em] font-bold text-[#2C64FF] z-10">Password</label>
              <div className="relative w-full border border-slate-300 rounded-[0.5em] focus-within:border-[#2C64FF] focus-within:ring-1 focus-within:ring-[#2C64FF]/20 transition-all bg-transparent">
                <input type={showPassword ? "text" : "password"} id="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="••••••••" onFocus={() => setActiveField('password')} onBlur={() => setActiveField('none')} className="text-[0.9em] font-medium text-[#0F172A] p-[1em] pr-[2.5em] w-full bg-transparent outline-none tracking-widest" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-[0.8em] top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2C64FF] transition-colors z-10">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {activeField === 'password' && passwordInput.length > 0 && (
                <div className="absolute -bottom-[1.2em] left-0 w-full flex items-center justify-between px-1">
                  <div className="flex gap-1 w-full mr-2">
                    <div className={`h-1 flex-1 rounded-full ${strength >= 1 ? (strength === 1 ? 'bg-red-400' : strength === 2 ? 'bg-yellow-400' : strength >= 3 ? 'bg-green-500' : 'bg-slate-200') : 'bg-slate-200'}`}></div>
                    <div className={`h-1 flex-1 rounded-full ${strength >= 2 ? (strength === 2 ? 'bg-yellow-400' : strength >= 3 ? 'bg-green-500' : 'bg-slate-200') : 'bg-slate-200'}`}></div>
                    <div className={`h-1 flex-1 rounded-full ${strength >= 3 ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                    <div className={`h-1 flex-1 rounded-full ${strength >= 4 ? 'bg-green-600' : 'bg-slate-200'}`}></div>
                  </div>
                  <span className="text-[0.6em] font-bold whitespace-nowrap" style={{ color: strength <= 1 ? '#f87171' : strength === 2 ? '#facc15' : '#22c55e' }}>
                    {strength <= 1 ? 'Weak' : strength === 2 ? 'Fair' : strength === 3 ? 'Good' : 'Strong'}
                  </span>
                </div>
              )}
            </div>

            {/* Profile Photo Field */}
            <div className="relative mb-[1.2em] mt-[1.6em]">
              <label htmlFor="profilePhoto" className="absolute -top-[0.6em] left-[1em] bg-white px-1 text-[0.7em] font-bold text-[#2C64FF] z-10">Profile Photo</label>
              <input
                type="file"
                id="profilePhoto"
                accept="image/*"
                onChange={handleImageChange}
                className="text-[0.82em] font-medium text-[#0F172A] p-[0.9em] border border-slate-300 rounded-[0.5em] bg-transparent focus:border-[#2C64FF] focus:ring-1 focus:ring-[#2C64FF]/20 outline-none transition-all w-full file:mr-3 file:rounded-full file:border-0 file:bg-[#2C64FF]/10 file:px-3 file:py-1 file:text-[#2C64FF] file:font-semibold"
              />
              {selectedFileName && (
                <p className="text-[0.7em] text-slate-500 mt-1 px-1">Selected: {selectedFileName}</p>
              )}
            </div>

            <div className="flex items-center mb-5 px-1 mt-[1.2em]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-[1.1em] h-[1.1em] rounded border-slate-300 text-[#2C64FF] focus:ring-[#2C64FF]" />
                <span className="text-[0.75em] font-bold text-slate-500">I accept the <Link href="#" className="text-[#2C64FF] hover:underline">Terms & Conditions</Link></span>
              </label>
            </div>
            
            {/* Submit Button (Gradient) */}
            <button type="submit" className="relative overflow-hidden text-[0.95em] py-[1em] rounded-[2em] border-none outline-none text-white font-bold tracking-[0.05em] cursor-pointer transition-all duration-300 hover:-translate-y-[2px] shadow-[0_8px_20px_-5px_rgba(44,100,255,0.4)] hover:shadow-[0_12px_25px_-5px_rgba(44,100,255,0.6)] w-full group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#4DA1FF] to-[#1E50FF] transition-transform duration-500 ease-out group-hover:scale-[1.05]"></div>
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent opacity-30 rounded-t-full pointer-events-none"></div>
              <span className="relative z-10 drop-shadow-sm">Sign Up</span>
            </button>
          </div>
        </form>
        
        {/* --- PANDA HANDS & PAWS --- */}
        <div className="absolute w-[2.5em] border-[0.18em] border-[#02050A] rounded-[0.6em_0.6em_2.18em_2.18em] z-40 transition-all duration-[600ms] ease-in-out shadow-sm bg-[#0F172A]" style={leftHandStyle}></div>
        <div className="absolute w-[2.5em] border-[0.18em] border-[#02050A] rounded-[0.6em_0.6em_2.18em_2.18em] z-40 transition-all duration-[600ms] ease-in-out shadow-sm bg-[#0F172A]" style={rightHandStyle}></div>
        
        {/* Feet moved down to match taller form height */}
        <div className="absolute top-[44.81em] left-[9.5em] h-[3.12em] w-[3.12em] border-[0.18em] border-[#02050A] rounded-[2.5em_2.5em_1.2em_1.2em] z-20 shadow-md bg-[#0F172A]">
          <div className="absolute top-[1.12em] left-[0.55em] bg-[#4DA1FF]/80 h-[1.37em] w-[1.75em] rounded-[1.56em_1.56em_0.6em_0.6em]"></div>
          <div className="absolute top-[0.31em] left-[1.12em] bg-[#4DA1FF]/80 h-[0.5em] w-[0.5em] rounded-full shadow-[0.87em_0.37em_rgba(77,161,255,0.8),-0.87em_0.37em_rgba(77,161,255,0.8)]"></div>
        </div>
        <div className="absolute top-[44.81em] right-[9.5em] h-[3.12em] w-[3.12em] border-[0.18em] border-[#02050A] rounded-[2.5em_2.5em_1.2em_1.2em] z-20 shadow-md bg-[#0F172A]">
          <div className="absolute top-[1.12em] left-[0.55em] bg-[#4DA1FF]/80 h-[1.37em] w-[1.75em] rounded-[1.56em_1.56em_0.6em_0.6em]"></div>
          <div className="absolute top-[0.31em] left-[1.12em] bg-[#4DA1FF]/80 h-[0.5em] w-[0.5em] rounded-full shadow-[0.87em_0.37em_rgba(77,161,255,0.8),-0.87em_0.37em_rgba(77,161,255,0.8)]"></div>
        </div>
      </div>
    </div>
  );
};

export default PandaRegister;