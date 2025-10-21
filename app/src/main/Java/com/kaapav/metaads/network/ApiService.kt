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
    @GET("api/insights/campaign")
    suspend fun getCampaignInsights(): Response<CampaignsResponse>
}
