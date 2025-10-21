package com.kaapav.metaads.ui.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.kaapav.metaads.R
import com.kaapav.metaads.ui.models.Creative

class CreativeAdapter(private val items: List<Creative>) : RecyclerView.Adapter<CreativeAdapter.VH>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.item_creative_row, parent, false)
        return VH(v)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    class VH(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val img: ImageView = itemView.findViewById(R.id.imgCreative)
        private val title: TextView = itemView.findViewById(R.id.tvCreativeTitle)
        private val meta: TextView = itemView.findViewById(R.id.tvCreativeMeta)
        private val roas: TextView = itemView.findViewById(R.id.tvCreativeRoas)
        private val stats: TextView = itemView.findViewById(R.id.tvCreativeStats)

        fun bind(c: Creative) {
            title.text = c.title
            meta.text = c.meta
            roas.text = c.roas
            stats.text = c.stats
            // placeholder image - swap with your image loader (Glide/Picasso)
            img.setImageResource(android.R.drawable.ic_menu_gallery)
        }
    }
}
