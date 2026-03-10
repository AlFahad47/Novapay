"use client";

import React, { useEffect, useState } from "react";
import Loader from "../components/ui/Loader";

export default function Loading() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return <Loader />;
}
