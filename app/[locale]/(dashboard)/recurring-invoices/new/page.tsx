"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";

export default function NewRecurringInvoicePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/invoices/new?recurring=1");
  }, [router]);

  return null;
}
