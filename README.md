# 🚀 Marketplace Futurista - Vercel Ready

Um marketplace futurista com design glassmorphism, tema escuro e neon, totalmente otimizado para Vercel.

## ✨ Características

- ✅ Design futurista com glassmorphism
- ✅ Tema escuro com acentos neon (cyan, blue, purple)
- ✅ 12 categorias de produtos
- ✅ Produtos em destaque com avaliações
- ✅ Painel administrativo
- ✅ Responsivo para todos os dispositivos
- ✅ 100% compatível com Vercel
- ✅ Next.js 14 + React 18
- ✅ Tailwind CSS 3

## 🚀 Deploy Rápido no Vercel

### Opção 1: Via GitHub (Recomendado)

1. **Faça push para GitHub:**
```bash
git init
git add .
git commit -m "Initial commit: Marketplace Futurista"
git branch -M main
git remote add origin https://github.com/seu-usuario/marketplace-futurista.git
git push -u origin main
```

2. **Deploy no Vercel:**
   - Acesse https://vercel.com
   - Clique em "New Project"
   - Selecione seu repositório do GitHub
   - Clique em "Deploy"
   - Pronto! 🎉

### Opção 2: Via CLI do Vercel

```bash
# Instale o Vercel CLI
npm i -g vercel

# Faça deploy
vercel
```

## 💻 Executar Localmente

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Passos

1. **Instale as dependências:**
```bash
npm install
```

2. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```

3. **Abra no navegador:**
```
http://localhost:3000
```

## 📁 Estrutura do Projeto

```
marketplace-vercel/
├── app/
│   ├── components/
│   │   ├── Navigation.tsx
│   │   └── Footer.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── vercel.json
```

## 🔧 Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Inicie servidor de produção
npm start

# Lint do código
npm run lint
```

## 🎨 Customização

### Cores
Edite `tailwind.config.js` para mudar as cores:
```js
colors: {
  'neon-cyan': '#00ffcc',
  'neon-blue': '#0080ff',
  'neon-purple': '#a855f7',
}
```

### Fontes
Edite `app/globals.css` para adicionar Google Fonts:
```css
@import url('https://fonts.googleapis.com/css2?family=...');
```

## 🌐 Variáveis de Ambiente

Se precisar de variáveis de ambiente, crie um arquivo `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://api.example.com
```

## 📱 Responsividade

O projeto é totalmente responsivo:
- ✅ Mobile (320px+)
- ✅ Tablet (768px+)
- ✅ Desktop (1024px+)

## 🐛 Troubleshooting

### "Port 3000 already in use"
```bash
npm run dev -- -p 3001
```

### Build falha no Vercel
- Verifique se todos os imports estão corretos
- Certifique-se de usar `'use client'` em componentes interativos
- Verifique se não há erros de TypeScript: `npm run build`

### Imagens não aparecem
- Todas as imagens usam emojis (Unicode)
- Se quiser adicionar imagens reais, coloque-as em `/public` e use `<Image>` do Next.js

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Vercel Docs](https://vercel.com/docs)
- [React Docs](https://react.dev)

## 📝 Licença

MIT - Sinta-se livre para usar e modificar este projeto!

---

**Desenvolvido com ❤️ para Vercel**

Aproveite seu novo marketplace futurista! 🎉
