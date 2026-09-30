import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { User, Phone, Mail, MapPin, ArrowLeft, Ruler, ShoppingBag, FileText, CheckCircle2, Edit3, Quote, Save, X, Users, Share2, History } from 'lucide-react';

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

  // Measurements History State
  const [measurementsList, setMeasurementsList] = useState([]);
  const [selectedMeasurementIndex, setSelectedMeasurementIndex] = useState(0);
  const [measurements, setMeasurements] = useState({
    title: 'Standard Fitting', unit: 'inches'
  });
  const [hasMeasurements, setHasMeasurements] = useState(false);
  const [isEditingMeasurements, setIsEditingMeasurements] = useState(false);
  const [isSavingMeasurements, setIsSavingMeasurements] = useState(false);
  const [measurementsSaved, setMeasurementsSaved] = useState(false);

  // Sub-Profiles State
  const [showSubModal, setShowSubModal] = useState(false);
  const [subFormData, setSubFormData] = useState({ name: '', relationship: 'Son', gender: 'Male', notes: '' });

  // Sub-Profile Measurements History State
  const [showSubMeasurementModal, setShowSubMeasurementModal] = useState(false);
  const [activeSubProfile, setActiveSubProfile] = useState(null);
  const [subMeasurements, setSubMeasurements] = useState({ title: 'Standard Fitting', unit: 'inches' });
  const [selectedSubIndex, setSelectedSubIndex] = useState(0);
  const [isSavingSubMeasurements, setIsSavingSubMeasurements] = useState(false);
  const [isEditingSubMeasurements, setIsEditingSubMeasurements] = useState(false); // <-- NEW STATE FOR READ-ONLY MODE

  const normalizeData = (data) => {
    if (!data) return {};
    let flat = { ...data };
    if (data.measurementsData) {
      flat = { ...flat, ...data.measurementsData };
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

        const ordersRes = await api.get('/orders');
        const specificOrders = ordersRes.data.data.filter(order => 
          (order.customer?._id === id) || (order.customer === id)
        );
        setCustomerOrders(specificOrders);

      } catch (err) {
        console.error("Failed to fetch profile data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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
    setIsSavingMeasurements(true);
    setMeasurementsSaved(false);
    try {
      const { _id, createdAt, updatedAt, ...cleanMeasurements } = measurements;
      const response = await api.post(`/measurements/customer/${id}`, cleanMeasurements);
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

  const handleMeasurementChange = (e) => {
    setMeasurements({ ...measurements, [e.target.name]: e.target.value });
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
      setIsEditingSubMeasurements(false); // Default to read-only view
    } else {
      setSubMeasurements({ title: 'Initial Fitting', unit: 'inches' });
      setSelectedSubIndex(0);
      setIsEditingSubMeasurements(true); // Open edit mode if empty
    }
    setShowSubMeasurementModal(true);
  };

  const handleSaveSubMeasurements = async (e) => {
    e.preventDefault();
    setIsSavingSubMeasurements(true);
    try {
      const { _id, createdAt, updatedAt, ...cleanMeasurements } = subMeasurements;

      const response = await api.put(`/customers/${id}/sub-profiles/${activeSubProfile._id}/measurements`, cleanMeasurements);
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
      setIsEditingSubMeasurements(false); // Close edit mode after saving
      alert("Sub-profile fitting saved successfully!");
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

  const InputGroup = ({ label, name }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      <input 
        type="number" step="0.5" name={name} 
        value={measurements[name] || ''} onChange={handleMeasurementChange}
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
        placeholder="0.0"
      />
    </div>
  );

  const SubInputGroup = ({ label, name }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      <input 
        type="number" step="0.5" name={name} 
        value={subMeasurements[name] || ''} 
        onChange={(e) => setSubMeasurements({ ...subMeasurements, [e.target.name]: e.target.value })}
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
        placeholder="0.0"
      />
    </div>
  );

  // Updated to dynamically accept unit so it works perfectly for both main and family tabs
  const DisplayValue = ({ label, value, unit }) => (
    value ? (
      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
        <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
        <p className="text-base sm:text-lg font-bold text-brand-dark">{value} <span className="text-sm font-medium text-gray-400">{unit || 'inches'}</span></p>
      </div>
    ) : null
  );

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="text-primary font-semibold animate-pulse">Loading profile...</div></div>;
  if (!customer) return <div className="text-center py-20 px-4"><h2 className="text-2xl font-bold text-gray-700">Customer not found</h2><Link to="/customers" className="text-primary hover:underline mt-4 inline-block">Return to Customer List</Link></div>;

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto px-3 sm:px-4 lg:px-0 pb-20">
      <Link to="/customers" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Customers
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Column: Client Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 sm:p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 text-primary font-bold rounded-3xl flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-4">
              {customer.fullName.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-brand-dark break-words">{customer.fullName}</h2>
            <p className="text-sm text-gray-500 mt-1">{customer.gender} • Client since {new Date(customer.createdAt).toLocaleDateString()}</p>
            
            <div className="mt-6 flex justify-center">
              <button 
                onClick={() => handleShareWhatsApp(customer.fullName, customer._id)}
                className="w-full py-3 px-3 bg-emerald-600 text-white font-bold rounded-2xl text-xs sm:text-sm hover:bg-emerald-700 flex items-center justify-center text-center transition-all shadow-md shadow-emerald-600/20"
              >
                <Share2 className="w-4 h-4 mr-2 shrink-0" /> Send Measurement Link via WhatsApp
              </button>
            </div>

            <div className="mt-8 space-y-4 text-left border-t border-gray-100 pt-6">
              <div className="flex items-center space-x-3 text-gray-600">
                <Phone className="w-5 h-5 text-gray-400 shrink-0" />
                <span className="font-medium break-words">{customer.phone}</span>
              </div>
              {customer.email && (
                <div className="flex items-center space-x-3 text-gray-600">
                  <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                  <span className="font-medium break-all">{customer.email}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-start space-x-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <span className="font-medium text-sm leading-tight break-words">{customer.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Work Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap border-b border-gray-100">
              <button onClick={() => setActiveTab('measurements')} className={`sm:flex-1 py-3 sm:py-4 px-2 text-xs sm:text-sm font-bold flex items-center justify-center border-b-2 transition-colors ${activeTab === 'measurements' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}><Ruler className="w-4 h-4 mr-1.5 sm:mr-2 shrink-0" /> <span className="truncate">Measurements</span></button>
              <button onClick={() => setActiveTab('subProfiles')} className={`sm:flex-1 py-3 sm:py-4 px-2 text-xs sm:text-sm font-bold flex items-center justify-center border-b-2 transition-colors ${activeTab === 'subProfiles' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}><Users className="w-4 h-4 mr-1.5 sm:mr-2 shrink-0" /> <span className="truncate">Family ({customer.subProfiles?.length || 0})</span></button>
              <button onClick={() => setActiveTab('orders')} className={`sm:flex-1 py-3 sm:py-4 px-2 text-xs sm:text-sm font-bold flex items-center justify-center border-b-2 transition-colors ${activeTab === 'orders' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}><ShoppingBag className="w-4 h-4 mr-1.5 sm:mr-2 shrink-0" /> <span className="truncate">Orders</span></button>
              <button onClick={() => setActiveTab('notes')} className={`sm:flex-1 py-3 sm:py-4 px-2 text-xs sm:text-sm font-bold flex items-center justify-center border-b-2 transition-colors ${activeTab === 'notes' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}><FileText className="w-4 h-4 mr-1.5 sm:mr-2 shrink-0" /> <span className="truncate">Notes</span></button>
            </div>

            <div className="p-4 sm:p-8 min-h-[400px] sm:min-h-[500px]">
              
              {/* MEASUREMENTS TAB */}
              {activeTab === 'measurements' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <h3 className="font-bold text-brand-dark">Digital Measurements</h3>
                    {!isEditingMeasurements && (
                      <button onClick={() => setIsEditingMeasurements(true)} className="text-primary font-bold text-xs sm:text-sm hover:underline flex items-center justify-center bg-primary/10 px-4 py-2 rounded-lg w-full sm:w-auto">
                        <Edit3 className="w-4 h-4 mr-2 shrink-0" /> {hasMeasurements ? '+ New Fitting Record' : 'Add Measurement'}
                      </button>
                    )}
                  </div>

                  {measurementsList.length > 1 && !isEditingMeasurements && (
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-bg p-4 rounded-2xl border border-gray-100">
                      <div className="flex items-center space-x-2 text-sm font-bold text-gray-700">
                        <History className="w-4 h-4 text-primary shrink-0" />
                        <span>History Timeline:</span>
                      </div>
                      <select 
                        value={selectedMeasurementIndex}
                        onChange={(e) => {
                          const idx = Number(e.target.value);
                          setSelectedMeasurementIndex(idx);
                          setMeasurements(measurementsList[idx]);
                        }}
                        className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-primary"
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
                    <div className="text-center py-12">
                      <Ruler className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-brand-dark mb-2">No Measurements Logged</h3>
                      <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">You haven't recorded any digital measurements for {customer.fullName} yet.</p>
                      <button onClick={() => setIsEditingMeasurements(true)} className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark shadow-md shadow-primary/20">
                        + Add First Measurement
                      </button>
                    </div>
                  ) : isEditingMeasurements ? (
                    
                    <div className="space-y-8 animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Fitting Title / Date Label</label>
                          <input 
                            type="text" name="title" value={measurements.title || 'Standard Fitting'} onChange={handleMeasurementChange}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Unit</label>
                          <select name="unit" value={measurements.unit || 'inches'} onChange={handleMeasurementChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary">
                            <option value="inches">Inches (in)</option>
                            <option value="cm">Centimeters (cm)</option>
                          </select>
                        </div>
                      </div>

                      {customer.gender === 'Female' ? (
                        <>
                          <div>
                            <h4 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">Female Top / Gown</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                              <InputGroup label="Shoulder" name="shoulder" />
                              <InputGroup label="Bust" name="bust" />
                              <InputGroup label="Under Bust" name="underBust" />
                              <InputGroup label="Waist" name="waist" />
                              <InputGroup label="Shoulder to Nipple" name="shoulderToNipple" />
                              <InputGroup label="Shoulder to Under Bust" name="shoulderToUnderBust" />
                              <InputGroup label="Half Length" name="halfLength" />
                              <InputGroup label="Gown Length" name="gownLength" />
                              <InputGroup label="Arm Hole" name="armHole" />
                              <InputGroup label="Sleeve Length" name="sleeveLength" />
                              <InputGroup label="Bicep" name="bicep" />
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">Bottom / Skirt / Trousers</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                              <InputGroup label="Waist" name="trouserWaist" />
                              <InputGroup label="Hips" name="hips" />
                              <InputGroup label="Skirt Length" name="skirtLength" />
                              <InputGroup label="Trouser Length" name="trouserLength" />
                              <InputGroup label="Thigh" name="thigh" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <h4 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">Top / Shirt / Agbada</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                              <InputGroup label="Neck" name="neck" />
                              <InputGroup label="Shoulder" name="shoulder" />
                              <InputGroup label="Chest" name="chest" />
                              <InputGroup label="Waist (Top)" name="waist" />
                              <InputGroup label="Arm Hole" name="armHole" />
                              <InputGroup label="Sleeve Length" name="sleeveLength" />
                              <InputGroup label="Bicep" name="bicep" />
                              <InputGroup label="Wrist" name="wrist" />
                              <InputGroup label="Top Length" name="topLength" />
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">Bottom / Trousers</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                              <InputGroup label="Waist (Trouser)" name="trouserWaist" />
                              <InputGroup label="Hips" name="hips" />
                              <InputGroup label="Thigh" name="thigh" />
                              <InputGroup label="Knee" name="knee" />
                              <InputGroup label="Calf" name="calf" />
                              <InputGroup label="Ankle/Instep" name="instep" />
                              <InputGroup label="Trouser Length" name="trouserLength" />
                              <InputGroup label="Inseam" name="inseam" />
                            </div>
                          </div>
                        </>
                      )}

                      <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                        <button onClick={handleSaveMeasurements} disabled={isSavingMeasurements} className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center">
                          {isSavingMeasurements ? 'Saving...' : <><Save className="w-5 h-5 mr-2"/> Save Measurements</>}
                        </button>
                        {hasMeasurements && (
                          <button onClick={() => setIsEditingMeasurements(false)} className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                  ) : (
                    
                    <div className="space-y-8 animate-fade-in">
                      {measurementsSaved && (
                        <div className="flex items-center text-sm font-medium text-status-success bg-green-50 p-4 rounded-xl border border-green-100 mb-6">
                          <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" /> Measurements saved successfully.
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0 bg-brand-bg px-4 py-3 rounded-xl">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Viewing Record: {measurements.title || 'Client Self-Measurement Form'}</span>
                        <span className="text-xs font-semibold text-gray-400">Date: {new Date(measurements.recordedDate || measurements.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>

                      {customer.gender === 'Female' ? (
                        <>
                          <div>
                            <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider border-b border-gray-100 pb-2">Female Top / Gown</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                              <DisplayValue label="Shoulder" value={measurements.shoulder} unit={measurements.unit} />
                              <DisplayValue label="Bust" value={measurements.bust} unit={measurements.unit} />
                              <DisplayValue label="Under Bust" value={measurements.underBust} unit={measurements.unit} />
                              <DisplayValue label="Waist" value={measurements.waist} unit={measurements.unit} />
                              <DisplayValue label="Shoulder to Nipple" value={measurements.shoulderToNipple} unit={measurements.unit} />
                              <DisplayValue label="Shoulder to Under Bust" value={measurements.shoulderToUnderBust} unit={measurements.unit} />
                              <DisplayValue label="Half Length" value={measurements.halfLength} unit={measurements.unit} />
                              <DisplayValue label="Gown Length" value={measurements.gownLength} unit={measurements.unit} />
                              <DisplayValue label="Arm Hole" value={measurements.armHole} unit={measurements.unit} />
                              <DisplayValue label="Sleeve" value={measurements.sleeveLength} unit={measurements.unit} />
                              <DisplayValue label="Bicep" value={measurements.bicep} unit={measurements.unit} />
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider border-b border-gray-100 pb-2">Bottom / Skirt / Trousers</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                              <DisplayValue label="Waist" value={measurements.trouserWaist} unit={measurements.unit} />
                              <DisplayValue label="Hips" value={measurements.hips} unit={measurements.unit} />
                              <DisplayValue label="Skirt Length" value={measurements.skirtLength} unit={measurements.unit} />
                              <DisplayValue label="Trouser Length" value={measurements.trouserLength} unit={measurements.unit} />
                              <DisplayValue label="Thigh" value={measurements.thigh} unit={measurements.unit} />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider border-b border-gray-100 pb-2">Top Measurements</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                              <DisplayValue label="Neck" value={measurements.neck} unit={measurements.unit} />
                              <DisplayValue label="Shoulder" value={measurements.shoulder} unit={measurements.unit} />
                              <DisplayValue label="Chest" value={measurements.chest} unit={measurements.unit} />
                              <DisplayValue label="Waist" value={measurements.waist} unit={measurements.unit} />
                              <DisplayValue label="Arm Hole" value={measurements.armHole} unit={measurements.unit} />
                              <DisplayValue label="Sleeve" value={measurements.sleeveLength} unit={measurements.unit} />
                              <DisplayValue label="Bicep" value={measurements.bicep} unit={measurements.unit} />
                              <DisplayValue label="Wrist" value={measurements.wrist} unit={measurements.unit} />
                              <DisplayValue label="Top Length" value={measurements.topLength} unit={measurements.unit} />
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider border-b border-gray-100 pb-2">Bottom Measurements</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                              <DisplayValue label="Waist" value={measurements.trouserWaist} unit={measurements.unit} />
                              <DisplayValue label="Hips" value={measurements.hips} unit={measurements.unit} />
                              <DisplayValue label="Thigh" value={measurements.thigh} unit={measurements.unit} />
                              <DisplayValue label="Knee" value={measurements.knee} unit={measurements.unit} />
                              <DisplayValue label="Calf" value={measurements.calf} unit={measurements.unit} />
                              <DisplayValue label="Ankle" value={measurements.instep} unit={measurements.unit} />
                              <DisplayValue label="Length" value={measurements.trouserLength} unit={measurements.unit} />
                              <DisplayValue label="Inseam" value={measurements.inseam} unit={measurements.unit} />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* FAMILY & RELATED PROFILES TAB */}
              {activeTab === 'subProfiles' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <h3 className="font-bold text-brand-dark">Family Members & Related Profiles</h3>
                    <button onClick={() => setShowSubModal(true)} className="px-4 py-2 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary-dark transition-all w-full sm:w-auto">
                      + Add Family Member
                    </button>
                  </div>

                  {customer.subProfiles?.length === 0 ? (
                    <div className="text-center py-12 bg-brand-bg rounded-2xl border border-dashed border-gray-200 px-4">
                      <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No related profiles added for {customer.fullName} yet.</p>
                      <p className="text-xs text-gray-400 mt-1">Add children, spouse, or siblings who sew with this client.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {customer.subProfiles?.map((sub) => (
                        <div key={sub._id} className="p-5 bg-brand-bg rounded-2xl border border-gray-100 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold px-2.5 py-1 bg-primary/10 text-primary rounded-lg uppercase">{sub.relationship}</span>
                              <span className="text-xs text-gray-400 font-medium">{sub.gender}</span>
                            </div>
                            <h4 className="text-lg font-bold text-brand-dark break-words">{customer.fullName}'s {sub.relationship}: {sub.name}</h4>
                            {sub.notes && <p className="text-xs text-gray-600 mt-2 break-words">{sub.notes}</p>}
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-gray-200 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center sm:justify-between">
                            <button 
                              onClick={() => handleShareWhatsApp(`${customer.fullName}'s ${sub.relationship} (${sub.name})`, customer._id, sub._id)}
                              className="text-emerald-600 font-bold text-xs hover:underline flex items-center justify-center bg-emerald-50 px-3 py-1.5 rounded-lg"
                            >
                              <Share2 className="w-3.5 h-3.5 mr-1.5" /> WhatsApp Form
                            </button>
                            
                            <button 
                              onClick={() => handleOpenSubMeasurements(sub)}
                              className="text-primary font-bold text-xs hover:underline flex items-center justify-center bg-primary/10 px-3 py-1.5 rounded-lg"
                            >
                              <Ruler className="w-3.5 h-3.5 mr-1.5" /> Measurements ({sub.measurements?.length || 0})
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sub-Profile Modal */}
                  {showSubModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowSubModal(false)} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-brand-dark">
                          <X className="w-6 h-6" />
                        </button>
                        
                        <h2 className="text-xl sm:text-2xl font-bold text-brand-dark mb-2 pr-8">Add Family Member</h2>
                        <form onSubmit={handleAddSubProfile} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                            <input 
                              type="text" required value={subFormData.name} onChange={(e) => setSubFormData({...subFormData, name: e.target.value})}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
                              <select value={subFormData.relationship} onChange={(e) => setSubFormData({...subFormData, relationship: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary outline-none">
                                <option value="Son">Son</option>
                                <option value="Daughter">Daughter</option>
                                <option value="Brother">Brother</option>
                                <option value="Sister">Sister</option>
                                <option value="Spouse">Spouse</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                              <select value={subFormData.gender} onChange={(e) => setSubFormData({...subFormData, gender: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary outline-none">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <input type="text" value={subFormData.notes} onChange={(e) => setSubFormData({...subFormData, notes: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary outline-none" />
                          </div>
                          <div className="pt-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
                            <button type="button" onClick={() => setShowSubModal(false)} className="px-5 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl w-full sm:w-auto">Cancel</button>
                            <button type="submit" className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark w-full sm:w-auto">Save Profile</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                  
                  {/* Family Measurements Modal */}
                  {showSubMeasurementModal && activeSubProfile && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowSubMeasurementModal(false)} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-brand-dark">
                          <X className="w-6 h-6" />
                        </button>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pr-8">
                          <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-brand-dark break-words">{activeSubProfile.name}'s Measurements</h2>
                            <p className="text-sm text-gray-500">{activeSubProfile.relationship} ({activeSubProfile.gender})</p>
                          </div>
                          {!isEditingSubMeasurements && (
                            <button onClick={() => {
                              setSubMeasurements({ title: `Fitting - ${new Date().toLocaleDateString()}`, unit: 'inches' });
                              setIsEditingSubMeasurements(true);
                            }} className="text-primary font-bold text-xs sm:text-sm hover:underline flex items-center justify-center bg-primary/10 px-4 py-2 rounded-lg w-full sm:w-auto">
                              <Edit3 className="w-4 h-4 mr-2 shrink-0" /> Add New Fitting
                            </button>
                          )}
                        </div>

                        {activeSubProfile.measurements && activeSubProfile.measurements.length > 0 && !isEditingSubMeasurements && (
                          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-bg p-4 rounded-2xl border border-gray-100">
                            <div className="flex items-center space-x-2 text-sm font-bold text-gray-700">
                              <History className="w-4 h-4 text-primary shrink-0" />
                              <span>History Timeline:</span>
                            </div>
                            <select 
                              value={selectedSubIndex}
                              onChange={(e) => {
                                const idx = Number(e.target.value);
                                setSelectedSubIndex(idx);
                                setSubMeasurements(activeSubProfile.measurements[idx]);
                              }}
                              className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-primary"
                            >
                              {activeSubProfile.measurements.map((m, idx) => (
                                <option key={m._id || idx} value={idx}>
                                  {m.title || 'WhatsApp Self-Measurement'} ({new Date(m.recordedDate || m.createdAt || Date.now()).toLocaleDateString()}) {idx === 0 ? '- Latest' : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {isEditingSubMeasurements ? (
                          <form onSubmit={handleSaveSubMeasurements} className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Fitting Title / Date</label>
                                <input type="text" name="title" value={subMeasurements.title || 'Standard Fitting'} onChange={(e) => setSubMeasurements({...subMeasurements, title: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Unit</label>
                                <select name="unit" value={subMeasurements.unit || 'inches'} onChange={(e) => setSubMeasurements({ ...subMeasurements, unit: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary">
                                  <option value="inches">Inches (in)</option>
                                  <option value="cm">Centimeters (cm)</option>
                                </select>
                              </div>
                            </div>

                            {activeSubProfile.gender === 'Female' ? (
                              <>
                                <div>
                                  <h4 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">Female Top / Gown</h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                    <SubInputGroup label="Shoulder" name="shoulder" />
                                    <SubInputGroup label="Bust" name="bust" />
                                    <SubInputGroup label="Under Bust" name="underBust" />
                                    <SubInputGroup label="Waist" name="waist" />
                                    <SubInputGroup label="Shoulder to Nipple" name="shoulderToNipple" />
                                    <SubInputGroup label="Shoulder to Under Bust" name="shoulderToUnderBust" />
                                    <SubInputGroup label="Half Length" name="halfLength" />
                                    <SubInputGroup label="Gown Length" name="gownLength" />
                                    <SubInputGroup label="Arm Hole" name="armHole" />
                                    <SubInputGroup label="Sleeve" name="sleeveLength" />
                                    <SubInputGroup label="Bicep" name="bicep" />
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">Bottom / Skirt / Trousers</h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                    <SubInputGroup label="Waist" name="trouserWaist" />
                                    <SubInputGroup label="Hips" name="hips" />
                                    <SubInputGroup label="Skirt Length" name="skirtLength" />
                                    <SubInputGroup label="Trouser Length" name="trouserLength" />
                                    <SubInputGroup label="Thigh" name="thigh" />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div>
                                  <h4 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">Top / Shirt / Agbada</h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                    <SubInputGroup label="Neck" name="neck" />
                                    <SubInputGroup label="Shoulder" name="shoulder" />
                                    <SubInputGroup label="Chest" name="chest" />
                                    <SubInputGroup label="Waist (Top)" name="waist" />
                                    <SubInputGroup label="Arm Hole" name="armHole" />
                                    <SubInputGroup label="Sleeve Length" name="sleeveLength" />
                                    <SubInputGroup label="Bicep" name="bicep" />
                                    <SubInputGroup label="Wrist" name="wrist" />
                                    <SubInputGroup label="Top Length" name="topLength" />
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">Bottom / Trousers</h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                    <SubInputGroup label="Waist (Trouser)" name="trouserWaist" />
                                    <SubInputGroup label="Hips" name="hips" />
                                    <SubInputGroup label="Thigh" name="thigh" />
                                    <SubInputGroup label="Knee" name="knee" />
                                    <SubInputGroup label="Calf" name="calf" />
                                    <SubInputGroup label="Ankle/Instep" name="instep" />
                                    <SubInputGroup label="Trouser Length" name="trouserLength" />
                                    <SubInputGroup label="Inseam" name="inseam" />
                                  </div>
                                </div>
                              </>
                            )}
                            <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-end border-t border-gray-100">
                              {(activeSubProfile.measurements && activeSubProfile.measurements.length > 0) && (
                                <button type="button" onClick={() => {
                                  setIsEditingSubMeasurements(false);
                                  setSubMeasurements(activeSubProfile.measurements[selectedSubIndex]);
                                }} className="px-5 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl w-full sm:w-auto">Cancel</button>
                              )}
                              <button type="submit" disabled={isSavingSubMeasurements} className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark w-full sm:w-auto">
                                {isSavingSubMeasurements ? 'Saving...' : 'Save Fitting'}
                              </button>
                            </div>
                          </form>
                        ) : (
                          
                          // NEW: READ-ONLY DISPLAY FOR FAMILY MEASUREMENTS
                          <div className="space-y-8 animate-fade-in mt-4">
                            {activeSubProfile.gender === 'Female' ? (
                              <>
                                <div>
                                  <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider border-b border-gray-100 pb-2">Female Top / Gown</h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                    <DisplayValue label="Shoulder" value={subMeasurements.shoulder} unit={subMeasurements.unit} />
                                    <DisplayValue label="Bust" value={subMeasurements.bust} unit={subMeasurements.unit} />
                                    <DisplayValue label="Under Bust" value={subMeasurements.underBust} unit={subMeasurements.unit} />
                                    <DisplayValue label="Waist" value={subMeasurements.waist} unit={subMeasurements.unit} />
                                    <DisplayValue label="Shoulder to Nipple" value={subMeasurements.shoulderToNipple} unit={subMeasurements.unit} />
                                    <DisplayValue label="Shoulder to Under Bust" value={subMeasurements.shoulderToUnderBust} unit={subMeasurements.unit} />
                                    <DisplayValue label="Half Length" value={subMeasurements.halfLength} unit={subMeasurements.unit} />
                                    <DisplayValue label="Gown Length" value={subMeasurements.gownLength} unit={subMeasurements.unit} />
                                    <DisplayValue label="Arm Hole" value={subMeasurements.armHole} unit={subMeasurements.unit} />
                                    <DisplayValue label="Sleeve" value={subMeasurements.sleeveLength} unit={subMeasurements.unit} />
                                    <DisplayValue label="Bicep" value={subMeasurements.bicep} unit={subMeasurements.unit} />
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider border-b border-gray-100 pb-2">Bottom / Skirt / Trousers</h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                    <DisplayValue label="Waist" value={subMeasurements.trouserWaist} unit={subMeasurements.unit} />
                                    <DisplayValue label="Hips" value={subMeasurements.hips} unit={subMeasurements.unit} />
                                    <DisplayValue label="Skirt Length" value={subMeasurements.skirtLength} unit={subMeasurements.unit} />
                                    <DisplayValue label="Trouser Length" value={subMeasurements.trouserLength} unit={subMeasurements.unit} />
                                    <DisplayValue label="Thigh" value={subMeasurements.thigh} unit={subMeasurements.unit} />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div>
                                  <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider border-b border-gray-100 pb-2">Top Measurements</h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                    <DisplayValue label="Neck" value={subMeasurements.neck} unit={subMeasurements.unit} />
                                    <DisplayValue label="Shoulder" value={subMeasurements.shoulder} unit={subMeasurements.unit} />
                                    <DisplayValue label="Chest" value={subMeasurements.chest} unit={subMeasurements.unit} />
                                    <DisplayValue label="Waist" value={subMeasurements.waist} unit={subMeasurements.unit} />
                                    <DisplayValue label="Arm Hole" value={subMeasurements.armHole} unit={subMeasurements.unit} />
                                    <DisplayValue label="Sleeve" value={subMeasurements.sleeveLength} unit={subMeasurements.unit} />
                                    <DisplayValue label="Bicep" value={subMeasurements.bicep} unit={subMeasurements.unit} />
                                    <DisplayValue label="Wrist" value={subMeasurements.wrist} unit={subMeasurements.unit} />
                                    <DisplayValue label="Top Length" value={subMeasurements.topLength} unit={subMeasurements.unit} />
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider border-b border-gray-100 pb-2">Bottom Measurements</h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                    <DisplayValue label="Waist" value={subMeasurements.trouserWaist} unit={subMeasurements.unit} />
                                    <DisplayValue label="Hips" value={subMeasurements.hips} unit={subMeasurements.unit} />
                                    <DisplayValue label="Thigh" value={subMeasurements.thigh} unit={subMeasurements.unit} />
                                    <DisplayValue label="Knee" value={subMeasurements.knee} unit={subMeasurements.unit} />
                                    <DisplayValue label="Calf" value={subMeasurements.calf} unit={subMeasurements.unit} />
                                    <DisplayValue label="Ankle" value={subMeasurements.instep} unit={subMeasurements.unit} />
                                    <DisplayValue label="Length" value={subMeasurements.trouserLength} unit={subMeasurements.unit} />
                                    <DisplayValue label="Inseam" value={subMeasurements.inseam} unit={subMeasurements.unit} />
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ORDERS & NOTES TABS REMAIN UNCHANGED */}
              {activeTab === 'orders' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <h3 className="font-bold text-brand-dark">Active & Past Orders</h3>
                    <Link to="/orders" className="px-4 py-2 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary-dark transition-all shadow-sm w-full sm:w-auto text-center">
                      + Create New Order
                    </Link>
                  </div>

                  {customerOrders.length === 0 ? (
                    <div className="text-center py-12 bg-brand-bg rounded-2xl border border-dashed border-gray-200 px-4">
                      <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-brand-dark">No Active Orders</h3>
                      <p className="text-gray-500 text-sm">Create an order to track payments and outfit status.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {customerOrders.map(order => {
                        const balance = order.totalAmount - order.amountPaid;
                        return (
                          <div key={order._id} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h4 className="font-extrabold text-brand-dark text-lg break-words">{order.outfitName}</h4>
                              <p className="text-sm text-gray-500 mt-1">Due: <span className="font-semibold text-brand-dark">{new Date(order.dueDate).toLocaleDateString()}</span></p>
                              {order.fabricDescription && <p className="text-xs text-gray-400 mt-1 break-words">Fabric: {order.fabricDescription}</p>}
                            </div>
                            <div className="text-left sm:text-right">
                              <span className="text-xs font-bold px-3 py-1 rounded-lg border bg-gray-50 text-gray-600 border-gray-200 inline-block mb-2">
                                {order.status}
                              </span>
                              <div className="text-sm text-gray-600">
                                <p>Total: <span className="font-bold text-brand-dark">₦{order.totalAmount?.toLocaleString()}</span></p>
                                {balance > 0 && (
                                  <p className="text-xs text-status-danger font-semibold mt-0.5">Bal: ₦{balance.toLocaleString()}</p>
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

              {activeTab === 'notes' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <h3 className="font-bold text-brand-dark">Styling Preferences & Notes</h3>
                    {customer.notes && !isEditingNotes && (
                      <button onClick={() => setIsEditingNotes(true)} className="text-primary font-bold text-sm hover:underline flex items-center justify-center bg-primary/10 px-4 py-2 rounded-lg w-full sm:w-auto">
                        <Edit3 className="w-4 h-4 mr-2" /> Edit Notes
                      </button>
                    )}
                  </div>

                  {customer.notes && !isEditingNotes ? (
                    <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-5 sm:p-6 relative group">
                      <Quote className="w-10 h-10 text-amber-200 absolute top-4 right-4 opacity-50" />
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed relative z-10 pr-8">{customer.notes}</p>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      <textarea 
                        className="w-full p-4 sm:p-5 bg-gray-50 border border-gray-200 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all min-h-[160px] sm:min-h-[200px] text-gray-700"
                        placeholder="E.g., Prefers slim-fit trousers, allergic to certain fabrics..."
                        value={notes} onChange={(e) => setNotes(e.target.value)} autoFocus
                      ></textarea>
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button onClick={handleSaveNotes} disabled={isSavingNotes} className="px-6 py-3 bg-brand-dark text-white font-bold rounded-xl hover:bg-gray-800 disabled:opacity-70 transition-colors flex items-center justify-center w-full sm:w-auto">
                          {isSavingNotes ? 'Saving...' : 'Save Notes'}
                        </button>
                        {customer.notes && (
                          <button onClick={() => { setNotes(customer.notes); setIsEditingNotes(false); }} className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors w-full sm:w-auto">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {notesSaved && !isEditingNotes && (
                    <div className="mt-6 flex items-center text-sm font-medium text-status-success bg-green-50 p-4 rounded-xl border border-green-100">
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
