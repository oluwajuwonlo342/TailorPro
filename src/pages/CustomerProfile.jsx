import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Phone, Mail, MapPin, ArrowLeft, Ruler, ShoppingBag, FileText, CheckCircle2, Edit3, Quote, Save, X, Users, Share2, History, Plus, Trash2 } from 'lucide-react';

// Helper to format legacy camelCase keys (e.g., 'shoulderToNipple' -> 'Shoulder To Nipple')
const formatLabel = (key) => {
  const result = key.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

// Formats a date as "10/1/2026 11:48:55am" style, including time with seconds
const formatDateTime = (dateInput) => {
  const d = new Date(dateInput || Date.now());
  const datePart = d.toLocaleDateString();
  const timePart = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).toLowerCase().replace(' ', '');
  return `${datePart} ${timePart}`;
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

/*
 * Responsive notes:
 * - Inputs use text-base on mobile (16px) so iOS Safari doesn't zoom on focus, then text-sm from sm: up.
 * - Modals are bottom sheets on phones and centered dialogs from sm: up (dvh handles mobile browser bars).
 * - Every flex child that holds text has min-w-0 so nothing forces horizontal scroll.
 */
const inputCls = "w-full min-w-0 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-primary focus:bg-white text-base sm:text-sm font-medium";
const labelCls = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";

const TABS = [
  { id: 'measurements', label: 'Measurements', short: 'Sizes', Icon: Ruler },
  { id: 'subProfiles', label: 'Family', short: 'Family', Icon: Users },
  { id: 'orders', label: 'Orders', short: 'Orders', Icon: ShoppingBag },
  { id: 'notes', label: 'Notes', short: 'Notes', Icon: FileText },
];

const DisplayValue = ({ label, value, unit }) => {
  let displayStr = value;
  if (typeof value === 'object' && value !== null) {
    displayStr = value.value !== undefined ? value.value : JSON.stringify(value);
  }

  return (displayStr !== undefined && displayStr !== null && displayStr !== '') ? (
    <div className="bg-gray-50/70 p-3 sm:p-3.5 rounded-2xl border border-gray-100 flex flex-col justify-center min-w-0">
      <p className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 truncate" title={label}>{formatLabel(label)}</p>
      <p className="text-base sm:text-lg font-black text-brand-dark break-words">{displayStr} <span className="text-xs font-bold text-gray-400">{unit || 'inches'}</span></p>
    </div>
  ) : null;
};

// Reusable measurement part/value rows (used by both the main profile and sub-profile editors).
// Phones: part name on its own row, value + delete below. sm and up: a single row.
const FieldRows = ({ fields, onChange, onRemove, onAdd }) => (
  <div className="border border-gray-100 rounded-2xl p-3 sm:p-6 bg-gray-50/50">
    <h4 className="text-sm font-black text-brand-dark mb-4">Measurements Needed</h4>

    <div className="space-y-4 sm:space-y-3">
      {fields.map((field, idx) => (
        <div key={idx} className="grid grid-cols-[1fr_auto] gap-2 sm:flex sm:items-center sm:gap-3">
          <input
            type="text"
            list="measurement-parts"
            placeholder="Part (e.g. Bust, Waist)"
            value={field.part}
            onChange={(e) => onChange(idx, 'part', e.target.value)}
            className="col-span-2 sm:col-span-1 sm:flex-1 min-w-0 px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary text-base sm:text-sm"
          />
          <input
            type="number"
            inputMode="decimal"
            step="0.25"
            placeholder="Value"
            value={field.value}
            onChange={(e) => onChange(idx, 'value', e.target.value)}
            className="min-w-0 sm:w-32 px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary text-base sm:text-sm"
          />
          <button
            type="button"
            onClick={() => onRemove(idx)}
            aria-label="Remove measurement part"
            className="w-11 h-11 sm:w-10 sm:h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>

    <button
      type="button"
      onClick={onAdd}
      className="mt-4 px-4 py-3 sm:py-2.5 bg-white border border-dashed border-gray-300 text-brand-dark font-bold text-xs rounded-xl hover:border-primary hover:text-primary transition-colors flex items-center w-full justify-center"
    >
      <Plus className="w-4 h-4 mr-1" /> Add Measurement Part
    </button>
  </div>
);

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
  // null = creating a brand-new record; set = editing that record's _id in place
  const [editingMeasurementId, setEditingMeasurementId] = useState(null);

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
  // null = creating a brand-new sub-profile record; set = editing that record's _id in place
  const [editingSubMeasurementId, setEditingSubMeasurementId] = useState(null);

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

  // Turns a normalized record back into [{part, value}, ...] rows so the
  // existing dynamic-field editor can be reused for editing, not just creating.
  const getEditableFields = (record) => {
    if (!record) return [{ part: '', value: '' }];
    const dataObj = {
      ...record,
      ...(record.measurementsData || {}),
      ...(record.values || {})
    };
    const keys = Object.keys(dataObj).filter(key => !ignoreKeys.includes(key));
    const fields = keys
      .map((key) => {
        const val = dataObj[key];
        const flatVal = (typeof val === 'object' && val !== null) ? (val.value ?? '') : val;
        return { part: key, value: flatVal ?? '' };
      })
      .filter((f) => f.value !== '' && f.value !== undefined && f.value !== null);
    return fields.length > 0 ? fields : [{ part: '', value: '' }];
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

  // Prevent the page behind a modal from scrolling on touch devices
  useEffect(() => {
    if (!(showSubModal || showSubMeasurementModal)) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [showSubModal, showSubMeasurementModal]);

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

  // Opens the edit form pre-filled with the currently viewed record's parts
  const handleEditMeasurements = () => {
    setActiveFields(getEditableFields(measurements));
    setEditingMeasurementId(measurements._id || null);
    setIsEditingMeasurements(true);
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
      if (editingMeasurementId) {
        // Editing an existing record in place
        const response = await api.put(`/measurements/${editingMeasurementId}`, payload);
        const updatedRecord = normalizeData(response.data.data);
        const updatedList = measurementsList.map((m) =>
          String(m._id) === String(editingMeasurementId) ? updatedRecord : m
        );
        setMeasurementsList(updatedList);
        const newIndex = updatedList.findIndex((m) => String(m._id) === String(editingMeasurementId));
        setMeasurements(updatedRecord);
        setSelectedMeasurementIndex(newIndex >= 0 ? newIndex : 0);
      } else {
        // Creating a brand-new history entry
        const response = await api.post(`/measurements/customer/${id}`, payload);
        const updatedList = [normalizeData(response.data.data), ...measurementsList];
        setMeasurementsList(updatedList);
        setMeasurements(updatedList[0]);
        setSelectedMeasurementIndex(0);
      }

      setHasMeasurements(true);
      setIsEditingMeasurements(false);
      setEditingMeasurementId(null);
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
      setSubMeasurements(normalizeData(historyList[0]));
      setSelectedSubIndex(0);
      setIsEditingSubMeasurements(false);
      setEditingSubMeasurementId(null);
    } else {
      setSubMeasurements({ title: '', unit: 'inches' });
      setActiveSubFields([{ part: '', value: '' }]);
      setSelectedSubIndex(0);
      setIsEditingSubMeasurements(true);
      setEditingSubMeasurementId(null);
    }
    setShowSubMeasurementModal(true);
  };

  // Opens the sub-profile edit form pre-filled with the currently viewed record's parts
  const handleEditSubMeasurements = () => {
    setActiveSubFields(getEditableFields(subMeasurements));
    setEditingSubMeasurementId(subMeasurements._id || null);
    setIsEditingSubMeasurements(true);
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
      let updatedCust;

      if (editingSubMeasurementId) {
        // Editing an existing sub-profile record in place
        const response = await api.put(
          `/customers/${id}/sub-profiles/${activeSubProfile._id}/measurements/${editingSubMeasurementId}`,
          payload
        );
        updatedCust = response.data.data;
      } else {
        // Creating a brand-new sub-profile history entry
        const response = await api.put(
          `/customers/${id}/sub-profiles/${activeSubProfile._id}/measurements`,
          payload
        );
        updatedCust = response.data.data;
      }

      const freshSub = updatedCust.subProfiles.find(s => String(s._id) === String(activeSubProfile._id));

      let freshHistory = freshSub.measurements || [];
      if (!Array.isArray(freshHistory)) freshHistory = [freshHistory];
      freshHistory = freshHistory.map(normalizeData);
      freshSub.measurements = freshHistory;

      setCustomer(updatedCust);
      setActiveSubProfile(freshSub);

      if (editingSubMeasurementId) {
        const idx = freshHistory.findIndex((m) => String(m._id) === String(editingSubMeasurementId));
        setSubMeasurements(freshHistory[idx >= 0 ? idx : 0]);
        setSelectedSubIndex(idx >= 0 ? idx : 0);
      } else {
        setSubMeasurements(freshHistory[0]);
        setSelectedSubIndex(0);
      }

      setIsEditingSubMeasurements(false);
      setEditingSubMeasurementId(null);
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

  // Shared view-mode grid so both the main profile and the modal stay in sync
  const renderMeasurementGrid = (record, emptyMessage) => {
    const dataObj = {
      ...record,
      ...(record.measurementsData || {}),
      ...(record.values || {})
    };
    const keys = Object.keys(dataObj).filter(key => !ignoreKeys.includes(key));

    if (keys.length === 0) {
      return (
        <div className="col-span-full py-8 text-center text-gray-400 text-xs font-bold">
          {emptyMessage}
        </div>
      );
    }

    return keys.map((key) => {
      const val = dataObj[key];
      if (typeof val === 'object' && val !== null && val.value === undefined) return null;
      return <DisplayValue key={key} label={key} value={val} unit={record.unit} />;
    });
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!customer) return <div className="text-center py-20 px-4"><h2 className="text-xl sm:text-2xl font-bold text-gray-700">Customer not found</h2><Link to="/customers" className="text-primary hover:underline mt-4 inline-block font-bold">Return to Customer List</Link></div>;

  return (
    <div className="space-y-4 sm:space-y-6 font-sans w-full max-w-6xl mx-auto pb-20 overflow-x-hidden">

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

      <Link to="/customers" className="inline-flex items-center py-1 text-sm font-bold text-gray-500 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Customers
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">

        {/* Left Column: Client Details (stacked on phones, side-by-side on tablets, sticky sidebar on desktop) */}
        <div className="lg:col-span-1 min-w-0">
          <div className="bg-white p-5 sm:p-8 rounded-3xl border border-gray-100 shadow-sm lg:sticky lg:top-6">
            <div className="md:grid md:grid-cols-2 md:gap-8 lg:block">

              <div className="text-center md:text-left lg:text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 text-primary font-extrabold rounded-3xl flex items-center justify-center text-2xl sm:text-3xl mx-auto md:mx-0 lg:mx-auto mb-4 shadow-sm">
                  {customer.fullName.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-brand-dark break-words">{customer.fullName}</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{customer.gender} • Since {new Date(customer.createdAt).toLocaleDateString()}</p>

                <div className="mt-5 sm:mt-6">
                  <button
                    onClick={() => handleShareWhatsApp(customer.fullName, customer._id)}
                    className="w-full py-3.5 px-4 bg-emerald-600 text-white font-bold rounded-2xl text-xs sm:text-sm hover:bg-emerald-700 flex items-center justify-center text-center transition-all shadow-md shadow-emerald-600/20"
                  >
                    <Share2 className="w-4 h-4 mr-2 shrink-0" /> WhatsApp Link
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-6 space-y-4 text-left border-t border-gray-100 md:mt-0 md:pt-0 md:border-t-0 md:border-l md:pl-8 md:self-center lg:mt-8 lg:pt-6 lg:border-l-0 lg:border-t lg:pl-0">
                <div className="flex items-center space-x-3 text-gray-600 min-w-0">
                  <Phone className="w-5 h-5 text-gray-400 shrink-0" />
                  <span className="font-bold text-sm break-all">{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center space-x-3 text-gray-600 min-w-0">
                    <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                    <span className="font-bold text-sm break-all">{customer.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-start space-x-3 text-gray-600 min-w-0">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                    <span className="font-bold text-sm leading-snug break-words">{customer.address}</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Work Area */}
        <div className="lg:col-span-2 min-w-0">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Tab Header: 4 equal columns; icon stacked over label on phones, inline from sm: up */}
            <div className="grid grid-cols-4 border-b border-gray-100 bg-gray-50/50">
              {TABS.map(({ id: tabId, label, short, Icon }) => (
                <button
                  key={tabId}
                  onClick={() => setActiveTab(tabId)}
                  className={`min-w-0 py-3 sm:py-4 px-1 sm:px-3 text-[11px] sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 border-b-2 transition-all ${activeTab === tabId ? 'border-primary text-primary bg-white shadow-sm' : 'border-transparent text-gray-500 hover:bg-white/50'}`}
                >
                  <Icon className="w-5 h-5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="truncate max-w-full">
                    <span className="sm:hidden">{short}</span>
                    <span className="hidden sm:inline">{label}</span>
                    {tabId === 'subProfiles' && ` (${customer.subProfiles?.length || 0})`}
                  </span>
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-6 lg:p-8 min-h-[400px]">

              {/* MEASUREMENTS TAB */}
              {activeTab === 'measurements' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
                    <h3 className="font-extrabold text-brand-dark text-base sm:text-lg">Digital Measurements</h3>
                    {!isEditingMeasurements && hasMeasurements && (
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <button onClick={handleEditMeasurements} className="px-5 py-3 sm:py-2.5 bg-gray-100 text-brand-dark font-bold text-xs sm:text-sm rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center">
                          <Edit3 className="w-4 h-4 mr-1.5 shrink-0" /> Edit This Record
                        </button>
                        <button onClick={() => {
                          setActiveFields([{ part: '', value: '' }]);
                          setMeasurements({ title: '', unit: 'inches' });
                          setEditingMeasurementId(null);
                          setIsEditingMeasurements(true);
                        }} className="px-5 py-3 sm:py-2.5 bg-primary/10 text-primary font-bold text-xs sm:text-sm rounded-xl hover:bg-primary hover:text-white transition-all flex items-center justify-center">
                          <Plus className="w-4 h-4 mr-1 shrink-0" /> New Style Record
                        </button>
                      </div>
                    )}
                  </div>

                  {measurementsList.length > 1 && !isEditingMeasurements && (
                    <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 p-3 sm:p-4 rounded-2xl border border-gray-100">
                      <div className="flex items-center space-x-2 text-xs font-bold text-gray-700 uppercase tracking-wider shrink-0">
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
                        className="w-full sm:w-auto sm:max-w-xs min-w-0 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-base sm:text-sm font-bold outline-none focus:border-primary shadow-sm truncate"
                      >
                        {measurementsList.map((m, idx) => (
                          <option key={m._id} value={idx}>
                            {m.title || 'Record'} ({formatDateTime(m.recordedDate || m.createdAt)}) {idx === 0 ? '- Latest' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {!hasMeasurements && !isEditingMeasurements ? (
                    <div className="text-center py-12 sm:py-16">
                      <Ruler className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-base font-bold text-brand-dark mb-1">No Measurements Logged</h3>
                      <p className="text-gray-500 text-xs mb-6 max-w-sm mx-auto">Create a custom measurement profile for this client based on the style they want to sew.</p>
                      <button onClick={() => {
                        setActiveFields([{ part: '', value: '' }]);
                        setEditingMeasurementId(null);
                        setIsEditingMeasurements(true);
                      }} className="w-full sm:w-auto px-6 py-3 bg-primary text-white font-bold text-sm rounded-2xl hover:bg-primary-dark shadow-md shadow-primary/20">
                        + Add First Style
                      </button>
                    </div>
                  ) : isEditingMeasurements ? (

                    /* DYNAMIC EDIT MODE */
                    <div className="space-y-5 sm:space-y-6 animate-fade-in">
                      {editingMeasurementId && (
                        <div className="flex items-start text-xs font-bold text-primary bg-primary/5 px-4 py-2.5 rounded-xl">
                          <Edit3 className="w-3.5 h-3.5 mr-2 mt-0.5 shrink-0" /> <span>Editing existing record — update or add measurement parts below.</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="min-w-0">
                          <label className={labelCls}>Style Name (e.g. Gown, Agbada)</label>
                          <input
                            type="text" placeholder="Enter style name..." value={measurements.title} onChange={(e) => setMeasurements({ ...measurements, title: e.target.value })}
                            className={inputCls}
                          />
                        </div>
                        <div className="min-w-0">
                          <label className={labelCls}>Measurement Unit</label>
                          <select value={measurements.unit || 'inches'} onChange={(e) => setMeasurements({ ...measurements, unit: e.target.value })} className={inputCls}>
                            <option value="inches">Inches (in)</option>
                            <option value="cm">Centimeters (cm)</option>
                          </select>
                        </div>
                      </div>

                      <FieldRows
                        fields={activeFields}
                        onChange={handleDynamicFieldChange}
                        onRemove={removeDynamicField}
                        onAdd={addDynamicField}
                      />

                      <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <button onClick={handleSaveMeasurements} disabled={isSavingMeasurements} className="px-6 py-3.5 bg-primary text-white font-bold text-sm rounded-2xl hover:bg-primary-dark disabled:opacity-70 transition-all shadow-md shadow-primary/20 flex items-center justify-center">
                          {isSavingMeasurements ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Measurements</>}
                        </button>
                        {hasMeasurements && (
                          <button onClick={() => { setIsEditingMeasurements(false); setEditingMeasurementId(null); }} className="px-6 py-3.5 bg-gray-100 text-gray-600 font-bold text-sm rounded-2xl hover:bg-gray-200 transition-colors">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                  ) : (

                    /* DYNAMIC VIEW MODE */
                    <div className="space-y-5 sm:space-y-6 animate-fade-in">
                      {measurementsSaved && (
                        <div className="flex items-center text-sm font-bold text-emerald-600 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                          <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" /> Measurements saved successfully.
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 bg-brand-dark px-4 sm:px-5 py-4 rounded-2xl shadow-sm">
                        <span className="text-sm font-black text-white uppercase tracking-wider break-words min-w-0">{measurements.title || 'Custom Style'}</span>
                        <span className="text-xs font-semibold text-gray-400 shrink-0">Recorded: {formatDateTime(measurements.recordedDate || measurements.createdAt)}</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                        {renderMeasurementGrid(measurements, 'No measurement parameters found in this record. Try adding a new style record manually.')}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* FAMILY & RELATED PROFILES TAB */}
              {activeTab === 'subProfiles' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
                    <h3 className="font-extrabold text-brand-dark text-base sm:text-lg">Family Members & Related Profiles</h3>
                    <button onClick={() => setShowSubModal(true)} className="px-5 py-3 sm:py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-dark transition-all shadow-sm w-full sm:w-auto shrink-0">
                      + Add Family Member
                    </button>
                  </div>

                  {customer.subProfiles?.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 px-4">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-brand-dark font-bold text-sm">No related profiles added yet.</p>
                      <p className="text-xs text-gray-500 mt-1">Add children, spouse, or siblings who sew with this client.</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      {customer.subProfiles?.map((sub) => (
                        <div key={sub._id} className="p-4 sm:p-5 bg-gray-50/70 rounded-2xl border border-gray-100 flex flex-col justify-between hover:bg-gray-50 transition-colors min-w-0">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-[11px] font-bold px-2.5 py-1 bg-primary/10 text-primary rounded-lg uppercase tracking-wider">{sub.relationship}</span>
                              <span className="text-xs font-bold text-gray-400">{sub.gender}</span>
                            </div>
                            <h4 className="text-base font-bold text-brand-dark break-words">{sub.name}</h4>
                            {sub.notes && <p className="text-xs font-medium text-gray-500 mt-1 break-words">{sub.notes}</p>}
                          </div>

                          <div className="mt-5 pt-3 border-t border-gray-200/60 flex flex-col gap-2">
                            <button
                              onClick={() => handleShareWhatsApp(`${customer.fullName}'s ${sub.relationship} (${sub.name})`, customer._id, sub._id)}
                              className="text-emerald-600 font-bold text-xs hover:underline flex items-center justify-center bg-emerald-50 px-3 py-2.5 rounded-xl transition-colors"
                            >
                              <Share2 className="w-3.5 h-3.5 mr-1.5 shrink-0" /> WhatsApp Form
                            </button>

                            <button
                              onClick={() => handleOpenSubMeasurements(sub)}
                              className="text-primary font-bold text-xs hover:underline flex items-center justify-center bg-primary/10 px-3 py-2.5 rounded-xl transition-colors"
                            >
                              <Ruler className="w-3.5 h-3.5 mr-1.5 shrink-0" /> Measurements ({sub.measurements?.length || 0})
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sub-Profile Creation Modal (bottom sheet on phones, centered dialog on sm+) */}
                  {showSubModal && (
                    <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
                      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-8 shadow-2xl relative max-h-[92vh] max-h-[92dvh] overflow-y-auto overscroll-contain">
                        <button onClick={() => setShowSubModal(false)} aria-label="Close" className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-brand-dark p-1">
                          <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-lg sm:text-xl font-extrabold text-brand-dark mb-1 pr-8">Add Family Member</h2>
                        <p className="text-xs text-gray-500 mb-5 sm:mb-6">Create a linked profile under this customer.</p>

                        <form onSubmit={handleAddSubProfile} className="space-y-4">
                          <div>
                            <label className={labelCls}>Full Name *</label>
                            <input
                              type="text" required value={subFormData.name} onChange={(e) => setSubFormData({ ...subFormData, name: e.target.value })}
                              className={inputCls.replace('font-medium', '') + ' focus:ring-2 focus:ring-primary'}
                              placeholder="Junior Okafor"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="min-w-0">
                              <label className={labelCls}>Relationship *</label>
                              <select value={subFormData.relationship} onChange={(e) => setSubFormData({ ...subFormData, relationship: e.target.value })} className={inputCls.replace('font-medium', '')}>
                                <option value="Son">Son</option>
                                <option value="Daughter">Daughter</option>
                                <option value="Brother">Brother</option>
                                <option value="Sister">Sister</option>
                                <option value="Spouse">Spouse</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div className="min-w-0">
                              <label className={labelCls}>Gender *</label>
                              <select value={subFormData.gender} onChange={(e) => setSubFormData({ ...subFormData, gender: e.target.value })} className={inputCls.replace('font-medium', '')}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className={labelCls}>Notes</label>
                            <input type="text" value={subFormData.notes} onChange={(e) => setSubFormData({ ...subFormData, notes: e.target.value })} className={inputCls.replace('font-medium', '')} placeholder="Optional details..." />
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
                    <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
                      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl relative max-h-[92vh] max-h-[92dvh] overflow-y-auto overscroll-contain">
                        <button onClick={() => setShowSubMeasurementModal(false)} aria-label="Close" className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-brand-dark bg-gray-100 rounded-full p-1.5">
                          <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6 pr-10">
                          <div className="min-w-0">
                            <h2 className="text-lg sm:text-2xl font-black text-brand-dark break-words">{activeSubProfile.name}'s Measurements</h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5">{activeSubProfile.relationship} ({activeSubProfile.gender})</p>
                          </div>
                        </div>

                        {!isEditingSubMeasurements && (
                          <div className="flex flex-col sm:flex-row gap-2 w-full mb-5 sm:mb-6 sm:justify-end">
                            {activeSubProfile.measurements && activeSubProfile.measurements.length > 0 && (
                              <button onClick={handleEditSubMeasurements} className="px-4 py-3 sm:py-2.5 bg-gray-100 text-brand-dark font-bold text-xs sm:text-sm rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center">
                                <Edit3 className="w-4 h-4 mr-1.5 shrink-0" /> Edit Record
                              </button>
                            )}
                            <button onClick={() => {
                              setActiveSubFields([{ part: '', value: '' }]);
                              setSubMeasurements({ title: '', unit: 'inches' });
                              setEditingSubMeasurementId(null);
                              setIsEditingSubMeasurements(true);
                            }} className="px-4 py-3 sm:py-2.5 bg-primary/10 text-primary font-bold text-xs sm:text-sm rounded-xl hover:bg-primary hover:text-white transition-all flex items-center justify-center">
                              <Plus className="w-4 h-4 mr-1 shrink-0" /> New Style Record
                            </button>
                          </div>
                        )}

                        {activeSubProfile.measurements && activeSubProfile.measurements.length > 0 && !isEditingSubMeasurements && (
                          <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 p-3 sm:p-4 rounded-2xl border border-gray-100">
                            <div className="flex items-center space-x-2 text-xs font-bold text-gray-700 uppercase tracking-wider shrink-0">
                              <History className="w-4 h-4 text-primary shrink-0" />
                              <span>Timeline:</span>
                            </div>
                            <select
                              value={selectedSubIndex}
                              onChange={(e) => {
                                const idx = Number(e.target.value);
                                setSelectedSubIndex(idx);
                                setSubMeasurements(normalizeData(activeSubProfile.measurements[idx]));
                              }}
                              className="w-full sm:w-auto sm:max-w-xs min-w-0 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-base sm:text-sm font-bold outline-none focus:border-primary shadow-sm truncate"
                            >
                              {activeSubProfile.measurements.map((m, idx) => (
                                <option key={m._id || idx} value={idx}>
                                  {m.title || 'Record'} ({formatDateTime(m.recordedDate || m.createdAt)}) {idx === 0 ? '- Latest' : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {isEditingSubMeasurements ? (
                          <form onSubmit={handleSaveSubMeasurements} className="space-y-5 sm:space-y-6 animate-fade-in">
                            {editingSubMeasurementId && (
                              <div className="flex items-start text-xs font-bold text-primary bg-primary/5 px-4 py-2.5 rounded-xl">
                                <Edit3 className="w-3.5 h-3.5 mr-2 mt-0.5 shrink-0" /> <span>Editing existing record — update or add measurement parts below.</span>
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="min-w-0">
                                <label className={labelCls}>Style Name (e.g. Gown)</label>
                                <input type="text" placeholder="Enter style name..." value={subMeasurements.title} onChange={(e) => setSubMeasurements({ ...subMeasurements, title: e.target.value })} className={inputCls} />
                              </div>
                              <div className="min-w-0">
                                <label className={labelCls}>Unit</label>
                                <select value={subMeasurements.unit || 'inches'} onChange={(e) => setSubMeasurements({ ...subMeasurements, unit: e.target.value })} className={inputCls}>
                                  <option value="inches">Inches (in)</option>
                                  <option value="cm">Centimeters (cm)</option>
                                </select>
                              </div>
                            </div>

                            <FieldRows
                              fields={activeSubFields}
                              onChange={handleSubFieldChange}
                              onRemove={removeSubField}
                              onAdd={addSubField}
                            />

                            <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-end border-t border-gray-100">
                              {(activeSubProfile.measurements && activeSubProfile.measurements.length > 0) && (
                                <button type="button" onClick={() => {
                                  setIsEditingSubMeasurements(false);
                                  setEditingSubMeasurementId(null);
                                  setSubMeasurements(normalizeData(activeSubProfile.measurements[selectedSubIndex]));
                                }} className="px-5 py-3 text-gray-600 font-bold text-sm hover:bg-gray-100 rounded-2xl w-full sm:w-auto">Cancel</button>
                              )}
                              <button type="submit" disabled={isSavingSubMeasurements} className="px-6 py-3.5 bg-primary text-white font-bold text-sm rounded-2xl hover:bg-primary-dark disabled:opacity-70 w-full sm:w-auto shadow-md shadow-primary/20">
                                {isSavingSubMeasurements ? 'Saving...' : 'Save Fitting'}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="space-y-5 sm:space-y-6 animate-fade-in">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 bg-brand-dark px-4 sm:px-5 py-4 rounded-2xl shadow-sm">
                              <span className="text-sm font-black text-white uppercase tracking-wider break-words min-w-0">{subMeasurements.title || 'Custom Style'}</span>
                              <span className="text-xs font-semibold text-gray-400 shrink-0">Recorded: {formatDateTime(subMeasurements.recordedDate || subMeasurements.createdAt)}</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                              {renderMeasurementGrid(subMeasurements, 'No measurement parameters found in this sub-profile record.')}
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
                    <h3 className="font-extrabold text-brand-dark text-base sm:text-lg">Active & Past Orders</h3>
                    <Link to="/orders/new" className="px-5 py-3 sm:py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-dark transition-all shadow-sm w-full sm:w-auto text-center shrink-0">
                      + Create New Order
                    </Link>
                  </div>

                  {customerOrders.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 px-4">
                      <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-base font-bold text-brand-dark mb-1">No Active Orders</h3>
                      <p className="text-gray-500 text-xs">Create an order for this client to track payments and outfit status.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {customerOrders.map(order => {
                        const balance = order.totalAmount - order.amountPaid;
                        return (
                          <div key={order._id} className="p-4 sm:p-5 bg-gray-50/70 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-gray-50 transition-colors">
                            <div className="min-w-0">
                              <h4 className="font-bold text-brand-dark text-base break-words">{order.outfitName}</h4>
                              <p className="text-xs font-medium text-gray-500 mt-1">Due: <span className="font-bold text-brand-dark">{new Date(order.dueDate).toLocaleDateString()}</span></p>
                              {order.fabricDescription && <p className="text-xs font-medium text-gray-400 mt-1 break-words">Fabric: {order.fabricDescription}</p>}
                            </div>
                            <div className="flex sm:block items-center justify-between gap-3 text-left sm:text-right shrink-0 pt-3 sm:pt-0 border-t border-gray-200/60 sm:border-t-0">
                              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border bg-white text-gray-600 border-gray-200 inline-block sm:mb-1.5 shadow-sm">
                                {order.status}
                              </span>
                              <div className="text-xs font-medium text-gray-600 text-right">
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
                    <h3 className="font-extrabold text-brand-dark text-base sm:text-lg">Styling Preferences & Notes</h3>
                    {customer.notes && !isEditingNotes && (
                      <button onClick={() => setIsEditingNotes(true)} className="text-primary font-bold text-sm hover:underline flex items-center justify-center bg-primary/10 px-4 py-3 sm:py-2 rounded-xl w-full sm:w-auto shrink-0">
                        <Edit3 className="w-4 h-4 mr-2" /> Edit Notes
                      </button>
                    )}
                  </div>

                  {customer.notes && !isEditingNotes ? (
                    <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 sm:p-6 relative group">
                      <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-amber-200 absolute top-3 right-3 sm:top-4 sm:right-4 opacity-50" />
                      <p className="text-gray-700 whitespace-pre-wrap break-words leading-relaxed relative z-10 pr-8 text-sm font-medium">{customer.notes}</p>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      <textarea
                        className="w-full p-4 sm:p-5 bg-gray-50 border border-gray-200 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all min-h-[160px] sm:min-h-[200px] text-base sm:text-sm text-gray-700"
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
