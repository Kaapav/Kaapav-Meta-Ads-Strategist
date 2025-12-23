import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldCheck, Smartphone, BarChart2, Zap, Users, Bot, Settings as SettingsIcon, MessageSquare, Plus, Trash2, Send, X, Copy, Sun, Moon, Briefcase, FileText, CheckCircle, Clock, ChevronDown, CheckSquare, Square, BookOpen, AlertTriangle, Loader, ChevronUp, Server
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- HYBRID MOCK/LIVE API SERVICE ---
// This service is now ONLY responsible for AI Copy Generation and providing a 
// complete data fallback if the live server cannot be reached. All primary
// data is now fetched from the live Express server.

const mockApiService = {
  db: {
    // FALLBACK CAMPAIGN DATA: Used only if the live server connection fails.
    fallbackCampaigns: [
        { id: 'C001', name: 'Sari Sensation - Diwali Sale', status: 'Active', spend: 50000, impressions: 750000, clicks: 15000, purchase_value: 250000, actions: 100 },
        { id: 'C002', name: 'Kurti Karnival - Festive Deals', status: 'Active', spend: 75000, impressions: 1200000, clicks: 18000, purchase_value: 450000, actions: 180 },
        { id: 'C003', name: 'Jewellery Junction - Wedding Season', status: 'Paused', spend: 25000, impressions: 300000, clicks: 4500, purchase_value: 80000, actions: 32 },
        { id: 'C004', name: 'Lehenga Love - Clearance', status: 'Active', spend: 30000, impressions: 500000, clicks: 10000, purchase_value: 120000, actions: 48 },
    ],
    // FALLBACK CRM/AUDIT DATA:
    fallbackLeads: [
        { id: 'L001', name: 'Priya Sharma', phone: '98XXXXXX01', chatHistory: [{sender: 'lead', text: 'Is this available in red?', timestamp: new Date(Date.now() - 3600000) }], timestamp: new Date(Date.now() - 3600000), status: 'New Lead', adcreative_id: 'AD001', utm_source: 'instagram' },
        { id: 'L002', name: 'Anjali Verma', phone: '98XXXXXX02', chatHistory: [{sender: 'lead', text: 'What is the price?', timestamp: new Date(Date.now() - 7200000) }], timestamp: new Date(Date.now() - 7200000), status: 'Contacted', adcreative_id: 'AD002', utm_source: 'facebook' },
    ],
    fallbackAuditLogs: [
        { id: 'A001', timestamp: new Date(Date.now() - 3600000), user: 'System', action: 'New WhatsApp Lead', details: 'Lead "Priya Sharma" created.' },
        { id: 'A002', timestamp: new Date(Date.now() - 7200000), user: 'AI Autopilot', action: 'Campaign Paused', details: 'Campaign "Jewellery Junction" paused due to low ROAS (1.8).' },
    ],
  },

  // This function provides a complete fallback dataset if the server is down.
  async getFallbackData() {
    console.log('[MockAPI] GET /fallback-data (Server Connection Failed)');
    const campaignsWithMetrics = this.db.fallbackCampaigns.map(item => ({
        ...item,
        ctr: item.impressions > 0 ? (item.clicks / item.impressions) * 100 : 0,
        roas: item.spend > 0 ? item.purchase_value / item.spend : 0,
        cpa: item.actions > 0 ? item.spend / item.actions : 0,
    }));
    const leads = [...this.db.fallbackLeads].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const auditLogs = [...this.db.fallbackAuditLogs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return Promise.resolve({ campaigns: campaignsWithMetrics, leads, auditLogs });
  },

  async generateAdCopy(settings) {
    console.log('[MockAPI] POST /api/generate-copy');

    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        return Promise.resolve("FRONTEND_ERROR: API_KEY not configured. Please add it to the environment variables.");
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const masterPrompt = `
            You are KAAPAV, an elite Meta Ads Strategist.
            Your co-founder needs ad copy ideas for an e-commerce brand targeting Indian women.
            Generate 3 distinct ad copy variations (Headline, Body, CTA).
            The ad copy must be compelling, emotionally resonant, and drive conversions.

            Current Strategic Settings:
            - Target Audience: Women, Age ${settings.targetAge.join(', ')}, in ${settings.targetCity.join(', ')}, ${settings.targetState.join(', ')}.
            - Business Category: ${settings.category}.
            - Psychological Angle: ${settings.psychologicalAngle}.
            - Viral Tactics Enabled:
                - Dynamic Countdown: ${settings.dynamicCountdown ? 'YES' : 'NO'}.
                - Stock Alerts: ${settings.stockAlerts ? 'YES' : 'NO'}.
                - Social Proof: ${settings.socialProofInjection ? 'YES' : 'NO'}.
            
            Based on this strategy, provide 3 unique, ready-to-use ad copy variations. Format the output clearly using Markdown for headings.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: masterPrompt
        });
        
        return Promise.resolve(response.text);

    } catch (error) {
        console.error("Error generating ad copy with Gemini:", error);
        return Promise.reject(new Error("Failed to generate ad copy from AI."));
    }
  }
};


// --- UI COMPONENTS ---

// FIX: Updated Card component to accept all standard div attributes, resolving multiple TypeScript errors.
const Card = ({ children, className = '', ...props }: React.ComponentProps<'div'>) => (
  <div className={`bg-brand-gray/50 backdrop-blur-sm border border-brand-gold/20 rounded-lg p-4 sm:p-6 ${className}`} {...props}>
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
      <div className="flex justify-around items-center max-w-2xl mx-auto">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={`flex flex-col items-center justify-center w-full h-16 transition-colors duration-200 ${
              activeView === id ? 'text-brand-gold' : 'text-brand-light-gray hover:text-brand-light'
            }`}
            aria-label={label}
            aria-current={activeView === id}
          >
            <Icon size={24} />
            <span className="text-xs mt-1">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const useDarkMode = (settings, setSettings) => {
    const [theme, setThemeState] = useState(settings.theme);
    const colorTheme = theme === 'dark' ? 'light' : 'dark';

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(colorTheme);
        root.classList.add(theme);
        if (theme === 'dark') {
          document.body.classList.add('bg-brand-dark');
          document.body.classList.remove('bg-gray-100');
          document.documentElement.style.colorScheme = 'dark';
        } else {
          document.body.classList.add('bg-gray-100');
          document.body.classList.remove('bg-brand-dark');
          document.documentElement.style.colorScheme = 'light';
        }
    }, [theme, colorTheme]);
    
    const setTheme = (newTheme) => {
        setSettings(prev => ({ ...prev, theme: newTheme }));
        setThemeState(newTheme);
    }
    return [colorTheme, setTheme] as const;
};


const Header = ({ settings, setSettings, serverStatus }) => {
  const [colorTheme, setTheme] = useDarkMode(settings, setSettings);

  const statusColor = {
      'connecting': 'bg-yellow-500',
      'connected': 'bg-green-500',
      'error': 'bg-red-500',
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-brand-dark/80 dark:bg-brand-dark/80 backdrop-blur-lg border-b border-brand-gold/20 p-4 z-50 dark:text-brand-light text-brand-dark">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center space-x-2">
          <Bot size={28} className="text-brand-gold" />
          <h1 className="text-lg sm:text-xl font-bold tracking-wider">KAAPAV</h1>
        </div>
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 group">
                <div className={`w-3 h-3 rounded-full ${statusColor[serverStatus]}`}></div>
                <span className="hidden sm:inline text-sm text-brand-light-gray capitalize">{serverStatus}</span>
            </div>
            <div className={`w-3 h-3 rounded-full ${settings.metaConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="hidden sm:inline text-sm text-brand-light-gray">{settings.metaConnected ? 'Meta Connected' : 'Meta Disconnected'}</span>
            <button onClick={() => setTheme(colorTheme)} aria-label={`Switch to ${colorTheme} mode`}>
                {colorTheme === 'light' ? <Sun className="text-brand-light-gray hover:text-brand-gold" /> : <Moon className="text-brand-light-gray hover:text-brand-gold" />}
            </button>
        </div>
      </div>
    </header>
  );
};

const KpiCard = ({ title, value, change, isCurrency = false }) => (
    <Card className="flex-1 min-w-[140px]">
      <h3 className="text-sm font-medium text-brand-light-gray uppercase tracking-wider">{title}</h3>
      <p className="text-2xl font-bold text-brand-light mt-1">
        {isCurrency ? `₹${Number(value).toLocaleString('en-IN')}` : Number(value).toFixed(2)}
      </p>
      {change && (
        <p className={`text-sm mt-1 flex items-center ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change > 0 ? '▲' : '▼'} {Math.abs(change)}% vs last period
        </p>
      )}
    </Card>
);

const CheckboxDropdown = ({ label, options, selected, setSelected, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    const handleToggle = (optionValue) => {
        if (disabled) return;
        const newSelected = selected.includes(optionValue)
            ? selected.filter(item => item !== optionValue)
            : [...selected, optionValue];
        setSelected(newSelected);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [ref]);

    const displayLabel = selected.length > 2
        ? `${selected.length} selected`
        : selected.join(', ') || `Select ${label}`;

    return (
        <div className="relative" ref={ref}>
            <label className="block text-sm font-medium text-brand-light-gray mb-1">{label}</label>
            <button 
                onClick={() => !disabled && setIsOpen(!isOpen)} 
                className={`w-full bg-brand-dark border ${disabled ? 'border-brand-gray/50' : 'border-brand-gold/30'} rounded-md p-2 text-left flex justify-between items-center ${disabled ? 'text-brand-light-gray' : 'text-brand-light'}`}
                disabled={disabled}
            >
                <span className="truncate">{displayLabel}</span>
                <ChevronDown size={16} />
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-brand-gray border border-brand-gold/30 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {options.map(option => (
                        <div key={option.value} onClick={() => handleToggle(option.value)} className="p-2 flex items-center hover:bg-brand-gold/10 cursor-pointer">
                            {selected.includes(option.value) ? <CheckSquare size={16} className="text-brand-gold mr-2" /> : <Square size={16} className="text-brand-light-gray mr-2" />}
                            <span className="text-brand-light">{option.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ToggleSwitch = ({ label, isEnabled, onToggle, description }) => (
    <div className="flex items-center justify-between py-2">
        <div>
            <label className="text-brand-light font-medium">{label}</label>
            {description && <p className="text-sm text-brand-light-gray">{description}</p>}
        </div>
        <button
            onClick={onToggle}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isEnabled ? 'bg-brand-gold' : 'bg-brand-gray'}`}
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);


const ChatModal = ({ lead, onClose, onSendMessage }) => {
    const [message, setMessage] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [lead.chatHistory]);

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(lead.id, message);
            setMessage('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <Card className="w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b border-brand-gold/20 pb-2 mb-4">
                    <h2 className="text-xl font-bold text-brand-gold">{lead.name}</h2>
                    <button onClick={onClose}><X className="text-brand-light-gray hover:text-brand-light" /></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 p-2">
                    {lead.chatHistory.map((chat, index) => (
                        <div key={index} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${chat.sender === 'user' ? 'bg-brand-gold text-brand-dark' : 'bg-brand-gray text-brand-light'}`}>
                                <p>{chat.text}</p>
                                <p className="text-xs opacity-70 mt-1 text-right">{new Date(chat.timestamp).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                <div className="mt-4 flex space-x-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 bg-brand-dark border border-brand-gold/30 rounded-md p-2 text-brand-light"
                    />
                    <button onClick={handleSend} className="bg-brand-gold text-brand-dark p-2 rounded-md"><Send /></button>
                </div>
            </Card>
        </div>
    );
};


// --- MAIN VIEWS ---

const DashboardView = ({ campaigns }) => {
    const totalSpend = campaigns.reduce((acc, c) => acc + c.spend, 0);
    const totalPurchaseValue = campaigns.reduce((acc, c) => acc + c.purchase_value, 0);
    const totalRoas = totalSpend > 0 ? (totalPurchaseValue / totalSpend) : 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-4">
                <KpiCard title="Total Spend" value={totalSpend} change={-5} isCurrency />
                <KpiCard title="Total Revenue" value={totalPurchaseValue} change={12} isCurrency />
                <KpiCard title="Overall ROAS" value={totalRoas} change={8} />
            </div>
             <Card>
                <h2 className="text-xl font-bold text-brand-gold mb-4">Top Performing Campaigns</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-brand-gold/20">
                                <th className="p-2 text-brand-light-gray">Campaign</th>
                                <th className="p-2 text-brand-light-gray text-right">ROAS</th>
                                <th className="p-2 text-brand-light-gray text-right">Spend</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...campaigns].sort((a,b) => b.roas - a.roas).slice(0, 3).map(c => (
                                <tr key={c.id}>
                                    <td className="p-2 text-brand-light">{c.name}</td>
                                    <td className="p-2 text-green-400 font-bold text-right">{c.roas.toFixed(2)}</td>
                                    <td className="p-2 text-brand-light-gray text-right">₹{c.spend.toLocaleString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

const CampaignsView = ({ campaigns }) => (
    <Card>
        <h2 className="text-xl font-bold text-brand-gold mb-4">All Campaigns</h2>
        <div className="space-y-4">
            {campaigns.map(c => (
                <div key={c.id} className="bg-brand-dark/50 p-4 rounded-lg border border-brand-gold/10">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-brand-light">{c.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${c.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{c.status}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-center">
                        <div>
                            <p className="text-xs text-brand-light-gray">Spend</p>
                            <p className="font-bold text-brand-light">₹{c.spend.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                            <p className="text-xs text-brand-light-gray">Revenue</p>
                            <p className="font-bold text-brand-light">₹{c.purchase_value.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                            <p className="text-xs text-brand-light-gray">ROAS</p>
                            <p className={`font-bold ${c.roas >= 3.5 ? 'text-green-400' : 'text-red-400'}`}>{c.roas.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-brand-light-gray">CPA</p>
                            <p className="font-bold text-brand-light">₹{c.cpa.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </Card>
);

const CRMView = ({ leads, onStatusChange, onOpenChat }) => {
    const statusClasses = {
        'New Lead': 'bg-blue-500/20 text-blue-400',
        'Contacted': 'bg-cyan-500/20 text-cyan-400',
        'Interested': 'bg-purple-500/20 text-purple-400',
        'Paid': 'bg-green-500/20 text-green-400',
        'Shipped': 'bg-gray-500/20 text-gray-400',
    };

    const statusOptions = ['New Lead', 'Contacted', 'Interested', 'Paid', 'Shipped'];

    return (
        <Card>
            <h2 className="text-xl font-bold text-brand-gold mb-4">CRM</h2>
            <div className="space-y-4">
                {leads.map(lead => (
                    <div key={lead.id} className="bg-brand-dark/50 p-4 rounded-lg border border-brand-gold/10">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-brand-light">{lead.name}</h3>
                                <p className="text-sm text-brand-light-gray">{lead.phone}</p>
                            </div>
                            <div className="relative group">
                                <select 
                                    value={lead.status}
                                    onChange={(e) => onStatusChange(lead.id, e.target.value)}
                                    className={`appearance-none text-xs rounded-full px-3 py-1 font-bold cursor-pointer ${statusClasses[lead.status]}`}
                                >
                                    {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>
                        <p className="text-brand-light mt-2 italic">"{lead.chatHistory.slice(-1)[0]?.text}"</p>
                        <div className="flex justify-between items-center mt-2">
                             <p className="text-xs text-brand-light-gray">{new Date(lead.timestamp).toLocaleString()}</p>
                             <button onClick={() => onOpenChat(lead)} className="text-xs text-brand-gold hover:underline">View Chat</button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const AuditLogView = ({ logs }) => (
    <Card>
        <h2 className="text-xl font-bold text-brand-gold mb-4">Audit Log</h2>
        <div className="space-y-2">
            {logs.map(log => (
                <div key={log.id} className="bg-brand-dark/50 p-3 rounded-lg flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        {log.user === 'System' && <Bot size={16} className="text-brand-gold mt-1"/>}
                        {log.user === 'User' && <Users size={16} className="text-cyan-400 mt-1"/>}
                        {log.user === 'AI Autopilot' && <Zap size={16} className="text-purple-400 mt-1"/>}
                    </div>
                    <div>
                        <p className="text-brand-light font-bold">{log.action}</p>
                        <p className="text-sm text-brand-light-gray">{log.details}</p>
                        <p className="text-xs text-brand-light-gray/50 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                </div>
            ))}
        </div>
    </Card>
);

const SettingsView = ({ settings, setSettings, onUpdateConnection }) => {
    const ageOptions = Array.from({ length: (65-18)+1 }, (_, i) => ({ value: (18 + i).toString(), label: (18 + i).toString() }));
    const genderOptions = [{value: 'Women', label: 'Women'}, {value: 'Men', label: 'Men'}];
    const stateOptions = [
        { value: 'Andhra Pradesh', label: 'Andhra Pradesh' }, { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' }, { value: 'Assam', label: 'Assam' },
        { value: 'Bihar', label: 'Bihar' }, { value: 'Chhattisgarh', label: 'Chhattisgarh' }, { value: 'Goa', label: 'Goa' }, { value: 'Gujarat', label: 'Gujarat' },
        { value: 'Haryana', label: 'Haryana' }, { value: 'Himachal Pradesh', label: 'Himachal Pradesh' }, { value: 'Jharkhand', label: 'Jharkhand' },
        { value: 'Karnataka', label: 'Karnataka' }, { value: 'Kerala', label: 'Kerala' }, { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
        { value: 'Maharashtra', label: 'Maharashtra' }, { value: 'Manipur', label: 'Manipur' }, { value: 'Meghalaya', label: 'Meghalaya' },
        { value: 'Mizoram', label: 'Mizoram' }, { value: 'Nagaland', label: 'Nagaland' }, { value: 'Odisha', label: 'Odisha' }, { value: 'Punjab', label: 'Punjab' },
        { value: 'Rajasthan', label: 'Rajasthan' }, { value: 'Sikkim', label: 'Sikkim' }, { value: 'Tamil Nadu', label: 'Tamil Nadu' },
        { value: 'Telangana', label: 'Telangana' }, { value: 'Tripura', label: 'Tripura' }, { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
        { value: 'Uttarakhand', label: 'Uttarakhand' }, { value: 'West Bengal', label: 'West Bengal' },
    ];
    const cityOptions = [
        { value: 'Mumbai', label: 'Mumbai' }, { value: 'Delhi', label: 'Delhi' }, { value: 'Bengaluru', label: 'Bengaluru' }, { value: 'Hyderabad', label: 'Hyderabad' },
        { value: 'Ahmedabad', label: 'Ahmedabad' }, { value: 'Chennai', label: 'Chennai' }, { value: 'Kolkata', label: 'Kolkata' }, { value: 'Pune', label: 'Pune' },
        { value: 'Jaipur', label: 'Jaipur' }, { value: 'Surat', label: 'Surat' }, { value: 'Lucknow', label: 'Lucknow' }, { value: 'Kanpur', label: 'Kanpur' },
        { value: 'Nagpur', label: 'Nagpur' }, { value: 'Indore', label: 'Indore' }, { value: 'Thane', label: 'Thane' }, { value: 'Bhopal', label: 'Bhopal' },
        { value: 'Visakhapatnam', label: 'Visakhapatnam' }, { value: 'Patna', label: 'Patna' }, { value: 'Vadodara', label: 'Vadodara' },
    ];
    const categoryOptions = [ 'Jewellery', 'Fashion Jewellery', 'Ecommerce' ];
    
    const AudienceEstimator = ({ settings }) => {
      const calculateReach = () => {
        let base = 5000000;
        if(settings.targetAge.length > 0) base *= 0.8;
        if(settings.targetGender.length > 0) base *= 0.9;
        if(settings.targetState.length > 0) base *= 0.5;
        if(settings.targetCity.length > 0) base *= 0.3;
        return Math.round(base);
      };

      return(
        <Card className="mt-4">
          <h3 className="text-lg font-bold text-brand-gold">Audience Estimator</h3>
          <p className="text-brand-light">Potential Reach: <span className="font-bold">{calculateReach().toLocaleString('en-IN')}</span></p>
        </Card>
      );
    };

    return (
        <div className="space-y-6">
             <Card>
                <h2 className="text-xl font-bold text-brand-gold mb-4">Connections</h2>
                <div className="space-y-4">
                  {['meta', 'whatsApp', 'googleSheets', 'n8n'].map(conn => (
                     <div key={conn} className="flex items-center justify-between">
                        <span className="text-brand-light capitalize">{conn.replace(/([A-Z])/g, ' $1')}</span>
                        <button onClick={() => onUpdateConnection(conn)} className={`px-4 py-1 text-sm rounded ${settings[`${conn}Connected`] ? 'bg-red-500/80' : 'bg-green-500/80'} text-white`}>
                          {settings[`${conn}Connected`] ? 'Disconnect' : 'Connect'}
                        </button>
                    </div>
                  ))}
                  <div className="space-y-2">
                     <label className="block text-sm font-medium text-brand-light-gray">Google Sheet ID</label>
                     <input type="text" value={settings.googleSheetId} onChange={(e) => setSettings(prev => ({...prev, googleSheetId: e.target.value}))} className="w-full bg-brand-dark border border-brand-gold/30 rounded-md p-2 text-brand-light" />
                  </div>
                  <div className="space-y-2">
                     <label className="block text-sm font-medium text-brand-light-gray">n8n Webhook URL</label>
                     <input type="text" value={settings.n8nWebhookUrl} onChange={(e) => setSettings(prev => ({...prev, n8nWebhookUrl: e.target.value}))} className="w-full bg-brand-dark border border-brand-gold/30 rounded-md p-2 text-brand-light" />
                  </div>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-brand-gold mb-4">Audience Targeting</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CheckboxDropdown label="Age" options={ageOptions} selected={settings.targetAge} setSelected={(val) => setSettings(prev => ({...prev, targetAge: val}))} />
                  <CheckboxDropdown label="Gender" options={genderOptions} selected={settings.targetGender} setSelected={(val) => setSettings(prev => ({...prev, targetGender: val}))} />
                  <CheckboxDropdown label="State" options={stateOptions} selected={settings.targetState} setSelected={(val) => setSettings(prev => ({...prev, targetState: val}))} />
                  <CheckboxDropdown label="City" options={cityOptions} selected={settings.targetCity} setSelected={(val) => setSettings(prev => ({...prev, targetCity: val}))} />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-brand-light-gray mb-1">Business Category</label>
                    <select value={settings.category} onChange={(e) => setSettings(prev => ({...prev, category: e.target.value}))} className="w-full bg-brand-dark border border-brand-gold/30 rounded-md p-2 text-brand-light">
                      {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
                <AudienceEstimator settings={settings} />
            </Card>
            
            <Card>
                <h2 className="text-xl font-bold text-brand-gold mb-4">AI Strategy</h2>
                <ToggleSwitch label="Ghost Strategy" description="Conservative, under-the-radar scaling to avoid auction volatility." isEnabled={settings.ghostStrategy} onToggle={() => setSettings(p => ({...p, ghostStrategy: !p.ghostStrategy}))} />
            </Card>
        </div>
    );
};

const GrowthEngineView = ({ settings, setSettings, onGenerateCopy, aiCopyIdeas, isGeneratingCopy, aiChatHistory, clearAiHistory }) => {
    const [activeHistory, setActiveHistory] = useState(null);

    const PlacementMatrix = () => {
        const placements = ['Feed', 'Reels', 'Stories', 'Marketplace', 'Search', 'In-Article'];
        const recommendations = { 'Reels': '🚀 Viral Potential', 'Marketplace': '🔥 High ROAS' };
        
        return (
            <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                         <tr className="border-b border-brand-gold/20">
                            <th className="p-2 text-brand-light-gray">Placement</th>
                            <th className="p-2 text-brand-light-gray text-center">Facebook</th>
                            <th className="p-2 text-brand-light-gray text-center">Instagram</th>
                        </tr>
                    </thead>
                    <tbody>
                        {placements.map(p => (
                            <tr key={p}>
                                <td className="p-2 text-brand-light">{p} {recommendations[p] && <span className="text-xs text-brand-gold">{recommendations[p]}</span>}</td>
                                <td className="p-2 text-center"><input type="checkbox" className="accent-brand-gold" /></td>
                                <td className="p-2 text-center"><input type="checkbox" className="accent-brand-gold" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-xl font-bold text-brand-gold mb-2">Viral Toolkit (FOMO & Urgency)</h2>
                <ToggleSwitch label="Dynamic Countdown Timers" description="Injects 'Sale ends in X hours!' into ad copy." isEnabled={settings.dynamicCountdown} onToggle={() => setSettings(p => ({...p, dynamicCountdown: !p.dynamicCountdown}))}/>
                <ToggleSwitch label="Limited Stock Alerts" description="Adds 'Only 11 left!' style text to drive scarcity." isEnabled={settings.stockAlerts} onToggle={() => setSettings(p => ({...p, stockAlerts: !p.stockAlerts}))}/>
                <ToggleSwitch label="Social Proof Injection" description="Features best comments or '200+ sold' overlays." isEnabled={settings.socialProofInjection} onToggle={() => setSettings(p => ({...p, socialProofInjection: !p.socialProofInjection}))}/>
            </Card>

            <Card>
                 <h2 className="text-xl font-bold text-brand-gold mb-2">Audience Engine (High-Intent Targeting)</h2>
                 <ToggleSwitch label="High-Value Lookalikes" description="Builds LAL audiences from your top 10% LTV customers." isEnabled={settings.highValueLookalikes} onToggle={() => setSettings(p => ({...p, highValueLookalikes: !p.highValueLookalikes}))} />
                 <ToggleSwitch label="Target Engaged Shoppers" description="Prioritizes users who recently used FB/IG Shops & Checkout." isEnabled={settings.targetEngagedShoppers} onToggle={() => setSettings(p => ({...p, targetEngagedShoppers: !p.targetEngagedShoppers}))} />
                 <ToggleSwitch label="Low-Intent Exclusion" description="Excludes users who mass-like ads but never convert." isEnabled={settings.lowIntentExclusion} onToggle={() => setSettings(p => ({...p, lowIntentExclusion: !p.lowIntentExclusion}))} />
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-brand-gold mb-2">Advanced Automation Suite</h2>
                <div className="space-y-4">
                  <ToggleSwitch label="Comment-to-DM Autopilot" description="Trigger a DM when users comment with a specific keyword." isEnabled={settings.commentToDm} onToggle={() => setSettings(p => ({...p, commentToDm: !p.commentToDm}))} />
                  <ToggleSwitch label="ROAS-based Bidding" description="Automatically adjusts bids to maintain your target ROAS." isEnabled={settings.roasBidding} onToggle={() => setSettings(p => ({...p, roasBidding: !p.roasBidding}))} />
                   <div className="space-y-2">
                        <label className="block text-sm font-medium text-brand-light-gray">Target ROAS</label>
                        <input type="number" value={settings.targetRoas} onChange={(e) => setSettings(p => ({...p, targetRoas: e.target.value}))} className="w-full bg-brand-dark border border-brand-gold/30 rounded-md p-2 text-brand-light" placeholder="e.g., 4.5" />
                   </div>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-brand-gold mb-2">Placement Optimizer</h2>
                <p className="text-brand-light-gray text-sm mb-2">Select the placements where your ads will run. AI will recommend the best ones based on your campaign goals.</p>
                <PlacementMatrix />
            </Card>
            
            <Card>
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-brand-gold mb-2">AI Ad Copy Generator</h2>
                    {aiChatHistory.length > 0 && (
                        <button onClick={clearAiHistory} className="text-xs text-brand-light-gray hover:text-red-400 flex items-center space-x-1">
                            <Trash2 size={12} />
                            <span>Clear History</span>
                        </button>
                    )}
                </div>
                <p className="text-brand-light-gray text-sm mb-4">Leverage Gemini to generate high-converting ad copy based on your strategic settings.</p>
                <button onClick={onGenerateCopy} disabled={isGeneratingCopy} className="w-full bg-brand-gold text-brand-dark font-bold py-2 px-4 rounded-md flex items-center justify-center disabled:bg-brand-gray">
                    {isGeneratingCopy ? <><Loader className="animate-spin mr-2" /> Generating...</> : <><Bot className="mr-2" /> Generate Ideas</>}
                </button>
                
                {aiCopyIdeas && (
                    <div className="mt-4 p-4 bg-brand-dark/50 rounded-md border border-brand-gold/20">
                         <div className="flex justify-between items-center">
                             <h3 className="text-lg font-bold text-brand-light mb-2">Generated Copy</h3>
                             <button onClick={() => navigator.clipboard.writeText(aiCopyIdeas)} className="text-xs text-brand-light-gray hover:text-brand-gold flex items-center space-x-1">
                                 <Copy size={12}/>
                                 <span>Copy</span>
                             </button>
                         </div>
                        <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: aiCopyIdeas.replace(/\n/g, '<br />') }} />
                    </div>
                )}
                
                 {aiChatHistory.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-lg font-bold text-brand-light mb-2">History</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {aiChatHistory.map((item, index) => (
                                <div key={index} className="bg-brand-dark/50 p-2 rounded-md border border-brand-gold/10 flex justify-between items-center">
                                    <p className="text-sm text-brand-light-gray truncate">Generated on {new Date(item.timestamp).toLocaleString()}</p>
                                    <button onClick={() => setActiveHistory(item.content)} className="text-xs text-brand-gold hover:underline">View</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Card>
            
            {activeHistory && (
                 <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={() => setActiveHistory(null)}>
                     <Card className="w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center border-b border-brand-gold/20 pb-2 mb-4">
                            <h2 className="text-xl font-bold text-brand-gold">Archived Copy</h2>
                            <button onClick={() => setActiveHistory(null)}><X className="text-brand-light-gray hover:text-brand-light" /></button>
                        </div>
                         <div className="flex-1 overflow-y-auto prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: activeHistory.replace(/\n/g, '<br />') }} />
                     </Card>
                 </div>
            )}
        </div>
    );
};


// --- MAIN APP COMPONENT ---

const App = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [campaigns, setCampaigns] = useState([]);
  const [leads, setLeads] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeChatLead, setActiveChatLead] = useState(null);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [aiCopyIdeas, setAiCopyIdeas] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState([]);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState('connecting'); // connecting, connected, error
  
  const [settings, setSettings] = useState({
      theme: 'dark',
      metaConnected: true,
      whatsAppConnected: true,
      googleSheetsConnected: false,
      n8nConnected: false,
      googleSheetId: '',
      n8nWebhookUrl: '',
      targetAge: ['25-34'],
      targetGender: ['Women'],
      targetState: ['Maharashtra'],
      targetCity: ['Mumbai', 'Pune'],
      category: 'Fashion Jewellery',
      psychologicalAngle: 'Exclusivity',
      dynamicCountdown: true,
      stockAlerts: true,
      socialProofInjection: false,
      highValueLookalikes: true,
      targetEngagedShoppers: true,
      lowIntentExclusion: false,
      commentToDm: true,
      roasBidding: true,
      targetRoas: '4.5',
      ghostStrategy: false,
  });

  const fetchData = useCallback(async () => {
    setServerStatus('connecting');
    setError(null);
    try {
      const [campaignResponse, crmResponse] = await Promise.all([
        fetch('/api/insights/campaign'),
        fetch('/api/crm/crm-data')
      ]);

      if (!campaignResponse.ok || !crmResponse.ok) {
        throw new Error('Network response from server was not ok.');
      }

      const campaignData = await campaignResponse.json();
      const { leads, auditLogs } = await crmResponse.json();
      
      setCampaigns(campaignData);
      setLeads(leads);
      setAuditLogs(auditLogs);
      setServerStatus('connected');

    } catch (error) {
      console.error("Could not connect to live server:", error);
      setError('Could not connect to live server. Displaying cached data.');
      setServerStatus('error');
      // Fallback to cached data if server fails
      const fallbackData = await mockApiService.getFallbackData();
      setCampaigns(fallbackData.campaigns);
      setLeads(fallbackData.leads);
      setAuditLogs(fallbackData.auditLogs);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateConnection = (connectionType) => {
    setSettings(prev => ({ ...prev, [`${connectionType}Connected`]: !prev[`${connectionType}Connected`]}));
  };
  
  const handleUpdateLeadStatus = async (leadId, status) => {
    try {
        const response = await fetch(`/api/crm/leads/${leadId}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error('Failed to update lead status on server');
        // Refresh all data from server to ensure UI is consistent
        await fetchData();
    } catch (error) {
        console.error("Failed to update lead status:", error);
        setError("Failed to update lead status. Please try again.");
    }
  };

  const handleSendMessage = async (leadId, message) => {
      try {
        const response = await fetch(`/api/crm/leads/${leadId}/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
        });
        if (!response.ok) throw new Error('Failed to send message on server');
        // Refresh all data from server to get new message and potential reply
        await fetchData();
        // If the chat modal is open for this lead, update its state
        setActiveChatLead(prevLead => {
          if (prevLead && prevLead.id === leadId) {
             // We need the *very latest* lead info after the fetch.
             // This is a bit tricky, so for now we'll rely on the re-render.
             // A more advanced state management would handle this better.
          }
          return prevLead;
        });

    } catch (error) {
        console.error("Failed to send message:", error);
        setError("Failed to send message. Please try again.");
    }
  };

 const handleGenerateCopy = async () => {
  setIsGeneratingCopy(true);
  try {
    const prompt = `Generate 3 ad copy variations for ${settings.category} targeting ${settings.targetCity.join(', ')}. Use angle: ${settings.psychologicalAngle}. Include short headlines, body, CTA.`;
    const resp = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const json = await resp.json();
    if (json?.text) {
      setAiCopyIdeas(json.text);
      setAiChatHistory(prev => [...prev, { timestamp: new Date(), content: json.text }]);
    } else {
      setAiCopyIdeas('AI returned empty response.');
    }
  } catch (err) {
    console.error('generate error', err);
    setAiCopyIdeas('Error: Could not generate ad copy.');
  } finally {
    setIsGeneratingCopy(false);
  }
};


  const clearAiHistory = () => {
    setAiCopyIdeas('');
    setAiChatHistory([]);
  };

  const renderView = () => {
    switch(activeView) {
      case 'dashboard': return <DashboardView campaigns={campaigns} />;
      case 'campaigns': return <CampaignsView campaigns={campaigns} />;
      case 'crm': return <CRMView leads={leads} onStatusChange={handleUpdateLeadStatus} onOpenChat={setActiveChatLead} />;
      case 'audit': return <AuditLogView logs={auditLogs} />;
      case 'settings': return <SettingsView settings={settings} setSettings={setSettings} onUpdateConnection={handleUpdateConnection} />;
      case 'growth': return <GrowthEngineView settings={settings} setSettings={setSettings} onGenerateCopy={handleGenerateCopy} aiCopyIdeas={aiCopyIdeas} isGeneratingCopy={isGeneratingCopy} aiChatHistory={aiChatHistory} clearAiHistory={clearAiHistory} />;
      default: return <DashboardView campaigns={campaigns} />;
    }
  }

  return (
    <div className="text-brand-light pb-24">
      <Header settings={settings} setSettings={setSettings} serverStatus={serverStatus} />
      
      <main className="max-w-6xl mx-auto p-4 pt-24">
        {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-4 flex items-center space-x-2">
                <AlertTriangle size={20} />
                <span>{error}</span>
            </div>
        )}
        {renderView()}
      </main>

      {activeChatLead && <ChatModal lead={activeChatLead} onClose={() => setActiveChatLead(null)} onSendMessage={handleSendMessage} />}
      
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

export default App;
