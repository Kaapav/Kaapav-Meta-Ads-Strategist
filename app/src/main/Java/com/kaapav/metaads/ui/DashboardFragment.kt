package com.kaapav.metaads.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.kaapav.metaads.R
import com.kaapav.metaads.ui.adapters.CreativeAdapter
import com.kaapav.metaads.ui.adapters.StatAdapter
import com.kaapav.metaads.ui.models.Creative
import com.kaapav.metaads.ui.models.Stat
import com.kaapav.metaads.repo.DashboardRepository
import kotlinx.coroutines.launch

class DashboardFragment : Fragment() {

    private lateinit var rvStats: RecyclerView
    private lateinit var rvCreatives: RecyclerView
    private lateinit var btnSync: Button
    private lateinit var btnBoost: Button
    private lateinit var btnPause: Button
    private lateinit var btnMutate: Button

    private val repo = DashboardRepository()

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        val view = inflater.inflate(R.layout.fragment_dashboard, container, false)
        rvStats = view.findViewById(R.id.rvStats)
        rvCreatives = view.findViewById(R.id.rvCreatives)
        btnSync = view.findViewById(R.id.btnSync)
        btnBoost = view.findViewById(R.id.btnBoost)
        btnPause = view.findViewById(R.id.btnPause)
        btnMutate = view.findViewById(R.id.btnMutate)

        // initial UI with placeholders
        setupStatsPlaceholder()
        setupCreativesPlaceholder()
        setupActions()

        // load live data
        loadLiveData()

        return view
    }

    private fun setupStatsPlaceholder() {
        val stats = listOf(
            Stat("ROAS", "—", "—"),
            Stat("CTR", "—", "—"),
            Stat("CPA", "—", "—"),
            Stat("Spend (24h)", "—", "—")
        )
        val adapter = StatAdapter(stats)
        rvStats.layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
        rvStats.adapter = adapter
    }

    private fun setupCreativesPlaceholder() {
        val creatives = listOf(
            Creative("Loading...", "—", "—", "—", ""),
            Creative("Loading...", "—", "—", "—", "")
        )
        val adapter = CreativeAdapter(creatives)
        rvCreatives.layoutManager = LinearLayoutManager(requireContext())
        rvCreatives.adapter = adapter
    }

    private fun loadLiveData() {
        lifecycleScope.launch {
            try {
                btnSync.isEnabled = false
                val resp = repo.fetchCampaigns()
                if (resp.isSuccessful) {
                    val list = resp.body() ?: emptyList()
                    // Map to UI models
                    val creatives = list.map { insight ->
                        val roas = if (insight.spend != null && insight.spend > 0.0 && insight.purchase_value != null) {
                            String.format("%.2fx", (insight.purchase_value / insight.spend))
                        } else "—"
                        val stats = "Impr ${insight.impressions ?: 0} • Clicks ${insight.clicks ?: 0}"
                        Creative(
                            title = insight.name ?: "Unnamed",
                            meta = "id: ${insight.id ?: "-"}",
                            roas = "ROAS $roas",
                            stats = stats,
                            imageUrl = ""
                        )
                    }
                    rvCreatives.adapter = CreativeAdapter(creatives)
                    // update basic stats (quick aggregation)
                    val totalSpend = list.sumOf { it.spend ?: 0.0 }
                    val totalValue = list.sumOf { it.purchase_value ?: 0.0 }
                    val roas = if (totalSpend > 0.0) String.format("%.2fx", totalValue / totalSpend) else "—"
                    val ctr = computeCTR(list)
                    val statsList = listOf(
                        Stat("ROAS", roas, "—"),
                        Stat("CTR", ctr, "—"),
                        Stat("CPA", "—", "—"),
                        Stat("Spend (24h)", "₹${totalSpend.toInt()}", "—")
                    )
                    rvStats.adapter = StatAdapter(statsList)
                } else {
                    Toast.makeText(requireContext(), "API error: ${resp.code()}", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                e.printStackTrace()
                Toast.makeText(requireContext(), "Network error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                btnSync.isEnabled = true
            }
        }
    }

    private fun computeCTR(list: List<com.kaapav.metaads.network.CreativeInsight>): String {
        val impressions = list.sumOf { it.impressions ?: 0L }
        val clicks = list.sumOf { it.clicks ?: 0L }
        return if (impressions > 0) String.format("%.2f%%", (clicks.toDouble() / impressions.toDouble()) * 100.0) else "—"
    }

    private fun setupActions() {
        btnSync.setOnClickListener {
            loadLiveData()
        }
        btnBoost.setOnClickListener {
            // TODO: call API to boost winner (n8n / server)
            Toast.makeText(requireContext(), "Boost action triggered (TODO)", Toast.LENGTH_SHORT).show()
        }
        btnPause.setOnClickListener {
            // TODO: call API to pause fatigued creatives
            Toast.makeText(requireContext(), "Pause action triggered (TODO)", Toast.LENGTH_SHORT).show()
        }
        btnMutate.setOnClickListener {
            // TODO: call AI endpoint to mutate top creative
            Toast.makeText(requireContext(), "Mutate action triggered (TODO)", Toast.LENGTH_SHORT).show()
        }
    }
}
