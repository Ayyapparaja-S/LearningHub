import type { Section } from '../../types';

const sections: Section[] = [
  {
    title: 'Data Structures & Commands',
    questions: [
      {
        q: 'Explain all Redis data structures and their use cases.',
        a: `<pre><code>-- STRINGS: Simplest type. Key → value (up to 512MB)
SET user:1:name "Alice"         -- Set
GET user:1:name                 -- Get
INCR page:views                 -- Atomic increment (counters!)
SETEX session:abc 3600 "data"   -- Set with TTL (seconds)
SETNX lock:order:123 "owner"   -- Set if Not eXists (distributed lock!)

-- HASHES: Key → field/value pairs (like a mini object)
HSET user:1 name "Alice" email "a@b.com" age 30
HGET user:1 name                -- "Alice"
HGETALL user:1                  -- All fields
HINCRBY user:1 age 1            -- Increment field
-- Use case: User profiles, session data, object caching

-- LISTS: Ordered collection (doubly linked list)
LPUSH queue:emails "email1"     -- Push left (head)
RPUSH queue:emails "email2"     -- Push right (tail)
RPOP queue:emails               -- Pop from right
BRPOP queue:emails 30           -- Blocking pop (wait 30s) — message queue!
LRANGE queue:emails 0 -1        -- Get all elements
-- Use case: Message queues, activity feeds, recent items

-- SETS: Unordered unique elements
SADD tags:post:1 "java" "redis" "backend"
SMEMBERS tags:post:1            -- All members
SISMEMBER tags:post:1 "java"    -- Check membership O(1)
SINTER tags:post:1 tags:post:2  -- Intersection
SUNION tags:post:1 tags:post:2  -- Union
-- Use case: Tags, unique visitors, mutual friends

-- SORTED SETS (ZSETs): Unique elements with score (ordered by score)
ZADD leaderboard 100 "player1" 85 "player2" 92 "player3"
ZREVRANGE leaderboard 0 9 WITHSCORES  -- Top 10
ZRANK leaderboard "player1"     -- Rank (0-based)
ZINCRBY leaderboard 5 "player2" -- Increment score
-- Use case: Leaderboards, priority queues, time-based feeds

-- STREAMS (Redis 5.0+): Append-only log (like Kafka lite)
XADD events * user "alice" action "login"
XREAD COUNT 10 STREAMS events 0  -- Read from beginning
-- Use case: Event sourcing, activity streams, lightweight pub/sub</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'How does Redis achieve O(1) time complexity for most operations?',
        a: `<pre><code>-- Redis internal data structures:
-- Strings: Simple Dynamic String (SDS) — O(1) length, O(1) append (pre-allocated)
-- Hashes: ziplist (small) → hashtable (large)
--   ziplist: compact, sequential memory, O(n) but fast for small N
--   hashtable: O(1) lookup when > hash-max-ziplist-entries (default 128)
-- Lists: ziplist (small) → quicklist (linked list of ziplists)
-- Sets: intset (all integers, small) → hashtable (large/mixed)
-- Sorted Sets: ziplist (small) → skiplist + hashtable (large)

-- Skip List (Sorted Set internals):
-- Probabilistic balanced structure. O(log n) insert/search.
-- Multiple levels of linked lists (like express lanes)
-- Level 1: [1] → [3] → [5] → [7] → [9]
-- Level 2: [1] ───→ [5] ───→ [9]
-- Level 3: [1] ─────────→ [9]
-- Average O(log n), simpler than balanced trees

-- Memory optimization (encoding thresholds):
-- hash-max-ziplist-entries 128  (use ziplist if ≤ 128 fields)
-- hash-max-ziplist-value 64     (use ziplist if values ≤ 64 bytes)
-- list-max-ziplist-size -2      (8KB per ziplist node)
-- set-max-intset-entries 512    (use intset if ≤ 512 integer elements)

-- Single-threaded event loop:
-- No locks, no context switches → pure throughput
-- All operations atomic by default
-- ~100K-200K ops/sec on single core
-- Redis 6.0+: I/O threads (multi-threaded I/O, single-threaded execution)</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'Caching Patterns',
    questions: [
      {
        q: 'Explain Cache-Aside, Read-Through, Write-Through, and Write-Behind patterns.',
        a: `<pre><code>-- CACHE-ASIDE (Lazy Loading) — Most common pattern:
// Read: Check cache → if miss, load from DB → put in cache
public User getUser(String id) {
    User cached = redis.get("user:" + id);
    if (cached != null) return cached;
    
    User user = db.findById(id);
    redis.setex("user:" + id, 3600, user); // Cache for 1 hour
    return user;
}
// Write: Update DB → invalidate cache (don't update cache!)
public void updateUser(User user) {
    db.save(user);
    redis.del("user:" + user.getId()); // Invalidate, not update
}
// Pros: Only caches what's needed. Simple.
// Cons: Cache miss penalty. Stale data until TTL expires.

-- READ-THROUGH: Cache manages DB reads (transparent)
// Cache library auto-loads from DB on miss
@Cacheable("users")
public User getUser(String id) { return db.findById(id); }
// Pros: Simpler application code
// Cons: First request always slow

-- WRITE-THROUGH: Write to cache AND DB synchronously
// Every write updates both cache and DB
public void saveUser(User user) {
    cache.put("user:" + user.getId(), user); // Cache writes to DB internally
}
// Pros: Cache always consistent. No stale reads.
// Cons: Write latency (two writes). Cache filled with rarely-read data.

-- WRITE-BEHIND (Write-Back): Write cache, async flush to DB
// Write to cache immediately, batch write to DB later
// Pros: Very fast writes. Batch DB operations.
// Cons: Data loss risk if cache crashes before flush!

-- Best practices:
-- 1. Always set TTL (prevent stale data forever)
-- 2. Cache-aside for most cases
-- 3. Write-through for read-heavy, consistency-critical
-- 4. Never update cache on write (delete/invalidate instead!)
-- Why? Race condition: Thread A reads old, Thread B updates, Thread A caches stale</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How to handle cache invalidation and cache stampede?',
        a: `<pre><code>-- Cache Stampede (Thundering Herd):
-- Problem: Key expires → 1000 requests simultaneously hit DB!

-- Solution 1: Mutex/Lock (Distributed lock)
public User getUserWithLock(String id) {
    User cached = redis.get("user:" + id);
    if (cached != null) return cached;
    
    // Try to acquire lock
    boolean locked = redis.setnx("lock:user:" + id, "1");
    if (locked) {
        redis.expire("lock:user:" + id, 10); // Lock TTL
        try {
            User user = db.findById(id); // Only ONE thread queries DB
            redis.setex("user:" + id, 3600, user);
            return user;
        } finally {
            redis.del("lock:user:" + id);
        }
    } else {
        Thread.sleep(100); // Wait and retry
        return getUserWithLock(id);
    }
}

-- Solution 2: Probabilistic early refresh
// Refresh before TTL expires (random jitter)
if (ttl &lt; random(60, 120)) { // Refresh if TTL < random 1-2 minutes
    asyncRefreshCache(key); // Background refresh
}

-- Solution 3: Never expire (background refresh)
// Cache never expires. Background job refreshes periodically.
// Stale data served briefly during refresh.

-- Cache Invalidation Patterns:
-- 1. TTL-based: Simple, eventual consistency
-- 2. Event-based: Publish event on update → subscribers invalidate
-- 3. Version-based: "user:1:v5" — include version in key
-- 4. Tag-based: Tag keys, invalidate all keys with tag

-- Cache Penetration (query for non-existent keys):
-- Solution: Cache NULL values with short TTL
-- Solution: Bloom filter — check if key could exist before querying DB</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'What eviction policies does Redis support? When to use each?',
        a: `<pre><code># Redis eviction policies (maxmemory-policy):
# When max memory reached, Redis must evict keys:

# noeviction: Return error on writes (default). Don't evict.
# Use: When data loss is unacceptable.

# allkeys-lru: Evict LEAST RECENTLY USED key from ALL keys.
# Use: General caching (most common choice!)

# allkeys-lfu: Evict LEAST FREQUENTLY USED from all keys. (Redis 4.0+)
# Use: When access patterns are stable (frequently accessed items stay)

# volatile-lru: LRU only among keys with TTL set.
# Use: Mix of cached (TTL) and permanent data.

# volatile-lfu: LFU only among keys with TTL set.
# volatile-ttl: Evict keys with shortest remaining TTL.
# volatile-random: Random eviction among keys with TTL.
# allkeys-random: Random eviction from all keys.

# Configuration:
maxmemory 4gb
maxmemory-policy allkeys-lru

# LRU approximation: Redis samples N keys, evicts least recent
# maxmemory-samples 10 (higher = more accurate, more CPU)

# LFU tuning (Redis 4.0+):
# lfu-log-factor 10 (higher = slower frequency counter growth)
# lfu-decay-time 1 (minutes before frequency counter decays)

# Monitoring:
INFO memory  -- used_memory, maxmemory, evicted_keys
INFO stats   -- keyspace_hits, keyspace_misses (hit ratio!)

# Best practice: Set maxmemory to 75% of available RAM
# Leave room for: fragmentation, fork (persistence), OS</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'Persistence & High Availability',
    questions: [
      {
        q: 'Explain RDB vs AOF persistence. How to choose?',
        a: `<pre><code># RDB (Redis Database): Point-in-time snapshots
# How: fork() → child process writes entire dataset to dump.rdb
save 900 1      # Snapshot if ≥1 key changed in 900 seconds
save 300 10     # Snapshot if ≥10 keys changed in 300 seconds
save 60 10000   # Snapshot if ≥10000 keys changed in 60 seconds

# RDB Pros:
# - Compact single file (great for backups)
# - Fast restart (load binary dump)
# - Less I/O (periodic, not every write)
# RDB Cons:
# - Data loss between snapshots (last few minutes)
# - fork() can be slow on large datasets (copies page tables)

# AOF (Append Only File): Log every write operation
appendonly yes
appendfsync everysec   # Sync to disk every second (recommended)
# appendfsync always   # Sync every write (safest, slowest)
# appendfsync no       # OS decides when to flush (fastest, risky)

# AOF Pros:
# - At most 1 second of data loss (with everysec)
# - Human-readable log
# - Auto-rewrite to compact file
# AOF Cons:
# - Larger file size
# - Slower restart (replay all commands)
# - Slightly slower writes

# AOF Rewrite: Compact AOF by generating minimum commands for current state
auto-aof-rewrite-percentage 100  # Rewrite when AOF doubles
auto-aof-rewrite-min-size 64mb

# Best practice: Use BOTH RDB + AOF
# AOF for durability (minimal data loss)
# RDB for backups and faster disaster recovery

# Redis 7.0+: Multi-part AOF (better rewrite performance)
# On restart: Redis loads AOF if exists, else RDB</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How do Redis Sentinel and Redis Cluster work?',
        a: `<pre><code># REDIS SENTINEL: High availability for master-replica setup
# Monitors master, auto-failover if master goes down

# Architecture:
# Sentinel 1 ──┐
# Sentinel 2 ──┼──→ Monitor Master ←──→ Replica 1
# Sentinel 3 ──┘                    ←──→ Replica 2

# How failover works:
# 1. Sentinels monitor master with PING
# 2. If SDOWN (subjective down) — one sentinel thinks it's down
# 3. If ODOWN (objective down) — quorum agrees (e.g., 2/3 sentinels)
# 4. Leader election among sentinels (Raft-like)
# 5. Leader promotes a replica to master
# 6. Other replicas reconfigured to follow new master
# 7. Clients notified of new master address

# sentinel.conf:
sentinel monitor mymaster 10.0.0.1 6379 2  # 2 = quorum
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 60000

# Limitations: No data sharding! Single master for writes.

# REDIS CLUSTER: Horizontal scaling (sharding + HA)
# 16384 hash slots distributed across master nodes
# Key → CRC16(key) % 16384 → slot → node

# Architecture (6 nodes minimum: 3 masters + 3 replicas):
# Master A [slots 0-5460] ←→ Replica A'
# Master B [slots 5461-10922] ←→ Replica B'
# Master C [slots 10923-16383] ←→ Replica C'

# If Master B dies → Replica B' promoted (automatic)
# If both Master B and Replica B' die → cluster is DOWN (those slots unavailable)

# Limitations:
# - Multi-key operations only within SAME slot (use {hash_tag})
# - No support for SELECT (single DB)
# - Slightly higher latency (redirection: MOVED, ASK)
# - Pub/Sub messages broadcast to ALL nodes

# Hash tags: Force keys to same slot
SET {user:1}:profile "data"
SET {user:1}:sessions "data"
# Both go to same slot → multi-key operations work!</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'Real-World Patterns',
    questions: [
      {
        q: 'Implement distributed locking with Redis (Redlock).',
        a: `<pre><code>// Simple distributed lock (single instance):
public boolean acquireLock(String resource, String owner, int ttlMs) {
    // SET key value NX PX ttl → atomic "set if not exists with TTL"
    String result = redis.set("lock:" + resource, owner, "NX", "PX", ttlMs);
    return "OK".equals(result);
}

public boolean releaseLock(String resource, String owner) {
    // Lua script: Check owner before deleting (atomic!)
    String script = "if redis.call('get', KEYS[1]) == ARGV[1] then " +
                    "return redis.call('del', KEYS[1]) else return 0 end";
    return redis.eval(script, 1, "lock:" + resource, owner) == 1;
}
// Why Lua? GET + DEL must be atomic. Without Lua, another client could
// acquire lock between GET and DEL.

// REDLOCK Algorithm (multi-instance, fault-tolerant):
// 1. Get current time T1
// 2. Try to acquire lock on N/2+1 Redis instances (e.g., 3/5)
// 3. Calculate elapsed time. Lock valid if: majority acquired AND elapsed < TTL
// 4. If failed, release lock on ALL instances

// Spring Integration (Redisson):
RLock lock = redisson.getLock("order:" + orderId);
try {
    if (lock.tryLock(5, 30, TimeUnit.SECONDS)) { // wait 5s, hold 30s
        processOrder(orderId);
    }
} finally {
    lock.unlock();
}

// Common pitfalls:
// - No owner check on release → releasing someone else's lock!
// - TTL too short → lock expires while still processing
// - No retry with backoff → busy waiting
// - Clock drift in Redlock → controversial (see Martin Kleppmann critique)</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'Rate limiting with Redis (Token Bucket / Sliding Window).',
        a: `<pre><code>-- SLIDING WINDOW COUNTER (Lua script — atomic):
-- Allow max 100 requests per 60 seconds per user

local key = KEYS[1]              -- "ratelimit:user:123"
local limit = tonumber(ARGV[1])  -- 100
local window = tonumber(ARGV[2]) -- 60
local now = tonumber(ARGV[3])    -- current timestamp

-- Remove entries outside window
redis.call('ZREMRANGEBYSCORE', key, 0, now - window)

-- Count requests in window
local count = redis.call('ZCARD', key)

if count < limit then
    -- Allow: Add current request
    redis.call('ZADD', key, now, now .. math.random())
    redis.call('EXPIRE', key, window)
    return 1  -- ALLOWED
else
    return 0  -- RATE LIMITED
end

-- Java implementation:
public boolean isAllowed(String userId, int limit, int windowSec) {
    String key = "ratelimit:" + userId;
    long now = System.currentTimeMillis() / 1000;
    Long result = (Long) redis.eval(SCRIPT, List.of(key),
        List.of(String.valueOf(limit), String.valueOf(windowSec), String.valueOf(now)));
    return result == 1;
}

-- FIXED WINDOW (simpler, less accurate):
INCR ratelimit:user:123:1705312800  -- Increment counter for current minute
EXPIRE ratelimit:user:123:1705312800 60
-- If value > limit → reject

-- TOKEN BUCKET (with Redis):
-- Store: {tokens: float, last_refill: timestamp}
-- On request: Calculate new tokens since last_refill, consume 1
-- Allows bursts up to bucket capacity</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How to implement session management and leaderboards with Redis?',
        a: `<pre><code>// SESSION MANAGEMENT:
// Store session data as Hash (efficient, partial updates)
public void createSession(String sessionId, Map&lt;String, String&gt; data) {
    String key = "session:" + sessionId;
    redis.hset(key, data);          // Store all fields
    redis.expire(key, 1800);        // 30 min TTL
}

public void extendSession(String sessionId) {
    redis.expire("session:" + sessionId, 1800); // Slide expiration
}

// Spring Session Redis (automatic):
@Configuration
@EnableRedisHttpSession(maxInactiveIntervalInSeconds = 1800)
public class SessionConfig { }

// LEADERBOARD with Sorted Set:
public void addScore(String player, double score) {
    redis.zadd("leaderboard", score, player);
}

public Long getRank(String player) {
    return redis.zrevrank("leaderboard", player); // 0-based rank (highest first)
}

public Set&lt;Tuple&gt; getTopN(int n) {
    return redis.zrevrangeWithScores("leaderboard", 0, n - 1);
}

public Set&lt;Tuple&gt; getAroundPlayer(String player, int range) {
    Long rank = redis.zrevrank("leaderboard", player);
    long start = Math.max(0, rank - range);
    long end = rank + range;
    return redis.zrevrangeWithScores("leaderboard", start, end);
}

// REAL-TIME COUNTERS (page views, likes):
redis.incr("views:article:456");                    // Total views
redis.pfadd("unique:article:456", visitorId);       // HyperLogLog: unique views
redis.pfcount("unique:article:456");                // Approximate unique count

// PUB/SUB (real-time notifications):
// Publisher: redis.publish("notifications:user:1", message);
// Subscriber: redis.subscribe("notifications:user:1", callback);
// Note: No persistence! Messages lost if no subscriber online. Use Streams instead.</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'Transactions & Lua Scripting',
    questions: [
      {
        q: 'Explain Redis transactions (MULTI/EXEC) and their limitations.',
        a: `<pre><code>-- Redis Transactions: MULTI / EXEC / WATCH
-- NOT like SQL transactions! No rollback!

MULTI                          -- Start transaction
SET user:1:balance 1000        -- Queued
DECRBY user:1:balance 100      -- Queued
INCRBY user:2:balance 100      -- Queued
EXEC                           -- Execute all atomically (no interleaving)

-- Key properties:
-- 1. All commands execute sequentially (no other client interrupts)
-- 2. All or none execute (if EXEC) — BUT no rollback on error!
-- 3. If a command fails, others STILL execute (partial failure!)

-- WATCH: Optimistic locking (check-and-set)
WATCH user:1:balance
val = GET user:1:balance       -- Read current value
MULTI
SET user:1:balance (val - 100) -- Queue update
EXEC                           -- Returns NULL if balance changed since WATCH!
-- If another client modified user:1:balance → EXEC fails → retry

-- Limitations:
-- No rollback (unlike SQL)
-- Can't use intermediate results (commands queued, not executed)
-- WATCH only works before MULTI
-- All keys must be on same node in Cluster mode

-- When to use Lua instead:
-- Need intermediate results
-- Complex atomic operations
-- Conditional logic (if/else)

// Java example:
List&lt;Object&gt; results = redis.multi(tx -&gt; {
    tx.decrBy("balance:1", 100);
    tx.incrBy("balance:2", 100);
});
// results is null if WATCH detected conflict</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'When and how to use Lua scripting in Redis?',
        a: `<pre><code>-- Lua scripts execute ATOMICALLY on Redis server
-- Like a stored procedure: no other commands run during script execution

-- Use cases:
-- 1. Conditional operations (compare-and-set)
-- 2. Multiple operations that need atomicity
-- 3. Complex logic that can't be done with MULTI/EXEC

-- Example: Transfer money atomically
local from = KEYS[1]        -- "balance:user1"
local to = KEYS[2]          -- "balance:user2"
local amount = tonumber(ARGV[1])

local balance = tonumber(redis.call('GET', from))
if balance >= amount then
    redis.call('DECRBY', from, amount)
    redis.call('INCRBY', to, amount)
    return 1  -- Success
else
    return 0  -- Insufficient funds
end

-- Load and execute:
-- EVAL script numkeys key1 key2 arg1
-- EVALSHA sha1 numkeys key1 key2 arg1 (cached script)

// Java (with Redisson):
String script = "local bal = tonumber(redis.call('GET', KEYS[1])) " +
                "if bal >= tonumber(ARGV[1]) then " +
                "  redis.call('DECRBY', KEYS[1], ARGV[1]) " +
                "  redis.call('INCRBY', KEYS[2], ARGV[1]) " +
                "  return 1 else return 0 end";
Long result = redis.eval(script, ScriptOutputType.INTEGER,
    new String[]{"balance:user1", "balance:user2"}, "100");

-- Best practices:
-- Keep scripts SHORT (blocks all other commands!)
-- Use KEYS[] for all key access (required for Cluster)
-- Cache scripts with SCRIPT LOAD + EVALSHA (avoid re-parsing)
-- No external calls (network, file) — pure computation only
-- Max execution time: lua-time-limit 5000 (ms, default)

-- Redis Functions (Redis 7.0+): Named, persistent functions (replace EVAL)
FUNCTION LOAD "#!lua name=mylib\nredis.register_function('transfer', function(keys, args) ... end)"
FCALL transfer 2 balance:user1 balance:user2 100</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
];

export default sections;
