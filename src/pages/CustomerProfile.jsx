import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { User, Phone, Mail, MapPin, ArrowLeft, Ruler, ShoppingBag, FileText, CheckCircle2, Edit3, Quote, Save, X, Users, Share2, History, Plus, Trash2 } from 'lucide-react';

// Helper to format legacy camelCase keys (e.g., 'shoulderToNipple' -> 'Shoulder To Nipple')
const formatLabel = (key) => {
  const result = key.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

// Keys to ignore when displaying dynamic measurement data
const ignoreKeys = [
  '_id', 
  'title', 
  'unit', 
  'recordedDate', 
  'createdAt', 
  'updatedAt', 
  '__v', 
  'subProfileId', 
  'targetType', 
  'measurementsData',
  'values',
  'user',
  'customer',
  'gender',
  '__t',
  'id'
];

export default function CustomerProfile() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('measurements');

  // Notes State
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Orders State
  const [customerOrders, setCustomerOrders] = useState([]);

  // Measurements History State
  const [measurementsList, setMeasurementsList] = useState([]);
  const [selectedMeasurementIndex, setSelectedMeasurementIndex] = useState(0);
  const [measurements, setMeasurements] = useState({ title: '', unit: 'inches' });
  const [hasMeasurements, setHasMeasurements] = useState(false);
  const [isEditingMeasurements, setIsEditingMeasurements] = useState(false);
  const [isSavingMeasurements, setIsSavingMeasurements] = useState(false);
  const [measurementsSaved, setMeasurementsSaved] = useState(false);
  
  // Dynamic Fields State for New Measurements
  const [activeFields, setActiveFields] = useState([{ part: '', value: '' }]);

  // Sub-Profiles State
  const [showSubModal, setShowSubModal] = useState(false);
  const [subFormData, setSubFormData] = useState({ name: '', relationship: 'Son', gender: 'Male', notes: '' });

  // Sub-Profile Measurements State
  const [showSubMeasurementModal, setShowSubMeasurementModal] = useState(false);
  const [activeSubProfile, setActiveSubProfile] = useState(null);
  const [subMeasurements, setSubMeasurements] = useState({ title: '', unit: 'inches' });
  const [selectedSubIndex, setSelectedSubIndex] = useState(0);
  const [isSavingSubMeasurements, setIsSavingSubMeasurements] = useState(false);
  const [isEditingSubMeasurements, setIsEditingSubMeasurements] = useState(false);
  
  // Dynamic Fields State for Sub-Profiles
  const [activeSubFields, setActiveSubFields] = useState([{ part: '', value: '' }]);

  const normalizeData = (data) => {
    if (!data) return {};
    let flat = { ...data };
    if (data.measurementsData) {
      flat = { ...flat, ...data.measurementsData };
    }
    if (data.values) {
      flat = { ...flat, ...data.values };
    }
    return flat;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const custRes = await api.get(`/customers/${id}`);
        let customerData = custRes.data.data;
        setNotes(customerData.notes || '');

        const measRes = await api.get(`/measurements/customer/${id}`);
        const allMeasurements = measRes.data.data || [];

        const mainMeasurements = allMeasurements
          .filter(m => !m.subProfileId && m.targetType !== 'subProfile')
          .map(normalizeData);

        if (mainMeasurements.length > 0) {
          setMeasurementsList(mainMeasurements);
          setMeasurements(mainMeasurements[0]);
          setHasMeasurements(true);
        } else {
          setHasMeasurements(false);
        }

        const straySubMeasurements = allMeasurements
          .filter(m => m.subProfileId || m.targetType === 'subProfile')
          .map(normalizeData);

        if (customerData.subProfiles) {
          customerData.subProfiles = customerData.subProfiles.map(sub => {
            const straysForThisSub = straySubMeasurements.filter(m => String(m.subProfileId) === String(sub._id));
            let existingHistory = sub.measurements || [];
            if (!Array.isArray(existingHistory)) existingHistory = typeof existingHistory === 'object' ? [existingHistory] : [];
            existingHistory = existingHistory.map(normalizeData);

            const combined = [...existingHistory, ...straysForThisSub].sort((a, b) =>
              new Date(b.createdAt || b.recordedDate || Date.now()) - new Date(a.createdAt || a.recordedDate || Date.now())
            );
            return { ...sub, measurements: combined };
          });
        }

        setCustomer(customerData);
      } catch (err) {
        console.error("Failed to fetch profile data", err);
      } finally {
        setLoading(false);
      }

      try {
        const ordersRes = await api.get('/orders');
        const specificOrders = (ordersRes.data.data || []).filter(order =>
          (order.customer?._id === id) || (order.customer === id)
        );
        setCustomerOrders(specificOrders);
      } catch (err) {
        console.error("Failed to fetch orders", err);
        setCustomerOrders([]);
      }
    };
    fetchData();
  }, [id]);

  // Dynamic Field Handlers (Main Profile)
  const handleDynamicFieldChange = (index, key, val) => {
    const updated = [...activeFields];
    updated[index][key] = val;
    setActiveFields(updated);
  };
  const addDynamicField = () => setActiveFields([...activeFields, { part: '', value: '' }]);
  const removeDynamicField = (index) => setActiveFields(activeFields.filter((_, i) => i !== index));

  // Dynamic Field Handlers (Sub Profile)
  const handleSubFieldChange = (index, key, val) => {
    const updated = [...activeSubFields];
    updated[index][key] = val;
    setActiveSubFields(updated);
  };
  const addSubField = () => setActiveSubFields([...activeSubFields, { part: '', value: '' }]);
  const removeSubField = (index) => setActiveSubFields(activeSubFields.filter((_, i) => i !== index));

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    setNotesSaved(false);
    try {
      const response = await api.put(`/customers/${id}`, { notes });
      setCustomer(response.data.data);
      setNotesSaved(true);
      setIsEditingNotes(false);
      setTimeout(() => setNotesSaved(false), 3000);
    } catch (err) {
      alert("Failed to save notes. Please try again.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleSaveMeasurements = async () => {
    const payload = { 
      title: measurements.title || 'Custom Style', 
      unit: measurements.unit || 'inches' 
    };
    
    let hasData = false;
    activeFields.forEach(f => {
      if (f.part.trim() !== '' && f.value !== '') {
        payload[f.part.trim()] = f.value;
        hasData = true;
      }
    });

    if (!hasData) {
      alert('Please fill in at least one measurement part and value before saving.');
      return;
    }

    setIsSavingMeasurements(true);
    setMeasurementsSaved(false);
    try {
      const response = await api.post(`/measurements/customer/${id}`, payload);
      const updatedList = [normalizeData(response.data.data), ...measurementsList];
      setMeasurementsList(updatedList);
      setMeasurements(updatedList[0]);
      setSelectedMeasurementIndex(0);
      setHasMeasurements(true);
      setIsEditingMeasurements(false);
      setMeasurementsSaved(true);
      setTimeout(() => setMeasurementsSaved(false), 3000);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save measurements.");
    } finally {
      setIsSavingMeasurements(false);
    }
  };

  const handleAddSubProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/customers/${id}/sub-profiles`, subFormData);
      setCustomer(response.data.data);
      setShowSubModal(false);
      setSubFormData({ name: '', relationship: 'Son', gender: 'Male', notes: '' });
    } catch (err) {
      alert('Failed to add related profile.');
    }
  };

  const handleOpenSubMeasurements = (sub) => {
    setActiveSubProfile(sub);
    const historyList = sub.measurements || [];
    if (historyList.length > 0) {
      setSubMeasurements(historyList[0]);
      setSelectedSubIndex(0);
      setIsEditingSubMeasurements(false);
    } else {
      setSubMeasurements({ title: '', unit: 'inches' });
      setActiveSubFields([{ part: '', value: '' }]);
      setSelectedSubIndex(0);
      setIsEditingSubMeasurements(true);
    }
    setShowSubMeasurementModal(true);
  };

  const handleSaveSubMeasurements = async (e) => {
    e.preventDefault();

    const payload = { 
      title: subMeasurements.title || 'Custom Style', 
      unit: subMeasurements.unit || 'inches' 
    };
    
    let hasData = false;
    activeSubFields.forEach(f => {
      if (f.part.trim() !== '' && f.value !== '') {
        payload[f.part.trim()] = f.value;
        hasData = true;
      }
    });

    if (!hasData) {
      alert('Please fill in at least one measurement part and value before saving.');
      return;
    }

    setIsSavingSubMeasurements(true);
    try {
      const response = await api.put(`/customers/${id}/sub-profiles/${activeSubProfile._id}/measurements`, payload);
      const updatedCust = response.data.data;

      const freshSub = updatedCust.subProfiles.find(s => String(s._id) === String(activeSubProfile._id));

      let freshHistory = freshSub.measurements || [];
      if (!Array.isArray(freshHistory)) freshHistory = [freshHistory];
      freshHistory = freshHistory.map(normalizeData);
      freshSub.measurements = freshHistory;

      setCustomer(updatedCust);
      setActiveSubProfile(freshSub);
      setSubMeasurements(freshHistory[0]);
      setSelectedSubIndex(0);
      setIsEditingSubMeasurements(false);
    } catch (err) {
      console.error("Sub measurement error:", err);
      alert(err.response?.data?.error || 'Failed to save sub-profile measurements.');
    } finally {
      setIsSavingSubMeasurements(false);
    }
  };

  const handleShareWhatsApp = (targetName, cid, sid = '') => {
    const formUrl = `${window.location.origin}/measure-form?token=${cid}${sid ? `&sid=${sid}` : ''}`;
    const message = encodeURIComponent(`Hello ${targetName}, please click this secure link to fill in your clothing measurements for TailorPro: ${formUrl}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const DisplayValue = ({ label, value, unit }) => (
    value !== undefined && value !== null && value !== '' ? (
      <div className="bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100 flex flex-col justify-center">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 truncate" title={label}>{formatLabel(label)}</p>
        <p className="text-base sm:text-lg font-black text-brand-dark">{value} <span className="text-xs font-bold text-gray-400">{unit || 'inches'}</span></p>
      </div>
    ) : null
  );

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!customer) return <div className="text-center py-20 px-4"><h2 className="text-2xl font-bold text-gray-700">Customer not found</h2><Link to="/customers" className="text-primary hover:underline mt-4 inline-block font-bold">Return to Customer List</Link></div>;

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto pb-20">
      
      {/* Autocomplete Suggestions for Measurement Parts */}
      <datalist id="measurement-parts">
        <option value="Shoulder" />
        <option value="Bust" />
        <option value="Waist" />
        <option value="Hips" />
        <option value="Gown Length" />
        <option value="Skirt Length" />
        <option value="Trouser Length" />
        <option value="Sleeve Length" />
        <option value="Arm Hole" />
        <option value="Thigh" />
      </datalist>

      <Link to="/customers" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Customers
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

        {/* Left Column: Client Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 text-primary font-extrabold rounded-3xl flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-4 shadow-sm">
              {customer.fullName.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-brand-dark break-words">{customer.fullName}</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{customer.gender} • Since {new Date(customer.createdAt).toLocaleDateString()}</p>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => handleShareWhatsApp(customer.fullName, customer._id)}
                className="w-full py-3.5 px-4 bg-emerald-600 text-white font-bold rounded-2xl text-xs sm:text-sm hover:bg-emerald-700 flex items-center justify-center text-center transition-all shadow-md shadow-emerald-600/20"
              >
                <Share2 className="w-4 h-4 mr-2 shrink-0" /> WhatsApp Link
              </button>
            </div>

            <div className="mt-8 space-y-4 text-left border-t border-gray-100 pt-6">
              <div className="flex items-center space-x-3 text-gray-600">
                <Phone className="w-5 h-5 text-gray-400 shrink-0" />
                <span className="font-bold text-sm">{customer.phone}</span>
              </div>
              {customer.email && (
                <div className="flex items-center space-x-3 text-gray-600">
                  <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                  <span className="font-bold text-sm break-all">{customer.email}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-start space-x-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <span className="font-bold text-sm leading-snug">{customer.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Work Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Tab Header */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap border-b border-gray-100 bg-gray-50/50">
              <button onClick={() => setActiveTab('measurements')} className={`sm:flex-1 py-4 px-3 text-xs sm:text-sm font-bold flex items-center justify-center border-b-2 transition-all ${activeTab === 'measurements' ? 'border-primary text-primary bg-white shadow-sm' : 'border-transparent text-gray-500 hover:bg-white/50'}`}><Ruler className="w-4 h-4 mr-2 shrink-0" /> <span className="truncate">Measurements</span></button>
              <button onClick={() => setActiveTab('subProfiles')} className={`sm:flex-1 py-4 px-3 text-xs sm:text-sm font-bold flex items-center justify-center border-b-2 transition-all ${activeTab === 'subProfiles' ? 'border-primary text-primary bg-white shadow-sm' : 'border-transparent text-gray-500 hover:bg-white/50'}`}><Users className="w-4 h-4 mr-2 shrink-0" /> <span className="truncate">Family ({customer.subProfiles?.length || 0})</span></button>
              <button onClick={() => setActiveTab('orders')} className={`sm:flex-1 py-4 px-3 text-xs sm:text-sm font-bold flex items-center justify-center border-b-2 transition-all ${activeTab === 'orders' ? 'border-primary text-primary bg-white shadow-sm' : 'border-transparent text-gray-500 hover:bg-white/50'}`}><ShoppingBag className="w-4 h-4 mr-2 shrink-0" /> <span className="truncate">Orders</span></button>
              <button onClick={() => setActiveTab('notes')} className={`sm:flex-1 py-4 px-3 text-xs sm:text-sm font-bold flex items-center justify-center border-b-2 transition-all ${activeTab === 'notes' ? 'border-primary text-primary bg-white shadow-sm' : 'border-transparent text-gray-500 hover:bg-white/50'}`}><FileText className="w-4 h-4 mr-2 shrink-0" /> <span className="truncate">Notes</span></button>
            </div>

            <div className="p-6 sm:p-8 min-h-[400px]">

              {/* MEASUREMENTS TAB */}
              {activeTab === 'measurements' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <h3 className="font-extrabold text-brand-dark text-lg">Digital Measurements</h3>
                    {!isEditingMeasurements && (
                      <button onClick={() => {
                        setActiveFields([{ part: '', value: '' }]);
                        setMeasurements({ title: '', unit: 'inches' });
                        setIsEditingMeasurements(true);
                      }} className="px-5 py-2.5 bg-primary/10 text-primary font-bold text-xs sm:text-sm rounded-xl hover:bg-primary hover:text-white transition-all flex items-center justify-center">
                        <Plus className="w-4 h-4 mr-1 shrink-0" /> {hasMeasurements ? 'New Style Record' : 'Add Measurement'}
                      </button>
                    )}
                  </div>

                  {measurementsList.length > 1 && !isEditingMeasurements && (
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <div className="flex items-center space-x-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <History className="w-4 h-4 text-primary shrink-0" />
                        <span>Style History:</span>
                      </div>
                      <select
                        value={selectedMeasurementIndex}
                        onChange={(e) => {
                          const idx = Number(e.target.value);
                          setSelectedMeasurementIndex(idx);
                          setMeasurements(measurementsList[idx]);
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-primary shadow-sm"
                      >
                        {measurementsList.map((m, idx) => (
                          <option key={m._id} value={idx}>
                            {m.title || 'Record'} ({new Date(m.recordedDate || m.createdAt).toLocaleDateString()}) {idx === 0 ? '- Latest' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {!hasMeasurements && !isEditingMeasurements ? (
                    <div className="text-center py-16">
                      <Ruler className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-base font-bold text-brand-dark mb-1">No Measurements Logged</h3>
                      <p className="text-gray-500 text-xs mb-6 max-w-sm mx-auto">Create a custom measurement profile for this client based on the style they want to sew.</p>
                      <button onClick={() => {
                        setActiveFields([{ part: '', value: '' }]);
                        setIsEditingMeasurements(true);
                      }} className="px-6 py-3 bg-primary text-white font-bold text-sm rounded-2xl hover:bg-primary-dark shadow-md shadow-primary/20">
                        + Add First Style
                      </button>
                    </div>
                  ) : isEditingMeasurements ? (
                    
                    /* NEW DYNAMIC EDIT MODE */
                    <div className="space-y-6 animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Style Name (e.g. Gown, Agbada)</label>
                          <input
                            type="text" placeholder="Enter style name..." value={measurements.title} onChange={(e) => setMeasurements({...measurements, title: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-primary text-sm font-medium focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Measurement Unit</label>
                          <select value={measurements.unit || 'inches'} onChange={(e) => setMeasurements({...measurements, unit: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-primary text-sm font-medium focus:bg-white">
                            <option value="inches">Inches (in)</option>
                            <option value="cm">Centimeters (cm)</option>
                          </select>
                        </div>
                      </div>

                      <div className="border border-gray-100 rounded-2xl p-4 sm:p-6 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-black text-brand-dark">Measurements Needed</h4>
                        </div>
                        
                        <div className="space-y-3">
                          {activeFields.map((field, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <input 
                                type="text" 
                                list="measurement-parts"
                                placeholder="Part (e.g. Bust, Waist)" 
                                value={field.part} 
                                onChange={(e) => handleDynamicFieldChange(idx, 'part', e.target.value)}
                                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary text-sm"
                              />
                              <input 
                                type="number" 
                                step="0.25"
                                placeholder="Value" 
                                value={field.value} 
                                onChange={(e) => handleDynamicFieldChange(idx, 'value', e.target.value)}
                                className="w-24 sm:w-32 px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary text-sm"
                              />
                              <button 
                                onClick={() => removeDynamicField(idx)}
                                className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <button 
                          onClick={addDynamicField} 
                          className="mt-4 px-4 py-2.5 bg-white border border-dashed border-gray-300 text-brand-dark font-bold text-xs rounded-xl hover:border-primary hover:text-primary transition-colors flex items-center w-full justify-center"
                        >
                          <Plus className="w-4 h-4 mr-1" /> Add Measurement Part
                        </button>
                      </div>

                      <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <button onClick={handleSaveMeasurements} disabled={isSavingMeasurements} className="px-6 py-3.5 bg-primary text-white font-bold text-sm rounded-2xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20 flex items-center justify-center">
                          {isSavingMeasurements ? 'Saving...' : <><Save className="w-4 h-4 mr-2"/> Save Measurements</>}
                        </button>
                        {hasMeasurements && (
                          <button onClick={() => setIsEditingMeasurements(false)} className="px-6 py-3.5 bg-gray-100 text-gray-600 font-bold text-sm rounded-2xl hover:bg-gray-200 transition-colors">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                  ) : (

                    /* DYNAMIC VIEW MODE */
                    <div className="space-y-6 animate-fade-in">
                      {measurementsSaved && (
                        <div className="flex items-center text-sm font-bold text-emerald-600 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                          <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" /> Measurements saved successfully.
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 bg-brand-dark px-5 py-4 rounded-2xl shadow-sm">
                        <span className="text-sm font-black text-white uppercase tracking-wider">{measurements.title || 'Custom Style'}</span>
                        <span className="text-xs font-semibold text-gray-400">Recorded: {new Date(measurements.recordedDate || measurements.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                        {(() => {
                          const dataObj = {
                            ...measurements,
                            ...(measurements.measurementsData || {}),
                            ...(measurements.values || {})
                          };
                          const keys = Object.keys(dataObj).filter(key => !ignoreKeys.includes(key));

                          if (keys.length === 0) {
                            return (
                              <div className="col-span-full py-8 text-center text-gray-400 text-xs font-bold">
                                No measurement parameters found in this record. Try adding a new style record manually.
                              </div>
                            );
                          }

                          return keys.map((key) => (
                            <DisplayValue key={key} label={key} value={dataObj[key]} unit={measurements.unit} />
                          ));
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* FAMILY & RELATED PROFILES TAB */}
              {activeTab === 'subProfiles' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <h3 className="font-extrabold text-brand-dark text-lg">Family Members & Related Profiles</h3>
                    <button onClick={() => setShowSubModal(true)} className="px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-dark transition-all shadow-sm w-full sm:w-auto">
                      + Add Family Member
                    </button>
                  </div>

                  {customer.subProfiles?.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 px-4">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-brand-dark font-bold text-sm">No related profiles added yet.</p>
                      <p className="text-xs text-gray-500 mt-1">Add children, spouse, or siblings who sew with this client.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {customer.subProfiles?.map((sub) => (
                        <div key={sub._id} className="p-5 bg-gray-50/70 rounded-2xl border border-gray-100 flex flex-col justify-between hover:bg-gray-50 transition-colors">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-bold px-2.5 py-1 bg-primary/10 text-primary rounded-lg uppercase tracking-wider">{sub.relationship}</span>
                              <span className="text-xs font-bold text-gray-400">{sub.gender}</span>
                            </div>
                            <h4 className="text-base font-bold text-brand-dark break-words">{sub.name}</h4>
                            {sub.notes && <p className="text-xs font-medium text-gray-500 mt-1 break-words">{sub.notes}</p>}
                          </div>

                          <div className="mt-5 pt-3 border-t border-gray-200/60 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center sm:justify-between">
                            <button
                              onClick={() => handleShareWhatsApp(`${customer.fullName}'s ${sub.relationship} (${sub.name})`, customer._id, sub._id)}
                              className="text-emerald-600 font-bold text-xs hover:underline flex items-center justify-center bg-emerald-50 px-3 py-2 rounded-xl transition-colors"
                            >
                              <Share2 className="w-3.5 h-3.5 mr-1.5" /> WhatsApp Form
                            </button>

                            <button
                              onClick={() => handleOpenSubMeasurements(sub)}
                              className="text-primary font-bold text-xs hover:underline flex items-center justify-center bg-primary/10 px-3 py-2 rounded-xl transition-colors"
                            >
                              <Ruler className="w-3.5 h-3.5 mr-1.5" /> Measurements ({sub.measurements?.length || 0})
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sub-Profile Creation Modal */}
                  {showSubModal && (
                    <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowSubModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-brand-dark">
                          <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-xl font-extrabold text-brand-dark mb-1">Add Family Member</h2>
                        <p className="text-xs text-gray-500 mb-6">Create a linked profile under this customer.</p>
                        
                        <form onSubmit={handleAddSubProfile} className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                            <input
                              type="text" required value={subFormData.name} onChange={(e) => setSubFormData({...subFormData, name: e.target.value})}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
                              placeholder="Junior Okafor"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Relationship *</label>
                              <select value={subFormData.relationship} onChange={(e) => setSubFormData({...subFormData, relationship: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary outline-none text-sm">
                                <option value="Son">Son</option>
                                <option value="Daughter">Daughter</option>
                                <option value="Brother">Brother</option>
                                <option value="Sister">Sister</option>
                                <option value="Spouse">Spouse</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Gender *</label>
                              <select value={subFormData.gender} onChange={(e) => setSubFormData({...subFormData, gender: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary outline-none text-sm">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Notes</label>
                            <input type="text" value={subFormData.notes} onChange={(e) => setSubFormData({...subFormData, notes: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="Optional details..." />
                          </div>
                          <div className="pt-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
                            <button type="button" onClick={() => setShowSubModal(false)} className="px-5 py-3 text-gray-600 font-bold text-sm hover:bg-gray-100 rounded-2xl w-full sm:w-auto">Cancel</button>
                            <button type="submit" className="px-6 py-3 bg-primary text-white font-bold text-sm rounded-2xl hover:bg-primary-dark w-full sm:w-auto shadow-md shadow-primary/20">Save Profile</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Sub-Profile Measurements Modal */}
                  {showSubMeasurementModal && activeSubProfile && (
                    <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowSubMeasurementModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-brand-dark bg-gray-100 rounded-full p-1">
                          <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pr-8">
                          <div>
                            <h2 className="text-xl sm:text-2xl font-black text-brand-dark break-words">{activeSubProfile.name}'s Measurements</h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5">{activeSubProfile.relationship} ({activeSubProfile.gender})</p>
                          </div>
                          {!isEditingSubMeasurements && (
                            <button onClick={() => {
                              setActiveSubFields([{ part: '', value: '' }]);
                              setSubMeasurements({ title: '', unit: 'inches' });
                              setIsEditingSubMeasurements(true);
                            }} className="px-4 py-2.5 bg-primary/10 text-primary font-bold text-xs sm:text-sm rounded-xl hover:bg-primary hover:text-white transition-all flex items-center justify-center">
                              <Plus className="w-4 h-4 mr-1 shrink-0" /> New Style Record
                            </button>
                          )}
                        </div>

                        {activeSubProfile.measurements && activeSubProfile.measurements.length > 0 && !isEditingSubMeasurements && (
                          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="flex items-center space-x-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                              <History className="w-4 h-4 text-primary shrink-0" />
                              <span>Timeline:</span>
                            </div>
                            <select
                              value={selectedSubIndex}
                              onChange={(e) => {
                                const idx = Number(e.target.value);
                                setSelectedSubIndex(idx);
                                setSubMeasurements(activeSubProfile.measurements[idx]);
                              }}
                              className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-primary shadow-sm"
                            >
                              {activeSubProfile.measurements.map((m, idx) => (
                                <option key={m._id || idx} value={idx}>
                                  {m.title || 'Record'} ({new Date(m.recordedDate || m.createdAt || Date.now()).toLocaleDateString()}) {idx === 0 ? '- Latest' : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {isEditingSubMeasurements ? (
                          <form onSubmit={handleSaveSubMeasurements} className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Style Name (e.g. Gown)</label>
                                <input type="text" placeholder="Enter style name..." value={subMeasurements.title} onChange={(e) => setSubMeasurements({...subMeasurements, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-primary text-sm font-medium" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Unit</label>
                                <select value={subMeasurements.unit || 'inches'} onChange={(e) => setSubMeasurements({ ...subMeasurements, unit: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-primary text-sm font-medium">
                                  <option value="inches">Inches (in)</option>
                                  <option value="cm">Centimeters (cm)</option>
                                </select>
                              </div>
                            </div>

                            <div className="border border-gray-100 rounded-2xl p-4 sm:p-6 bg-gray-50/50">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-black text-brand-dark">Measurements Needed</h4>
                              </div>
                              
                              <div className="space-y-3">
                                {activeSubFields.map((field, idx) => (
                                  <div key={idx} className="flex items-center gap-3">
                                    <input 
                                      type="text" 
                                      list="measurement-parts"
                                      placeholder="Part (e.g. Bust, Waist)" 
                                      value={field.part} 
                                      onChange={(e) => handleSubFieldChange(idx, 'part', e.target.value)}
                                      className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary text-sm"
                                    />
                                    <input 
                                      type="number" 
                                      step="0.25"
                                      placeholder="Value" 
                                      value={field.value} 
                                      onChange={(e) => handleSubFieldChange(idx, 'value', e.target.value)}
                                      className="w-24 sm:w-32 px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary text-sm"
                                    />
                                    <button 
                                      type="button"
                                      onClick={() => removeSubField(idx)}
                                      className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <button 
                                type="button"
                                onClick={addSubField} 
                                className="mt-4 px-4 py-2.5 bg-white border border-dashed border-gray-300 text-brand-dark font-bold text-xs rounded-xl hover:border-primary hover:text-primary transition-colors flex items-center w-full justify-center"
                              >
                                <Plus className="w-4 h-4 mr-1" /> Add Measurement Part
                              </button>
                            </div>
                            
                            <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-end border-t border-gray-100">
                              {(activeSubProfile.measurements && activeSubProfile.measurements.length > 0) && (
                                <button type="button" onClick={() => {
                                  setIsEditingSubMeasurements(false);
                                  setSubMeasurements(activeSubProfile.measurements[selectedSubIndex]);
                                }} className="px-5 py-3 text-gray-600 font-bold text-sm hover:bg-gray-100 rounded-2xl w-full sm:w-auto">Cancel</button>
                              )}
                              <button type="submit" disabled={isSavingSubMeasurements} className="px-6 py-3.5 bg-primary text-white font-bold text-sm rounded-2xl hover:bg-primary-dark w-full sm:w-auto shadow-md shadow-primary/20">
                                {isSavingSubMeasurements ? 'Saving...' : 'Save Fitting'}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="space-y-6 animate-fade-in mt-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0 bg-brand-dark px-5 py-4 rounded-2xl shadow-sm">
                              <span className="text-sm font-black text-white uppercase tracking-wider">{subMeasurements.title || 'Custom Style'}</span>
                              <span className="text-xs font-semibold text-gray-400">Recorded: {new Date(subMeasurements.recordedDate || subMeasurements.createdAt || Date.now()).toLocaleDateString()}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                              {(() => {
                                const dataObj = {
                                  ...subMeasurements,
                                  ...(subMeasurements.measurementsData || {}),
                                  ...(subMeasurements.values || {})
                                };
                                const keys = Object.keys(dataObj).filter(key => !ignoreKeys.includes(key));

                                if (keys.length === 0) {
                                  return (
                                    <div className="col-span-full py-8 text-center text-gray-400 text-xs font-bold">
                                      No measurement parameters found in this sub-profile record.
                                    </div>
                                  );
                                }

                                return keys.map((key) => (
                                  <DisplayValue key={key} label={key} value={dataObj[key]} unit={subMeasurements.unit} />
                                ));
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <h3 className="font-extrabold text-brand-dark text-lg">Active & Past Orders</h3>
                    <Link to="/orders/new" className="px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-dark transition-all shadow-sm w-full sm:w-auto text-center">
                      + Create New Order
                    </Link>
                  </div>

                  {customerOrders.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 px-4">
                      <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-base font-bold text-brand-dark mb-1">No Active Orders</h3>
                      <p className="text-gray-500 text-xs">Create an order for this client to track payments and outfit status.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {customerOrders.map(order => {
                        const balance = order.totalAmount - order.amountPaid;
                        return (
                          <div key={order._id} className="p-5 bg-gray-50/70 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                            <div>
                              <h4 className="font-bold text-brand-dark text-base break-words">{order.outfitName}</h4>
                              <p className="text-xs font-medium text-gray-500 mt-1">Due: <span className="font-bold text-brand-dark">{new Date(order.dueDate).toLocaleDateString()}</span></p>
                              {order.fabricDescription && <p className="text-xs font-medium text-gray-400 mt-1 break-words">Fabric: {order.fabricDescription}</p>}
                            </div>
                            <div className="text-left sm:text-right">
                              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border bg-white text-gray-600 border-gray-200 inline-block mb-1.5 shadow-sm">
                                {order.status}
                              </span>
                              <div className="text-xs font-medium text-gray-600">
                                <p>Total: <span className="font-black text-brand-dark">₦{order.totalAmount?.toLocaleString()}</span></p>
                                {balance > 0 && (
                                  <p className="text-red-600 font-bold mt-0.5">Bal: ₦{balance.toLocaleString()}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* NOTES TAB */}
              {activeTab === 'notes' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <h3 className="font-extrabold text-brand-dark text-lg">Styling Preferences & Notes</h3>
                    {customer.notes && !isEditingNotes && (
                      <button onClick={() => setIsEditingNotes(true)} className="text-primary font-bold text-sm hover:underline flex items-center justify-center bg-primary/10 px-4 py-2 rounded-xl w-full sm:w-auto">
                        <Edit3 className="w-4 h-4 mr-2" /> Edit Notes
                      </button>
                    )}
                  </div>

                  {customer.notes && !isEditingNotes ? (
                    <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-6 relative group">
                      <Quote className="w-10 h-10 text-amber-200 absolute top-4 right-4 opacity-50" />
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed relative z-10 pr-8 text-sm font-medium">{customer.notes}</p>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      <textarea
                        className="w-full p-4 sm:p-5 bg-gray-50 border border-gray-200 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all min-h-[160px] sm:min-h-[200px] text-sm text-gray-700"
                        placeholder="E.g., Prefers slim-fit trousers, sensitive to certain fabrics..."
                        value={notes} onChange={(e) => setNotes(e.target.value)} autoFocus
                      ></textarea>
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button onClick={handleSaveNotes} disabled={isSavingNotes} className="px-6 py-3.5 bg-brand-dark text-white font-bold text-sm rounded-2xl hover:bg-black disabled:opacity-70 transition-colors flex items-center justify-center w-full sm:w-auto shadow-sm">
                          {isSavingNotes ? 'Saving...' : 'Save Notes'}
                        </button>
                        {customer.notes && (
                          <button onClick={() => { setNotes(customer.notes); setIsEditingNotes(false); }} className="px-6 py-3.5 bg-gray-100 text-gray-600 font-bold text-sm rounded-2xl hover:bg-gray-200 transition-colors w-full sm:w-auto">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {notesSaved && !isEditingNotes && (
                    <div className="mt-6 flex items-center text-sm font-bold text-emerald-600 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                      <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" /> Notes saved successfully.
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
