"use client";

import { useEffect, useState } from "react";

/**
 * Resolve CSS custom properties to concrete color strings for use in <canvas>,
 * and keep them fresh when the user toggles light/dark.
 *
 *   const c = useThemeColors({ teal: "--teal", rose: "--rose" });
 *   ctx.fillStyle = c.teal;   // "" until mounted — guard your draw on it
 */
export function useThemeColors<T extends Record<string, string>>(vars: T): Record<keyof T, string> {
  const [colors, setColors] = useState<Record<keyof T, string>>(
    () => Object.fromEntries(Object.keys(vars).map((k) => [k, ""])) as Record<keyof T, string>,
  );

  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement);
      const out = {} as Record<keyof T, string>;
      for (const k in vars) out[k] = cs.getPropertyValue(vars[k]).trim();
      setColors(out);
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return colors;
}
