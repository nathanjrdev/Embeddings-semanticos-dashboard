# Plano Arquitetural: Migração para Microsserviços Java/Spring Boot

## Visão Geral

Este plano detalha a migração da aplicação client-side Next.js para uma arquitetura de microsserviços robusta utilizando Java e Spring Boot, mantendo o frontend em Next.js. O objetivo é transformar o pipeline monolítico em serviços independentes, escaláveis e seguros.

## 1. Arquitetura Geral

### Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTE (Next.js)                              │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼───────────────────────────────────────┐
│                           API Gateway (Spring Cloud)                        │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼───────────────────────────────────────┐
│                          Service Registry (Eureka)                          │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼───────────────────────────────────────┐
│                        Load Balancer/API Management                         │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼───────────────────────────────────────┐
│                              Config Server                                │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼───────────────────────────────────────┐
│                              Monitoring Stack                             │
│                    (Prometheus + Grafana + ELK Stack)                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼───────────────────────────────────────┐
│                           Circuit Breaker (Hystrix)                        │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼───────────────────────────────────────┐
│                          ┌─────────────────────────────────────────────────┐│
│                          │        Text Processing Service                 ││
│                          │  (Chunking, Text Analysis, Preprocessing)      ││
│                          └─────────────────────────────────────────────────┘│
│                                      │                                      │
│                          ┌─────────────────────────────────────────────────┐│
│                          │         AI Integration Service                 ││
│                          │  (VoyageAI API Integration, Embedding Gen)     ││
│                          └─────────────────────────────────────────────────┘│
│                                      │                                      │
│                          ┌─────────────────────────────────────────────────┐│
│                          │      Linear Algebra Service                    ││
│                          │  (L2 Normalization, PCA, Mathematical Ops)     ││
│                          └─────────────────────────────────────────────────┘│
│                                      │                                      │
│                          ┌─────────────────────────────────────────────────┐│
│                          │        Search & Indexing Service               ││
│                          │  (Semantic Search, Similarity Calculations)    ││
│                          └─────────────────────────────────────────────────┘│
│                                      │                                      │
│                          ┌─────────────────────────────────────────────────┐│
│                          │         Visualization Service                  ││
│                          │  (Data Processing for Charts, Analytics)       ││
│                          └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Divisão de Domínios em Microsserviços

### 2.1 Text Processing Service
**Responsabilidades:**
- Divisão semântica de texto (chunking)
- Pré-processamento de textos
- Análise de conteúdo textual
- Validação e sanitização de entradas

**Endpoints:**
- `POST /api/text/chunk` - Divide texto em chunks semânticos
- `GET /api/text/stats/{chunkId}` - Estatísticas do chunk
- `POST /api/text/batch-chunk` - Processamento em lote

### 2.2 AI Integration Service
**Responsabilidades:**
- Integração com a API da VoyageAI
- Geração de embeddings vetoriais
- Gerenciamento de quotas e rate limiting
- Cache de embeddings para chunks idênticos

**Endpoints:**
- `POST /api/embeddings/generate` - Gera embeddings para chunks
- `GET /api/embeddings/{chunkId}` - Recupera embedding por ID
- `POST /api/embeddings/batch` - Geração em lote

### 2.3 Linear Algebra Service
**Responsabilidades:**
- Normalização L2 de vetores
- Redução de dimensionalidade via PCA
- Operações matriciais e vetoriais
- Projeção de novos vetores no espaço PCA

**Endpoints:**
- `POST /api/normalize/l2` - Normalização L2
- `POST /api/pca/reduce` - Redução PCA
- `POST /api/pca/project` - Projeção de vetores no espaço PCA

### 2.4 Search & Indexing Service
**Responsabilidades:**
- Cálculo de similaridade de cosseno
- Busca semântica
- Ranking de resultados
- Indexação de embeddings para busca eficiente

**Endpoints:**
- `POST /api/search/similarity` - Busca por similaridade
- `POST /api/search/rank` - Ranking de resultados
- `GET /api/search/history` - Histórico de buscas

### 2.5 Visualization Service
**Responsabilidades:**
- Processamento de dados para visualização
- Formatação de pontos 2D
- Estatísticas agregadas
- Preparação de dados para gráficos

**Endpoints:**
- `POST /api/visualization/chart-data` - Dados para gráfico de dispersão
- `GET /api/visualization/stats` - Estatísticas de visualização
- `POST /api/visualization/projection` - Projeção para visualização

## 3. Comunicação Inter-serviços

### 3.1 Protocolos Recomendados

#### gRPC para Comunicação Interna
**Justificativa:**
- Alta performance e baixa latência
- Tipagem forte com Protocol Buffers
- Streaming bidirecional para processos longos
- Compressão automática de payloads

#### REST/JSON para APIs Externas
**Justificativa:**
- Compatibilidade com o frontend Next.js
- Facilidade de debugging e testes
- Padrão da indústria para APIs web

#### Mensageria com Apache Kafka
**Justificativa:**
- Desacoplamento entre serviços
- Processamento assíncrono de tarefas pesadas
- Resiliência e tolerância a falhas
- Escalabilidade horizontal

### 3.2 Fluxo de Comunicação

```
Next.js Frontend
       │
       ▼
API Gateway (REST)
       │
       ▼
Text Processing Service (gRPC)
       │
       ▼
AI Integration Service (gRPC + Kafka)
       │
       ▼
Linear Algebra Service (gRPC)
       │
       ▼
Search & Indexing Service (gRPC)
       │
       ▼
Visualization Service (gRPC)
       │
       ▼
API Gateway (REST)
       │
       ▼
Next.js Frontend
```

## 4. Práticas de Segurança

### 4.1 Autenticação e Autorização

#### OAuth 2.0 + JWT
- **API Gateway**: Validação de tokens JWT
- **Serviços**: Autorização baseada em claims
- **Frontend**: Gerenciamento de sessão via cookies seguros

#### Service-to-Service Authentication
- **Mutual TLS**: Criptografia entre serviços
- **Service Accounts**: Credenciais específicas por serviço
- **Token Exchange**: Delegação segura entre serviços

### 4.2 Gerenciamento de Credenciais

#### Spring Cloud Config com Vault
```
┌─────────────────────────────────────┐
│           HashiCorp Vault           │
│  - Secrets encriptados              │
│  - Rotação automática               │
│  - Controle de acesso granular      │
└─────────────────▲───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│      Spring Cloud Config Server     │
│  - Distribuição de configurações    │
│  - Refresh dinâmico                 │
└─────────────────────────────────────┘
```

#### Gestão da Chave VoyageAI
- Armazenamento no Vault como secret
- Injeção via variáveis de ambiente
- Rotação automática via pipeline CI/CD
- Monitoramento de uso e quotas

### 4.3 Segurança de Rede

#### Service Mesh (Istio/Linkerd)
- **mTLS**: Criptografia automática entre serviços
- **RBAC**: Controle de acesso baseado em serviço
- **Rate Limiting**: Prevenção de abusos
- **Observability**: Tracing distribuído

## 5. Padrões de Projeto (Design Patterns)

### 5.1 Padrões Arquiteturais

#### Circuit Breaker (Hystrix/Resilience4j)
```java
@CircuitBreaker(name = "voyageAI", fallbackMethod = "fallbackEmbedding")
public EmbeddingResponse generateEmbeddings(List<String> texts) {
    return voyageAIClient.generateEmbeddings(texts);
}

public EmbeddingResponse fallbackEmbedding(List<String> texts, Exception ex) {
    // Implementação de fallback
    return cachedEmbeddingsService.get(texts);
}
```

#### Retry Pattern
```java
@Retryable(value = {ApiException.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
public EmbeddingResponse callVoyageAPI(List<String> texts) {
    return voyageAIClient.generateEmbeddings(texts);
}
```

#### Bulkhead Pattern
```java
@Bulkhead(name = "embeddingService", type = Type.THREADPOOL)
public CompletableFuture<EmbeddingResponse> processEmbeddingsAsync(List<String> texts) {
    return CompletableFuture.supplyAsync(() -> voyageAIClient.generateEmbeddings(texts));
}
```

### 5.2 Padrões de Domínio

#### Strategy Pattern para Algoritmos Matemáticos
```java
public interface NormalizationStrategy {
    double[] normalize(double[] vector);
}

@Component("l2Normalization")
public class L2NormalizationStrategy implements NormalizationStrategy {
    @Override
    public double[] normalize(double[] vector) {
        // Implementação L2
    }
}

@Component("minMaxNormalization")
public class MinMaxNormalizationStrategy implements NormalizationStrategy {
    @Override
    public double[] normalize(double[] vector) {
        // Implementação Min-Max
    }
}
```

#### Factory Pattern para Criação de Algoritmos PCA
```java
@Component
public class PCAAlgorithmFactory {
    
    @Autowired
    private GramMatrixPCAAlgorithm gramMatrixPCA;
    
    @Autowired
    private SVDPCAAlgorithm svdPCA;
    
    public PCAAlgorithm createAlgorithm(PCAConfig config) {
        switch (config.getMethod()) {
            case GRAM_MATRIX:
                return gramMatrixPCA;
            case SVD:
                return svdPCA;
            default:
                throw new IllegalArgumentException("Método PCA não suportado");
        }
    }
}
```

#### Decorator Pattern para Processamento em Pipeline
```java
public interface TextProcessor {
    List<TextChunk> process(String text);
}

@Component
@Primary
public class ChainingTextProcessor implements TextProcessor {
    
    private final List<TextProcessor> processors;
    
    public ChainingTextProcessor(List<TextProcessor> processors) {
        this.processors = new ArrayList<>(processors);
    }
    
    @Override
    public List<TextChunk> process(String text) {
        return processors.stream()
            .reduce((processed, processor) -> processor.process(processed.toString()))
            .orElse(Collections.emptyList());
    }
}
```

### 5.3 Padrões de Integração

#### Adapter Pattern para APIs Externas
```java
public interface EmbeddingProvider {
    EmbeddingResponse generateEmbeddings(List<String> texts);
    ProviderStats getStats();
}

@Component("voyageAI")
public class VoyageAIAdapter implements EmbeddingProvider {
    @Override
    public EmbeddingResponse generateEmbeddings(List<String> texts) {
        // Implementação específica da VoyageAI
    }
    
    @Override
    public ProviderStats getStats() {
        // Estatísticas específicas
    }
}
```

## 6. Fluxo de Dados Completo

### 6.1 Processamento Inicial

```
┌─────────────────┐
│   Next.js App   │
│  (User Input)   │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  API Gateway    │
│ (Validação JWT) │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Text Processing │
│     Service     │
│  (Chunking)     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  AI Integration │
│     Service     │
│ (VoyageAI API)  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Linear Algebra  │
│     Service     │
│(Norm + PCA)     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Visualization   │
│     Service     │
│(Chart Data)     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  API Gateway    │
│ (Response)      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   Next.js App   │
│(2D Chart)       │
└─────────────────┘
```

### 6.2 Busca Semântica

```
┌─────────────────┐
│   Next.js App   │
│ (Query Input)   │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  API Gateway    │
│ (Validação JWT) │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  AI Integration │
│     Service     │
│(Query Embedding)│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Linear Algebra  │
│     Service     │
│(Normalization)  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Search & Index  │
│     Service     │
│(Similarity)     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Visualization   │
│     Service     │
│(Ranking)        │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  API Gateway    │
│ (Response)      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   Next.js App   │
│(Search Results) │
└─────────────────┘
```

## 7. Stack Tecnológico Recomendado

### Backend (Java/Spring Boot)
- **Spring Boot 3.x** - Framework principal
- **Spring Cloud** - Microservices patterns
- **Spring Security** - Autenticação e autorização
- **Spring Data JPA** - Persistência (se necessário)
- **gRPC** - Comunicação entre serviços
- **Apache Kafka** - Mensageria
- **Redis** - Cache distribuído
- **Elasticsearch** - Busca e indexação (opcional)
- **Prometheus + Grafana** - Monitoramento
- **ELK Stack** - Logging

### Infraestrutura
- **Docker** - Containerização
- **Kubernetes** - Orquestração
- **Istio** - Service Mesh
- **HashiCorp Vault** - Gestão de secrets
- **Nginx** - API Gateway
- **Eureka** - Service Discovery

### Banco de Dados (Opcional)
- **PostgreSQL** - Dados principais
- **Redis** - Cache e sessões
- **MongoDB** - Documentos e embeddings (se persistência for necessária)

## 8. Considerações de Performance

### 8.1 Otimizações Matemáticas
- **Paralelização** de operações vetoriais
- **Cache** de resultados intermediários
- **Pooling** de conexões HTTP
- **Batching** de requisições para VoyageAI

### 8.2 Escalabilidade
- **Horizontal scaling** dos serviços stateless
- **Sharding** de dados (se persistência for necessária)
- **Auto-scaling** baseado em métricas
- **Load balancing** com service mesh

### 8.3 Resiliência
- **Circuit breakers** para dependências externas
- **Retry policies** com backoff exponencial
- **Bulkheads** para isolamento de falhas
- **Graceful degradation** em cenários de falha

## 9. Estratégia de Migração

### 9.1 Fase 1: Setup Inicial
1. Criar estrutura de projetos Spring Boot
2. Configurar API Gateway e Service Registry
3. Implementar Text Processing Service
4. Criar pipeline CI/CD

### 9.2 Fase 2: Core Services
1. Implementar AI Integration Service
2. Desenvolver Linear Algebra Service
3. Criar Search & Indexing Service
4. Implementar Visualization Service

### 9.3 Fase 3: Integração e Segurança
1. Configurar autenticação OAuth 2.0/JWT
2. Implementar Service Mesh (Istio)
3. Adicionar monitoramento e logging
4. Configurar secrets management

### 9.4 Fase 4: Otimização e Testes
1. Otimizar performance dos algoritmos
2. Implementar testes de carga
3. Configurar auto-scaling
4. Realizar testes de resiliência

## 10. Monitoramento e Observabilidade

### 10.1 Métricas Chave
- **Latência** de cada serviço
- **Throughput** de requisições
- **Taxa de erro** por serviço
- **Utilização de recursos** (CPU, memória)
- **Tempo de resposta** da API da VoyageAI

### 10.2 Tracing Distribuído
- **OpenTelemetry** para instrumentação
- **Jaeger** ou **Zipkin** para visualização
- **Correlation IDs** para rastrear requests

### 10.3 Alertas
- **SLA violations** (latência > threshold)
- **High error rates** (> 5%)
- **Service unavailability**
- **Resource exhaustion** (memória, CPU)

## Conclusão

Esta arquitetura fornece uma base sólida para escalar a aplicação de embeddings de texto para produção, com foco em:
- **Resiliência** e tolerância a falhas
- **Escalabilidade** horizontal
- **Segurança** em todas as camadas
- **Observabilidade** completa
- **Manutenibilidade** através de padrões de projeto bem definidos

A separação clara de responsabilidades em microsserviços permite evoluir cada componente independentemente, facilitando manutenção e futuras extensões da plataforma.