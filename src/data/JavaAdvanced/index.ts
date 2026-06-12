import type { Section } from '../../types';

const sections: Section[] = [
  {
    title: 'JVM Internals & Memory',
    questions: [
      {
        q: 'Explain JVM memory areas. What goes where?',
        a: `<pre><code>┌─────────────────────────────────────────────┐
│                 JVM Memory                    │
├──────────────┬──────────────────────────────┤
│  Heap        │  Shared across all threads    │
│  ├─ Young Gen│  Eden + S0 + S1              │
│  └─ Old Gen  │  Long-lived objects           │
├──────────────┼──────────────────────────────┤
│  Metaspace   │  Class metadata (off-heap)    │
├──────────────┼──────────────────────────────┤
│  Stack       │  Per thread: frames, locals   │
├──────────────┼──────────────────────────────┤
│  PC Register │  Per thread: current instr    │
├──────────────┼──────────────────────────────┤
│  Native Stack│  Per thread: native methods   │
└──────────────┴──────────────────────────────┘</code></pre>
<ul>
<li><strong>Heap:</strong> Objects, arrays, instance variables</li>
<li><strong>Stack:</strong> Primitives (local), method frames, references</li>
<li><strong>Metaspace:</strong> Class definitions, method metadata, constant pool</li>
<li><strong>String Pool:</strong> In heap (Java 7+), interned strings</li>
</ul>`,
        level: 'intermediate' as const
      },
      {
        q: 'Explain Garbage Collection algorithms. G1 vs ZGC vs Parallel GC.',
        a: `<ul>
<li><strong>Serial GC:</strong> Single-threaded STW. Small heaps/client apps.</li>
<li><strong>Parallel GC:</strong> Multi-threaded. Default Java 8. Throughput-focused.</li>
<li><strong>G1 GC (default Java 9+):</strong> Region-based, concurrent marking, pause targets &lt;200ms.</li>
<li><strong>ZGC (Java 15+):</strong> Sub-millisecond pauses. Multi-TB heaps. Latency-sensitive apps.</li>
<li><strong>Shenandoah:</strong> Similar to ZGC. Concurrent compaction.</li>
</ul>
<pre><code># G1 tuning
-XX:+UseG1GC -XX:MaxGCPauseMillis=100 -XX:G1HeapRegionSize=16m

# ZGC for ultra-low latency
-XX:+UseZGC -XX:+ZGenerational -Xmx16g

# GC logging
-Xlog:gc*:file=gc.log:time,uptime,level,tags</code></pre>
<div class="highlight"><strong>Rule:</strong> G1 for most web services. ZGC for &lt;1ms pause needs. Parallel for batch processing.</div>`,
        level: 'advanced' as const
      },
      {
        q: 'Walk through a production OutOfMemoryError diagnosis.',
        a: `<pre><code>// OOM Types:
// java.lang.OutOfMemoryError: Java heap space → Object allocation failed
// java.lang.OutOfMemoryError: Metaspace → Too many classes loaded
// java.lang.OutOfMemoryError: GC overhead limit exceeded → 98% time in GC

// Step 1: Enable heap dump on OOM
-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/heapdump.hprof

// Step 2: Analyze with Eclipse MAT or VisualVM
// Look for: Dominator tree, retained size, leak suspects report

// Step 3: Common fixes
// - Unbounded caches → Use Caffeine with maxSize + expiry
// - Large queries without pagination → Add LIMIT/pagination
// - Byte array accumulation → Streaming processing
// - ClassLoader leaks → Fix hot-reload, use WeakReferences

// Step 4: Monitor with JFR (Java Flight Recorder)
-XX:+FlightRecorder -XX:StartFlightRecording=duration=60s,filename=rec.jfr

// Step 5: Tune heap
-Xms4g -Xmx4g  // Set min=max to avoid resize pauses
-XX:MaxMetaspaceSize=512m  // Limit metaspace</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'What are memory leaks in Java? Give real production examples.',
        a: `<pre><code>// 1. Static collections growing indefinitely
static Map&lt;String, Session&gt; sessions = new HashMap&lt;&gt;(); // Never evicted!
// Fix: Use Caffeine cache with TTL

// 2. Unclosed resources (connections, streams)
Connection conn = ds.getConnection(); // Never closed
// Fix: try-with-resources

// 3. Inner class holding outer reference
class Outer { byte[] data = new byte[10_MB];
    class Inner { } // Implicit ref to Outer — holds 10MB
}
// Fix: static inner class

// 4. ThreadLocal in thread pools
threadLocal.set(heavyObject);
// Thread returned to pool → object retained!
// Fix: remove() in finally block

// 5. Event listeners not deregistered
observable.addListener(this); // this never GC'd
// Fix: WeakReference listeners or explicit deregister

// 6. String.substring() in old Java (pre-7u6)
// Shared char[] kept entire string in memory
// Fix: new String(original.substring(0, 10))

// Detection: jmap -histo PID | head -30
// Eclipse MAT → Leak Suspects report</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'How does JIT compilation work? What is tiered compilation?',
        a: `<pre><code>// JIT (Just-In-Time): Compiles hot bytecode to native machine code at runtime
// Steps:
// 1. Bytecode interpreted initially (fast startup)
// 2. JVM profiles execution (hotspot detection)
// 3. Hot methods compiled to native code (C1 then C2 compiler)
// 4. Aggressive optimizations applied (inlining, escape analysis, etc.)

// Tiered Compilation (default Java 8+):
// Level 0: Interpreter
// Level 1-3: C1 compiler (fast compile, basic optimizations)
// Level 4: C2 compiler (slow compile, aggressive optimizations)

// Key JIT optimizations:
// - Method inlining: Small methods copied into caller (avoids call overhead)
// - Escape analysis: Object allocated on STACK if it doesn't escape method
// - Dead code elimination: Unreachable code removed
// - Loop unrolling: Reduce loop overhead
// - Null check elimination: Proven non-null → skip checks

// Flags:
-XX:+PrintCompilation           // See what's compiled
-XX:CompileThreshold=10000      // Invocations before compile (default)
-XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining

// GraalVM: Ahead-of-Time (AOT) compilation
// Compiles to native binary at build time → instant startup, lower memory
// Trade-off: No runtime optimization, limited reflection</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'Explain class loading mechanism and the delegation model.',
        a: `<pre><code>// ClassLoader Hierarchy (Parent Delegation Model):
// Bootstrap ClassLoader (native) — java.lang.*, java.util.*
//   └── Platform ClassLoader — java.sql, java.xml
//       └── Application ClassLoader — classpath classes
//           └── Custom ClassLoaders — plugins, hot-reload

// How it works:
// 1. Check if already loaded (findLoadedClass)
// 2. Delegate to PARENT first (recursive up to Bootstrap)
// 3. If parent can't load → try self (findClass)
// This prevents: user code replacing java.lang.String!

// Custom ClassLoader (plugin system):
public class PluginClassLoader extends ClassLoader {
    private final Path pluginDir;
    @Override
    protected Class&lt;?&gt; findClass(String name) throws ClassNotFoundException {
        byte[] bytes = Files.readAllBytes(pluginDir.resolve(name.replace('.', '/') + ".class"));
        return defineClass(name, bytes, 0, bytes.length);
    }
}

// ClassLoader issues:
// - ClassCastException across loaders (same class, different loader = different type!)
// - Metaspace leaks on hot-redeploy (classes not GC'd if reference held)
// - Context ClassLoader for SPI (ServiceLoader, JDBC)</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'Design Patterns',
    questions: [
      {
        q: 'Singleton pattern — thread-safe implementations and Spring beans.',
        a: `<pre><code>// 1. Eager initialization (simplest)
public class Singleton {
    private static final Singleton INSTANCE = new Singleton();
    private Singleton() {}
    public static Singleton getInstance() { return INSTANCE; }
}

// 2. Double-checked locking (lazy + thread-safe)
public class Singleton {
    private static volatile Singleton instance; // volatile is CRUCIAL
    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) instance = new Singleton();
            }
        }
        return instance;
    }
}

// 3. Enum singleton (best — handles serialization + reflection attacks)
public enum Singleton { INSTANCE; public void doWork() {} }

// 4. Spring beans: Singleton by default (per ApplicationContext)
@Service // Singleton scope
public class OrderService { }
// Use @Scope("prototype") for new instances each time</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Builder, Factory, and Strategy patterns — when to use each?',
        a: `<p><strong>Builder:</strong> Complex construction with many optional parameters.</p>
<pre><code>Order order = Order.builder()
    .customerId("C123").addItem("SKU-1", 2)
    .shippingAddress(addr).paymentMethod(UPI).build();</code></pre>
<p><strong>Factory:</strong> Decouple creation from client. Hide concrete types.</p>
<pre><code>Notification n = factory.create("SMS");   // SmsNotification
Notification n = factory.create("EMAIL"); // EmailNotification</code></pre>
<p><strong>Strategy:</strong> Interchangeable algorithms at runtime.</p>
<pre><code>interface PricingStrategy { BigDecimal calculate(Order o); }
class RegularPricing implements PricingStrategy { ... }
class PremiumPricing implements PricingStrategy { ... }

PricingStrategy strategy = strategies.get(customer.getTier());
BigDecimal price = strategy.calculate(order);</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Explain Observer, Decorator, and Template Method patterns.',
        a: `<p><strong>Observer:</strong> One-to-many dependency. When subject changes, all observers notified.</p>
<pre><code>// Spring Events (Observer pattern)
@Component
public class OrderEventListener {
    @EventListener
    public void onOrderCreated(OrderCreatedEvent event) {
        sendConfirmationEmail(event.getOrder());
    }
}
applicationEventPublisher.publishEvent(new OrderCreatedEvent(order));</code></pre>
<p><strong>Decorator:</strong> Add behavior dynamically without modifying original class.</p>
<pre><code>// java.io uses Decorator pattern
InputStream is = new BufferedInputStream(
    new GZIPInputStream(
        new FileInputStream("data.gz"))); // Each wraps the previous</code></pre>
<p><strong>Template Method:</strong> Define algorithm skeleton, let subclasses fill in steps.</p>
<pre><code>abstract class DataProcessor {
    public final void process() { // Template (final — can't override)
        readData();
        transform();    // Abstract — subclass implements
        writeOutput();  // Abstract — subclass implements
        cleanup();
    }
}</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'What is the Chain of Responsibility pattern? Real-world examples.',
        a: `<pre><code>// Chain of Responsibility: Pass request along a chain of handlers
// Each handler decides to process or pass to next

// Real-world: Servlet Filters, Spring Security filter chain, logging levels

public interface Handler {
    void setNext(Handler next);
    void handle(Request request);
}

public class AuthenticationHandler implements Handler {
    private Handler next;
    public void handle(Request req) {
        if (!isAuthenticated(req)) throw new UnauthorizedException();
        if (next != null) next.handle(req); // Pass to next
    }
}

public class RateLimitHandler implements Handler {
    private Handler next;
    public void handle(Request req) {
        if (isRateLimited(req)) throw new TooManyRequestsException();
        if (next != null) next.handle(req);
    }
}

// Spring Security filter chain:
// SecurityContextPersistenceFilter → CsrfFilter → UsernamePasswordAuthFilter
// → ExceptionTranslationFilter → FilterSecurityInterceptor

// Servlet Filter chain:
@Component
public class LoggingFilter implements Filter {
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) {
        log.info("Before");
        chain.doFilter(req, res); // Next in chain
        log.info("After");
    }
}</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Explain Proxy pattern and how Spring AOP uses it.',
        a: `<pre><code>// Proxy: Surrogate/placeholder that controls access to target object

// JDK Dynamic Proxy (interface-based)
InvocationHandler handler = (proxy, method, args) -&gt; {
    log.info("Before: " + method.getName());
    Object result = method.invoke(target, args); // Delegate to real object
    log.info("After: " + method.getName());
    return result;
};
Service proxy = (Service) Proxy.newProxyInstance(
    classLoader, new Class[]{Service.class}, handler);

// CGLIB Proxy (class-based, used when no interface)
// Creates subclass of target → overrides methods
// Cannot proxy final classes/methods!

// Spring AOP uses proxies:
@Aspect @Component
public class LoggingAspect {
    @Around("@annotation(Loggable)")
    public Object log(ProceedingJoinPoint pjp) throws Throwable {
        log.info("Calling: {}", pjp.getSignature());
        long start = System.currentTimeMillis();
        Object result = pjp.proceed(); // Call actual method
        log.info("Completed in {}ms", System.currentTimeMillis() - start);
        return result;
    }
}

// Spring creates proxy:
// @Transactional → TransactionInterceptor proxy
// @Cacheable → CacheInterceptor proxy
// @Async → AsyncExecutionInterceptor proxy

// GOTCHA: Self-invocation bypasses proxy!
@Service
public class OrderService {
    @Transactional
    public void create() { validate(); } // validate() NOT proxied!
    @Transactional
    public void validate() { } // Only proxied when called from OUTSIDE
}</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'Java 8-21 Features',
    questions: [
      {
        q: 'Records, Sealed classes, and Pattern matching (Java 14-21).',
        a: `<pre><code>// Records (Java 16): Immutable data carriers
public record OrderDTO(String id, String status, BigDecimal total) {
    public OrderDTO { // Compact constructor for validation
        Objects.requireNonNull(id);
        if (total.compareTo(BigDecimal.ZERO) &lt; 0) throw new IllegalArgumentException();
    }
}

// Sealed classes (Java 17): Restrict subclasses
public sealed interface Shape permits Circle, Rectangle, Triangle {}
public record Circle(double radius) implements Shape {}
public record Rectangle(double w, double h) implements Shape {}

// Pattern matching (Java 21): Exhaustive switch
double area = switch (shape) {
    case Circle c    -&gt; Math.PI * c.radius() * c.radius();
    case Rectangle r -&gt; r.w() * r.h();
    case Triangle t  -&gt; calculateArea(t);
};

// Guarded patterns
String classify = switch (obj) {
    case Integer i when i &gt; 0 -&gt; "positive";
    case Integer i             -&gt; "non-positive";
    case String s when s.isBlank() -&gt; "blank";
    case null -&gt; "null";
    default -&gt; "other";
};</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Virtual Threads (Java 21) — how do they differ from platform threads?',
        a: `<p><strong>Platform threads:</strong> 1:1 with OS threads. ~1MB stack. Limited to thousands.</p>
<p><strong>Virtual threads:</strong> Lightweight (~few KB). Millions possible. Auto-unmount during blocking I/O.</p>
<pre><code>// Creating virtual threads
Thread.ofVirtual().start(() -&gt; {
    httpClient.send(request);  // Unmounts during I/O
    database.save(result);     // Unmounts during DB wait
});

// ExecutorService with virtual threads
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    List&lt;Future&lt;String&gt;&gt; futures = IntStream.range(0, 100_000)
        .mapToObj(i -&gt; executor.submit(() -&gt; fetch(urls.get(i))))
        .toList();
}

// Spring Boot 3.2+
spring.threads.virtual.enabled=true // All request threads become virtual</code></pre>
<div class="highlight"><strong>When to use:</strong> I/O-bound workloads. NOT for CPU-bound. Don't pool them.</div>
<div class="warning"><strong>Gotchas:</strong> synchronized pins virtual threads (use ReentrantLock). ThreadLocal expensive at scale (use ScopedValues).</div>`,
        level: 'advanced' as const
      },
      {
        q: 'What are the key additions in Java 11, 14, 17, and 21 (LTS versions)?',
        a: `<pre><code>// Java 11 (LTS):
var list = List.of("a", "b");           // Local variable type inference (Java 10)
String s = " hi ".strip();              // strip(), isBlank(), repeat()
HttpClient client = HttpClient.newHttpClient(); // New HTTP client
Files.readString(path); Files.writeString(path, content);

// Java 14:
// Switch expressions (preview → standard)
int result = switch(day) { case MON, TUE -&gt; 1; default -&gt; 0; };
// Records (preview), instanceof pattern matching (preview)
if (obj instanceof String s) { s.length(); } // No cast needed!

// Java 17 (LTS):
// Sealed classes, Pattern matching for switch (preview)
// Removed: SecurityManager, RMI Activation, Applet API
// Text blocks (standard from Java 15)

// Java 21 (LTS):
// Virtual threads (standard), Pattern matching for switch (standard)
// Record patterns: case Point(int x, int y) when x &gt; 0 -&gt; ...
// Sequenced collections: list.getFirst(), list.getLast(), list.reversed()
// String templates (preview): STR."Hello \\{name}"
// Scoped Values (preview): Replace ThreadLocal for virtual threads
// Structured Concurrency (preview): Manage child tasks as unit</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'What is Structured Concurrency (Java 21 preview)?',
        a: `<pre><code>// Problem: Managing related concurrent tasks is error-prone
// If one subtask fails, others should be cancelled

// Structured Concurrency: Treat concurrent tasks as a unit
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Subtask&lt;User&gt; userTask = scope.fork(() -&gt; fetchUser(id));
    Subtask&lt;List&lt;Order&gt;&gt; ordersTask = scope.fork(() -&gt; fetchOrders(id));
    Subtask&lt;Balance&gt; balanceTask = scope.fork(() -&gt; fetchBalance(id));
    
    scope.join();           // Wait for all
    scope.throwIfFailed();  // Propagate first failure
    
    return new UserProfile(userTask.get(), ordersTask.get(), balanceTask.get());
} // If any fails → others cancelled automatically

// ShutdownOnSuccess: Return first successful result
try (var scope = new StructuredTaskScope.ShutdownOnSuccess&lt;String&gt;()) {
    scope.fork(() -&gt; fetchFromPrimary());
    scope.fork(() -&gt; fetchFromFallback());
    scope.join();
    return scope.result(); // First to complete wins
}

// Benefits:
// 1. Automatic cancellation on failure
// 2. Clear parent-child relationship (observable in thread dumps)
// 3. Works naturally with virtual threads
// 4. No resource leaks (scope is AutoCloseable)</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'Serialization & Reflection',
    questions: [
      {
        q: 'Java serialization pitfalls and modern alternatives.',
        a: `<pre><code>// Java Serialization — AVOID in production
// Problems: Security (deserialization attacks), performance, coupling

// If you must:
public class Order implements Serializable {
    private static final long serialVersionUID = 1L;
    private transient Logger log;       // Not serialized
    private transient Connection conn;  // Not serialized
}

// MODERN ALTERNATIVES:
// JSON: Jackson (fastest), Gson
// Binary: Protocol Buffers, Avro (Kafka), Kryo (caching)

// | Format   | Speed  | Size   | Schema | Use Case           |
// | JSON     | Medium | Large  | None   | REST APIs          |
// | Protobuf | Fast   | Small  | .proto | gRPC, microservices|
// | Avro     | Fast   | Small  | .avsc  | Kafka, schema evol |
// | Kryo     | Fastest| Tiny   | None   | Internal caching   |

// Jackson best practices:
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(Include.NON_NULL)
public record OrderDTO(
    @JsonProperty("order_id") String orderId,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'") Instant createdAt
) {}</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How does Reflection work? Performance implications.',
        a: `<pre><code>// Reflection: Inspect/manipulate classes/methods/fields at runtime
// Used by: Spring DI, JPA, Jackson, JUnit

Class&lt;?&gt; clazz = Class.forName("com.example.Order");
Object instance = clazz.getDeclaredConstructor().newInstance();

Field field = clazz.getDeclaredField("amount");
field.setAccessible(true);
BigDecimal value = (BigDecimal) field.get(instance);

Method method = clazz.getMethod("calculate", BigDecimal.class);
method.invoke(instance, discount);

// Performance: ~5-50x SLOWER than direct call
// Why: No inlining, access checks, boxing

// Mitigations:
// 1. Cache Method/Field references
// 2. MethodHandles (Java 7+): Near direct-call speed
MethodHandle handle = MethodHandles.lookup()
    .findVirtual(Order.class, "calculate", methodType);

// 3. Code generation at build time (Quarkus, Micronaut)
// 4. Java 9+ modules restrict deep reflection
//    --add-opens java.base/java.lang=ALL-UNNAMED</code></pre>
<div class="highlight">Spring caches reflection metadata. Newer frameworks use compile-time code generation to avoid it entirely.</div>`,
        level: 'intermediate' as const
      },
      {
        q: 'What are Annotations? How to create custom annotations?',
        a: `<pre><code>// Annotations: Metadata about code. Processed at compile-time or runtime.

// Retention policies:
// SOURCE → Discarded by compiler (e.g., @Override, @SuppressWarnings)
// CLASS → In .class file but not at runtime (default)
// RUNTIME → Available via reflection (Spring, JPA annotations)

// Custom annotation:
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface Cacheable {
    String value() default "";
    int ttlSeconds() default 300;
}

// Processing with reflection:
Method method = clazz.getMethod("getUser");
if (method.isAnnotationPresent(Cacheable.class)) {
    Cacheable ann = method.getAnnotation(Cacheable.class);
    int ttl = ann.ttlSeconds();
}

// Annotation processing at compile time (generates code):
@AutoValue // Google AutoValue → generates equals/hashCode/toString at compile time
public abstract class Money {
    abstract Currency currency();
    abstract BigDecimal amount();
}

// Spring meta-annotations (compose annotations):
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Service
@Transactional
public @interface TransactionalService { } // Combines both!</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'Modules & Modern Java',
    questions: [
      {
        q: 'What is the Java Module System (JPMS)? When to use it?',
        a: `<pre><code>// Java Platform Module System (Java 9+)
// Purpose: Strong encapsulation + reliable dependencies

// module-info.java
module com.myapp.orders {
    requires java.sql;                    // Dependency
    requires transitive com.myapp.common; // Transitive dep
    exports com.myapp.orders.api;         // Public API
    opens com.myapp.orders.model to jackson.databind; // Reflection access
    provides OrderService with OrderServiceImpl; // SPI
}

// Benefits:
// 1. Compile-time dependency checking (no runtime ClassNotFoundException)
// 2. Strong encapsulation (internal packages truly hidden)
// 3. Smaller runtime images (jlink)
// 4. Improved security (no deep reflection by default)

// When to use:
// Libraries/frameworks → Yes (controls public API surface)
// Applications → Optional (most use classpath still)
// Microservices → Usually not needed (single deployable)

// jlink: Create custom JRE with only needed modules
jlink --module-path $JAVA_HOME/jmods --add-modules com.myapp --output custom-jre
// Result: 30-50MB custom JRE vs 300MB full JDK</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'How does the ServiceLoader (SPI) pattern work?',
        a: `<pre><code>// ServiceLoader: Plugin mechanism. Interface in one module, implementations in others.

// 1. Define interface (in API module)
public interface PaymentGateway {
    boolean charge(BigDecimal amount, String token);
}

// 2. Implementation (in provider module)
public class StripeGateway implements PaymentGateway {
    public boolean charge(BigDecimal amount, String token) { ... }
}

// 3. Register: META-INF/services/com.example.PaymentGateway
// Contains: com.example.stripe.StripeGateway

// 4. Load at runtime:
ServiceLoader&lt;PaymentGateway&gt; loader = ServiceLoader.load(PaymentGateway.class);
for (PaymentGateway gw : loader) {
    gw.charge(amount, token);
}

// With modules (module-info.java):
module stripe.provider {
    provides com.example.PaymentGateway with com.stripe.StripeGateway;
}

// Real-world SPI usage:
// JDBC drivers (java.sql.Driver)
// SLF4J logging providers
// Java Cryptography extensions
// Spring Boot auto-configuration discovery</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'What are Preview Features and Incubator modules in Java?',
        a: `<pre><code>// Preview Features: Fully specified but may change. Need --enable-preview.
// Purpose: Get community feedback before finalizing.
// Examples: Records (preview in 14-15, final in 16), Virtual Threads (preview in 19-20, final in 21)

// To use:
// javac --enable-preview --release 21 MyApp.java
// java --enable-preview MyApp

// Incubator Modules: Experimental APIs. May be removed.
// Example: jdk.incubator.vector (Vector API for SIMD)
// Must add: --add-modules jdk.incubator.vector

// Feature lifecycle:
// Incubator → Preview → Standard (or removed)
// Pattern matching: Java 14 (preview) → 16 (2nd preview) → 21 (final)

// Current previews in Java 21+:
// - String Templates: STR."Hello \\{name}"
// - Scoped Values: Replace ThreadLocal for virtual threads
// - Structured Concurrency: Manage concurrent subtasks
// - Foreign Function & Memory API: Replace JNI

// Why this matters for interviews:
// Shows awareness of Java evolution
// Know which features are production-ready vs experimental
// LTS versions (11, 17, 21) are what enterprises use</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'Performance & Profiling',
    questions: [
      {
        q: 'How do you profile a Java application? What tools do you use?',
        a: `<pre><code>// Profiling tools:
// 1. JFR (Java Flight Recorder) — built-in, low overhead (&lt;2%)
java -XX:+FlightRecorder -XX:StartFlightRecording=filename=app.jfr MyApp
// Analyze with JDK Mission Control (JMC)

// 2. async-profiler — CPU + allocation profiling, flame graphs
./profiler.sh -d 30 -f flamegraph.html &lt;pid&gt;

// 3. VisualVM — GUI: heap, threads, CPU, GC monitoring
// 4. JConsole — JMX-based monitoring
// 5. Arthas (Alibaba) — production diagnostics, hot-fix

// What to profile:
// CPU: Which methods consume most time?
// Memory: What objects are allocated most? GC pressure?
// Threads: Deadlocks? Thread pool saturation?
// I/O: Slow queries? Network latency?

// JFR events:
jdk.CPULoad, jdk.GCPausePhase, jdk.ThreadSleep
jdk.SocketRead, jdk.FileRead, jdk.ObjectAllocationOutsideTLAB

// Key JVM flags for monitoring:
-XX:+UnlockDiagnosticVMOptions
-XX:+DebugNonSafepoints    // Better profiler accuracy
-Xlog:gc*=info             // GC logging
-XX:NativeMemoryTracking=summary  // Track native memory</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'What is Escape Analysis? How does it optimize performance?',
        a: `<pre><code>// Escape Analysis: JIT determines if object reference "escapes" the method
// If it doesn't escape → aggressive optimizations possible

// Optimization 1: Stack allocation (no GC!)
public int sum(int a, int b) {
    Point p = new Point(a, b); // Never escapes this method
    return p.x + p.y;          // JIT allocates on stack (no heap, no GC)
}

// Optimization 2: Scalar replacement (eliminate object entirely)
// JIT replaces: Point p = new Point(x, y)
// With just: int p_x = x; int p_y = y;

// Optimization 3: Lock elimination
public void process() {
    Object lock = new Object(); // Lock doesn't escape
    synchronized(lock) { ... }  // JIT removes synchronization!
}

// When escape analysis FAILS (object escapes):
// - Stored in field, static, or collection
// - Passed to another method that stores it
// - Returned from method
// - Used with reflection

// Check if working:
-XX:+PrintEscapeAnalysis -XX:+PrintEliminateAllocations

// Impact: Can reduce garbage collection significantly for short-lived objects
// Example: Stream operations create many temporary objects →
// escape analysis can eliminate most of them</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'How do you benchmark Java code correctly? What is JMH?',
        a: `<pre><code>// WRONG way to benchmark:
long start = System.nanoTime();
for (int i = 0; i &lt; 1000000; i++) method();
long elapsed = System.nanoTime() - start; // UNRELIABLE!
// Problems: JIT warmup, GC pauses, dead code elimination, loop optimization

// CORRECT: Use JMH (Java Microbenchmark Harness)
@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.NANOSECONDS)
@Warmup(iterations = 5, time = 1)
@Measurement(iterations = 10, time = 1)
@Fork(2)  // Separate JVM forks
@State(Scope.Benchmark)
public class MapBenchmark {

    private Map&lt;String, Integer&gt; hashMap;
    private Map&lt;String, Integer&gt; treeMap;
    
    @Setup
    public void setup() {
        hashMap = new HashMap&lt;&gt;(); treeMap = new TreeMap&lt;&gt;();
        // populate...
    }

    @Benchmark
    public Integer hashMapGet() {
        return hashMap.get("key500"); // Must return to prevent dead code elimination
    }
    
    @Benchmark
    public Integer treeMapGet() {
        return treeMap.get("key500");
    }
}

// JMH handles: warmup, JIT compilation, GC, statistical analysis
// Results: mean, std dev, confidence intervals
// Blackhole.consume(result) — prevents dead code elimination</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
];

export default sections;
