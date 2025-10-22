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

class CRMFragment : Fragment() {
    private val vm: MainViewModel by activityViewModels()
    private val scope = MainScope()
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        val v = inflater.inflate(R.layout.fragment_crm, container, false)
        val leadsContainer = v.findViewById<LinearLayout>(R.id.leads_container)
        scope.launch {
            vm.leads.collectLatest { leads ->
                leadsContainer.removeAllViews()
                leads.forEach { lead ->
                    val card = layoutInflater.inflate(R.layout._item_lead_card, leadsContainer, false)
                    card.findViewById<TextView>(R.id.lead_name).text = lead.name
                    card.findViewById<TextView>(R.id.lead_phone).text = lead.phone
                    leadsContainer.addView(card)
                }
            }
        }
        return v
    }
}
