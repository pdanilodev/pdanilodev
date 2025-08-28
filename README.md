# ProjectOS — Frontend v1

Kanban + workspace inspirado em Notion/Trello. Feito com **React + TypeScript + Vite + Tailwind**.

## Rodar localmente

```bash
npm i
npm run dev
```

Abrirá em `http://localhost:5173`.

## Build
```bash
npm run build && npm run preview
```

## Principais libs
- @dnd-kit/core, @dnd-kit/sortable — drag & drop
- framer-motion — microinterações
- recharts — gráfico de pizza
- lucide-react — ícones
- tailwindcss — estilos

## Estrutura
- `src/App.tsx` — UI principal (boards, cards, analytics)
- `src/main.tsx` — bootstrap React
- `src/index.css` — Tailwind

Próximos passos sugeridos: páginas de projeto (docs), calendário e comentários em tempo real.
