package com.kaapav.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kaapav.data.Repository
import com.kaapav.data.models.AuditLog
import com.kaapav.data.models.Campaign
import com.kaapav.data.models.Lead
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class MainViewModel: ViewModel() {
    private val repo = Repository()

    private val _campaigns = MutableStateFlow<List<Campaign>>(emptyList())
    val campaigns: StateFlow<List<Campaign>> = _campaigns

    private val _leads = MutableStateFlow<List<Lead>>(emptyList())
    val leads: StateFlow<List<Lead>> = _leads

    private val _audit = MutableStateFlow<List<AuditLog>>(emptyList())
    val audit: StateFlow<List<AuditLog>> = _audit

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading

    private val _aiText = MutableStateFlow<String>("")
    val aiText: StateFlow<String> = _aiText

    fun refreshAll() {
        viewModelScope.launch {
            _loading.value = true
            val (camps, leads, audits) = repo.fetchAll()
            _campaigns.value = camps
            _leads.value = leads
            _audit.value = audits
            _loading.value = false
        }
    }

    fun generateAi(prompt: String) {
        viewModelScope.launch {
            _loading.value = true
            val res = repo.generateCopy(prompt)
            _aiText.value = res
            _loading.value = false
        }
    }
}
