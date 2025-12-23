package com.kaapav.metaads.ui.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.kaapav.metaads.R
import com.kaapav.metaads.ui.models.Stat

class StatAdapter(private val stats: List<Stat>) : RecyclerView.Adapter<StatAdapter.StatVH>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): StatVH {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.item_stat_card, parent, false)
        return StatVH(v)
    }

    override fun onBindViewHolder(holder: StatVH, position: Int) {
        holder.bind(stats[position])
    }

    override fun getItemCount(): Int = stats.size

    class StatVH(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvTitle: TextView = itemView.findViewById(R.id.tvStatTitle)
        private val tvValue: TextView = itemView.findViewById(R.id.tvStatValue)
        private val tvChange: TextView = itemView.findViewById(R.id.tvStatChange)

        fun bind(stat: Stat) {
            tvTitle.text = stat.title
            tvValue.text = stat.value
            tvChange.text = stat.change
        }
    }
}
