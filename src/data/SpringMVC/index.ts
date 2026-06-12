import type { Section } from '../../types';

const sections: Section[] = [
  {
    title: 'Request Handling & Architecture',
    questions: [
      {
        q: 'Explain the Spring MVC request lifecycle (DispatcherServlet flow).',
        a: `<pre><code>// Request flow:
// 1. Client → DispatcherServlet (front controller)
// 2. DispatcherServlet → HandlerMapping (find controller method)
// 3. HandlerMapping returns HandlerExecutionChain (handler + interceptors)
// 4. DispatcherServlet → HandlerAdapter (invoke handler)
// 5. Controller method executes, returns ModelAndView or @ResponseBody
// 6. ViewResolver resolves logical view name to actual View (if MVC)
// 7. View renders response (or HttpMessageConverter for REST)
// 8. Response → Client

// Interceptors execute at steps 3-4:
// preHandle() → Controller → postHandle() → afterCompletion()

@Component
public class LoggingInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
        log.info("Request: {} {}", req.getMethod(), req.getRequestURI());
        req.setAttribute("startTime", System.currentTimeMillis());
        return true; // false = stop chain
    }
    @Override
    public void afterCompletion(HttpServletRequest req, HttpServletResponse res, Object handler, Exception ex) {
        long duration = System.currentTimeMillis() - (long) req.getAttribute("startTime");
        log.info("Completed in {}ms, status={}", duration, res.getStatus());
    }
}

// Register interceptor
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loggingInterceptor).addPathPatterns("/api/**");
    }
}</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'What is the difference between @Controller and @RestController?',
        a: `<pre><code>// @Controller: Returns view names (MVC pattern)
@Controller
public class PageController {
    @GetMapping("/home")
    public String home(Model model) {
        model.addAttribute("users", userService.findAll());
        return "home"; // Resolves to home.html via ViewResolver
    }
}

// @RestController = @Controller + @ResponseBody on every method
// Returns data directly (serialized to JSON/XML)
@RestController
@RequestMapping("/api/users")
public class UserController {
    @GetMapping("/{id}")
    public UserDTO getUser(@PathVariable Long id) {
        return userService.findById(id); // Serialized to JSON automatically
    }
}

// @ResponseBody tells Spring to use HttpMessageConverter
// instead of ViewResolver. Jackson's MappingJackson2HttpMessageConverter
// handles JSON serialization/deserialization.

// You can mix in @Controller:
@Controller
public class MixedController {
    @GetMapping("/page")
    public String page() { return "page"; } // Returns view
    
    @GetMapping("/api/data")
    @ResponseBody
    public DataDTO data() { return service.getData(); } // Returns JSON
}</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'Explain @RequestMapping annotations and their variants.',
        a: `<pre><code>// @RequestMapping: Generic mapping (any HTTP method)
@RequestMapping(value = "/orders", method = RequestMethod.GET)

// Shortcut annotations (preferred):
@GetMapping("/orders")           // Read
@PostMapping("/orders")          // Create
@PutMapping("/orders/{id}")      // Full update
@PatchMapping("/orders/{id}")    // Partial update
@DeleteMapping("/orders/{id}")   // Delete

// Path variables
@GetMapping("/users/{userId}/orders/{orderId}")
public Order get(@PathVariable String userId, @PathVariable String orderId) {}

// Request parameters
@GetMapping("/orders")
public List&lt;Order&gt; search(
    @RequestParam String status,
    @RequestParam(required = false, defaultValue = "10") int limit) {}

// Request body (deserialized from JSON)
@PostMapping("/orders")
public Order create(@RequestBody @Valid CreateOrderRequest request) {}

// Request headers
@GetMapping("/data")
public Data get(@RequestHeader("X-Tenant-Id") String tenantId) {}

// Content negotiation
@GetMapping(value = "/report", produces = {MediaType.APPLICATION_JSON_VALUE, "text/csv"})
public Report getReport(@RequestHeader("Accept") String accept) {}

// Matrix variables: /cars;color=red;year=2023
@GetMapping("/cars/{path}")
public List&lt;Car&gt; getCars(@MatrixVariable String color, @MatrixVariable int year) {}</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'How does content negotiation work in Spring MVC?',
        a: `<pre><code>// Content negotiation: Server decides response format based on client preference

// Strategy 1: Accept header (recommended)
// Client sends: Accept: application/json
// Client sends: Accept: application/xml

@GetMapping(value = "/orders/{id}", produces = {"application/json", "application/xml"})
public Order getOrder(@PathVariable String id) {
    return orderService.findById(id); // Same method, different serialization
}

// Strategy 2: URL extension (deprecated in Spring 5.3+)
// /orders/123.json → JSON
// /orders/123.xml → XML

// Strategy 3: Request parameter
// /orders/123?format=json

// Configuration
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer
            .defaultContentType(MediaType.APPLICATION_JSON)
            .mediaType("json", MediaType.APPLICATION_JSON)
            .mediaType("xml", MediaType.APPLICATION_XML)
            .mediaType("csv", new MediaType("text", "csv"));
    }
}

// Custom HttpMessageConverter for CSV:
@Component
public class CsvMessageConverter extends AbstractHttpMessageConverter&lt;List&lt;?&gt;&gt; {
    public CsvMessageConverter() { super(new MediaType("text", "csv")); }
    @Override
    protected void writeInternal(List&lt;?&gt; list, HttpOutputMessage output) {
        // Write CSV format
    }
}</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'Request Validation & Data Binding',
    questions: [
      {
        q: 'How does request validation work with @Valid and Bean Validation?',
        a: `<pre><code>// Bean Validation (JSR 380) annotations
public record CreateOrderRequest(
    @NotBlank(message = "Customer ID is required")
    String customerId,
    
    @NotEmpty(message = "At least one item required")
    @Size(max = 50, message = "Maximum 50 items per order")
    List&lt;@Valid OrderItem&gt; items,
    
    @NotNull @Positive
    BigDecimal totalAmount,
    
    @Email String contactEmail,
    
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone")
    String phone
) {}

public record OrderItem(
    @NotBlank String sku,
    @Min(1) @Max(999) int quantity,
    @DecimalMin("0.01") BigDecimal price
) {}

// Controller validates with @Valid
@PostMapping("/orders")
public ResponseEntity&lt;Order&gt; create(@Valid @RequestBody CreateOrderRequest req) {
    return ResponseEntity.status(201).body(orderService.create(req));
}

// Custom validator
@Constraint(validatedBy = UniqueEmailValidator.class)
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface UniqueEmail {
    String message() default "Email already registered";
    Class&lt;?&gt;[] groups() default {};
    Class&lt;? extends Payload&gt;[] payload() default {};
}

@Component
public class UniqueEmailValidator implements ConstraintValidator&lt;UniqueEmail, String&gt; {
    @Autowired private UserRepository userRepo;
    @Override
    public boolean isValid(String email, ConstraintValidatorContext ctx) {
        return email == null || !userRepo.existsByEmail(email);
    }
}</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'What are validation groups and how to use them?',
        a: `<pre><code>// Validation groups: Apply different validations for different operations

// Define groups (marker interfaces)
public interface OnCreate {}
public interface OnUpdate {}

// Use groups in constraints
public record UserRequest(
    @Null(groups = OnCreate.class, message = "ID must be null for creation")
    @NotNull(groups = OnUpdate.class, message = "ID required for update")
    String id,
    
    @NotBlank(groups = {OnCreate.class, OnUpdate.class})
    String name,
    
    @NotBlank(groups = OnCreate.class)
    @Null(groups = OnUpdate.class, message = "Email cannot be changed")
    String email
) {}

// Activate specific group in controller
@PostMapping
public User create(@Validated(OnCreate.class) @RequestBody UserRequest req) { ... }

@PutMapping("/{id}")
public User update(@Validated(OnUpdate.class) @RequestBody UserRequest req) { ... }

// @Validated vs @Valid:
// @Valid: Standard JSR 380, supports nested validation, no groups
// @Validated: Spring-specific, supports validation groups
// Use @Valid for nested objects: List&lt;@Valid OrderItem&gt; items</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'How does data binding work for query parameters and form data?',
        a: `<pre><code>// Simple parameters: Bound individually
@GetMapping("/search")
public List&lt;Product&gt; search(
    @RequestParam String query,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "RELEVANCE") SortBy sort) { ... }

// Complex parameters: Bound to object (no @RequestParam needed)
@GetMapping("/orders")
public Page&lt;Order&gt; search(OrderSearchCriteria criteria, Pageable pageable) { ... }

public record OrderSearchCriteria(
    String status,
    String customerId,
    @DateTimeFormat(iso = ISO.DATE) LocalDate fromDate,
    @DateTimeFormat(iso = ISO.DATE) LocalDate toDate,
    BigDecimal minAmount
) {}
// Binds from: /orders?status=ACTIVE&fromDate=2024-01-01&minAmount=100

// Custom converter for complex types
@Component
public class StringToEnumConverter implements Converter&lt;String, OrderStatus&gt; {
    @Override
    public OrderStatus convert(String source) {
        return OrderStatus.valueOf(source.toUpperCase());
    }
}

// Form data binding
@PostMapping("/users")
public String createUser(@ModelAttribute @Valid UserForm form, BindingResult result) {
    if (result.hasErrors()) return "user-form"; // Show form with errors
    userService.create(form);
    return "redirect:/users";
}

// Multipart file upload
@PostMapping("/upload")
public String upload(@RequestParam("file") MultipartFile file) {
    String filename = StringUtils.cleanPath(file.getOriginalFilename());
    Files.copy(file.getInputStream(), uploadPath.resolve(filename));
    return filename;
}</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'Exception Handling & Responses',
    questions: [
      {
        q: 'How to implement global exception handling with @ControllerAdvice?',
        a: `<pre><code>@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(ResourceNotFoundException ex, WebRequest request) {
        return ErrorResponse.builder()
            .code("NOT_FOUND")
            .message(ex.getMessage())
            .path(request.getDescription(false))
            .timestamp(Instant.now())
            .build();
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidation(MethodArgumentNotValidException ex) {
        Map&lt;String, String&gt; errors = ex.getBindingResult().getFieldErrors().stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                f -&gt; f.getDefaultMessage() != null ? f.getDefaultMessage() : "Invalid",
                (e1, e2) -&gt; e1));
        return ErrorResponse.builder()
            .code("VALIDATION_ERROR")
            .message("Request validation failed")
            .details(errors)
            .build();
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ErrorResponse handleAccessDenied(AccessDeniedException ex) {
        return ErrorResponse.of("FORBIDDEN", "Insufficient permissions");
    }
    
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleGeneric(Exception ex) {
        log.error("Unexpected error", ex);
        return ErrorResponse.of("INTERNAL_ERROR", "An unexpected error occurred");
    }
}

// Standardized error response (RFC 7807 Problem Details)
public record ErrorResponse(String code, String message, Instant timestamp, 
                            String path, Map&lt;String, String&gt; details) {}</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How to return different response formats (ResponseEntity, custom status codes)?',
        a: `<pre><code>// ResponseEntity gives full control over status, headers, and body
@GetMapping("/orders/{id}")
public ResponseEntity&lt;OrderDTO&gt; getOrder(@PathVariable String id) {
    return orderService.findById(id)
        .map(order -&gt; ResponseEntity.ok()
            .header("X-Order-Version", String.valueOf(order.getVersion()))
            .cacheControl(CacheControl.maxAge(60, TimeUnit.SECONDS))
            .body(mapper.toDTO(order)))
        .orElse(ResponseEntity.notFound().build());
}

@PostMapping("/orders")
public ResponseEntity&lt;OrderDTO&gt; create(@Valid @RequestBody CreateOrderRequest req) {
    OrderDTO created = orderService.create(req);
    URI location = URI.create("/api/orders/" + created.id());
    return ResponseEntity.created(location).body(created); // 201 + Location header
}

@DeleteMapping("/orders/{id}")
public ResponseEntity&lt;Void&gt; delete(@PathVariable String id) {
    orderService.delete(id);
    return ResponseEntity.noContent().build(); // 204
}

// Conditional responses (ETag / Last-Modified)
@GetMapping("/products/{id}")
public ResponseEntity&lt;Product&gt; getProduct(@PathVariable String id, WebRequest request) {
    Product product = productService.findById(id);
    String etag = "\"" + product.getVersion() + "\"";
    
    if (request.checkNotModified(etag)) {
        return null; // 304 Not Modified (cached)
    }
    return ResponseEntity.ok().eTag(etag).body(product);
}</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'Filters, Interceptors & AOP',
    questions: [
      {
        q: 'What is the difference between Filter, Interceptor, and AOP in Spring?',
        a: `<pre><code>// Execution order: Filter → Interceptor → AOP → Controller

// FILTER (Servlet level): Works with raw request/response
// Use for: CORS, auth tokens, request logging, compression
@Component
public class RequestLoggingFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) {
        log.info("Filter: {} {}", req.getMethod(), req.getRequestURI());
        chain.doFilter(req, res); // Continue chain
    }
}

// INTERCEPTOR (Spring MVC level): Has access to handler info
// Use for: Auth checks, locale, tenant context, timing
public class TenantInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
        String tenant = req.getHeader("X-Tenant-Id");
        TenantContext.set(tenant);
        return true;
    }
    @Override
    public void afterCompletion(...) { TenantContext.clear(); }
}

// AOP (Method level): Cross-cutting concerns on any Spring bean
// Use for: Logging, metrics, caching, transaction management
@Aspect @Component
public class PerformanceAspect {
    @Around("@annotation(Timed)")
    public Object time(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = pjp.proceed();
        log.info("{} took {}ms", pjp.getSignature().getName(), System.currentTimeMillis() - start);
        return result;
    }
}

// Key differences:
// Filter: Servlet spec, no Spring context, request/response only
// Interceptor: Spring MVC, has handler info, pre/post/afterCompletion
// AOP: Any method, not tied to web, powerful pointcut expressions</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'How to implement CORS properly in Spring MVC?',
        a: `<pre><code>// Option 1: Global CORS configuration (recommended)
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("https://myapp.com", "https://admin.myapp.com")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
            .allowedHeaders("Authorization", "Content-Type", "X-Tenant-Id")
            .exposedHeaders("X-Total-Count", "X-Page-Count")
            .allowCredentials(true)
            .maxAge(3600); // Preflight cache (seconds)
    }
}

// Option 2: Per-controller
@CrossOrigin(origins = "https://myapp.com", maxAge = 3600)
@RestController
@RequestMapping("/api/orders")
public class OrderController { }

// Option 3: Spring Security CORS (when using Security)
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http.cors(cors -&gt; cors.configurationSource(corsConfigSource())).build();
}

@Bean
CorsConfigurationSource corsConfigSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("https://myapp.com"));
    config.setAllowedMethods(List.of("*"));
    config.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", config);
    return source;
}

// Important: When using Spring Security, CORS must be configured there
// (Security filter runs before MVC interceptors)</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'WebSocket & Server-Sent Events',
    questions: [
      {
        q: 'How to implement WebSocket communication in Spring?',
        a: `<pre><code>// STOMP over WebSocket (recommended for structured messaging)
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue"); // Subscribe destinations
        config.setApplicationDestinationPrefixes("/app"); // Send destination prefix
    }
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").setAllowedOrigins("*").withSockJS();
    }
}

// Message handler
@Controller
public class ChatController {
    @MessageMapping("/chat.send") // Client sends to /app/chat.send
    @SendTo("/topic/messages")    // Broadcast to all subscribers
    public ChatMessage send(ChatMessage message) {
        return message;
    }
    
    // Send to specific user
    @MessageMapping("/chat.private")
    public void sendPrivate(ChatMessage msg, SimpMessageHeaderAccessor header) {
        messagingTemplate.convertAndSendToUser(
            msg.getRecipient(), "/queue/private", msg);
    }
}

// Send from service layer (push notifications)
@Service
public class OrderNotificationService {
    @Autowired private SimpMessagingTemplate template;
    
    public void notifyOrderUpdate(String userId, OrderUpdate update) {
        template.convertAndSendToUser(userId, "/queue/orders", update);
    }
}</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'How to implement Server-Sent Events (SSE) for real-time updates?',
        a: `<pre><code>// SSE: Server pushes data to client (unidirectional, HTTP-based)
// Simpler than WebSocket, automatic reconnection, works through proxies

@RestController
@RequestMapping("/api/events")
public class EventController {
    
    // Option 1: SseEmitter (Spring MVC)
    private final List&lt;SseEmitter&gt; emitters = new CopyOnWriteArrayList&lt;&gt;();
    
    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(30_000L); // 30s timeout
        emitters.add(emitter);
        emitter.onCompletion(() -&gt; emitters.remove(emitter));
        emitter.onTimeout(() -&gt; emitters.remove(emitter));
        return emitter;
    }
    
    public void broadcast(OrderEvent event) {
        emitters.forEach(emitter -&gt; {
            try {
                emitter.send(SseEmitter.event()
                    .id(event.getId())
                    .name("order-update")
                    .data(event));
            } catch (IOException e) { emitters.remove(emitter); }
        });
    }
    
    // Option 2: WebFlux Flux (reactive, better for many connections)
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux&lt;ServerSentEvent&lt;OrderEvent&gt;&gt; stream() {
        return orderEventService.getEventStream()
            .map(event -&gt; ServerSentEvent.&lt;OrderEvent&gt;builder()
                .id(event.getId())
                .event("order-update")
                .data(event)
                .build());
    }
}

// Client (JavaScript):
const source = new EventSource('/api/events');
source.addEventListener('order-update', (e) =&gt; {
    const order = JSON.parse(e.data);
    updateUI(order);
});</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'File Upload & Multipart',
    questions: [
      {
        q: 'How to handle file uploads and downloads in Spring MVC?',
        a: `<pre><code>// Configuration
spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 50MB

// Upload
@PostMapping("/files")
public ResponseEntity&lt;FileResponse&gt; upload(@RequestParam("file") MultipartFile file) {
    // Validate
    if (file.isEmpty()) throw new BadRequestException("Empty file");
    String contentType = file.getContentType();
    if (!ALLOWED_TYPES.contains(contentType)) throw new BadRequestException("Invalid type");
    
    // Sanitize filename (security!)
    String filename = UUID.randomUUID() + getExtension(file.getOriginalFilename());
    Path target = uploadDir.resolve(filename);
    Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
    
    return ResponseEntity.created(URI.create("/files/" + filename))
        .body(new FileResponse(filename, file.getSize()));
}

// Multiple files
@PostMapping("/files/batch")
public List&lt;FileResponse&gt; uploadMultiple(@RequestParam("files") List&lt;MultipartFile&gt; files) {
    return files.stream().map(this::processUpload).toList();
}

// Download
@GetMapping("/files/{filename}")
public ResponseEntity&lt;Resource&gt; download(@PathVariable String filename) {
    Path file = uploadDir.resolve(filename);
    Resource resource = new UrlResource(file.toUri());
    
    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_OCTET_STREAM)
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
        .body(resource);
}

// Stream large file (memory efficient)
@GetMapping("/files/{id}/stream")
public void streamFile(@PathVariable String id, HttpServletResponse response) {
    response.setContentType("application/octet-stream");
    try (InputStream is = storageService.getStream(id);
         OutputStream os = response.getOutputStream()) {
        is.transferTo(os); // Java 9+
    }
}</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
];

export default sections;
