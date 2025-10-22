package com.kaapav.metaads.network

import retrofit2.Response
import retrofit2.http.GET

// Minimal DTOs to map your backend response
data class CreativeInsight(
    val id: String?,
    val name: String?,
    val impressions: Long?,
    val clicks: Long?,
    val spend: Double?,
    val purchase_value: Double? = 0.0 // adapt to your backend shape
)

typealias CampaignsResponse = List<CreativeInsight>

interface ApiService {
@GET("api/meta/campaigns")
suspend fun getCampaignInsights(): Response<List<Map<String, Any?>>>


@GET("api/health")
suspend fun getHealth(): Response<Map<String, Any?>>


@GET("api/meta/status")
suspend fun getMetaStatus(): Response<Map<String, Any?>>


@GET("api/whatsapp/status")
suspend fun getWhatsappStatus(): Response<Map<String, Any?>>


@GET("/api/cache/status")
suspend fun getCacheStatus(): Response<Map<String, Any?>>
}
