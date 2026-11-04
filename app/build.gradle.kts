plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.vivek.tvlauncher"
    compileSdk = 35
    defaultConfig {
        applicationId = "com.vivek.tvlauncher"
        minSdk = 26
        targetSdk = 28
        versionCode = 1
        versionName = "0.1"
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
    // The launcher UI is the same web folder you preview on the laptop.
    sourceSets["main"].assets.srcDirs("../web")
}
