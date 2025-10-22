package com.kaapav.data.models

data class Campaign(
    val id: String,
    val name: String,
    val status: String,
    val spend: Double,
    val impressions: Long,
    val clicks: Long,
    val purchase_value: Double,
    val actions: Int,
) {
    val roas: Double get() = if (spend > 0) purchase_value / spend else 0.0
    val ctr: Double get() = if (impressions > 0) (clicks.toDouble() / impressions) * 100 else 0.0
    val cpa: Double get() = if (actions > 0) spend / actions else 0.0
}

data class Lead(
    val id: String,
    val name: String,
    val phone: String,
    val status: String,
    val chatHistory: List<ChatMessage>,
    val timestamp: Long
)

data class ChatMessage(val sender: String, val text: String, val timestamp: Long)

data class AuditLog(val id: String, val timestamp: Long, val user: String, val action: String, val details: String)

data class AiResponse(val text: String)
