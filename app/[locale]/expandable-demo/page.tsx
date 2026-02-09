"use client"

import {
  ExpandableScreen,
  ExpandableScreenContent,
  ExpandableScreenTrigger,
} from "@/components/ui/expandable-screen"

export default function ExpandableScreenDemo() {
  return (
    <ExpandableScreen
      layoutId="cta-card"
      triggerRadius="100px"
      contentRadius="24px"
      triggerMorphClassName="bg-primary"
    >
      <div className="flex min-h-screen items-center justify-center">
        <ExpandableScreenTrigger>
          <button className="bg-primary px-6 py-3 text-primary-foreground rounded-full">
            Open Screen
          </button>
        </ExpandableScreenTrigger>
      </div>

      <ExpandableScreenContent className="bg-primary">
        <div className="flex h-full items-center justify-center p-8">
          <h2 className="text-4xl text-primary-foreground">
            Full Screen Content
          </h2>
        </div>
      </ExpandableScreenContent>
    </ExpandableScreen>
  )
}
