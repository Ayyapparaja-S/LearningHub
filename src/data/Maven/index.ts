import type { Section } from '../../types';

const sections: Section[] = [
  {
    title: 'Project Structure & Lifecycle',
    questions: [
      {
        q: 'Explain the Maven project structure and POM file.',
        a: `<pre><code>&lt;!-- Standard Maven project layout: --&gt;
my-project/
├── pom.xml                    &lt;!-- Project Object Model (config) --&gt;
├── src/
│   ├── main/
│   │   ├── java/             &lt;!-- Source code --&gt;
│   │   ├── resources/        &lt;!-- Config files (application.yml, etc.) --&gt;
│   │   └── webapp/           &lt;!-- Web resources (for WAR) --&gt;
│   └── test/
│       ├── java/             &lt;!-- Test source code --&gt;
│       └── resources/        &lt;!-- Test config files --&gt;
└── target/                    &lt;!-- Build output (generated) --&gt;

&lt;!-- Minimal POM: --&gt;
&lt;project&gt;
    &lt;modelVersion&gt;4.0.0&lt;/modelVersion&gt;
    &lt;groupId&gt;com.mycompany&lt;/groupId&gt;     &lt;!-- Organization --&gt;
    &lt;artifactId&gt;my-app&lt;/artifactId&gt;      &lt;!-- Project name --&gt;
    &lt;version&gt;1.0.0-SNAPSHOT&lt;/version&gt;    &lt;!-- Version --&gt;
    &lt;packaging&gt;jar&lt;/packaging&gt;           &lt;!-- jar, war, pom, ear --&gt;
    
    &lt;properties&gt;
        &lt;java.version&gt;17&lt;/java.version&gt;
        &lt;maven.compiler.source&gt;17&lt;/maven.compiler.source&gt;
        &lt;maven.compiler.target&gt;17&lt;/maven.compiler.target&gt;
    &lt;/properties&gt;
    
    &lt;dependencies&gt;
        &lt;dependency&gt;
            &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
            &lt;artifactId&gt;spring-boot-starter-web&lt;/artifactId&gt;
            &lt;version&gt;3.2.0&lt;/version&gt;
        &lt;/dependency&gt;
    &lt;/dependencies&gt;
&lt;/project&gt;

&lt;!-- GAV coordinates: groupId:artifactId:version uniquely identifies artifact --&gt;
&lt;!-- SNAPSHOT vs RELEASE: --&gt;
&lt;!-- 1.0.0-SNAPSHOT: Under development (can change, re-downloaded) --&gt;
&lt;!-- 1.0.0: Released (immutable, never changes) --&gt;</code></pre>`,
        level: 'basic' as const
      },
      {
        q: 'Explain Maven build lifecycle and phases.',
        a: `<pre><code>&lt;!-- Maven has 3 built-in lifecycles: --&gt;
&lt;!-- 1. default: Build and deploy (most used) --&gt;
&lt;!-- 2. clean: Remove build artifacts --&gt;
&lt;!-- 3. site: Generate project documentation --&gt;

&lt;!-- DEFAULT lifecycle phases (in order): --&gt;
validate    → Check project structure, POM validity
compile     → Compile source code (src/main/java → target/classes)
test        → Run unit tests (src/test/java)
package     → Create JAR/WAR (target/my-app-1.0.0.jar)
verify      → Run integration tests and checks
install     → Install to local repo (~/.m2/repository)
deploy      → Upload to remote repository (Nexus, Artifactory)

&lt;!-- Running a phase executes ALL phases before it: --&gt;
mvn package   → runs: validate → compile → test → package
mvn install   → runs: validate → compile → test → package → verify → install

&lt;!-- Common commands: --&gt;
mvn clean                    # Delete target/ directory
mvn clean install            # Clean + full build + install locally
mvn clean package -DskipTests # Build without running tests
mvn test                     # Compile + run tests only
mvn verify                   # Full build with integration tests
mvn dependency:tree          # Show dependency tree
mvn versions:display-dependency-updates  # Check for updates

&lt;!-- CLEAN lifecycle: --&gt;
pre-clean → clean → post-clean

&lt;!-- SITE lifecycle: --&gt;
pre-site → site → post-site → site-deploy

&lt;!-- Phase vs Goal: --&gt;
&lt;!-- Phase: Part of lifecycle (e.g., compile, test) --&gt;
&lt;!-- Goal: Specific task of a plugin (e.g., compiler:compile) --&gt;
mvn compiler:compile         # Run specific plugin goal directly
mvn surefire:test            # Run test goal directly</code></pre>`,
        level: 'basic' as const
      },
    ]
  },
  {
    title: 'Dependency Management',
    questions: [
      {
        q: 'How does Maven resolve dependencies? Explain transitive dependencies.',
        a: `<pre><code>&lt;!-- Dependency resolution order: --&gt;
&lt;!-- 1. Local repository (~/.m2/repository) --&gt;
&lt;!-- 2. Remote repositories (Maven Central, private Nexus) --&gt;

&lt;!-- Transitive dependencies: --&gt;
&lt;!-- Your project → spring-boot-starter-web → spring-webmvc → spring-core --&gt;
&lt;!-- Maven auto-includes ALL transitive dependencies --&gt;

&lt;!-- Dependency scopes: --&gt;
&lt;dependency&gt;
    &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
    &lt;artifactId&gt;spring-boot-starter-web&lt;/artifactId&gt;
    &lt;scope&gt;compile&lt;/scope&gt;   &lt;!-- Default. Available everywhere. --&gt;
&lt;/dependency&gt;
&lt;dependency&gt;
    &lt;groupId&gt;org.junit.jupiter&lt;/groupId&gt;
    &lt;artifactId&gt;junit-jupiter&lt;/artifactId&gt;
    &lt;scope&gt;test&lt;/scope&gt;      &lt;!-- Only for tests. Not in final JAR. --&gt;
&lt;/dependency&gt;
&lt;dependency&gt;
    &lt;groupId&gt;javax.servlet&lt;/groupId&gt;
    &lt;artifactId&gt;javax.servlet-api&lt;/artifactId&gt;
    &lt;scope&gt;provided&lt;/scope&gt;  &lt;!-- Available at compile, not packaged (server provides) --&gt;
&lt;/dependency&gt;
&lt;dependency&gt;
    &lt;groupId&gt;mysql&lt;/groupId&gt;
    &lt;artifactId&gt;mysql-connector-java&lt;/artifactId&gt;
    &lt;scope&gt;runtime&lt;/scope&gt;   &lt;!-- Not needed at compile, needed at runtime --&gt;
&lt;/dependency&gt;

&lt;!-- Conflict resolution: NEAREST WINS (shortest path in tree) --&gt;
&lt;!-- A → B → C 2.0 --&gt;
&lt;!-- A → D → E → C 1.0 --&gt;
&lt;!-- Result: C 2.0 wins (depth 2 vs depth 3) --&gt;
&lt;!-- Same depth? First declaration in POM wins. --&gt;

&lt;!-- View dependency tree: --&gt;
mvn dependency:tree
mvn dependency:tree -Dincludes=com.fasterxml.jackson  # Filter

&lt;!-- Force specific version: --&gt;
&lt;dependencyManagement&gt;
    &lt;dependencies&gt;
        &lt;dependency&gt;
            &lt;groupId&gt;com.fasterxml.jackson.core&lt;/groupId&gt;
            &lt;artifactId&gt;jackson-databind&lt;/artifactId&gt;
            &lt;version&gt;2.15.0&lt;/version&gt;  &lt;!-- Override ALL transitive versions --&gt;
        &lt;/dependency&gt;
    &lt;/dependencies&gt;
&lt;/dependencyManagement&gt;</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How to handle dependency conflicts and exclusions?',
        a: `<pre><code>&lt;!-- Problem: Two dependencies bring different versions of same library --&gt;
&lt;!-- spring-boot-starter-web → jackson 2.15.0 --&gt;
&lt;!-- some-other-lib → jackson 2.13.0 (older, maybe incompatible) --&gt;

&lt;!-- Solution 1: Exclude transitive dependency --&gt;
&lt;dependency&gt;
    &lt;groupId&gt;com.some&lt;/groupId&gt;
    &lt;artifactId&gt;some-other-lib&lt;/artifactId&gt;
    &lt;exclusions&gt;
        &lt;exclusion&gt;
            &lt;groupId&gt;com.fasterxml.jackson.core&lt;/groupId&gt;
            &lt;artifactId&gt;jackson-databind&lt;/artifactId&gt;
        &lt;/exclusion&gt;
    &lt;/exclusions&gt;
&lt;/dependency&gt;

&lt;!-- Solution 2: dependencyManagement (force version globally) --&gt;
&lt;dependencyManagement&gt;
    &lt;dependencies&gt;
        &lt;dependency&gt;
            &lt;groupId&gt;com.fasterxml.jackson.core&lt;/groupId&gt;
            &lt;artifactId&gt;jackson-databind&lt;/artifactId&gt;
            &lt;version&gt;2.15.0&lt;/version&gt;
        &lt;/dependency&gt;
    &lt;/dependencies&gt;
&lt;/dependencyManagement&gt;
&lt;!-- dependencyManagement only sets version. Still need &lt;dependency&gt; to include it. --&gt;

&lt;!-- Solution 3: BOM (Bill of Materials) — import version set --&gt;
&lt;dependencyManagement&gt;
    &lt;dependencies&gt;
        &lt;dependency&gt;
            &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
            &lt;artifactId&gt;spring-boot-dependencies&lt;/artifactId&gt;
            &lt;version&gt;3.2.0&lt;/version&gt;
            &lt;type&gt;pom&lt;/type&gt;
            &lt;scope&gt;import&lt;/scope&gt;  &lt;!-- Import all managed versions --&gt;
        &lt;/dependency&gt;
    &lt;/dependencies&gt;
&lt;/dependencyManagement&gt;
&lt;!-- Now: spring-related deps don't need &lt;version&gt; tag --&gt;

&lt;!-- Diagnose conflicts: --&gt;
mvn dependency:tree -Dverbose    # Shows conflicts and resolutions
mvn enforcer:enforce             # Fail build on conflicts (with plugin)

&lt;!-- Maven Enforcer Plugin (prevent conflicts): --&gt;
&lt;plugin&gt;
    &lt;groupId&gt;org.apache.maven.plugins&lt;/groupId&gt;
    &lt;artifactId&gt;maven-enforcer-plugin&lt;/artifactId&gt;
    &lt;executions&gt;
        &lt;execution&gt;
            &lt;goals&gt;&lt;goal&gt;enforce&lt;/goal&gt;&lt;/goals&gt;
            &lt;configuration&gt;
                &lt;rules&gt;
                    &lt;dependencyConvergence/&gt; &lt;!-- Fail if version conflicts --&gt;
                &lt;/rules&gt;
            &lt;/configuration&gt;
        &lt;/execution&gt;
    &lt;/executions&gt;
&lt;/plugin&gt;</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'What is the difference between dependencies and dependencyManagement?',
        a: `<pre><code>&lt;!-- dependencies: Actually adds the library to the project --&gt;
&lt;dependencies&gt;
    &lt;dependency&gt;
        &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
        &lt;artifactId&gt;spring-boot-starter-web&lt;/artifactId&gt;
        &lt;version&gt;3.2.0&lt;/version&gt;
    &lt;/dependency&gt;
&lt;/dependencies&gt;
&lt;!-- This artifact IS on the classpath --&gt;

&lt;!-- dependencyManagement: Only DECLARES versions (doesn't add to classpath) --&gt;
&lt;dependencyManagement&gt;
    &lt;dependencies&gt;
        &lt;dependency&gt;
            &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
            &lt;artifactId&gt;spring-boot-starter-web&lt;/artifactId&gt;
            &lt;version&gt;3.2.0&lt;/version&gt;
        &lt;/dependency&gt;
    &lt;/dependencies&gt;
&lt;/dependencyManagement&gt;
&lt;!-- NOT on classpath yet! Just "if someone declares this dep, use this version" --&gt;

&lt;!-- In child module, version inherited: --&gt;
&lt;dependencies&gt;
    &lt;dependency&gt;
        &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
        &lt;artifactId&gt;spring-boot-starter-web&lt;/artifactId&gt;
        &lt;!-- No version needed! Inherited from parent's dependencyManagement --&gt;
    &lt;/dependency&gt;
&lt;/dependencies&gt;

&lt;!-- Use case: Parent POM defines versions, child modules just declare what they need --&gt;
&lt;!-- Centralized version control across multi-module project --&gt;

&lt;!-- Key differences: --&gt;
&lt;!-- dependencies → artifact included in build --&gt;
&lt;!-- dependencyManagement → only sets defaults for version/scope/exclusions --&gt;
&lt;!-- dependencyManagement in parent → children inherit version without specifying --&gt;
&lt;!-- dependencyManagement + scope=import → BOM import (version catalog) --&gt;</code></pre>`,
        level: 'basic' as const
      },
    ]
  },
  {
    title: 'Plugins & Build Configuration',
    questions: [
      {
        q: 'What are Maven plugins? Explain commonly used plugins.',
        a: `<pre><code>&lt;!-- Plugins: Execute tasks during build lifecycle --&gt;
&lt;!-- Each phase is executed by a plugin goal --&gt;

&lt;build&gt;
    &lt;plugins&gt;
        &lt;!-- Compiler Plugin: Java compilation settings --&gt;
        &lt;plugin&gt;
            &lt;groupId&gt;org.apache.maven.plugins&lt;/groupId&gt;
            &lt;artifactId&gt;maven-compiler-plugin&lt;/artifactId&gt;
            &lt;version&gt;3.11.0&lt;/version&gt;
            &lt;configuration&gt;
                &lt;source&gt;17&lt;/source&gt;
                &lt;target&gt;17&lt;/target&gt;
                &lt;compilerArgs&gt;
                    &lt;arg&gt;-parameters&lt;/arg&gt;  &lt;!-- Preserve param names (Spring) --&gt;
                &lt;/compilerArgs&gt;
            &lt;/configuration&gt;
        &lt;/plugin&gt;
        
        &lt;!-- Surefire: Unit tests (test phase) --&gt;
        &lt;plugin&gt;
            &lt;groupId&gt;org.apache.maven.plugins&lt;/groupId&gt;
            &lt;artifactId&gt;maven-surefire-plugin&lt;/artifactId&gt;
            &lt;version&gt;3.1.2&lt;/version&gt;
            &lt;configuration&gt;
                &lt;includes&gt;
                    &lt;include&gt;**/*Test.java&lt;/include&gt;
                &lt;/includes&gt;
            &lt;/configuration&gt;
        &lt;/plugin&gt;
        
        &lt;!-- Failsafe: Integration tests (verify phase) --&gt;
        &lt;plugin&gt;
            &lt;groupId&gt;org.apache.maven.plugins&lt;/groupId&gt;
            &lt;artifactId&gt;maven-failsafe-plugin&lt;/artifactId&gt;
            &lt;version&gt;3.1.2&lt;/version&gt;
            &lt;executions&gt;
                &lt;execution&gt;
                    &lt;goals&gt;
                        &lt;goal&gt;integration-test&lt;/goal&gt;
                        &lt;goal&gt;verify&lt;/goal&gt;
                    &lt;/goals&gt;
                &lt;/execution&gt;
            &lt;/executions&gt;
        &lt;/plugin&gt;
        
        &lt;!-- Spring Boot Plugin: Create executable JAR --&gt;
        &lt;plugin&gt;
            &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
            &lt;artifactId&gt;spring-boot-maven-plugin&lt;/artifactId&gt;
            &lt;configuration&gt;
                &lt;excludes&gt;
                    &lt;exclude&gt;
                        &lt;groupId&gt;org.projectlombok&lt;/groupId&gt;
                        &lt;artifactId&gt;lombok&lt;/artifactId&gt;
                    &lt;/exclude&gt;
                &lt;/excludes&gt;
            &lt;/configuration&gt;
        &lt;/plugin&gt;
        
        &lt;!-- JaCoCo: Code coverage --&gt;
        &lt;plugin&gt;
            &lt;groupId&gt;org.jacoco&lt;/groupId&gt;
            &lt;artifactId&gt;jacoco-maven-plugin&lt;/artifactId&gt;
            &lt;version&gt;0.8.11&lt;/version&gt;
            &lt;executions&gt;
                &lt;execution&gt;&lt;goals&gt;&lt;goal&gt;prepare-agent&lt;/goal&gt;&lt;/goals&gt;&lt;/execution&gt;
                &lt;execution&gt;
                    &lt;id&gt;report&lt;/id&gt;
                    &lt;phase&gt;test&lt;/phase&gt;
                    &lt;goals&gt;&lt;goal&gt;report&lt;/goal&gt;&lt;/goals&gt;
                &lt;/execution&gt;
            &lt;/executions&gt;
        &lt;/plugin&gt;
    &lt;/plugins&gt;
&lt;/build&gt;</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'How do Maven profiles work? When to use them?',
        a: `<pre><code>&lt;!-- Profiles: Conditional build configuration --&gt;
&lt;profiles&gt;
    &lt;!-- Development profile --&gt;
    &lt;profile&gt;
        &lt;id&gt;dev&lt;/id&gt;
        &lt;activation&gt;
            &lt;activeByDefault&gt;true&lt;/activeByDefault&gt; &lt;!-- Active by default --&gt;
        &lt;/activation&gt;
        &lt;properties&gt;
            &lt;spring.profiles.active&gt;dev&lt;/spring.profiles.active&gt;
            &lt;db.url&gt;jdbc:mysql://localhost:3306/mydb&lt;/db.url&gt;
        &lt;/properties&gt;
    &lt;/profile&gt;
    
    &lt;!-- Production profile --&gt;
    &lt;profile&gt;
        &lt;id&gt;prod&lt;/id&gt;
        &lt;properties&gt;
            &lt;spring.profiles.active&gt;prod&lt;/spring.profiles.active&gt;
            &lt;db.url&gt;jdbc:mysql://prod-db:3306/mydb&lt;/db.url&gt;
        &lt;/properties&gt;
        &lt;dependencies&gt;
            &lt;dependency&gt;
                &lt;groupId&gt;com.newrelic.agent.java&lt;/groupId&gt;
                &lt;artifactId&gt;newrelic-agent&lt;/artifactId&gt;
                &lt;version&gt;8.0.0&lt;/version&gt;
            &lt;/dependency&gt;
        &lt;/dependencies&gt;
    &lt;/profile&gt;
    
    &lt;!-- CI profile (skip slow tests locally) --&gt;
    &lt;profile&gt;
        &lt;id&gt;ci&lt;/id&gt;
        &lt;build&gt;
            &lt;plugins&gt;
                &lt;plugin&gt;
                    &lt;groupId&gt;org.jacoco&lt;/groupId&gt;
                    &lt;artifactId&gt;jacoco-maven-plugin&lt;/artifactId&gt;
                    &lt;configuration&gt;
                        &lt;rules&gt;
                            &lt;rule&gt;
                                &lt;limits&gt;
                                    &lt;limit&gt;
                                        &lt;counter&gt;LINE&lt;/counter&gt;
                                        &lt;minimum&gt;0.80&lt;/minimum&gt; &lt;!-- 80% coverage --&gt;
                                    &lt;/limit&gt;
                                &lt;/limits&gt;
                            &lt;/rule&gt;
                        &lt;/rules&gt;
                    &lt;/configuration&gt;
                &lt;/plugin&gt;
            &lt;/plugins&gt;
        &lt;/build&gt;
    &lt;/profile&gt;
&lt;/profiles&gt;

&lt;!-- Activation methods: --&gt;
mvn clean install -Pprod           &lt;!-- Explicit activation --&gt;
mvn clean install -Pprod,ci        &lt;!-- Multiple profiles --&gt;
mvn clean install -P!dev           &lt;!-- Deactivate profile --&gt;

&lt;!-- Auto-activation: --&gt;
&lt;activation&gt;
    &lt;property&gt;&lt;name&gt;env&lt;/name&gt;&lt;value&gt;prod&lt;/value&gt;&lt;/property&gt;  &lt;!-- -Denv=prod --&gt;
    &lt;os&gt;&lt;family&gt;windows&lt;/family&gt;&lt;/os&gt;                        &lt;!-- OS-based --&gt;
    &lt;file&gt;&lt;exists&gt;src/main/resources/prod.yml&lt;/exists&gt;&lt;/file&gt; &lt;!-- File exists --&gt;
    &lt;jdk&gt;17&lt;/jdk&gt;                                            &lt;!-- JDK version --&gt;
&lt;/activation&gt;

&lt;!-- List active profiles: --&gt;
mvn help:active-profiles</code></pre>`,
        level: 'intermediate' as const
      },
    ]
  },
  {
    title: 'Multi-Module Projects',
    questions: [
      {
        q: 'How to structure a multi-module Maven project?',
        a: `<pre><code>&lt;!-- Multi-module project structure: --&gt;
my-platform/
├── pom.xml                     &lt;!-- Parent POM (packaging: pom) --&gt;
├── common/
│   └── pom.xml                 &lt;!-- Shared utilities, DTOs --&gt;
├── domain/
│   └── pom.xml                 &lt;!-- Domain models, business logic --&gt;
├── api/
│   └── pom.xml                 &lt;!-- REST controllers, web layer --&gt;
├── persistence/
│   └── pom.xml                 &lt;!-- Repository, DB access --&gt;
└── app/
    └── pom.xml                 &lt;!-- Main application (Spring Boot) --&gt;

&lt;!-- PARENT POM (root/pom.xml): --&gt;
&lt;project&gt;
    &lt;modelVersion&gt;4.0.0&lt;/modelVersion&gt;
    &lt;groupId&gt;com.mycompany&lt;/groupId&gt;
    &lt;artifactId&gt;my-platform&lt;/artifactId&gt;
    &lt;version&gt;1.0.0-SNAPSHOT&lt;/version&gt;
    &lt;packaging&gt;pom&lt;/packaging&gt;  &lt;!-- Must be 'pom' for parent --&gt;
    
    &lt;modules&gt;
        &lt;module&gt;common&lt;/module&gt;
        &lt;module&gt;domain&lt;/module&gt;
        &lt;module&gt;persistence&lt;/module&gt;
        &lt;module&gt;api&lt;/module&gt;
        &lt;module&gt;app&lt;/module&gt;
    &lt;/modules&gt;
    
    &lt;properties&gt;
        &lt;java.version&gt;17&lt;/java.version&gt;
        &lt;spring-boot.version&gt;3.2.0&lt;/spring-boot.version&gt;
    &lt;/properties&gt;
    
    &lt;dependencyManagement&gt;
        &lt;dependencies&gt;
            &lt;dependency&gt;
                &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
                &lt;artifactId&gt;spring-boot-dependencies&lt;/artifactId&gt;
                &lt;version&gt;\${spring-boot.version}&lt;/version&gt;
                &lt;type&gt;pom&lt;/type&gt;
                &lt;scope&gt;import&lt;/scope&gt;
            &lt;/dependency&gt;
            &lt;!-- Internal modules --&gt;
            &lt;dependency&gt;
                &lt;groupId&gt;com.mycompany&lt;/groupId&gt;
                &lt;artifactId&gt;common&lt;/artifactId&gt;
                &lt;version&gt;\${project.version}&lt;/version&gt;
            &lt;/dependency&gt;
        &lt;/dependencies&gt;
    &lt;/dependencyManagement&gt;
&lt;/project&gt;

&lt;!-- CHILD POM (api/pom.xml): --&gt;
&lt;project&gt;
    &lt;parent&gt;
        &lt;groupId&gt;com.mycompany&lt;/groupId&gt;
        &lt;artifactId&gt;my-platform&lt;/artifactId&gt;
        &lt;version&gt;1.0.0-SNAPSHOT&lt;/version&gt;
    &lt;/parent&gt;
    &lt;artifactId&gt;api&lt;/artifactId&gt;
    
    &lt;dependencies&gt;
        &lt;dependency&gt;
            &lt;groupId&gt;com.mycompany&lt;/groupId&gt;
            &lt;artifactId&gt;domain&lt;/artifactId&gt;  &lt;!-- No version needed --&gt;
        &lt;/dependency&gt;
        &lt;dependency&gt;
            &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
            &lt;artifactId&gt;spring-boot-starter-web&lt;/artifactId&gt;  &lt;!-- No version --&gt;
        &lt;/dependency&gt;
    &lt;/dependencies&gt;
&lt;/project&gt;

&lt;!-- Build: mvn clean install (from root — builds all modules in order) --&gt;
&lt;!-- Maven resolves build order from inter-module dependencies (reactor) --&gt;</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Explain the Maven Reactor and build order in multi-module projects.',
        a: `<pre><code>&lt;!-- Reactor: Maven's mechanism to build multi-module projects --&gt;
&lt;!-- Automatically determines correct build order based on dependencies --&gt;

&lt;!-- If: app depends on api, api depends on domain, domain depends on common --&gt;
&lt;!-- Build order: common → domain → api → app --&gt;

&lt;!-- Reactor options: --&gt;
mvn clean install                    # Build all modules
mvn clean install -pl api            # Build only 'api' module
mvn clean install -pl api -am        # Build 'api' AND its dependencies (also-make)
mvn clean install -pl common -amd    # Build 'common' AND modules that depend on it
mvn clean install -rf persistence    # Resume from 'persistence' (skip earlier modules)

# View reactor order:
mvn validate  # Shows [INFO] Reactor Build Order: ...

# Parallel build (faster!):
mvn clean install -T 4     # 4 threads
mvn clean install -T 1C    # 1 thread per CPU core

&lt;!-- Circular dependency: Maven will FAIL if A depends on B depends on A --&gt;
&lt;!-- Solution: Extract shared code to a third module --&gt;

&lt;!-- Flatten Maven Plugin (for CI/CD): --&gt;
&lt;!-- Replace ${revision} with actual version for publishing --&gt;
&lt;project&gt;
    &lt;version&gt;\${revision}&lt;/version&gt;
    &lt;properties&gt;
        &lt;revision&gt;1.0.0-SNAPSHOT&lt;/revision&gt;
    &lt;/properties&gt;
&lt;/project&gt;
&lt;!-- Build: mvn clean install -Drevision=1.2.3 --&gt;

&lt;!-- Release process: --&gt;
mvn versions:set -DnewVersion=1.0.0      # Set release version
mvn clean deploy                           # Deploy release
mvn versions:set -DnewVersion=1.0.1-SNAPSHOT  # Next dev version</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
  {
    title: 'Repository Management & Best Practices',
    questions: [
      {
        q: 'How do Maven repositories work? Local vs Remote vs Central.',
        a: `<pre><code>&lt;!-- Repository resolution order: --&gt;
&lt;!-- 1. Local repo (~/.m2/repository) — cached downloads --&gt;
&lt;!-- 2. Remote repos declared in POM/settings.xml --&gt;
&lt;!-- 3. Maven Central (https://repo.maven.apache.org/maven2/) --&gt;

&lt;!-- Configure custom remote repository: --&gt;
&lt;repositories&gt;
    &lt;repository&gt;
        &lt;id&gt;company-nexus&lt;/id&gt;
        &lt;url&gt;https://nexus.company.com/repository/maven-public/&lt;/url&gt;
        &lt;releases&gt;&lt;enabled&gt;true&lt;/enabled&gt;&lt;/releases&gt;
        &lt;snapshots&gt;&lt;enabled&gt;true&lt;/enabled&gt;&lt;/snapshots&gt;
    &lt;/repository&gt;
&lt;/repositories&gt;

&lt;!-- Distribution management (where to deploy): --&gt;
&lt;distributionManagement&gt;
    &lt;repository&gt;
        &lt;id&gt;releases&lt;/id&gt;
        &lt;url&gt;https://nexus.company.com/repository/maven-releases/&lt;/url&gt;
    &lt;/repository&gt;
    &lt;snapshotRepository&gt;
        &lt;id&gt;snapshots&lt;/id&gt;
        &lt;url&gt;https://nexus.company.com/repository/maven-snapshots/&lt;/url&gt;
    &lt;/snapshotRepository&gt;
&lt;/distributionManagement&gt;

&lt;!-- ~/.m2/settings.xml (credentials, NOT in POM!): --&gt;
&lt;settings&gt;
    &lt;servers&gt;
        &lt;server&gt;
            &lt;id&gt;releases&lt;/id&gt;  &lt;!-- Must match repository id --&gt;
            &lt;username&gt;deploy-user&lt;/username&gt;
            &lt;password&gt;\${env.NEXUS_PASSWORD}&lt;/password&gt;
        &lt;/server&gt;
    &lt;/servers&gt;
    &lt;mirrors&gt;
        &lt;mirror&gt;
            &lt;id&gt;nexus-mirror&lt;/id&gt;
            &lt;mirrorOf&gt;*&lt;/mirrorOf&gt;  &lt;!-- Mirror ALL repos through Nexus --&gt;
            &lt;url&gt;https://nexus.company.com/repository/maven-public/&lt;/url&gt;
        &lt;/mirror&gt;
    &lt;/mirrors&gt;
&lt;/settings&gt;

&lt;!-- SNAPSHOT behavior: --&gt;
&lt;!-- SNAPSHOTs re-downloaded daily (or per updatePolicy) --&gt;
&lt;!-- Releases downloaded ONCE and cached forever --&gt;
&lt;!-- Force update: mvn clean install -U (update snapshots) --&gt;</code></pre>`,
        level: 'intermediate' as const
      },
      {
        q: 'Maven best practices for enterprise projects.',
        a: `<pre><code>&lt;!-- 1. Use BOM for version management --&gt;
&lt;dependencyManagement&gt;
    &lt;dependencies&gt;
        &lt;dependency&gt;
            &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
            &lt;artifactId&gt;spring-boot-dependencies&lt;/artifactId&gt;
            &lt;version&gt;3.2.0&lt;/version&gt;
            &lt;type&gt;pom&lt;/type&gt;
            &lt;scope&gt;import&lt;/scope&gt;
        &lt;/dependency&gt;
    &lt;/dependencies&gt;
&lt;/dependencyManagement&gt;

&lt;!-- 2. Properties for versions (centralized, easy updates) --&gt;
&lt;properties&gt;
    &lt;java.version&gt;17&lt;/java.version&gt;
    &lt;mapstruct.version&gt;1.5.5.Final&lt;/mapstruct.version&gt;
    &lt;testcontainers.version&gt;1.19.3&lt;/testcontainers.version&gt;
&lt;/properties&gt;

&lt;!-- 3. Enforce rules with maven-enforcer-plugin --&gt;
&lt;plugin&gt;
    &lt;artifactId&gt;maven-enforcer-plugin&lt;/artifactId&gt;
    &lt;executions&gt;&lt;execution&gt;
        &lt;goals&gt;&lt;goal&gt;enforce&lt;/goal&gt;&lt;/goals&gt;
        &lt;configuration&gt;&lt;rules&gt;
            &lt;requireMavenVersion&gt;&lt;version&gt;3.8&lt;/version&gt;&lt;/requireMavenVersion&gt;
            &lt;requireJavaVersion&gt;&lt;version&gt;17&lt;/version&gt;&lt;/requireJavaVersion&gt;
            &lt;dependencyConvergence/&gt;
            &lt;banDuplicatePomDependencyVersions/&gt;
        &lt;/rules&gt;&lt;/configuration&gt;
    &lt;/execution&gt;&lt;/executions&gt;
&lt;/plugin&gt;

&lt;!-- 4. Reproducible builds --&gt;
&lt;properties&gt;
    &lt;project.build.outputTimestamp&gt;2024-01-15T00:00:00Z&lt;/project.build.outputTimestamp&gt;
&lt;/properties&gt;

&lt;!-- 5. CI/CD pipeline settings --&gt;
mvn clean verify -B              # Batch mode (no interactive prompts)
mvn clean verify -B -ntp         # No transfer progress (cleaner logs)
mvn clean install -DskipTests    # Skip tests (only for local debugging!)

&lt;!-- 6. Maven Wrapper (ensure consistent Maven version): --&gt;
mvn wrapper:wrapper -Dmaven=3.9.6
# Generates: mvnw, mvnw.cmd, .mvn/wrapper/
# CI uses: ./mvnw clean verify (no Maven install needed!)

&lt;!-- 7. Never commit: --&gt;
# .gitignore:
target/
*.class
*.jar
.idea/
*.iml

&lt;!-- 8. Security: OWASP dependency check --&gt;
&lt;plugin&gt;
    &lt;groupId&gt;org.owasp&lt;/groupId&gt;
    &lt;artifactId&gt;dependency-check-maven&lt;/artifactId&gt;
    &lt;configuration&gt;
        &lt;failBuildOnCVSS&gt;7&lt;/failBuildOnCVSS&gt;
    &lt;/configuration&gt;
&lt;/plugin&gt;</code></pre>`,
        level: 'advanced' as const
      },
    ]
  },
];

export default sections;
