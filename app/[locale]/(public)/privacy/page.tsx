import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { Shield, Lock } from "lucide-react";
import { LegalPageHeader } from "@/components/layout/LegalPageHeader";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal.privacy');
  return {
    title: t('title'),
    description: t('description'),
  };
}

const sections = [
  'introduction',
  'collection',
  'usage',
  'protection',
  'sharing',
  'rights',
  'cookies',
  'thirdParty',
  'children',
  'changes',
  'contact',
] as const;

export default async function PrivacyPage() {
  const t = await getTranslations('legal.privacy');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <LegalPageHeader
        icon={<Shield className="h-4 w-4" />}
        lastUpdated={`${t('lastUpdated')}: ${t('lastUpdatedDate')}`}
        backToHome={t('backToHome')}
      />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Table of Contents - Sidebar */}
          <aside className="lg:col-span-1 order-2 lg:order-1">
            <div className="lg:sticky lg:top-24 pt-4 lg:pt-4">
              <nav className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
                  {t('tableOfContents')}
                </h3>
                <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-0">
                  {sections.map((section, index) => (
                    <a
                      key={section}
                      href={`#section-${index + 1}`}
                      className="block text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors py-1.5 lg:py-2 border-l-2 border-transparent hover:border-primary pl-3 lg:pl-4 rounded-md lg:rounded-none hover:bg-muted/50 lg:hover:bg-transparent"
                    >
                      {t(`sections.${section}.title`)}
                    </a>
                  ))}
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-card rounded-xl sm:rounded-2xl border shadow-sm overflow-hidden mt-20 sm:mt-0">
              {/* Title Section */}
              <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                    <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground">
                    {t('title')}
                  </h1>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed">
                  {t('sections.introduction.content')}
                </p>
              </div>

              {/* Content */}
              <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-8 sm:space-y-10 lg:space-y-12">
                {/* Data Collection */}
                <section id="section-2" className="scroll-mt-20 sm:scroll-mt-24">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                    <span className="text-primary font-mono text-base sm:text-lg">2.</span>
                    {t('sections.collection.title')}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                    {t('sections.collection.content')}
                  </p>
                  <ul className="space-y-2 sm:space-y-3 ml-4 sm:ml-8">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <li key={i} className="text-muted-foreground leading-relaxed flex items-start gap-3">
                        <span className="text-primary mt-1.5">•</span>
                        <span>{t(`sections.collection.types.${i}`)}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Data Usage */}
                <section id="section-3" className="scroll-mt-20 sm:scroll-mt-24">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                    <span className="text-primary font-mono text-base sm:text-lg">3.</span>
                    {t('sections.usage.title')}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                    {t('sections.usage.content')}
                  </p>
                  <ul className="space-y-2 sm:space-y-3 ml-4 sm:ml-8">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <li key={i} className="text-muted-foreground leading-relaxed flex items-start gap-3">
                        <span className="text-primary mt-1.5">•</span>
                        <span>{t(`sections.usage.purposes.${i}`)}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Data Protection */}
                <section id="section-4" className="scroll-mt-20 sm:scroll-mt-24">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                    <span className="text-primary font-mono text-base sm:text-lg">4.</span>
                    {t('sections.protection.title')}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                    {t('sections.protection.content')}
                  </p>
                  <ul className="space-y-2 sm:space-y-3 ml-4 sm:ml-8">
                    {[1, 2, 3, 4].map((i) => (
                      <li key={i} className="text-muted-foreground leading-relaxed flex items-start gap-3">
                        <span className="text-primary mt-1.5">•</span>
                        <span>{t(`sections.protection.measures.${i}`)}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Data Sharing */}
                <section id="section-5" className="scroll-mt-20 sm:scroll-mt-24">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                    <span className="text-primary font-mono text-base sm:text-lg">5.</span>
                    {t('sections.sharing.title')}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                    {t('sections.sharing.content')}
                  </p>
                  <ul className="space-y-2 sm:space-y-3 ml-4 sm:ml-8">
                    {[1, 2, 3, 4].map((i) => (
                      <li key={i} className="text-muted-foreground leading-relaxed flex items-start gap-3">
                        <span className="text-primary mt-1.5">•</span>
                        <span>{t(`sections.sharing.cases.${i}`)}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* User Rights */}
                <section id="section-6" className="scroll-mt-20 sm:scroll-mt-24">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                    <span className="text-primary font-mono text-base sm:text-lg">6.</span>
                    {t('sections.rights.title')}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                    {t('sections.rights.content')}
                  </p>
                  <ul className="space-y-2 sm:space-y-3 ml-4 sm:ml-8">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <li key={i} className="text-muted-foreground leading-relaxed flex items-start gap-3">
                        <span className="text-primary mt-1.5">•</span>
                        <span>{t(`sections.rights.list.${i}`)}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Cookies */}
                <section id="section-7" className="scroll-mt-20 sm:scroll-mt-24">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                    <span className="text-primary font-mono text-base sm:text-lg">7.</span>
                    {t('sections.cookies.title')}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                    {t('sections.cookies.content')}
                  </p>
                </section>

                {/* Third-Party Services */}
                <section id="section-8" className="scroll-mt-20 sm:scroll-mt-24">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                    <span className="text-primary font-mono text-base sm:text-lg">8.</span>
                    {t('sections.thirdParty.title')}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                    {t('sections.thirdParty.content')}
                  </p>
                  <ul className="space-y-2 sm:space-y-3 ml-4 sm:ml-8">
                    {[1, 2, 3].map((i) => (
                      <li key={i} className="text-muted-foreground leading-relaxed flex items-start gap-3">
                        <span className="text-primary mt-1.5">•</span>
                        <span>{t(`sections.thirdParty.services.${i}`)}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Children Privacy */}
                <section id="section-9" className="scroll-mt-20 sm:scroll-mt-24">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                    <span className="text-primary font-mono text-base sm:text-lg">9.</span>
                    {t('sections.children.title')}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                    {t('sections.children.content')}
                  </p>
                </section>

                {/* Changes to Policy */}
                <section id="section-10" className="scroll-mt-20 sm:scroll-mt-24">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                    <span className="text-primary font-mono text-base sm:text-lg">10.</span>
                    {t('sections.changes.title')}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                    {t('sections.changes.content')}
                  </p>
                </section>

                {/* Contact */}
                <section id="section-11" className="scroll-mt-20 sm:scroll-mt-24">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                    <span className="text-primary font-mono text-base sm:text-lg">11.</span>
                    {t('sections.contact.title')}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
                    {t('sections.contact.content')}
                  </p>
                  <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border">
                    <p className="text-foreground text-sm sm:text-base">
                      <span className="font-semibold">{t('sections.contact.email')}:</span>{' '}
                      <a href="mailto:privacy@facturly.online" className="text-primary hover:underline break-all">
                        privacy@facturly.online
                      </a>
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
