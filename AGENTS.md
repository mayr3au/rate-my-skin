# Documentation technique - RateMySkin

## §1. Présentation générale du projet
RateMySkin est une application web d'analyse de peau et de recommandation de routines de soin personnalisées, s'appuyant sur une base de données de produits cosmétiques gérée via Supabase.

---

## §2. Stack technique
* **Framework principal** : Next.js (version `^14.2.35`)
* **Framework UI** : React / React DOM (version `^18.3.1`)
* **Routage** : **Pages Router** (confirmé par la structure du projet avec le dossier `pages/` et l'absence de dossier `app/`)
* **TypeScript** : Non utilisé. Il s'agit d'un projet configuré en pur JavaScript (pas de fichier `tsconfig.json` à la racine, fichiers en `.js`/`.jsx`)
* **Hébergement & Serverless** : Vercel (configuré via le fichier `vercel.json` définissant des limites d'exécution de 60s et 1024MB de mémoire pour les fonctions d'API)

---

## §3. Structure du projet
La structure réelle du projet s'articule comme suit :
* **Routes API** : Situées dans le répertoire [pages/api/](file:///c:/Users/mayre/OneDrive/Documents/RateMySkin/pages/api) (contenant notamment les routes de diagnostic, de paiement, de génération de PDF, de proxy d'images et d'analyse).
* **Composants UI** : Situés dans le répertoire [components/](file:///c:/Users/mayre/OneDrive/Documents/RateMySkin/components) (composants réutilisables comme `Navbar`, `MedicalDisclaimer`, `Logo` et le composant d'image `ProductImage.jsx`).
  * Les fichiers de rendu PDF de la routine de soin vivent sous [components/pdf/](file:///c:/Users/mayre/OneDrive/Documents/RateMySkin/components/pdf).
* **Helpers Supabase** : Situés dans le fichier [lib/supabase.js](file:///c:/Users/mayre/OneDrive/Documents/RateMySkin/lib/supabase.js), qui exporte `createAdminClient` (client admin côté serveur) et `getSupabaseClient` (client standard).
* **Types** : Aucun dossier ni fichier de types (projet en pur JavaScript).
* **Gestion d'état** :
  * L'état de la langue (locale) est géré de façon globale via React Context dans [lib/LangContext.jsx](file:///c:/Users/mayre/OneDrive/Documents/RateMySkin/lib/LangContext.jsx).
  * Les autres états de l'application (comme l'analyse active, l'état de la caméra, etc.) sont gérés de manière locale dans les composants ou les pages à l'aide de hooks d'état standards (`useState`, `useEffect`).

---

## §4. Commandes et Déploiement
* **Commandes de scripts (`package.json`)** :
  * Mode développement : `npm run dev`
  * Build de production : `npm run build`
  * Démarrage en production : `npm run start`
  * Linting : Aucun outil ni commande de linting n'est configuré dans le projet.
* **Branche de déploiement Vercel** : Les déploiements automatiques de production Vercel sont déclenchés par les commits sur la branche **`master`** (confirmé par la configuration Git locale et distante `origin/master`).

---

## §5. Base de données et Slots de routine

> [!WARNING]
> **TEST ≠ PROD** : Le catalogue de test local ([lib/catalog.js](file:///c:/Users/mayre/OneDrive/Documents/RateMySkin/lib/catalog.js) / [products_seed.sql](file:///c:/Users/mayre/OneDrive/Documents/RateMySkin/supabase/products_seed.sql), 27 produits) n'est pas identique au catalogue de production (46 produits FR, identifiants sous forme d'UUID). Toute logique sur `routine_step` ou les caractéristiques des produits doit être validée directement sur la base de données Supabase de production, et jamais sur le seed.
> 
> *Exemples concrets :*
> - Le re-tagging de `oil_cleanser` et `exfoliant` initié localement s'est avéré inutile car ces produits étaient déjà correctement typés en production.
> - Le correctif sur le slot `spf` vs `sunscreen` a dû être re-validé sur la base de production pour s'assurer que les valeurs de la base de données réelle correspondent bien.

### 1. Liste des tables principales et colonnes clés
* **`users`** : Gère le suivi et la facturation des utilisateurs.
  * *Colonnes clés* : `id` (text, PRIMARY KEY), `analyses_used` (integer), `paid_credits` (integer), `paid_unlocks` (integer), `email` (text).
* **`analyses`** : Stocke les résultats d'analyses de peau générés par l'IA.
  * *Colonnes clés* : `id` (uuid, PRIMARY KEY, par défaut `gen_random_uuid()`), `user_id` (text, référence facultative), `skin_concern` (text), `report_json` (jsonb), `is_paid` (boolean), `email` (text).
* **`newsletter`** : Capture les e-mails des utilisateurs intéressés.
  * *Colonnes clés* : `id` (bigserial, PRIMARY KEY), `email` (text, UNIQUE), `created_at` (timestamptz).
* **`products`** : Catalogue de produits skincare recommandables.
  * *Colonnes clés* : `id` (uuid, PRIMARY KEY, par défaut `gen_random_uuid()`), `brand` (text), `product_name` (text, NOT NULL), `routine_step` (text), `skin_types` (text[]), `concerns` (text[]), `actives` (text[]), `rating` (numeric), `price_range` (text), `image_url` (text), `skin_problem` (text).
* **`rate_limits`** : Gère la limitation du nombre de requêtes.
  * *Colonnes clés* : `ip` (text, PRIMARY KEY), `count` (int), `window_start` (timestamptz).
* **`security_logs`** : Journal d'événements de sécurité et de blocage.
  * *Colonnes clés* : `id` (uuid, PRIMARY KEY), `ip` (text), `event` (text), `details` (jsonb), `created_at` (timestamptz).

### 2. Valeurs canoniques EXACTES pour les slots de routine

#### En Base de données (`products_seed.sql`)
La colonne `routine_step` de la table `products` utilise exclusivement les valeurs canoniques suivantes pour catégoriser les produits :
1. **`cleanser`** (ex : CeraVe Hydrating Cleanser, Bioderma Créaline H2O)
2. **`toner`** (ex : Paula's Choice 2% BHA, The Ordinary Glycolic Acid 7%)
3. **`serum`** (ex : The Ordinary Niacinamide 10%, SkinCeuticals C E Ferulic)
4. **`moisturizer`** (ex : CeraVe Moisturising Cream, Avene Cicalfate+)
5. **`sunscreen`** (ex : La Roche-Posay Anthelios SPF50+, Beauty of Joseon SPF50+)
6. **`mask`** (ex : Laneige Water Sleeping Mask, Caudalie Vinergetic C+)
7. **`eye`** (ex : The Inkey List Caffeine Eye Cream, CeraVe Eye Repair Cream)

#### Dans le Code (`lib/productFilter.js`)
Les routines générées filtrent les produits sur la base de slots précis :
* **Matin (morning)** :
  * `cleanser` -> attend un produit avec `routine_step: 'cleanser'`
  * `serum` -> attend un produit avec `routine_step: 'serum'`
  * `moisturizer` -> attend un produit avec `routine_step: 'moisturizer'`
  * `sunscreen` -> attend un produit avec `routine_step: 'sunscreen'`
* **Soir (evening)** :
  * `oil_cleanser` -> attend un produit avec `routine_step: 'oil_cleanser'`
  * `cleanser` -> attend un produit avec `routine_step: 'cleanser'`
  * `treatment` -> attend un produit avec `routine_step: 'serum'` (alias `expectedRoutineStep: 'serum'`)
  * `moisturizer` -> attend un produit avec `routine_step: 'moisturizer'`
* **Hebdomadaire (weekly)** :
  * `exfoliant` -> attend un produit avec `routine_step: 'exfoliant'` (ou `'toner'` de manière permissive)

### 3. Incohérences et ambiguïtés majeures identifiées
Des décalages stricts existaient entre les valeurs configurées dans le code de filtrage (`lib/productFilter.js`) et celles réellement insérées en base de données (`products_seed.sql`) :
1. **Le cas du slot `spf` (Résolu)** : Le code configurait précédemment le slot `spf` en exigeant `routine_step: 'spf'`. Ceci a été harmonisé : le slot et l'attendu sont passés à `sunscreen` pour correspondre à la valeur `sunscreen` de la table `products`.
2. **Le cas du slot `oil_cleanser`** : Le code filtre l'étape de double nettoyage avec `routine_step: 'oil_cleanser'`. En base, les huiles démaquillantes (comme le "Squalane Cleanser" de The Ordinary) sont simplement catégorisées sous `'cleanser'`. Aucun produit en base ne porte la valeur `'oil_cleanser'`.
3. **Le cas du slot `exfoliant`** : Le code recherche un produit avec `routine_step: 'exfoliant'`. En base, tous les produits exfoliants (exfoliants liquides BHA, solutions toniques à l'acide glycolique) sont catégorisés sous `'toner'`. Aucun produit en base ne porte la valeur `'exfoliant'`.

---

## §6. Sécurité et Limites de taux
La sécurité applicative s'appuie sur :
* Une table `rate_limits` stockant le nombre de requêtes par IP dans une fenêtre de temps glissante d'une heure.
* Un système de journalisation append-only `security_logs` pour consigner les événements suspects (blocages de requêtes, échecs captcha, dépassements de quota, violations CORS).

---

## §7. Gestion des images et Proxy
* **Chemin exact de la route proxy** : `/api/image-proxy` (géré par le fichier [pages/api/image-proxy.js](file:///c:/Users/mayre/OneDrive/Documents/RateMySkin/pages/api/image-proxy.js)).
* **Symptôme technique précis du problème d'affichage non résolu** :
  1. **Données de test fictives** : Dans les données simulées (mock data) de `pages/index.js` (par exemple pour l'affichage de l'historique de rapports/analyses), les produits utilisent des URLs d'images pointant vers le domaine fictif `https://votre-projet.supabase.co/storage/v1/object/public/products/...`.
  2. **Échec de résolution DNS & Timeout du proxy** : Le proxy d'images server-side `/api/image-proxy` intercepte ces requêtes et tente d'effectuer un `fetch` vers cette adresse. Le domaine étant fictif, la requête échoue suite à une erreur de résolution DNS ou un timeout de 8 secondes (géré par `AbortSignal.timeout(8000)`), renvoyant un statut d'erreur HTTP 500 ou 504.
  3. **Affichage du placeholder** : Côté client, le composant `ProductImage.jsx` détecte l'erreur de chargement de l'image via son gestionnaire `onError`, bascule son état local `error` à `true` et remplace le rendu de l'image par l'icône de secours `LuxuryFlower` SVG (sur fond crème `#F8F4ED`).
  4. **Pas de vérification préventive** : Le proxy n'a pas de mécanisme de détection ou de filtrage pour court-circuiter les requêtes vers des domaines fictifs connus (comme `votre-projet.supabase.co`) afin de renvoyer directement une image de remplacement locale ou générique sans attendre le timeout.

---

## §8. Service d'envoi d'e-mails
* **Service utilisé** : **Resend** (utilisé via son API HTTP sur `https://api.resend.com/emails` avec la clé d'API `RESEND_API_KEY`, configurée via la variable d'environnement `RESEND_API_KEY`).
* **Fonctionnement** : La route d'API [pages/api/send-email-report.js](file:///c:/Users/mayre/OneDrive/Documents/RateMySkin/pages/api/send-email-report.js) génère le rapport esthétique de peau au format PDF en arrière-plan, puis l'envoie en pièce jointe à l'adresse e-mail de l'utilisateur.

---

## §10. Événements de tracking (GA4) et Paramètres UTM

Pour préserver le fonctionnement du funnel de conversion et les analyses d'acquisition marketing, veillez à ne pas modifier ni supprimer les mécanismes de tracking suivants :

### 1. Liste des événements Google Analytics 4 (GA4)
Tous ces événements sont envoyés via la méthode standard globale `window.gtag('event', ...)` :

* **`questions_step_viewed`** (`pages/index.js`) :
  * *Déclencheur* : Lorsque le questionnaire optionnel (chips de préoccupations, âge, climat...) s'affiche à l'écran après la sélection d'une image.
  * *Paramètres* : `{ event_category: 'conversion_funnel', event_label: 'optional_questions_step' }`
* **`questions_skipped`** (`pages/index.js`) :
  * *Déclencheur* : Clic sur le bouton de saut (skip) de l'étape des questions optionnelles.
  * *Paramètres* : `{ event_category: 'conversion_funnel', event_label: 'optional_questions_step' }`
* **`score_viewed`** (`components/BeautyReport.jsx`) :
  * *Déclencheur* : Premier affichage du score de peau gratuit (une fois que les données du rapport de peau sont chargées côté client). Utilise une sécurité de session pour n'être déclenché qu'une seule fois par session (`rms_sent_score_viewed`).
  * *Paramètres* : `{ event_category: 'conversion_funnel', event_label: 'free_score_displayed' }`
* **`email_save_shown`** (`components/BeautyReport.jsx`) :
  * *Déclencheur* : Affichage de l'encart d'invitation à sauvegarder son e-mail (sur la vue gratuite du rapport, si l'e-mail n'est pas encore capturé ni ignoré). Unique par session via `rms_sent_email_save_shown`.
  * *Paramètres* : `{ event_category: 'conversion_funnel', event_label: 'soft_email_gate' }`
* **`email_save_submitted`** (`pages/report.js`) :
  * *Déclencheur* : Soumission valide et réussie de l'e-mail et du prénom par l'utilisateur via le formulaire du rapport.
  * *Paramètres* : `{ event_category: 'conversion_funnel', event_label: 'soft_email_gate' }`
* **`email_save_skipped`** (`pages/report.js`) :
  * *Déclencheur* : Clic sur le bouton de saut "Continuer sans sauvegarder" au niveau de l'encart de capture d'e-mail du rapport.
  * *Paramètres* : `{ event_category: 'conversion_funnel', event_label: 'soft_email_gate' }`
* **`paywall_viewed`** (`components/BeautyReport.jsx`) :
  * *Déclencheur* : Affichage du paywall Premium (une fois que le score gratuit est vu et que l'e-mail est soit capturé, soit ignoré). Unique par session via `rms_sent_paywall_viewed`.
  * *Paramètres* : `{ event_category: 'conversion_funnel', event_label: 'free_report_paywall' }`
* **`checkout_clicked`** (`components/BeautyReport.jsx`) :
  * *Déclencheur* : Clic sur un bouton d'action du paywall pour lancer le processus de paiement / redirection Stripe Checkout.
  * *Paramètres* : `{ event_category: 'conversion_funnel', event_label: 'paywall_cta', value: 7.99 }`
* **`checkout_abandoned`** (`components/BeautyReport.jsx`) :
  * *Déclencheur* : Événement intercepté via le listener de fermeture de page `beforeunload` si l'utilisateur a cliqué sur le bouton de paiement mais quitte l'application sans que le statut `isPaid` ne soit passé à `true`.
  * *Paramètres* : `{ event_category: 'conversion_funnel', event_label: 'after_checkout_click' }`

### 2. Capture des paramètres UTM
* **Fonctionnement** : Le script de base Google Tag Manager (`G-DMB015RX5X`) importé au niveau du point d'entrée global de l'application ([pages/_app.js](file:///c:/Users/mayre/OneDrive/Documents/RateMySkin/pages/_app.js)) capte automatiquement les paramètres UTM de l'URL (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`) lors de la navigation et les transmet à GA4 pour l'attribution des sessions.
* **Impact** : Aucun code personnalisé de capture des UTM n'est présent dans le répertoire `/pages/api/` ou dans la base de données (aucune colonne dédiée aux UTM dans les tables `users` ou `analyses`), le tracking s'appuie à 100 % sur le fonctionnement par défaut de la bibliothèque client `gtag.js`.

