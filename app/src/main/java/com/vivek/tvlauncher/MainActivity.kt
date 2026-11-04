package com.vivek.tvlauncher

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.app.Activity
import android.content.Intent
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.wifi.WifiManager
import android.provider.Settings
import android.graphics.Bitmap
import android.graphics.Canvas
import android.os.Bundle
import android.util.Base64
import android.media.MediaPlayer
import android.view.KeyEvent
import android.view.SurfaceHolder
import android.view.SurfaceView
import android.widget.FrameLayout
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.WebView
import org.json.JSONArray
import org.json.JSONObject
import java.io.ByteArrayOutputStream

class MainActivity : Activity() {
    private lateinit var web: WebView
    // The theme's background clip plays in Android's own video player on a surface under the (transparent) page:
    // the TV's video hardware shows it directly, instead of the WebView copying every frame (~60% of a core).
    private lateinit var surface: SurfaceView
    private var player: MediaPlayer? = null
    private var bgPath: String? = null
    private var surfaceReady = false

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        surface = SurfaceView(this)
        surface.holder.addCallback(object : SurfaceHolder.Callback {
            override fun surfaceCreated(h: SurfaceHolder) { surfaceReady = true; startBg() }
            override fun surfaceChanged(h: SurfaceHolder, f: Int, w: Int, ht: Int) {}
            override fun surfaceDestroyed(h: SurfaceHolder) { surfaceReady = false; stopBg() }
        })
        web = WebView(this).apply {
            setBackgroundColor(0)                       // see-through where the page is, so the video shows underneath
            settings.javaScriptEnabled = true
            settings.allowFileAccess = true
            settings.domStorageEnabled = true
            @Suppress("DEPRECATION")
            settings.allowFileAccessFromFileURLs = true   // lets WebGL use the theme's own wallpaper files as textures   // Customize choices are kept in localStorage
            settings.mediaPlaybackRequiresUserGesture = false
            addJavascriptInterface(Bridge(), "TVBridge")
            loadUrl("file:///android_asset/index.html")
        }
        setContentView(FrameLayout(this).apply {
            setBackgroundColor(0xFF000000.toInt())
            addView(surface, FrameLayout.LayoutParams(-1, -1))
            addView(web, FrameLayout.LayoutParams(-1, -1))
        })
        hideBars()
        if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED)
            requestPermissions(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION), 1)
    }

    // Apps enabled, disabled, installed or removed while we were away: rebuild the rows.
    // free the video decoder for the app being opened; the background clip comes back with Home
    private fun startBg() {
        val path = bgPath ?: return
        if (!surfaceReady || player != null) return
        try {
            val fd = assets.openFd(path)
            player = MediaPlayer().apply {
                setDataSource(fd.fileDescriptor, fd.startOffset, fd.length); fd.close()
                setDisplay(surface.holder)
                isLooping = true
                setVolume(0f, 0f)
                setOnPreparedListener { it.start() }
                setOnInfoListener { _, what, _ ->
                    if (what == MediaPlayer.MEDIA_INFO_VIDEO_RENDERING_START) web.evaluateJavascript("window.tvBgPlaying && tvBgPlaying()", null)
                    false
                }
                prepareAsync()
            }
        } catch (e: Exception) { android.util.Log.e("TvLauncher", "background video", e); player = null }
    }
    private fun stopBg() { player?.release(); player = null }

    override fun onPause() {
        super.onPause()
        stopBg()
        web.evaluateJavascript("window.tvPause && tvPause()", null)
    }

    override fun onResume() {
        super.onResume()
        web.evaluateJavascript("window.tvResume && tvResume()", null)
        startBg()
        if (shownApps != null && shownApps != appList().joinToString { it.activityInfo.packageName }) web.reload()
    }

    @Volatile private var shownApps: String? = null

    // Launchable, enabled apps only (queryIntentActivities skips disabled packages), one entry per package.
    private fun appList(): List<android.content.pm.ResolveInfo> {
        val pm = packageManager
        fun query(cat: String) = pm.queryIntentActivities(Intent(Intent.ACTION_MAIN).addCategory(cat), 0)
        val seen = HashSet<String>()
        return (query(Intent.CATEGORY_LEANBACK_LAUNCHER) + query(Intent.CATEGORY_LAUNCHER)).filter {
            val pkg = it.activityInfo.packageName
            pkg != packageName && pkg !in hiddenPkgs && seen.add(pkg)
        }
    }

    // Launcher entries that aren't apps you'd open: Bluetooth pairing screens, and the built-in
    // YouTube Music stub that only redirects to YouTube on this TV.
    private val hiddenPkgs = setOf("com.mediatek.wwtv.setupwizard", "com.google.android.youtube.tvmusic")

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) hideBars()
    }

    @Suppress("DEPRECATION")
    private fun hideBars() {
        window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_FULLSCREEN or
            View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
            View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
    }

    // Holding OK on the remote: Android may not pass the repeats on to the page, so the hold is timed here
    // and the page is told once it has lasted ~2 s (it then picks the app up to move it).
    private var okDownAt = 0L
    private var okHoldSent = false
    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        val k = event.keyCode
        if (k == KeyEvent.KEYCODE_DPAD_CENTER || k == KeyEvent.KEYCODE_ENTER || k == KeyEvent.KEYCODE_NUMPAD_ENTER) {
            android.util.Log.d("TvLauncherKeys", "ok action=${event.action} repeat=${event.repeatCount} held=${event.eventTime - event.downTime}ms")
            if (event.action == KeyEvent.ACTION_DOWN) {
                if (event.repeatCount == 0 && okDownAt == 0L) { okDownAt = event.downTime; okHoldSent = false }
                if (!okHoldSent && okDownAt != 0L && event.eventTime - okDownAt >= 1800) {
                    okHoldSent = true
                    web.evaluateJavascript("window.tvHold && tvHold()", null)
                }
            } else if (event.action == KeyEvent.ACTION_UP) okDownAt = 0L
        }
        return super.dispatchKeyEvent(event)
    }

    // A launcher must not exit on Back; Back deselects instead (Itachi sheathes his sword).
    @Deprecated("Deprecated in Java")
    override fun onBackPressed() { web.evaluateJavascript("window.tvBack && tvBack()", null) }

    inner class Bridge {
        @JavascriptInterface
        fun getApps(): String {
            val pm = packageManager
            val list = appList()
            shownApps = list.joinToString { it.activityInfo.packageName }
            val out = JSONArray()
            for (ri in list) {
                out.put(JSONObject()
                    .put("label", ri.loadLabel(pm).toString())
                    .put("pkg", ri.activityInfo.packageName)
                    .put("icon", "data:image/png;base64," + toPng(ri.loadIcon(pm))))
            }
            return out.toString()
        }

        @JavascriptInterface
        fun launch(pkg: String) {
            val pm = packageManager
            val i = pm.getLeanbackLaunchIntentForPackage(pkg) ?: pm.getLaunchIntentForPackage(pkg) ?: return
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            runOnUiThread { startActivity(i) }
        }

        @JavascriptInterface
        fun openSettings() {
            runOnUiThread { startActivity(Intent(Settings.ACTION_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) }
        }

        @JavascriptInterface
        fun wifiState(): String {
            val wm = applicationContext.getSystemService(WIFI_SERVICE) as WifiManager
            val cm = getSystemService(CONNECTIVITY_SERVICE) as ConnectivityManager
            val caps = cm.getNetworkCapabilities(cm.activeNetwork)
            val connected = caps?.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) == true
            // Android only reveals the network name to apps holding the location permission (granted on first start).
            @Suppress("DEPRECATION")
            val ssid = wm.connectionInfo?.ssid?.trim('"')?.takeIf { connected && it != "<unknown ssid>" } ?: ""
            return JSONObject().put("enabled", wm.isWifiEnabled).put("connected", connected).put("ssid", ssid).toString()
        }

        // The TV's own input picker (HDMI 1/2/3, AV, TV ...), not a jump to the last-used input.
        @JavascriptInterface
        fun openInputs() {
            runOnUiThread {
                try { startActivity(Intent("com.android.tv.action.VIEW_INPUTS").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) }
                catch (e: Exception) { packageManager.getLaunchIntentForPackage("com.mediatek.wwtv.tvcenter")?.let { startActivity(it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) } }
            }
        }

        // time since the TV booted, so the page can go easy on effects while Android is still starting up
        // the page names its theme's clip (an asset path); "" stops it
        @JavascriptInterface
        fun playBg(path: String) {
            runOnUiThread { stopBg(); bgPath = path.ifEmpty { null }; startBg() }
        }

        @JavascriptInterface
        fun uptimeMs(): Long = android.os.SystemClock.elapsedRealtime()

        // Page-side reloads don't work for this asset page, so theme switches reload from here.
        @JavascriptInterface
        fun reload() { runOnUiThread { web.reload() } }

        @JavascriptInterface
        fun openWifi() {
            runOnUiThread { startActivity(Intent(Settings.ACTION_WIFI_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) }
        }
    }

    private fun toPng(d: android.graphics.drawable.Drawable): String {
        val bmp = Bitmap.createBitmap(192, 192, Bitmap.Config.ARGB_8888)
        d.setBounds(0, 0, 192, 192); d.draw(Canvas(bmp))
        val bo = ByteArrayOutputStream(); bmp.compress(Bitmap.CompressFormat.PNG, 100, bo)
        return Base64.encodeToString(bo.toByteArray(), Base64.NO_WRAP)
    }
}
