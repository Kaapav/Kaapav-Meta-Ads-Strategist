
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import {
  ShieldCheck, Smartphone, BarChart2, Zap, Users, Bot, Settings as SettingsIcon, MessageSquare, Plus, Trash2, Send, X, Copy, Sun, Moon, Briefcase, FileText, CheckCircle, Clock, ChevronDown, CheckSquare, Square
} from 'lucide-react';

// --- MOCK DATABASE & API SERVICE ---
// This entire section simulates a full backend (database, APIs, workers) running inside the app.
// This is the "Jugaad" that makes our app fast, free, and 100% reliable in this environment.

const mockApiService = {
  // --- DATABASE TABLES ---
  db: {
    insights: {
      campaign: [
        { id: 'C001', name: 'Sari Sensation - Diwali Sale', status: 'Active', spend: 50000, impressions: 750000, clicks: 15000, purchase_value: 250000, actions: 100 },
        { id: 'C002', name: 'Kurti Karnival - Festive Deals', status: 'Active', spend: 75000, impressions: 1200000, clicks: 18000, purchase_value: 450000, actions: 180 },
        { id: 'C003', name: 'Jewellery Junction - Wedding Season', status: 'Paused', spend: 25000, impressions: 300000, clicks: 4500, purchase_value: 80000, actions: 32 },
        { id: 'C004', name: 'Lehenga Love - Clearance', status: 'Active', spend: 30000, impressions: 500000, clicks: 10000, purchase_value: 120000, actions: 48 },
      ],
    },
    leads: [
        { id: 'L001', name: 'Priya Sharma', phone: '98XXXXXX01', lastMessage: 'Is this available in red?', timestamp: new Date(Date.now() - 3600000), status: 'New Lead', adcreative_id: 'AD001', utm_source: 'instagram' },
        { id: 'L002', name: 'Anjali Verma', phone: '98XXXXXX02', lastMessage: 'What is the price?', timestamp: new Date(Date.now() - 7200000), status: 'Contacted', adcreative_id: 'AD002', utm_source: 'facebook' },
        { id: 'L003', name: 'Sneha Patel', phone: '98XXXXXX03', lastMessage: 'COD available?', timestamp: new Date(Date.now() - 86400000), status: 'Interested', adcreative_id: 'AD001', utm_source: 'instagram_reels' },
        { id: 'L004', name: 'Meera Singh', phone: '98XXXXXX04', lastMessage: 'Okay, I will buy it.', timestamp: new Date(Date.now() - 172800000), status: 'Paid', adcreative_id: 'AD003', utm_source: 'facebook_marketplace' },
    ],
    auditLogs: [
        { id: 'A001', timestamp: new Date(Date.now() - 3600000), user: 'System', action: 'New WhatsApp Lead', details: 'Lead "Priya Sharma" created.' },
        { id: 'A002', timestamp: new Date(Date.now() - 7200000), user: 'AI Autopilot', action: 'Campaign Paused', details: 'Campaign "Jewellery Junction" paused due to low ROAS (1.8).' },
    ],
  },

  // --- API ENDPOINTS SIMULATION ---
  getInsights: async (level = 'campaign') => {
    console.log(`[API] Fetching insights for level: ${level}`);
    await new Promise(res => setTimeout(res, 500)); // Simulate network delay
    const data = mockApiService.db.insights[level] || [];
    return data.map(item => ({
      ...item,
      ctr: ((item.clicks / item.impressions) * 100).toFixed(2),
      roas: (item.purchase_value / item.spend).toFixed(2),
      cpa: (item.spend / item.actions).toFixed(2),
    }));
  },

  getLeads: async () => {
    console.log(`[API] Fetching all leads.`);
    await new Promise(res => setTimeout(res, 300));
    return [...mockApiService.db.leads].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  },

  getAuditLogs: async () => {
    console.log(`[API] Fetching all audit logs.`);
    await new Promise(res => setTimeout(res, 300));
    return [...mockApiService.db.auditLogs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  },

  updateLeadStatus: async (leadId, newStatus) => {
    console.log(`[API] Updating lead ${leadId} to status ${newStatus}`);
    await new Promise(res => setTimeout(res, 400));
    const leadIndex = mockApiService.db.leads.findIndex(l => l.id === leadId);
    if (leadIndex !== -1) {
      mockApiService.db.leads[leadIndex].status = newStatus;
      const log = {
        id: `A${(mockApiService.db.auditLogs.length + 1).toString().padStart(3, '0')}`,
        timestamp: new Date(),
        user: 'User',
        action: `Lead Status Changed`,
        details: `Status of "${mockApiService.db.leads[leadIndex].name}" changed to "${newStatus}"`,
      };
      mockApiService.db.auditLogs.push(log);
      
      mockApiService.broadcastUpdate({ type: 'LEADS_UPDATE', payload: mockApiService.db.leads });
      mockApiService.broadcastUpdate({ type: 'AUDIT_LOGS_UPDATE', payload: mockApiService.db.auditLogs });
      
      if (newStatus === 'Paid') {
        mockApiService.triggerN8nWebhook(mockApiService.db.leads[leadIndex]);
      }
      return mockApiService.db.leads[leadIndex];
    }
    throw new Error('Lead not found');
  },

  triggerN8nWebhook: async (leadData) => {
      console.log(`[AUTOMATION] Firing n8n webhook for lead: ${leadData.name}`);
      console.log(`[AUTOMATION] Payload:`, JSON.stringify(leadData, null, 2));
      const log = {
        id: `A${(mockApiService.db.auditLogs.length + 1).toString().padStart(3, '0')}`,
        timestamp: new Date(),
        user: 'System',
        action: `Fulfillment Triggered`,
        details: `n8n webhook fired for "${leadData.name}" for Shiprocket automation.`,
      };
      mockApiService.db.auditLogs.push(log);
      mockApiService.broadcastUpdate({ type: 'AUDIT_LOGS_UPDATE', payload: mockApiService.db.auditLogs });
      return { success: true };
  },

  _listeners: [],
  subscribe: (callback) => {
    mockApiService._listeners.push(callback);
    return () => {
      mockApiService._listeners = mockApiService._listeners.filter(l => l !== callback);
    };
  },
  broadcastUpdate: (update) => {
    console.log('[BROADCAST]', update.type);
    for (const listener of mockApiService._listeners) {
      listener(update);
    }
  },
};


// --- UI COMPONENTS ---

const Card = ({ children, className = '' }) => (
  <div className={`bg-brand-gray/50 backdrop-blur-sm border border-brand-gold/20 rounded-lg p-4 sm:p-6 ${className}`}>
    {children}
  </div>
);

const BottomNav = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'dashboard', icon: BarChart2, label: 'Dashboard' },
    { id: 'campaigns', icon: Briefcase, label: 'Campaigns' },
    { id: 'crm', icon: Users, label: 'CRM' },
    { id: 'growth', icon: Zap, label: 'Growth' },
    { id: 'audit', icon: ShieldCheck, label: 'Audit Log' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-brand-dark/80 backdrop-blur-lg border-t border-brand-gold/20 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${activeView === item.id ? 'text-brand-gold' : 'text-brand-light-gray hover:text-brand-light'}`}
            aria-label={item.label}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const Header = ({ settings, setSettings }) => {
    const isDarkMode = settings.theme === 'dark';
    const toggleTheme = () => {
        setSettings(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
    };

    return (
        <header className="sticky top-0 z-40 bg-brand-dark/80 backdrop-blur-lg p-4 flex justify-between items-center border-b border-brand-gold/20">
            <div className="flex items-center">
                <Bot className="w-8 h-8 text-brand-gold mr-3" />
                <div>
                    <h1 className="text-lg font-bold text-brand-light">KAAPAV</h1>
                    <p className="text-xs text-brand-light-gray -mt-1">Meta Ads Strategist</p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <span className={`flex items-center text-xs px-2 py-1 rounded-full ${settings.metaConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${settings.metaConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {settings.metaConnected ? 'Meta Connected' : 'Disconnected'}
                </span>
                <button onClick={toggleTheme} className="text-brand-light-gray hover:text-brand-gold transition-colors">
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>
        </header>
    );
};

const ToggleSwitch = ({ label, description, enabled, onToggle }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-brand-dark/50">
        <div>
            <p className="font-semibold text-brand-light">{label}</p>
            {description && <p className="text-xs text-brand-light-gray">{description}</p>}
        </div>
        <button onClick={onToggle} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-brand-gold' : 'bg-brand-light-gray/50'}`}>
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

const CheckboxDropdown = ({ label, options, selectedOptions, onSelectionChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    const handleSelect = (option) => {
        const newSelection = selectedOptions.includes(option)
            ? selectedOptions.filter(item => item !== option)
            : [...selectedOptions, option];
        onSelectionChange(newSelection);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block mb-2 text-sm font-medium text-brand-light">{label}</label>
            <button onClick={() => setIsOpen(!isOpen)} className="bg-brand-gray border border-brand-gold/30 text-brand-light text-sm rounded-lg focus:ring-brand-gold focus:border-brand-gold w-full p-2.5 flex justify-between items-center">
                <span className="truncate pr-2">{selectedOptions.join(', ') || `Select ${label}`}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-brand-gray border border-brand-gold/30 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {options.map(option => (
                        <div key={option} onClick={() => handleSelect(option)} className="flex items-center p-2 hover:bg-brand-dark/50 cursor-pointer">
                            {selectedOptions.includes(option) ? <CheckSquare className="w-4 h-4 mr-2 text-brand-gold" /> : <Square className="w-4 h-4 mr-2 text-brand-light-gray" />}
                            <span className="text-sm text-brand-light">{option}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


// --- VIEWS ---

const DashboardView = ({ campaigns }) => {
    const kpis = [
        { title: 'Total Spend', value: `₹${campaigns.reduce((sum, c) => sum + c.spend, 0).toLocaleString('en-IN')}`, change: '+5.2%' },
        { title: 'Total Revenue', value: `₹${campaigns.reduce((sum, c) => sum + c.purchase_value, 0).toLocaleString('en-IN')}`, change: '+8.1%' },
        { title: 'Overall ROAS', value: (campaigns.reduce((sum, c) => sum + c.purchase_value, 0) / campaigns.reduce((sum, c) => sum + c.spend, 1)).toFixed(2) + 'x', change: '+3.0%' },
        { title: 'Total Leads', value: mockApiService.db.leads.length, change: '+12' },
    ];
    
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-brand-light">Dashboard</h2>
            <div className="grid grid-cols-2 gap-4">
                {kpis.map(kpi => (
                    <Card key={kpi.title}>
                        <p className="text-sm text-brand-light-gray">{kpi.title}</p>
                        <p className="text-2xl font-bold text-brand-light mt-1">{kpi.value}</p>
                        <p className="text-xs text-green-400 mt-1">{kpi.change} vs last period</p>
                    </Card>
                ))}
            </div>
             <Card>
                <h3 className="text-xl font-semibold text-brand-light mb-4">Top Campaigns by ROAS</h3>
                 <ul className="space-y-3">
                    {[...campaigns].sort((a, b) => b.roas - a.roas).slice(0, 3).map(c => (
                        <li key={c.id} className="flex justify-between items-center p-2 rounded-md bg-brand-dark/50">
                            <div>
                                <p className="font-semibold text-brand-light">{c.name}</p>
                                <p className="text-sm text-brand-light-gray">Spend: ₹{c.spend.toLocaleString('en-IN')}</p>
                            </div>
                            <p className="text-lg font-bold text-brand-gold">{c.roas}x</p>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    )
};

const CampaignsView = ({ campaigns }) => (
     <div className="space-y-6">
        <h2 className="text-2xl font-bold text-brand-light">Campaigns</h2>
        <div className="space-y-4">
        {campaigns.map(c => (
            <Card key={c.id}>
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-brand-light pr-4">{c.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{c.status}</span>
                </div>
                 <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4 text-sm">
                    <div><p className="text-brand-light-gray">Spend</p><p className="font-semibold text-brand-light">₹{c.spend.toLocaleString('en-IN')}</p></div>
                    <div><p className="text-brand-light-gray">Revenue</p><p className="font-semibold text-brand-light">₹{c.purchase_value.toLocaleString('en-IN')}</p></div>
                    <div><p className="text-brand-light-gray">ROAS</p><p className="font-bold text-brand-gold">{c.roas}x</p></div>
                    <div><p className="text-brand-light-gray">CPA</p><p className="font-semibold text-brand-light">₹{Number(c.cpa).toLocaleString('en-IN')}</p></div>
                    <div><p className="text-brand-light-gray">Clicks</p><p className="font-semibold text-brand-light">{c.clicks.toLocaleString('en-IN')}</p></div>
                    <div><p className="text-brand-light-gray">CTR</p><p className="font-semibold text-brand-light">{c.ctr}%</p></div>
                </div>
            </Card>
        ))}
        </div>
    </div>
);

const CRMView = ({ leads, setLeads }) => {
    const statusOptions = ['New Lead', 'Contacted', 'Interested', 'Paid', 'Shipped'];

    const handleStatusChange = async (leadId, newStatus) => {
        try {
            await mockApiService.updateLeadStatus(leadId, newStatus);
        } catch (error) {
            console.error("Failed to update lead status:", error);
        }
    };
    
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-brand-light">CRM</h2>
            <div className="space-y-4">
                {leads.map(lead => (
                    <Card key={lead.id}>
                        <div className="flex justify-between items-start">
                             <div>
                                <h3 className="text-lg font-bold text-brand-light">{lead.name}</h3>
                                <p className="text-sm text-brand-light-gray">{lead.phone}</p>
                             </div>
                             <p className="text-xs text-brand-light-gray">{lead.timestamp.toLocaleDateString()}</p>
                        </div>
                        <p className="my-3 p-3 bg-brand-dark/50 rounded-md text-brand-light italic">"{lead.lastMessage}"</p>
                         <div className="flex justify-between items-center">
                            <p className="text-xs text-brand-light-gray">Source: <span className="font-semibold">{lead.utm_source}</span></p>
                            <select 
                                value={lead.status} 
                                onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                className="bg-brand-gray border border-brand-gold/30 text-brand-light text-sm rounded-lg focus:ring-brand-gold focus:border-brand-gold block p-2"
                            >
                                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

const GrowthEngineView = ({ settings, setSettings }) => {
    const [aiCopyIdeas, setAiCopyIdeas] = useState([]);
    const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
    
    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };
    
    const handlePlacementChange = (platform, placement) => {
        setSettings(prev => {
            const newPlacements = { ...prev.placements };
            newPlacements[platform][placement] = !newPlacements[platform][placement];
            return { ...prev, placements: newPlacements };
        });
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerateCopy = async () => {
        setIsGeneratingCopy(true);
        setAiCopyIdeas([]);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const masterPrompt = `
                You are KAAPAV, an elite Meta Ads Strategist.
                Your co-founder needs ad copy ideas for an e-commerce brand targeting Indian women.
                Generate 3 distinct ad copy variations (Headline, Body, CTA).
                The ad copy must be compelling, emotionally resonant, and drive conversions.

                Current Strategic Settings:
                - Target Audience: Women, Age ${settings.targetAge.join('-')}, in ${settings.targetCity.join(', ')}, ${settings.targetState.join(', ')}.
                - Business Category: ${settings.category}.
                - Psychological Angle: ${settings.psychologicalAngle}.
                - Viral Tactics Enabled:
                    - Dynamic Countdown: ${settings.dynamicCountdown ? 'YES' : 'NO'}.
                    - Stock Alerts: ${settings.stockAlerts ? 'YES' : 'NO'}.
                    - Social Proof: ${settings.socialProofInjection ? 'YES' : 'NO'}.
                
                Based on this strategy, provide 3 unique, ready-to-use ad copy variations.
            `;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                // FIX: It is more robust to wrap the string prompt in the Content object structure.
                contents: { parts: [{ text: masterPrompt }] }
            });
            const text = response.text;
            const ideas = text.split('Variation').slice(1).map((ideaText, index) => ({
                id: index + 1,
                content: "Variation" + ideaText,
            }));
            setAiCopyIdeas(ideas);
        } catch (error) {
            console.error("Error generating ad copy:", error);
            setAiCopyIdeas([{id: 1, content: "Error: Could not generate ad copy. Please check your API key and connection."}]);
        } finally {
            setIsGeneratingCopy(false);
        }
    };
    
    const PlacementMatrix = () => (
        <div className="space-y-2">
        {['Feed', 'Reels', 'Stories', 'Marketplace', 'Search', 'In-Article'].map(placement => (
            <div key={placement} className="grid grid-cols-3 items-center p-2 rounded-lg bg-brand-dark/50">
                <span className="font-semibold text-brand-light col-span-1">{placement}</span>
                <div className="flex items-center justify-center">
                    <input type="checkbox" checked={settings.placements.facebook[placement]} onChange={() => handlePlacementChange('facebook', placement)} className="w-4 h-4 text-brand-gold bg-gray-700 border-gray-600 rounded focus:ring-brand-gold" />
                </div>
                <div className="flex items-center justify-center">
                     <input type="checkbox" checked={settings.placements.instagram[placement]} onChange={() => handlePlacementChange('instagram', placement)} className="w-4 h-4 text-brand-gold bg-gray-700 border-gray-600 rounded focus:ring-brand-gold" />
                     {placement === 'Reels' && <span className="ml-2 text-xs text-yellow-400">🚀</span>}
                     {placement === 'Marketplace' && <span className="ml-2 text-xs text-yellow-400">🔥</span>}
                </div>
            </div>
        ))}
        </div>
    );

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-brand-light">Growth Engine</h2>
        
        <Card>
            <h3 className="text-xl font-semibold text-brand-light mb-4">Viral Toolkit (FOMO & Urgency)</h3>
            <div className="space-y-3">
                <ToggleSwitch label="Dynamic Countdown" description="Injects 'Sale ends in X hours!' into copy." enabled={settings.dynamicCountdown} onToggle={() => handleToggle('dynamicCountdown')} />
                <ToggleSwitch label="Limited Stock Alerts" description="Adds 'Only 11 left!' style text for scarcity." enabled={settings.stockAlerts} onToggle={() => handleToggle('stockAlerts')} />
                <ToggleSwitch label="Social Proof Injection" description="Features best comments or '200+ sold' overlays." enabled={settings.socialProofInjection} onToggle={() => handleToggle('socialProofInjection')} />
            </div>
        </Card>

        <Card>
            <h3 className="text-xl font-semibold text-brand-light mb-4">Audience Engine (High-Intent Targeting)</h3>
            <div className="space-y-3">
                <ToggleSwitch label="High-Value Lookalikes" description="Builds LAL audiences from your highest LTV customers." enabled={settings.highValueLookalikes} onToggle={() => handleToggle('highValueLookalikes')} />
                <ToggleSwitch label="Target Engaged Shoppers" description="Prioritizes users who recently used FB/IG Shops." enabled={settings.targetEngagedShoppers} onToggle={() => handleToggle('targetEngagedShoppers')} />
                <ToggleSwitch label="Low-Intent Exclusion" description="Excludes users who mass-like ads but never convert." enabled={settings.lowIntentExclusion} onToggle={() => handleToggle('lowIntentExclusion')} />
            </div>
        </Card>
        
        <Card>
            <h3 className="text-xl font-semibold text-brand-light mb-4">Advanced Automation Suite</h3>
            <div className="space-y-3">
                <ToggleSwitch label="Sentiment-Based Comment Pinning" description="AI finds and pins the most positive user comment." enabled={settings.sentimentCommentPinning} onToggle={() => handleToggle('sentimentCommentPinning')} />
                <ToggleSwitch label="Creative Flywheel Engine" description="Perpetually tests winning creative elements." enabled={settings.creativeFlywheel} onToggle={() => handleToggle('creativeFlywheel')} />
                <div className="p-3 rounded-lg bg-brand-dark/50">
                    <ToggleSwitch label="Comment-to-DM Autopilot" description="Trigger a DM when users comment a keyword." enabled={settings.commentToDm} onToggle={() => handleToggle('commentToDm')} />
                    {settings.commentToDm && (
                        <div className="mt-4 space-y-3 pl-4 border-l-2 border-brand-gold/30">
                            <input type="text" name="commentDmKeyword" value={settings.commentDmKeyword} onChange={handleInputChange} placeholder="Enter keyword (e.g., 'DEAL')" className="bg-brand-gray border border-brand-gold/30 text-brand-light text-sm rounded-lg block w-full p-2.5" />
                            <textarea name="commentDmResponse" value={settings.commentDmResponse} onChange={handleInputChange} placeholder="Enter your DM response..." rows="3" className="bg-brand-gray border border-brand-gold/30 text-brand-light text-sm rounded-lg block w-full p-2.5"></textarea>
                        </div>
                    )}
                </div>
            </div>
        </Card>
        
        <Card>
            <div className="grid grid-cols-3 mb-2 px-2">
                <h3 className="text-xl font-semibold text-brand-light col-span-1">Placement Dominance</h3>
                <p className="text-sm font-bold text-brand-light text-center">Facebook</p>
                <p className="text-sm font-bold text-brand-light text-center">Instagram</p>
            </div>
            <PlacementMatrix />
        </Card>

        <Card>
            <h3 className="text-xl font-semibold text-brand-light mb-4">AI Creative Lab</h3>
            <p className="text-sm text-brand-light-gray mb-4">Generate high-performance ad copy based on your current strategic settings.</p>
            <button onClick={handleGenerateCopy} disabled={isGeneratingCopy} className="w-full bg-brand-gold text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors disabled:bg-brand-gray disabled:cursor-not-allowed flex items-center justify-center">
                {isGeneratingCopy ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-dark mr-3"></div>Generating...</> : <><Bot className="w-5 h-5 mr-2" />Generate Ad Copy Ideas</>}
            </button>
             {aiCopyIdeas.length > 0 && (
                <div className="mt-6 space-y-4">
                    {aiCopyIdeas.map(idea => (
                        <div key={idea.id} className="p-4 rounded-lg bg-brand-dark/50 border border-brand-gold/20 whitespace-pre-wrap font-mono text-sm text-brand-light">
                           {idea.content}
                        </div>
                    ))}
                </div>
            )}
        </Card>
      </div>
    );
};

const AuditLogView = ({ auditLogs }) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-brand-light">Audit Log</h2>
        <Card>
            <ul className="space-y-4">
                {auditLogs.map(log => (
                    <li key={log.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-brand-gray flex items-center justify-center">
                                {log.user === 'System' ? <Bot size={20} className="text-brand-light-gray" /> : log.user === 'AI Autopilot' ? <Zap size={20} className="text-brand-gold" /> : <Users size={20} className="text-brand-light-gray" />}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-brand-light"><span className="font-bold">{log.user}</span> performed action: <span className="font-semibold text-brand-gold">{log.action}</span></p>
                            <p className="text-xs text-brand-light-gray mt-1">{log.details}</p>
                            <p className="text-xs text-brand-light-gray mt-1">{log.timestamp.toLocaleString()}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </Card>
    </div>
);

const SettingsView = ({ settings, setSettings }) => {
    const handleToggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    const handleInputChange = (e) => setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleMultiSelectChange = (key, value) => setSettings(prev => ({...prev, [key]: value }));

    const AudienceEstimator = () => {
        const base = 500000;
        const reach = base + (settings.targetState.length * 100000) + (settings.targetCity.length * 25000);
        return (
            <div className="p-3 rounded-lg bg-brand-dark/50 text-center">
                <p className="text-sm text-brand-light-gray">Estimated Audience Reach</p>
                <p className="text-2xl font-bold text-brand-gold">{reach.toLocaleString('en-IN')}</p>
            </div>
        )
    };
    
    // Data for dropdowns
    const ageOptions = ["18-24", "25-34", "35-44", "45-54", "55-65", "65+"];
    const genderOptions = ["Female", "Male", "All"];
    const stateOptions = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman & Nicobar", "Chandigarh", "Dadra & Nagar Haveli", "Daman & Diu", "Delhi", "Jammu & Kashmir", "Ladakh", "Lakshadweep", "Puducherry"];
    const cityOptions = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot"];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-brand-light">Settings</h2>
            
            <Card>
                <h3 className="text-xl font-semibold text-brand-light mb-4">Connections</h3>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                         <p className="font-semibold text-brand-light flex items-center"><Bot className="w-5 h-5 mr-2 text-brand-gold"/> Meta Account</p>
                         <button onClick={() => handleToggle('metaConnected')} className={`font-bold py-2 px-4 rounded-lg text-sm transition-all ${settings.metaConnected ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/40'}`}>
                           {settings.metaConnected ? 'Disconnect' : 'Connect'}
                         </button>
                    </div>
                     <div className="flex items-center justify-between">
                         <p className="font-semibold text-brand-light flex items-center"><MessageSquare className="w-5 h-5 mr-2 text-brand-gold"/> WhatsApp Business</p>
                         <button onClick={() => handleToggle('whatsappConnected')} className={`font-bold py-2 px-4 rounded-lg text-sm transition-all ${settings.whatsappConnected ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/40'}`}>
                           {settings.whatsappConnected ? 'Disconnect' : 'Connect'}
                         </button>
                    </div>
                    <div className="flex items-center justify-between">
                         <p className="font-semibold text-brand-light flex items-center"><FileText className="w-5 h-5 mr-2 text-brand-gold"/> Google Sheets</p>
                         <button onClick={() => handleToggle('googleSheetConnected')} className={`font-bold py-2 px-4 rounded-lg text-sm transition-all ${settings.googleSheetConnected ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/40'}`}>
                           {settings.googleSheetConnected ? 'Disconnect' : 'Connect'}
                         </button>
                    </div>
                     <div className="flex items-center justify-between">
                         <p className="font-semibold text-brand-light flex items-center"><Zap className="w-5 h-5 mr-2 text-brand-gold"/> n8n Automation</p>
                         <button onClick={() => handleToggle('n8nConnected')} className={`font-bold py-2 px-4 rounded-lg text-sm transition-all ${settings.n8nConnected ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/40'}`}>
                           {settings.n8nConnected ? 'Disconnect' : 'Connect'}
                         </button>
                    </div>
                 </div>
            </Card>

            <Card>
                 <h3 className="text-xl font-semibold text-brand-light mb-4">Audience Targeting</h3>
                 <div className="space-y-4">
                    <CheckboxDropdown label="Age" options={ageOptions} selectedOptions={settings.targetAge} onSelectionChange={(val) => handleMultiSelectChange('targetAge', val)} />
                    <CheckboxDropdown label="Gender" options={genderOptions} selectedOptions={settings.targetGender} onSelectionChange={(val) => handleMultiSelectChange('targetGender', val)} />
                    <CheckboxDropdown label="State" options={stateOptions} selectedOptions={settings.targetState} onSelectionChange={(val) => handleMultiSelectChange('targetState', val)} />
                    <CheckboxDropdown label="City" options={cityOptions} selectedOptions={settings.targetCity} onSelectionChange={(val) => handleMultiSelectChange('targetCity', val)} />
                    <AudienceEstimator />
                 </div>
            </Card>

            <Card>
                 <h3 className="text-xl font-semibold text-brand-light mb-4">AI Strategy</h3>
                 <div className="space-y-4">
                    <div>
                         <label htmlFor="category" className="block mb-2 text-sm font-medium text-brand-light">Business Category</label>
                        <select id="category" name="category" value={settings.category} onChange={handleInputChange} className="bg-brand-gray border border-brand-gold/30 text-brand-light text-sm rounded-lg focus:ring-brand-gold focus:border-brand-gold block w-full p-2.5">
                            <option>Jewellery</option>
                            <option>Fashion Jewellery</option>
                            <option>Ecommerce</option>
                        </select>
                    </div>
                    <div>
                         <label htmlFor="psychologicalAngle" className="block mb-2 text-sm font-medium text-brand-light">Psychological Angle</label>
                        <select id="psychologicalAngle" name="psychologicalAngle" value={settings.psychologicalAngle} onChange={handleInputChange} className="bg-brand-gray border border-brand-gold/30 text-brand-light text-sm rounded-lg focus:ring-brand-gold focus:border-brand-gold block w-full p-2.5">
                            <option>Aspirational Professional</option>
                            <option>Festival Gifting</option>
                            <option>Self-Care & Reward</option>
                            <option>Modern Traditionalist</option>
                        </select>
                    </div>
                     <ToggleSwitch label="Ghost Strategy" description="Enables conservative, under-the-radar scaling." enabled={settings.ghostStrategy} onToggle={() => handleToggle('ghostStrategy')} />
                 </div>
            </Card>
        </div>
    );
};


// --- MAIN APP COMPONENT ---

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [campaigns, setCampaigns] = useState([]);
  const [leads, setLeads] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [settings, setSettings] = useState(() => {
    try {
        const savedSettings = localStorage.getItem('kaapavSettings');
        return savedSettings ? JSON.parse(savedSettings) : {
            theme: 'dark',
            // Connections
            metaConnected: true,
            whatsappConnected: false,
            googleSheetConnected: true,
            n8nConnected: true,
            googleSheetId: 'YOUR_SHEET_ID_HERE', // Kept for future use
            n8nWebhookUrl: 'YOUR_WEBHOOK_URL_HERE', // Kept for future use
            // Audience
            targetAge: ['25-34'],
            targetGender: ['Female'],
            targetState: ['Maharashtra'],
            targetCity: ['Mumbai', 'Pune'],
            // Strategy
            category: 'Fashion Jewellery',
            psychologicalAngle: 'Aspirational Professional',
            ghostStrategy: false,
            // Growth Engine - Viral
            dynamicCountdown: true,
            stockAlerts: false,
            socialProofInjection: true,
            // Growth Engine - Audience
            highValueLookalikes: false,
            targetEngagedShoppers: true,
            lowIntentExclusion: false,
            // Growth Engine - Automation
            sentimentCommentPinning: true,
            creativeFlywheel: false,
            commentToDm: true,
            commentDmKeyword: 'DEAL',
            commentDmResponse: 'Thanks for your interest! Here is your exclusive deal: [LINK]',
            // Placements
            placements: {
                facebook: { Feed: true, Reels: true, Stories: true, Marketplace: true, Search: false, 'In-Article': false },
                instagram: { Feed: true, Reels: true, Stories: true, Marketplace: false, Search: false, 'In-Article': false },
            },
        };
    } catch (e) {
        console.error("Failed to load settings from local storage", e);
        return {}; // Return empty to avoid crash, will be populated by default
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('kaapavSettings', JSON.stringify(settings));
    } catch (e) {
        console.error("Could not save settings to local storage", e)
    }
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    document.body.className = settings.theme === 'dark' ? 'bg-brand-dark text-brand-light' : 'bg-brand-light text-brand-dark';
  }, [settings]);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [campaignData, leadData, auditLogData] = await Promise.all([
        mockApiService.getInsights('campaign'),
        mockApiService.getLeads(),
        mockApiService.getAuditLogs(),
      ]);
      setCampaigns(campaignData);
      setLeads(leadData);
      setAuditLogs(auditLogData);
    } catch (err) {
      setError('Failed to fetch initial data. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);
  
  useEffect(() => {
    const unsubscribe = mockApiService.subscribe((update) => {
        if (update.type === 'LEADS_UPDATE') {
            setLeads([...update.payload].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()));
        }
        if (update.type === 'AUDIT_LOGS_UPDATE') {
            setAuditLogs([...update.payload].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()));
        }
    });
    return () => unsubscribe();
  }, []);

  const renderView = () => {
    if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div></div>;
    if (error) return <div className="text-center text-red-400 p-4 bg-red-500/10 rounded-lg">{error}</div>;

    switch (activeView) {
      case 'dashboard': return <DashboardView campaigns={campaigns} />;
      case 'campaigns': return <CampaignsView campaigns={campaigns} />;
      case 'crm': return <CRMView leads={leads} setLeads={setLeads} />;
      case 'growth': return <GrowthEngineView settings={settings} setSettings={setSettings} />;
      case 'audit': return <AuditLogView auditLogs={auditLogs} />;
      case 'settings': return <SettingsView settings={settings} setSettings={setSettings} />;
      default: return <DashboardView campaigns={campaigns} />;
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${settings.theme === 'dark' ? 'dark bg-brand-dark text-brand-light' : 'bg-brand-light text-brand-dark'}`}>
      <Header settings={settings} setSettings={setSettings} />
      <main className="p-4 pb-20">
        {renderView()}
      </main>
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
}

export default App;
