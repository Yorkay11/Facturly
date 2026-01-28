"use client"

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaPlay,
  FaPause,
  FaVolumeHigh,
  FaVolumeOff,
  FaMaximize,
  FaXmark
} from 'react-icons/fa6'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface VideoItem {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: string
  videoUrl?: string
}

export function VideoCarousel() {
  const t = useTranslations('landing.videoCarousel')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [autoplay, setAutoplay] = useState(false)

  const videos: VideoItem[] = [
    {
      id: 'creation',
      title: t('videos.creation.title'),
      description: t('videos.creation.description'),
      thumbnail: '/images/demo/creation-thumbnail.jpg',
      duration: '0:45',
    },
    {
      id: 'whatsapp',
      title: t('videos.whatsapp.title'),
      description: t('videos.whatsapp.description'),
      thumbnail: '/images/demo/whatsapp-thumbnail.jpg',
      duration: '0:30',
    },
    {
      id: 'payment',
      title: t('videos.payment.title'),
      description: t('videos.payment.description'),
      thumbnail: '/images/demo/payment-thumbnail.jpg',
      duration: '0:40',
    },
    {
      id: 'dashboard',
      title: t('videos.dashboard.title'),
      description: t('videos.dashboard.description'),
      thumbnail: '/images/demo/dashboard-thumbnail.jpg',
      duration: '1:00',
    },
  ]

  const nextVideo = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length)
    setIsPlaying(false)
  }

  const prevVideo = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length)
    setIsPlaying(false)
  }

  const goToVideo = (index: number) => {
    setCurrentIndex(index)
    setIsPlaying(false)
  }

  useEffect(() => {
    if (autoplay && isPlaying) {
      const timer = setTimeout(() => {
        if (currentIndex < videos.length - 1) {
          nextVideo()
          setIsPlaying(true)
        } else {
          setIsPlaying(false)
          setAutoplay(false)
        }
      }, 3000) // Durée approximative de chaque vidéo

      return () => clearTimeout(timer)
    }
  }, [currentIndex, isPlaying, autoplay, videos.length])

  const currentVideo = videos[currentIndex]

  return (
    <section className="w-full py-10 sm:py-14 md:py-20 lg:py-24 px-4 sm:px-5 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4 px-1">
            {t('title')}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-snug">
            {t('subtitle')}
          </p>
        </div>

        {/* Main Carousel */}
        <div className="relative">
          {/* Video Player */}
          <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black border border-border/50 shadow-xl sm:shadow-2xl mb-5 sm:mb-6 md:mb-8 group">
            {/* Background avec gradient subtil */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
            
            {/* Thumbnail/Video */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentVideo.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="relative w-full h-full flex items-center justify-center"
              >
                {/* Placeholder élégant pour la vidéo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="group/play relative touch-manipulation"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all group-hover/play:bg-white/20 group-hover/play:border-white/30">
                      {isPlaying ? (
                        <FaPause className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white" />
                      ) : (
                        <FaPlay className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white ml-0.5 sm:ml-1" />
                      )}
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Video Controls Overlay - Toujours visible au tactile, hover sur desktop */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 sm:p-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <Button
                    onClick={() => setIsPlaying(!isPlaying)}
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-white/20 flex-shrink-0 touch-manipulation"
                  >
                    {isPlaying ? (
                      <FaPause className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    ) : (
                      <FaPlay className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-0.5" />
                    )}
                  </Button>
                  
                  <div className="flex-1 h-1.5 min-w-0 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: isPlaying ? '100%' : '0%' }}
                      transition={{ duration: 3, ease: 'linear' }}
                    />
                  </div>
                  
                  <span className="text-white/70 text-[10px] sm:text-xs font-mono min-w-[2rem] sm:min-w-[2.5rem] text-right flex-shrink-0">
                    {currentVideo.duration}
                  </span>
                </div>

                <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                  <Button
                    onClick={() => setIsMuted(!isMuted)}
                    size="icon"
                    variant="ghost"
                    className="text-white/80 hover:text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 rounded-full touch-manipulation"
                  >
                    {isMuted ? (
                      <FaVolumeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    ) : (
                      <FaVolumeHigh className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    )}
                  </Button>
                  <Button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    size="icon"
                    variant="ghost"
                    className="text-white/80 hover:text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 rounded-full touch-manipulation"
                  >
                    <FaMaximize className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Video Info - Plus compact sur mobile */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentVideo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="absolute top-2 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 md:right-auto md:max-w-md md:left-6 md:top-4"
              >
                <div className="bg-black/40 backdrop-blur-xl rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-white/10">
                  <h3 className="text-white font-semibold text-sm sm:text-base md:text-lg mb-1 sm:mb-1.5 leading-tight">
                    {currentVideo.title}
                  </h3>
                  <p className="text-white/70 text-[11px] sm:text-xs md:text-sm leading-relaxed line-clamp-2 sm:line-clamp-none">
                    {currentVideo.description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls - Plus compact sur mobile */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
            <Button
              onClick={prevVideo}
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 flex-shrink-0 touch-manipulation"
            >
              <FaChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            {/* Video Thumbnails - Scroll horizontal sur mobile */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 justify-center overflow-x-auto scrollbar-hide px-1 sm:px-4 py-2 -mx-1 sm:mx-0 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {videos.map((video, index) => (
                <motion.button
                  key={video.id}
                  onClick={() => goToVideo(index)}
                  className={cn(
                    "relative flex-shrink-0 w-20 h-14 sm:w-24 sm:h-16 md:w-28 md:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-300 snap-center touch-manipulation",
                    "active:scale-[0.98] sm:hover:scale-105 sm:hover:shadow-md",
                    currentIndex === index
                      ? "border-primary shadow-md scale-[1.02] sm:scale-105 ring-2 ring-primary/20"
                      : "border-border/50 opacity-70 sm:hover:opacity-100 sm:hover:border-primary/30"
                  )}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={cn(
                    "absolute inset-0 transition-colors",
                    currentIndex === index 
                      ? "bg-primary/10" 
                      : "bg-muted/50"
                  )} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={cn(
                      "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-colors",
                      currentIndex === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}>
                      <FaPlay className={cn(
                        "h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 ml-0.5 transition-colors",
                        currentIndex === index && "text-primary-foreground"
                      )} />
                    </div>
                  </div>
                  {currentIndex === index && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: isPlaying ? '100%' : '0%' }}
                      transition={{ duration: 3, ease: 'linear' }}
                    />
                  )}
                  <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1">
                    <span className="text-[9px] sm:text-[10px] font-mono text-muted-foreground bg-background/80 px-1 sm:px-1.5 py-0.5 rounded">
                      {video.duration}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

            <Button
              onClick={nextVideo}
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 flex-shrink-0 touch-manipulation"
            >
              <FaChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Video List - Cachée sur mobile (thumbnails + prev/next suffisent) */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {videos.map((video, index) => (
              <motion.button
                key={video.id}
                onClick={() => goToVideo(index)}
                className={cn(
                  "group relative p-4 rounded-xl border transition-all duration-300 text-left",
                  "hover:shadow-md hover:border-primary/30",
                  currentIndex === index
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/50 bg-card/50 hover:bg-card"
                )}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                    currentIndex === index
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}>
                    <FaPlay className={cn(
                      "h-4 w-4 ml-0.5 transition-colors",
                      currentIndex === index && "text-primary-foreground"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      "font-semibold mb-1.5 text-sm transition-colors leading-tight",
                      currentIndex === index ? "text-primary" : "text-foreground group-hover:text-primary"
                    )}>
                      {video.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">
                      {video.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                        {video.duration}
                      </span>
                      {currentIndex === index && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-[10px] text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded"
                        >
                          {t('playing')}
                        </motion.span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
