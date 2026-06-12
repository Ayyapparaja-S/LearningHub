import type { Section } from '../../types';

const sections: Section[] = [
  {
    title: 'Query Optimization & Indexing',
    questions: [
      {
        q: 'How do indexes work in MySQL? B-Tree vs Hash index.',
        a: `<pre><code>-- B-Tree (default InnoDB index):
-- Balanced tree structure. O(log n) lookups.
-- Supports: =, &lt;, &gt;, BETWEEN, LIKE 'prefix%', ORDER BY
CREATE INDEX idx_email ON users(email);  -- B-Tree by default

-- Hash index (Memory/NDB engine):
-- O(1) exact match only. No range queries, no sorting.
-- InnoDB uses adaptive hash index internally (automatic)

-- Clustered Index (InnoDB):
-- PRIMARY KEY = clustered index (data stored in PK order)
-- Only ONE per table. Row data lives in leaf nodes.
-- Secondary indexes store PK value (not row pointer)

-- Covering Index: All needed columns IN the index
CREATE INDEX idx_covering ON orders(status, created_at, total);
SELECT status, created_at, total FROM orders WHERE status = 'ACTIVE';
-- No table lookup needed! (Using index only)

-- Composite Index: Left-prefix rule
CREATE INDEX idx_composite ON orders(customer_id, status, created_at);
-- Uses index: WHERE customer_id = 'C1'
-- Uses index: WHERE customer_id = 'C1' AND status = 'ACTIVE'
-- DOES NOT use: WHERE status = 'ACTIVE' (skips leftmost column!)
-- DOES NOT use: WHERE customer_id = 'C1' AND created_at > '2024-01-01' (gap in middle)

-- Check index usage:
EXPLAIN SELECT * FROM orders WHERE customer_id = 'C1';
-- Look for: type=ref (index), rows (estimated), Extra (Using index)</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How to read and interpret EXPLAIN output?',
        a: `<pre><code>EXPLAIN SELECT o.*, c.name FROM orders o JOIN customers c ON o.customer_id = c.id
WHERE o.status = 'ACTIVE' AND o.created_at > '2024-01-01' ORDER BY o.total DESC LIMIT 20;

-- Key columns:
-- type: Access method (best to worst)
--   system &gt; const &gt; eq_ref &gt; ref &gt; range &gt; index &gt; ALL
--   ALL = full table scan (BAD!)
--   ref = non-unique index lookup (GOOD)
--   range = index range scan (GOOD)

-- key: Which index is used (NULL = no index!)
-- rows: Estimated rows examined (lower is better)
-- filtered: % of rows that pass WHERE conditions
-- Extra:
--   Using index = covering index (no table access)
--   Using where = filter applied after retrieval
--   Using temporary = temp table (often for GROUP BY)
--   Using filesort = external sort (often for ORDER BY)

-- Red flags:
-- type=ALL on large tables
-- Using temporary; Using filesort (together)
-- rows = very large number
-- key = NULL

-- Optimization checklist:
-- 1. Add index for WHERE columns
-- 2. Include ORDER BY columns in index
-- 3. Use covering index to avoid table lookup
-- 4. Avoid SELECT * (forces table access)
-- 5. Check if LIMIT helps (index_condition_pushdown)</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'What is a slow query? How to identify and fix slow queries?',
        a: `<pre><code>-- Enable slow query log:
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;  -- Log queries taking > 1 second
SET GLOBAL log_queries_not_using_indexes = 'ON';

-- Analyze slow query log:
mysqldumpslow -s t /var/log/mysql/slow.log  -- Sort by time

-- Common causes of slow queries:
-- 1. Missing index → Full table scan
-- 2. SELECT * → Unnecessary data transfer
-- 3. N+1 queries → Use JOIN or batch
-- 4. Large OFFSET → Use cursor/keyset pagination
-- 5. Non-sargable WHERE → Functions on indexed columns

-- Non-sargable (can't use index):
WHERE YEAR(created_at) = 2024           -- BAD: function on column
WHERE created_at >= '2024-01-01'        -- GOOD: compare directly

WHERE LOWER(email) = 'john@test.com'    -- BAD
WHERE email = 'john@test.com'           -- GOOD (if case-insensitive collation)

-- Large OFFSET problem:
SELECT * FROM orders ORDER BY id LIMIT 1000000, 20;  -- Scans 1M rows!
-- Fix: Keyset pagination
SELECT * FROM orders WHERE id > :lastId ORDER BY id LIMIT 20;

-- Query optimization tools:
-- EXPLAIN ANALYZE (MySQL 8.0.18+) — actual execution stats
-- Performance Schema — query statistics
-- pt-query-digest (Percona) — analyze slow log patterns</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Explain query execution order in MySQL.',
        a: `<pre><code>-- SQL execution order (NOT the writing order!):
-- 1. FROM (+ JOIN)     — Determine source tables
-- 2. WHERE             — Filter rows
-- 3. GROUP BY          — Aggregate groups
-- 4. HAVING            — Filter groups
-- 5. SELECT            — Choose columns
-- 6. DISTINCT          — Remove duplicates
-- 7. ORDER BY          — Sort results
-- 8. LIMIT/OFFSET      — Restrict output

-- Why this matters:
-- Can't use column alias in WHERE (SELECT happens after WHERE):
SELECT total * 0.9 AS discounted FROM orders WHERE discounted > 100; -- ERROR!
SELECT total * 0.9 AS discounted FROM orders WHERE total * 0.9 > 100; -- OK

-- Can use alias in ORDER BY (ORDER BY executes after SELECT):
SELECT total * 0.9 AS discounted FROM orders ORDER BY discounted; -- OK

-- HAVING vs WHERE:
-- WHERE filters BEFORE grouping (on individual rows)
-- HAVING filters AFTER grouping (on aggregate results)
SELECT department, AVG(salary) AS avg_sal
FROM employees
WHERE hire_date > '2020-01-01'   -- Filter rows first
GROUP BY department
HAVING AVG(salary) > 80000;      -- Filter groups after</code></pre>`,
        level: 'basic' as const
      },
    ]
  },
  {
    title: 'Joins & Subqueries',
    questions: [
      {
        q: 'Explain all types of JOINs with examples.',
        a: `<pre><code>-- INNER JOIN: Only matching rows from both tables
SELECT o.id, c.name FROM orders o
INNER JOIN customers c ON o.customer_id = c.id;

-- LEFT JOIN: All rows from left table + matching from right (NULL if no match)
SELECT c.name, o.id FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id;
-- Customers without orders will have o.id = NULL

-- RIGHT JOIN: All from right + matching from left
-- (Less common, can rewrite as LEFT JOIN)

-- FULL OUTER JOIN (MySQL doesn't support directly):
SELECT * FROM A LEFT JOIN B ON A.id = B.a_id
UNION
SELECT * FROM A RIGHT JOIN B ON A.id = B.a_id;

-- CROSS JOIN: Cartesian product (every row × every row)
SELECT * FROM sizes CROSS JOIN colors;  -- All combinations

-- SELF JOIN: Table joined with itself
SELECT e.name AS employee, m.name AS manager
FROM employees e LEFT JOIN employees m ON e.manager_id = m.id;

-- Performance tips:
-- 1. Join on indexed columns (both sides)
-- 2. Smaller table on the left (MySQL optimizer usually handles this)
-- 3. Filter with WHERE before JOIN when possible
-- 4. Use EXPLAIN to verify join type (eq_ref is ideal)</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'Correlated vs non-correlated subqueries. When to use each?',
        a: `<pre><code>-- Non-correlated: Subquery runs ONCE, independently
SELECT * FROM orders WHERE customer_id IN (
    SELECT id FROM customers WHERE country = 'US'
);
-- Subquery executes once, result used for all outer rows

-- Correlated: Subquery runs for EACH row of outer query
SELECT o.* FROM orders o WHERE o.total > (
    SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id
);
-- For each order, calculate that customer's average — potentially slow!

-- EXISTS (preferred for correlated subqueries):
SELECT c.* FROM customers c WHERE EXISTS (
    SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'ACTIVE'
);
-- EXISTS stops at first match (short-circuits) — faster than IN for large tables

-- IN vs EXISTS:
-- IN: Better when subquery result is small
-- EXISTS: Better when outer table is small, subquery table is large
-- NOT EXISTS: Often better than NOT IN (handles NULLs correctly!)

-- Rewrite correlated subquery as JOIN (usually faster):
SELECT o.* FROM orders o
JOIN (SELECT customer_id, AVG(total) AS avg_total FROM orders GROUP BY customer_id) avg
ON o.customer_id = avg.customer_id AND o.total > avg.avg_total;</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'What are Window Functions? Explain ROW_NUMBER, RANK, LEAD/LAG.',
        a: `<pre><code>-- Window functions: Compute across a set of rows without GROUP BY

-- ROW_NUMBER: Sequential numbering (no gaps, no ties)
SELECT name, department, salary,
    ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rank_in_dept
FROM employees;
-- Useful for: Top N per group, pagination, deduplication

-- RANK vs DENSE_RANK:
-- RANK: 1, 2, 2, 4 (gaps after ties)
-- DENSE_RANK: 1, 2, 2, 3 (no gaps)

-- LEAD/LAG: Access previous/next row
SELECT date, revenue,
    LAG(revenue) OVER (ORDER BY date) AS prev_revenue,
    revenue - LAG(revenue) OVER (ORDER BY date) AS daily_change
FROM daily_sales;

-- Running total / Moving average:
SELECT date, amount,
    SUM(amount) OVER (ORDER BY date) AS running_total,
    AVG(amount) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS weekly_avg
FROM transactions;

-- Top 3 earners per department (common interview question!):
WITH ranked AS (
    SELECT *, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk
    FROM employees
)
SELECT * FROM ranked WHERE rnk &lt;= 3;</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'Transactions & Locking',
    questions: [
      {
        q: 'Explain ACID properties with real-world examples.',
        a: `<pre><code>-- ACID:
-- Atomicity: All or nothing. Bank transfer: debit AND credit both succeed or both fail.
-- Consistency: DB moves from one valid state to another. Constraints enforced.
-- Isolation: Concurrent transactions don't interfere. Each sees consistent snapshot.
-- Durability: Once committed, data survives crashes. Written to disk/WAL.

-- Isolation Levels (trade-off: correctness vs performance):
-- READ UNCOMMITTED: Dirty reads possible (see uncommitted changes)
-- READ COMMITTED: No dirty reads (PostgreSQL default)
-- REPEATABLE READ: No phantom reads for same query (MySQL InnoDB default)
-- SERIALIZABLE: Full isolation (slowest, like running sequentially)

-- Problems at each level:
-- Dirty read: See uncommitted data from other transaction
-- Non-repeatable read: Same query returns different results (row modified)
-- Phantom read: Same query returns different rows (rows inserted/deleted)

-- InnoDB locking:
START TRANSACTION;
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;  -- Row lock (exclusive)
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;  -- Locks released

-- Deadlock detection: InnoDB auto-detects, rolls back one transaction
-- Prevention: Always lock tables/rows in same order</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How does MVCC (Multi-Version Concurrency Control) work in InnoDB?',
        a: `<pre><code>-- MVCC: Readers don't block writers, writers don't block readers
-- Each row has hidden columns: transaction_id, rollback_pointer

-- How it works:
-- 1. Each transaction gets a unique ID (increasing)
-- 2. UPDATE creates new version (old version in undo log)
-- 3. SELECT reads the version visible to this transaction
-- 4. Visibility determined by "read view" (snapshot of active transactions)

-- A row is visible if:
-- created_by_tx &lt;= current_tx AND (deleted_by_tx is NULL OR deleted_by_tx > current_tx)

-- Example:
-- TX 100: INSERT INTO orders (id=1, status='NEW')
-- TX 101: BEGIN; SELECT * FROM orders WHERE id=1; → sees status='NEW'
-- TX 102: UPDATE orders SET status='SHIPPED' WHERE id=1; COMMIT;
-- TX 101: SELECT * FROM orders WHERE id=1; → still sees 'NEW'! (REPEATABLE READ)

-- Undo log: Chain of old row versions
-- Current row → v3 → v2 → v1 (each links to previous via rollback pointer)
-- Long-running transactions prevent undo log cleanup → grows large!

-- Gap locking (InnoDB REPEATABLE READ):
-- Locks gaps between index records to prevent phantom reads
SELECT * FROM orders WHERE status = 'ACTIVE' FOR UPDATE;
-- Locks not just matching rows, but gaps where new 'ACTIVE' rows could be inserted

-- Why MVCC matters:
-- No read locks needed → high concurrency for read-heavy workloads
-- Each transaction sees consistent snapshot
-- Trade-off: Undo log space, purge thread overhead</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'Schema Design',
    questions: [
      {
        q: 'Explain normalization forms (1NF, 2NF, 3NF). When to denormalize?',
        a: `<pre><code>-- 1NF: Atomic values (no lists/arrays in columns), unique rows
-- BAD: phones = "123,456,789"
-- GOOD: Separate phone_numbers table

-- 2NF: 1NF + No partial dependencies (non-key depends on FULL composite key)
-- If PK is (student_id, course_id):
-- student_name depends only on student_id → violates 2NF → move to students table

-- 3NF: 2NF + No transitive dependencies (non-key depends on another non-key)
-- city depends on zip_code, zip_code depends on PK → violates 3NF
-- Move zip → city to separate table

-- When to DENORMALIZE:
-- 1. Read-heavy workloads (avoid JOINs)
-- 2. Reporting/analytics tables
-- 3. Caching computed values (e.g., order_total stored vs calculated)
-- 4. Microservice boundaries (each service has its own read model)

-- Example: Denormalized order
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    customer_id BIGINT,
    customer_name VARCHAR(100),    -- Denormalized (avoid JOIN to customers)
    customer_email VARCHAR(255),   -- Denormalized
    total DECIMAL(10,2),           -- Precomputed (avoid SUM on items)
    item_count INT                 -- Precomputed
);

-- Trade-off:
-- Normalized: Less storage, no update anomalies, DRY
-- Denormalized: Faster reads, simpler queries, data duplication</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'How to design a database for a real-world e-commerce application?',
        a: `<pre><code>-- Core tables:
CREATE TABLE customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    category_id BIGINT,
    INDEX idx_category (category_id),
    INDEX idx_sku (sku)
);

CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    status ENUM('PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED') DEFAULT 'PENDING',
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    INDEX idx_customer_status (customer_id, status),
    INDEX idx_status_created (status, created_at)
);

CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,  -- Snapshot! Don't reference current price
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_order (order_id)
);

-- Key design decisions:
-- 1. unit_price stored (not referenced) — price changes shouldn't affect old orders
-- 2. Composite indexes aligned with query patterns
-- 3. ENUM for status (constrained values, compact storage)
-- 4. created_at for time-based queries and auditing</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'Replication & Scaling',
    questions: [
      {
        q: 'Explain MySQL replication. How does master-slave / primary-replica work?',
        a: `<pre><code>-- Master-Slave (Primary-Replica) replication:
-- Primary: Handles all writes. Writes to binary log (binlog).
-- Replica: Reads binlog from primary, replays changes. Handles reads.

-- Replication types:
-- Statement-based: Replays SQL statements (smaller logs, non-deterministic risks)
-- Row-based: Replays actual row changes (larger logs, deterministic)
-- Mixed: Statement by default, row when non-deterministic

-- Read/write splitting (Spring):
@Transactional(readOnly = true)  // Routes to replica
public List&lt;Order&gt; findOrders() { ... }

@Transactional  // Routes to primary
public Order createOrder(OrderRequest req) { ... }

-- Replication lag: Replica may be seconds behind primary
-- Problem: Write to primary, immediately read from replica → stale data!
-- Solutions:
-- 1. Read from primary after write (for that user/session)
-- 2. Monotonic reads (track user's last write timestamp)
-- 3. Semi-synchronous replication (primary waits for 1 replica ACK)

-- Scaling:
-- Vertical: Bigger server (limited)
-- Horizontal reads: Add replicas (read scaling)
-- Horizontal writes: Sharding (partition data across multiple primaries)

-- Sharding:
-- Key-based: hash(user_id) % num_shards → which shard
-- Range-based: user_id 1-1M → shard 1, 1M-2M → shard 2
-- Problems: Cross-shard queries, rebalancing, transactions</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'How to handle connection pooling and optimize MySQL connections?',
        a: `<pre><code>-- Connection pooling: Reuse DB connections (creating connections is expensive!)
-- Libraries: HikariCP (Spring Boot default), c3p0, DBCP

# Spring Boot HikariCP configuration:
spring:
  datasource:
    hikari:
      maximum-pool-size: 20        # Max connections in pool
      minimum-idle: 5              # Min idle connections
      connection-timeout: 30000    # Max wait for connection (ms)
      idle-timeout: 600000         # Max time connection can sit idle
      max-lifetime: 1800000        # Max lifetime of connection (30 min)
      leak-detection-threshold: 60000  # Log warning if connection held > 60s

-- Pool sizing formula:
-- connections = (core_count * 2) + effective_spindle_count
-- For SSD: connections ≈ core_count * 2 + 1
-- Example: 8 cores + SSD = ~17 connections

-- MySQL server settings:
max_connections = 500              -- Max total connections
wait_timeout = 28800               -- Close idle connections after 8 hours
interactive_timeout = 28800

-- Monitoring connections:
SHOW PROCESSLIST;                  -- Active connections
SHOW STATUS LIKE 'Threads_connected';  -- Current connections
SHOW STATUS LIKE 'Threads_running';    -- Actually executing

-- Connection exhaustion symptoms:
-- "Too many connections" error
-- Application hangs waiting for connection
-- Fix: Increase pool size, fix connection leaks, optimize query time</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
];

export default sections;
