package com.kaapav.metaads.repo

import com.kaapav.metaads.network.ApiClient
import com.kaapav.metaads.network.ApiService
import com.kaapav.metaads.network.CampaignsResponse
import retrofit2.Response

class DashboardRepository {
    private val api = ApiClient.createService<ApiService>()

    suspend fun fetchCampaigns(): Response<CampaignsResponse> {
        return api.getCampaignInsights()
    }
}
