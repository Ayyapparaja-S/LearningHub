import type { Section } from '../../types';

const sections: Section[] = [
  {
    title: 'Architecture & Fundamentals',
    questions: [
      {
        q: 'Explain Kafka architecture. What are brokers, topics, partitions, and consumer groups?',
        a: `<pre><code>┌────────────────────────────────────────────┐
│              Kafka Cluster                   │
│  ┌────────┐  ┌────────┐  ┌────────┐       │
│  │Broker 1│  │Broker 2│  │Broker 3│       │
│  └────────┘  └────────┘  └────────┘       │
└────────────────────────────────────────────┘

Topic: "order-events" (6 partitions, RF=3)
├── Partition 0: [msg0][msg1][msg2]...  → Leader: Broker 1
├── Partition 1: [msg0][msg1]...        → Leader: Broker 2
└── Partition 2: [msg0]...              → Leader: Broker 3</code></pre>
<ul>
<li><strong>Broker:</strong> Kafka server instance. Cluster = multiple brokers.</li>
<li><strong>Topic:</strong> Logical channel for messages (like a DB table).</li>
<li><strong>Partition:</strong> Ordered, immutable log. Unit of parallelism.</li>
<li><strong>Offset:</strong> Position of message within partition.</li>
<li><strong>Consumer Group:</strong> Consumers sharing work. Each partition → 1 consumer per group.</li>
<li><strong>Replication:</strong> Each partition replicated. ISR = In-Sync Replicas.</li>
</ul>`,
        level: 'basic' as const
      },
      {
        q: 'How does Kafka guarantee message ordering?',
        a: `<p><strong>Ordering:</strong> Messages within a single partition are strictly ordered. Across partitions, NO ordering guarantee.</p>
<pre><code>// Ensure related messages go to same partition using a key
kafkaTemplate.send("order-events", order.getOrderId(), event);
// hash(orderId) % numPartitions → always same partition

// Global ordering: 1 partition (kills parallelism — only for low-throughput)

// Ordering can break when:
// - Producer retries without idempotence (max.in.flight > 1)
// - Consumer processes with multiple threads per partition
// - Non-blocking retries reorder messages

// Fix: Enable idempotent producer
enable.idempotence=true
max.in.flight.requests.per.connection=5  // Safe with idempotence
acks=all</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'What happens when a Kafka broker goes down? Explain leader election.',
        a: `<pre><code>// Each partition has ONE leader and multiple followers (replicas)
// All reads/writes go through the leader

// When leader broker dies:
// 1. Controller (a special broker) detects via ZooKeeper/KRaft
// 2. Controller selects new leader from ISR (In-Sync Replicas)
// 3. ISR = replicas that are fully caught up with leader
// 4. New leader starts serving requests
// 5. Producers/consumers get metadata refresh → connect to new leader

// ISR shrinks when follower falls behind:
replica.lag.time.max.ms=30000  // Max lag before removed from ISR

// Unclean leader election (data loss risk!):
unclean.leader.election.enable=false  // Default. Only ISR members become leader.
// If true: Out-of-sync replica can become leader → LOST MESSAGES

// KRaft mode (Kafka 3.3+): No ZooKeeper dependency
// Controller quorum (Raft consensus) manages metadata
// Faster failover, simpler operations

// min.insync.replicas (protection against data loss):
min.insync.replicas=2  // At least 2 replicas must acknowledge
acks=all               // Producer waits for ALL ISR to acknowledge
// Result: Survives 1 broker failure without data loss</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'How does Kafka differ from traditional message queues (RabbitMQ, ActiveMQ)?',
        a: `<pre><code>// KAFKA:
// - Distributed log (append-only, immutable)
// - Messages retained for configured time (even after consumption)
// - Consumer controls offset (can re-read messages)
// - Designed for high throughput (millions msg/sec)
// - Pull-based consumption
// - No per-message acknowledgment (offset-based)

// RABBITMQ:
// - Traditional message broker (queue-based)
// - Messages deleted after acknowledgment
// - Push-based delivery
// - Rich routing (exchanges, bindings)
// - Per-message acknowledgment
// - Lower throughput, lower latency per message

// When to use Kafka:
// - Event streaming, event sourcing
// - High throughput (logs, metrics, IoT)
// - Multiple consumers need same data (replay)
// - Data pipeline (ETL, CDC)
// - Long retention needed

// When to use RabbitMQ:
// - Task queues (worker pattern)
// - Complex routing (topic, header-based)
// - Low-latency point-to-point
// - Need per-message acknowledgment
// - Smaller scale, simpler operations

// Key differences:
// | Feature        | Kafka              | RabbitMQ          |
// | Model          | Log (append)       | Queue (consume)   |
// | Delivery       | Pull               | Push              |
// | Retention      | Time-based         | Until consumed    |
// | Ordering       | Per-partition      | Per-queue         |
// | Throughput     | Very high          | Moderate          |
// | Replay         | Yes (offset reset) | No (consumed=gone)|</code></pre>`,
        level: 'basic' as const
      },
    ]
  },
  {
    title: 'Producers',
    questions: [
      {
        q: 'How does the Kafka producer work internally? Explain batching and compression.',
        a: `<pre><code>// Producer internal flow:
// 1. serialize(key, value) → bytes
// 2. partition(key) → determine target partition
// 3. Add to RecordAccumulator (batch per partition)
// 4. Sender thread sends batches to broker
// 5. Broker responds with offset (or error)

// Key configurations:
batch.size=16384              // 16KB per batch (accumulate before send)
linger.ms=5                   // Wait up to 5ms to fill batch
buffer.memory=33554432        // 32MB total buffer
compression.type=lz4          // Compress batches (lz4, snappy, zstd, gzip)

// Compression comparison:
// | Type   | Speed    | Ratio  | CPU   | Use Case              |
// | lz4    | Fastest  | Good   | Low   | Default choice        |
// | snappy | Fast     | Good   | Low   | General purpose       |
// | zstd   | Medium   | Best   | Med   | Storage optimization  |
// | gzip   | Slow     | Great  | High  | Max compression       |

// Acks (durability guarantee):
acks=0    // Fire and forget (fastest, data loss possible)
acks=1    // Leader acknowledges (default, loss if leader dies before replication)
acks=all  // All ISR replicate (safest, slower)

// Idempotent producer (exactly-once for single partition):
enable.idempotence=true  // Assigns PID + sequence number
// Broker deduplicates based on PID+sequence → no duplicates on retry</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How to handle producer failures and retries?',
        a: `<pre><code>// Default behavior: Retries on transient errors (network timeout, leader not available)
retries=Integer.MAX_VALUE     // Retry indefinitely (bounded by delivery.timeout.ms)
delivery.timeout.ms=120000    // Max time from send() to ack (2 minutes)
retry.backoff.ms=100          // Wait between retries

// Idempotent producer prevents duplicates on retry:
enable.idempotence=true
max.in.flight.requests.per.connection=5  // Safe with idempotence

// Transactional producer (exactly-once across partitions):
@Configuration
public class KafkaProducerConfig {
    @Bean
    public ProducerFactory&lt;String, String&gt; producerFactory() {
        Map&lt;String, Object&gt; config = new HashMap&lt;&gt;();
        config.put(ProducerConfig.TRANSACTIONAL_ID_CONFIG, "order-tx-");
        config.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        return new DefaultKafkaProducerFactory&lt;&gt;(config);
    }
}

// Usage: Atomic write to multiple partitions/topics
kafkaTemplate.executeInTransaction(ops -&gt; {
    ops.send("orders", orderEvent);
    ops.send("notifications", notifEvent);
    ops.send("audit-log", auditEvent);
    return null;
}); // All succeed or all fail

// Error handling:
kafkaTemplate.send("topic", key, value).whenComplete((result, ex) -&gt; {
    if (ex != null) {
        log.error("Send failed: {}", ex.getMessage());
        deadLetterQueue.send(value); // Fallback
    } else {
        log.info("Sent to partition {} offset {}", 
            result.getRecordMetadata().partition(),
            result.getRecordMetadata().offset());
    }
});</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'How do you choose a partitioning strategy?',
        a: `<pre><code>// Default partitioner (Kafka 3.x): Sticky partitioner
// - With key: hash(key) % numPartitions (consistent partition for same key)
// - Without key: Sticky to one partition until batch full (better batching)

// Custom partitioner:
public class OrderPartitioner implements Partitioner {
    @Override
    public int partition(String topic, Object key, byte[] keyBytes,
                         Object value, byte[] valueBytes, Cluster cluster) {
        int numPartitions = cluster.partitionCountForTopic(topic);
        if (key == null) return ThreadLocalRandom.current().nextInt(numPartitions);
        
        // VIP customers to dedicated partition(s) for priority processing
        OrderEvent event = (OrderEvent) value;
        if (event.isVip()) return 0; // Partition 0 for VIP
        return Math.abs(key.hashCode() % (numPartitions - 1)) + 1;
    }
}

// Partitioning strategies:
// 1. Key-based (default): Related events in same partition
//    Key = orderId → all events for same order in same partition
//    Key = userId → all user events together

// 2. Round-robin: Even distribution, no ordering guarantee
//    Good for: stateless processing, max throughput

// 3. Custom: Business logic
//    Priority lanes, geographic partitioning, time-based

// Partition count considerations:
// More partitions → more parallelism → more consumers possible
// But: more memory, more file handles, longer leader election
// Rule of thumb: Start with partitions = target throughput / single-consumer throughput
// Good default: 6-12 partitions per topic for most use cases</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'Consumers',
    questions: [
      {
        q: 'How does consumer group rebalancing work? What triggers it?',
        a: `<pre><code>// Consumer Group: Partitions distributed among consumers
// Each partition → exactly 1 consumer in the group
// If consumers > partitions → some consumers idle

// Rebalancing triggers:
// 1. New consumer joins group
// 2. Consumer leaves (crash or graceful shutdown)
// 3. Consumer fails heartbeat (session.timeout.ms exceeded)
// 4. Topic partitions change (new partitions added)
// 5. Subscription changes

// During rebalance: ALL consumers STOP processing (stop-the-world!)
// This can cause latency spikes and duplicate processing

// Cooperative rebalancing (Kafka 2.4+): Incremental, less disruptive
partition.assignment.strategy=org.apache.kafka.clients.consumer.CooperativeStickyAssignor
// Only affected partitions move (others continue processing)

// Key consumer configs:
session.timeout.ms=45000      // Max time without heartbeat before considered dead
heartbeat.interval.ms=3000    // How often to send heartbeat (< session.timeout / 3)
max.poll.interval.ms=300000   // Max time between poll() calls before considered stuck
max.poll.records=500          // Max records per poll()

// Static group membership (reduce rebalances):
group.instance.id=consumer-1  // Unique per consumer
// Rejoining with same ID → no rebalance (partition assignment remembered)</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'How to handle consumer failures and ensure exactly-once processing?',
        a: `<pre><code>// Delivery semantics:
// At-most-once: Commit offset BEFORE processing (may lose messages)
// At-least-once: Commit offset AFTER processing (may duplicate) — DEFAULT
// Exactly-once: Transactional processing (hardest)

// AT-LEAST-ONCE (default, most common):
@KafkaListener(topics = "orders")
public void process(ConsumerRecord&lt;String, OrderEvent&gt; record) {
    orderService.process(record.value()); // Process first
    // Auto-commit after listener returns (or manual commit)
}
// If crash after process but before commit → message redelivered → DUPLICATE

// Make consumer idempotent (handle duplicates):
@Transactional
public void process(OrderEvent event) {
    // Check if already processed (idempotency key)
    if (processedRepo.existsByEventId(event.getEventId())) {
        log.info("Duplicate event, skipping: {}", event.getEventId());
        return;
    }
    // Process...
    processedRepo.save(new ProcessedEvent(event.getEventId()));
}

// EXACTLY-ONCE (consume + produce atomically):
// Kafka Streams: Automatically handles with processing.guarantee=exactly_once_v2
// Manual: Read from input topic → process → write to output topic (transactional)

// Dead Letter Topic (DLT) for poison messages:
@KafkaListener(topics = "orders")
@RetryableTopic(
    backoff = @Backoff(delay = 1000, multiplier = 2, maxDelay = 30000),
    attempts = "3",
    dltTopicSuffix = "-dlt"
)
public void process(OrderEvent event) {
    orderService.process(event); // Retries 3 times, then sends to orders-dlt
}

@DltHandler
public void handleDlt(OrderEvent event) {
    log.error("Failed after retries, DLT: {}", event);
    alertService.notify("Order processing failed: " + event.getOrderId());
}</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'What is consumer lag? How to monitor and fix it?',
        a: `<pre><code>// Consumer lag = last produced offset - last committed offset
// High lag → consumers can't keep up with producers

// Monitoring:
// 1. kafka-consumer-groups.sh --describe --group my-group
//    TOPIC     PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
//    orders    0          1000            1500            500
//    orders    1          2000            2100            100

// 2. Metrics (JMX / Micrometer):
kafka.consumer.records-lag-max  // Across all partitions
kafka.consumer.records-lag      // Per partition

// 3. Burrow (LinkedIn) / Kafka UI for visual monitoring

// Causes of high lag:
// - Processing too slow (DB calls, external APIs)
// - Too few consumers (less than partitions)
// - Consumer stuck (long GC pauses, deadlock)
// - Burst of traffic (spike in production)

// Fixes:
// 1. Scale consumers (up to partition count)
// 2. Increase max.poll.records + batch process
// 3. Optimize processing (async I/O, batch DB writes)
// 4. Add partitions (requires rebalance)
// 5. Compress messages (reduce network I/O)
// 6. Multi-threaded consumer (process records in parallel)

// Multi-threaded processing:
@KafkaListener(topics = "orders", concurrency = "3") // 3 consumer threads
public void process(OrderEvent event) { ... }

// Or: Single consumer + executor for parallel processing
// (careful: offset management becomes complex)</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How to reset consumer offsets? When would you need to?',
        a: `<pre><code>// Scenarios requiring offset reset:
// 1. Deploy new consumer logic, need to reprocess all events
// 2. Bug in consumer caused incorrect processing
// 3. New consumer group needs to read from beginning

// auto.offset.reset (when no committed offset exists):
auto.offset.reset=earliest  // Read from beginning
auto.offset.reset=latest    // Read only new messages (default)
auto.offset.reset=none      // Throw exception if no offset

// Manual offset reset (CLI):
kafka-consumer-groups.sh --group my-group --topic orders \\
    --reset-offsets --to-earliest --execute

// Reset options:
--to-earliest           // Beginning
--to-latest             // End  
--to-offset 1000       // Specific offset
--to-datetime "2024-01-15T10:00:00.000"  // Timestamp
--shift-by -100         // Relative shift

// Programmatic reset (Spring Kafka):
@KafkaListener(topics = "orders", groupId = "reprocess-group",
    properties = "auto.offset.reset=earliest")
public void reprocess(OrderEvent event) { ... }

// Seek to specific offset:
@Component
public class SeekToBeginning implements ConsumerSeekAware {
    @Override
    public void onPartitionsAssigned(Map&lt;TopicPartition, Long&gt; assignments, 
                                     ConsumerSeekCallback callback) {
        callback.seekToBeginning(assignments.keySet());
    }
}

// Time-based seek (reprocess last 24 hours):
consumer.offsetsForTimes(Map.of(tp, yesterday.toEpochMilli()));</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'Spring Kafka Integration',
    questions: [
      {
        q: 'How to configure Kafka producer and consumer in Spring Boot?',
        a: `<pre><code># application.yml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      retries: 3
      properties:
        enable.idempotence: true
    consumer:
      group-id: order-service
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.trusted.packages: "com.myapp.events"
    listener:
      ack-mode: record  # Commit after each record
      concurrency: 3    # 3 consumer threads

// Producer:
@Service
public class OrderEventProducer {
    @Autowired private KafkaTemplate&lt;String, OrderEvent&gt; kafkaTemplate;
    
    public void publish(OrderEvent event) {
        kafkaTemplate.send("order-events", event.getOrderId(), event)
            .whenComplete((result, ex) -&gt; {
                if (ex != null) log.error("Failed to publish", ex);
                else log.info("Published to offset {}", result.getRecordMetadata().offset());
            });
    }
}

// Consumer:
@Component
public class OrderEventConsumer {
    @KafkaListener(topics = "order-events", groupId = "payment-service")
    public void handle(@Payload OrderEvent event,
                       @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
                       @Header(KafkaHeaders.OFFSET) long offset) {
        log.info("Received: {} from partition {} offset {}", event, partition, offset);
        paymentService.processOrder(event);
    }
}</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'How to implement the Outbox pattern with Kafka?',
        a: `<pre><code>// Problem: Dual-write inconsistency
// If you save to DB then publish to Kafka:
// DB succeeds, Kafka fails → inconsistent state
// Kafka succeeds, DB fails → message published for non-existent data

// OUTBOX PATTERN: Write event to DB table (same transaction), then relay to Kafka

// 1. Save entity + outbox event in same transaction:
@Transactional
public Order createOrder(OrderRequest req) {
    Order order = orderRepo.save(new Order(req));
    outboxRepo.save(new OutboxEvent(
        UUID.randomUUID(),
        "OrderCreated",
        "order-events",
        order.getId(),  // Partition key
        objectMapper.writeValueAsString(new OrderCreatedEvent(order))
    ));
    return order; // Both in same DB transaction → atomic!
}

// 2. Relay outbox events to Kafka (polling or CDC):
// Option A: Scheduled polling
@Scheduled(fixedDelay = 1000)
@Transactional
public void publishOutboxEvents() {
    List&lt;OutboxEvent&gt; events = outboxRepo.findUnpublished(100);
    for (OutboxEvent event : events) {
        kafkaTemplate.send(event.getTopic(), event.getKey(), event.getPayload());
        event.markPublished();
    }
}

// Option B: Change Data Capture (Debezium — preferred):
// Debezium watches outbox table → publishes changes to Kafka
// No polling, near real-time, exactly-once delivery

// Outbox table schema:
// | id (PK) | event_type | topic | key | payload | created_at | published |

// Benefits:
// - No distributed transaction needed
// - Guaranteed delivery (event in DB = will be published)
// - Natural ordering (DB sequence)
// - Audit trail (outbox table is log)</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'How to handle schema evolution with Avro and Schema Registry?',
        a: `<pre><code>// Problem: Producer changes message format → consumer breaks
// Solution: Schema Registry enforces compatibility

// Schema Registry: Stores and versions Avro/Protobuf/JSON schemas
// Producers register schema → get schema ID → embed in message
// Consumers read schema ID → fetch schema → deserialize

// Avro schema (order-event.avsc):
{
  "type": "record",
  "name": "OrderEvent",
  "namespace": "com.myapp.events",
  "fields": [
    {"name": "orderId", "type": "string"},
    {"name": "status", "type": "string"},
    {"name": "amount", "type": "double"},
    {"name": "customerId", "type": ["null", "string"], "default": null}  // New optional field
  ]
}

// Compatibility modes:
// BACKWARD: New schema can read old data (add optional fields, remove fields)
// FORWARD: Old schema can read new data (add fields with defaults, remove optional)
// FULL: Both backward and forward compatible
// NONE: No compatibility check

// Spring Kafka + Schema Registry:
spring:
  kafka:
    producer:
      value-serializer: io.confluent.kafka.serializers.KafkaAvroSerializer
    consumer:
      value-deserializer: io.confluent.kafka.serializers.KafkaAvroDeserializer
    properties:
      schema.registry.url: http://schema-registry:8081
      specific.avro.reader: true

// Evolution rules (BACKWARD compatible):
// ✅ Add field with default value
// ✅ Remove field that had default
// ✅ Change field from required to optional
// ❌ Remove required field (breaks old consumers)
// ❌ Change field type (string → int)
// ❌ Rename field</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'Performance & Operations',
    questions: [
      {
        q: 'How to optimize Kafka for high throughput?',
        a: `<pre><code>// PRODUCER optimizations:
batch.size=65536              // 64KB batches (larger = fewer requests)
linger.ms=10                  // Wait 10ms to fill batches
compression.type=lz4          // Compress batches
buffer.memory=67108864        // 64MB buffer
max.in.flight.requests.per.connection=5  // Pipeline requests

// BROKER optimizations:
num.io.threads=8              // I/O threads (usually = number of disks)
num.network.threads=3         // Network threads
log.flush.interval.messages=10000  // Batch disk writes
socket.send.buffer.bytes=102400
socket.receive.buffer.bytes=102400

// CONSUMER optimizations:
fetch.min.bytes=1048576       // 1MB min fetch (reduce requests)
fetch.max.wait.ms=500         // Wait for min.bytes
max.poll.records=1000         // More records per poll
max.partition.fetch.bytes=1048576

// Topic-level:
// More partitions = more parallelism (but more overhead)
// Larger segments = fewer files to manage

// Hardware:
// Kafka is I/O bound → SSDs or many HDDs (JBOD)
// Page cache: More RAM → more data served from OS cache
// Network: 10Gbps recommended for high-throughput clusters

// Throughput benchmarks:
// Single broker: 100K-500K messages/sec (depending on message size)
// Cluster (10 brokers): Millions msg/sec easily
// Key: Message size matters! 1KB vs 1MB → 100x difference</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'How to handle topic compaction? Use cases for compacted topics.',
        a: `<pre><code>// Log compaction: Keep only the LATEST value per key
// Regular retention: Delete by time (retention.ms)
// Compaction: Delete old values, keep latest per key (like a changelog)

// Topic configuration:
cleanup.policy=compact        // Enable compaction
min.cleanable.dirty.ratio=0.5 // Compact when 50% records are "dirty"
delete.retention.ms=86400000  // Keep tombstones for 24h

// How it works:
// Before compaction:  key=A:v1, key=B:v1, key=A:v2, key=B:v2, key=A:v3
// After compaction:   key=B:v2, key=A:v3 (only latest per key retained)

// Delete a key: Send message with key=X, value=null (tombstone)
kafkaTemplate.send("user-profiles", userId, null); // Delete user profile

// Use cases:
// 1. Current state store (user profiles, product catalog)
//    Each message = latest state of entity
//    New consumer reads compacted topic → full current state

// 2. CDC (Change Data Capture) streams
//    Database table changes as Kafka events

// 3. KTable in Kafka Streams
//    Compacted topic backing a table abstraction

// 4. Configuration distribution
//    Key=config-name, Value=config-value
//    Services read compacted topic on startup → all current config

// Example: User profile topic
// key="user-123", value={"name":"John","email":"john@ex.com"}
// Update: key="user-123", value={"name":"John","email":"john@new.com"}
// After compaction: only latest version exists</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'What is Kafka Streams? How does it differ from Kafka Consumer API?',
        a: `<pre><code>// Kafka Streams: Library for stream processing (no separate cluster needed!)
// Runs inside your Java application (no Spark/Flink required)

// Consumer API: Low-level, manual processing, stateless
// Kafka Streams: High-level DSL, stateful processing, windowing, joins

// Simple stream processing:
StreamsBuilder builder = new StreamsBuilder();
KStream&lt;String, OrderEvent&gt; orders = builder.stream("order-events");

// Filter + Transform + Write to another topic
orders
    .filter((key, event) -&gt; event.getTotal().compareTo(BigDecimal.valueOf(100)) &gt; 0)
    .mapValues(event -&gt; new HighValueAlert(event.getOrderId(), event.getTotal()))
    .to("high-value-orders");

// Aggregation (stateful):
KTable&lt;String, Long&gt; ordersByCustomer = orders
    .groupBy((key, event) -&gt; event.getCustomerId())
    .count(Materialized.as("orders-per-customer"));

// Windowed aggregation:
KTable&lt;Windowed&lt;String&gt;, Long&gt; ordersPerMinute = orders
    .groupByKey()
    .windowedBy(TimeWindows.ofSizeWithNoGrace(Duration.ofMinutes(1)))
    .count();

// Stream-Table join (enrich events):
KStream&lt;String, EnrichedOrder&gt; enriched = orders.join(
    customerTable,
    (order, customer) -&gt; new EnrichedOrder(order, customer)
);

// Key features:
// - Exactly-once processing (processing.guarantee=exactly_once_v2)
// - State stores (RocksDB backed, queryable)
// - Fault-tolerant (state backed up to changelog topics)
// - Scalable (add instances, partitions redistributed)</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
];

export default sections;
