import type { Section } from '../../types';

const sections: Section[] = [
  {
    title: 'Entity Mappings & Relationships',
    questions: [
      {
        q: 'Explain @OneToMany, @ManyToOne, @ManyToMany. What is the owning side?',
        a: `<p><strong>Owning side</strong> = side with the foreign key. Only changes to owning side are persisted.</p>
<pre><code>// @ManyToOne (owning side — has FK)
@Entity
public class Order {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;
}

// @OneToMany (inverse side — mappedBy)
@Entity
public class Customer {
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List&lt;Order&gt; orders = new ArrayList&lt;&gt;();
    
    public void addOrder(Order order) {
        orders.add(order);
        order.setCustomer(this); // Maintain both sides!
    }
}

// @ManyToMany (join table)
@Entity
public class Student {
    @ManyToMany
    @JoinTable(name = "student_course",
        joinColumns = @JoinColumn(name = "student_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id"))
    private Set&lt;Course&gt; courses = new HashSet&lt;&gt;();
}</code></pre>
<div class="warning"><strong>Avoid @ManyToMany:</strong> Use explicit join entity (Enrollment) when extra columns needed (enrolledDate, grade).</div>`,
        level: 'intermediate' as const
      },
      {
        q: 'What is the N+1 problem? How do you solve it?',
        a: `<pre><code>// N+1 Problem: 1 query for parent + N queries for each child
// Loading 100 orders → 1 query for orders + 100 queries for customers!

List&lt;Order&gt; orders = orderRepo.findAll(); // SELECT * FROM orders (1 query)
for (Order o : orders) {
    o.getCustomer().getName(); // SELECT * FROM customers WHERE id=? (N queries!)
}

// SOLUTIONS:

// 1. JOIN FETCH (JPQL)
@Query("SELECT o FROM Order o JOIN FETCH o.customer WHERE o.status = :status")
List&lt;Order&gt; findWithCustomer(@Param("status") String status);

// 2. @EntityGraph (declarative)
@EntityGraph(attributePaths = {"customer", "items"})
List&lt;Order&gt; findByStatus(String status);

// 3. @BatchSize (Hibernate specific — batch lazy loads)
@Entity
public class Customer {
    @OneToMany(mappedBy = "customer")
    @BatchSize(size = 25) // Loads 25 customers at a time instead of 1
    private List&lt;Order&gt; orders;
}

// 4. Hibernate default_batch_fetch_size (global)
spring.jpa.properties.hibernate.default_batch_fetch_size=25

// 5. DTO Projection (best for read-only)
@Query("SELECT new com.app.dto.OrderSummary(o.id, o.status, c.name) " +
       "FROM Order o JOIN o.customer c WHERE o.status = :status")
List&lt;OrderSummary&gt; findSummaries(@Param("status") String status);</code></pre>
<div class="highlight"><strong>Detection:</strong> Enable SQL logging: spring.jpa.show-sql=true or use Hibernate statistics. In prod, use p6spy or datasource-proxy.</div>`,
        level: 'intermediate' as const
      },
      {
        q: 'Explain FetchType.LAZY vs EAGER. Best practices.',
        a: `<pre><code>// EAGER: Load immediately with parent entity (additional JOIN or subquery)
// LAZY: Load only when accessed (proxy object)

// Defaults:
// @ManyToOne, @OneToOne → EAGER (often wrong!)
// @OneToMany, @ManyToMany → LAZY

// BEST PRACTICE: Always use LAZY, fetch explicitly when needed
@ManyToOne(fetch = FetchType.LAZY) // Override default EAGER
@JoinColumn(name = "customer_id")
private Customer customer;

// Problem: LazyInitializationException
// When accessing lazy association outside of transaction/session
Order order = orderRepo.findById(id); // Session closes
order.getCustomer().getName(); // LazyInitializationException!

// Solutions:
// 1. JOIN FETCH in query (best)
// 2. @Transactional on service method (keeps session open)
// 3. @EntityGraph
// 4. Open Session in View (spring.jpa.open-in-view=false — disable this anti-pattern!)

// Why EAGER is dangerous:
// - Loads entire object graph (customer → orders → items → ...)
// - Cannot selectively skip loading
// - Causes unexpected queries
// - MultipleBagFetchException with multiple EAGER collections</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'What is the difference between @JoinColumn and @JoinTable?',
        a: `<pre><code>// @JoinColumn: FK stored directly in the entity's table
@ManyToOne
@JoinColumn(name = "department_id") // FK column in employee table
private Department department;
// employees table: | id | name | department_id (FK) |

// @JoinTable: Separate join/association table (for many-to-many or optional 1-to-1)
@ManyToMany
@JoinTable(
    name = "employee_project",       // Join table name
    joinColumns = @JoinColumn(name = "employee_id"),        // FK to this entity
    inverseJoinColumns = @JoinColumn(name = "project_id")   // FK to other entity
)
private Set&lt;Project&gt; projects;
// employee_project table: | employee_id | project_id |

// Optional @OneToOne with @JoinTable (avoids nullable FK)
@OneToOne
@JoinTable(
    name = "employee_parking",
    joinColumns = @JoinColumn(name = "employee_id"),
    inverseJoinColumns = @JoinColumn(name = "parking_id")
)
private ParkingSpot parkingSpot;

// Composite FK
@ManyToOne
@JoinColumns({
    @JoinColumn(name = "country_code", referencedColumnName = "code"),
    @JoinColumn(name = "state_id", referencedColumnName = "id")
})
private State state;</code></pre>`,
        level: 'basic' as const
      },
    ]
  },
  {
    title: 'Caching & Performance',
    questions: [
      {
        q: 'Explain Hibernate first-level and second-level cache.',
        a: `<pre><code>// FIRST-LEVEL CACHE (L1): Session/EntityManager scope
// - Enabled by default, cannot disable
// - One per transaction
// - Prevents duplicate DB queries within same session
entityManager.find(Order.class, 1L); // Hits DB
entityManager.find(Order.class, 1L); // Returns from L1 cache (no DB)

// SECOND-LEVEL CACHE (L2): SessionFactory scope (shared across sessions)
// - Must be explicitly enabled
// - Providers: Ehcache, Caffeine, Hazelcast, Redis

// Configuration:
spring.jpa.properties.hibernate.cache.use_second_level_cache=true
spring.jpa.properties.hibernate.cache.region.factory_class=org.hibernate.cache.jcache.JCacheRegionFactory
spring.jpa.properties.javax.cache.provider=org.ehcache.jsr107.EhcacheCachingProvider

// Entity caching:
@Entity
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Product {
    @Id private Long id;
    private String name;
    private BigDecimal price;
    
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @OneToMany(mappedBy = "product")
    private List&lt;Review&gt; reviews; // Collection cache
}

// Cache strategies:
// READ_ONLY — Immutable data (reference data, enums)
// READ_WRITE — Mutable, uses soft locks (most common)
// NONSTRICT_READ_WRITE — Mutable, eventual consistency (slight stale reads OK)
// TRANSACTIONAL — JTA required, full ACID

// QUERY CACHE (L3): Caches query results
spring.jpa.properties.hibernate.cache.use_query_cache=true
@QueryHints(@QueryHint(name = "org.hibernate.cacheable", value = "true"))
List&lt;Product&gt; findByCategory(String category);</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'How to optimize Hibernate performance for batch operations?',
        a: `<pre><code>// Problem: Inserting 10,000 entities one by one is SLOW
// Hibernate accumulates entities in L1 cache → OutOfMemoryError

// Solution 1: JDBC batch inserts
spring.jpa.properties.hibernate.jdbc.batch_size=50
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true

// Flush and clear periodically:
@Transactional
public void batchInsert(List&lt;Order&gt; orders) {
    for (int i = 0; i &lt; orders.size(); i++) {
        entityManager.persist(orders.get(i));
        if (i % 50 == 0) { // Match batch_size
            entityManager.flush();
            entityManager.clear(); // Free L1 cache!
        }
    }
}

// Solution 2: Spring Data saveAll (uses batch automatically)
orderRepository.saveAll(orders); // Batch if batch_size configured

// Solution 3: JDBC directly for massive inserts
@Autowired private JdbcTemplate jdbc;
jdbc.batchUpdate("INSERT INTO orders (id, status, total) VALUES (?, ?, ?)",
    orders, 1000, (ps, order) -&gt; {
        ps.setString(1, order.getId());
        ps.setString(2, order.getStatus());
        ps.setBigDecimal(3, order.getTotal());
    });

// Solution 4: StatelessSession (no L1 cache, no dirty checking)
StatelessSession session = sessionFactory.openStatelessSession();
Transaction tx = session.beginTransaction();
for (Order order : orders) {
    session.insert(order); // No L1 cache overhead
}
tx.commit();

// IDENTITY generation strategy disables batch inserts!
// Use SEQUENCE or TABLE with allocationSize for batching:
@Id @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "order_seq")
@SequenceGenerator(name = "order_seq", sequenceName = "order_id_seq", allocationSize = 50)
private Long id;</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'What is dirty checking in Hibernate? How does it work?',
        a: `<pre><code>// Dirty Checking: Hibernate automatically detects entity changes
// and generates UPDATE SQL at flush time

@Transactional
public void updateOrderStatus(Long orderId, String newStatus) {
    Order order = orderRepo.findById(orderId).orElseThrow();
    order.setStatus(newStatus); // Just modify the entity
    // NO explicit save needed! Hibernate detects the change
    // At transaction commit → flush → UPDATE orders SET status=? WHERE id=?
}

// How it works internally:
// 1. When entity loaded → Hibernate stores snapshot of initial state
// 2. At flush time → compares current state with snapshot
// 3. If different → generates UPDATE for changed columns
// 4. @DynamicUpdate → only includes changed columns in UPDATE
//    (vs default: ALL columns in UPDATE)

@Entity
@DynamicUpdate // UPDATE only changed columns
public class Order { ... }

// Performance concern: Dirty checking ALL managed entities at flush
// For read-heavy operations, use read-only transactions:
@Transactional(readOnly = true) // Skips dirty checking!
public List&lt;Order&gt; findAll() { ... }

// Or detach entities you don't need to update:
entityManager.detach(order); // Remove from persistence context

// Spring Data: read-only query optimization
@QueryHints(@QueryHint(name = "org.hibernate.readOnly", value = "true"))
List&lt;Order&gt; findByStatus(String status);</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'Transactions & Locking',
    questions: [
      {
        q: 'Explain optimistic vs pessimistic locking in Hibernate.',
        a: `<pre><code>// OPTIMISTIC LOCKING: No DB lock. Uses version column.
// Checks version at UPDATE time → throws if stale.
@Entity
public class Order {
    @Version
    private Long version; // Incremented on each update
}
// UPDATE orders SET status=?, version=2 WHERE id=? AND version=1
// If version mismatch → OptimisticLockException

// Handle conflict:
try {
    orderService.updateStatus(orderId, "SHIPPED");
} catch (OptimisticLockException e) {
    // Retry: reload entity and reapply changes
    Order fresh = orderRepo.findById(orderId).orElseThrow();
    fresh.setStatus("SHIPPED");
    orderRepo.save(fresh);
}

// PESSIMISTIC LOCKING: Actual DB lock (SELECT ... FOR UPDATE)
@Query("SELECT o FROM Order o WHERE o.id = :id")
@Lock(LockModeType.PESSIMISTIC_WRITE) // SELECT FOR UPDATE
Optional&lt;Order&gt; findByIdForUpdate(@Param("id") Long id);

// Lock modes:
// PESSIMISTIC_READ → shared lock (others can read, can't write)
// PESSIMISTIC_WRITE → exclusive lock (others can't read or write)
// PESSIMISTIC_FORCE_INCREMENT → exclusive + version increment

// When to use:
// Optimistic: Low contention, web apps, most CRUD (default choice)
// Pessimistic: High contention, financial transactions, inventory decrement

// Inventory example (pessimistic for correctness):
@Transactional
public void decrementStock(Long productId, int qty) {
    Product p = productRepo.findByIdForUpdate(productId); // Locks row
    if (p.getStock() &lt; qty) throw new InsufficientStockException();
    p.setStock(p.getStock() - qty);
} // Lock released at commit</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'What are Hibernate transaction propagation types?',
        a: `<pre><code>// Transaction propagation defines behavior when a transactional method
// calls another transactional method

@Transactional(propagation = Propagation.REQUIRED) // DEFAULT
// Join existing TX, or create new if none exists

@Transactional(propagation = Propagation.REQUIRES_NEW)
// Always create NEW TX. Suspend existing TX.
// Use: Audit logging that must commit even if parent TX rolls back

@Transactional(propagation = Propagation.NESTED)
// Create savepoint within existing TX. Can roll back to savepoint.
// Requires JDBC savepoint support.

@Transactional(propagation = Propagation.MANDATORY)
// Must run within existing TX. Throws if none exists.

@Transactional(propagation = Propagation.SUPPORTS)
// Use TX if exists, otherwise run non-transactional.

@Transactional(propagation = Propagation.NOT_SUPPORTED)
// Suspend existing TX and run non-transactional.

@Transactional(propagation = Propagation.NEVER)
// Throws if TX exists. Must run non-transactional.

// Real-world example:
@Service
public class OrderService {
    @Transactional
    public void processOrder(Order order) {
        orderRepo.save(order);
        paymentService.charge(order); // If this fails → order rolls back too
        auditService.log(order);      // REQUIRES_NEW → logs even if order fails
    }
}

@Service
public class AuditService {
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(Order order) { auditRepo.save(new AuditEntry(order)); }
}</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'Advanced Querying',
    questions: [
      {
        q: 'What are projections in Spring Data JPA? When to use DTOs vs entities?',
        a: `<pre><code>// PROBLEM: Loading full entity when you only need 2-3 fields
// Wastes memory, triggers unnecessary lazy loads

// Solution 1: Interface-based projection
public interface OrderSummary {
    String getId();
    String getStatus();
    BigDecimal getTotal();
    @Value("#{target.customer.name}") // SpEL for nested
    String getCustomerName();
}
List&lt;OrderSummary&gt; findByStatus(String status); // Returns projections

// Solution 2: Class-based DTO projection (constructor expression)
@Query("SELECT new com.app.dto.OrderDTO(o.id, o.status, o.total, c.name) " +
       "FROM Order o JOIN o.customer c WHERE o.status = :status")
List&lt;OrderDTO&gt; findDTOsByStatus(@Param("status") String status);

// Solution 3: Tuple/Map projection
@Query("SELECT o.id as id, o.status as status, o.total as total FROM Order o")
List&lt;Tuple&gt; findAllTuples();

// When to use entities vs DTOs:
// ENTITIES: Create/Update operations, need relationship traversal, complex business logic
// DTOs: Read-only views, API responses, reports, avoiding N+1

// Performance comparison (100K rows):
// Full entity: ~500ms (loads all columns, creates proxies)
// DTO projection: ~150ms (only selected columns, no managed state)
// Native SQL + RowMapper: ~100ms (no JPA overhead)

// Spring Data REST projections:
@Projection(name = "summary", types = Order.class)
public interface OrderSummaryProjection {
    String getId();
    String getStatus();
}</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How to use Specifications for dynamic queries?',
        a: `<pre><code>// JPA Specification: Build dynamic WHERE clauses programmatically
public interface OrderRepository extends JpaRepository&lt;Order, Long&gt;,
                                         JpaSpecificationExecutor&lt;Order&gt; { }

// Specification definitions
public class OrderSpecs {
    public static Specification&lt;Order&gt; hasStatus(String status) {
        return (root, query, cb) -&gt; cb.equal(root.get("status"), status);
    }
    
    public static Specification&lt;Order&gt; createdAfter(LocalDateTime date) {
        return (root, query, cb) -&gt; cb.greaterThan(root.get("createdAt"), date);
    }
    
    public static Specification&lt;Order&gt; totalGreaterThan(BigDecimal amount) {
        return (root, query, cb) -&gt; cb.greaterThan(root.get("total"), amount);
    }
    
    public static Specification&lt;Order&gt; customerNameLike(String name) {
        return (root, query, cb) -&gt; {
            Join&lt;Order, Customer&gt; customer = root.join("customer");
            return cb.like(cb.lower(customer.get("name")), "%" + name.toLowerCase() + "%");
        };
    }
}

// Dynamic query building in service:
public Page&lt;Order&gt; searchOrders(OrderSearchCriteria criteria, Pageable pageable) {
    Specification&lt;Order&gt; spec = Specification.where(null);
    
    if (criteria.status() != null)
        spec = spec.and(OrderSpecs.hasStatus(criteria.status()));
    if (criteria.fromDate() != null)
        spec = spec.and(OrderSpecs.createdAfter(criteria.fromDate()));
    if (criteria.minAmount() != null)
        spec = spec.and(OrderSpecs.totalGreaterThan(criteria.minAmount()));
    if (criteria.customerName() != null)
        spec = spec.and(OrderSpecs.customerNameLike(criteria.customerName()));
    
    return orderRepo.findAll(spec, pageable);
}</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'What are Hibernate entity states? Explain the persistence context lifecycle.',
        a: `<pre><code>// Entity states:
// TRANSIENT → NEW object, not associated with any session
Order order = new Order(); // Transient

// PERSISTENT → Associated with open session, tracked by Hibernate
entityManager.persist(order); // Now persistent
// Changes auto-detected (dirty checking) and synced to DB at flush

// DETACHED → Was persistent, but session closed or detached
entityManager.detach(order); // Now detached
// Changes NOT tracked. Must merge() to re-attach.

// REMOVED → Scheduled for deletion
entityManager.remove(order); // Marked for DELETE at flush

// State transitions:
// new → persist() → PERSISTENT
// PERSISTENT → detach()/close() → DETACHED
// DETACHED → merge() → PERSISTENT (returns NEW managed instance!)
// PERSISTENT → remove() → REMOVED
// REMOVED → persist() → PERSISTENT (cancel deletion)

// IMPORTANT: merge() returns a NEW managed object!
Order detached = orderRepo.findById(1L).orElseThrow();
entityManager.clear(); // Detach all
detached.setStatus("SHIPPED");
Order managed = entityManager.merge(detached); // NEW managed copy
// detached != managed! Use 'managed' from now on.

// Flush modes:
// AUTO (default): Flush before queries to ensure consistency
// COMMIT: Only flush at transaction commit (better performance, stale reads possible)
entityManager.setFlushMode(FlushModeType.COMMIT);</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'Schema & Inheritance',
    questions: [
      {
        q: 'Explain JPA inheritance strategies. Which to use when?',
        a: `<pre><code>// Strategy 1: SINGLE_TABLE (default) — All types in one table
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "payment_type")
public abstract class Payment { @Id Long id; BigDecimal amount; }

@Entity @DiscriminatorValue("CARD")
public class CardPayment extends Payment { String cardNumber; }

@Entity @DiscriminatorValue("UPI")
public class UpiPayment extends Payment { String vpa; }
// One table: payments(id, amount, payment_type, card_number, vpa)
// Pros: Fast queries (no JOINs), simple
// Cons: Nullable columns, no NOT NULL on subtype fields

// Strategy 2: JOINED — Separate table per class, joined via FK
@Entity @Inheritance(strategy = InheritanceType.JOINED)
public abstract class Payment { ... }
// Tables: payments(id, amount), card_payments(id, card_number), upi_payments(id, vpa)
// Pros: Normalized, NOT NULL constraints possible
// Cons: JOINs for every query (slower), complex

// Strategy 3: TABLE_PER_CLASS — Independent table per concrete class
@Entity @Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public abstract class Payment { ... }
// Tables: card_payments(id, amount, card_number), upi_payments(id, amount, vpa)
// Pros: Fast per-subtype queries
// Cons: UNION ALL for polymorphic queries (very slow), no shared sequences

// When to use:
// SINGLE_TABLE → Default choice. Few subtypes, performance critical.
// JOINED → Many subtype-specific columns, data integrity important.
// TABLE_PER_CLASS → Rarely. Only if you never query polymorphically.

// Alternative: @MappedSuperclass (no polymorphic queries, just shared fields)
@MappedSuperclass
public abstract class BaseEntity {
    @Id @GeneratedValue private Long id;
    private Instant createdAt;
    private Instant updatedAt;
}</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'How to implement soft delete in Hibernate?',
        a: `<pre><code>// Soft delete: Mark records as deleted instead of physical DELETE

@Entity
@SQLDelete(sql = "UPDATE orders SET deleted = true WHERE id = ?")
@SQLRestriction("deleted = false") // Hibernate 6.4+ (replaces @Where)
public class Order {
    @Id private Long id;
    private boolean deleted = false;
    private Instant deletedAt;
}

// When you call orderRepo.delete(order):
// Instead of: DELETE FROM orders WHERE id = ?
// Executes:   UPDATE orders SET deleted = true WHERE id = ?

// @SQLRestriction automatically filters deleted records in all queries
orderRepo.findAll(); // SELECT * FROM orders WHERE deleted = false

// Include deleted records (bypass filter):
@Query(value = "SELECT * FROM orders WHERE id = :id", nativeQuery = true)
Optional&lt;Order&gt; findByIdIncludingDeleted(@Param("id") Long id);

// Alternative: Hibernate @Filter (toggleable)
@Entity
@FilterDef(name = "notDeleted", defaultCondition = "deleted = false")
@Filter(name = "notDeleted")
public class Order { ... }

// Enable/disable in session:
Session session = entityManager.unwrap(Session.class);
session.enableFilter("notDeleted"); // Apply filter
// session.disableFilter("notDeleted"); // Admin: see all records

// Audit fields (combine with soft delete)
@EntityListeners(AuditingEntityListener.class)
public class Order {
    @CreatedDate private Instant createdAt;
    @LastModifiedDate private Instant updatedAt;
    @CreatedBy private String createdBy;
    @LastModifiedBy private String updatedBy;
}</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
];

export default sections;
