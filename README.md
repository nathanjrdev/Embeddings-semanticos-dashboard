# Painel de Vetorizacao Semantica

Dashboard interativo em Next.js para demonstrar o pipeline completo de embeddings de texto:
chunking, geracao de vetores com a VoyageAI, normalizacao L2, reducao de dimensionalidade via
PCA e busca semantica por similaridade cosseno, com visualizacao interativa.

---

## Requisitos

- Node.js 18 ou superior
- Uma chave de API valida da [VoyageAI](https://www.voyageai.com)

---

## Instalacao

```bash
# Clone ou descompacte o projeto
cd voyage-embeddings-dashboard

# Instale as dependencias
npm install
```

---

## Configuracao

Copie o arquivo de exemplo e insira sua chave da VoyageAI:

```bash
cp .env.local.example .env.local
```

Edite `.env.local`:

```env
VOYAGE_API_KEY=sua_chave_aqui
```

A chave nunca e exposta ao navegador. Toda chamada a VoyageAI acontece exclusivamente
na API Route `app/api/embed/route.ts`, executada no servidor Next.js.

---

## Executando

```bash
# Desenvolvimento com hot reload
npm run dev

# Build de producao
npm run build
npm run start
```

Acesse `http://localhost:3000`.

---

## Como usar o sistema

### 1. Inserir o texto

Na secao "Texto de origem", cole qualquer texto corrido ou carregue um arquivo `.md`
usando o botao "Carregar arquivo .md". O contador de caracteres atualiza em tempo real.

**Recomendacao para demonstracoes:** use textos com pelo menos 1000 caracteres e temas
variados para que os chunks produzam vetores semanticamente distintos e o grafico fique
mais interessante.

### 2. Iniciar o pipeline

Clique em "Processar texto". O indicador de progresso no topo mostra a etapa atual:

```
01 Chunking  ->  02 Embedding  ->  03 Normalizacao L2  ->  04 Reducao PCA  ->  05 Visualizacao
```

### 3. Etapas automaticas

**Chunking (etapa 01)**
O texto e dividido em blocos de ate 600 caracteres respeitando paragrafos e
delimitadores de sentencas. Os blocos aparecem na lista "Blocos gerados" assim que sao
calculados.

**Embedding (etapa 02)**
Os textos de cada bloco sao enviados em lote para a API da VoyageAI (modelo `voyage-3`
por padrao). Os vetores retornados possuem 1024 dimensoes.

**Normalizacao L2 (etapa 03)**
Cada vetor e dividido pela sua propria norma euclidiana. A tabela "Normalizacao L2"
exibe, para cada bloco:
- O valor da norma antes da normalizacao (varia entre os vetores)
- O valor da norma apos a normalizacao (sempre 1.0000)
- Uma amostra das primeiras 5 dimensoes antes e depois

Isso transforma a similaridade cosseno em um simples produto escalar, importante para a
etapa de busca.

**Reducao de dimensionalidade - PCA (etapa 04)**
Os vetores de 1024 dimensoes sao reduzidos para 2 componentes principais usando o
algoritmo de PCA via matriz de Gram. Esse metodo opera em uma matriz (n x n) em vez
da matriz de covariancia (d x d), sendo muito mais eficiente quando o numero de blocos
e menor do que a dimensionalidade dos vetores.

Alem de projetar os documentos, o modelo salva os vetores de carregamento de cada
componente para projetar novos pontos (como queries de busca) no mesmo espaco.

**Visualizacao (etapa 05)**
Os pontos 2D sao plotados em um grafico de dispersao interativo. Passe o mouse sobre
cada ponto para ler o trecho de texto correspondente.

### 4. Busca semantica

Apos o pipeline ser concluido, a secao "Busca semantica" aparece abaixo do grafico.

**Como usar:**

1. Digite um termo ou frase no campo de busca
2. Pressione Enter ou clique em "Buscar"
3. O sistema gera o embedding da query via VoyageAI
4. A query e normalizada por L2 e comparada com cada bloco via produto escalar

**O que acontece na interface:**

- O grafico exibe um novo ponto (circulo branco maior) representando o vetor da query
  projetado no mesmo espaco PCA dos documentos. Blocos semanticamente proximos ficam
  geometricamente proximos.
- A lista "Blocos mais similares" exibe todos os blocos ordenados por score, do mais
  relevante ao menos relevante, com uma barra de progresso mostrando o valor numerico
  da similaridade (0.0 a 1.0).

**Por que produto escalar = similaridade cosseno aqui:**

A similaridade cosseno entre dois vetores `a` e `b` e definida como:

```
cos(a, b) = (a . b) / (||a|| * ||b||)
```

Como todos os vetores foram normalizados por L2 (norma = 1.0), o denominador e sempre
`1 * 1 = 1`, e a formula se reduz a:

```
cos(a, b) = a . b
```

Isso e exatamente o que torna a normalizacao L2 fundamental para sistemas de busca
semantica eficientes.

**Dica para demonstracoes em video:** busque por termos que sejam sub-temas do texto
original. O ponto da query deve se aproximar dos blocos que tratam daquele assunto,
enquanto os blocos de topicos diferentes ficam mais afastados no grafico.

### 5. Reiniciar com novo texto

Para processar um novo texto, basta alterar o conteudo no campo de entrada e clicar
em "Processar texto" novamente. Todos os resultados anteriores (incluindo busca) sao
limpos automaticamente.

---

## Estrutura do projeto

```
app/
  api/embed/route.ts        Chamada a VoyageAI no servidor (protege a API Key)
  layout.tsx                Layout raiz, dark mode, fonte do sistema
  page.tsx                  Entrada do Next.js App Router
  globals.css               Estilos globais e utilitarios glassmorphism

components/
  Dashboard.tsx             Orquestrador principal (estado global e fluxo de dados)
  InputPanel.tsx            Textarea de entrada e upload de arquivos .md
  StepIndicator.tsx         Barra de progresso das 5 etapas do pipeline
  ChunkList.tsx             Lista dos blocos gerados pelo chunking
  NormalizationPanel.tsx    Tabela didatica de normalizacao L2 (antes / depois)
  EmbeddingChart.tsx        Scatter plot interativo com suporte ao ponto de query
  SearchPanel.tsx           Campo de busca semantica
  SearchResults.tsx         Lista de blocos ordenados por similaridade cosseno
  StatsBar.tsx              Painel de metricas do processamento
  Header.tsx                Cabecalho tipografico
  ErrorBanner.tsx           Exibicao de erros do pipeline ou da busca

lib/
  chunking.ts               Divisao semantica por paragrafos e sentencas
  normalize.ts              Norma euclidiana e normalizacao L2
  pca.ts                    PCA via matriz de Gram com funcao de projecao reutilizavel
  voyage.ts                 Cliente HTTP da API da VoyageAI

types/
  embedding.ts              Tipos TypeScript de todo o dominio
```

---

## Decisoes tecnicas

### PCA via matriz de Gram

Os vetores da VoyageAI possuem `d = 1024` dimensoes. Calcular a matriz de covariancia
diretamente seria uma operacao `d x d = 1024 x 1024`. Em vez disso, o sistema usa o
truque da matriz de Gram:

1. Calcula a matriz `G = X_c * X_c^T` de dimensao `(n x n)`, onde `n` e o numero de
   blocos (tipicamente < 50)
2. Encontra os autovetores de `G` via iteracao de potencia com deflacao
3. Converte de volta ao espaco original para obter os vetores de carregamento
4. Usa esses vetores para projetar novos pontos (queries de busca) no mesmo espaco

O resultado matematico e equivalente ao PCA tradicional, com custo proporcional a
`O(n^2 * d)` em vez de `O(d^2 * n)`.

### Funcao de projecao para busca

Ao contrario de implementacoes simples de PCA que descartam o modelo apos a projecao,
este sistema retorna uma funcao `project(vector)` que captura os vetores de carregamento
e a media do conjunto de treinamento. Isso permite projetar qualquer novo vetor no
espaco PCA ja calculado, o que e essencial para posicionar o ponto da query no grafico.

### Seguranca da chave de API

A variavel `VOYAGE_API_KEY` e lida exclusivamente em `lib/voyage.ts`, que e chamado
somente pela API Route do servidor. Ela nunca e exposta ao bundle do navegador.
