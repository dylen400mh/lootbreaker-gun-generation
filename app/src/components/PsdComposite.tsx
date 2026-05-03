import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { PSD_CANVAS, type PsdLayer } from '../assets/psdManifest';
import './PsdComposite.css';

interface Props {
  layers: PsdLayer[];
  children?: ReactNode;
}

// A composite of PSD layers, all positioned in absolute PSD coordinates (1000×1363) inside
// a fixed-aspect responsive container. The inner layout is rendered at native PSD pixel size
// and CSS-scaled to the container width via ResizeObserver.
export function PsdComposite({ layers, children }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? el.clientWidth;
      setScale(w / PSD_CANVAS.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="psd-composite"
      style={{
        aspectRatio: `${PSD_CANVAS.width} / ${PSD_CANVAS.height}`,
      }}
    >
      <div
        className="psd-composite__inner"
        style={
          {
            width: `${PSD_CANVAS.width}px`,
            height: `${PSD_CANVAS.height}px`,
            transform: `scale(${scale})`,
          } as CSSProperties
        }
      >
        {layers.map((layer) => (
          <img
            key={layer.id}
            src={`/${layer.file}`}
            alt=""
            aria-hidden="true"
            decoding="async"
            loading="eager"
            // crossOrigin marks these as CORS-clean so Safari (mobile) won't
            // taint the canvas when html-to-image inlines them for PNG export.
            crossOrigin="anonymous"
            data-kind={layer.semantic?.kind}
            style={{
              position: 'absolute',
              left: `${layer.x}px`,
              top: `${layer.y}px`,
              width: `${layer.width}px`,
              height: `${layer.height}px`,
              opacity: layer.opacity,
            }}
          />
        ))}
        {children}
      </div>
    </div>
  );
}

interface OverlayProps {
  x: number;
  y: number;
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

// Positions a child at a PSD coordinate inside a PsdComposite.
export function PsdOverlay({ x, y, width, height, className, style, children }: OverlayProps) {
  return (
    <div
      className={`psd-overlay ${className ?? ''}`}
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: width !== undefined ? `${width}px` : undefined,
        height: height !== undefined ? `${height}px` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
