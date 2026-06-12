import type { Section } from '../../types';

const sections: Section[] = [
  {
    title: 'Core Concepts & Auto-Configuration',
    questions: [
      {
        q: 'How does Spring Boot auto-configuration work internally?',
        a: `<p><strong>Mechanism:</strong></p>
<ol>
<li><code>@SpringBootApplication</code> = @Configuration + @EnableAutoConfiguration + @ComponentScan</li>
<li>@EnableAutoConfiguration triggers <code>AutoConfigurationImportSelector</code></li>
<li>Reads <code>META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports</code></li>
<li>Each auto-config class uses @Conditional annotations to decide if it should apply</li>
</ol>
<pre><code>@AutoConfiguration
@ConditionalOnClass(DataSource.class)
@ConditionalOnMissingBean(DataSource.class)
public class DataSourceAutoConfiguration {
    @Bean
    @ConfigurationProperties("spring.datasource")
    public DataSource dataSource(DataSourceProperties props) { ... }
}

// Key @Conditional annotations:
@ConditionalOnClass        // Class on classpath
@ConditionalOnMissingBean  // No user bean defined
@ConditionalOnProperty     // Property has value
@ConditionalOnWebApplication</code></pre>
<div class="highlight">User-defined beans always take priority over auto-configured ones.</div>`,
        level: 'intermediate' as const
      },
      {
        q: 'Explain the Spring Bean lifecycle in detail.',
        a: `<pre><code>// Bean Lifecycle Order:
1. Instantiation (constructor)
2. Populate properties (DI)
3. BeanNameAware.setBeanName()
4. BeanFactoryAware.setBeanFactory()
5. ApplicationContextAware.setApplicationContext()
6. BeanPostProcessor.postProcessBeforeInitialization()
7. @PostConstruct
8. InitializingBean.afterPropertiesSet()
9. Custom init-method
10. BeanPostProcessor.postProcessAfterInitialization()
─── Bean ready ───
11. @PreDestroy
12. DisposableBean.destroy()
13. Custom destroy-method</code></pre>
<pre><code>@Component
public class OrderService implements InitializingBean {
    @Autowired private OrderRepository repo; // Step 2
    
    @PostConstruct
    public void init() { log.info("Ready"); } // Step 7
    
    @Override
    public void afterPropertiesSet() { } // Step 8
    
    @PreDestroy
    public void cleanup() { } // Step 11
}</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'What are the different bean scopes? When to use prototype?',
        a: `<pre><code>// Bean Scopes:
@Scope("singleton")  // Default. One instance per ApplicationContext.
@Scope("prototype")  // New instance every time requested.
@Scope("request")    // One per HTTP request (web only).
@Scope("session")    // One per HTTP session (web only).
@Scope("application")// One per ServletContext.

// Prototype gotcha: Injecting prototype into singleton!
@Service // Singleton
public class OrderService {
    @Autowired private ShoppingCart cart; // Prototype? NO! Same instance always!
}

// Fix 1: ObjectFactory / Provider
@Autowired private ObjectFactory&lt;ShoppingCart&gt; cartFactory;
ShoppingCart cart = cartFactory.getObject(); // New instance each time

// Fix 2: @Lookup method
@Lookup
public abstract ShoppingCart getCart(); // Spring generates subclass

// Fix 3: Scoped proxy
@Component @Scope(value = "request", proxyMode = ScopedProxyMode.TARGET_CLASS)
public class ShoppingCart { } // Creates CGLIB proxy that delegates to correct scope</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How does @Transactional work internally? Common pitfalls.',
        a: `<pre><code>// @Transactional uses AOP proxy to wrap method:
// 1. Proxy intercepts call
// 2. Opens transaction (PlatformTransactionManager)
// 3. Executes method
// 4. Commits on success / Rolls back on RuntimeException

@Transactional(
    propagation = Propagation.REQUIRED,     // Default: join existing or create new
    isolation = Isolation.READ_COMMITTED,   // Default DB isolation
    rollbackFor = Exception.class,          // Rollback on checked exceptions too
    timeout = 30                            // Seconds
)
public void processOrder(Order order) { ... }

// PITFALLS:
// 1. Self-invocation (bypasses proxy!)
@Service
public class OrderService {
    public void create() { validate(); } // NOT transactional!
    @Transactional public void validate() { }
}
// Fix: Inject self, or extract to separate service

// 2. Catching exception inside @Transactional
@Transactional
public void process() {
    try { riskyOperation(); }
    catch (Exception e) { log.error(e); } // Swallowed! Transaction COMMITS
}
// Fix: Re-throw or call setRollbackOnly()

// 3. Private methods — Spring proxy can't intercept!
// 4. Default only rolls back on unchecked exceptions (RuntimeException)</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'Explain Spring Boot Actuator endpoints and custom health checks.',
        a: `<pre><code># application.yml
management:
  endpoints:
    web:
      exposure:
        include: health, info, metrics, prometheus, env
  endpoint:
    health:
      show-details: when_authorized
  health:
    diskspace:
      threshold: 1GB

// Key actuator endpoints:
// /actuator/health — Application health status
// /actuator/metrics — Micrometer metrics (JVM, HTTP, custom)
// /actuator/env — Environment properties
// /actuator/prometheus — Prometheus scrape endpoint
// /actuator/threaddump — Thread dump
// /actuator/heapdump — Heap dump download

// Custom health indicator:
@Component
public class PaymentGatewayHealthIndicator implements HealthIndicator {
    @Override
    public Health health() {
        boolean isUp = paymentClient.ping();
        if (isUp) return Health.up().withDetail("gateway", "reachable").build();
        return Health.down().withDetail("error", "Gateway timeout").build();
    }
}

// Custom metric:
@Component
public class OrderMetrics {
    private final Counter orderCounter;
    private final Timer orderTimer;
    
    public OrderMetrics(MeterRegistry registry) {
        this.orderCounter = registry.counter("orders.created", "type", "online");
        this.orderTimer = registry.timer("orders.processing.time");
    }
    
    public void recordOrder(Runnable action) {
        orderCounter.increment();
        orderTimer.record(action);
    }
}</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How to externalize configuration? @ConfigurationProperties vs @Value.',
        a: `<pre><code>// @Value: Simple injection, SpEL support
@Value("\${app.timeout:30}") private int timeout; // With default
@Value("#{systemProperties['java.home']}") private String javaHome; // SpEL

// @ConfigurationProperties: Type-safe, structured config (PREFERRED)
@ConfigurationProperties(prefix = "app.payment")
@Validated
public record PaymentConfig(
    @NotBlank String apiKey,
    @Min(1) int timeout,
    RetryConfig retry
) {
    public record RetryConfig(int maxAttempts, Duration backoff) {}
}

# application.yml
app:
  payment:
    api-key: \${PAYMENT_API_KEY}  # From environment variable
    timeout: 5000
    retry:
      max-attempts: 3
      backoff: 2s

// Profile-specific configuration:
# application-dev.yml (active with --spring.profiles.active=dev)
# application-prod.yml

// Configuration priority (highest to lowest):
// 1. Command line args (--server.port=9090)
// 2. SPRING_APPLICATION_JSON
// 3. OS environment variables
// 4. application-{profile}.yml
// 5. application.yml
// 6. @PropertySource annotations
// 7. Default properties</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'How does component scanning work? How to control what gets scanned?',
        a: `<pre><code>// @ComponentScan (part of @SpringBootApplication) scans the package and sub-packages

// Stereotype annotations picked up by scanning:
@Component   // Generic
@Service     // Business logic layer
@Repository  // Data access layer (adds exception translation)
@Controller  // Web layer (MVC)
@RestController // @Controller + @ResponseBody

// Control scanning:
@SpringBootApplication(scanBasePackages = "com.myapp")
@ComponentScan(
    basePackages = "com.myapp",
    excludeFilters = @Filter(type = FilterType.REGEX, pattern = "com.myapp.legacy.*")
)

// Conditional registration:
@Component
@ConditionalOnProperty(name = "feature.new-engine", havingValue = "true")
public class NewProcessingEngine { }

@Component
@Profile("dev")  // Only in dev profile
public class MockPaymentGateway implements PaymentGateway { }

// Manual bean registration (when scanning not appropriate):
@Configuration
public class AppConfig {
    @Bean
    public PaymentGateway paymentGateway() {
        return new StripeGateway(apiKey);
    }
}</code></pre>`,
        level: 'basic' as const
      },
    ]
  },
  {
    title: 'Spring Data JPA & Database',
    questions: [
      {
        q: 'How does Spring Data JPA repository work? Query creation methods.',
        a: `<pre><code>// Spring Data auto-generates implementation from method names!
public interface OrderRepository extends JpaRepository&lt;Order, String&gt; {
    // Derived queries (method name → JPQL)
    List&lt;Order&gt; findByStatusAndCustomerId(String status, String custId);
    Optional&lt;Order&gt; findFirstByCustomerIdOrderByCreatedAtDesc(String custId);
    long countByStatus(String status);
    boolean existsByCustomerIdAndStatus(String custId, String status);
    Page&lt;Order&gt; findByStatus(String status, Pageable pageable);

    // @Query (JPQL)
    @Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.customer.id = :custId")
    List&lt;Order&gt; findWithItems(@Param("custId") String custId);
    
    // Native SQL
    @Query(value = "SELECT * FROM orders WHERE total &gt; :min LIMIT :limit", nativeQuery = true)
    List&lt;Order&gt; findExpensive(@Param("min") BigDecimal min, @Param("limit") int limit);
    
    // Modifying queries
    @Modifying
    @Query("UPDATE Order o SET o.status = :status WHERE o.id IN :ids")
    int bulkUpdateStatus(@Param("ids") List&lt;String&gt; ids, @Param("status") String status);
}

// Pagination
Pageable page = PageRequest.of(0, 20, Sort.by("createdAt").descending());
Page&lt;Order&gt; result = orderRepo.findByStatus("ACTIVE", page);
result.getContent(); result.getTotalElements(); result.getTotalPages();</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How to handle database migrations in Spring Boot?',
        a: `<pre><code>// Use Flyway or Liquibase for versioned migrations

// Flyway (SQL-based, simpler):
// src/main/resources/db/migration/
// V1__create_orders_table.sql
// V2__add_customer_id_column.sql
// V3__create_index_on_status.sql

-- V1__create_orders_table.sql
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_customer_status (customer_id, status)
);

// application.yml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true  # For existing databases

// Liquibase (XML/YAML/JSON, more features):
// Supports: rollback, conditional execution, database-independent

// Best practices:
// 1. Never modify existing migrations (create new ones)
// 2. Keep migrations small and focused
// 3. Include indexes in same migration as table creation
// 4. Test migrations on a copy of production data
// 5. Use repeatable migrations (R__) for views/procedures</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How to configure multiple data sources in Spring Boot?',
        a: `<pre><code>@Configuration
public class DataSourceConfig {
    
    @Primary
    @Bean @ConfigurationProperties("spring.datasource.primary")
    public DataSource primaryDataSource() {
        return DataSourceBuilder.create().build();
    }
    
    @Bean @ConfigurationProperties("spring.datasource.secondary")
    public DataSource secondaryDataSource() {
        return DataSourceBuilder.create().build();
    }
    
    @Primary
    @Bean
    public LocalContainerEntityManagerFactoryBean primaryEntityManager(
            @Qualifier("primaryDataSource") DataSource ds) {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(ds);
        em.setPackagesToScan("com.app.primary.entities");
        em.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        return em;
    }
    
    @Primary
    @Bean
    public PlatformTransactionManager primaryTransactionManager(
            @Qualifier("primaryEntityManager") EntityManagerFactory emf) {
        return new JpaTransactionManager(emf);
    }
}

# application.yml
spring:
  datasource:
    primary:
      url: jdbc:postgresql://localhost/orders
      username: app
    secondary:
      url: jdbc:mysql://localhost/analytics
      username: analytics</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'REST API Development',
    questions: [
      {
        q: 'Design a RESTful API with proper status codes, validation, and error handling.',
        a: `<pre><code>@RestController
@RequestMapping("/api/v1/orders")
@Validated
public class OrderController {
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(@Valid @RequestBody CreateOrderRequest req) {
        return orderService.create(req);
    }
    
    @GetMapping("/{id}")
    public OrderResponse getOrder(@PathVariable String id) {
        return orderService.findById(id)
            .orElseThrow(() -&gt; new ResourceNotFoundException("Order", id));
    }
    
    @GetMapping
    public Page&lt;OrderResponse&gt; listOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        return orderService.findAll(status, PageRequest.of(page, size));
    }
    
    @PutMapping("/{id}")
    public OrderResponse updateOrder(@PathVariable String id, @Valid @RequestBody UpdateOrderRequest req) {
        return orderService.update(id, req);
    }
    
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOrder(@PathVariable String id) {
        orderService.delete(id);
    }
}

// Validation
public record CreateOrderRequest(
    @NotBlank String customerId,
    @NotEmpty List&lt;@Valid OrderItemRequest&gt; items,
    @NotNull PaymentMethod paymentMethod
) {}

// Status codes: 200 OK, 201 Created, 204 No Content, 
// 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'How do you implement API versioning in Spring Boot?',
        a: `<pre><code>// Strategy 1: URL path versioning (most common)
@RestController
@RequestMapping("/api/v1/orders")
public class OrderControllerV1 { ... }

@RestController
@RequestMapping("/api/v2/orders")
public class OrderControllerV2 { ... }

// Strategy 2: Header versioning
@GetMapping(value = "/orders", headers = "X-API-Version=2")
public OrderV2Response getOrderV2() { ... }

// Strategy 3: Content negotiation (Accept header)
@GetMapping(value = "/orders", produces = "application/vnd.myapp.v2+json")
public OrderV2Response getOrderV2() { ... }

// Strategy 4: Request parameter
@GetMapping(value = "/orders", params = "version=2")

// Best practices:
// 1. Use URL versioning for public APIs (most discoverable)
// 2. Support at most 2-3 versions simultaneously
// 3. Deprecation headers: Deprecation: true, Sunset: Sat, 1 Jan 2025
// 4. Use DTOs to decouple internal model from API response
// 5. MapStruct for mapping between version DTOs

@Mapper(componentModel = "spring")
public interface OrderMapper {
    OrderV2Response toV2(Order order);
    OrderV1Response toV1(Order order);
}</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How to implement pagination, filtering, and sorting in REST APIs?',
        a: `<pre><code>// Spring Data Pageable integration
@GetMapping("/orders")
public PageResponse&lt;OrderDTO&gt; getOrders(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") @Max(100) int size,
        @RequestParam(defaultValue = "createdAt,desc") String[] sort,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate from) {
    
    Sort sorting = parseSortParams(sort);
    Pageable pageable = PageRequest.of(page, size, sorting);
    
    Specification&lt;Order&gt; spec = Specification.where(null);
    if (status != null) spec = spec.and((root, q, cb) -&gt; cb.equal(root.get("status"), status));
    if (from != null) spec = spec.and((root, q, cb) -&gt; cb.greaterThan(root.get("createdAt"), from));
    
    Page&lt;Order&gt; result = orderRepo.findAll(spec, pageable);
    return PageResponse.of(result.map(mapper::toDTO));
}

// Response format:
{
  "content": [...],
  "page": 0,
  "size": 20,
  "totalElements": 156,
  "totalPages": 8,
  "hasNext": true,
  "links": {
    "self": "/api/orders?page=0&size=20",
    "next": "/api/orders?page=1&size=20",
    "last": "/api/orders?page=7&size=20"
  }
}

// Cursor-based pagination (better for real-time data):
@GetMapping("/orders")
public CursorPage&lt;OrderDTO&gt; getOrders(@RequestParam(required = false) String cursor) {
    // cursor = encoded lastId+lastTimestamp
    // WHERE (created_at, id) &lt; (:lastTs, :lastId) ORDER BY created_at DESC, id DESC LIMIT 21
}</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How to implement rate limiting in Spring Boot?',
        a: `<pre><code>// Option 1: Bucket4j (token bucket algorithm)
@Configuration
public class RateLimitConfig {
    @Bean
    public FilterRegistrationBean&lt;RateLimitFilter&gt; rateLimitFilter() {
        // 100 requests per minute per IP
        Bandwidth limit = Bandwidth.classic(100, Refill.greedy(100, Duration.ofMinutes(1)));
        return new FilterRegistrationBean&lt;&gt;(new RateLimitFilter(limit));
    }
}

// Option 2: Spring Cloud Gateway rate limiter (Redis-backed)
spring:
  cloud:
    gateway:
      routes:
        - id: order-service
          uri: lb://ORDER-SERVICE
          predicates:
            - Path=/api/orders/**
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10  # requests/sec
                redis-rate-limiter.burstCapacity: 20
                key-resolver: "#{@userKeyResolver}"

// Option 3: Custom interceptor
@Component
public class RateLimitInterceptor implements HandlerInterceptor {
    private final Map&lt;String, Bucket&gt; buckets = new ConcurrentHashMap&lt;&gt;();
    
    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
        String key = req.getRemoteAddr();
        Bucket bucket = buckets.computeIfAbsent(key, k -&gt; createBucket());
        if (bucket.tryConsume(1)) return true;
        res.setStatus(429);
        res.setHeader("Retry-After", "60");
        return false;
    }
}</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'Security',
    questions: [
      {
        q: 'How to implement JWT authentication in Spring Boot?',
        a: `<pre><code>// Spring Security 6.x configuration
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -&gt; csrf.disable()) // Disable for stateless API
            .sessionManagement(sm -&gt; sm.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(auth -&gt; auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}

// JWT Filter
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) {
        String token = extractToken(req); // From "Authorization: Bearer xxx"
        if (token != null && jwtService.isValid(token)) {
            String username = jwtService.extractUsername(token);
            UserDetails user = userService.loadUserByUsername(username);
            var auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        chain.doFilter(req, res);
    }
}

// JWT Service (using jjwt library)
public String generateToken(UserDetails user) {
    return Jwts.builder()
        .subject(user.getUsername())
        .claim("roles", user.getAuthorities())
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + 86400000))
        .signWith(secretKey)
        .compact();
}</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'What are common security best practices for Spring Boot APIs?',
        a: `<pre><code>// 1. Input validation (prevent injection)
@Valid @RequestBody CreateUserRequest req // Bean validation
@Size(max = 100) @Pattern(regexp = "^[a-zA-Z0-9]+$") String username

// 2. CORS configuration
@Bean
public CorsConfigurationSource corsSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("https://myapp.com"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
    config.setAllowCredentials(true);
    // ...
}

// 3. Security headers
http.headers(h -&gt; h
    .contentSecurityPolicy(csp -&gt; csp.policyDirectives("default-src 'self'"))
    .frameOptions(fo -&gt; fo.deny())
);

// 4. Secrets management
// NEVER hardcode secrets. Use: Environment variables, Vault, AWS Secrets Manager
spring.datasource.password=\${DB_PASSWORD}

// 5. SQL injection prevention: Always use parameterized queries
@Query("SELECT u FROM User u WHERE u.email = :email") // Safe — parameterized
// NEVER: "SELECT * FROM users WHERE email = '" + email + "'" // SQL injection!

// 6. Rate limiting, request size limits
spring.servlet.multipart.max-file-size=10MB
server.tomcat.max-http-form-post-size=2MB

// 7. Actuator security
management.endpoints.web.exposure.include=health,info // Minimal
// Require auth for sensitive endpoints

// 8. Dependency scanning: OWASP dependency-check, Snyk, Trivy</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'Testing',
    questions: [
      {
        q: 'How to write integration tests in Spring Boot?',
        a: `<pre><code>@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class OrderControllerIT {
    
    @Container
    static PostgreSQLContainer&lt;?&gt; postgres = new PostgreSQLContainer&lt;&gt;("postgres:15");
    
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }
    
    @Autowired private TestRestTemplate restTemplate;
    @Autowired private OrderRepository orderRepo;
    
    @Test
    void shouldCreateOrder() {
        var request = new CreateOrderRequest("CUST-1", List.of(item), PaymentMethod.CARD);
        
        ResponseEntity&lt;OrderResponse&gt; response = restTemplate
            .postForEntity("/api/v1/orders", request, OrderResponse.class);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().id()).isNotBlank();
        assertThat(orderRepo.findById(response.getBody().id())).isPresent();
    }
    
    @Test
    void shouldReturn404ForNonExistentOrder() {
        ResponseEntity&lt;ErrorResponse&gt; response = restTemplate
            .getForEntity("/api/v1/orders/non-existent", ErrorResponse.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}

// Slice tests (faster — load only relevant context):
@WebMvcTest(OrderController.class)    // Controller layer only
@DataJpaTest                           // JPA layer only
@WebFluxTest                           // WebFlux controllers</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How to mock dependencies in Spring Boot tests?',
        a: `<pre><code>// @MockBean: Replaces bean in Spring context with Mockito mock
@WebMvcTest(OrderController.class)
class OrderControllerTest {
    @Autowired private MockMvc mockMvc;
    @MockBean private OrderService orderService; // Mocked!
    
    @Test
    void shouldReturnOrder() throws Exception {
        when(orderService.findById("123"))
            .thenReturn(Optional.of(new OrderResponse("123", "ACTIVE", BigDecimal.TEN)));
        
        mockMvc.perform(get("/api/v1/orders/123"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value("123"))
            .andExpect(jsonPath("$.status").value("ACTIVE"));
    }
    
    @Test
    void shouldValidateRequest() throws Exception {
        mockMvc.perform(post("/api/v1/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}")) // Missing required fields
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errors").isNotEmpty());
    }
}

// Unit test with Mockito (no Spring context — fastest)
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock private OrderRepository orderRepo;
    @Mock private PaymentGateway paymentGateway;
    @InjectMocks private OrderService orderService;
    
    @Test
    void shouldProcessOrder() {
        when(orderRepo.save(any())).thenAnswer(inv -&gt; inv.getArgument(0));
        when(paymentGateway.charge(any(), any())).thenReturn(true);
        
        Order result = orderService.process(testOrder);
        
        assertThat(result.getStatus()).isEqualTo("CONFIRMED");
        verify(paymentGateway).charge(testOrder.getTotal(), testOrder.getPaymentToken());
    }
}</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'Caching & Performance',
    questions: [
      {
        q: 'How to implement caching in Spring Boot? Cache eviction strategies.',
        a: `<pre><code>// Enable caching
@EnableCaching
@Configuration
public class CacheConfig {
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager();
        manager.setCaffeine(Caffeine.newBuilder()
            .maximumSize(10_000)
            .expireAfterWrite(Duration.ofMinutes(10))
            .recordStats()); // For monitoring
        return manager;
    }
}

// Usage with annotations:
@Service
public class ProductService {
    
    @Cacheable(value = "products", key = "#id")
    public Product findById(String id) {
        return productRepo.findById(id).orElseThrow(); // Only called on cache miss
    }
    
    @CachePut(value = "products", key = "#product.id")
    public Product update(Product product) {
        return productRepo.save(product); // Always executes, updates cache
    }
    
    @CacheEvict(value = "products", key = "#id")
    public void delete(String id) {
        productRepo.deleteById(id); // Removes from cache
    }
    
    @CacheEvict(value = "products", allEntries = true)
    @Scheduled(fixedRate = 3600000) // Every hour
    public void evictAll() { } // Clear entire cache
}

// Redis as distributed cache:
spring:
  cache:
    type: redis
    redis:
      time-to-live: 600000 # 10 minutes</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How to optimize Spring Boot application startup time?',
        a: `<pre><code>// 1. Lazy initialization
spring.main.lazy-initialization=true
// Beans created only when first accessed. Faster startup, slower first request.

// 2. Exclude unused auto-configurations
@SpringBootApplication(exclude = {
    DataSourceAutoConfiguration.class,
    KafkaAutoConfiguration.class
})

// 3. Use Spring AOT (Ahead-of-Time) compilation
// Generates code at build time instead of runtime reflection
./mvnw spring-boot:build-image -Pnative  // GraalVM native image

// 4. Reduce classpath scanning
@ComponentScan(basePackages = "com.myapp.orders") // Specific package

// 5. Optimize JVM
-XX:TieredStopAtLevel=1  // Skip C2 compilation for faster startup
-XX:+UseSerialGC         // Less overhead for short-lived apps

// 6. Spring Boot 3.2+ features:
// - Virtual threads (reduce thread pool initialization)
// - CDS (Class Data Sharing) archive
// java -Xshare:dump → java -Xshare:on

// 7. Docker optimization:
FROM eclipse-temurin:21-jre-alpine
COPY --from=build layers/dependencies/ ./
COPY --from=build layers/spring-boot-loader/ ./
COPY --from=build layers/snapshot-dependencies/ ./
COPY --from=build layers/application/ ./
// Layered JARs → better Docker cache utilization

// 8. Measure with: spring.main.log-startup-info=true
// Or: ApplicationStartup + Actuator /actuator/startup</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'Async & Scheduling',
    questions: [
      {
        q: 'How to implement async processing with @Async?',
        a: `<pre><code>// Enable async
@EnableAsync
@Configuration
public class AsyncConfig {
    @Bean
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-");
        executor.setRejectedExecutionHandler(new CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}

// Usage:
@Service
public class NotificationService {
    
    @Async // Runs in thread pool, returns immediately
    public CompletableFuture&lt;Boolean&gt; sendEmail(String to, String body) {
        // Expensive I/O operation
        emailClient.send(to, body);
        return CompletableFuture.completedFuture(true);
    }
    
    @Async
    public void sendPushNotification(String userId, String message) {
        // Fire-and-forget
        pushClient.send(userId, message);
    }
}

// GOTCHAS:
// 1. Self-invocation doesn't work (same as @Transactional — proxy issue)
// 2. Exception handling for void methods — use AsyncUncaughtExceptionHandler
// 3. Must return void or Future/CompletableFuture

// @Scheduled
@Scheduled(fixedDelay = 5000)  // 5s after previous completion
@Scheduled(fixedRate = 5000)   // Every 5s regardless of duration
@Scheduled(cron = "0 0 2 * * ?") // Daily at 2 AM
public void cleanupExpiredOrders() { ... }</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How to handle long-running tasks without blocking the request thread?',
        a: `<pre><code>// Option 1: Accept and process asynchronously
@PostMapping("/orders/bulk-import")
@ResponseStatus(HttpStatus.ACCEPTED) // 202
public JobResponse startBulkImport(@RequestBody BulkImportRequest req) {
    String jobId = UUID.randomUUID().toString();
    asyncProcessor.process(jobId, req); // Returns immediately
    return new JobResponse(jobId, "PROCESSING", "/api/jobs/" + jobId);
}

// Client polls for status:
@GetMapping("/jobs/{jobId}")
public JobStatus getJobStatus(@PathVariable String jobId) {
    return jobService.getStatus(jobId); // PENDING → PROCESSING → COMPLETED/FAILED
}

// Option 2: Server-Sent Events (SSE)
@GetMapping(value = "/orders/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux&lt;OrderEvent&gt; streamOrders() {
    return orderService.getEventStream();
}

// Option 3: WebSocket for bidirectional real-time
@MessageMapping("/orders")
@SendTo("/topic/order-updates")
public OrderUpdate processOrder(OrderCommand command) { ... }

// Option 4: Message queue (Kafka/RabbitMQ)
// Request → Queue → Worker processes → Update status in DB
@KafkaListener(topics = "order-processing")
public void processOrder(OrderEvent event) {
    // Long-running processing
    orderService.process(event);
    statusService.update(event.getJobId(), "COMPLETED");
}</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'Deployment & Production',
    questions: [
      {
        q: 'How to containerize a Spring Boot application with Docker?',
        a: `<pre><code># Multi-stage build (smaller image)
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN ./mvnw dependency:resolve  # Cache dependencies
COPY src src
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Security: Non-root user
RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 8080
HEALTHCHECK --interval=30s CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]

# docker-compose.yml for local dev
services:
  app:
    build: .
    ports: ["8080:8080"]
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/orders
    depends_on:
      db: { condition: service_healthy }
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: orders
      POSTGRES_PASSWORD: secret
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'What JVM flags and configurations should you use in production?',
        a: `<pre><code># Memory
-Xms4g -Xmx4g                    # Set min=max (avoid resize pauses)
-XX:MaxRAMPercentage=75.0         # Container-aware (use 75% of container memory)
-XX:MaxMetaspaceSize=256m         # Limit metaspace

# GC (choose one)
-XX:+UseG1GC -XX:MaxGCPauseMillis=100   # G1 (general purpose)
-XX:+UseZGC                              # ZGC (low latency)

# Monitoring
-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/
-Xlog:gc*:file=/var/log/gc.log:time,level,tags:filecount=5,filesize=50M
-XX:+FlightRecorder              # JFR always-on recording

# Resilience
-XX:+ExitOnOutOfMemoryError      # Crash fast, let orchestrator restart
-XX:+CrashOnOutOfMemoryError     # Generate hs_err file

# Spring Boot specific
--spring.profiles.active=prod
--server.tomcat.threads.max=200
--server.tomcat.accept-count=100

# Container-specific (Java 17+)
-XX:+UseContainerSupport         # Default on. Detect container limits.
-XX:ActiveProcessorCount=4       # Override CPU detection in containers

# Graceful shutdown
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=30s</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
];

export default sections;
