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

class AuditFragment : Fragment() {
    private val vm: MainViewModel by activityViewModels()
    private val scope = MainScope()
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        val v = inflater.inflate(R.layout.fragment_audit, container, false)
        val containerLayout = v.findViewById<LinearLayout>(R.id.audit_container)
        scope.launch {
            vm.audit.collectLatest { logs ->
                containerLayout.removeAllViews()
                logs.forEach { log ->
                    val item = layoutInflater.inflate(R.layout._item_audit_card, containerLayout, false)
                    item.findViewById<TextView>(R.id.audit_action).text = log.action
                    item.findViewById<TextView>(R.id.audit_details).text = log.details
                    containerLayout.addView(item)
                }
            }
        }
        return v
    }
}
