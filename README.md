# HumiPay

App simple para gestionar pedidos por lotes de humitas (Netlify + Supabase).

## Requisitos
- Node 18+
- Cuenta Supabase (con las tablas/seguridad del SQL que te pasé)
- Variables de entorno en Netlify

## Variables
Crea un archivo `.env` (o configúralas en Netlify):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_PRICE_UNIT=3
VITE_CONTACT_NUMBER=992427070
```

## Instalar y correr
```bash
npm i
npm run dev
```

## Build
```bash
npm run build
```

Sube el repo a GitHub y conecta con Netlify. Directorio de build: `dist/`.
