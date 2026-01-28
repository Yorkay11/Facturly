"use client";

import CircularGallery from "@/components/ui/circular-gallery";
import type { CircularGalleryItem } from "@/components/ui/circular-gallery";

interface Provider {
  name: string;
  logo: string;
  alt: string;
  badge?: string;
}

interface PaymentMethodsGalleryProps {
  providers: Provider[];
  className?: string;
  height?: string;
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  scrollSpeed?: number;
  scrollEase?: number;
}

export function PaymentMethodsGallery({
  providers,
  className = "",
  height = "400px",
  bend = 3,
  textColor = "#ffffff",
  borderRadius = 0.05,
  scrollSpeed = 2,
  scrollEase = 0.05,
}: PaymentMethodsGalleryProps) {
  // Convertir les providers en format CircularGalleryItem
  const galleryItems: CircularGalleryItem[] = providers.map((provider) => ({
    image: provider.logo,
    text: provider.name,
  }));

  // Fallback vers des images placeholder si les vraies images ne sont pas disponibles
  const itemsWithFallback: CircularGalleryItem[] = galleryItems.map((item, index) => ({
    ...item,
    // Utiliser des images placeholder si les vraies images ne sont pas disponibles
    // On vérifie si l'image commence par /images/ et si elle existe potentiellement
    image: item.image.startsWith('/images/') && !item.image.includes('undefined')
      ? item.image
      : `https://picsum.photos/seed/payment-${index}/800/600?grayscale`,
  }));

  return (
    <div className={className} style={{ height, position: 'relative' }}>
      <CircularGallery
        items={itemsWithFallback}
        bend={bend}
        textColor={textColor}
        borderRadius={borderRadius}
        scrollSpeed={scrollSpeed}
        scrollEase={scrollEase}
      />
    </div>
  );
}
