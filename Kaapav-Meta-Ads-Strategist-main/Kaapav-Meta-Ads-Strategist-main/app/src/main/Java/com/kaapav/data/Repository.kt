package com.kaapav.data

import com.kaapav.data.api.RetrofitClient
import com.kaapav.data.models.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class Repository {
    private val api = RetrofitClient.api

    private val fallbackCampaigns = listOf(
        Campaign("C001","Sari Sensation - Diwali Sale","Active",50000.0,750000,15000,250000.0,100),
        Campaign("C002","Kurti Karnival - Festive Deals","Active",75000.0,1200000,18000,450000.0,180),
        Campaign("C003","Jewellery Junction - Wedding Season","Paused",25000.0,300000,4500,80000.0,32),
    )
    private val fallbackLeads = listOf(
        Lead("L001","Priya Sharma","98XXXXXX01","New Lead", listOf(ChatMessage("lead","Is this available in red?", System.currentTimeMillis()-3600000)), System.currentTimeMillis()-3600000),
        Lead("L002","Anjali Verma","98XXXXXX02","Contacted", listOf(ChatMessage("lead","What is the price?", System.currentTimeMillis()-7200000)), System.currentTimeMillis()-7200000)
    )
    private val fallbackAudit = listOf(
        AuditLog("A001", System.currentTimeMillis()-3600000,"System","New WhatsApp Lead","Lead Priya Sharma created."),
        AuditLog("A002", System.currentTimeMillis()-7200000,"AI Autopilot","Campaign Paused","Campaign Jewellery Junction paused due to low ROAS.")
    )

    suspend fun fetchAll(): Triple<List<Campaign>, List<Lead>, List<AuditLog>> = withContext(Dispatchers.IO) {
        try {
            val campaignsResp = api.getCampaigns()
            val crmResp = api.getCRMData()
            if (campaignsResp.isSuccessful && crmResp.isSuccessful) {
                val camps = campaignsResp.body() ?: fallbackCampaigns
                val crm = crmResp.body()
                val leads = crm?.leads ?: fallbackLeads
                val audits = crm?.auditLogs ?: fallbackAudit
                Triple(camps, leads, audits)
            } else {
                Triple(fallbackCampaigns, fallbackLeads, fallbackAudit)
            }
        } catch (e: Exception) {
            Triple(fallbackCampaigns, fallbackLeads, fallbackAudit)
        }
    }

    suspend fun generateCopy(prompt: String): String = withContext(Dispatchers.IO) {
        try {
            val resp = api.generate(mapOf("prompt" to prompt))
            if (resp.isSuccessful) resp.body()?.text ?: "AI returned empty"
            else "AI failed: ${resp.code()}"
        } catch (e: Exception) {
            "AI error: ${e.localizedMessage}"
        }
    }
}
