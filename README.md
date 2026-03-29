# Survivor Forge — Discord Role Icon Generator

**EN** | [ES](#es-generador-de-iconos-de-rol-para-discord)

---

Run locally with `npm install && npm run dev` — open `http://localhost:5173`.

A browser tool to create Discord role icons for FiveM RP servers. Pick an icon, style it, and export as PNG or animated GIF.

**What you can do:**
- Choose from thousands of icons across 7 categories (Staff, Zombie, Prestige, Police, Military, EMS, Criminal)
- 14 quick presets (Admin, VIP Gold, Survivor, Narco, Booster…)
- Solid, gradient or transparent backgrounds
- Effects: Glow, Neon, Shadow, Stroke outline
- Rotate and flip the icon
- Animated GIF export with 7 animations (Pulse, Neon Flare, Spin, Rainbow, Breathe, Shake, Shimmer)
- Export PNG at 64 / 128 / 256 px or copy directly to clipboard
- Live Discord preview — chat view and member list

> GIF role icons require Discord server Boost Level 3.

---

## ES — Generador de iconos de rol para Discord

Ejecuta con `npm install && npm run dev` — abre `http://localhost:5173`.

Herramienta local para crear iconos de rol de Discord para servidores FiveM RP. Elige un icono, personalízalo y expórtalo como PNG o GIF animado.

**Qué puedes hacer:**
- Miles de iconos en 7 categorías (Staff, Zombie, Prestigio, Policía, Militar, EMS, Criminal)
- 14 presets rápidos (Admin, VIP Gold, Survivor, Narco, Booster…)
- Fondos sólidos, degradados o transparentes
- Efectos: Glow, Neon, Sombra, Contorno
- Rotar y voltear el icono
- Exportar GIF animado con 7 animaciones (Pulse, Neon Flare, Spin, Rainbow, Breathe, Shake, Shimmer)
- Exportar PNG a 64 / 128 / 256 px o copiar al portapapeles
- Preview real de Discord — vista de chat y lista de miembros

> Los iconos de rol GIF requieren Boost Nivel 3 en el servidor de Discord.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
