package com.kaapav.data.api

import com.kaapav.data.models.AiResponse
import com.kaapav.data.models.Campaign
import com.kaapav.data.models.Lead
import com.kaapav.data.models.AuditLog
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface ApiService {
    @GET("/api/insights/campaign")
    suspend fun getCampaigns(): Response<List<Campaign>>

    @GET("/api/crm/crm-data")
    suspend fun getCRMData(): Response<CRMWrapper>

    @POST("/api/ai/generate")
    suspend fun generate(@Body payload: Map<String,String>): Response<AiResponse>
}

data class CRMWrapper(val leads: List<Lead>, val auditLogs: List<AuditLog>)
