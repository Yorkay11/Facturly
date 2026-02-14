"use client";

import { FaWhatsapp } from "react-icons/fa";
import { cn } from "@/lib/utils";

interface WhatsAppMessagePreviewProps {
  message: string;
  companyName?: string;
  className?: string;
}

export function WhatsAppMessagePreview({
  message,
  companyName,
  className,
}: WhatsAppMessagePreviewProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Mockup de téléphone */}
      <div className="mx-auto w-full max-w-[280px] bg-slate-900 rounded-[2.5rem] p-2 shadow-2xl">
        {/* Barre de statut du téléphone */}
        <div className="bg-slate-900 rounded-t-[2rem] px-4 pt-3 pb-2">
          <div className="flex items-center justify-between text-white text-[10px] font-medium">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 border border-white rounded-sm">
                <div className="w-3 h-1.5 bg-white rounded-sm m-0.5" />
              </div>
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>
          </div>
        </div>

        {/* Écran du téléphone */}
        <div className="bg-[#e5ddd5] rounded-b-[2rem] overflow-hidden" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%23d4d4d4' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grid)'/%3E%3C/svg%3E")`,
        }}>
          {/* En-tête WhatsApp */}
          <div className="bg-[#075e54] px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center">
              <FaWhatsapp className="h-5 w-5 text-[#075e54]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold truncate">
                {companyName || "Client"}
              </div>
              <div className="text-[#b2f5ea] text-[10px]">en ligne</div>
            </div>
          </div>

          {/* Corps de la conversation */}
          <div className="px-3 py-4 space-y-2 min-h-[200px]">
            {/* Message envoyé (facture) */}
            <div className="flex justify-end">
              <div className="max-w-[75%]">
                <div className="bg-[#dcf8c6] rounded-lg px-3 py-2 shadow-sm">
                  <div className="text-[11px] text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {message}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1 mt-1 px-1">
                  <span className="text-[9px] text-slate-500">9:42</span>
                  <svg
                    className="w-3 h-3 text-[#34b7f1]"
                    fill="currentColor"
                    viewBox="0 0 16 15"
                  >
                    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm-1.138-1.138L13.227 1.64 4.846 8.932l.652-.999Z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Indicateur de lecture (double check bleu) */}
            <div className="flex justify-end px-1">
              <div className="flex items-center gap-1">
                <svg
                  className="w-3 h-3 text-[#34b7f1]"
                  fill="currentColor"
                  viewBox="0 0 16 15"
                >
                  <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm-1.138-1.138L13.227 1.64 4.846 8.932l.652-.999Z" />
                </svg>
                <svg
                  className="w-3 h-3 text-[#34b7f1]"
                  fill="currentColor"
                  viewBox="0 0 16 15"
                >
                  <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm-1.138-1.138L13.227 1.64 4.846 8.932l.652-.999Z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Barre de navigation inférieure */}
          <div className="bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-4 text-slate-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l1.703 8.424a1 1 0 01-.54 1.06l-.89.49A8 8 0 1015.98 5.09l.89-.49a1 1 0 00.54-1.06l-1.703-8.424A1 1 0 0014.153 2H12a1 1 0 00-1 1v.268A8 8 0 002 3z" />
              </svg>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 mx-3">
              <div className="bg-slate-100 rounded-full px-4 py-2 text-xs text-slate-500">
                Message
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#075e54] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
