"use client"

export function FooterSection() {
  return (
    <footer className="w-full max-w-[1320px] mx-auto px-5 flex flex-col md:flex-row justify-between items-start gap-8 md:gap-0 py-10 md:py-[70px]">
      {/* Left Section: Logo, Description */}
      <div className="flex flex-col justify-start items-start gap-4 p-4 md:p-8">
        <div className="text-foreground text-xl font-semibold">Facturly</div>
        <p className="text-foreground/90 text-sm font-medium leading-[18px] text-left max-w-sm">
          Facturation simple & intelligente
        </p>
      </div>
      {/* Right Section: Links */}
      <div className="grid grid-cols-2 gap-8 md:gap-12 p-4 md:p-8 w-full md:w-auto">
        <div className="flex flex-col justify-start items-start gap-3">
          <h3 className="text-muted-foreground text-sm font-medium leading-5">Produit</h3>
          <div className="flex flex-col justify-end items-start gap-2">
            <a href="#features-section" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Fonctionnalités
            </a>
            <a href="#pricing-section" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Tarifs
            </a>
          </div>
        </div>
        <div className="flex flex-col justify-start items-start gap-3">
          <h3 className="text-muted-foreground text-sm font-medium leading-5">Légal</h3>
          <div className="flex flex-col justify-center items-start gap-2">
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Conditions d'utilisation
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              Politique de confidentialité
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
