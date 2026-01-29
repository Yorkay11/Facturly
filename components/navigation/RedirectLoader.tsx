"use client";

import { ReactNode } from 'react';
import './RedirectLoader.css';

interface RedirectLoaderProps {
  /**
   * Texte à afficher sous l'animation
   * @default "Redirecting"
   */
  text?: string;

  /**
   * Couleur de fond
   * @default "#ffffff"
   */
  backgroundColor?: string;

  /**
   * Couleur de la fusée et du texte
   * @default "hsl(var(--primary))"
   */
  color?: string;

  /**
   * Contenu personnalisé à afficher à la place du texte par défaut
   */
  children?: ReactNode;
}

/**
 * Composant d'animation de redirection avec une fusée
 * 
 * @example
 * <RedirectLoader />
 * 
 * @example
 * <RedirectLoader text="Chargement..." />
 */
export function RedirectLoader({
  text = "Redirecting",
  backgroundColor = "#ffffff",
  color = "hsl(var(--primary))",
  children,
}: RedirectLoaderProps) {
  return (
    <div
      className="redirect-loader-container "
      style={{
        backgroundColor,
        '--rocket-color': color
      } as React.CSSProperties & { '--rocket-color': string }}
    >
      <div className="redirect-loader-body">
        <span style={{ backgroundColor: color }}>
          <span style={{ backgroundColor: color }}></span>
          <span style={{ backgroundColor: color }}></span>
          <span style={{ backgroundColor: color }}></span>
          <span style={{ backgroundColor: color }}></span>
        </span>
        <div className="redirect-loader-base">
          <span
            style={{
              borderRightColor: color,
            }}
          >
            <div
              className="redirect-loader-face"
              style={{ backgroundColor: color }}
            >
              <div
                className="redirect-loader-face-after"
                style={{ backgroundColor: color }}
              ></div>
            </div>
          </span>
        </div>
      </div>
      <div className="redirect-loader-longfazers">
        <span style={{ backgroundColor: color }}></span>
        <span style={{ backgroundColor: color }}></span>
        <span style={{ backgroundColor: color }}></span>
        <span style={{ backgroundColor: color }}></span>
      </div>
      {children || (
          <p style={{ color }} className="text-xs md:text-sm mt-20">{text}</p>
        )}
    </div>
  );
}
