/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package mozilla.components.feature.pwa

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.SystemClock
import androidx.annotation.VisibleForTesting
import androidx.annotation.VisibleForTesting.PRIVATE
import androidx.appcompat.app.AppCompatActivity
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import mozilla.components.concept.engine.manifest.WebAppManifest
import mozilla.components.feature.pwa.intent.WebAppIntentProcessor.Companion.ACTION_VIEW_PWA
import mozilla.components.support.base.log.logger.Logger

/**
 * This activity is launched by Web App shortcuts on the home screen.
 *
 * Based on the Web App Manifest (display) it will decide whether the app is launched in the browser or in a
 * standalone activity.
 */
class WebAppLauncherActivity : AppCompatActivity() {

    private val scope = MainScope()
    private val logger = Logger("WebAppLauncherActivity")
    private lateinit var storage: ManifestStorage

    private var backgroundStartTime: Long = 0L

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        storage = ManifestStorage(this)

        if (savedInstanceState == null) {
            setBackgroundStartTime(0L) // reset
        }

        val startUrl = intent.data ?: return finish()

        scope.launch {
            val manifest = loadManifest(startUrl.toString())
            routeManifest(startUrl, manifest)

            finish()
        }
    }

    override fun onResume() {
        super.onResume()

        val backgroundEndTime = SystemClock.elapsedRealtimeNanos()
        emitBackgroundTimingFact(backgroundEndTime - backgroundStartTime)

        setBackgroundStartTime(0L) // reset
    }

    override fun onPause() {
        super.onPause()
        setBackgroundStartTime(SystemClock.elapsedRealtimeNanos())
    }

    override fun onDestroy() {
        super.onDestroy()
        scope.cancel()
    }

    @VisibleForTesting(otherwise = PRIVATE)
    internal fun setBackgroundStartTime(timeNs: Long) {
        backgroundStartTime = timeNs
        val bundle = Bundle()
        bundle.putLong("backgroundStartTime", backgroundStartTime)

        onSaveInstanceState(bundle)
    }

    @VisibleForTesting(otherwise = PRIVATE)
    internal fun routeManifest(startUrl: Uri, manifest: WebAppManifest?) {
        when (manifest?.display) {
            WebAppManifest.DisplayMode.FULLSCREEN,
            WebAppManifest.DisplayMode.STANDALONE,
            WebAppManifest.DisplayMode.MINIMAL_UI -> launchWebAppShell(startUrl)

            // If no manifest is saved for this site, just open the browser.
            WebAppManifest.DisplayMode.BROWSER, null -> launchBrowser(startUrl)
        }
    }

    @VisibleForTesting(otherwise = PRIVATE)
    internal fun launchBrowser(startUrl: Uri) {
        val intent = Intent(Intent.ACTION_VIEW, startUrl).apply {
            addCategory(SHORTCUT_CATEGORY)
            `package` = packageName
        }

        try {
            startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            logger.error("Package does not handle VIEW intent. Can't launch browser.")
        }
    }

    @VisibleForTesting(otherwise = PRIVATE)
    internal fun launchWebAppShell(startUrl: Uri) {
        val intent = Intent(ACTION_VIEW_PWA, startUrl).apply {
            `package` = packageName
        }

        try {
            startActivity(intent)
            emitHomescreenIconTapFact()
        } catch (e: ActivityNotFoundException) {
            logger.error("Packages does not handle ACTION_VIEW_PWA intent. Can't launch as web app.", e)
            // Fall back to normal browser
            launchBrowser(startUrl)
        }
    }

    @VisibleForTesting(otherwise = PRIVATE)
    internal suspend fun loadManifest(startUrl: String): WebAppManifest? {
        return storage.loadManifest(startUrl)
    }

    companion object {
        internal const val ACTION_PWA_LAUNCHER = "mozilla.components.feature.pwa.PWA_LAUNCHER"
    }
}
