package com.kidslauncher

import android.app.ActivityManager
import android.content.Context
import android.os.Bundle
import android.view.KeyEvent
import android.view.WindowManager
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "kidslauncher"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Keep screen on while app is active
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        
        // Enable lock task mode for kiosk/launcher behavior
        startLockTaskMode()
    }

    override fun onResume() {
        super.onResume()
        // Re-apply lock task mode on resume
        startLockTaskMode()
    }

    private fun startLockTaskMode() {
        try {
            // Check if already in lock task mode
            val activityManager = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
            if (activityManager.lockTaskModeState == ActivityManager.LOCK_TASK_MODE_NONE) {
                startLockTask()
            }
        } catch (e: Exception) {
            // Lock task mode may not be available or permitted
            // App will still function normally without kiosk mode
        }
    }

    // Block back button
    override fun onBackPressed() {
        // Do nothing - prevent exiting
    }

    // Block volume keys from changing system volume (optional)
    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        return when (keyCode) {
            KeyEvent.KEYCODE_BACK -> true
            // Note: HOME and RECENT_APPS cannot be intercepted here
            // They are handled by the system. Lock task mode prevents them.
            else -> super.onKeyDown(keyCode, event)
        }
    }

    // Prevent activity from being killed when user tries to switch away
    override fun onUserLeaveHint() {
        // Re-assert lock task mode
        startLockTaskMode()
    }
}
