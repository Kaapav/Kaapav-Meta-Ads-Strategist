package com.kaapav

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import androidx.fragment.app.Fragment

class SettingsFragment : Fragment() {
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        val v = inflater.inflate(R.layout.fragment_settings, container, false)
        val metaBtn = v.findViewById<Button>(R.id.btn_meta_conn)
        metaBtn.setOnClickListener {
            metaBtn.text = if (metaBtn.text == "Connect") "Disconnect" else "Connect"
        }
        return v
    }
}
