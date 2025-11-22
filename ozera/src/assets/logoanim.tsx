import React, { useEffect, useRef, useState } from "react";


type JewelLogoProps = {
  /** path to svg file in public folder, default /logo.svg */
  src?: string;
  size?: number | string; // px or % etc.
  color?: string; // stroke color
  strokeWidth?: number;
  loopDuration?: number; // seconds
  className?: string;
};

const DEFAULT_SRC = "/logo_colored.svg";

export default function JewelLogo({
  src = DEFAULT_SRC,
  size = 300,
  color = "#164e2a",
  strokeWidth = 6,
  loopDuration = 4,
  className = "",
}: JewelLogoProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    // fetch svg from public folder
    fetch(src)
      .then((r) => r.text())
      .then((svgText) => {
        if (!mounted) return;
        // Insert SVG raw into container
        if (containerRef.current) {
          containerRef.current.innerHTML = svgText;
          // After insertion, find all paths and add class + inline styles
          const svgEl = containerRef.current.querySelector("svg");
          if (svgEl) {
            svgEl.setAttribute("width", typeof size === "number" ? `${size}` : `${size}`);
            svgEl.setAttribute("height", typeof size === "number" ? `${size}` : `${size}`);
            // set stroke on svg if not set on paths
            // iterate all path-like elements
            const pathSelectors = ["path", "circle", "rect", "polyline", "polygon", "line", "ellipse"];
            pathSelectors.forEach((sel) => {
              (Array.from(svgEl.querySelectorAll(sel)) as Element[]).forEach((el, i) => {
                // add animation class
                el.classList.add("anim-path");
                // set stroke and stroke-width if not present
                // only set stroke if it isn't specified inline
                const existingStroke = (el as Element).getAttribute("stroke");
                if (!existingStroke) (el as Element).setAttribute("stroke", color);
                const existingStrokeWidth = (el as Element).getAttribute("stroke-width");
                if (!existingStrokeWidth) (el as Element).setAttribute("stroke-width", String(strokeWidth));
                // ensure fill is none for drawing animation unless SVG intended otherwise
                const existingFill = (el as Element).getAttribute("fill");
                if (!existingFill || existingFill === "#000000") (el as Element).setAttribute("fill", "none");
                // set CSS variable for animation duration per element (allows overrides)
                (el as HTMLElement).style.setProperty("--logo-loop-duration", `${loopDuration}s`);
                // slight per-element delay to create staggered effect
                (el as HTMLElement).style.setProperty("--logo-delay", `${(i % 6) * 0.12}s`);
              });
            });

            // Also make SVG itself non-blocking for pointer events
            svgEl.style.pointerEvents = "none";
          }
          setLoaded(true);
        }
      })
      .catch((err) => {
        // fallback: show nothing
        console.error("Failed to load SVG:", err);
      });

    return () => {
      mounted = false;
    };
  }, [src, size, color, strokeWidth, loopDuration]);

  return (
    <div
      className={`jewel-logo-root ${className}`}
      ref={containerRef}
      aria-hidden={!loaded}
      style={{ width: typeof size === "number" ? `${size}px` : size, height: typeof size === "number" ? `${size}px` : size }}
    />
  );
}
