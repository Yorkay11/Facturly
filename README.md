# 🧾 Facturly

> **Facturation simple & intelligente** pour freelances et petites entreprises

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue?logo=react)](https://react.dev/)

---

## 🚀 Pourquoi Facturly ?

**Facturly** est la solution de facturation moderne qui vous fait gagner du temps et de l'argent. Créez des factures professionnelles en quelques clics, suivez vos paiements en temps réel et automatisez votre comptabilité.

### ✨ Ce qui rend Facturly unique

- ⚡ **Ultra rapide** - Créez une facture en moins de 2 minutes
- 🎨 **100% personnalisable** - Votre logo, vos couleurs, votre style
- 📱 **Mobile-first** - Gérez vos factures depuis n'importe où
- 💰 **Paiements en ligne** - Acceptez les paiements directement sur vos factures
- 🔔 **Rappels automatiques** - Ne perdez plus jamais un paiement
- 📊 **Tableaux de bord intelligents** - Visualisez vos revenus en un coup d'œil
- 🔒 **100% sécurisé** - Vos données sont protégées et chiffrées

---

## 🎯 Fonctionnalités principales

### 📄 Factures professionnelles
Créez des factures élégantes avec vos informations, votre logo et votre branding. Export PDF haute qualité, envoi par email automatique.

### 💳 Paiements en ligne
Intégrez des liens de paiement sécurisés directement sur vos factures. Vos clients paient en un clic.

### 📊 Suivi intelligent
Tableaux de bord avec graphiques, statistiques détaillées et alertes pour ne rien manquer.

### 🔔 Automatisation
Rappels automatiques, notifications en temps réel, sauvegarde automatique. Facturly travaille pour vous.

### 👥 Gestion clients
Carnet d'adresses complet, historique par client, import CSV/Excel en masse.

### 📦 Catalogue produits
Gérez votre catalogue de produits et services, réutilisez-les en un clic.

---

## 🛠 Tech Stack

**Frontend moderne** : Next.js 16 • React 18 • TypeScript • Tailwind CSS

**Architecture** : Redux Toolkit • RTK Query • React Hook Form • Zod

**UI/UX** : Radix UI • Framer Motion • Recharts • Sonner

---

## 🚀 Démarrage rapide

```bash
# Cloner le projet
git clone https://github.com/votre-username/facturly.git
cd facturly

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local

# Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### ⚙️ Configuration

Créez un fichier `.env.local` à partir de `.env.example` :

```env
# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# App URL (optionnel, pour les callbacks OAuth)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note** : Les variables d'environnement Moneroo (Mobile Money) sont configurées côté backend uniquement. Voir `facturly_backend/config/env.example` pour la configuration complète.

---

## 📦 Scripts

- `npm run dev` - Serveur de développement
- `npm run build` - Build de production
- `npm run start` - Serveur de production
- `npm run lint` - Vérification du code

---

## 🎨 Aperçu

### Dashboard moderne
Visualisez vos revenus, vos factures en attente et vos statistiques en temps réel.

### Création de factures intuitive
Interface drag & drop, ajout de produits en un clic, calcul automatique des totaux.

### Templates personnalisables
Plusieurs templates professionnels, personnalisables à 100% avec votre branding.

---

## 📚 Documentation

- [Documentation API](./docs/api-endpoints.md)
- [Guide d'utilisation](./docs/)
- [Plans tarifaires](./docs/pricing-plans.md)

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou soumettre une pull request.

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 📞 Support

- 📧 **Email** : support@facturly.online
- 📖 **Documentation** : [docs.facturly.online](https://docs.facturly.online)
- 🐛 **Issues** : [GitHub Issues](https://github.com/votre-username/facturly/issues)

---

## 📝 Licence

Ce projet est sous licence propriétaire. Tous droits réservés.

---

<div align="center">

**Fait avec ❤️ par l'équipe Facturly**

[🌐 Site web](https://facturly.online) • [📖 Documentation](https://docs.facturly.online) 

</div>
