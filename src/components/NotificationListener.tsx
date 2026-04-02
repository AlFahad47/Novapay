"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import Swal from "@/lib/brandAlert";
import { formatAmount } from "@/lib/utils";

export default function NotificationListener() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.email) return;

    const checkNotifications = async () => {
      try {
        const res = await fetch(`/api/notifications?email=${session.user.email}`);
        const data = await res.json();

        if (data.success && data.request) {
         
          Swal.fire({
            title: "💰 Money Request!",
            html: `<b>${data.request.senderEmail}</b> is asking for <b>৳${formatAmount(data.request.amount)}</b>.<br/><br/><i>"${data.request.note}"</i>`,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Pay Now",
            cancelButtonText: "Ignore",
            confirmButtonColor: "#2563eb",
          }).then((result) => {
            if (result.isConfirmed) {
               
                window.location.href = `/dashboard?payTo=${data.request.senderEmail}&amount=${data.request.amount}`;
            }
          });
        }
      } catch (err) {
        console.error("Notification Error:", err);
      }
    };

    
    const interval = setInterval(checkNotifications, 20000);
    return () => clearInterval(interval);
  }, [session]);

  return null; 
}

