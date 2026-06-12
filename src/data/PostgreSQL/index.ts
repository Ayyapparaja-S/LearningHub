import type { Section } from '../../types';

const sections: Section[] = [
  {
    title: 'MVCC & Architecture',
    questions: [
      {
        q: 'How does PostgreSQL MVCC differ from MySQL InnoDB?',
        a: `<pre><code>-- PostgreSQL MVCC:
-- Every row version lives in the HEAP (main table storage)
-- Each row has: xmin (creating transaction), xmax (deleting transaction)
-- UPDATE = INSERT new version + mark old version (xmax set)
-- No separate undo log — old versions in-place

-- Visibility check:
-- Row visible if: xmin committed AND (xmax not set OR xmax not committed)
-- Transaction snapshot: List of in-progress transactions at query start

-- Key difference from MySQL:
-- MySQL: Old versions in undo log (separate), current in-place
-- PostgreSQL: All versions in heap → needs VACUUM to reclaim space!

-- VACUUM: Cleans dead tuples (old row versions)
VACUUM VERBOSE orders;           -- Standard vacuum (marks space reusable)
VACUUM FULL orders;              -- Compacts table (exclusive lock! rewrites table)
-- Autovacuum: Background process, runs automatically
-- Configure: autovacuum_vacuum_threshold, autovacuum_vacuum_scale_factor

-- Transaction IDs:
-- 32-bit counter (wraps around at ~4 billion)
-- MUST vacuum to prevent wraparound → "emergency autovacuum"
-- Monitor: SELECT age(datfrozenxid) FROM pg_database;

-- HOT (Heap-Only Tuples):
-- If update doesn't change indexed columns, new version can link in-place
-- No index update needed → much faster updates
-- Requires fillfactor &lt; 100 (leave space for HOT chains)
ALTER TABLE orders SET (fillfactor = 80);</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'Explain PostgreSQL isolation levels and how they prevent anomalies.',
        a: `<pre><code>-- PostgreSQL isolation levels:
-- READ COMMITTED (default): Each statement sees latest committed data
-- REPEATABLE READ: Transaction sees snapshot from first query
-- SERIALIZABLE: True serializability (SSI — Serializable Snapshot Isolation)

-- READ COMMITTED:
BEGIN;
SELECT balance FROM accounts WHERE id = 1; -- 1000
-- Another transaction commits: UPDATE balance = 500
SELECT balance FROM accounts WHERE id = 1; -- 500 (sees new committed value!)
COMMIT;

-- REPEATABLE READ:
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT balance FROM accounts WHERE id = 1; -- 1000
-- Another transaction commits: UPDATE balance = 500
SELECT balance FROM accounts WHERE id = 1; -- 1000 (still sees snapshot!)
-- BUT: If we try to UPDATE the same row:
UPDATE accounts SET balance = 900 WHERE id = 1;
-- ERROR: could not serialize access (detects write conflict!)
COMMIT;

-- SERIALIZABLE (SSI):
-- Detects dependency cycles between transactions
-- Uses predicate locks (not real locks — read tracking)
-- If cycle detected → one transaction aborted with serialization failure
-- Application MUST retry on serialization failure!

-- PostgreSQL vs MySQL:
-- PG REPEATABLE READ: Detects write conflicts (error) — stricter
-- MySQL REPEATABLE READ: Uses gap locks (prevents phantom reads)
-- PG SERIALIZABLE: True serializability via SSI — no phantom anomalies
-- MySQL SERIALIZABLE: S-locks on all reads (much slower)</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'Advanced Data Types',
    questions: [
      {
        q: 'When and how to use JSONB in PostgreSQL?',
        a: `<pre><code>-- JSONB: Binary JSON — parsed, indexed, faster to query. Use over JSON.
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert:
INSERT INTO events (type, payload) VALUES ('order_placed', 
    '{"orderId": "ORD-123", "items": [{"sku": "A1", "qty": 2}], "total": 99.99}');

-- Query operators:
SELECT * FROM events WHERE payload->>'orderId' = 'ORD-123';  -- Text extraction
SELECT * FROM events WHERE payload->'total' > '50';          -- Numeric compare
SELECT * FROM events WHERE payload @> '{"type": "premium"}'; -- Contains
SELECT * FROM events WHERE payload ? 'discount';             -- Key exists
SELECT * FROM events WHERE payload->'items' @> '[{"sku": "A1"}]'; -- Array contains

-- Indexing JSONB:
CREATE INDEX idx_payload_gin ON events USING GIN (payload);  -- All keys/values
CREATE INDEX idx_order_id ON events ((payload->>'orderId')); -- Specific path

-- GIN index supports: @>, ?, ?|, ?&
-- Expression index supports: =, comparison operators

-- When to use JSONB:
-- ✓ Schema-less / variable attributes (product features, form data)
-- ✓ Event sourcing payloads
-- ✓ API response caching
-- ✗ Frequently queried/joined fields → use regular columns
-- ✗ When you need referential integrity on nested data

-- JSONB functions:
SELECT jsonb_array_elements(payload->'items') AS item FROM events;  -- Expand array
SELECT jsonb_set(payload, '{status}', '"shipped"') FROM events;     -- Update field</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Explain PostgreSQL arrays, hstore, and composite types.',
        a: `<pre><code>-- Arrays:
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}'
);
INSERT INTO articles (title, tags) VALUES ('Postgres Tips', ARRAY['database', 'postgresql']);
SELECT * FROM articles WHERE 'database' = ANY(tags);  -- Contains element
SELECT * FROM articles WHERE tags @> ARRAY['postgresql']; -- Contains all
CREATE INDEX idx_tags ON articles USING GIN (tags);  -- Array GIN index

-- Array operations:
SELECT array_length(tags, 1) FROM articles;           -- Length
SELECT unnest(tags) FROM articles WHERE id = 1;       -- Expand to rows
UPDATE articles SET tags = array_append(tags, 'tips') WHERE id = 1;

-- Enum types:
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered');
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    status order_status DEFAULT 'pending'
);
-- Pros: Type safety, compact storage (4 bytes), readable
-- Cons: Hard to modify (ALTER TYPE ADD VALUE, can't remove values)

-- Range types:
CREATE TABLE meetings (
    id SERIAL PRIMARY KEY,
    room_id INT,
    during TSTZRANGE NOT NULL,
    EXCLUDE USING GIST (room_id WITH =, during WITH &&) -- No overlapping bookings!
);
INSERT INTO meetings (room_id, during) VALUES (1, '[2024-01-15 10:00, 2024-01-15 11:00)');
SELECT * FROM meetings WHERE during @> NOW()::timestamptz; -- Current meetings

-- Full-text search types:
ALTER TABLE articles ADD COLUMN search_vector TSVECTOR;
CREATE INDEX idx_search ON articles USING GIN (search_vector);
SELECT * FROM articles WHERE search_vector @@ to_tsquery('postgres & tips');</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'Window Functions & CTEs',
    questions: [
      {
        q: 'Explain Common Table Expressions (CTEs) and recursive CTEs.',
        a: `<pre><code>-- CTE (WITH clause): Named subquery, improves readability
WITH active_customers AS (
    SELECT customer_id, COUNT(*) AS order_count
    FROM orders WHERE status = 'delivered' AND created_at > NOW() - INTERVAL '1 year'
    GROUP BY customer_id
),
high_value AS (
    SELECT customer_id, SUM(total) AS total_spent
    FROM orders GROUP BY customer_id HAVING SUM(total) > 10000
)
SELECT c.name, ac.order_count, hv.total_spent
FROM customers c
JOIN active_customers ac ON c.id = ac.customer_id
JOIN high_value hv ON c.id = hv.customer_id;

-- Recursive CTE: For hierarchical/tree data
-- Employee hierarchy:
WITH RECURSIVE org_tree AS (
    -- Base case: top-level managers
    SELECT id, name, manager_id, 1 AS depth, ARRAY[name] AS path
    FROM employees WHERE manager_id IS NULL
    
    UNION ALL
    
    -- Recursive case: employees under each manager
    SELECT e.id, e.name, e.manager_id, ot.depth + 1, ot.path || e.name
    FROM employees e JOIN org_tree ot ON e.manager_id = ot.id
)
SELECT * FROM org_tree ORDER BY path;

-- Use cases for recursive CTEs:
-- Organization hierarchies
-- Bill of materials (parts → sub-parts)
-- Graph traversal (shortest path)
-- Generate series (dates, numbers)
-- Fibonacci, tree flattening

-- CTE performance (PostgreSQL 12+):
-- By default, CTEs are optimization barriers (materialized)
-- Use: WITH cte AS NOT MATERIALIZED (...) to allow inlining</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Advanced window functions: frames, PARTITION BY, and analytics.',
        a: `<pre><code>-- Window frame specification:
SELECT date, revenue,
    -- Running total
    SUM(revenue) OVER (ORDER BY date) AS running_total,
    -- 7-day moving average
    AVG(revenue) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS moving_avg,
    -- Month-to-date total
    SUM(revenue) OVER (PARTITION BY date_trunc('month', date) ORDER BY date) AS mtd,
    -- Percent of total
    revenue::NUMERIC / SUM(revenue) OVER () * 100 AS pct_of_total
FROM daily_revenue;

-- Frame types:
-- ROWS BETWEEN: Physical rows
-- RANGE BETWEEN: Logical value range (groups ties together)
-- GROUPS BETWEEN: Groups of peer rows

-- Practical analytics:
-- Year-over-year growth:
SELECT month, revenue,
    LAG(revenue, 12) OVER (ORDER BY month) AS same_month_last_year,
    (revenue - LAG(revenue, 12) OVER (ORDER BY month)) /
     LAG(revenue, 12) OVER (ORDER BY month) * 100 AS yoy_growth_pct
FROM monthly_revenue;

-- Percentile/distribution:
SELECT department, salary,
    PERCENT_RANK() OVER (PARTITION BY department ORDER BY salary) AS percentile,
    NTILE(4) OVER (PARTITION BY department ORDER BY salary) AS quartile
FROM employees;

-- First/last value in window:
SELECT department, name, salary,
    FIRST_VALUE(name) OVER (PARTITION BY department ORDER BY salary DESC) AS highest_paid,
    NTH_VALUE(name, 2) OVER (PARTITION BY department ORDER BY salary DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS second_highest
FROM employees;</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'Indexing & Performance',
    questions: [
      {
        q: 'Explain PostgreSQL index types: B-tree, GIN, GiST, BRIN.',
        a: `<pre><code>-- B-tree (default): Equality and range queries on scalar values
CREATE INDEX idx_created ON orders (created_at);
-- Best for: =, &lt;, >, BETWEEN, IN, IS NULL, ORDER BY
-- Most common. Default choice for most columns.

-- GIN (Generalized Inverted Index): "Contains" queries
CREATE INDEX idx_tags ON articles USING GIN (tags);
CREATE INDEX idx_payload ON events USING GIN (payload jsonb_path_ops);
-- Best for: Arrays (@>), JSONB (@>, ?, ?|), Full-text (@@), trgm (LIKE '%x%')
-- Slow to update, fast to query. Good for read-heavy, rarely-updated data.

-- GiST (Generalized Search Tree): Overlaps, nearest-neighbor
CREATE INDEX idx_location ON stores USING GiST (location);
CREATE INDEX idx_range ON bookings USING GiST (during);
-- Best for: Geometry (PostGIS), ranges (&&, @>), full-text (less precise than GIN)
-- Supports exclusion constraints (no overlapping ranges)

-- BRIN (Block Range Index): Very large tables, naturally ordered data
CREATE INDEX idx_created_brin ON logs USING BRIN (created_at);
-- Stores min/max per block range. Tiny index. O(blocks) not O(rows).
-- Best for: Time-series data, append-only tables, correlation > 0.9
-- Very small index size, but less precise than B-tree.

-- Partial index: Index subset of rows
CREATE INDEX idx_active_orders ON orders (created_at) WHERE status = 'active';
-- Only indexes active orders → smaller, faster

-- Expression index:
CREATE INDEX idx_lower_email ON users (LOWER(email));
-- Now: WHERE LOWER(email) = 'john@test.com' can use index

-- Multicolumn considerations:
-- Order matters! (same as MySQL composite index left-prefix rule)
-- Put most selective / equality columns first</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How to use EXPLAIN ANALYZE and diagnose performance issues?',
        a: `<pre><code>-- EXPLAIN ANALYZE: Actually executes query and shows real timings
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT o.*, c.name FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.status = 'active' AND o.created_at > '2024-01-01'
ORDER BY o.total DESC LIMIT 20;

-- Key metrics:
-- actual time: Start-up time..total time (ms)
-- rows: Actual rows vs planned (big mismatch = stale statistics → ANALYZE)
-- loops: How many times node executed
-- Buffers: shared hit (cache) vs shared read (disk)

-- Node types (good → bad):
-- Index Only Scan: Best (reads index only, no table access)
-- Index Scan: Good (index + table fetch)
-- Bitmap Index Scan + Bitmap Heap Scan: Good for many rows
-- Seq Scan: Full table scan (OK for small tables, BAD for large)
-- Nested Loop: Good for small sets, bad for large
-- Hash Join: Good for large equi-joins
-- Merge Join: Good for pre-sorted data

-- Red flags:
-- Seq Scan on large table with selective WHERE
-- Sort with "Sort Method: external merge" (spilling to disk)
-- Nested Loop with high "loops" count
-- Rows estimate far from actual (need ANALYZE)

-- Fix stale statistics:
ANALYZE orders;  -- Refresh statistics for planner

-- pg_stat_statements: Track slow queries across all executions
CREATE EXTENSION pg_stat_statements;
SELECT query, calls, mean_exec_time, rows
FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 20;</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'Partitioning & Scaling',
    questions: [
      {
        q: 'How does table partitioning work in PostgreSQL?',
        a: `<pre><code>-- Declarative partitioning (PostgreSQL 10+):
-- Split large table into smaller physical tables by key

-- Range partitioning (most common for time-series):
CREATE TABLE events (
    id BIGSERIAL,
    event_type TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL
) PARTITION BY RANGE (created_at);

-- Create partitions:
CREATE TABLE events_2024_q1 PARTITION OF events
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
CREATE TABLE events_2024_q2 PARTITION OF events
    FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
CREATE TABLE events_2024_q3 PARTITION OF events
    FOR VALUES FROM ('2024-07-01') TO ('2024-10-01');

-- Default partition (catch-all):
CREATE TABLE events_default PARTITION OF events DEFAULT;

-- List partitioning (by category):
CREATE TABLE orders (id BIGSERIAL, region TEXT, total NUMERIC)
PARTITION BY LIST (region);
CREATE TABLE orders_us PARTITION OF orders FOR VALUES IN ('US');
CREATE TABLE orders_eu PARTITION OF orders FOR VALUES IN ('UK','DE','FR');

-- Hash partitioning (distribute evenly):
CREATE TABLE sessions (id UUID, user_id BIGINT, data JSONB)
PARTITION BY HASH (user_id);
CREATE TABLE sessions_0 PARTITION OF sessions FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE sessions_1 PARTITION OF sessions FOR VALUES WITH (MODULUS 4, REMAINDER 1);

-- Benefits:
-- Partition pruning: Only scan relevant partitions
-- Bulk delete: DROP partition instead of DELETE (instant!)
-- Parallel query across partitions
-- Each partition can have own indexes, tablespace

-- Maintenance:
-- Create future partitions automatically (pg_partman extension)
-- Indexes must be created on EACH partition (or use CREATE INDEX on parent)</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'PostgreSQL vs MySQL — when to choose which?',
        a: `<pre><code>-- Choose PostgreSQL when:
-- ✓ Complex queries (CTEs, window functions, lateral joins)
-- ✓ JSONB / semi-structured data
-- ✓ Geospatial (PostGIS is industry-leading)
-- ✓ Full-text search built-in
-- ✓ Custom types, domains, extensions
-- ✓ ACID compliance is critical (true serializable isolation)
-- ✓ Write-heavy with concurrent reads (MVCC without gap locks)
-- ✓ Standards compliance matters
-- ✓ Data integrity (better constraint support, exclusion constraints)

-- Choose MySQL when:
-- ✓ Simple CRUD / web applications
-- ✓ Read-heavy with simple queries
-- ✓ Need easy replication setup (battle-tested master-slave)
-- ✓ Hosting/cloud support (wider availability)
-- ✓ Team familiarity
-- ✓ High-volume simple reads (with query cache / ProxySQL)
-- ✓ Document store mode (MySQL as NoSQL)

-- Key technical differences:
-- Replication: MySQL binlog vs PG WAL-based logical replication
-- MVCC: MySQL undo log vs PG in-heap versions (needs vacuum)
-- Clustering: MySQL Group Replication vs PG Patroni/Citus
-- JSON: Both support, PG JSONB is more mature/indexed
-- Partitioning: Both support, PG more flexible (hash, list, range)
-- Stored procedures: MySQL limited vs PG PL/pgSQL, PL/Python, etc.
-- Concurrency: PG handles high-concurrency writes better (no gap locks)

-- Performance:
-- Simple queries: MySQL often faster (simpler optimizer)
-- Complex queries: PostgreSQL usually faster (better planner)
-- Both scale well for most applications</code></pre>`,
        level: 'basic' as const
      },
    ]
  },
];

export default sections;
