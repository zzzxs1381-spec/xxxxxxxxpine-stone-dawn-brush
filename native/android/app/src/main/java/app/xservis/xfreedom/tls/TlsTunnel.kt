package app.xservis.xfreedom.tls

import android.net.VpnService
import java.io.DataInputStream
import java.io.DataOutputStream
import java.net.InetSocketAddress
import java.nio.ByteBuffer
import java.security.MessageDigest
import javax.net.ssl.SNIHostName
import javax.net.ssl.SSLContext
import javax.net.ssl.SSLSocket
import javax.net.ssl.SSLEngine
import javax.net.ssl.TrustManager
import javax.net.ssl.X509TrustManager
import java.security.cert.X509Certificate

/**
 * xf-tls1: TLS 1.3 + SNI + SHA-256 pin + AUTH + framed OPEN/DATA/CLOSE.
 * Not TLS Tunnel (com.tlsvpn). Pin replaces public CA.
 */
class TlsTunnel(
    private val vpn: VpnService,
    private val host: String,
    private val port: Int,
    private val sni: String,
    private val pinSha256: String,
    private val token: String,
) {
    private var socket: SSLSocket? = null
    private var input: DataInputStream? = null
    private var output: DataOutputStream? = null
    @Volatile var handshakeMs: Long = 0
        private set

    fun connect() {
        val t0 = System.currentTimeMillis()
        val ctx = SSLContext.getInstance("TLS")
        ctx.init(null, arrayOf<TrustManager>(pinTrust(pinSha256)), null)
        val raw = java.net.Socket()
        if (!vpn.protect(raw)) throw IllegalStateException("protect failed")
        raw.connect(InetSocketAddress(host, port), 5000)
        val sock = ctx.socketFactory.createSocket(raw, sni, port, true) as SSLSocket
        sock.enabledProtocols = arrayOf("TLSv1.3")
        val p = sock.sslParameters
        p.serverNames = listOf(SNIHostName(sni))
        p.applicationProtocols = arrayOf("xf-tls1")
        sock.sslParameters = p
        sock.startHandshake()
        handshakeMs = System.currentTimeMillis() - t0
        val out = DataOutputStream(sock.outputStream)
        val inp = DataInputStream(sock.inputStream)
        out.writeBytes("AUTH $token\n")
        out.flush()
        val line = readLine(inp)
        if (!line.startsWith("OK ")) {
            sock.close()
            throw IllegalStateException("auth failed")
        }
        socket = sock
        input = inp
        output = out
    }

    @Synchronized
    fun send(type: Int, payload: ByteArray) {
        val out = output ?: throw IllegalStateException("down")
        out.writeInt(1 + payload.size)
        out.writeByte(type)
        out.write(payload)
        out.flush()
    }

    fun readFrame(): Pair<Int, ByteArray>? {
        val inp = input ?: return null
        val len = inp.readInt()
        if (len < 1 || len > 1_000_000) throw IllegalStateException("bad frame")
        val type = inp.readUnsignedByte()
        val payload = ByteArray(len - 1)
        inp.readFully(payload)
        return type to payload
    }

    fun close() {
        try { socket?.close() } catch (_: Exception) {}
        socket = null
        input = null
        output = null
    }

    companion object {
        const val OPEN = 1
        const val OPEN_OK = 2
        const val OPEN_ERR = 3
        const val DATA = 4
        const val CLOSE = 5
        const val PING = 6
        const val PONG = 7

        fun openPayload(id: Int, host: String, port: Int): ByteArray {
            val h = host.toByteArray(Charsets.UTF_8)
            val buf = ByteBuffer.allocate(8 + h.size)
            buf.putInt(id)
            buf.putShort(port.toShort())
            buf.putShort(h.size.toShort())
            buf.put(h)
            return buf.array()
        }

        fun idPayload(id: Int, extra: ByteArray = ByteArray(0)): ByteArray {
            val buf = ByteBuffer.allocate(4 + extra.size)
            buf.putInt(id)
            buf.put(extra)
            return buf.array()
        }

        private fun readLine(inp: DataInputStream): String {
            val sb = StringBuilder()
            while (true) {
                val c = inp.read()
                if (c < 0 || c == '\n'.code) break
                if (c != '\r'.code) sb.append(c.toChar())
            }
            return sb.toString()
        }

        private fun pinTrust(pinHex: String) = object : X509TrustManager {
            override fun checkClientTrusted(chain: Array<X509Certificate>, authType: String) {}
            override fun checkServerTrusted(chain: Array<X509Certificate>, authType: String) {
                val leaf = chain.firstOrNull() ?: throw SecurityException("no cert")
                val got = MessageDigest.getInstance("SHA-256").digest(leaf.encoded)
                    .joinToString("") { b -> "%02x".format(b) }
                if (!got.equals(pinHex, ignoreCase = true)) throw SecurityException("pin mismatch")
            }
            override fun getAcceptedIssuers(): Array<X509Certificate> = emptyArray()
        }
    }
}
