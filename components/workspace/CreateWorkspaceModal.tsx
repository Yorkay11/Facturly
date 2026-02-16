"use client";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export function CreateWorkspaceModal({
  open,
  onOpenChange,
  isAdditionalWorkspace = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** True when user already has a workspace and is adding another (e.g. opened from sidebar). */
  isAdditionalWorkspace?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 [&>button]:right-4 [&>button]:top-4">
        <div className="p-6 sm:p-8">
          <OnboardingWizard
            workspace={null}
            onComplete={() => onOpenChange(false)}
            isAdditionalWorkspace={isAdditionalWorkspace}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
