# Bingoo Cartelas

Organizador de cartelas de bingo gratuito e open source. Cadastre suas cartelas copiando da cartela fisica, marque as pedras sorteadas em tempo real e acompanhe automaticamente quem esta mais perto de ganhar.

Aplicacao 100% frontend — sem backend, sem cadastro, sem internet. Tudo roda no navegador com persistencia local. Funciona offline como PWA instalavel.

## Como usar

### Opcao 1: Usar online

Acesse [bingoo.app.br](https://www.bingoo.app.br) no navegador e comece a usar imediatamente. Nenhuma instalacao necessaria.

### Opcao 2: Instalar como app (PWA)

1. Abra o Bingoo no navegador (Chrome, Edge ou Safari)
2. Clique no icone de instalacao na barra de endereco (ou menu > "Instalar app" / "Adicionar a tela inicial")
3. O Bingoo aparece como app no seu Dock, Desktop ou tela inicial do celular
4. Funciona 100% offline apos a primeira carga

### Opcao 3: Rodar localmente

Requisito: [Node.js](https://nodejs.org/) 18+

```bash
git clone https://github.com/squad4tech/bingoo.git
cd bingoo
npm install
npm run dev
```

Acesse `http://localhost:5173`.

Para testar no celular (mesma rede Wi-Fi):

```bash
npm run dev -- --host
```

Acesse `http://<ip-do-computador>:5173` no navegador do celular.

### Build de producao

```bash
npm run build
```

Os arquivos estaticos sao gerados em `dist/`. Pode servir com qualquer servidor web (nginx, Apache, Vercel, Netlify) ou localmente:

```bash
npx serve dist
```

## Funcionalidades

### Cadastro de cartelas
- Selecao coluna-a-coluna (B, I, N, G, O) por clique — sem digitar numeros
- Suporta 75 pedras (5x5) e 90 pedras (3x9)
- Centro FREE opcional no formato 5x5
- Categorias: regulares e extras (premiacao separada) com abas independentes
- Importar/exportar cartelas como JSON para transferir entre dispositivos

### Jogo
- Teclado numerico proprio (nao abre teclado nativo no celular)
- Marcacao automatica em todas as cartelas ao informar o numero sorteado
- Marcacao manual por clique em qualquer celula (visual diferenciado: verde = sorteada, azul = manual)
- Desfazer ultima pedra ou reiniciar jogo mantendo as cartelas
- Historico organizado por colunas B/I/N/G/O com cores distintas
- No mobile, historico acessivel por bottom sheet com abas por coluna

### Deteccao de vitoria
- Condicoes configuraveis: linha completa, coluna completa ou cartela cheia
- Multiplas condicoes ativas simultaneamente
- Ranking dinamico: cartelas se reordenam por proximidade de vitoria
- Destaque visual para cartelas "quentes" (faltam poucos numeros)
- Explosao de confetes e fanfarra sonora ao bater BINGO

### Configuracoes
- Tema claro, escuro ou automatico (segue o sistema)
- Sons ligaveis/desligaveis (marcacao, desfazer, BINGO)
- Diferenciar visualmente marcacao por sorteio vs manual
- Importar e exportar cartelas

## Layout

- **Desktop (Full HD 1920px)** — sidebar fixa com controles e historico, ate 15 cartelas visiveis em grid 5x3, scroll independente
- **Laptop (MacBook Air 1440px)** — layout otimizado, sidebar compacta, 3-4 colunas de cartelas
- **Mobile** — teclado numerico proprio, controles no topo (vitoria + historico lado a lado), cartelas empilhadas com scroll

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- Web Audio API (efeitos sonoros sem arquivos)
- Canvas API (animacao de confetes)
- vite-plugin-pwa (service worker via Workbox)

## Estrutura do projeto

```
src/
├── types/index.ts             Tipos (Card, Cell, WinRule, AppSettings)
├── utils/
│   ├── game.ts                Logica de jogo, validacao, deteccao de vitoria
│   ├── storage.ts             Leitura/escrita em localStorage
│   └── sounds.ts              Efeitos sonoros via Web Audio API
├── hooks/
│   └── useGame.ts             Hook central de estado do jogo
├── components/
│   ├── CardForm.tsx            Cadastro/edicao de cartelas (fluxo em 3 passos)
│   ├── BingoCard.tsx           Visualizacao compacta de uma cartela
│   ├── CalledNumberPanel.tsx   Teclado numerico + painel de marcacao
│   ├── GameHistory.tsx         Historico por colunas (desktop) e bottom sheet (mobile)
│   ├── WinConfig.tsx           Configuracao de condicao de vitoria
│   ├── Confetti.tsx            Animacao de confetes em canvas
│   └── Settings.tsx            Tema, som, importar/exportar, creditos
└── App.tsx                     Layout principal responsivo
```

## Licenca

Este projeto e software livre e open source, distribuido sob a licenca [MIT](LICENSE).

Voce pode usar, copiar, modificar, distribuir e ate vender — sem restricoes. Basta manter o aviso de copyright.

## Propriedade

Desenvolvido por **Squad4Tech** — [squad4tech.com.br](https://www.squad4tech.com.br/)

CNPJ: 66.661.864/0001-62

Todos os direitos reservados. Uso livre.
