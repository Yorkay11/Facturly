import { Button } from "@/components/ui/button";
import { DiamondPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <Button asChild>
        <Link href={"/createInvoice"} className="flex flex-row gap-2 items-center">
          <DiamondPlus className="h-4 w-4" color="white"/>
          <p className="text-xs">Créer une facture</p>
        </Link>
      </Button>
    </div>
  );
}
