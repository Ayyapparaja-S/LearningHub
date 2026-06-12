import type { Section } from '../../types';

const sections: Section[] = [
  {
    title: 'Architecture Patterns',
    questions: [
      {
        q: 'What are the key design patterns in microservices architecture?',
        a: `<pre><code>Key Patterns:
1. API Gateway        — Single entry point, routing, auth, rate limiting
2. Service Discovery  — Eureka, Consul — dynamic registration
3. Circuit Breaker    — Resilience4j — prevent cascade failures
4. Saga              — Distributed transactions via events
5. CQRS             — Separate read/write models
6. Event Sourcing    — Store events, derive state
7. Sidecar/Mesh     — Istio — cross-cutting concerns
8. Strangler Fig     — Gradual migration from monolith
9. Database per Service — Each service owns its data
10. Bulkhead         — Isolate failures</code></pre>
<pre><code>// API Gateway (Spring Cloud Gateway)
@Bean
public RouteLocator routes(RouteLocatorBuilder builder) {
    return builder.routes()
        .route("order-service", r -&gt; r
            .path("/api/orders/**")
            .filters(f -&gt; f.circuitBreaker(c -&gt; c.setFallbackUri("/fallback"))
                           .requestRateLimiter(rl -&gt; rl.setRateLimiter(redisLimiter())))
            .uri("lb://ORDER-SERVICE"))
        .build();
}</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Explain Circuit Breaker pattern. How to implement with Resilience4j?',
        a: `<pre><code>// States: CLOSED → OPEN → HALF_OPEN → CLOSED
// CLOSED: Normal. Tracks failure rate.
// OPEN: Threshold breached. Fail immediately (fast-fail).
// HALF_OPEN: After timeout, allows test requests.

@CircuitBreaker(name = "paymentService", fallbackMethod = "paymentFallback")
@Retry(name = "paymentService")
@TimeLimiter(name = "paymentService")
public CompletableFuture&lt;PaymentResponse&gt; processPayment(PaymentRequest req) {
    return CompletableFuture.supplyAsync(() -&gt; paymentClient.charge(req));
}

public CompletableFuture&lt;PaymentResponse&gt; paymentFallback(PaymentRequest req, Exception ex) {
    log.warn("Payment circuit open, queuing for retry");
    return CompletableFuture.completedFuture(PaymentResponse.pending());
}

// application.yml
resilience4j:
  circuitbreaker:
    instances:
      paymentService:
        sliding-window-size: 10
        failure-rate-threshold: 50        # Open after 50% failures
        wait-duration-in-open-state: 30s  # Wait before half-open
        permitted-number-of-calls-in-half-open-state: 3
        slow-call-duration-threshold: 2s
        slow-call-rate-threshold: 80
  retry:
    instances:
      paymentService:
        max-attempts: 3
        wait-duration: 1s
        exponential-backoff-multiplier: 2
        retry-exceptions: [java.io.IOException, java.util.concurrent.TimeoutException]</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'Explain the Saga pattern for distributed transactions.',
        a: `<pre><code>// Problem: Distributed transactions (2PC) don't scale well
// Solution: Saga = sequence of local transactions with compensating actions

// CHOREOGRAPHY Saga (event-driven, no coordinator):
// Order Service → OrderCreated event
// Payment Service listens → PaymentProcessed event
// Inventory Service listens → StockReserved event
// Shipping Service listens → ShipmentCreated event
// If any fails → publishes failure event → others compensate

// ORCHESTRATION Saga (central coordinator):
@Service
public class OrderSagaOrchestrator {
    public void createOrder(OrderRequest req) {
        String orderId = orderService.create(req);           // Step 1
        try {
            paymentService.charge(orderId, req.getTotal());   // Step 2
            inventoryService.reserve(orderId, req.getItems()); // Step 3
            shippingService.schedule(orderId);                 // Step 4
            orderService.confirm(orderId);
        } catch (PaymentException e) {
            orderService.cancel(orderId);                     // Compensate step 1
        } catch (InventoryException e) {
            paymentService.refund(orderId);                   // Compensate step 2
            orderService.cancel(orderId);                     // Compensate step 1
        } catch (ShippingException e) {
            inventoryService.release(orderId);                // Compensate step 3
            paymentService.refund(orderId);                   // Compensate step 2
            orderService.cancel(orderId);                     // Compensate step 1
        }
    }
}

// Choreography vs Orchestration:
// Choreography: Decoupled, no single point of failure, but hard to debug
// Orchestration: Clear flow, easier debugging, but coordinator is SPOF</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'How to decompose a monolith into microservices?',
        a: `<pre><code>// Strangler Fig Pattern: Gradually replace monolith piece by piece

// Step 1: Identify bounded contexts (DDD)
// - Order Management
// - Payment Processing  
// - Inventory Management
// - User Management

// Step 2: API Gateway routes traffic
// /api/orders → New Order Microservice (extracted)
// /api/payments → Still in Monolith (not yet extracted)

// Step 3: Extract one service at a time
// Priority: Most independently deployable, highest change frequency

// Anti-corruption Layer: Adapter between old and new
public class LegacyOrderAdapter implements OrderPort {
    private final MonolithClient monolithClient;
    @Override
    public Order getOrder(String id) {
        LegacyOrder legacy = monolithClient.fetchOrder(id);
        return OrderMapper.fromLegacy(legacy); // Translate to new model
    }
}

// Database decomposition strategies:
// 1. Shared DB (start here, easiest)
// 2. Schema-per-service (logical separation)
// 3. DB-per-service (full independence, eventual consistency)

// Data sync during migration:
// - Change Data Capture (Debezium) → replicate changes
// - Event-driven: Dual-write → eventually remove old writes

// Key mistakes to avoid:
// - Don't extract too many services at once
// - Don't share DB schema between services long-term
// - Don't create "distributed monolith" (services tightly coupled)</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'What is the Database per Service pattern? How to handle data consistency?',
        a: `<pre><code>// Each microservice owns its database — no direct DB access by others

// Challenges:
// 1. Cross-service queries → API composition or CQRS
// 2. Data consistency → Saga pattern (eventual consistency)
// 3. Reporting → Event-driven data lake or read replicas

// API Composition for cross-service queries:
@Service
public class OrderDetailsComposer {
    public OrderDetails getFullOrder(String orderId) {
        Order order = orderClient.getOrder(orderId);
        Customer customer = customerClient.getCustomer(order.getCustomerId());
        List&lt;Product&gt; products = productClient.getProducts(order.getProductIds());
        return new OrderDetails(order, customer, products);
    }
}

// CQRS (Command Query Responsibility Segregation):
// Write side: Each service handles its own writes
// Read side: Materialized view aggregates data from multiple services

// Event-driven sync:
@KafkaListener(topics = "order-events")
public void onOrderEvent(OrderEvent event) {
    // Update denormalized read model with order + customer + product info
    orderReadRepo.save(OrderView.from(event));
}

// Eventual consistency is acceptable for:
// - Reporting, analytics
// - Search results
// - Recommendations
// NOT acceptable for: Payments, inventory (use Saga with compensation)</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'Communication Patterns',
    questions: [
      {
        q: 'Synchronous vs Asynchronous communication between microservices.',
        a: `<pre><code>// SYNCHRONOUS: Request-response. Caller waits for response.
// Protocols: REST (HTTP), gRPC
// Pros: Simple, immediate response
// Cons: Tight coupling, cascading failures, higher latency

// REST call between services
@FeignClient(name = "payment-service")
public interface PaymentClient {
    @PostMapping("/api/payments")
    PaymentResponse charge(@RequestBody PaymentRequest req);
}

// gRPC (faster, binary, schema-enforced)
// 10x faster than REST for inter-service communication
// Uses Protocol Buffers for serialization

// ASYNCHRONOUS: Event-driven. Fire and forget or pub/sub.
// Technologies: Kafka, RabbitMQ, AWS SQS
// Pros: Decoupled, resilient, scalable
// Cons: Complexity, eventual consistency, debugging harder

// Event publishing
@Service
public class OrderService {
    @Autowired private KafkaTemplate&lt;String, OrderEvent&gt; kafka;
    
    @Transactional
    public Order createOrder(OrderRequest req) {
        Order order = orderRepo.save(new Order(req));
        kafka.send("order-events", order.getId(), new OrderCreatedEvent(order));
        return order;
    }
}

// When to use which:
// Sync: Need immediate response, simple CRUD, user-facing queries
// Async: Background processing, notifications, cross-service data propagation
// Hybrid: Accept request (sync) → process async → notify via SSE/WebSocket</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'What is Service Discovery? How do Eureka and Consul work?',
        a: `<pre><code>// Problem: Microservices have dynamic IPs (containers, auto-scaling)
// Solution: Service Discovery — registry of available instances

// EUREKA (Netflix, Spring Cloud default):
// 1. Service registers itself on startup
// 2. Sends heartbeats every 30s
// 3. Clients fetch registry and load-balance locally

// Server:
@EnableEurekaServer
@SpringBootApplication
public class DiscoveryServerApplication { }

// Client:
@EnableDiscoveryClient
@SpringBootApplication
public class OrderServiceApplication { }

// application.yml (client)
eureka:
  client:
    service-url:
      defaultZone: http://discovery:8761/eureka
  instance:
    prefer-ip-address: true
    lease-renewal-interval-in-seconds: 10

// Client-side load balancing (Spring Cloud LoadBalancer)
@LoadBalanced
@Bean
public RestTemplate restTemplate() { return new RestTemplate(); }

restTemplate.getForObject("http://PAYMENT-SERVICE/api/payments/{id}", Payment.class, id);
// "PAYMENT-SERVICE" resolved via discovery → actual IP:port

// CONSUL: Service mesh + discovery + config
// Features: Health checks, DNS interface, KV store, multi-datacenter
// Compared to Eureka: More features, less Spring-specific

// Kubernetes: Built-in service discovery via DNS
// Service name → ClusterIP → Pod(s)
// No need for Eureka/Consul in K8s environments</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How to implement inter-service communication with OpenFeign?',
        a: `<pre><code>// OpenFeign: Declarative HTTP client for microservice-to-microservice calls
@FeignClient(
    name = "inventory-service",
    fallbackFactory = InventoryFallbackFactory.class,
    configuration = FeignConfig.class
)
public interface InventoryClient {
    
    @GetMapping("/api/inventory/{sku}")
    StockResponse getStock(@PathVariable String sku);
    
    @PostMapping("/api/inventory/reserve")
    ReservationResponse reserve(@RequestBody ReserveRequest req);
    
    @DeleteMapping("/api/inventory/reserve/{reservationId}")
    void cancelReservation(@PathVariable String reservationId);
}

// Fallback for circuit breaker
@Component
public class InventoryFallbackFactory implements FallbackFactory&lt;InventoryClient&gt; {
    @Override
    public InventoryClient create(Throwable cause) {
        return new InventoryClient() {
            @Override
            public StockResponse getStock(String sku) {
                log.warn("Inventory unavailable, returning cached stock");
                return StockResponse.unknown(sku);
            }
            // ...
        };
    }
}

// Feign configuration
@Configuration
public class FeignConfig {
    @Bean
    public RequestInterceptor authInterceptor() {
        return template -&gt; template.header("Authorization", "Bearer " + getToken());
    }
    
    @Bean
    public Retryer retryer() {
        return new Retryer.Default(100, 1000, 3); // interval, maxInterval, maxAttempts
    }
    
    @Bean
    public ErrorDecoder errorDecoder() {
        return (methodKey, response) -&gt; {
            if (response.status() == 404) return new ResourceNotFoundException();
            if (response.status() == 503) return new ServiceUnavailableException();
            return new Default().decode(methodKey, response);
        };
    }
}</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'Observability & Monitoring',
    questions: [
      {
        q: 'How to implement distributed tracing across microservices?',
        a: `<pre><code>// Distributed Tracing: Follow a request across multiple services
// Tools: Micrometer Tracing + Zipkin/Jaeger (Spring Boot 3.x)

// dependency: micrometer-tracing-bridge-otel + opentelemetry-exporter-zipkin

// application.yml
management:
  tracing:
    sampling:
      probability: 1.0  # 100% in dev, 10% in prod
  zipkin:
    tracing:
      endpoint: http://zipkin:9411/api/v2/spans

// Automatic: Spring auto-instruments RestTemplate, WebClient, Feign, Kafka, JDBC
// Trace context propagated via headers: traceparent, tracestate (W3C standard)

// Manual span creation:
@Autowired private Tracer tracer;

public Order processOrder(OrderRequest req) {
    Span span = tracer.nextSpan().name("process-order").start();
    try (Tracer.SpanInScope ws = tracer.withSpan(span)) {
        span.tag("order.customerId", req.getCustomerId());
        span.event("validating");
        validate(req);
        span.event("charging-payment");
        paymentService.charge(req);
        span.event("order-created");
        return orderRepo.save(new Order(req));
    } catch (Exception e) {
        span.error(e);
        throw e;
    } finally {
        span.end();
    }
}

// Trace propagation through Kafka:
// Producer adds traceparent header automatically
// Consumer reads it and continues the trace

// Logging correlation (add traceId to logs):
// logback-spring.xml: %X{traceId} %X{spanId}
// Result: All logs for one request have same traceId across all services</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'What metrics should you monitor in a microservices system?',
        a: `<pre><code>// Four Golden Signals (Google SRE):
// 1. Latency — Time to serve requests (p50, p95, p99)
// 2. Traffic — Requests per second
// 3. Errors — Error rate (5xx / total)
// 4. Saturation — Resource utilization (CPU, memory, connections)

// RED Method (for services):
// Rate — Requests/second
// Errors — Failed requests/second
// Duration — Latency distribution

// USE Method (for resources):
// Utilization — % time busy
// Saturation — Queue length
// Errors — Error count

// Spring Boot + Micrometer + Prometheus + Grafana:
// Auto-exposed metrics:
// http_server_requests_seconds (count, sum, max, histogram)
// jvm_memory_used_bytes
// jvm_threads_live
// hikaricp_connections_active
// kafka_consumer_records_lag

// Custom business metrics:
@Component
public class OrderMetrics {
    private final Counter ordersCreated;
    private final Timer orderProcessingTime;
    private final Gauge activeOrders;
    
    public OrderMetrics(MeterRegistry registry) {
        this.ordersCreated = Counter.builder("orders.created")
            .tag("channel", "web")
            .register(registry);
        this.orderProcessingTime = Timer.builder("orders.processing")
            .publishPercentiles(0.5, 0.95, 0.99)
            .register(registry);
    }
}

// Alerting rules (Prometheus):
// alert: HighErrorRate
// expr: rate(http_server_requests_seconds_count{status=~"5.."}[5m]) 
//       / rate(http_server_requests_seconds_count[5m]) > 0.05
// for: 5m</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How to implement centralized logging in microservices?',
        a: `<pre><code>// ELK Stack: Elasticsearch + Logstash + Kibana
// Or: EFK (Fluentd instead of Logstash) in Kubernetes

// Structured logging (JSON format):
// logback-spring.xml
&lt;encoder class="net.logstash.logback.encoder.LogstashEncoder"&gt;
    &lt;includeMdcKeyNames&gt;traceId,spanId,userId&lt;/includeMdcKeyNames&gt;
&lt;/encoder&gt;

// Output: {"timestamp":"2024-01-15T10:30:00Z","level":"INFO",
//          "message":"Order created","traceId":"abc123",
//          "service":"order-service","orderId":"ORD-456"}

// MDC (Mapped Diagnostic Context) for request context:
public class RequestContextFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(...) {
        MDC.put("requestId", UUID.randomUUID().toString());
        MDC.put("userId", extractUserId(request));
        try { chain.doFilter(request, response); }
        finally { MDC.clear(); }
    }
}

// Log aggregation pipeline:
// App → stdout (JSON) → Fluentd/Filebeat → Elasticsearch → Kibana
// In Kubernetes: stdout → container log → Fluentd DaemonSet → ES

// Best practices:
// 1. Always log in JSON (structured, parseable)
// 2. Include traceId in every log line
// 3. Use log levels correctly: ERROR (action needed), WARN (degraded), INFO (business events)
// 4. Don't log PII (passwords, tokens, SSN)
// 5. Log at service boundaries (incoming request, outgoing call, response)
// 6. Include context: userId, orderId, duration, status code</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'Deployment & Scaling',
    questions: [
      {
        q: 'How to deploy microservices to Kubernetes?',
        a: `<pre><code># Deployment manifest
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
spec:
  replicas: 3
  selector:
    matchLabels: { app: order-service }
  template:
    metadata:
      labels: { app: order-service }
    spec:
      containers:
      - name: order-service
        image: myregistry/order-service:1.2.3
        ports: [{ containerPort: 8080 }]
        resources:
          requests: { cpu: "250m", memory: "512Mi" }
          limits: { cpu: "1000m", memory: "1Gi" }
        readinessProbe:
          httpGet: { path: /actuator/health/readiness, port: 8080 }
          initialDelaySeconds: 10
        livenessProbe:
          httpGet: { path: /actuator/health/liveness, port: 8080 }
          initialDelaySeconds: 30
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "k8s"
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef: { name: db-secrets, key: password }
---
apiVersion: v1
kind: Service
metadata:
  name: order-service
spec:
  selector: { app: order-service }
  ports: [{ port: 80, targetPort: 8080 }]
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: order-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: order-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource: { name: cpu, target: { type: Utilization, averageUtilization: 70 } }</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'How to handle configuration management across microservices?',
        a: `<pre><code>// Options:
// 1. Spring Cloud Config Server (Git-backed, centralized)
// 2. Kubernetes ConfigMaps + Secrets
// 3. HashiCorp Vault (secrets)
// 4. AWS Parameter Store / Secrets Manager

// Spring Cloud Config Server:
@EnableConfigServer
@SpringBootApplication
public class ConfigServerApp { }

// Config stored in Git:
// config-repo/order-service-prod.yml
// config-repo/payment-service-prod.yml
// config-repo/application.yml (shared defaults)

// Client:
spring:
  config:
    import: configserver:http://config-server:8888
  cloud:
    config:
      fail-fast: true
      retry:
        max-attempts: 5

// Dynamic refresh (no restart):
@RefreshScope
@Component
public class DynamicConfig {
    @Value("\${feature.new-checkout:false}")
    private boolean newCheckoutEnabled;
}
// POST /actuator/refresh → re-reads config

// Kubernetes ConfigMap:
apiVersion: v1
kind: ConfigMap
metadata:
  name: order-service-config
data:
  application.yml: |
    server.port: 8080
    app.feature.new-checkout: true

// Mount as volume or env vars in pod spec
// Use Reloader/Stakater for auto-restart on ConfigMap change

// Secrets (never in Git!):
// Vault: Dynamic secrets (DB credentials rotated automatically)
// K8s Secrets: Base64 encoded (encrypt at rest with KMS)
// Spring Cloud Vault:
spring.cloud.vault.token=\${VAULT_TOKEN}
spring.cloud.vault.kv.default-context=order-service</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'What is the Sidecar pattern and Service Mesh?',
        a: `<pre><code>// Sidecar Pattern: Deploy helper container alongside your service
// Handles cross-cutting concerns without modifying service code

// Service Mesh (Istio/Linkerd): Network of sidecar proxies (Envoy)
// Each service gets a proxy that handles:
// - mTLS (mutual TLS) between services
// - Traffic management (canary, blue-green, retries)
// - Observability (metrics, tracing, logging)
// - Circuit breaking, rate limiting
// - Authentication/authorization

// Without service mesh (code in each service):
@CircuitBreaker @Retry @RateLimiter // In every service!
public Response callOtherService() { ... }

// With service mesh (infrastructure-level):
// Your code: simple HTTP call
// Envoy sidecar: handles retries, circuit breaking, mTLS automatically

// Istio VirtualService (traffic management):
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
spec:
  hosts: [order-service]
  http:
  - match:
    - headers: { x-canary: { exact: "true" } }
    route:
    - destination: { host: order-service, subset: v2 }  # Canary
  - route:
    - destination: { host: order-service, subset: v1 }
      weight: 90
    - destination: { host: order-service, subset: v2 }
      weight: 10  # 10% traffic to new version

// When to use Service Mesh:
// - Many services (20+), polyglot (different languages)
// - Need mTLS everywhere, fine-grained traffic control
// - When NOT: Few services, single language (Spring Cloud may suffice)</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'Security & API Gateway',
    questions: [
      {
        q: 'How to implement authentication/authorization across microservices?',
        a: `<pre><code>// Pattern: Token-based auth at API Gateway, propagate to services

// 1. Client authenticates → gets JWT from Auth Service
// 2. Client sends JWT in Authorization header
// 3. API Gateway validates JWT, routes to service
// 4. Services trust gateway-forwarded headers OR validate JWT themselves

// Option A: Gateway validates, services trust headers
// Gateway: Validate JWT, add X-User-Id, X-Roles headers
// Services: Read headers (simpler, but services must trust gateway)

// Option B: Each service validates JWT (more secure, decentralized)
@Component
public class JwtFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, ...) {
        String token = extractToken(req);
        if (jwtService.isValid(token)) {
            UserContext ctx = jwtService.extractContext(token);
            SecurityContextHolder.getContext().setAuthentication(
                new PreAuthenticatedToken(ctx, ctx.getRoles()));
        }
        chain.doFilter(req, res);
    }
}

// Inter-service calls: Propagate token
@Component
public class FeignAuthInterceptor implements RequestInterceptor {
    @Override
    public void apply(RequestTemplate template) {
        String token = SecurityContextHolder.getContext().getAuthentication().getCredentials();
        template.header("Authorization", "Bearer " + token);
    }
}

// Service-to-service auth (no user context):
// Use client_credentials OAuth2 flow → service account tokens
// Or: mTLS (mutual TLS) via service mesh</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'What is API Gateway pattern? Compare Spring Cloud Gateway vs Kong vs Nginx.',
        a: `<pre><code>// API Gateway responsibilities:
// 1. Request routing
// 2. Authentication/authorization
// 3. Rate limiting
// 4. Request/response transformation
// 5. Load balancing
// 6. Caching
// 7. Circuit breaking
// 8. API versioning
// 9. Request aggregation

// Spring Cloud Gateway (Java, reactive):
// + Native Spring integration, programmatic routes
// + Filters, predicates, circuit breaker built-in
// - JVM overhead, slower cold start
// Best for: Spring ecosystem, complex routing logic

// Kong (Nginx-based, plugins):
// + High performance, language-agnostic
// + Rich plugin ecosystem (auth, rate-limit, logging)
// + Admin API for dynamic configuration
// - Separate infrastructure to manage
// Best for: Large-scale, polyglot microservices

// Nginx (reverse proxy + load balancer):
// + Ultra-high performance, battle-tested
// + Simple configuration for basic routing
// - Limited dynamic routing, less microservice-specific
// Best for: Simple routing, static configuration

// AWS API Gateway (managed):
// + Zero infrastructure, auto-scaling
// + Lambda integration, WebSocket support
// - Vendor lock-in, cold starts with Lambda
// Best for: AWS-native, serverless

// BFF (Backend for Frontend) pattern:
// Separate gateway per client type (web, mobile, admin)
// Each BFF aggregates/transforms data for its specific frontend</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'Testing & Reliability',
    questions: [
      {
        q: 'How to test microservices? Testing pyramid and contract testing.',
        a: `<pre><code>// Testing Pyramid for Microservices:
//          /\\
//         /  \\  E2E Tests (few, slow, expensive)
//        /    \\
//       / Integ \\ Integration Tests (moderate)
//      /  ration \\
//     /___________\\ Unit Tests (many, fast, cheap)

// 1. Unit Tests: Business logic, no Spring context
@Test void shouldCalculateDiscount() {
    var service = new PricingService(mockRepo);
    assertEquals(BigDecimal.valueOf(90), service.applyDiscount(100, 10));
}

// 2. Integration Tests: Service + DB (Testcontainers)
@SpringBootTest @Testcontainers
class OrderServiceIT {
    @Container static PostgreSQLContainer&lt;?&gt; pg = new PostgreSQLContainer&lt;&gt;("postgres:15");
}

// 3. Contract Tests (Pact/Spring Cloud Contract):
// Prevent breaking changes between services
// Consumer defines expectations → Provider verifies

// Spring Cloud Contract (provider side):
// contract: order-service/get-order.groovy
Contract.make {
    request { method 'GET'; url '/api/orders/123' }
    response {
        status 200
        body(id: "123", status: "ACTIVE", total: 99.99)
    }
}
// Auto-generates tests for provider + stubs for consumers

// Consumer uses stubs:
@AutoConfigureStubRunner(stubsMode = LOCAL, ids = "com.app:order-service:+:stubs:8090")
class PaymentServiceTest {
    @Test void shouldGetOrder() {
        Order order = orderClient.getOrder("123"); // Hits stub
        assertThat(order.getStatus()).isEqualTo("ACTIVE");
    }
}

// 4. Chaos Testing: Netflix Chaos Monkey, Litmus
// Kill pods, inject latency, simulate failures</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
];

export default sections;
