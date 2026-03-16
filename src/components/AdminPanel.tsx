import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, MapPin, Phone, Globe, Mail, Clock, 
  Image as ImageIcon, CheckCircle, Clock3, X, LogOut, ExternalLink,
  LayoutDashboard, Users, Settings, Filter,
  MessageCircle, ChevronRight, Building2, Calendar, ArrowUpRight,
  PlayCircle, MoreHorizontal, AlertCircle, CheckCircle2, User,
  TrendingUp, ArrowRight, Menu
} from 'lucide-react';

// Datos de prueba para que el usuario pueda ver el diseño si su base de datos está vacía
const MOCK_CLIENTS = [
  {
    id: 'demo-1',
    businessName: 'La Trattoria del Centro',
    ownerName: 'María González',
    email: 'maria@latrattoria.demo',
    phone: '+52 55 1234 5678',
    category: 'Restaurante Italiano',
    status: 'pending',
    created_at: new Date().toISOString(),
    city: 'Ciudad de México',
    country: 'México',
    address: 'Av. Principal 123, Centro Histórico',
    description: 'Restaurante familiar de comida italiana tradicional. Buscamos mejorar nuestra presencia en Google Maps para atraer más turistas.'
  },
  {
    id: 'demo-2',
    businessName: 'TechFix Reparaciones',
    ownerName: 'Carlos Rodríguez',
    email: 'carlos@techfix.demo',
    phone: '+34 600 123 456',
    category: 'Servicios Técnicos',
    status: 'contacted',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    city: 'Madrid',
    country: 'España',
    address: 'Calle de la Tecnología 45',
    description: 'Reparación de celulares y computadoras. Necesitamos aparecer cuando la gente busque "reparar celular cerca de mi".'
  },
  {
    id: 'demo-3',
    businessName: 'Spa Relax & Belleza',
    ownerName: 'Ana Smith',
    email: 'ana@sparelax.demo',
    phone: '+1 305 555 1234',
    category: 'Salud y Belleza',
    status: 'completed',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    city: 'Miami',
    country: 'Estados Unidos',
    address: '123 Ocean Drive, Suite 200',
    description: 'Centro de masajes y tratamientos faciales de lujo.'
  }
];

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, pending, contacted, completed
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Simple auth for demo purposes using environment variable
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    if (password === adminPassword) {
      setIsAuthenticated(true);
      fetchClients();
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    // Si estamos en modo demo, solo actualizamos el estado local
    if (isDemoMode || id.startsWith('demo-')) {
      const updateList = (list: any[]) => list.map(c => c.id === id ? { ...c, status: newStatus } : c);
      setClients(updateList(clients));
      if (selectedClient?.id === id) {
        setSelectedClient({ ...selectedClient, status: newStatus });
      }
      return;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      setClients(clients.map(c => c.id === id ? { ...c, status: newStatus } : c));
      if (selectedClient?.id === id) {
        setSelectedClient({ ...selectedClient, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado');
    }
  };

  const enableDemoMode = () => {
    setIsDemoMode(true);
    setClients(MOCK_CLIENTS);
  };

  const displayClients = clients;

  const filteredClients = displayClients.filter(c => {
    const matchesSearch = 
      c.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || c.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  // Stats calculations
  const totalLeads = displayClients.length;
  const pendingLeads = displayClients.filter(c => c.status === 'pending').length;
  const contactedLeads = displayClients.filter(c => c.status === 'contacted').length;
  const completedLeads = displayClients.filter(c => c.status === 'completed').length;
  const conversionRate = totalLeads > 0 ? Math.round((completedLeads / totalLeads) * 100) : 0;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0B] flex items-center justify-center p-4 font-sans z-[100] overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-bg-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-bg-pulse" style={{ animationDelay: '2s' }}></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-8 sm:p-10 rounded-3xl w-full max-w-[420px] shadow-2xl relative z-10"
        >
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center font-display font-bold text-3xl text-white shadow-lg shadow-blue-500/30 ring-1 ring-white/20">
                V
              </div>
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">Vistoo CRM</h1>
            <p className="text-zinc-400 text-sm">Acceso exclusivo para administradores</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 ml-1">Contraseña de acceso</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 bg-zinc-950/50 border border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white text-sm placeholder:text-zinc-600"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-white hover:bg-zinc-100 text-zinc-900 font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-white/10 text-sm flex items-center justify-center gap-2 group"
            >
              Iniciar Sesión
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const getAvatarGradient = (name: string) => {
    const gradients = [
      'bg-gradient-to-br from-blue-500 to-indigo-600',
      'bg-gradient-to-br from-emerald-400 to-teal-600',
      'bg-gradient-to-br from-amber-400 to-orange-600',
      'bg-gradient-to-br from-rose-400 to-red-600',
      'bg-gradient-to-br from-violet-500 to-purple-700',
      'bg-gradient-to-br from-cyan-400 to-blue-600',
    ];
    if (!name) return gradients[0];
    const charCode = name.charCodeAt(0);
    return gradients[charCode % gradients.length];
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            Cliente Activo
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200/60 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse"></span>
            En Gestión
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/60 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
            Nuevo Lead
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 selection:bg-blue-200 selection:text-blue-900">
      
      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside className={`w-72 bg-[#0A0A0B] text-zinc-400 flex-col flex shrink-0 fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center px-8 border-b border-white/5 shrink-0">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-display font-bold text-lg text-white shadow-lg shadow-blue-500/20 mr-3 ring-1 ring-white/20">
            V
          </div>
          <span className="font-display font-bold text-xl text-white tracking-tight">Vistoo CRM</span>
          <button className="ml-auto md:hidden text-zinc-500 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-8 px-4 custom-scrollbar">
          <div className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-4 px-4">Plataforma</div>
          <nav className="space-y-1.5 mb-10">
            <button className="w-full flex items-center gap-3 bg-white/10 text-white px-4 py-3 rounded-xl font-medium transition-all text-sm ring-1 ring-white/5 shadow-sm">
              <LayoutDashboard size={18} className="text-blue-400" />
              Panel de Leads
              <span className="ml-auto bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingLeads}</span>
            </button>
            <button className="w-full flex items-center gap-3 text-zinc-400 hover:bg-white/5 hover:text-zinc-200 px-4 py-3 rounded-xl font-medium transition-all text-sm">
              <Users size={18} />
              Directorio
            </button>
          </nav>

          <div className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-4 px-4">Configuración</div>
          <nav className="space-y-1.5">
            <button className="w-full flex items-center gap-3 text-zinc-400 hover:bg-white/5 hover:text-zinc-200 px-4 py-3 rounded-xl font-medium transition-all text-sm">
              <Settings size={18} />
              Ajustes
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-white/5 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold text-xs shrink-0 ring-1 ring-white/10">
              AD
            </div>
            <div className="overflow-hidden flex-1">
              <div className="text-sm font-semibold text-zinc-200 truncate">Administrador</div>
              <div className="text-[11px] text-zinc-500 truncate">admin@vistoo.com</div>
            </div>
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="text-zinc-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
              title="Cerrar Sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 md:ml-72 min-h-screen relative">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shrink-0 supports-[backdrop-filter]:bg-white/60">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-2xl font-display font-bold text-slate-900 hidden sm:block tracking-tight">Gestión de Solicitudes</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block w-80 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar clientes, correos..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-100/50 border border-slate-200 rounded-full focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium placeholder:text-slate-400"
              />
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm sm:hidden">
              AD
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-8 overflow-x-hidden max-w-[1600px] mx-auto w-full">
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Leads</div>
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600"><Users size={16}/></div>
              </div>
              <div className="text-4xl font-display font-bold text-slate-900 mb-2">{totalLeads}</div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-md">
                <TrendingUp size={14} /> +12% este mes
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nuevos</div>
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><AlertCircle size={16}/></div>
              </div>
              <div className="text-4xl font-display font-bold text-slate-900 mb-2 relative z-10">{pendingLeads}</div>
              <div className="text-sm font-medium text-slate-500 relative z-10">Atención requerida</div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">En Gestión</div>
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600"><Clock3 size={16}/></div>
              </div>
              <div className="text-4xl font-display font-bold text-slate-900 mb-2 relative z-10">{contactedLeads}</div>
              <div className="text-sm font-medium text-slate-500 relative z-10">En proceso de venta</div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Convertidos</div>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600"><CheckCircle2 size={16}/></div>
              </div>
              <div className="flex items-baseline gap-2 mb-2 relative z-10">
                <div className="text-4xl font-display font-bold text-slate-900">{completedLeads}</div>
                <div className="text-lg font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">({conversionRate}%)</div>
              </div>
              <div className="text-sm font-medium text-slate-500 relative z-10">Tasa de conversión</div>
            </div>
          </div>

          {/* Table Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 flex flex-col overflow-hidden">
            
            {/* Tabs & Filters */}
            <div className="border-b border-slate-200/80 px-6 py-5 flex flex-wrap gap-4 items-center justify-between bg-white">
              <div className="flex gap-1 p-1 bg-slate-100/80 rounded-xl">
                <button onClick={() => setActiveTab('all')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}>Todos</button>
                <button onClick={() => setActiveTab('pending')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'pending' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}>Nuevos</button>
                <button onClick={() => setActiveTab('contacted')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'contacted' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}>En Gestión</button>
                <button onClick={() => setActiveTab('completed')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'completed' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}>Clientes</button>
              </div>
              <button className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-all active:scale-95">
                <Filter size={16} /> Filtrar
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-80">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  <div className="text-sm font-medium text-slate-500">Cargando datos...</div>
                </div>
              </div>
            ) : displayClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-200 shadow-sm">
                  <LayoutDashboard className="text-slate-400" size={32} />
                </div>
                <h3 className="text-xl font-display font-bold text-slate-900 mb-2">Tu CRM está listo</h3>
                <p className="text-slate-500 text-base max-w-md mb-8">Aún no tienes solicitudes registradas. Cuando los usuarios completen el formulario, aparecerán aquí.</p>
                <button 
                  onClick={enableDemoMode}
                  className="bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold py-3 px-6 rounded-xl transition-all shadow-sm border border-slate-200 flex items-center gap-2 hover:shadow-md active:scale-95"
                >
                  <PlayCircle size={18} className="text-blue-600" />
                  Cargar Datos de Prueba
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-white border-b border-slate-200/80 text-slate-500 text-xs uppercase tracking-wider font-bold">
                      <th className="px-6 py-5">Negocio / Contacto</th>
                      <th className="px-6 py-5">Ubicación</th>
                      <th className="px-6 py-5">Fecha de Ingreso</th>
                      <th className="px-6 py-5">Estado</th>
                      <th className="px-6 py-5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredClients.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-24 text-center">
                          <div className="text-slate-400 mb-2"><Search size={32} className="mx-auto opacity-50" /></div>
                          <div className="text-slate-600 font-medium">No se encontraron resultados para tu búsqueda.</div>
                        </td>
                      </tr>
                    ) : (
                      filteredClients.map((client, index) => {
                        const gradientClass = getAvatarGradient(client.businessName || '');

                        return (
                        <tr key={client.id} className="hover:bg-slate-50/80 transition-colors duration-200 group cursor-pointer" onClick={() => setSelectedClient(client)}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-11 h-11 rounded-xl ${gradientClass} flex items-center justify-center font-display font-bold text-sm text-white shrink-0 shadow-sm ring-1 ring-black/5`}>
                                {client.businessName?.substring(0,2).toUpperCase() || 'NA'}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm mb-0.5">{client.businessName || 'Sin Nombre'}</div>
                                <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                                  <User size={12} className="opacity-70"/> {client.ownerName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                              <MapPin size={14} className="text-slate-400" />
                              {client.country || 'No especificado'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-slate-900">
                              {new Date(client.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                              <Clock size={12} className="opacity-70"/>
                              {new Date(client.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(client.status)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                              {client.phone && (
                                <a 
                                  href={`https://wa.me/${client.phone.replace(/\D/g,'')}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-[#25D366] hover:text-[#25D366] hover:bg-[#25D366]/10 flex items-center justify-center transition-all shadow-sm"
                                  title="Enviar WhatsApp"
                                >
                                  <MessageCircle size={16} />
                                </a>
                              )}
                              <a 
                                href={`mailto:${client.email}`}
                                className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all shadow-sm"
                                title="Enviar Email"
                              >
                                <Mail size={16} />
                              </a>
                              <button 
                                onClick={() => setSelectedClient(client)}
                                className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-slate-800 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-all shadow-sm"
                                title="Ver Detalles"
                              >
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )})
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* DETAIL SLIDE-OVER (CRM STYLE) */}
      <AnimatePresence>
        {selectedClient && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex justify-end"
            onClick={() => setSelectedClient(null)}
          >
            <motion.div 
              initial={{ x: '100%', boxShadow: '-20px 0 40px rgba(0,0,0,0)' }}
              animate={{ x: 0, boxShadow: '-20px 0 40px rgba(0,0,0,0.1)' }}
              exit={{ x: '100%', boxShadow: '-20px 0 40px rgba(0,0,0,0)' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full max-w-2xl bg-white h-full overflow-y-auto flex flex-col font-sans rounded-l-3xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-white px-8 pt-8 pb-0 shrink-0 sticky top-0 z-20 border-b border-slate-200/80">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 rounded-2xl ${getAvatarGradient(selectedClient.businessName || '')} flex items-center justify-center font-display font-bold text-2xl text-white shrink-0 shadow-md ring-1 ring-black/5`}>
                      {selectedClient.businessName?.substring(0,1).toUpperCase() || 'N'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-bold text-slate-900 leading-tight mb-1">{selectedClient.businessName}</h2>
                      <div className="flex items-center gap-3 mt-2">
                        {getStatusBadge(selectedClient.status)}
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full">
                          <Calendar size={12} /> Ingresado el {new Date(selectedClient.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedClient(null)}
                    className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Quick Action Bar */}
                <div className="flex flex-wrap gap-3 mb-8">
                  {selectedClient.phone && (
                    <a href={`https://wa.me/${selectedClient.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md active:scale-95">
                      <MessageCircle size={18} /> WhatsApp
                    </a>
                  )}
                  <a href={`mailto:${selectedClient.email}`} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md active:scale-95">
                    <Mail size={18} /> Email
                  </a>
                  {selectedClient.phone && (
                    <a href={`tel:${selectedClient.phone}`} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm active:scale-95">
                      <Phone size={18} /> Llamar
                    </a>
                  )}
                  
                  <div className="ml-auto flex gap-2">
                    <button 
                      onClick={() => updateStatus(selectedClient.id, 'pending')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm border ${selectedClient.status === 'pending' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                    >
                      <ArrowUpRight size={16} /> Nuevo
                    </button>
                    <button 
                      onClick={() => updateStatus(selectedClient.id, 'contacted')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm border ${selectedClient.status === 'contacted' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                    >
                      <Clock3 size={16} /> En Gestión
                    </button>
                    <button 
                      onClick={() => updateStatus(selectedClient.id, 'completed')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm border ${selectedClient.status === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                    >
                      <CheckCircle2 size={16} /> Convertido
                    </button>
                  </div>
                </div>

                {/* Pipeline Steps */}
                <div className="flex gap-8 -mb-px">
                  <div className="pb-4 text-sm font-bold text-blue-600 border-b-2 border-blue-600 cursor-pointer whitespace-nowrap">Información General</div>
                  <div className="pb-4 text-sm font-semibold text-slate-500 hover:text-slate-900 border-b-2 border-transparent cursor-pointer whitespace-nowrap transition-colors">Archivos & Fotos</div>
                  <div className="pb-4 text-sm font-semibold text-slate-500 hover:text-slate-900 border-b-2 border-transparent cursor-pointer whitespace-nowrap transition-colors">Notas Internas</div>
                </div>
              </div>

              <div className="p-8 flex-1 bg-[#F8FAFC]">
                <div className="space-y-6">
                  
                  {/* Bento Grid Layout for Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Contact Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm md:col-span-2">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                        <User size={16} className="text-blue-500"/> Contacto Principal
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                          <div className="text-xs font-semibold text-slate-500 mb-1.5">Nombre Completo</div>
                          <div className="text-sm font-bold text-slate-900">{selectedClient.ownerName}</div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-500 mb-1.5">Teléfono Directo</div>
                          <div className="text-sm font-bold text-slate-900">{selectedClient.phone || 'No especificado'}</div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-500 mb-1.5">Correo Electrónico</div>
                          <div className="text-sm font-bold text-blue-600 hover:underline cursor-pointer truncate" title={selectedClient.email}>{selectedClient.email || 'No especificado'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Business Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                        <Building2 size={16} className="text-blue-500"/> Datos del Negocio
                      </h3>
                      <div className="space-y-5">
                        <div>
                          <div className="text-xs font-semibold text-slate-500 mb-1.5">Categoría / Industria</div>
                          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
                            {selectedClient.category || 'No especificada'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-500 mb-1.5">Sitio Web</div>
                          {selectedClient.website ? (
                            <a href={selectedClient.website} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1 transition-colors">
                              {selectedClient.website} <ArrowUpRight size={14} />
                            </a>
                          ) : (
                            <div className="text-sm text-slate-400 italic font-medium">No cuenta con sitio web</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Location Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                        <MapPin size={16} className="text-blue-500"/> Ubicación
                      </h3>
                      <div className="space-y-5">
                        <div>
                          <div className="text-xs font-semibold text-slate-500 mb-1.5">Dirección Exacta</div>
                          <div className="text-sm font-bold text-slate-900 leading-snug">{selectedClient.address || 'No especificada'}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs font-semibold text-slate-500 mb-1.5">Ciudad</div>
                            <div className="text-sm font-bold text-slate-900">{selectedClient.city || '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-500 mb-1.5">País</div>
                            <div className="text-sm font-bold text-slate-900">{selectedClient.country || '-'}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm md:col-span-2">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <MessageCircle size={16} className="text-blue-500"/> Descripción / Notas del cliente
                      </h3>
                      <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-5 rounded-xl border border-slate-100 font-medium">
                        {selectedClient.description || 'Sin notas adicionales.'}
                      </div>
                    </div>

                    {/* Schedule Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm md:col-span-2">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                        <Clock size={16} className="text-blue-500"/> Horario Comercial
                      </h3>
                      {selectedClient.schedule ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                          {Object.entries(selectedClient.schedule).map(([day, data]: [string, any]) => {
                            const dayNames: Record<string, string> = {
                              monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles',
                              thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo'
                            };
                            return (
                              <div key={day} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                                <span className="text-sm font-medium text-slate-600">{dayNames[day]}</span>
                                <span className={`text-sm font-bold ${data.closed ? 'text-slate-400 italic' : 'text-slate-900 bg-slate-50 px-2 py-1 rounded-md'}`}>
                                  {data.closed ? 'Cerrado' : `${data.open} - ${data.close}`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500 italic bg-slate-50 p-5 rounded-xl border border-slate-100 text-center font-medium">No se especificaron horarios.</div>
                      )}
                    </div>

                    {/* Photos Section */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm md:col-span-2">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                        <ImageIcon size={16} className="text-blue-500"/> Archivos Adjuntos ({selectedClient.photo_urls?.length || 0})
                      </h3>
                      {selectedClient.photo_urls && selectedClient.photo_urls.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {selectedClient.photo_urls.map((url: string, i: number) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer" className="block aspect-square rounded-xl overflow-hidden border border-slate-200 hover:border-blue-500 transition-all group relative shadow-sm hover:shadow-md">
                              <img src={url} alt={`Foto ${i+1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <ExternalLink className="text-white" size={24} />
                              </div>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 ring-1 ring-slate-200">
                            <ImageIcon className="text-slate-400" size={24} />
                          </div>
                          <div className="text-base font-bold text-slate-700 mb-1">Sin fotografías</div>
                          <div className="text-sm font-medium text-slate-500">El cliente no subió imágenes de su negocio.</div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
