"use client";

import { FaWhatsapp } from "react-icons/fa";
import { cn } from "@/lib/utils";

interface WhatsAppMessagePreviewProps {
  message: string;
  companyName?: string;
  className?: string;
}

const PHONE_WIDTH = 280;
const SCREEN_RADIUS = 28;

/** Icône double check (lu) WhatsApp */
function DoubleCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("w-3.5 h-3.5", className)} fill="currentColor" viewBox="0 0 16 15">
      <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm-1.138-1.138L13.227 1.64 4.846 8.932l.652-.999Z" />
    </svg>
  );
}

export function WhatsAppMessagePreview({
  message,
  companyName,
  className,
}: WhatsAppMessagePreviewProps) {
  return (
    <div
      className={cn("flex justify-center", className)}
      style={{ minWidth: PHONE_WIDTH + 24 }}
    >
      {/* Cadre : un seul bloc sombre, ombre douce */}
      <div
        className="flex-shrink-0 rounded-[2rem] p-1 bg-black"
        style={{
          width: PHONE_WIDTH,
          minWidth: PHONE_WIDTH,
          boxShadow: "0 25px 60px -15px rgba(0,0,0,0.4), 0 12px 30px -10px rgba(0,0,0,0.3)",
        }}
      >
        {/* Écran */}
        <div
          className="overflow-hidden rounded-[2rem] bg-black"
          style={{ borderRadius: SCREEN_RADIUS }}
        >
          {/* Petite encoche type iPhone */}
          <div className="h-6 flex justify-center pt-1.5 pb-0.5">
            <div className="w-20 h-5 rounded-full bg-black" />
          </div>

          {/* Contenu : WhatsApp */}
          <div
            className="flex flex-col rounded-b-[2rem] overflow-hidden"
            style={{
              minHeight: 380,
              backgroundColor: "#e5ddd5",
            }}
          >
            {/* Barre WhatsApp */}
            <div className="bg-[#075e54] px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                <FaWhatsapp className="h-6 w-6 text-[#075e54]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-semibold text-[15px] truncate">
                  {companyName || "Client"}
                </p>
                <p className="text-[#a8e6dc] text-[12px]">en ligne</p>
              </div>
            </div>

            {/* Conversation */}
            <div className="flex-1 px-3 pt-4 pb-2 flex flex-col justify-end min-h-[200px]">
              <div className="flex justify-end">
                <div className="max-w-[88%] min-w-[120px]">
                  <div className="bg-[#dcf8c6] rounded-lg rounded-tr-sm px-3.5 py-2.5">
                    <p className="text-[13px] text-slate-800 whitespace-pre-wrap leading-relaxed break-words">
                      {message}
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-1 pr-0.5">
                    <span className="text-[11px] text-slate-500">9:42</span>
                    <DoubleCheckIcon className="text-[#34b7f1]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Champ de saisie */}
            <div className="bg-white px-3 py-2.5 flex items-center gap-2 border-t border-slate-200/80">
              <div className="flex-1 rounded-full bg-slate-100 py-2 px-4 text-[13px] text-slate-500">
                Message
              </div>
              <div className="w-9 h-9 rounded-full bg-[#075e54] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
