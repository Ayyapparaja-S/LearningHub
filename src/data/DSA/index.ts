import type { Section } from '../../types';

const sections: Section[] = [
  {
    title: 'Arrays & Strings',
    questions: [
      {
        q: 'Two Sum: Given array and target, return indices of two numbers adding up to target.',
        a: `<pre><code>// Optimal: HashMap — O(n) time, O(n) space
public int[] twoSum(int[] nums, int target) {
    Map&lt;Integer, Integer&gt; map = new HashMap&lt;&gt;();
    for (int i = 0; i &lt; nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) return new int[]{map.get(complement), i};
        map.put(nums[i], i);
    }
    throw new IllegalArgumentException("No solution");
}
// Variations: Sorted array → two pointers O(1) space
// Three Sum → sort + two pointers for each element</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'Longest substring without repeating characters.',
        a: `<pre><code>// Sliding Window — O(n)
public int lengthOfLongestSubstring(String s) {
    Map&lt;Character, Integer&gt; lastSeen = new HashMap&lt;&gt;();
    int left = 0, maxLen = 0;
    for (int right = 0; right &lt; s.length(); right++) {
        char c = s.charAt(right);
        if (lastSeen.containsKey(c) && lastSeen.get(c) >= left)
            left = lastSeen.get(c) + 1;
        lastSeen.put(c, right);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}
// Pattern: SLIDING WINDOW — contiguous subarray/substring with constraints</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Merge Intervals: Given collection of intervals, merge overlapping ones.',
        a: `<pre><code>// Sort by start → merge overlapping — O(n log n)
public int[][] merge(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -&gt; a[0] - b[0]);
    List&lt;int[]&gt; result = new ArrayList&lt;&gt;();
    result.add(intervals[0]);
    for (int i = 1; i &lt; intervals.length; i++) {
        int[] last = result.get(result.size() - 1);
        if (intervals[i][0] &lt;= last[1]) // Overlapping
            last[1] = Math.max(last[1], intervals[i][1]);
        else
            result.add(intervals[i]);
    }
    return result.toArray(new int[0][]);
}
// Related: Insert Interval, Meeting Rooms, Non-overlapping Intervals</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Product of Array Except Self (no division allowed).',
        a: `<pre><code>// Prefix/suffix products — O(n) time, O(1) extra space
public int[] productExceptSelf(int[] nums) {
    int n = nums.length;
    int[] result = new int[n];
    
    // Left prefix products
    result[0] = 1;
    for (int i = 1; i &lt; n; i++)
        result[i] = result[i-1] * nums[i-1];
    
    // Right suffix products (multiply in place)
    int right = 1;
    for (int i = n - 2; i >= 0; i--) {
        right *= nums[i + 1];
        result[i] *= right;
    }
    return result;
}
// Pattern: PREFIX SUM / PREFIX PRODUCT</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Maximum Subarray (Kadane\'s Algorithm).',
        a: `<pre><code>// Kadane's: Track current max subarray ending at each position — O(n)
public int maxSubArray(int[] nums) {
    int maxSum = nums[0], currentSum = nums[0];
    for (int i = 1; i &lt; nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
}
// Key insight: At each position, either extend previous subarray or start new one
// Variations: Maximum Product Subarray, Circular Subarray</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'Trapping Rain Water.',
        a: `<pre><code>// Two Pointer approach — O(n) time, O(1) space
public int trap(int[] height) {
    int left = 0, right = height.length - 1;
    int leftMax = 0, rightMax = 0, water = 0;
    while (left &lt; right) {
        if (height[left] &lt; height[right]) {
            leftMax = Math.max(leftMax, height[left]);
            water += leftMax - height[left];
            left++;
        } else {
            rightMax = Math.max(rightMax, height[right]);
            water += rightMax - height[right];
            right--;
        }
    }
    return water;
}
// Key insight: Water at position = min(maxLeft, maxRight) - height[i]
// Pattern: TWO POINTERS from both ends</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'Valid Anagram and Group Anagrams.',
        a: `<pre><code>// Valid Anagram — O(n)
public boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;
    int[] count = new int[26];
    for (char c : s.toCharArray()) count[c - 'a']++;
    for (char c : t.toCharArray()) { count[c - 'a']--; if (count[c-'a'] &lt; 0) return false; }
    return true;
}

// Group Anagrams — O(n * k log k) or O(n * k) with frequency key
public List&lt;List&lt;String&gt;&gt; groupAnagrams(String[] strs) {
    Map&lt;String, List&lt;String&gt;&gt; map = new HashMap&lt;&gt;();
    for (String s : strs) {
        char[] chars = s.toCharArray();
        Arrays.sort(chars);
        String key = new String(chars); // Sorted string as key
        map.computeIfAbsent(key, k -&gt; new ArrayList&lt;&gt;()).add(s);
    }
    return new ArrayList&lt;&gt;(map.values());
}
// Pattern: HASHING with canonical form as key</code></pre>`,
        level: 'basic' as const
      },
    ]
  },
  {
    title: 'Linked Lists',
    questions: [
      {
        q: 'Reverse a linked list (iterative and recursive).',
        a: `<pre><code>// Iterative — O(n) time, O(1) space
public ListNode reverseList(ListNode head) {
    ListNode prev = null, curr = head;
    while (curr != null) {
        ListNode next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}

// Recursive — O(n) time, O(n) stack space
public ListNode reverseListRecursive(ListNode head) {
    if (head == null || head.next == null) return head;
    ListNode newHead = reverseListRecursive(head.next);
    head.next.next = head;
    head.next = null;
    return newHead;
}
// Variations: Reverse in groups of K, Reverse between positions m and n</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'Detect cycle in linked list. Find the start of cycle.',
        a: `<pre><code>// Floyd's Cycle Detection (Tortoise and Hare) — O(n), O(1) space
public ListNode detectCycle(ListNode head) {
    ListNode slow = head, fast = head;
    
    // Phase 1: Detect cycle
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) break; // Cycle detected
    }
    if (fast == null || fast.next == null) return null; // No cycle
    
    // Phase 2: Find cycle start
    slow = head;
    while (slow != fast) {
        slow = slow.next;
        fast = fast.next;
    }
    return slow; // Cycle start node
}
// Math: Distance from head to cycle start = distance from meeting point to cycle start</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Merge K sorted linked lists.',
        a: `<pre><code>// Min-Heap approach — O(N log k) where N = total nodes, k = lists
public ListNode mergeKLists(ListNode[] lists) {
    PriorityQueue&lt;ListNode&gt; minHeap = new PriorityQueue&lt;&gt;(
        Comparator.comparingInt(a -&gt; a.val));
    
    for (ListNode head : lists)
        if (head != null) minHeap.offer(head);
    
    ListNode dummy = new ListNode(0), curr = dummy;
    while (!minHeap.isEmpty()) {
        ListNode node = minHeap.poll();
        curr.next = node;
        curr = curr.next;
        if (node.next != null) minHeap.offer(node.next);
    }
    return dummy.next;
}
// Alternative: Divide and conquer (merge pairs) — same complexity
// Pattern: HEAP for "K sorted" problems</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'LRU Cache implementation.',
        a: `<pre><code>// HashMap + Doubly Linked List — O(1) get and put
class LRUCache {
    private final int capacity;
    private final Map&lt;Integer, Node&gt; map = new HashMap&lt;&gt;();
    private final Node head = new Node(0, 0), tail = new Node(0, 0);
    
    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail; tail.prev = head;
    }
    
    public int get(int key) {
        if (!map.containsKey(key)) return -1;
        Node node = map.get(key);
        remove(node);
        addToFront(node);
        return node.value;
    }
    
    public void put(int key, int value) {
        if (map.containsKey(key)) remove(map.get(key));
        Node node = new Node(key, value);
        addToFront(node);
        map.put(key, node);
        if (map.size() > capacity) {
            Node lru = tail.prev; // Least recently used
            remove(lru);
            map.remove(lru.key);
        }
    }
    
    private void remove(Node n) { n.prev.next = n.next; n.next.prev = n.prev; }
    private void addToFront(Node n) { n.next = head.next; n.prev = head; head.next.prev = n; head.next = n; }
}
// Very common interview question! Know the design thoroughly.</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'Trees & Graphs',
    questions: [
      {
        q: 'Binary Tree traversals (inorder, preorder, postorder, level-order).',
        a: `<pre><code>// Inorder (Left → Root → Right) — BST gives sorted order
public List&lt;Integer&gt; inorder(TreeNode root) {
    List&lt;Integer&gt; result = new ArrayList&lt;&gt;();
    Deque&lt;TreeNode&gt; stack = new ArrayDeque&lt;&gt;();
    TreeNode curr = root;
    while (curr != null || !stack.isEmpty()) {
        while (curr != null) { stack.push(curr); curr = curr.left; }
        curr = stack.pop();
        result.add(curr.val);
        curr = curr.right;
    }
    return result;
}

// Level-order (BFS)
public List&lt;List&lt;Integer&gt;&gt; levelOrder(TreeNode root) {
    List&lt;List&lt;Integer&gt;&gt; result = new ArrayList&lt;&gt;();
    if (root == null) return result;
    Queue&lt;TreeNode&gt; queue = new LinkedList&lt;&gt;();
    queue.offer(root);
    while (!queue.isEmpty()) {
        int size = queue.size();
        List&lt;Integer&gt; level = new ArrayList&lt;&gt;();
        for (int i = 0; i &lt; size; i++) {
            TreeNode node = queue.poll();
            level.add(node.val);
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        result.add(level);
    }
    return result;
}</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'Validate Binary Search Tree.',
        a: `<pre><code>// Check if tree satisfies BST property — O(n)
public boolean isValidBST(TreeNode root) {
    return validate(root, Long.MIN_VALUE, Long.MAX_VALUE);
}

private boolean validate(TreeNode node, long min, long max) {
    if (node == null) return true;
    if (node.val &lt;= min || node.val >= max) return false;
    return validate(node.left, min, node.val) &&
           validate(node.right, node.val, max);
}
// Key: Pass allowed range down. Left subtree must be &lt; root, right must be > root.
// Alternative: Inorder traversal should produce sorted sequence.</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Lowest Common Ancestor of a Binary Tree.',
        a: `<pre><code>// Recursive — O(n)
public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    if (root == null || root == p || root == q) return root;
    TreeNode left = lowestCommonAncestor(root.left, p, q);
    TreeNode right = lowestCommonAncestor(root.right, p, q);
    if (left != null && right != null) return root; // Found in both subtrees
    return left != null ? left : right;
}
// For BST: If both &lt; root → go left. Both > root → go right. Split → root is LCA.
// Pattern: POST-ORDER traversal (process children before deciding at root)</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Number of Islands (Grid BFS/DFS).',
        a: `<pre><code>// DFS flood fill — O(m*n)
public int numIslands(char[][] grid) {
    int count = 0;
    for (int i = 0; i &lt; grid.length; i++) {
        for (int j = 0; j &lt; grid[0].length; j++) {
            if (grid[i][j] == '1') {
                dfs(grid, i, j);
                count++;
            }
        }
    }
    return count;
}

private void dfs(char[][] grid, int i, int j) {
    if (i &lt; 0 || i >= grid.length || j &lt; 0 || j >= grid[0].length || grid[i][j] != '1') return;
    grid[i][j] = '0'; // Mark visited
    dfs(grid, i+1, j); dfs(grid, i-1, j); dfs(grid, i, j+1); dfs(grid, i, j-1);
}
// Pattern: GRAPH TRAVERSAL on grid. Variations: Max area, surrounded regions, rotting oranges</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Dijkstra\'s Algorithm for shortest path.',
        a: `<pre><code>// Min-heap based — O((V + E) log V)
public int[] dijkstra(int[][] graph, int src, int n) {
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[src] = 0;
    
    // {distance, node}
    PriorityQueue&lt;int[]&gt; pq = new PriorityQueue&lt;&gt;((a, b) -&gt; a[0] - b[0]);
    pq.offer(new int[]{0, src});
    
    while (!pq.isEmpty()) {
        int[] curr = pq.poll();
        int d = curr[0], u = curr[1];
        if (d > dist[u]) continue; // Skip outdated entries
        
        for (int[] edge : adj.get(u)) { // {neighbor, weight}
            int v = edge[0], w = edge[1];
            if (dist[u] + w &lt; dist[v]) {
                dist[v] = dist[u] + w;
                pq.offer(new int[]{dist[v], v});
            }
        }
    }
    return dist;
}
// Use when: Weighted graph, non-negative weights, single source shortest path
// For negative weights: Bellman-Ford. For all-pairs: Floyd-Warshall.</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'Topological Sort (Course Schedule problem).',
        a: `<pre><code>// Kahn's Algorithm (BFS) — O(V + E)
public int[] topologicalSort(int numCourses, int[][] prerequisites) {
    List&lt;List&lt;Integer&gt;&gt; adj = new ArrayList&lt;&gt;();
    int[] inDegree = new int[numCourses];
    
    for (int i = 0; i &lt; numCourses; i++) adj.add(new ArrayList&lt;&gt;());
    for (int[] pre : prerequisites) {
        adj.get(pre[1]).add(pre[0]);
        inDegree[pre[0]]++;
    }
    
    Queue&lt;Integer&gt; queue = new LinkedList&lt;&gt;();
    for (int i = 0; i &lt; numCourses; i++)
        if (inDegree[i] == 0) queue.offer(i);
    
    int[] order = new int[numCourses];
    int idx = 0;
    while (!queue.isEmpty()) {
        int course = queue.poll();
        order[idx++] = course;
        for (int next : adj.get(course)) {
            if (--inDegree[next] == 0) queue.offer(next);
        }
    }
    return idx == numCourses ? order : new int[0]; // Empty if cycle exists
}
// Use cases: Build systems, task scheduling, dependency resolution</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'Dynamic Programming',
    questions: [
      {
        q: 'Climbing Stairs / Fibonacci — understand DP fundamentals.',
        a: `<pre><code>// Climbing stairs: n steps, can climb 1 or 2 at a time. How many ways?
// dp[i] = dp[i-1] + dp[i-2] (Fibonacci)

// Bottom-up DP — O(n) time, O(1) space
public int climbStairs(int n) {
    if (n &lt;= 2) return n;
    int prev2 = 1, prev1 = 2;
    for (int i = 3; i &lt;= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}

// DP approach:
// 1. Define state: dp[i] = number of ways to reach step i
// 2. Recurrence: dp[i] = dp[i-1] + dp[i-2]
// 3. Base case: dp[0]=1, dp[1]=1
// 4. Optimize space if only depends on previous states</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'Longest Common Subsequence (LCS).',
        a: `<pre><code>// dp[i][j] = LCS of text1[0..i-1] and text2[0..j-1]
public int longestCommonSubsequence(String text1, String text2) {
    int m = text1.length(), n = text2.length();
    int[][] dp = new int[m + 1][n + 1];
    
    for (int i = 1; i &lt;= m; i++) {
        for (int j = 1; j &lt;= n; j++) {
            if (text1.charAt(i-1) == text2.charAt(j-1))
                dp[i][j] = dp[i-1][j-1] + 1;
            else
                dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
        }
    }
    return dp[m][n];
}
// Time: O(m*n), Space: O(m*n) or O(min(m,n)) with optimization
// Related: Edit Distance, Shortest Common Supersequence</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: '0/1 Knapsack Problem.',
        a: `<pre><code>// Given weights and values of n items, maximize value within capacity W
public int knapsack(int[] weights, int[] values, int W) {
    int n = weights.length;
    int[][] dp = new int[n + 1][W + 1];
    
    for (int i = 1; i &lt;= n; i++) {
        for (int w = 0; w &lt;= W; w++) {
            dp[i][w] = dp[i-1][w]; // Don't take item i
            if (weights[i-1] &lt;= w)
                dp[i][w] = Math.max(dp[i][w], dp[i-1][w - weights[i-1]] + values[i-1]);
        }
    }
    return dp[n][W];
}
// Space optimization: 1D array (process right to left)
// Variations: Unbounded knapsack (items reusable), subset sum, coin change
// Pattern: 2D DP — item choice + constraint</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'Coin Change: Minimum coins to make amount.',
        a: `<pre><code>// dp[i] = minimum coins needed to make amount i
public int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1); // "infinity"
    dp[0] = 0;
    
    for (int i = 1; i &lt;= amount; i++) {
        for (int coin : coins) {
            if (coin &lt;= i)
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}
// Time: O(amount * coins), Space: O(amount)
// Variation: Number of WAYS to make amount → dp[i] += dp[i - coin]</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Longest Increasing Subsequence (LIS).',
        a: `<pre><code>// O(n²) DP
public int lengthOfLIS(int[] nums) {
    int[] dp = new int[nums.length];
    Arrays.fill(dp, 1);
    int max = 1;
    for (int i = 1; i &lt; nums.length; i++) {
        for (int j = 0; j &lt; i; j++) {
            if (nums[j] &lt; nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
        }
        max = Math.max(max, dp[i]);
    }
    return max;
}

// O(n log n) with binary search (patience sorting)
public int lengthOfLIS_optimal(int[] nums) {
    List&lt;Integer&gt; tails = new ArrayList&lt;&gt;();
    for (int num : nums) {
        int pos = Collections.binarySearch(tails, num);
        if (pos &lt; 0) pos = -(pos + 1);
        if (pos == tails.size()) tails.add(num);
        else tails.set(pos, num);
    }
    return tails.size();
}
// Pattern: DP optimization with binary search</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'Binary Search & Sorting',
    questions: [
      {
        q: 'Binary Search variants: first/last occurrence, search in rotated array.',
        a: `<pre><code>// First occurrence of target
public int firstOccurrence(int[] arr, int target) {
    int lo = 0, hi = arr.length - 1, result = -1;
    while (lo &lt;= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) { result = mid; hi = mid - 1; } // Keep searching left
        else if (arr[mid] &lt; target) lo = mid + 1;
        else hi = mid - 1;
    }
    return result;
}

// Search in rotated sorted array — O(log n)
public int search(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1;
    while (lo &lt;= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[lo] &lt;= nums[mid]) { // Left half sorted
            if (target >= nums[lo] && target &lt; nums[mid]) hi = mid - 1;
            else lo = mid + 1;
        } else { // Right half sorted
            if (target > nums[mid] && target &lt;= nums[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return -1;
}
// Pattern: Modified binary search — identify which half is sorted</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Find Kth largest element in array.',
        a: `<pre><code>// Option 1: Min-Heap of size K — O(n log k)
public int findKthLargest(int[] nums, int k) {
    PriorityQueue&lt;Integer&gt; minHeap = new PriorityQueue&lt;&gt;();
    for (int num : nums) {
        minHeap.offer(num);
        if (minHeap.size() > k) minHeap.poll();
    }
    return minHeap.peek();
}

// Option 2: QuickSelect — O(n) average, O(n²) worst
public int quickSelect(int[] nums, int k) {
    int target = nums.length - k; // kth largest = (n-k)th smallest
    return select(nums, 0, nums.length - 1, target);
}
private int select(int[] nums, int lo, int hi, int k) {
    int pivot = partition(nums, lo, hi);
    if (pivot == k) return nums[pivot];
    if (pivot &lt; k) return select(nums, pivot + 1, hi, k);
    return select(nums, lo, pivot - 1, k);
}
// Pattern: HEAP for top-K problems. QuickSelect for single Kth element.</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'Stack & Queue',
    questions: [
      {
        q: 'Valid Parentheses and related bracket problems.',
        a: `<pre><code>// Valid Parentheses — O(n)
public boolean isValid(String s) {
    Deque&lt;Character&gt; stack = new ArrayDeque&lt;&gt;();
    for (char c : s.toCharArray()) {
        if (c == '(' || c == '[' || c == '{') stack.push(c);
        else {
            if (stack.isEmpty()) return false;
            char top = stack.pop();
            if (c == ')' && top != '(') return false;
            if (c == ']' && top != '[') return false;
            if (c == '}' && top != '{') return false;
        }
    }
    return stack.isEmpty();
}
// Variations: Minimum insertions to balance, longest valid parentheses (DP)
// Pattern: STACK for matching/nesting problems</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'Next Greater Element (Monotonic Stack).',
        a: `<pre><code>// For each element, find next element that is greater — O(n)
public int[] nextGreaterElement(int[] nums) {
    int n = nums.length;
    int[] result = new int[n];
    Arrays.fill(result, -1);
    Deque&lt;Integer&gt; stack = new ArrayDeque&lt;&gt;(); // Stores indices
    
    for (int i = 0; i &lt; n; i++) {
        while (!stack.isEmpty() && nums[stack.peek()] &lt; nums[i]) {
            result[stack.pop()] = nums[i];
        }
        stack.push(i);
    }
    return result;
}
// Pattern: MONOTONIC STACK — maintain decreasing order
// Use cases: Next greater/smaller element, largest rectangle in histogram
// Daily temperatures, stock span problem</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'Backtracking & Recursion',
    questions: [
      {
        q: 'Generate all permutations and combinations.',
        a: `<pre><code>// Permutations — O(n!)
public List&lt;List&lt;Integer&gt;&gt; permute(int[] nums) {
    List&lt;List&lt;Integer&gt;&gt; result = new ArrayList&lt;&gt;();
    backtrack(nums, new ArrayList&lt;&gt;(), new boolean[nums.length], result);
    return result;
}
private void backtrack(int[] nums, List&lt;Integer&gt; path, boolean[] used, List&lt;List&lt;Integer&gt;&gt; result) {
    if (path.size() == nums.length) { result.add(new ArrayList&lt;&gt;(path)); return; }
    for (int i = 0; i &lt; nums.length; i++) {
        if (used[i]) continue;
        used[i] = true;
        path.add(nums[i]);
        backtrack(nums, path, used, result);
        path.remove(path.size() - 1);
        used[i] = false;
    }
}

// Combinations (choose k from n) — O(C(n,k))
private void combine(int start, int n, int k, List&lt;Integer&gt; path, List&lt;List&lt;Integer&gt;&gt; result) {
    if (path.size() == k) { result.add(new ArrayList&lt;&gt;(path)); return; }
    for (int i = start; i &lt;= n - (k - path.size()) + 1; i++) { // Pruning!
        path.add(i);
        combine(i + 1, n, k, path, result);
        path.remove(path.size() - 1);
    }
}
// Pattern: BACKTRACKING — choose, explore, unchoose</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Word Search in a grid.',
        a: `<pre><code>// DFS backtracking — O(m * n * 4^L) where L = word length
public boolean exist(char[][] board, String word) {
    for (int i = 0; i &lt; board.length; i++)
        for (int j = 0; j &lt; board[0].length; j++)
            if (dfs(board, word, i, j, 0)) return true;
    return false;
}

private boolean dfs(char[][] board, String word, int i, int j, int idx) {
    if (idx == word.length()) return true;
    if (i &lt; 0 || i >= board.length || j &lt; 0 || j >= board[0].length) return false;
    if (board[i][j] != word.charAt(idx)) return false;
    
    char temp = board[i][j];
    board[i][j] = '#'; // Mark visited (backtracking trick)
    
    boolean found = dfs(board, word, i+1, j, idx+1) || dfs(board, word, i-1, j, idx+1)
                 || dfs(board, word, i, j+1, idx+1) || dfs(board, word, i, j-1, idx+1);
    
    board[i][j] = temp; // Restore (backtrack)
    return found;
}
// Pattern: GRID DFS with backtracking (restore state after exploring)</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'System Design Patterns in DSA',
    questions: [
      {
        q: 'Design a rate limiter using Token Bucket / Sliding Window.',
        a: `<pre><code>// Sliding Window Counter — O(1)
class RateLimiter {
    private final int maxRequests;
    private final long windowMs;
    private final Map&lt;String, Deque&lt;Long&gt;&gt; requestLog = new ConcurrentHashMap&lt;&gt;();
    
    public boolean allowRequest(String clientId) {
        long now = System.currentTimeMillis();
        Deque&lt;Long&gt; timestamps = requestLog.computeIfAbsent(clientId, k -&gt; new LinkedList&lt;&gt;());
        
        synchronized (timestamps) {
            // Remove expired timestamps
            while (!timestamps.isEmpty() && now - timestamps.peekFirst() > windowMs)
                timestamps.pollFirst();
            
            if (timestamps.size() &lt; maxRequests) {
                timestamps.addLast(now);
                return true; // Allowed
            }
            return false; // Rate limited
        }
    }
}

// Token Bucket (smoother, allows bursts):
class TokenBucket {
    private final int capacity;
    private final double refillRate; // tokens per ms
    private double tokens;
    private long lastRefill;
    
    public synchronized boolean consume() {
        refill();
        if (tokens >= 1) { tokens--; return true; }
        return false;
    }
    private void refill() {
        long now = System.currentTimeMillis();
        tokens = Math.min(capacity, tokens + (now - lastRefill) * refillRate);
        lastRefill = now;
    }
}
// Real-world: Redis + Lua script for distributed rate limiting</code></pre>`,
        level: 'advanced' as const
      },
      {
        q: 'Implement a Trie (Prefix Tree) for autocomplete.',
        a: `<pre><code>class Trie {
    private final TrieNode root = new TrieNode();
    
    public void insert(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            node = node.children.computeIfAbsent(c, k -&gt; new TrieNode());
        }
        node.isEnd = true;
    }
    
    public boolean search(String word) {
        TrieNode node = findNode(word);
        return node != null && node.isEnd;
    }
    
    public boolean startsWith(String prefix) {
        return findNode(prefix) != null;
    }
    
    public List&lt;String&gt; autocomplete(String prefix, int limit) {
        List&lt;String&gt; results = new ArrayList&lt;&gt;();
        TrieNode node = findNode(prefix);
        if (node != null) dfs(node, new StringBuilder(prefix), results, limit);
        return results;
    }
    
    private void dfs(TrieNode node, StringBuilder sb, List&lt;String&gt; results, int limit) {
        if (results.size() >= limit) return;
        if (node.isEnd) results.add(sb.toString());
        for (Map.Entry&lt;Character, TrieNode&gt; entry : node.children.entrySet()) {
            sb.append(entry.getKey());
            dfs(entry.getValue(), sb, results, limit);
            sb.deleteCharAt(sb.length() - 1);
        }
    }
    
    private TrieNode findNode(String s) {
        TrieNode node = root;
        for (char c : s.toCharArray()) {
            node = node.children.get(c);
            if (node == null) return null;
        }
        return node;
    }
}
// Use cases: Autocomplete, spell check, IP routing, word games</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
];

export default sections;
