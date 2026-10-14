# MienthyKaya — portfolio

Portfolio statique de Yao Mienthy Elidad Reuel, développeur web basé à Abidjan.

## Ouvrir le site

Ouvrir `index.html` dans un navigateur moderne, ou utiliser un serveur statique.

## Contenu

- scène héro 3D interactive au pointeur ;
- animations au défilement et mode reduced-motion ;
- carrousel de compétences 3D interactif créé avec React (souris, tactile, clic et clavier) ;
- logos officiels de Java, JavaScript, C++, PHP, Python, Firebase, Vercel, Render, Supabase, React et Angular ;
- stack motion : TypeScript, GSAP, Three.js, Framer Motion, WebGL, SVG et CSS ;
- projets publics GitHub : BARDEUR YK, Mon Exam et FX Pro 2026 ;
- liens de contact directs et formulaire qui prépare un e-mail dans le client local ;
- métadonnées Open Graph et données structurées pour le référencement.

## Architecture

Le front publié sur GitHub Pages reste volontairement léger : HTML sémantique, CSS, JavaScript et une composante React chargée en module pour le carrousel 3D. L’API Python/FastAPI est disponible dans [api/](api/) pour un déploiement séparé sur Render.

Le formulaire tente d’abord la route /api/contact. Sur GitHub Pages, où une API Python ne peut pas être exécutée, il ouvre proprement l’application e-mail du visiteur. Après déploiement de l’API, configurer CONTACT_DELIVERY_URL comme webhook de livraison sécurisé.

## Notes

L’illustration du héros est une création CSS originale à l’esthétique manga ; elle ne représente aucun personnage existant. Les liens de démonstration ne sont affichés que pour les démos contrôlées comme accessibles. Les icônes de technologies sont chargées depuis les CDN Simple Icons et Devicon : une connexion internet est donc nécessaire pour les afficher.
