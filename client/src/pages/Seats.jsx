import { useEffect, useState } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import client from '../services/axiosClient';
import CircularLoading from '../components/ui/CircularLoading';
import {
    Armchair,
    Pencil,
    Plus,
    RotateCcw,
    Save,
    Search,
    Trash2,
    X
} from 'lucide-react';

const emptySeatForm = {
    seatNumber: '',
    reservedFor: 'any',
    row: '',
    label: '',
    floor: '',
    section: ''
};

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

export default function Seats() {
    const [includeDeleted, setIncludeDeleted] = useState(true);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [seats, setSeats] = useState([]);
    const [seatForm, setSeatForm] = useState(emptySeatForm);
    const [editingSeatId, setEditingSeatId] = useState(null);
    const [seatSearch, setSeatSearch] = useState('');

    const loadSeats = async () => {
        const response = await client.get('/api/v2/seat/seats', {
            params: { includeDeleted }
        });
        setSeats(response.data.allSeats || []);
    };

    const refresh = async () => {
        setLoading(true);
        try {
            await loadSeats();
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

    const filteredSeats = seats.filter((seat) => {
        const text = `${seat.seatNumber} ${seat.reservedFor} ${seat.row || ''} ${seat.section || ''} ${seat.floor || ''} ${seat.label || ''}`.toLowerCase();
        return text.includes(seatSearch.toLowerCase());
    });

    const saveSeat = async (event) => {
        event.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            if (editingSeatId) {
                await client.put(`/api/v2/seat/seats/${editingSeatId}`, seatForm);
                setMessage('Seat updated.');
            } else {
                await client.post('/api/v2/seat/seats', seatForm);
                setMessage('Seat created.');
            }
            setSeatForm(emptySeatForm);
            setEditingSeatId(null);
            await loadSeats();
        } catch (error) {
            setMessage(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const editSeat = (seat) => {
        setEditingSeatId(seat._id);
        setSeatForm({
            seatNumber: seat.seatNumber || '',
            reservedFor: seat.reservedFor || 'any',
            row: seat.row || '',
            label: seat.label || '',
            floor: seat.floor || '',
            section: seat.section || ''
        });
    };

    const seatAction = async (seat, action) => {
        const confirmed = action !== 'permanent' || window.confirm(`Permanently delete seat ${seat.seatNumber}?`);
        if (!confirmed) return;

        setLoading(true);
        setMessage('');
        try {
            if (action === 'soft') await client.patch(`/api/v2/seat/seats/${seat._id}/soft-delete`);
            if (action === 'restore') await client.patch(`/api/v2/seat/seats/${seat._id}/restore`);
            if (action === 'permanent') await client.delete(`/api/v2/seat/seats/${seat._id}/permanent`);
            await loadSeats();
        } catch (error) {
            setMessage(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const cancelSeatEdit = () => {
        setSeatForm(emptySeatForm);
        setEditingSeatId(null);
    };

    return (
        <>
            <Breadcrumbs title="Admin" subTitle="Seat Master" />

            <div className="mb-4 flex flex-col gap-3 bg-white p-4 shadow-md md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 font-semibold text-[#1b2c3f]">
                    <Armchair size={18} /> Seats
                </div>

                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <input
                        type="checkbox"
                        checked={includeDeleted}
                        onChange={(event) => setIncludeDeleted(event.target.checked)}
                    />
                    Show deleted
                </label>
            </div>

            {message && (
                <div className="mb-4 border-l-4 border-[#1b2c3f] bg-white p-3 text-sm font-semibold text-[#1b2c3f] shadow-sm">
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <form onSubmit={saveSeat} className="bg-white p-4 shadow-md">
                    <h2 className="mb-4 flex items-center gap-2 border-l-4 border-[#1b2c3f] pl-2 font-semibold">
                        <Armchair size={18} /> {editingSeatId ? 'Update Seat' : 'Create Seat'}
                    </h2>

                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-semibold text-slate-700">Seat Number</label>
                            <input
                                required
                                value={seatForm.seatNumber}
                                onChange={(event) => setSeatForm({ ...seatForm, seatNumber: event.target.value })}
                                className="mt-1 w-full rounded-md border p-2"
                                placeholder="A1"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-700">For</label>
                            <select
                                value={seatForm.reservedFor}
                                onChange={(event) => setSeatForm({ ...seatForm, reservedFor: event.target.value })}
                                className="mt-1 w-full rounded-md border p-2"
                            >
                                <option value="any">Any</option>
                                <option value="boy">Boy</option>
                                <option value="girl">Girl</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-700">Row</label>
                            <input
                                value={seatForm.row}
                                onChange={(event) => setSeatForm({ ...seatForm, row: event.target.value })}
                                className="mt-1 w-full rounded-md border p-2"
                                placeholder="Optional"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-semibold text-slate-700">Floor</label>
                                <input
                                    value={seatForm.floor}
                                    onChange={(event) => setSeatForm({ ...seatForm, floor: event.target.value })}
                                    className="mt-1 w-full rounded-md border p-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700">Section</label>
                                <input
                                    value={seatForm.section}
                                    onChange={(event) => setSeatForm({ ...seatForm, section: event.target.value })}
                                    className="mt-1 w-full rounded-md border p-2"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-700">Label</label>
                            <input
                                value={seatForm.label}
                                onChange={(event) => setSeatForm({ ...seatForm, label: event.target.value })}
                                className="mt-1 w-full rounded-md border p-2"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                        <button type="submit" className="flex items-center gap-2 rounded-md bg-[#8e54e9] px-4 py-2 text-sm font-semibold text-white">
                            {loading ? <CircularLoading size={20} /> : editingSeatId ? <Save size={17} /> : <Plus size={17} />}
                            {editingSeatId ? 'Save' : 'Create'}
                        </button>
                        {editingSeatId && (
                            <button type="button" onClick={cancelSeatEdit} className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold">
                                <X size={17} /> Cancel
                            </button>
                        )}
                    </div>
                </form>

                <div className="bg-white p-4 shadow-md lg:col-span-2">
                    <div className="mb-3 flex items-center gap-2">
                        <Search size={18} />
                        <input
                            value={seatSearch}
                            onChange={(event) => setSeatSearch(event.target.value)}
                            className="w-full rounded-md border p-2"
                            placeholder="Search seat, row, type"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] border-collapse text-sm">
                            <thead className="bg-[#1b2c3f] text-white">
                                <tr>
                                    <th className="p-3 text-left">Seat</th>
                                    <th className="p-3 text-left">For</th>
                                    <th className="p-3 text-left">Row</th>
                                    <th className="p-3 text-left">Location</th>
                                    <th className="p-3 text-left">Status</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSeats.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-6 text-center text-slate-400">
                                            No seats found.
                                        </td>
                                    </tr>
                                )}
                                {filteredSeats.map((seat) => (
                                    <tr key={seat._id} className="border-b">
                                        <td className="p-3 font-semibold">{seat.seatNumber}</td>
                                        <td className="p-3 capitalize">{seat.reservedFor}</td>
                                        <td className="p-3">{seat.row || '-'}</td>
                                        <td className="p-3">{[seat.floor, seat.section].filter(Boolean).join(' / ') || '-'}</td>
                                        <td className="p-3"><StatusBadge deletedAt={seat.deletedAt} isActive={seat.isActive} /></td>
                                        <td className="p-3">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => editSeat(seat)} className="rounded-md border p-2" title="Edit">
                                                    <Pencil size={16} />
                                                </button>
                                                {seat.deletedAt ? (
                                                    <button onClick={() => seatAction(seat, 'restore')} className="rounded-md border p-2 text-green-700" title="Restore">
                                                        <RotateCcw size={16} />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => seatAction(seat, 'soft')} className="rounded-md border p-2 text-red-700" title="Soft delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                                <button onClick={() => seatAction(seat, 'permanent')} className="rounded-md border p-2 text-red-900" title="Permanent delete">
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