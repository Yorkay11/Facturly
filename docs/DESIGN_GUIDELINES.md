# Ligne de conduite design — Style premium Apple

Ce document définit la direction visuelle et UX de Facturly : **un style épuré, premium, inspiré d’Apple**. À appliquer de façon cohérente sur toutes les pages et composants.

---

## Principes généraux

- **Clarté** : hiérarchie lisible, pas de surcharge visuelle.
- **Espace** : beaucoup de blanc, marges et paddings généreux.
- **Doux** : bordures et ombres légères, pas de traits ou ombres dures.
- **Cohérence** : mêmes patterns (cartes, listes, boutons) partout.

---

## Mise en page

- **Largeur** : privilégier le plein écran (`w-full`) avec padding horizontal confortable (`px-4 sm:px-6`), sauf cas où une largeur max améliore la lisibilité (formulaires denses).
- **Espacement vertical** : sections espacées (`space-y-8` à `space-y-10`), blocs internes aérés (`p-6 sm:p-8`).
- **Fond** : léger dégradé ou fond neutre doux (`bg-gradient-to-b from-muted/30 to-background` ou `bg-muted/30`) pour donner de la profondeur sans attirer l’œil.

---

## Typographie

- **Titres** : `font-semibold`, `tracking-tight`. Grand titre de page en `text-3xl` à `text-4xl`.
- **Labels / catégories** : petits, en majuscules, `tracking-widest`, `text-muted-foreground` (ex. « PRIX HT », « DESCRIPTION »).
- **Corps** : `text-[15px]` ou `text-base`, `leading-relaxed` pour le texte long.
- **Secondaire** : `text-muted-foreground` pour sous-titres et infos secondaires.

---

## Cartes et blocs

- **Conteneurs** : `rounded-2xl`, bordure légère `border border-border/50`, fond légèrement translucide `bg-card/50`, `shadow-sm`, `backdrop-blur-sm`.
- **Éviter** : bordures épaisses, ombres marquées, `rounded-lg` trop petits sur les grands blocs.

---

## Boutons et actions

- **Actions secondaires** : `variant="outline"` ou `variant="ghost"`, souvent en forme pill `rounded-full`, taille modérée (`h-9`, `px-4`).
- **Boutons outline** : `border-border/80`, `bg-background/80`, `shadow-sm`, `backdrop-blur-sm` pour un rendu léger et premium.
- **Destructif** : `variant="ghost"` + `text-destructive` + `hover:bg-destructive/10`, pas de gros bouton rouge sauf confirmation.

---

## Listes (type iOS)

- **Conteneur** : carte avec `rounded-2xl`, en-tête séparé par `border-b border-border/50`.
- **Lignes** : `divide-y divide-border/50`, chaque ligne cliquable avec `hover:bg-muted/30`, `active:bg-muted/50`, padding confortable (`px-5 py-4`).
- **Indication de navigation** : chevron à droite (`ChevronRight`) en `text-muted-foreground/60`.

---

## Badges et états

- **Badges** : discrets, `variant="secondary"`, `text-[11px]` ou `text-xs`, `uppercase`, `tracking-wider`, pour type/catégorie.
- **Pas de** badges colorés voyants sauf pour statuts critiques (erreur, alerte).

---

## Formulaires et modales

- **Champs** : hauteur confortable (`h-10` ou `h-11`), `rounded-lg`, bordures douces, focus ring discret (`focus-visible:ring-primary/40`).
- **Modales** : `rounded-2xl` ou équivalent, padding généreux, titres et descriptions bien hiérarchisés (titre + description courte).

---

## Résumé des classes « signature »

À réutiliser pour garder la cohérence :

| Usage           | Classes type |
|-----------------|--------------|
| Page / section  | `min-h-screen bg-gradient-to-b from-muted/30 to-background` |
| Conteneur page  | `w-full px-4 py-8 sm:px-6 sm:py-10` |
| Carte premium   | `rounded-2xl border border-border/50 bg-card/50 shadow-sm backdrop-blur-sm p-6 sm:p-8` |
| Titre section   | `text-sm font-semibold uppercase tracking-widest text-muted-foreground` |
| Bouton pill     | `rounded-full border-border/80 ... shadow-sm backdrop-blur-sm` |
| Ligne liste     | `hover:bg-muted/30 active:bg-muted/50 px-5 py-4` |

---

En cas de doute sur une nouvelle page ou un nouveau composant, s’appuyer sur la **page détail prestation** (`app/[locale]/(dashboard)/items/[id]/page.tsx`) comme référence d’implémentation de ce style.
