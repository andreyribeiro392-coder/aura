# AuraFit - Guia de Deploy e Uso

## 🚀 Como fazer o deploy

### Opção 1: Firebase Hosting (Recomendado)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### Opção 2: Vercel
```bash
npm install -g vercel
npm run build
vercel --prod
```

### Opção 3: Netlify
- Arraste a pasta `dist/` para netlify.com/drop

---

## 🔑 Configurações importantes

### Firebase
O projeto já está configurado com o Firebase do projeto `cybergym-fbba9`.
As credenciais estão em `src/services/firebase.js`.

### PIX
- Chave configurada: `97a0035e-8fcf-42f5-9f33-2cf184db987f` (Nubank)
- QR Code gerado automaticamente via BR Code / EMV
- Valor: R$ 9,99

---

## 💎 Sistema de Pagamento PRO

### Como funciona:
1. Usuário escaneia o QR Code Pix e paga R$ 9,99
2. Usuário informa o código de confirmação (últimos 4 dígitos do comprovante)
3. O sistema registra o pagamento como "pending" no Firestore
4. **O admin precisa aprovar manualmente** no Firebase Console:
   - Acesse: Firestore → `payments` → [uid do usuário]
   - Altere `status` de `"pending"` para `"approved"`
5. Após aprovação, o usuário clica em "Já Paguei" novamente e o PRO é ativado

### Segurança:
- ✅ O PRO NUNCA é ativado sem confirmação manual do admin
- ✅ Dados bancários do admin são privados no Firestore
- ✅ Usuários não têm acesso às configurações de pagamento

---

## 👤 Conta Admin
- Email: `andreybribeiro392@gmail.com`
- Acesso ao painel de produtos na Loja
- Acesso ao painel de dados bancários

---

## 🛠️ Desenvolvimento local
```bash
npm install
npm run dev
```
Acesse: http://localhost:5173

---

## 📱 Funcionalidades
- ✅ QR Code Pix funcional (Nubank)
- ✅ Design sofisticado modo escuro/claro
- ✅ Favicon de peso de academia
- ✅ Treinos detalhados com dicas
- ✅ Cronômetro crescente e regressivo
- ✅ Pagamento PRO bloqueado até confirmação
- ✅ Erros de senha amigáveis
- ✅ React 18 (suporta 18+ usuários simultâneos via Firebase)
