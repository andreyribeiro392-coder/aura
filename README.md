# Marketplace Futurista 🚀

Um e-commerce moderno e futurista construído com React, TypeScript, Express, tRPC e Tailwind CSS. Apresenta um design glassmorphism com tema escuro, assistente de IA integrado, e um painel administrativo exclusivo.

## Características Principais

### 🛍️ Storefront Público
- **Hero Section**: Banner atrativo com chamada para ação
- **12 Categorias**: Alimentos, Roupas, Acessórios, Ferramentas, Tecnologia, Games, Beleza, Casa & Decoração, Esportes, Pets, Livros, Automotivo
- **Produtos em Destaque**: Seção de produtos recomendados
- **Promoções**: Banner de promoções especiais
- **Busca Avançada**: Busca por palavra-chave com filtros de categoria e faixa de preço
- **Navegação Responsiva**: Funciona perfeitamente em desktop, tablet e mobile

### 🛒 Sistema de Carrinho
- Adicionar/remover produtos
- Controle de quantidade
- Cálculo automático de subtotal
- Resumo de compra

### ❤️ Sistema de Favoritos
- Salvar produtos para depois
- Acesso rápido aos favoritos
- Apenas para usuários logados

### 👤 Autenticação
- Manus OAuth integrado
- Controle de acesso baseado em funções (admin/user)
- Sessões seguras com cookies

### ⚙️ Painel Administrativo
- **Acesso Exclusivo**: Apenas andreyribeiro392@gmail.com
- **Gerenciamento de Produtos**: Adicionar, editar e deletar produtos
- **Upload de Imagens**: Suporte para imagens de produtos
- **Gerenciamento de Categorias**: Criar e editar categorias
- **Dashboard**: Visualização de produtos cadastrados

### 🤖 Assistente de IA
- Chat widget flutuante
- Recomendações de produtos
- Comparação de produtos
- Respostas a dúvidas sobre compras, entrega, pagamento e políticas

### 🎨 Design Futurista
- **Glassmorphism**: Efeito de vidro com blur e transparência
- **Tema Escuro**: Fundo escuro com acentos neon (cyan, azul, roxo)
- **Animações Suaves**: Transições e efeitos visuais refinados
- **Responsivo**: Layout adaptável para todos os tamanhos de tela

## Stack Tecnológico

### Frontend
- **React 19**: Framework UI
- **TypeScript**: Type safety
- **Tailwind CSS 4**: Styling
- **Wouter**: Roteamento leve
- **tRPC**: Type-safe API calls
- **Lucide React**: Ícones

### Backend
- **Express 4**: Framework web
- **tRPC 11**: API RPC type-safe
- **Node.js**: Runtime

### Banco de Dados
- **MySQL/TiDB**: Banco de dados relacional
- **Drizzle ORM**: Query builder type-safe

### Autenticação
- **Manus OAuth**: Autenticação segura

## Instalação e Setup

### Pré-requisitos
- Node.js 22+
- pnpm 10+

### Passos de Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/marketplace-futurista.git
cd marketplace-futurista
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Configure as variáveis de ambiente**
```bash
# Crie um arquivo .env.local com as variáveis necessárias
# As variáveis do Manus OAuth são injetadas automaticamente
```

4. **Execute as migrações do banco de dados**
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

5. **Inicie o servidor de desenvolvimento**
```bash
pnpm dev
```

O site estará disponível em `http://localhost:3000`

## Deployment

### GitHub
1. Faça push do código para o GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/seu-usuario/marketplace-futurista.git
git branch -M main
git push -u origin main
```

### Vercel
1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente no Vercel:
   - `DATABASE_URL`: String de conexão MySQL
   - `JWT_SECRET`: Chave secreta para JWT
   - Outras variáveis do Manus OAuth

3. Deploy automático ao fazer push para `main`

## Estrutura do Projeto

```
marketplace-futurista/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── lib/           # Utilitários e configurações
│   │   ├── contexts/      # React contexts
│   │   ├── App.tsx        # Componente raiz
│   │   └── index.css      # Estilos globais
│   └── index.html
├── server/                # Backend Express
│   ├── routers.ts         # Definição de rotas tRPC
│   ├── db.ts              # Funções de banco de dados
│   ├── storage.ts         # Utilitários de armazenamento
│   └── _core/             # Configurações internas
├── drizzle/               # Migrações e schema do banco
│   ├── schema.ts          # Definição de tabelas
│   └── migrations/        # Arquivos de migração SQL
├── shared/                # Código compartilhado
├── package.json
└── README.md
```

## Páginas Principais

- **`/`**: Homepage com hero, categorias e promoções
- **`/categoria/:slug`**: Catálogo de produtos por categoria
- **`/produto/:id`**: Detalhes do produto
- **`/carrinho`**: Carrinho de compras
- **`/favoritos`**: Produtos favoritos (requer login)
- **`/search`**: Busca avançada com filtros
- **`/admin`**: Painel administrativo (apenas para admin)

## Funcionalidades do Admin

### Acesso
- Email: `andreyribeiro392@gmail.com`
- Acesso automático ao fazer login com este e-mail

### Operações
- **Adicionar Produto**: Preencher formulário com nome, preço, categoria, descrição e imagem
- **Editar Produto**: Modificar informações de produtos existentes
- **Deletar Produto**: Remover produtos do catálogo
- **Gerenciar Categorias**: Criar e editar categorias

## Autenticação

O projeto usa Manus OAuth para autenticação segura. O fluxo é:

1. Usuário clica em "Fazer Login"
2. Redirecionado para portal Manus
3. Após autenticação, retorna com token seguro
4. Sessão criada com cookie httpOnly

## Variáveis de Ambiente

```env
# Banco de Dados
DATABASE_URL=mysql://user:password@host:3306/database

# JWT
JWT_SECRET=sua-chave-secreta-aqui

# OAuth Manus
VITE_APP_ID=seu-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Proprietário
OWNER_NAME=Seu Nome
OWNER_OPEN_ID=seu-open-id

# APIs Internas
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=sua-chave-api
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.im
VITE_FRONTEND_FORGE_API_KEY=sua-chave-frontend

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=seu-id-website
```

## Desenvolvimento

### Adicionar Nova Página
1. Crie um arquivo em `client/src/pages/NomePagina.tsx`
2. Adicione a rota em `client/src/App.tsx`
3. Importe e use componentes reutilizáveis

### Adicionar Nova Tabela
1. Defina a tabela em `drizzle/schema.ts`
2. Execute `pnpm drizzle-kit generate`
3. Revise o SQL gerado em `drizzle/migrations/`
4. Execute a migração via Manus
5. Adicione funções de query em `server/db.ts`
6. Crie procedures em `server/routers.ts`

### Estilo
- Use classes Tailwind CSS
- Reutilize componentes de `client/src/components/ui/`
- Siga o design glassmorphism com classe `.glass`

## Performance

- **Lazy Loading**: Componentes carregados sob demanda
- **Otimização de Imagens**: Suporte a múltiplos formatos
- **Cache**: Estratégia de cache inteligente
- **Compressão**: Assets comprimidos automaticamente

## Segurança

- ✅ Autenticação segura com Manus OAuth
- ✅ Cookies httpOnly para sessões
- ✅ CSRF protection
- ✅ SQL injection prevention (Drizzle ORM)
- ✅ XSS protection (React escaping)
- ✅ Controle de acesso baseado em funções

## Suporte

Para dúvidas ou problemas:
1. Verifique a documentação do Manus
2. Consulte os logs em `.manus-logs/`
3. Abra uma issue no GitHub

## Licença

MIT

## Autor

Marketplace Futurista - 2026

---

**Desenvolvido com ❤️ usando Manus**
