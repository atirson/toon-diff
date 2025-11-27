'use client';

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function Adsense({
  slot,
  className = "",
  style = { display: "block" },
}: {
  slot: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("Adsense error:", e);
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={style}
      data-ad-client="ca-pub-7635452983056415"
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
      // @ts-ignore
      ref={adRef}
    />
  );
}
