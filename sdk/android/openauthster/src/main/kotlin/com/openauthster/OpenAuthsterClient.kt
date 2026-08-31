package com.openauthster

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Base64
import androidx.browser.customtabs.CustomTabsIntent
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import org.json.JSONObject
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.concurrent.TimeUnit

data class OpenAuthsterConfig(
	val issuer: Uri,
	val clientId: String,
	val redirectUri: Uri,
)

class OpenAuthsterClient(
	context: Context,
	private val config: OpenAuthsterConfig,
) {
	private val prefs =
		EncryptedSharedPreferences.create(
			context,
			"openauthster.${config.clientId}",
			MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),
			EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
			EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
		)

	val isAuthenticated: Boolean
		get() = !prefs.getString(KEY_ACCESS, null).isNullOrEmpty()

	fun accessToken(): String? = prefs.getString(KEY_ACCESS, null)

	fun loginIntent(provider: String? = null): Pair<Intent, String> {
		val verifier = randomUrlSafe(32)
		val challenge = sha256Base64Url(verifier)
		val authorize =
			config.issuer
				.buildUpon()
				.appendPath("authorize")
				.appendQueryParameter("client_id", config.clientId)
				.appendQueryParameter("redirect_uri", config.redirectUri.toString())
				.appendQueryParameter("response_type", "code")
				.appendQueryParameter("code_challenge", challenge)
				.appendQueryParameter("code_challenge_method", "S256")
				.appendQueryParameter("state", randomUrlSafe(16))
				.apply { if (provider != null) appendQueryParameter("provider", provider) }
				.build()
		prefs.edit().putString(KEY_VERIFIER, verifier).apply()
		return CustomTabsIntent.Builder().build().intent.apply { data = authorize } to verifier
	}

	fun launchLogin(context: Context, provider: String? = null) {
		val (intent, _) = loginIntent(provider)
		CustomTabsIntent.Builder().build().launchUrl(context, intent.data!!)
	}

	fun handleCallback(uri: Uri) {
		val code = uri.getQueryParameter("code") ?: throw IllegalArgumentException("missing code")
		val verifier = prefs.getString(KEY_VERIFIER, null) ?: throw IllegalStateException("missing verifier")
		val body =
			listOf(
				"grant_type" to "authorization_code",
				"client_id" to config.clientId,
				"code" to code,
				"redirect_uri" to config.redirectUri.toString(),
				"code_verifier" to verifier,
			).joinToString("&") { "${it.first}=${Uri.encode(it.second)}" }
		val connection =
			java.net.URL(config.issuer.buildUpon().appendPath("token").build().toString())
				.openConnection() as java.net.HttpURLConnection
		connection.requestMethod = "POST"
		connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded")
		connection.doOutput = true
		connection.outputStream.use { it.write(body.toByteArray()) }
		val payload = connection.inputStream.bufferedReader().readText()
		val json = JSONObject(payload)
		prefs
			.edit()
			.putString(KEY_ACCESS, json.getString("access_token"))
			.putString(KEY_REFRESH, json.optString("refresh_token", null))
			.putLong(
				KEY_EXPIRES,
				System.currentTimeMillis() + TimeUnit.SECONDS.toMillis(json.optLong("expires_in", 3600)),
			).apply()
	}

	fun logout() {
		prefs.edit().clear().apply()
	}

	companion object {
		private const val KEY_ACCESS = "access"
		private const val KEY_REFRESH = "refresh"
		private const val KEY_EXPIRES = "expires"
		private const val KEY_VERIFIER = "verifier"

		private fun randomUrlSafe(bytes: Int): String {
			val buffer = ByteArray(bytes)
			SecureRandom().nextBytes(buffer)
			return Base64.encodeToString(buffer, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING)
		}

		private fun sha256Base64Url(value: String): String {
			val digest = MessageDigest.getInstance("SHA-256").digest(value.toByteArray())
			return Base64.encodeToString(digest, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING)
		}
	}
}
