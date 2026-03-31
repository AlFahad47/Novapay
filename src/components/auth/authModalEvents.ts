"use client";

export type AuthView = "login" | "register";

export const AUTH_MODAL_EVENT = "open-auth-modal";

export function openAuthModal(view: AuthView = "login") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(AUTH_MODAL_EVENT, {
      detail: { view },
    }),
  );
}
