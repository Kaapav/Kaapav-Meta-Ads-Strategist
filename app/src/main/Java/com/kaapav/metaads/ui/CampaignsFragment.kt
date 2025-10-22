package com.kaapav

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import com.kaapav.ui.MainViewModel
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

class CampaignsFragment : Fragment() {
    private val vm: MainViewModel by activityViewModels()
    private val scope = MainScope()
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        val v = inflater.inflate(R.layout.fragment_campaigns, container, false)
        val containerLayout = v.findViewById<LinearLayout>(R.id.campaigns_container)
        scope.launch {
            vm.campaigns.collectLatest { camps ->
                containerLayout.removeAllViews()
                camps.forEach { c ->
                    val card = layoutInflater.inflate(R.layout._item_campaign_card, containerLayout, false)
                    card.findViewById<TextView>(R.id.campaign_name).text = c.name
                    card.findViewById<TextView>(R.id.campaign_status).text = c.status
                    card.findViewById<TextView>(R.id.campaign_spend).text = "₹${c.spend.toInt()}"
                    card.findViewById<TextView>(R.id.campaign_rev).text = "₹${c.purchase_value.toInt()}"
                    card.findViewById<TextView>(R.id.campaign_roas).text = String.format("%.2f", c.roas)
                    containerLayout.addView(card)
                }
            }
        }
        return v
    }
}
