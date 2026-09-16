package app.xservis.xfreedom.engine

enum class TunnelState {
    IDLE,
    PREPARING,
    DIAGNOSING,
    SELECTING_ROUTE,
    CONNECTING,
    HANDSHAKING,
    TUNNEL_UP,
    VERIFYING,
    CONNECTED,
    DEGRADED,
    FAILING_OVER,
    RECONNECTING,
    OFFLINE,
    ERROR,
}

object Truth {
    fun canShowConnected(interfaceUp: Boolean, dnsOk: Boolean, internetOk: Boolean, servicesOk: Boolean): Boolean {
        return interfaceUp && dnsOk && internetOk && servicesOk
    }
}
