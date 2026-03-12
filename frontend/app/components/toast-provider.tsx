"use client";

import { Toaster } from "sileo";
import "sileo/styles.css";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-center"
      theme="light"
      offset={{ bottom: 24, left: 16, right: 16 }}
      options={{
        duration: 4000,
        fill: "var(--toast-fill)",
        styles: {
          title: "color: var(--toast-text) !important",
          description: "color: var(--toast-text) !important; opacity: 0.9",
        },
      }}
    />
  );
}
