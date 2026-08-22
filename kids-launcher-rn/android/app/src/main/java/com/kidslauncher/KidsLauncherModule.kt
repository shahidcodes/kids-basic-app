package com.kidslauncher

import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.speech.tts.TextToSpeech
import android.util.Log
import com.facebook.react.bridge.*
import java.util.*

class KidsLauncherModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = null
    private var ttsInitialized = false
    private var ttsInitPromise: Promise? = null

    init {
        tts = TextToSpeech(reactContext, this)
    }

    override fun getName(): String = "KidsLauncher"

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            ttsInitialized = true
            ttsInitPromise?.resolve(true)
        } else {
            ttsInitPromise?.reject("TTS_INIT_FAILED", "Text-to-Speech initialization failed")
        }
        ttsInitPromise = null
    }

    @ReactMethod
    fun initializeTTS(promise: Promise) {
        if (ttsInitialized) {
            promise.resolve(true)
        } else {
            ttsInitPromise = promise
        }
    }

    @ReactMethod
    fun speak(text: String, language: String, pitch: Float, rate: Float, promise: Promise) {
        if (!ttsInitialized) {
            promise.reject("TTS_NOT_READY", "Text-to-Speech not initialized")
            return
        }

        val locale = when (language) {
            "ar" -> Locale("ar")
            "dv" -> Locale("dv") // Dhivehi - may fallback to default if not available
            else -> Locale.ENGLISH
        }

        val result = tts?.setLanguage(locale)
        if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
            // Try to download language data
            val installIntent = Intent()
            installIntent.action = TextToSpeech.Engine.ACTION_CHECK_TTS_DATA
            installIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            reactApplicationContext.startActivity(installIntent)
            promise.reject("TTS_LANG_NOT_SUPPORTED", "Language $language not supported")
            return
        }

        tts?.setPitch(pitch)
        tts?.setSpeechRate(rate)

        val utteranceId = UUID.randomUUID().toString()
        val params = Bundle()

        val speakResult = tts?.speak(text, TextToSpeech.QUEUE_FLUSH, params, utteranceId)
        if (speakResult == TextToSpeech.SUCCESS) {
            promise.resolve(true)
        } else {
            promise.reject("TTS_SPEAK_FAILED", "Failed to speak text")
        }
    }

    @ReactMethod
    fun stopSpeaking() {
        tts?.stop()
    }

    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        try {
            val pm = reactApplicationContext.packageManager
            val apps = Arguments.createArray()
            val packages = pm.getInstalledApplications(PackageManager.GET_META_DATA)

            for (appInfo in packages) {
                // Only show launchable apps
                val launchIntent = pm.getLaunchIntentForPackage(appInfo.packageName)
                if (launchIntent != null && appInfo.packageName != reactApplicationContext.packageName) {
                    val appMap = Arguments.createMap()
                    appMap.putString("packageName", appInfo.packageName)
                    appMap.putString("appName", pm.getApplicationLabel(appInfo).toString())
                    apps.pushMap(appMap)
                }
            }
            promise.resolve(apps)
        } catch (e: Exception) {
            promise.reject("APPS_FETCH_ERROR", e.message)
        }
    }

    @ReactMethod
    fun launchApp(packageName: String, promise: Promise) {
        try {
            val pm = reactApplicationContext.packageManager
            val intent = pm.getLaunchIntentForPackage(packageName)
            if (intent != null) {
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                reactApplicationContext.startActivity(intent)
                promise.resolve(true)
            } else {
                promise.reject("APP_NOT_FOUND", "App not found: $packageName")
            }
        } catch (e: Exception) {
            promise.reject("LAUNCH_ERROR", e.message)
        }
    }

    @ReactMethod
    fun isDefaultLauncher(promise: Promise) {
        try {
            val pm = reactApplicationContext.packageManager
            val intent = Intent(Intent.ACTION_MAIN)
            intent.addCategory(Intent.CATEGORY_HOME)
            val resolveInfo = pm.resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY)
            val isDefault = resolveInfo?.activityInfo?.packageName == reactApplicationContext.packageName
            promise.resolve(isDefault)
        } catch (e: Exception) {
            promise.reject("CHECK_ERROR", e.message)
        }
    }

    @ReactMethod
    fun openLauncherSettings() {
        val intent = Intent(Settings.ACTION_HOME_SETTINGS)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        reactApplicationContext.startActivity(intent)
    }

    @ReactMethod
    fun lockDevice() {
        val devicePolicyManager = reactApplicationContext.getSystemService(Context.DEVICE_POLICY_SERVICE)
            as? android.app.admin.DevicePolicyManager
        val adminComponent = android.content.ComponentName(reactApplicationContext, KidsDeviceAdminReceiver::class.java)
        devicePolicyManager?.lockNow()
    }

    @ReactMethod
    fun blockStatusBar() {
        // This requires SYSTEM_UI_FLAG_IMMERSIVE_STICKY set on the window
        val activity = currentActivity ?: return
        activity.runOnUiThread {
            activity.window.decorView.systemUiVisibility = (
                android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                or android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
                or android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                or android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            )
        }
    }

    @ReactMethod
    fun exitToLauncher(promise: Promise) {
        try {
            val activity = currentActivity ?: throw IllegalStateException("Activity is null")
            
            // Stop lock task mode to allow exiting
            val activityManager = reactApplicationContext.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
            if (activityManager.lockTaskModeState != ActivityManager.LOCK_TASK_MODE_NONE) {
                activity.stopLockTask()
            }
            
            // Launch the system home intent to go back to default launcher
            val intent = Intent(Intent.ACTION_MAIN)
            intent.addCategory(Intent.CATEGORY_HOME)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            
            // This will show the system picker if multiple launchers exist
            reactApplicationContext.startActivity(intent)
            
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("EXIT_ERROR", e.message)
        }
    }

    @ReactMethod
    fun openDeviceSettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_SETTINGS)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SETTINGS_ERROR", e.message)
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for NativeEventEmitter
    }

    override fun onCatalystInstanceDestroy() {
        tts?.stop()
        tts?.shutdown()
        super.onCatalystInstanceDestroy()
    }
}
