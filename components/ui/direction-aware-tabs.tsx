"use client"

import { ReactNode, useMemo, useState } from "react"
import { AnimatePresence, motion, MotionConfig } from "motion/react"
import useMeasure from "react-use-measure"

import { cn } from "@/lib/utils"

type Tab = {
  id: number
  label: ReactNode
  content: ReactNode
}

interface DirectionAwareTabsProps {
  tabs: Tab[]
  className?: string
  rounded?: string
  /** Controlled: active tab id */
  value?: number
  /** Controlled: called when tab changes */
  onValueChange?: (id: number) => void
  onChange?: () => void
}

function DirectionAwareTabs({
  tabs,
  className,
  rounded,
  value,
  onValueChange,
  onChange,
}: DirectionAwareTabsProps) {
  const [internalTab, setInternalTab] = useState(value ?? 0)
  const isControlled = value !== undefined
  const activeTab = isControlled ? value : internalTab
  const [direction, setDirection] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [ref, bounds] = useMeasure()

  const content = useMemo(() => {
    const tab = tabs.find((t) => t.id === activeTab)
    return tab?.content ?? null
  }, [activeTab, tabs])

  const handleTabClick = (newTabId: number) => {
    if (newTabId === activeTab || isAnimating) return
    const newDirection = newTabId > activeTab ? 1 : -1
    setDirection(newDirection)
    if (!isControlled) setInternalTab(newTabId)
    onValueChange?.(newTabId)
    onChange?.()
  }

  const variants = {
    initial: (direction: number) => ({
      x: 300 * direction,
      opacity: 0,
      filter: "blur(4px)",
    }),
    active: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
    },
    exit: (direction: number) => ({
      x: -300 * direction,
      opacity: 0,
      filter: "blur(4px)",
    }),
  }

  return (
    <div className="flex flex-col w-full">
      <div
        className={cn(
          "flex space-x-1 rounded-full p-[3px] bg-muted border border-border/80 w-fit ",
          className,
          rounded
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              "relative rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex gap-2 items-center",
              activeTab === tab.id
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
              rounded
            )}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {activeTab === tab.id && (
              <motion.span
                layoutId="bubble"
                className="absolute inset-0 z-10 rounded-full bg-primary shadow-sm"
                style={rounded ? { borderRadius: 9 } : { borderRadius: 9999 }}
                transition={{ type: "spring", bounce: 0.19, duration: 0.4 }}
              />
            )}

            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>
      <MotionConfig transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}>
        <motion.div
          className="relative w-full overflow-hidden"
          initial={false}
          animate={{ height: bounds.height }}
        >
          <div className="p-1" ref={ref}>
            <AnimatePresence
              custom={direction}
              mode="popLayout"
              onExitComplete={() => setIsAnimating(false)}
            >
              <motion.div
                key={activeTab}
                variants={variants}
                initial="initial"
                animate="active"
                exit="exit"
                custom={direction}
                onAnimationStart={() => setIsAnimating(true)}
                onAnimationComplete={() => setIsAnimating(false)}
              >
                {content}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </MotionConfig>
    </div>
  )
}
export { DirectionAwareTabs }
