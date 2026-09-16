package app.xservis.xfreedom.net

import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

class NativeApi(private val base: String, private val token: String) {
    fun config(): JSONObject {
        val c = open("GET", "/api/native/config")
        return JSONObject(c.inputStream.bufferedReader().readText())
    }

    fun stage(
        sessionId: String?,
        stage: String,
        handshakeMs: Long? = null,
        internetOk: Boolean = false,
        lastError: String? = null,
        transport: String? = "TLS13_SNI",
        sni: String? = null,
        endpoint: String? = null,
    ): JSONObject {
        val body = JSONObject()
        if (sessionId != null) body.put("sessionId", sessionId)
        body.put("stage", stage)
        body.put("transport", transport)
        if (handshakeMs != null) body.put("handshakeMs", handshakeMs)
        body.put("internetOk", internetOk)
        if (lastError != null) body.put("lastError", lastError)
        if (sni != null) body.put("sni", sni)
        if (endpoint != null) body.put("endpoint", endpoint)
        val c = open("POST", "/api/native/stage")
        c.doOutput = true
        c.setRequestProperty("content-type", "application/json")
        OutputStreamWriter(c.outputStream).use { it.write(body.toString()) }
        return JSONObject(c.inputStream.bufferedReader().readText())
    }

    private fun open(method: String, path: String): HttpURLConnection {
        val c = URL(base.trimEnd('/') + path).openConnection() as HttpURLConnection
        c.requestMethod = method
        c.connectTimeout = 4000
        c.readTimeout = 8000
        if (token.isNotBlank()) c.setRequestProperty("authorization", "Bearer $token")
        return c
    }
}
