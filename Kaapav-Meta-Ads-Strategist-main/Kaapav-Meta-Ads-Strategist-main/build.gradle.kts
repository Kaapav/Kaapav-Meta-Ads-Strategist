// Root build.gradle.kts for Kaapav-Meta-Ads-Strategist
// Targets: Gradle 8.12, AGP 8.5.2, Kotlin 1.9.25

buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        // Android Gradle Plugin
        classpath("com.android.tools.build:gradle:8.5.2")
        // Kotlin Gradle plugin (for Kotlin Android modules)
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.25")
    }
}

plugins {
    // Keep Kotlin JVM plugin available but not applied to root (safe guard)
    id("org.jetbrains.kotlin.jvm") version "1.9.25" apply false
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

subprojects {
    // Ensure Kotlin JVM plugin resolution for any subproject that requires it
    plugins.withId("org.jetbrains.kotlin.jvm") {
        // no-op here; plugin is declared so Kotlin plugin resolution works
    }
}

// Simple convenience task to clean root build dir
tasks.register<Delete>("clean") {
    delete(rootProject.buildDir)
}

// Optional: helpful printing when running from CLI
tasks.register("kaapavInfo") {
    doLast {
        println("Kaapav Meta Ads Strategist — root build script")
        println("Gradle: ${gradle.gradleVersion}")
        println("Java: ${System.getProperty("java.version")}")
    }
}

