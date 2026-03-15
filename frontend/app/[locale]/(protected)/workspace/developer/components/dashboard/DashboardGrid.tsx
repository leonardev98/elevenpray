"use client";

import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export function DashboardGrid({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6 md:grid-cols-3"
    >
      {children}
    </motion.div>
  );
}

export function DashboardGridCol({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={item} className="flex flex-col gap-6">
      {children}
    </motion.div>
  );
}
