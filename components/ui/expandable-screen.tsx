"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { X } from "lucide-react"
import { AnimatePresence, LayoutGroup, motion } from "motion/react"

// Context
interface ExpandableScreenContextValue {
  isExpanded: boolean
  expand: () => void
  collapse: () => void
  layoutId: string
  triggerRadius: string
  contentRadius: string
  animationDuration: number
  /** Applied to the trigger's morph layer so the expanding shape is visible (e.g. "bg-primary") */
  triggerMorphClassName?: string
}

const ExpandableScreenContext =
  createContext<ExpandableScreenContextValue | null>(null)

function useExpandableScreen() {
  const context = useContext(ExpandableScreenContext)
  if (!context) {
    throw new Error(
      "useExpandableScreen must be used within an ExpandableScreen"
    )
  }
  return context
}

// Root Component
interface ExpandableScreenProps {
  children: ReactNode
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandChange?: (expanded: boolean) => void
  layoutId?: string
  triggerRadius?: string
  contentRadius?: string
  animationDuration?: number
  lockScroll?: boolean
  /** ClassName for the trigger's morph layer (e.g. "bg-primary") so the transition is visible */
  triggerMorphClassName?: string
}

export function ExpandableScreen({
  children,
  expanded: controlledExpanded,
  defaultExpanded = false,
  onExpandChange,
  layoutId = "expandable-card",
  triggerRadius = "100px",
  contentRadius = "24px",
  animationDuration = 0.3,
  lockScroll = true,
  triggerMorphClassName,
}: ExpandableScreenProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
  const isControlled = controlledExpanded !== undefined
  const isExpanded = isControlled ? controlledExpanded : internalExpanded

  const expand = () => {
    if (!isControlled) setInternalExpanded(true)
    onExpandChange?.(true)
  }

  const collapse = () => {
    if (!isControlled) setInternalExpanded(false)
    onExpandChange?.(false)
  }

  useEffect(() => {
    if (lockScroll) {
      if (isExpanded) {
        document.body.style.overflow = "hidden"
      } else {
        document.body.style.overflow = "unset"
      }
    }
  }, [isExpanded, lockScroll])

  return (
    <LayoutGroup id={layoutId}>
      <ExpandableScreenContext.Provider
        value={{
          isExpanded,
          expand,
          collapse,
          layoutId,
          triggerRadius,
          contentRadius,
          animationDuration,
          triggerMorphClassName,
        }}
      >
        {children}
      </ExpandableScreenContext.Provider>
    </LayoutGroup>
  )
}

// Trigger Component
interface ExpandableScreenTriggerProps {
  children: ReactNode
  className?: string
}

export function ExpandableScreenTrigger({
  children,
  className = "",
}: ExpandableScreenTriggerProps) {
  const {
    isExpanded,
    expand,
    layoutId,
    triggerRadius,
    animationDuration,
    triggerMorphClassName,
  } = useExpandableScreen()

  return (
    <AnimatePresence initial={false}>
      {!isExpanded && (
        <motion.div
          className={`inline-block relative ${className}`}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Layer with layoutId: position/size = button. Must be same position as clickable area so morph starts from button. */}
          <motion.div
            style={{
              borderRadius: triggerRadius,
            }}
            layout
            layoutId={layoutId}
            transition={{
              type: "spring",
              damping: 22,
              stiffness: 160,
              mass: 1,
            }}
            className={`absolute inset-0 transform-gpu will-change-transform ${triggerMorphClassName ?? ""}`}
          />
          {/* Clickable layer above — no layout so layoutId layer drives the morph from this position */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            layout={false}
            onClick={expand}
            className="relative cursor-pointer z-[1]"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Content Component
interface ExpandableScreenContentProps {
  children: ReactNode
  className?: string
  showCloseButton?: boolean
  closeButtonClassName?: string
}

export function ExpandableScreenContent({
  children,
  className = "",
  showCloseButton = true,
  closeButtonClassName = "",
}: ExpandableScreenContentProps) {
  const { isExpanded, collapse, layoutId, contentRadius, animationDuration } =
    useExpandableScreen()

  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <div className="fixed inset-0 z-[110] p-3 sm:p-2">
          {/* Morphing panel: layoutId makes it animate FROM trigger position/size TO this full area */}
          <motion.div
            layoutId={layoutId}
            transition={{
              type: "spring",
              damping: 22,
              stiffness: 160,
              mass: 1,
            }}
            style={{
              borderRadius: contentRadius,
            }}
            layout
            className={`relative flex h-full w-full overflow-y-auto transform-gpu will-change-transform ${className}`}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="relative z-20 w-full"
            >
              {children}
            </motion.div>

            {showCloseButton && (
              <motion.button
                onClick={collapse}
                className={`absolute right-6 top-6 z-30 flex h-10 w-10 items-center justify-center transition-colors rounded-full ${
                  closeButtonClassName ||
                  "text-white bg-transparent hover:bg-white/10"
                }`}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </motion.button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Background Component (optional)
interface ExpandableScreenBackgroundProps {
  trigger?: ReactNode
  content?: ReactNode
  className?: string
}

export function ExpandableScreenBackground({
  trigger,
  content,
  className = "",
}: ExpandableScreenBackgroundProps) {
  const { isExpanded } = useExpandableScreen()

  if (isExpanded && content) {
    return <div className={className}>{content}</div>
  }

  if (!isExpanded && trigger) {
    return <div className={className}>{trigger}</div>
  }

  return null
}

export { useExpandableScreen }
