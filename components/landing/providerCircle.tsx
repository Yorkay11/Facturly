import { useMemo } from "react";
import { FaMobileScreen } from "react-icons/fa6";
import { ProviderLogo } from "./provider-logo";

const ProvidersCircle = ({ providers, t }: { providers: { name: string; logo: string; alt: string }[], t: any }) => {
  const radius = 38; // en %, relatif au container (ajusté pour les logos plus grands)
  const center = 50; // 50% = centre

  const positionedProviders = useMemo(() => {
    return providers.map((provider, index) => {
      const angle = (index * 360) / providers.length - 90;
      const rad = (angle * Math.PI) / 180;

      const x = center + radius * Math.cos(rad);
      const y = center + radius * Math.sin(rad);

      return {
        ...provider,
        x,
        y,
        delay: index * 0.2,
      };
    });
  }, [providers]);

  return (
    <div className="mb-16">
      <h3 className="text-2xl md:text-3xl font-semibold text-center mb-16">
        {t("providers.title")}
      </h3>

      <div className="flex justify-center">
        <div className="relative w-full max-w-[500px] aspect-square">

          {/* Centre */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full 
              bg-gradient-to-br from-primary/20 to-primary/10 
              border border-primary/30 
              flex items-center justify-center 
              backdrop-blur-sm shadow-lg">
              <FaMobileScreen className="h-5 w-5 md:h-7 md:w-7 text-primary" />
            </div>
          </div>

          {/* Providers */}
          {positionedProviders.map((provider, index) => (
            <div
              key={index}
              className="absolute group animate-float-provider"
              style={{
                left: `${provider.x}%`,
                top: `${provider.y}%`,
                transform: "translate(-50%, -50%)",
                animationDelay: `${provider.delay}s`,
              }}
            >
              <div className="w-20 h-20 md:w-28 md:h-28 
                rounded-xl border-2 border-border 
                bg-card/90 backdrop-blur-sm
                hover:border-primary/50 
                hover:shadow-lg hover:shadow-primary/10
                hover:scale-110
                transition-all duration-300
                p-1.5 md:p-2 flex items-center justify-center">
                
                <div className="w-full h-full flex items-center justify-center rounded-lg bg-white dark:bg-muted/50 group-hover:bg-white/90 dark:group-hover:bg-muted/70 transition-colors">
                  <ProviderLogo
                    src={provider.logo}
                    alt={provider.alt}
                    name={provider.name}
                  />
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-12">
        {t("providers.more")}
      </p>
    </div>
  );
};

export default ProvidersCircle;