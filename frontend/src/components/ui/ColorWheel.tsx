import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ColorWheelProps {
  colors: string[];
  onColorSelect: (color: string, index?: number) => void;
  size?: number;
  selectedIndex?: number | null;
}

// Convertir RGB en HSL
const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return [h * 360, s * 100, l * 100];
};

// Convertir HSL en RGB
const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  h /= 360;
  s /= 100;
  l /= 100;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

// Convertir hex en RGB
const hexToRgb = (hex: string): [number, number, number] | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : null;
};

// Convertir RGB en hex
const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
};

// Obtenir la couleur à une position sur la roue
const getColorAtPosition = (x: number, y: number, centerX: number, centerY: number, radius: number): string => {
  const dx = x - centerX;
  const dy = y - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Si en dehors du cercle, retourner blanc
  if (distance > radius) return '#ffffff';

  // Calculer l'angle (0-360)
  let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (angle < 0) angle += 360;

  // Calculer la saturation (0-100) basée sur la distance du centre
  const saturation = Math.min(100, (distance / radius) * 100);

  // Luminosité fixe à 50% pour une meilleure visibilité
  const lightness = 50;

  // Convertir HSL en RGB puis en hex
  const [r, g, b] = hslToRgb(angle, saturation, lightness);
  return rgbToHex(r, g, b);
};

// Obtenir la position d'une couleur sur la roue
const getPositionForColor = (color: string, centerX: number, centerY: number, radius: number): { x: number; y: number } | null => {
  const rgb = hexToRgb(color);
  if (!rgb) return null;

  const [h, s] = rgbToHsl(rgb[0], rgb[1], rgb[2]);

  // Calculer la distance du centre basée sur la saturation
  const distance = (s / 100) * radius;

  // Calculer la position x, y
  const angleRad = (h * Math.PI) / 180;
  const x = centerX + distance * Math.cos(angleRad);
  const y = centerY + distance * Math.sin(angleRad);

  return { x, y };
};

export const ColorWheel: React.FC<ColorWheelProps> = ({ colors, onColorSelect, size = 300, selectedIndex: externalSelectedIndex }) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [internalSelectedIndex, setInternalSelectedIndex] = useState<number | null>(null);
  const selectedIndex = externalSelectedIndex !== undefined ? externalSelectedIndex : internalSelectedIndex;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 20;

  // Dessiner la roue de couleur
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Effacer le canvas
    ctx.clearRect(0, 0, size, size);

    // Dessiner la roue de couleur avec un gradient radial
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= radius) {
          // Calculer l'angle (0-360)
          let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          if (angle < 0) angle += 360;

          // Calculer la saturation (0-100) basée sur la distance du centre
          const saturation = Math.min(100, (distance / radius) * 100);
          const lightness = 50;

          // Convertir HSL en RGB
          const [r, g, b] = hslToRgb(angle, saturation, lightness);

          const index = (y * size + x) * 4;
          data[index] = r;
          data[index + 1] = g;
          data[index + 2] = b;
          data[index + 3] = 255;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Dessiner un cercle blanc au centre (pour les couleurs désaturées)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.1, 0, 2 * Math.PI);
    ctx.fill();

    // Dessiner un cercle de bordure
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Dessiner les lignes reliant les points
    if (colors.length > 1) {
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      for (let i = 0; i < colors.length - 1; i++) {
        const pos1 = getPositionForColor(colors[i], centerX, centerY, radius);
        const pos2 = getPositionForColor(colors[i + 1], centerX, centerY, radius);

        if (pos1 && pos2) {
          ctx.beginPath();
          ctx.moveTo(pos1.x, pos1.y);
          ctx.lineTo(pos2.x, pos2.y);
          ctx.stroke();
        }
      }

      // Relier le dernier au premier pour fermer la boucle si plus de 2 couleurs
      if (colors.length > 2) {
        const posFirst = getPositionForColor(colors[0], centerX, centerY, radius);
        const posLast = getPositionForColor(colors[colors.length - 1], centerX, centerY, radius);

        if (posFirst && posLast) {
          ctx.beginPath();
          ctx.moveTo(posFirst.x, posFirst.y);
          ctx.lineTo(posLast.x, posLast.y);
          ctx.stroke();
        }
      }

      ctx.setLineDash([]);
    }

    // Dessiner les points pour chaque couleur
    colors.forEach((color, index) => {
      const pos = getPositionForColor(color, centerX, centerY, radius);
      if (!pos) return;

      // Cercle extérieur (bordure)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 10, 0, 2 * Math.PI);
      ctx.fill();

      // Cercle intérieur (couleur)
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 8, 0, 2 * Math.PI);
      ctx.fill();

      // Bordure pour le point sélectionné
      if (selectedIndex === index) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 12, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });
  }, [colors, size, centerX, centerY, radius, selectedIndex]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Vérifier si on clique sur un point existant
      let clickedOnPoint = false;
      for (let i = 0; i < colors.length; i++) {
        const pos = getPositionForColor(colors[i], centerX, centerY, radius);
        if (pos) {
          const dx = x - pos.x;
          const dy = y - pos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 15) {
            // Clic sur un point existant - juste le sélectionner
            if (externalSelectedIndex === undefined) {
              setInternalSelectedIndex(i);
            }
            onColorSelect(colors[i], i);
            clickedOnPoint = true;
            break;
          }
        }
      }

      // Si on n'a pas cliqué sur un point, sélectionner/mettre à jour une couleur
      if (!clickedOnPoint) {
        const color = getColorAtPosition(x, y, centerX, centerY, radius);
        // Si un index est sélectionné, mettre à jour cette couleur
        // Sinon, ajouter une nouvelle couleur (géré par le parent)
        onColorSelect(color);
      }
    },
    [centerX, centerY, radius, onColorSelect, colors, externalSelectedIndex]
  );

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        onClick={handleCanvasClick}
        className="cursor-crosshair rounded-full border border-gray-200 dark:border-gray-700 shadow-sm"
        style={{ touchAction: 'none' }}
      />
      <div className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
        {t('modules.design.gradientGenerator.colorWheelDescription')}
      </div>
    </div>
  );
};

