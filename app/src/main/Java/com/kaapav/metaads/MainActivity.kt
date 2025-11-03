package com.kaapav.metaads

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.kaapav.metaads.ui.DashboardFragment

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        // apply theme first (if you have splash or theme logic)
        setTheme(R.style.Theme_Kaapav)
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Only add fragment if not already present (handles rotation)
        if (supportFragmentManager.findFragmentById(R.id.container) == null) {
            supportFragmentManager.beginTransaction()
                .replace(R.id.container, DashboardFragment.newInstance())
                .commit()
        }
    }
}
