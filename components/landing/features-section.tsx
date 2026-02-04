"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import createGlobe from "cobe";
import { motion } from "framer-motion";
import { FaYoutube } from "react-icons/fa6";
import Image from "next/image";
import { useTranslations } from "next-intl";

const BENTO_IMAGES = [
  "/images/bento/create-invoice.png",
  "/images/bento/clients.png",
  "/images/bento/payment.png",
  "/images/bento/fac.png",
  "/images/bento/recents.png",
];

function FeatureCard({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("p-4 sm:p-8 relative overflow-hidden", className)}>
      {children}
    </div>
  );
}

function FeatureTitle({ children }: { children?: React.ReactNode }) {
  return (
    <p className="max-w-5xl mx-auto text-left tracking-tight text-foreground text-xl md:text-2xl md:leading-snug">
      {children}
    </p>
  );
}

function FeatureDescription({ children }: { children?: React.ReactNode }) {
  return (
    <p
      className={cn(
        "text-sm md:text-base max-w-4xl text-left mx-auto",
        "text-muted-foreground font-normal",
        "text-left max-w-sm mx-0 md:text-sm my-2"
      )}
    >
      {children}
    </p>
  );
}

function SkeletonOne() {
  return (
    <div className="relative flex py-8 px-2 gap-10 h-full">
      <div className="w-full p-5 mx-auto bg-card shadow-2xl group h-full rounded-lg border border-border">
        <div className="flex flex-1 w-full h-full flex-col space-y-2">
          <div className="relative aspect-[4/3] w-full rounded-md overflow-hidden">
            <Image
              src="/images/bento/create-invoice.png"
              alt="Facture"
              fill
              className="object-cover object-left-top"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 z-40 inset-x-0 h-60 bg-gradient-to-t from-background via-background/80 to-transparent w-full pointer-events-none" />
      <div className="absolute top-0 z-40 inset-x-0 h-60 bg-gradient-to-b from-background via-transparent to-transparent w-full pointer-events-none" />
    </div>
  );
}

const STACK_ROTATIONS = [-6, 4, -8, 2, 5];

function SkeletonTwo() {
  const imageVariants = {
    whileHover: { scale: 1.1, rotate: 0, zIndex: 100 },
    whileTap: { scale: 1.1, rotate: 0, zIndex: 100 },
  };
  return (
    <div className="relative flex flex-col items-start p-8 gap-10 h-full overflow-hidden">
      <div className="flex flex-row -ml-20">
        {BENTO_IMAGES.map((src, idx) => (
          <motion.div
            variants={imageVariants}
            key={"img-a-" + idx}
            style={{ rotate: STACK_ROTATIONS[idx % STACK_ROTATIONS.length] }}
            whileHover="whileHover"
            whileTap="whileTap"
            className="rounded-xl -mr-4 mt-4 p-1 bg-card border border-border shrink-0 overflow-hidden shadow-sm"
          >
            <div className="relative h-20 w-20 md:h-40 md:w-40 rounded-lg overflow-hidden">
              <Image
                src={src}
                alt=""
                fill
                className="object-cover shrink-0"
                sizes="160px"
              />
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex flex-row">
        {BENTO_IMAGES.map((src, idx) => (
          <motion.div
            key={"img-b-" + idx}
            style={{ rotate: STACK_ROTATIONS[(idx + 2) % STACK_ROTATIONS.length] }}
            variants={imageVariants}
            whileHover="whileHover"
            whileTap="whileTap"
            className="rounded-xl -mr-4 mt-4 p-1 bg-card border border-border shrink-0 overflow-hidden shadow-sm"
          >
            <div className="relative h-20 w-20 md:h-40 md:w-40 rounded-lg overflow-hidden">
              <Image
                src={src}
                alt=""
                fill
                className="object-cover shrink-0"
                sizes="160px"
              />
            </div>
          </motion.div>
        ))}
      </div>
      <div className="absolute left-0 z-[100] inset-y-0 w-20 bg-gradient-to-r from-background to-transparent h-full pointer-events-none" />
      <div className="absolute right-0 z-[100] inset-y-0 w-20 bg-gradient-to-l from-background to-transparent h-full pointer-events-none" />
    </div>
  );
}

function SkeletonThree({ videoHref }: { videoHref: string }) {
  return (
    <a
      href={videoHref}
      target="_blank"
      rel="noopener noreferrer"
      className="relative flex gap-10 h-full group/image"
    >
      <div className="w-full mx-auto bg-transparent group h-full">
        <div className="flex flex-1 w-full h-full flex-col space-y-2 relative">
          <FaYoutube className="h-20 w-20 absolute z-10 inset-0 text-red-500 m-auto" />
          <div className="relative aspect-square w-full rounded-md overflow-hidden">
            <Image
              src="/images/dashboard-preview.png"
              alt="Vidéo"
              fill
              className="object-cover object-center rounded-md blur-none group-hover/image:blur-md transition-all duration-200"
              sizes="300px"
            />
          </div>
        </div>
      </div>
    </a>
  );
}

function Globe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;
    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.1, 0.8, 1],
      glowColor: [1, 1, 1],
      markers: [
        { location: [5.3600, -4.0083] as [number, number], size: 0.08 },
        { location: [14.7167, -17.4677] as [number, number], size: 0.07 },
        { location: [6.4541, 3.3947] as [number, number], size: 0.08 },
        { location: [5.6037, -0.187] as [number, number], size: 0.06 },
        { location: [12.6392, -8.0029] as [number, number], size: 0.05 },
        { location: [12.3714, -1.5197] as [number, number], size: 0.05 },
        { location: [6.3703, 2.3912] as [number, number], size: 0.05 },
        { location: [6.1375, 1.2123] as [number, number], size: 0.05 },
        { location: [13.5137, 2.1098] as [number, number], size: 0.05 },
        { location: [9.0579, 7.4951] as [number, number], size: 0.06 },
        { location: [3.848, 11.5021] as [number, number], size: 0.06 },
        { location: [0.4162, 9.4673] as [number, number], size: 0.05 },
        { location: [-4.2634, 15.2429] as [number, number], size: 0.05 },
        { location: [12.1348, 15.0557] as [number, number], size: 0.05 },
        { location: [4.3947, 18.5582] as [number, number], size: 0.05 },
      ],
      onRender: (state) => {
        state.phi = phi;
        phi += 0.01;
      },
    });

    return () => globe.destroy();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
      className={cn("pointer-events-none", className)}
      aria-hidden
    />
  );
}

function SkeletonFour() {
  return (
    <div className="h-60 md:h-60 flex flex-col items-center relative bg-transparent mt-10">
      <Globe className="absolute -right-10 md:-right-10 -bottom-80 md:-bottom-72" />
    </div>
  );
}

export function FeaturesSection() {
  const t = useTranslations("landing.featuresSection");
  const videoHref = "https://www.youtube.com/watch?v=RPa3_AD1_Vs";

  const features = [
    {
      title: t("card1.title"),
      description: t("card1.description"),
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 lg:col-span-4 border-b lg:border-r border-border",
    },
    {
      title: t("card2.title"),
      description: t("card2.description"),
      skeleton: <SkeletonTwo />,
      className: "border-b col-span-1 lg:col-span-2 border-border",
    },
    {
      title: t("card3.title"),
      description: t("card3.description"),
      skeleton: <SkeletonThree videoHref={videoHref} />,
      className: "col-span-1 lg:col-span-3 lg:border-r border-border",
    },
    {
      title: t("card4.title"),
      description: t("card4.description"),
      skeleton: <SkeletonFour />,
      className: "col-span-1 lg:col-span-3 border-b lg:border-none border-border",
    },
  ];

  return (
    <section
      id="features-section"
      className="relative z-20 py-10 lg:py-40 max-w-[1320px] mx-auto px-4 md:px-6 my-12 md:my-20"
    >
      <div className="px-0">
        <h2 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-foreground">
          {t("title")}
        </h2>
        <p className="text-sm lg:text-base max-w-2xl my-4 mx-auto text-muted-foreground text-center font-normal">
          {t("subtitle")}
        </p>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-6 mt-12 xl:border rounded-lg border-border">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className="h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </section>
  );
}
