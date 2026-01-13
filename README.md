# Aide-moi

Application web React + Vite + TypeScript pour soumettre un probleme et recevoir une aide via un webhook n8n.

## Stack
- React 18 + Vite + TypeScript
- UI moderne, responsive, accessible
- Aucun framework UI externe

## Prerequis
- Node.js 18+
- npm

## Installation
```bash
npm install
```

## Lancer en local
```bash
npm run dev
```
Puis ouvrir http://localhost:3000

## Build
```bash
npm run build
```

## Configuration du webhook
Le webhook est configure dans `src/App.tsx` via la constante `WEBHOOK_URL`.
Modifie cette valeur si ton endpoint change.

## Fonctionnement
- Saisie du sujet et de la description.
- Envoi en POST JSON.
- Affichage de la reponse du webhook (champ "Voici la solution a votre probleme").
