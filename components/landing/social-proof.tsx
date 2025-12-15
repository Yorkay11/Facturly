import Image from "next/image"

export function SocialProof() {
  return (
    <section className="self-stretch py-16 flex flex-col justify-center items-center gap-6 overflow-hidden">
      <div className="text-center text-gray-300 text-sm font-medium leading-tight">
        Utilisé par des entreprises en pleine croissance
      </div>
      <div className="self-stretch flex items-center justify-center gap-8 flex-wrap">
        {Array.from({ length: 2 }).map((_, i) => (
          <Image
            key={i}
            src={`/logos/logo0${i + 1}.png`}
            alt={`Company Logo ${i + 1}`}
            width={200}
            height={60}
            className="w-full max-w-[150px] h-auto object-contain grayscale opacity-70"
          />
        ))}
      </div>
    </section>
  )
}
