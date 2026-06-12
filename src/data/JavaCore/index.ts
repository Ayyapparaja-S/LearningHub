import type { Section } from '../../types';

const sections: Section[] = [
  {
    title: 'OOP Concepts',
    questions: [
      {
        q: 'What are the four pillars of OOP? Explain with real-world examples.',
        a: `<p><strong>1. Encapsulation:</strong> Bundling data + methods, hiding internal state. Example: BankAccount class exposes deposit()/withdraw() but hides balance field.</p>
<p><strong>2. Inheritance:</strong> Child class inherits behavior from parent. Example: SavingsAccount extends BankAccount.</p>
<p><strong>3. Polymorphism:</strong> Same interface, different behavior. Method overriding (runtime) and overloading (compile-time).</p>
<p><strong>4. Abstraction:</strong> Hide complexity, show only essentials. Abstract classes and interfaces.</p>
<pre><code>// Polymorphism example
List&lt;Shape&gt; shapes = List.of(new Circle(5), new Rectangle(3,4));
shapes.forEach(s -&gt; System.out.println(s.area())); // Each calls its own implementation</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'What is the difference between Abstract class and Interface in Java 8+?',
        a: `<ul>
<li><strong>Abstract class:</strong> Can have state (instance variables), constructors, concrete methods. Single inheritance only.</li>
<li><strong>Interface:</strong> No state (only constants), no constructors. Can have default/static methods (Java 8+), private methods (Java 9+). Multiple inheritance supported.</li>
</ul>
<p><strong>When to use:</strong></p>
<ul>
<li>Interface: Define a contract/capability (Serializable, Comparable, Runnable)</li>
<li>Abstract class: Share code among closely related classes with common state</li>
</ul>
<pre><code>// Interface with default method (Java 8+)
public interface Payable {
    BigDecimal calculatePay();
    default String getPaymentMethod() { return "BANK_TRANSFER"; }
}

// Abstract class with state
public abstract class Employee {
    protected String name;
    protected double baseSalary;
    public Employee(String name, double baseSalary) { this.name = name; this.baseSalary = baseSalary; }
    public abstract double calculateBonus();
}</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'Explain SOLID principles with examples.',
        a: `<p><strong>S — Single Responsibility:</strong> A class should have only one reason to change.</p>
<pre><code>// BAD: UserService handles auth + email + DB
// GOOD: AuthService, EmailService, UserRepository (separate concerns)</code></pre>
<p><strong>O — Open/Closed:</strong> Open for extension, closed for modification.</p>
<pre><code>interface PaymentStrategy { void pay(BigDecimal amount); }
class CreditCardPayment implements PaymentStrategy { ... }
class UPIPayment implements PaymentStrategy { ... } // New - no changes to existing</code></pre>
<p><strong>L — Liskov Substitution:</strong> Subtypes must be substitutable for their base types.</p>
<p><strong>I — Interface Segregation:</strong> Don't force clients to depend on unused methods.</p>
<p><strong>D — Dependency Inversion:</strong> Depend on abstractions, not concretions.</p>
<pre><code>// BAD: OrderService directly creates new MySQLRepository()
// GOOD: OrderService depends on OrderRepository interface (injected)</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'What is method overloading vs method overriding? Can you override static methods?',
        a: `<p><strong>Overloading (compile-time):</strong> Same method name, different parameters. Resolved at compile time.</p>
<p><strong>Overriding (runtime):</strong> Same signature in subclass. Resolved at runtime via dynamic dispatch.</p>
<pre><code>// Overloading
public int add(int a, int b) { return a + b; }
public double add(double a, double b) { return a + b; }

// Overriding
class Animal { public void sound() { System.out.println("..."); } }
class Dog extends Animal { 
    @Override public void sound() { System.out.println("Bark"); }
}

// Static methods CANNOT be overridden — they are HIDDEN
class Parent { static void greet() { System.out.println("Parent"); } }
class Child extends Parent { static void greet() { System.out.println("Child"); } }
Parent p = new Child();
p.greet(); // "Parent" — resolved by reference type, not object type</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'Explain the "diamond problem" in Java. How does Java handle it?',
        a: `<p>When a class inherits from two interfaces with the same default method, which implementation is used?</p>
<pre><code>interface Flyable { default void move() { System.out.println("Flying"); } }
interface Swimmable { default void move() { System.out.println("Swimming"); } }

// Compiler ERROR — must override to resolve
class Duck implements Flyable, Swimmable {
    @Override
    public void move() {
        Flyable.super.move(); // Explicitly choose
    }
}

// Resolution rules:
// 1. Class method wins over interface default method
// 2. More specific interface wins (sub-interface over parent)
// 3. If still ambiguous → compiler error, must override</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'What is composition over inheritance? Give a real-world scenario.',
        a: `<p><strong>Inheritance (IS-A):</strong> Tight coupling, fragile base class problem.</p>
<p><strong>Composition (HAS-A):</strong> Loose coupling, more flexible.</p>
<pre><code>// BAD: Stack extends ArrayList (Stack IS NOT a List!)
class Stack extends ArrayList {
    // Client can call add(0, item), remove(index) — breaks stack semantics!
}

// GOOD: Composition
class Stack {
    private final List&lt;Object&gt; items = new ArrayList&lt;&gt;(); // HAS-A
    public void push(Object o) { items.add(o); }
    public Object pop() { return items.remove(items.size()-1); }
    // Only stack operations exposed
}

// Real-world: Strategy pattern uses composition
class PaymentProcessor {
    private PaymentStrategy strategy; // Compose behavior at runtime
    public void setStrategy(PaymentStrategy s) { this.strategy = s; }
    public void process(Order order) { strategy.pay(order.getTotal()); }
}</code></pre>
<p><strong>Rule:</strong> Prefer composition unless there's a genuine IS-A relationship with shared behavior.</p>`,
        level: 'intermediate' as const
      },
      {
        q: 'What is the difference between shallow copy and deep copy?',
        a: `<pre><code>// Shallow copy: New object, but nested references point to same objects
Employee e1 = new Employee("John", new Address("NYC"));
Employee e2 = e1.clone(); // Shallow
e2.address.setCity("LA"); // ALSO changes e1.address!

// Deep copy: Completely independent copy of all nested objects
@Override
protected Employee clone() {
    Employee cloned = (Employee) super.clone();
    cloned.address = new Address(this.address.getCity()); // New copy
    return cloned;
}

// Modern alternatives to clone():
// 1. Copy constructor
public Employee(Employee other) {
    this.name = other.name;
    this.address = new Address(other.address);
}
// 2. Static factory: Employee.copyOf(original)
// 3. Records are immutable — no need to copy!</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Explain access modifiers in Java and their scope.',
        a: `<table style="width:100%; border-collapse:collapse;">
<tr><th style="text-align:left; padding:0.4rem;">Modifier</th><th style="padding:0.4rem;">Class</th><th style="padding:0.4rem;">Package</th><th style="padding:0.4rem;">Subclass</th><th style="padding:0.4rem;">World</th></tr>
<tr><td style="padding:0.4rem">private</td><td style="text-align:center">✓</td><td style="text-align:center">✗</td><td style="text-align:center">✗</td><td style="text-align:center">✗</td></tr>
<tr><td style="padding:0.4rem">default</td><td style="text-align:center">✓</td><td style="text-align:center">✓</td><td style="text-align:center">✗</td><td style="text-align:center">✗</td></tr>
<tr><td style="padding:0.4rem">protected</td><td style="text-align:center">✓</td><td style="text-align:center">✓</td><td style="text-align:center">✓</td><td style="text-align:center">✗</td></tr>
<tr><td style="padding:0.4rem">public</td><td style="text-align:center">✓</td><td style="text-align:center">✓</td><td style="text-align:center">✓</td><td style="text-align:center">✓</td></tr>
</table>
<pre><code>// protected in Java = package access + subclass access (even in different package)
// Best practice: Fields → private, API → public, hooks → protected</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'What does the final keyword do for classes, methods, and variables?',
        a: `<pre><code>// final class → Cannot be extended
public final class String { } // Security + immutability guarantee

// final method → Cannot be overridden
public final void validate() { /* Template method — cannot change */ }

// final variable → Cannot be reassigned (NOT same as immutable!)
final List&lt;String&gt; names = new ArrayList&lt;&gt;();
names.add("John");     // OK! Contents can change
names = new ArrayList&lt;&gt;(); // COMPILE ERROR! Cannot reassign

// Effectively final (Java 8+): Never reassigned after init
String name = "John"; // effectively final — usable in lambdas
Consumer&lt;String&gt; printer = s -&gt; System.out.println(name + s);

// Blank final: Must be assigned in constructor
class Config {
    private final String dbUrl; // Assigned in constructor
    public Config(String url) { this.dbUrl = url; }
}</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'What is the Object class? List important methods every Java developer should know.',
        a: `<pre><code>// Object is the root of all classes. Every class implicitly extends Object.
// Important methods:

// 1. equals(Object o) — logical equality
// 2. hashCode() — hash for HashMap/HashSet (contract with equals)
// 3. toString() — String representation
// 4. clone() — creates a copy (use carefully)
// 5. getClass() — returns runtime Class object
// 6. finalize() — DEPRECATED. Use Cleaner or try-with-resources
// 7. wait()/notify()/notifyAll() — thread communication (monitor-based)

// toString() best practice:
@Override
public String toString() {
    return "Order{id='%s', status=%s, total=%s}".formatted(id, status, total);
}

// Why override equals/hashCode together?
// HashMap uses hashCode() to find bucket, then equals() to find exact key
// If hashCode not overridden: same logical object → different bucket → lost!

// getClass() vs instanceof:
obj.getClass() == MyClass.class; // Exact type match only
obj instanceof MyClass;          // Includes subclasses</code></pre>`,
        level: 'basic' as const
      },
    ]
  },
  {
    title: 'Collections Framework',
    questions: [
      {
        q: 'Explain the internal working of HashMap. What happens during a put() operation?',
        a: `<p><strong>Internal Structure:</strong> Array of Node (bucket array) + linked list/red-black tree for collisions.</p>
<ol>
<li>Calculate hash: <code>hash = key.hashCode() ^ (key.hashCode() &gt;&gt;&gt; 16)</code></li>
<li>Find bucket: <code>index = hash &amp; (capacity - 1)</code></li>
<li>If bucket empty → insert new Node</li>
<li>If key exists (equals()) → replace value</li>
<li>If collision → append to linked list</li>
<li>If list length &gt; 8 AND capacity &gt;= 64 → convert to red-black tree</li>
<li>If size &gt; capacity * 0.75 → resize (double, rehash)</li>
</ol>
<pre><code>// hashCode() → determines bucket
// equals() → finds exact key within bucket
// Contract: if a.equals(b), then a.hashCode() == b.hashCode()</code></pre>
<div class="highlight"><strong>Java 8:</strong> Treeification reduces worst-case from O(n) to O(log n).</div>`,
        level: 'intermediate' as const
      },
      {
        q: 'ConcurrentHashMap vs synchronizedMap — when to use which?',
        a: `<pre><code>// synchronizedMap: Single lock wrapping entire map. One thread at a time.
Map&lt;String, Integer&gt; syncMap = Collections.synchronizedMap(new HashMap&lt;&gt;());

// ConcurrentHashMap: Node-level CAS + synchronized (Java 8). High concurrency.
ConcurrentHashMap&lt;String, Integer&gt; chm = new ConcurrentHashMap&lt;&gt;();
chm.computeIfAbsent("key", k -&gt; compute(k));  // Atomic
chm.merge("key", 1, Integer::sum);              // Atomic increment

// CRITICAL DIFFERENCE: Compound operations
// synchronizedMap — NOT thread-safe without external sync:
if (!syncMap.containsKey("key")) {  // Race condition!
    syncMap.put("key", value);
}

// ConcurrentHashMap — atomic compound operations:
chm.putIfAbsent("key", value); // Atomic check-and-put</code></pre>
<p><strong>Use ConcurrentHashMap:</strong> High concurrency, atomic compound ops.</p>
<p><strong>Use synchronizedMap:</strong> Low contention, wrapping existing map.</p>`,
        level: 'advanced' as const
      },
      {
        q: 'ArrayList vs LinkedList — when to use which?',
        a: `<table style="width:100%; border-collapse:collapse;">
<tr><th style="text-align:left; padding:0.4rem;">Operation</th><th style="padding:0.4rem;">ArrayList</th><th style="padding:0.4rem;">LinkedList</th></tr>
<tr><td style="padding:0.4rem">get(index)</td><td style="text-align:center">O(1) ✅</td><td style="text-align:center">O(n)</td></tr>
<tr><td style="padding:0.4rem">add(end)</td><td style="text-align:center">O(1) amortized</td><td style="text-align:center">O(1)</td></tr>
<tr><td style="padding:0.4rem">add(middle)</td><td style="text-align:center">O(n) shift</td><td style="text-align:center">O(n) traverse</td></tr>
<tr><td style="padding:0.4rem">Memory</td><td style="text-align:center">Compact</td><td style="text-align:center">High (node+pointers)</td></tr>
</table>
<div class="highlight"><strong>Almost always use ArrayList.</strong> CPU cache locality makes it faster in practice. Use ArrayDeque for stack/queue operations.</div>`,
        level: 'basic' as const
      },
      {
        q: 'HashSet vs LinkedHashSet vs TreeSet — differences and use cases.',
        a: `<pre><code>// HashSet: No order, O(1) operations, backed by HashMap
Set&lt;String&gt; unique = new HashSet&lt;&gt;();

// LinkedHashSet: Insertion order preserved, O(1) operations
Set&lt;String&gt; ordered = new LinkedHashSet&lt;&gt;();

// TreeSet: Sorted order (natural or Comparator), O(log n), Red-Black tree
TreeSet&lt;Integer&gt; sorted = new TreeSet&lt;&gt;();
sorted.floor(12);    // Greatest element &lt;= 12
sorted.ceiling(12);  // Smallest element &gt;= 12
sorted.subSet(5, 15); // Range query

// TreeSet with custom Comparator
Set&lt;Employee&gt; bySalary = new TreeSet&lt;&gt;(
    Comparator.comparing(Employee::getSalary).reversed()
);</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'What is fail-fast vs fail-safe iterator behavior?',
        a: `<pre><code>// FAIL-FAST: ConcurrentModificationException if modified during iteration
List&lt;String&gt; list = new ArrayList&lt;&gt;(List.of("a", "b", "c"));
for (String s : list) {
    list.remove(s); // ConcurrentModificationException!
}
// Fix: Use iterator.remove() or list.removeIf()

// FAIL-SAFE: Works on copy/snapshot, no exception
CopyOnWriteArrayList&lt;String&gt; cowList = new CopyOnWriteArrayList&lt;&gt;();
for (String s : cowList) {
    cowList.remove(s); // NO exception — iterating snapshot
}

// ConcurrentHashMap: Weakly consistent (may see some concurrent updates)
// Trade-off: fail-fast = error detection; fail-safe = no errors but stale data</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Explain Queue, Deque, and PriorityQueue. When to use each?',
        a: `<pre><code>// PriorityQueue: Min-heap, O(log n) add/poll, O(1) peek
PriorityQueue&lt;Task&gt; taskQueue = new PriorityQueue&lt;&gt;(
    Comparator.comparingInt(Task::getPriority)
);

// ArrayDeque: Stack + Queue, faster than LinkedList
Deque&lt;String&gt; deque = new ArrayDeque&lt;&gt;();
deque.offerFirst("front");  // Queue front
deque.offerLast("back");    // Queue back
deque.push("top");          // Stack push
deque.pop();                // Stack pop

// BlockingQueue: Thread-safe, for producer-consumer
BlockingQueue&lt;Order&gt; queue = new LinkedBlockingQueue&lt;&gt;(100);
queue.put(order);   // Blocks if full
queue.take();       // Blocks if empty

// Use cases:
// ArrayDeque → Stack/Queue operations (replace Stack class)
// PriorityQueue → Top K problems, task scheduling, Dijkstra's
// BlockingQueue → Thread pools, producer-consumer</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Comparable vs Comparator — when to use each?',
        a: `<pre><code>// Comparable: Natural ordering defined IN the class (single sort)
public class Employee implements Comparable&lt;Employee&gt; {
    @Override
    public int compareTo(Employee other) {
        return Double.compare(this.salary, other.salary);
    }
}
Collections.sort(employees); // Uses compareTo

// Comparator: External ordering (multiple strategies, doesn't modify class)
Comparator&lt;Employee&gt; byName = Comparator.comparing(Employee::getName);
Comparator&lt;Employee&gt; byDeptThenSalary = Comparator
    .comparing(Employee::getDept)
    .thenComparing(Employee::getSalary, Comparator.reverseOrder());

// Null-safe comparator
Comparator&lt;Employee&gt; nullSafe = Comparator.nullsLast(
    Comparator.comparing(Employee::getName)
);

employees.sort(byDeptThenSalary);</code></pre>
<p>Comparable = java.lang, one ordering. Comparator = java.util, multiple orderings.</p>`,
        level: 'basic' as const
      },
      {
        q: 'What are WeakHashMap, IdentityHashMap, and EnumMap?',
        a: `<pre><code>// WeakHashMap: Keys held via WeakReference — GC can collect entries
// Use case: Caches that auto-evict when keys no longer used elsewhere
WeakHashMap&lt;Object, String&gt; cache = new WeakHashMap&lt;&gt;();

// IdentityHashMap: Uses == instead of equals() for key comparison
// Use case: Serialization graphs, object identity tracking
IdentityHashMap&lt;String, Integer&gt; map = new IdentityHashMap&lt;&gt;();
String s1 = new String("hi"), s2 = new String("hi");
map.put(s1, 1); map.put(s2, 2);
map.size(); // 2! (s1 != s2 by reference)

// EnumMap: Optimized for enum keys (array-backed, extremely fast)
EnumMap&lt;Status, List&lt;Order&gt;&gt; byStatus = new EnumMap&lt;&gt;(Status.class);

// EnumSet: Bit-vector for enum sets
EnumSet&lt;Permission&gt; perms = EnumSet.of(READ, WRITE);</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'How does the Collections.unmodifiableList() differ from List.of() and List.copyOf()?',
        a: `<pre><code>// Collections.unmodifiableList(): Unmodifiable VIEW of the original list
List&lt;String&gt; original = new ArrayList&lt;&gt;(List.of("a", "b"));
List&lt;String&gt; unmod = Collections.unmodifiableList(original);
unmod.add("c"); // UnsupportedOperationException
original.add("c"); // OK — and unmod now shows ["a", "b", "c"]!

// List.of(): Truly immutable list (Java 9+)
List&lt;String&gt; immutable = List.of("a", "b", "c");
immutable.add("d"); // UnsupportedOperationException
// No way to modify — no underlying mutable list exists
// Does NOT allow null elements

// List.copyOf(): Immutable copy (Java 10+)
List&lt;String&gt; copy = List.copyOf(original);
original.add("d"); // copy is NOT affected (independent copy)

// Summary:
// unmodifiableList → view, reflects changes to original
// List.of() → immutable, fixed at creation, no nulls
// List.copyOf() → immutable snapshot, no nulls</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'Streams & Functional Programming',
    questions: [
      {
        q: 'Explain intermediate vs terminal operations. What is lazy evaluation?',
        a: `<p><strong>Intermediate</strong> (return Stream, lazy): filter, map, flatMap, sorted, distinct, peek, limit, skip</p>
<p><strong>Terminal</strong> (trigger execution): collect, forEach, reduce, count, findFirst, anyMatch, toArray</p>
<pre><code>// Nothing executes until terminal operation!
Stream&lt;String&gt; stream = names.stream()
    .filter(n -&gt; { System.out.println("filter: " + n); return n.length() &gt; 3; })
    .map(String::toUpperCase); // Still nothing printed

List&lt;String&gt; result = stream.collect(Collectors.toList()); // NOW executes

// Benefits: short-circuiting, loop fusion, avoid unnecessary work
names.stream().filter(n -&gt; n.startsWith("A")).findFirst(); // Stops at first match</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'Group employees by department and find highest salary in each.',
        a: `<pre><code>Map&lt;String, Optional&lt;Employee&gt;&gt; highestByDept = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::getDepartment,
        Collectors.maxBy(Comparator.comparing(Employee::getSalary))
    ));

// Get actual salary values
Map&lt;String, Double&gt; maxSalaryByDept = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::getDepartment,
        Collectors.collectingAndThen(
            Collectors.maxBy(Comparator.comparing(Employee::getSalary)),
            opt -&gt; opt.map(Employee::getSalary).orElse(0.0)
        )
    ));

// Summary statistics
Map&lt;String, DoubleSummaryStatistics&gt; stats = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::getDepartment,
        Collectors.summarizingDouble(Employee::getSalary)
    ));
// stats.get("Engineering").getMax(), .getAverage(), .getCount()</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Explain flatMap vs map with real-world examples.',
        a: `<pre><code>// map: 1-to-1 transformation (T → R)
List&lt;String&gt; names = employees.stream()
    .map(Employee::getName).collect(toList());

// flatMap: 1-to-many, then flatten (T → Stream&lt;R&gt;)
// Get all skills from all employees
List&lt;String&gt; allSkills = employees.stream()
    .map(Employee::getSkills)      // Stream&lt;List&lt;String&gt;&gt; — nested!
    .flatMap(Collection::stream)   // Stream&lt;String&gt; — flat!
    .distinct().collect(toList());

// Orders → all order items
List&lt;OrderItem&gt; allItems = orders.stream()
    .flatMap(order -&gt; order.getItems().stream())
    .filter(item -&gt; item.getPrice().compareTo(BigDecimal.TEN) &gt; 0)
    .collect(toList());

// Optional.flatMap (avoids Optional&lt;Optional&lt;T&gt;&gt;)
Optional&lt;String&gt; city = getUser(id)
    .flatMap(User::getAddress)
    .map(Address::getCity);</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'Parallel streams — when to use and when to avoid?',
        a: `<p><strong>Use when:</strong> Large dataset (10K+), CPU-intensive, stateless ops, splittable source (ArrayList, arrays).</p>
<p><strong>Avoid when:</strong> Small data, I/O ops, order-dependent, shared mutable state, inside web server.</p>
<pre><code>// DANGER in web server: All requests share ForkJoinPool.commonPool()
list.parallelStream().map(this::process).collect(toList());

// Fix: Custom pool
ForkJoinPool pool = new ForkJoinPool(4);
List&lt;Result&gt; results = pool.submit(() -&gt;
    list.parallelStream().map(this::process).collect(toList())
).get();</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'What is reduce()? Write custom collectors.',
        a: `<pre><code>// reduce: Combine all elements into single result
int sum = numbers.stream().reduce(0, Integer::sum);
Optional&lt;Integer&gt; max = numbers.stream().reduce(Integer::max);

// Custom Collector (Collector.of)
Collector&lt;String, ?, ImmutableList&lt;String&gt;&gt; toImmutableList =
    Collector.of(
        ImmutableList::builder,             // supplier
        ImmutableList.Builder::add,         // accumulator
        (b1, b2) -&gt; b1.addAll(b2.build()), // combiner (parallel)
        ImmutableList.Builder::build        // finisher
    );

// Teeing collector (Java 12+): Two collectors at once
var result = employees.stream().collect(
    Collectors.teeing(
        Collectors.averagingDouble(Employee::getSalary),
        Collectors.counting(),
        (avg, count) -&gt; "Avg: " + avg + ", Count: " + count
    )
);</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'How to use Optional properly? What are common anti-patterns?',
        a: `<pre><code>// Proper usage — chaining
String city = userRepo.findById(id)
    .map(User::getAddress)
    .map(Address::getCity)
    .orElse("Unknown");

// orElseGet (lazy) vs orElse (eager)
user.orElse(createDefault());           // createDefault() ALWAYS called!
user.orElseGet(() -&gt; createDefault());  // Called ONLY if empty

// ANTI-PATTERNS:
// 1. Optional as method parameter — use overloading or @Nullable
// 2. Optional for fields — not serializable, overhead
// 3. opt.get() without check — use orElseThrow()
// 4. if (opt.isPresent()) opt.get() — use map/flatMap

// GOOD patterns:
opt.ifPresent(this::process);
opt.orElseThrow(() -&gt; new NotFoundException(id));
opt.filter(User::isActive).map(User::getEmail);</code></pre>
<div class="highlight"><strong>Rule:</strong> Use Optional only as method return type. Never for fields, parameters, or collections.</div>`,
        level: 'intermediate' as const
      },
      {
        q: 'What are functional interfaces? Name the main ones in java.util.function.',
        a: `<pre><code>// Functional interface: Exactly one abstract method. Can be used with lambdas.
@FunctionalInterface
public interface Predicate&lt;T&gt; { boolean test(T t); }

// Main functional interfaces:
// Predicate&lt;T&gt;     — T → boolean    (filter, validation)
// Function&lt;T,R&gt;    — T → R          (transformation, map)
// Consumer&lt;T&gt;      — T → void       (side effects, forEach)
// Supplier&lt;T&gt;      — () → T         (factory, lazy evaluation)
// UnaryOperator&lt;T&gt; — T → T          (same type transform)
// BinaryOperator&lt;T&gt;— (T,T) → T      (reduce, merge)
// BiFunction&lt;T,U,R&gt;— (T,U) → R     (two args)

// Composition
Predicate&lt;String&gt; notBlank = s -&gt; !s.isBlank();
Predicate&lt;String&gt; longEnough = s -&gt; s.length() &gt; 3;
Predicate&lt;String&gt; valid = notBlank.and(longEnough);

Function&lt;String, String&gt; trim = String::trim;
Function&lt;String, String&gt; upper = String::toUpperCase;
Function&lt;String, String&gt; process = trim.andThen(upper);

// Method references
list.forEach(System.out::println);        // Instance method ref
list.stream().map(String::toUpperCase);   // Unbound method ref
list.stream().map(converter::convert);    // Bound method ref</code></pre>`,
        level: 'basic' as const
      },
    ]
  },
  {
    title: 'Multithreading & Concurrency',
    questions: [
      {
        q: 'Explain the Java Memory Model and happens-before relationship.',
        a: `<p>JMM defines when changes by one thread become visible to another.</p>
<p><strong>Happens-before rules:</strong></p>
<ul>
<li>Monitor unlock → subsequent lock on same monitor</li>
<li>Volatile write → subsequent read of same variable</li>
<li>Thread.start() → actions in started thread</li>
<li>Thread actions → join() return</li>
<li>Transitivity</li>
</ul>
<pre><code>// Without volatile — Thread B may NEVER see the change
boolean running = true;

// With volatile — visibility guaranteed
volatile boolean running = true;
// Write in Thread A happens-before read in Thread B</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'CompletableFuture — chain async operations and handle errors.',
        a: `<pre><code>CompletableFuture&lt;Order&gt; future = CompletableFuture
    .supplyAsync(() -&gt; orderService.findById(id))
    .thenApplyAsync(order -&gt; enrichWithUserData(order))
    .thenApplyAsync(order -&gt; calculateShipping(order))
    .exceptionally(ex -&gt; { log.error("Failed", ex); return Order.fallback(id); });

// Combine multiple futures
CompletableFuture.allOf(userFuture, ordersFuture, balanceFuture)
    .thenApply(v -&gt; new UserProfile(
        userFuture.join(), ordersFuture.join(), balanceFuture.join()
    ));

// Timeout (Java 9+)
future.orTimeout(5, TimeUnit.SECONDS)
      .exceptionally(ex -&gt; handleTimeout(ex));

// First completed
CompletableFuture.anyOf(primary, fallback).thenApply(r -&gt; (String) r);</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'What is a deadlock? How to prevent and detect it?',
        a: `<p><strong>Four conditions (all must hold):</strong> Mutual exclusion, Hold-and-wait, No preemption, Circular wait.</p>
<pre><code>// Deadlock:
Thread 1: lock(A) → lock(B) → blocked!
Thread 2: lock(B) → lock(A) → blocked!

// Prevention: Consistent lock ordering
Thread 1: lock(A) → lock(B) ✓
Thread 2: lock(A) → lock(B) ✓

// tryLock with timeout
if (lock1.tryLock(1, TimeUnit.SECONDS)) {
    try {
        if (lock2.tryLock(1, TimeUnit.SECONDS)) {
            try { /* work */ } finally { lock2.unlock(); }
        }
    } finally { lock1.unlock(); }
}

// Detection: jstack PID → "Found one Java-level deadlock"</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How to size a thread pool? Explain ExecutorService types.',
        a: `<pre><code>// Thread pool sizing:
// CPU-bound: threads = CPU cores
// I/O-bound: threads = cores * (1 + wait_time/compute_time)
// Example: 8 cores, 200ms wait, 50ms compute → 8 * (1 + 200/50) = 40 threads

ThreadPoolExecutor executor = new ThreadPoolExecutor(
    10,                          // corePoolSize
    50,                          // maxPoolSize
    60, TimeUnit.SECONDS,        // keepAliveTime
    new LinkedBlockingQueue&lt;&gt;(1000), // bounded queue (backpressure!)
    new ThreadPoolExecutor.CallerRunsPolicy() // rejection policy
);

// Rejection policies:
// AbortPolicy (default) → RejectedExecutionException
// CallerRunsPolicy → caller executes (backpressure)
// DiscardPolicy → silently discard
// DiscardOldestPolicy → discard oldest, retry

// Shutdown
executor.shutdown();
executor.awaitTermination(30, TimeUnit.SECONDS);
executor.shutdownNow(); // Force if still running</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Explain CAS (Compare-And-Swap) and atomic operations.',
        a: `<pre><code>// Atomic operations: Thread-safe without locks using hardware CAS
AtomicInteger counter = new AtomicInteger(0);
counter.incrementAndGet(); // Atomic i++
counter.compareAndSet(5, 10); // If value==5, set to 10

// CAS internally:
public int incrementAndGet() {
    int prev, next;
    do {
        prev = get();
        next = prev + 1;
    } while (!compareAndSet(prev, next)); // Retry on contention
    return next;
}

// LongAdder: Better than AtomicLong under high contention
LongAdder adder = new LongAdder();
adder.increment(); // Distributes across cache lines
adder.sum();       // Aggregate

// When to use:
// Single variable → Atomic classes
// Multiple variables → synchronized/Lock
// High-contention counters → LongAdder</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'synchronized vs ReentrantLock vs ReadWriteLock.',
        a: `<pre><code>// synchronized: Simple, auto-released, non-interruptible
synchronized (lock) { /* critical section */ }

// ReentrantLock: More features
ReentrantLock lock = new ReentrantLock(true); // fair
lock.lock();
try { /* work */ } finally { lock.unlock(); }

// Advantages over synchronized:
// 1. tryLock() — non-blocking
// 2. tryLock(timeout) — timed
// 3. lockInterruptibly() — interruptible
// 4. Fairness option
// 5. Multiple Conditions

// ReadWriteLock: Multiple readers OR one writer
ReadWriteLock rwLock = new ReentrantReadWriteLock();
rwLock.readLock().lock();   // Shared — multiple readers OK
rwLock.writeLock().lock();  // Exclusive — blocks all

// StampedLock (Java 8): Optimistic reads
StampedLock sl = new StampedLock();
long stamp = sl.tryOptimisticRead();
// ...read data...
if (!sl.validate(stamp)) { /* fallback to read lock */ }</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'Explain the Producer-Consumer pattern with BlockingQueue.',
        a: `<pre><code>public class OrderProcessor {
    private final BlockingQueue&lt;Order&gt; queue = new LinkedBlockingQueue&lt;&gt;(100);
    
    // Producer
    public void receiveOrder(Order order) throws InterruptedException {
        queue.put(order); // Blocks if full (backpressure)
    }
    
    // Consumer
    public void processOrders() {
        while (!Thread.currentThread().isInterrupted()) {
            try {
                Order order = queue.take(); // Blocks if empty
                process(order);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
    }
}

// BlockingQueue implementations:
// LinkedBlockingQueue — unbounded/bounded, separate put/take locks
// ArrayBlockingQueue — bounded, single lock, fair option
// PriorityBlockingQueue — priority ordering
// SynchronousQueue — zero capacity (direct handoff)
// DelayQueue — elements available after delay</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'What is ThreadLocal? When does it cause memory leaks?',
        a: `<pre><code>// ThreadLocal: Each thread has its own copy of a variable
private static final ThreadLocal&lt;SimpleDateFormat&gt; dateFormat =
    ThreadLocal.withInitial(() -&gt; new SimpleDateFormat("yyyy-MM-dd"));

// Each thread gets its own formatter — no synchronization needed
String date = dateFormat.get().format(new Date());

// Real-world uses:
// - Database connections per thread
// - User context in web apps (SecurityContextHolder)
// - Transaction management

// MEMORY LEAK in thread pools:
// Thread pool reuses threads → ThreadLocal values persist!
threadLocal.set(heavyObject);
// Thread returned to pool → heavyObject NOT garbage collected!

// ALWAYS clean up:
try {
    threadLocal.set(context);
    // ... process request ...
} finally {
    threadLocal.remove(); // CRITICAL in thread pools!
}

// Java 21: ScopedValue (replacement for ThreadLocal)
// Automatically scoped to the call, no cleanup needed
private static final ScopedValue&lt;User&gt; CURRENT_USER = ScopedValue.newInstance();
ScopedValue.where(CURRENT_USER, user).run(() -&gt; processRequest());</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'Exception Handling',
    questions: [
      {
        q: 'Checked vs Unchecked exceptions. When to use custom exceptions?',
        a: `<p><strong>Checked:</strong> Must catch or declare. Recoverable conditions (IOException, SQLException).</p>
<p><strong>Unchecked (RuntimeException):</strong> Programming errors (NPE, IllegalArgumentException).</p>
<pre><code>// Domain exception (unchecked — modern preference)
public class OrderNotFoundException extends RuntimeException {
    private final String orderId;
    public OrderNotFoundException(String orderId) {
        super("Order not found: " + orderId);
        this.orderId = orderId;
    }
}

// Checked only when caller MUST handle and CAN recover
public class InsufficientBalanceException extends Exception { ... }</code></pre>
<div class="highlight">Modern best practice: Prefer unchecked. Use checked only when caller has meaningful recovery.</div>`,
        level: 'basic' as const
      },
      {
        q: 'Explain try-with-resources and AutoCloseable.',
        a: `<pre><code>// Automatically closes resources in reverse order
try (Connection conn = dataSource.getConnection();
     PreparedStatement ps = conn.prepareStatement(sql);
     ResultSet rs = ps.executeQuery()) {
    while (rs.next()) { process(rs); }
} // rs, ps, conn closed automatically (even on exception)

// Custom AutoCloseable
public class DatabaseTransaction implements AutoCloseable {
    private final Connection conn;
    public DatabaseTransaction(Connection c) throws SQLException {
        this.conn = c; c.setAutoCommit(false);
    }
    public void commit() throws SQLException { conn.commit(); }
    @Override
    public void close() throws SQLException {
        try { conn.rollback(); } catch (Exception e) { }
        finally { conn.setAutoCommit(true); }
    }
}

// Suppressed exceptions: If try AND close() both throw,
// close() exception added as getSuppressed()</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'Design an exception handling strategy for a REST API.',
        a: `<pre><code>// 1. Domain exceptions
public class ResourceNotFoundException extends RuntimeException { /* 404 */ }
public class ValidationException extends RuntimeException { /* 400 */ }

// 2. Global handler
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(ResourceNotFoundException ex) {
        return ErrorResponse.of(ex.getMessage());
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidation(MethodArgumentNotValidException ex) {
        Map&lt;String, String&gt; errors = ex.getBindingResult().getFieldErrors().stream()
            .collect(toMap(FieldError::getField, FieldError::getDefaultMessage));
        return ErrorResponse.of("VALIDATION_ERROR", errors);
    }
    
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleGeneric(Exception ex) {
        log.error("Unhandled", ex);
        return ErrorResponse.of("Something went wrong"); // Don't expose internals!
    }
}</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'String & Immutability',
    questions: [
      {
        q: 'Why is String immutable? What is String Pool?',
        a: `<p><strong>Why:</strong> Security (class loading, URLs), thread safety, caching (pool + hashCode), performance.</p>
<pre><code>String s1 = "hello";              // String pool
String s2 = "hello";              // Same reference from pool
String s3 = new String("hello");  // New heap object

s1 == s2;       // true (same pool reference)
s1 == s3;       // false (different objects)
s1.equals(s3);  // true (same content)
s3.intern();    // Returns pool reference

// StringBuilder for loops (O(n) vs String += O(n²))
StringBuilder sb = new StringBuilder();
for (String item : items) sb.append(item).append(",");</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'equals() and hashCode() contract. What breaks if violated?',
        a: `<p><strong>Contract:</strong> If a.equals(b), then a.hashCode() == b.hashCode().</p>
<pre><code>@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    Employee e = (Employee) o;
    return Objects.equals(id, e.id);
}
@Override
public int hashCode() { return Objects.hash(id); }

// If violated: HashMap/HashSet breaks
// Equal objects in different buckets → duplicates, lookup failures</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Text Blocks and new String methods in modern Java.',
        a: `<pre><code>// Text Blocks (Java 15)
String json = """
        {
            "name": "John",
            "age": 30
        }
        """;

// Java 11: strip(), isBlank(), repeat(), lines()
"  hi  ".strip();    // "hi" (Unicode-aware)
"  ".isBlank();      // true
"abc".repeat(3);     // "abcabcabc"

// Java 12: indent(), transform()
// Java 15: formatted()
"Hello %s".formatted("World"); // Instance method format</code></pre>`,
        level: 'basic' as const
      },
    ]
  },
  {
    title: 'Generics & Type System',
    questions: [
      {
        q: 'Explain PECS, wildcards, bounded types, and type erasure.',
        a: `<pre><code>// PECS: Producer Extends, Consumer Super
// ? extends T — read from (producer)
public double sum(List&lt;? extends Number&gt; nums) {
    return nums.stream().mapToDouble(Number::doubleValue).sum();
}

// ? super T — write to (consumer)
public void addInts(List&lt;? super Integer&gt; list) {
    list.add(1); list.add(2);
}

// Type Erasure: Generics removed at runtime
List&lt;String&gt; strings = new ArrayList&lt;&gt;();
List&lt;Integer&gt; ints = new ArrayList&lt;&gt;();
strings.getClass() == ints.getClass(); // TRUE at runtime

// Consequences: No new T(), no instanceof T, no T.class
// Workaround: Pass Class&lt;T&gt; token
public &lt;T&gt; T deserialize(byte[] data, Class&lt;T&gt; type) { ... }</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'List&lt;Object&gt; vs List&lt;?&gt; vs raw List — what is the difference?',
        a: `<pre><code>// List&lt;Object&gt;: Typed, can add anything. NOT polymorphic.
List&lt;Object&gt; objs = new ArrayList&lt;&gt;();
objs.add("str"); objs.add(42);
// void f(List&lt;Object&gt;) won't accept List&lt;String&gt;!

// List&lt;?&gt;: Unknown type. Read-only (can't add except null). Polymorphic.
void print(List&lt;?&gt; list) { for (Object o : list) System.out.println(o); }
print(List.of("a")); // OK
print(List.of(1));    // OK

// Raw List: No type safety. Backward compatibility only. NEVER use.
List raw = new ArrayList(); // Unsafe — ClassCastException risk</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'Java I/O & Modern APIs',
    questions: [
      {
        q: 'java.io vs java.nio — when to use which?',
        a: `<pre><code>// java.io: Stream-based, blocking, simple. Good for file I/O.
// java.nio: Buffer+Channel, non-blocking, selector-based. Good for network.

// Modern file I/O (java.nio.file)
Path path = Path.of("file.txt");
String content = Files.readString(path);               // Java 11
List&lt;String&gt; lines = Files.readAllLines(path);
Stream&lt;String&gt; lazy = Files.lines(path);              // Lazy, memory-efficient
Files.writeString(path, content, CREATE, TRUNCATE_EXISTING);

// NIO for network (non-blocking)
ServerSocketChannel server = ServerSocketChannel.open();
server.configureBlocking(false);
Selector selector = Selector.open();
server.register(selector, SelectionKey.OP_ACCEPT);
// One thread handles thousands of connections</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How to efficiently read large files?',
        a: `<pre><code>// DON'T: Files.readAllLines(path) for GB files → OOM

// Stream lines (lazy)
try (Stream&lt;String&gt; lines = Files.lines(path)) {
    lines.filter(l -&gt; l.contains("ERROR")).forEach(this::process);
}

// Memory-mapped file (fastest for random access)
try (FileChannel ch = FileChannel.open(path, READ)) {
    MappedByteBuffer buf = ch.map(MapMode.READ_ONLY, 0, ch.size());
    // OS handles paging — efficient for large binary files
}

// Chunked reading
try (InputStream is = Files.newInputStream(path)) {
    byte[] buffer = new byte[8192];
    int n;
    while ((n = is.read(buffer)) != -1) processChunk(buffer, n);
}</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'Memory & Performance',
    questions: [
      {
        q: 'Autoboxing pitfalls and performance implications.',
        a: `<pre><code>// Autoboxing: int → Integer (Integer.valueOf)
// Unboxing: Integer → int (intValue())

// PITFALL 1: Boxing in loops
Long sum = 0L; // BOXED
for (long i = 0; i &lt; 1_000_000; i++) sum += i; // New Long each iteration!
// Fix: long sum = 0L;

// PITFALL 2: Integer cache (-128 to 127)
Integer a = 127, b = 127; a == b; // TRUE (cached)
Integer c = 128, d = 128; c == d; // FALSE! Use .equals()

// PITFALL 3: NullPointerException
Integer val = null;
int x = val; // NPE on unboxing!

// Memory: Integer = 16 bytes vs int = 4 bytes
// 1M integers: 16MB (boxed) vs 4MB (primitive array)</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Explain Strong, Weak, Soft, and Phantom references.',
        a: `<pre><code>// Strong: Normal. Not collected while reachable.
Object obj = new Object();

// Soft: Collected ONLY when memory is low (before OOM)
// Use: Memory-sensitive caches
SoftReference&lt;byte[]&gt; cache = new SoftReference&lt;&gt;(data);

// Weak: Collected at next GC (even if memory is fine)
// Use: WeakHashMap, canonicalizing maps
WeakReference&lt;Connection&gt; ref = new WeakReference&lt;&gt;(conn);

// Phantom: Cannot access object (get() returns null)
// Use: Clean up native resources (replacement for finalize())
PhantomReference&lt;Obj&gt; phantom = new PhantomReference&lt;&gt;(obj, queue);
// Poll queue to know when object is finalized

// GC priority: Strong → Soft → Weak → Phantom</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'What causes memory leaks in Java? How to detect them?',
        a: `<pre><code>// Common causes:
// 1. Static collections growing unbounded
static Map&lt;String, Object&gt; cache = new HashMap&lt;&gt;(); // Never cleared!
// Fix: WeakHashMap or bounded cache (Caffeine)

// 2. Unclosed resources
Connection conn = ds.getConnection(); // Never closed!
// Fix: try-with-resources

// 3. Inner class holding outer class reference
class Outer { byte[] data = new byte[10_MB];
    class Inner { } // Holds implicit ref to Outer
}
// Fix: static inner class

// 4. ThreadLocal in thread pools
threadLocal.set(heavy); // Thread returned to pool → not GC'd
// Fix: threadLocal.remove() in finally

// 5. Listeners not deregistered
eventBus.register(this); // Never unregistered

// Detection: jmap, VisualVM, Eclipse MAT, JFR
// -XX:+HeapDumpOnOutOfMemoryError</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
];

export default sections;
