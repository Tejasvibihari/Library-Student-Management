import { useEffect, useMemo, useState } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import client from '../services/axiosClient';
import CircularLoading from '../components/ui/CircularLoading';
import {
    Clock3,
    Pencil,
    Plus,
    RotateCcw,
    Save,
    Search,
    Sparkles,
    Trash2,
    X
} from 'lucide-react';

const emptyShiftForm = {
    code: '',
    label: '',
    startTime: '07:00',
    endTime: '11:00',
    price: 300,
    displayOrder: 0
};

function minutesFromTime(time) {
    const [hours, minutes] = String(time || '00:00').split(':').map(Number);
    return (hours * 60) + minutes;
}

function calculateDuration(startTime, endTime) {
    const start = minutesFromTime(startTime);
    const end = minutesFromTime(endTime);
    const duration = end > start ? end - start : (24 * 60) - start + end;
    return duration === 0 ? 24 * 60 : duration;
}

function durationLabel(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

function StatusBadge({ deletedAt, isActive }) {
    const deleted = Boolean(deletedAt);
    const className = deleted || !isActive
        ? 'bg-red-50 text-red-700 border-red-200'
        : 'bg-green-50 text-green-700 border-green-200';
    return (
        <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${className}`}>
            {deleted || !isActive ? 'Deleted' : 'Active'}
        </span>
    );
}

export default function Shifts() {
    const [includeDeleted, setIncludeDeleted] = useState(true);
    const [loading, setLoading] = useState(false);
    const [seeding, setSeeding] = useState(false);
    const [message, setMessage] = useState('');

    const [shifts, setShifts] = useState([]);
    const [shiftForm, setShiftForm] = useState(emptyShiftForm);
    const [editingShiftId, setEditingShiftId] = useState(null);
    const [shiftSearch, setShiftSearch] = useState('');

    const shiftDuration = useMemo(
        () => calculateDuration(shiftForm.startTime, shiftForm.endTime),
        [shiftForm.startTime, shiftForm.endTime]
    );

    const loadShifts = async () => {
        const response = await client.get('/api/v2/seat/shifts', {
            params: { includeDeleted }
        });
        setShifts(response.data.shifts || []);
    };

    const refresh = async () => {
        setLoading(true);
        try {
            await loadShifts();
        } catch (error) {
            setMessage(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [includeDeleted]);

    const filteredShifts = shifts.filter((shift) => {
        const text = `${shift.code} ${shift.label} ${shift.startTime} ${shift.endTime}`.toLowerCase();
        return text.includes(shiftSearch.toLowerCase());
    });

    const saveShift = async (event) => {
        event.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            if (editingShiftId) {
                await client.put(`/api/v2/seat/shifts/${editingShiftId}`, shiftForm);
                setMessage('Shift updated.');
            } else {
                await client.post('/api/v2/seat/shifts', shiftForm);
                setMessage('Shift created.');
            }
            setShiftForm(emptyShiftForm);
            setEditingShiftId(null);
            await loadShifts();
        } catch (error) {
            setMessage(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const editShift = (shift) => {
        setEditingShiftId(shift._id);
        setShiftForm({
            code: shift.code || '',
            label: shift.label || '',
            startTime: shift.startTime || '07:00',
            endTime: shift.endTime || '11:00',
            price: shift.price || 0,
            displayOrder: shift.displayOrder || 0
        });
    };

    const shiftAction = async (shift, action) => {
        const confirmed = action !== 'permanent' || window.confirm(`Permanently delete shift ${shift.label}?`);
        if (!confirmed) return;

        setLoading(true);
        setMessage('');
        try {
            if (action === 'soft') await client.patch(`/api/v2/seat/shifts/${shift._id}/soft-delete`);
            if (action === 'restore') await client.patch(`/api/v2/seat/shifts/${shift._id}/restore`);
            if (action === 'permanent') await client.delete(`/api/v2/seat/shifts/${shift._id}/permanent`);
            await loadShifts();
        } catch (error) {
            setMessage(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const seedDefaults = async () => {
        setSeeding(true);
        setMessage('');
        try {
            await client.post('/api/v2/seat/shifts/seed-defaults');
            setMessage('Default shifts seeded.');
            await loadShifts();
        } catch (error) {
            setMessage(error.response?.data?.message || error.message);
        } finally {
            setSeeding(false);
        }
    };

    const cancelShiftEdit = () => {
        setShiftForm(emptyShiftForm);
        setEditingShiftId(null);
    };

    return (
        <>
            <Breadcrumbs title="Admin" subTitle="Shift Master" />

            <div className="mb-4 flex flex-col gap-3 bg-white p-4 shadow-md md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 font-semibold text-[#1b2c3f]">
                    <Clock3 size={18} /> Shifts
                </div>

                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <input
                            type="checkbox"
                            checked={includeDeleted}
                            onChange={(event) => setIncludeDeleted(event.target.checked)}
                        />
                        Show deleted
                    </label>

                    <button
                        type="button"
                        onClick={seedDefaults}
                        disabled={seeding}
                        className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold text-[#1b2c3f]"
                        title="Create the default shift set if missing"
                    >
                        {seeding ? <CircularLoading size={16} /> : <Sparkles size={16} />}
                        Seed defaults
                    </button>
                </div>
            </div>

            {message && (
                <div className="mb-4 border-l-4 border-[#1b2c3f] bg-white p-3 text-sm font-semibold text-[#1b2c3f] shadow-sm">
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <form onSubmit={saveShift} className="bg-white p-4 shadow-md">
                    <h2 className="mb-4 flex items-center gap-2 border-l-4 border-[#1b2c3f] pl-2 font-semibold">
                        <Clock3 size={18} /> {editingShiftId ? 'Update Shift' : 'Create Shift'}
                    </h2>

                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-semibold text-slate-700">Code</label>
                            <input
                                value={shiftForm.code}
                                onChange={(event) => setShiftForm({ ...shiftForm, code: event.target.value })}
                                className="mt-1 w-full rounded-md border p-2"
                                placeholder="Auto from label if empty"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700">Label</label>
                            <input
                                required
                                value={shiftForm.label}
                                onChange={(event) => setShiftForm({ ...shiftForm, label: event.target.value })}
                                className="mt-1 w-full rounded-md border p-2"
                                placeholder="Morning"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-semibold text-slate-700">Start</label>
                                <input
                                    required
                                    type="time"
                                    value={shiftForm.startTime}
                                    onChange={(event) => setShiftForm({ ...shiftForm, startTime: event.target.value })}
                                    className="mt-1 w-full rounded-md border p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700">End</label>
                                <input
                                    required
                                    type="time"
                                    value={shiftForm.endTime}
                                    onChange={(event) => setShiftForm({ ...shiftForm, endTime: event.target.value })}
                                    className="mt-1 w-full rounded-md border p-2"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-semibold text-slate-700">Shift Amount</label>
                                <input
                                    required
                                    type="number"
                                    value={shiftForm.price}
                                    onChange={(event) => setShiftForm({ ...shiftForm, price: event.target.value })}
                                    className="mt-1 w-full rounded-md border p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700">Order</label>
                                <input
                                    type="number"
                                    value={shiftForm.displayOrder}
                                    onChange={(event) => setShiftForm({ ...shiftForm, displayOrder: event.target.value })}
                                    className="mt-1 w-full rounded-md border p-2"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 rounded-md border bg-slate-50 p-3 text-sm font-semibold">
                            <div>
                                <div className="text-slate-500">Duration</div>
                                <div>{durationLabel(shiftDuration)}</div>
                            </div>
                            <div>
                                <div className="text-slate-500">Amount</div>
                                <div>Rs {shiftForm.price || 0}</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                        <button type="submit" className="flex items-center gap-2 rounded-md bg-[#8e54e9] px-4 py-2 text-sm font-semibold text-white">
                            {loading ? <CircularLoading size={20} /> : editingShiftId ? <Save size={17} /> : <Plus size={17} />}
                            {editingShiftId ? 'Save' : 'Create'}
                        </button>
                        {editingShiftId && (
                            <button type="button" onClick={cancelShiftEdit} className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold">
                                <X size={17} /> Cancel
                            </button>
                        )}
                    </div>
                </form>

                <div className="bg-white p-4 shadow-md lg:col-span-2">
                    <div className="mb-3 flex items-center gap-2">
                        <Search size={18} />
                        <input
                            value={shiftSearch}
                            onChange={(event) => setShiftSearch(event.target.value)}
                            className="w-full rounded-md border p-2"
                            placeholder="Search shift"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px] border-collapse text-sm">
                            <thead className="bg-[#1b2c3f] text-white">
                                <tr>
                                    <th className="p-3 text-left">Shift</th>
                                    <th className="p-3 text-left">Time</th>
                                    <th className="p-3 text-left">Duration</th>
                                    <th className="p-3 text-left">Amount</th>
                                    <th className="p-3 text-left">Status</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredShifts.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-6 text-center text-slate-400">
                                            No shifts found.
                                        </td>
                                    </tr>
                                )}
                                {filteredShifts.map((shift) => (
                                    <tr key={shift._id} className="border-b">
                                        <td className="p-3">
                                            <div className="font-semibold">{shift.label}</div>
                                            <div className="text-xs text-slate-500">{shift.code}</div>
                                        </td>
                                        <td className="p-3">{shift.startTime} - {shift.endTime}</td>
                                        <td className="p-3">
                                            {shift.durationLabel || durationLabel(calculateDuration(shift.startTime, shift.endTime))}
                                        </td>
                                        <td className="p-3 font-semibold">Rs {shift.price}</td>
                                        <td className="p-3"><StatusBadge deletedAt={shift.deletedAt} isActive={shift.isActive} /></td>
                                        <td className="p-3">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => editShift(shift)} className="rounded-md border p-2" title="Edit">
                                                    <Pencil size={16} />
                                                </button>
                                                {shift.deletedAt ? (
                                                    <button onClick={() => shiftAction(shift, 'restore')} className="rounded-md border p-2 text-green-700" title="Restore">
                                                        <RotateCcw size={16} />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => shiftAction(shift, 'soft')} className="rounded-md border p-2 text-red-700" title="Soft delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                                <button onClick={() => shiftAction(shift, 'permanent')} className="rounded-md border p-2 text-red-900" title="Permanent delete">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}