// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Swal from "@/lib/brandAlert";
// import { useSession } from "next-auth/react";

// export default function KYCPage() {
//   const { data: session } = useSession();
//   const [role, setRole] = useState<"User" | "Agent">("User");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [kycStatus, setKycStatus] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const checkStatus = async () => {
//       if (session?.user?.email) {
//         try {
//           const res = await fetch(`/api/kyc?email=${session.user.email}`);
//           const data = await res.json();
//           setKycStatus(data.kycStatus || null);
//         } catch (error) {
//           console.error("Failed to fetch status");
//         } finally {
//           setIsLoading(false);
//         }
//       }
//     };
//     checkStatus();
//   }, [session]);

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     const formData = new FormData(e.currentTarget);
//     const data = Object.fromEntries(formData.entries());
//     const finalData = { ...data, role };

//     try {
//       const response = await fetch("/api/kyc", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(finalData),
//       });

//       if (response.ok) {
//         Swal.fire({
//           title: "KYC Submitted!",
//           text: "Verification is under review. Your account features are being activated.",
//           icon: "success",
//         });
//         setKycStatus("pending");
//       }
//     } catch (error) {
//       Swal.fire("Error", "Submission failed", "error");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (isLoading) return <div className="min-h-screen flex items-center justify-center dark:text-white">Loading...</div>;

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-[#04090f] transition-colors duration-500 px-6 py-16">
//       <div className="max-w-4xl mx-auto">

//         {/* Case 1: Pending status */}
//         {kycStatus === "pending" && (
//           <StatusCard
//             title="Verification Pending"
//             desc="We are reviewing your documents. Balance and Wallet features will be fully unlocked after approval."
//             icon="⏳"
//             color="text-yellow-500"
//           />
//         )}

//         {kycStatus === "approved" && (
//           <StatusCard
//             title="Account Verified"
//             desc="Congratulations! Your identity has been verified. Welcome to NovaPay Wallet."
//             icon="✅"
//             color="text-green-500"
//           />
//         )}

//         {/* Case 3: Show form when no status exists */}
//         {!kycStatus && (
//           <>
//             <motion.h1 initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-[#0095ff] to-[#0061ff] bg-clip-text text-transparent">
//               {role} KYC Verification
//             </motion.h1>

//             <div className="flex justify-center mb-12">
//               <div className="bg-white dark:bg-[#0c1a2b] border border-gray-200 dark:border-blue-700/50 p-2 rounded-xl flex gap-2">
//                 {["User", "Agent"].map((r) => (
//                   <button key={r} onClick={() => setRole(r as "User" | "Agent")} className={`px-8 py-2 rounded-lg font-medium transition-all ${role === r ? "bg-gradient-to-r from-[#0095ff] to-[#0061ff] text-white" : "text-gray-700 dark:text-blue-300"}`}>
//                     {r}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <AnimatePresence mode="wait">
//               <motion.form onSubmit={handleSubmit} key={role} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 bg-white dark:bg-[#0c1a2b] p-8 rounded-3xl border border-gray-200 dark:border-blue-700/40 shadow-xl">

//                 <Section title="👤 Personal Information">
//                   <Input label="Full Name" name="fullName" defaultValue={session?.user?.name || ""} required />
//                   <Input label="Date of Birth" name="dob" type="date" required />
//                   <Select label="Gender" name="gender" options={["Male", "Female", "Other"]} />
//                   <Input label="Nationality / Country" name="nationality" placeholder="e.g. Bangladesh" required />
//                 </Section>

//                 <Section title="🆔 Identity & Preference">
//                   <Input label="NID / Passport Number" name="idNumber" required />
//                   <Select label="Preferred Currency" name="currency" options={["USD", "BDT", "EUR", "GBP"]} />
//                   <div className="md:col-span-2">
//                     <FileInput label="Upload ID Document" name="idImage" />
//                   </div>
//                 </Section>

//                 <Section title="📞 Contact & Address">
//                   <Input label="Mobile Number" name="phone" required />
//                   <Input label="Email Address" name="email" type="email" defaultValue={session?.user?.email || ""} readOnly required />
//                   <Textarea label="Current Address" name="currentAddress" required />
//                   <Textarea label="Permanent Address" name="permanentAddress" required />
//                 </Section>

//                 <motion.button disabled={isSubmitting} type="submit" className="w-full mt-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#0095ff] to-[#0061ff] shadow-lg disabled:opacity-50">
//                   {isSubmitting ? "Submitting..." : `Submit ${role} KYC`}
//                 </motion.button>
//               </motion.form>
//             </AnimatePresence>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// // --- Helper components ---

// function StatusCard({ title, desc, icon, color }: any) {
//   return (
//     <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#0c1a2b] p-10 rounded-3xl border border-gray-200 dark:border-blue-700/40 text-center shadow-2xl">
//       <div className="text-6xl mb-6">{icon}</div>
//       <h2 className={`text-3xl font-bold mb-4 ${color}`}>{title}</h2>
//       <p className="text-gray-600 dark:text-blue-200 text-lg max-w-md mx-auto">{desc}</p>
//       <button onClick={() => window.location.href = "/dashboard"} className="mt-8 px-8 py-3 bg-gradient-to-r from-[#0095ff] to-[#0061ff] text-white rounded-xl font-semibold">Go to Dashboard</button>
//     </motion.div>
//   );
// }

// function Section({ title, children }: any) {
//   return (
//     <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
//       <h2 className="text-xl font-semibold mb-6 bg-gradient-to-r from-[#0095ff] to-[#0061ff] bg-clip-text text-transparent">{title}</h2>
//       <div className="grid md:grid-cols-2 gap-6">{children}</div>
//     </motion.div>
//   );
// }

// function Input({ label, name, type = "text", required = false, defaultValue = "", readOnly = false, placeholder = "" }: any) {
//   return (
//     <div className="flex flex-col gap-2">
//       <label className="text-sm text-gray-700 dark:text-blue-300">{label}</label>
//       <input name={name} type={type} required={required} defaultValue={defaultValue} readOnly={readOnly} placeholder={placeholder} className={`bg-gray-100 dark:bg-blue-900/20 text-gray-800 dark:text-blue-100 border border-gray-300 dark:border-blue-700/40 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0095ff] outline-none ${readOnly ? "opacity-60" : ""}`} />
//     </div>
//   );
// }

// function Textarea({ label, name, required = false }: any) {
//   return (
//     <div className="flex flex-col gap-2 md:col-span-2">
//       <label className="text-sm text-gray-700 dark:text-blue-300">{label}</label>
//       <textarea name={name} required={required} rows={2} className="bg-gray-100 dark:bg-blue-900/20 text-gray-800 dark:text-blue-100 border border-gray-300 dark:border-blue-700/40 rounded-lg px-4 py-2 outline-none" />
//     </div>
//   );
// }

// function Select({ label, name, options }: any) {
//   return (
//     <div className="flex flex-col gap-2">
//       <label className="text-sm text-gray-700 dark:text-blue-300">{label}</label>
//       <select name={name} className="bg-gray-100 dark:bg-blue-900/20 text-gray-800 dark:text-blue-100 border border-gray-300 dark:border-blue-700/40 rounded-lg px-4 py-2 outline-none">
//         {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
//       </select>
//     </div>
//   );
// }

// function FileInput({ label, name }: any) {
//   return (
//     <div className="flex flex-col gap-2">
//       <label className="text-sm text-gray-700 dark:text-blue-300">{label}</label>
//       <input type="file" name={name} className="bg-gray-100 dark:bg-blue-900/20 text-gray-800 dark:text-blue-100 border border-gray-300 dark:border-blue-700/40 rounded-lg px-4 py-2 file:bg-blue-600 file:text-white file:border-0 file:rounded-md" />
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "@/lib/brandAlert";
import { useSession } from "next-auth/react";
import T from "@/components/T";

export default function KYCPage() {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      if (session?.user?.email) {
        try {
          const res = await fetch(`/api/kyc?email=${session.user.email}`);
          const data = await res.json();
          setKycStatus(data.kycStatus || null);
        } catch (error) {
          console.error("Failed to fetch status");
        } finally {
          setIsLoading(false);
        }
      }
    };
    checkStatus();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const finalData = { ...data, role: "User" };

    try {
      const response = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      if (response.ok) {
        Swal.fire({
          title: "KYC Submitted!",
          text: "Verification is under review. Your account features are being activated.",
          icon: "success",
        });
        setKycStatus("pending");
      }
    } catch (error) {
      Swal.fire("Error", "Submission failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center dark:text-white"><T>Loading...</T></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#04090f] transition-colors duration-500 px-6 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Case 1: Pending status */}
        {kycStatus === "pending" && (
          <StatusCard
            title="Verification Pending"
            desc="Your documents are under review. Balance and Wallet features will be fully unlocked after approval."
            icon="⏳"
            color="text-yellow-500"
          />
        )}

        {/* Case 2: Approved status */}
        {kycStatus === "approved" && (
          <StatusCard
            title="Account Verified"
            desc="Congratulations! Your identity has been verified. Welcome to NovaPay Wallet."
            icon="…"
            color="text-green-500"
          />
        )}

        {/* Case 3: Show form when no status exists */}
        {!kycStatus && (
          <>
            <motion.h1
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-[#0095ff] to-[#0061ff] bg-clip-text text-transparent"
            >
              <T>User KYC Verification</T>
            </motion.h1>

            <AnimatePresence mode="wait">
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10 bg-white dark:bg-[#0c1a2b] p-8 rounded-3xl border border-gray-200 dark:border-blue-700/40 shadow-xl"
              >
                <Section title="👤 Personal Information">
                  <Input
                    label="Full Name"
                    name="fullName"
                    defaultValue={session?.user?.name || ""}
                    required
                  />
                  <Input
                    label="Date of Birth"
                    name="dob"
                    type="date"
                    required
                  />
                  <Select
                    label="Gender"
                    name="gender"
                    options={["Male", "Female", "Other"]}
                  />
                  <Input
                    label="Nationality / Country"
                    name="nationality"
                    placeholder="e.g. Bangladesh"
                    required
                  />
                </Section>

                <Section title="🆔 Identity & Preference">
                  <Input
                    label="NID / Passport Number"
                    name="idNumber"
                    required
                  />
                  <Select
                    label="Preferred Currency"
                    name="currency"
                    options={["USD", "BDT", "EUR", "GBP"]}
                  />
                  <div className="md:col-span-2">
                    <FileInput label="Upload ID Document" name="idImage" />
                  </div>
                </Section>

                <Section title="📞 Contact & Address">
                  <Input label="Mobile Number" name="phone" required />
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    defaultValue={session?.user?.email || ""}
                    readOnly
                    required
                  />
                  <Textarea
                    label="Current Address"
                    name="currentAddress"
                    required
                  />
                  <Textarea
                    label="Permanent Address"
                    name="permanentAddress"
                    required
                  />
                </Section>

                <motion.button disabled={isSubmitting} type="submit" className="w-full mt-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#0095ff] to-[#0061ff] shadow-lg disabled:opacity-50">
                  {isSubmitting ? <T>Submitting...</T> : <><T>Submit User KYC</T></>}
                </motion.button>
              </motion.form>
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}

// --- Helper components ---

function StatusCard({ title, desc, icon, color }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-[#0c1a2b] p-10 rounded-3xl border border-gray-200 dark:border-blue-700/40 text-center shadow-2xl"
    >
      <div className="text-6xl mb-6">{icon}</div>
      <h2 className={`text-3xl font-bold mb-4 ${color}`}><T>{title}</T></h2>
      <p className="text-gray-600 dark:text-blue-200 text-lg max-w-md mx-auto"><T>{desc}</T></p>
      <button onClick={() => window.location.href = "/dashboard"} className="mt-8 px-8 py-3 bg-gradient-to-r from-[#0095ff] to-[#0061ff] text-white rounded-xl font-semibold"><T>Go to Dashboard</T></button>
    </motion.div>
  );
}

function Section({ title, children }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <h2 className="text-xl font-semibold mb-6 bg-gradient-to-r from-[#0095ff] to-[#0061ff] bg-clip-text text-transparent"><T>{title}</T></h2>
      <div className="grid md:grid-cols-2 gap-6">{children}</div>
    </motion.div>
  );
}

function Input({
  label,
  name,
  type = "text",
  required = false,
  defaultValue = "",
  readOnly = false,
  placeholder = "",
}: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-gray-700 dark:text-blue-300"><T>{label}</T></label>
      <input name={name} type={type} required={required} defaultValue={defaultValue} readOnly={readOnly} placeholder={placeholder} className={`bg-gray-100 dark:bg-blue-900/20 text-gray-800 dark:text-blue-100 border border-gray-300 dark:border-blue-700/40 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0095ff] outline-none ${readOnly ? "opacity-60" : ""}`} />
    </div>
  );
}

function Textarea({ label, name, required = false }: any) {
  return (
    <div className="flex flex-col gap-2 md:col-span-2">
      <label className="text-sm text-gray-700 dark:text-blue-300"><T>{label}</T></label>
      <textarea name={name} required={required} rows={2} className="bg-gray-100 dark:bg-blue-900/20 text-gray-800 dark:text-blue-100 border border-gray-300 dark:border-blue-700/40 rounded-lg px-4 py-2 outline-none" />
    </div>
  );
}

function Select({ label, name, options }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-gray-700 dark:text-blue-300"><T>{label}</T></label>
      <select name={name} className="bg-gray-100 dark:bg-blue-900/20 text-gray-800 dark:text-blue-100 border border-gray-300 dark:border-blue-700/40 rounded-lg px-4 py-2 outline-none">
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function FileInput({ label, name }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-gray-700 dark:text-blue-300"><T>{label}</T></label>
      <input type="file" name={name} className="bg-gray-100 dark:bg-blue-900/20 text-gray-800 dark:text-blue-100 border border-gray-300 dark:border-blue-700/40 rounded-lg px-4 py-2 file:bg-blue-600 file:text-white file:border-0 file:rounded-md" />
    </div>
  );
}

