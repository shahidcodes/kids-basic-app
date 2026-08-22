package com.kidslauncher

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
    }

    // Block back button
    override fun onBackPressed() {
        // Do nothing - prevent exiting
    }

    // Block volume keys from changing system volume (optional)
    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        return when (keyCode) {
            KeyEvent.KEYCODE_BACK -> true
            KeyEvent.KEYCODE_HOME -> true
            KeyEvent.KEYCODE_RECENT_APPS -> true
            else -> super.onKeyDown(keyCode, event)
        }
    }

    // Prevent activity from being killed when user tries to switch away
    override fun onUserLeaveHint() {
        // Do nothing - stay in the app
    }
}
