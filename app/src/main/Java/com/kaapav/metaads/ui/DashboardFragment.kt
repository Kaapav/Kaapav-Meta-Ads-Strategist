
package com.kaapav.metaads.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.kaapav.metaads.R
import com.kaapav.metaads.ui.adapters.CreativeAdapter
import com.kaapav.metaads.ui.adapters.StatAdapter
import com.kaapav.metaads.ui.models.Creative
import com.kaapav.metaads.ui.models.Stat

class DashboardFragment : Fragment() {

    private lateinit var rvStats: RecyclerView
    private lateinit var rvCreatives: RecyclerView
    private lateinit var btnSync: Button
    private lateinit var btnBoost: Button
    private lateinit var btnPause: Button
    private lateinit var btnMutate: Button

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        val view = inflater.inflate(R.layout.fragment_dashboard, container, false)
        rvStats = view.findViewById(R.id.rvStats)
        rvCreatives = view.findViewById(R.id.rvCreatives)
        btnSync = view.findViewById(R.id.btnSync)
        btnBoost = view.findViewById(R.id.btnBoost)
        btnPause = view.findViewById(R.id.btnPause)
        btnMutate = view.findViewById(R.id.btnMutate)

        setupStats()
        setupCreatives()
        setupActions()
        return view
    }

    private fun setupStats() {
        val stats = listOf(
            Stat("ROAS", "3.8x", "+24%"),
            Stat("CTR", "5.2%", "+14%"),
            Stat("CPA", "₹72", "-18%"),
            Stat("Spend (24h)", "₹12,450", "+6%")
        )
        val adapter = StatAdapter(stats)
        rvStats.layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
        rvStats.adapter = adapter
    }

    private fun setupCreatives() {
        val creatives = listOf(
            Creative("Elegant Layered Necklace", "Adset: All-Females • INR 499", "ROAS 4.2x", "CTR 5.8% • CPA ₹62", ""),
            Creative("Minimal Gold Hoops", "Adset: Newbies • INR 399", "ROAS 3.6x", "CTR 4.2% • CPA ₹78", ""),
            Creative("Pearl Charm Bracelet", "Adset: Gifting • INR 799", "ROAS 2.9x", "CTR 3.1% • CPA ₹120", "")
        )
        val adapter = CreativeAdapter(creatives)
        rvCreatives.layoutManager = LinearLayoutManager(requireContext())
        rvCreatives.adapter = adapter
    }

    private fun setupActions() {
        btnSync.setOnClickListener {
            // simple-sync indicator (replace with real API call)
            btnSync.isEnabled = false
            btnSync.postDelayed({
                btnSync.isEnabled = true
            }, 1200)
        }

        btnBoost.setOnClickListener {
            // TODO: call API to boost winner (n8n / server)
        }
        btnPause.setOnClickListener {
            // TODO: call API to pause fatigued creatives
        }
        btnMutate.setOnClickListener {
            // TODO: call AI endpoint to mutate top creative
        }
    }
}
