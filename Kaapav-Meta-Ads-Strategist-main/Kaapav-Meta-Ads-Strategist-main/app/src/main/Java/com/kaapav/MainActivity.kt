package com.kaapav

import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.kaapav.ui.MainViewModel

class MainActivity : AppCompatActivity() {
    private val vm: MainViewModel by viewModels()
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setTheme(R.style.Theme_Kaapav)
        setContentView(R.layout.activity_main)

        val bottom = findViewById<BottomNavigationView>(R.id.bottom_nav)
        bottom.setOnItemSelectedListener {
            when (it.itemId) {
                R.id.nav_dashboard -> open(DashboardFragment())
                R.id.nav_campaigns -> open(CampaignsFragment())
                R.id.nav_crm -> open(CRMFragment())
                R.id.nav_growth -> open(GrowthFragment())
                R.id.nav_audit -> open(AuditFragment())
                R.id.nav_settings -> open(SettingsFragment())
            }
            true
        }

        if (savedInstanceState == null) {
            bottom.selectedItemId = R.id.nav_dashboard
        }

        // initial fetch
        vm.refreshAll()
    }

    private fun open(frag: androidx.fragment.app.Fragment) {
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, frag)
            .commit()
    }
}
