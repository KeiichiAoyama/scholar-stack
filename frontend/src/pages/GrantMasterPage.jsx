import { useEffect, useMemo, useState } from 'react';
import { Edit3, Plus, Search, Trash2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { Input, Select } from '../components/ui/FormField';
import { createGrant, deleteGrant as removeGrant, getGrants, updateGrant } from '../services/dataService';

const TYPE_TABS = [
  { key: 'nasional', label: 'Hibah Nasional' },
  { key: 'internasional', label: 'Hibah Internasional' },
];

const EMPTY_FORM = {
  name: '',
  provider: '',
  status: 'Active',
};

export default function GrantMasterPage() {
  const [activeType, setActiveType] = useState('nasional');
  const [query, setQuery] = useState('');
  const [grants, setGrants] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  useEffect(() => { getGrants().then(setGrants); }, []);

  const filteredGrants = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return grants
      .filter((grant) => grant.type === activeType)
      .filter((grant) => {
        if (!keyword) return true;
        return `${grant.name} ${grant.provider} ${grant.status}`.toLowerCase().includes(keyword);
      });
  }, [activeType, grants, query]);

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function submitGrant(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.provider.trim()) return;

    if (editingId) {
      const updated = await updateGrant(editingId, { ...form, type: activeType, name: form.name.trim(), provider: form.provider.trim() });
      setGrants((current) => current.map((grant) => grant.id === editingId ? updated : grant));
    } else {
      const created = await createGrant({ ...form, type: activeType, name: form.name.trim(), provider: form.provider.trim() });
      setGrants((current) => [...current, created]);
    }

    resetForm();
  }

  function editGrant(grant) {
    setEditingId(grant.id);
    setForm({ name: grant.name, provider: grant.provider, status: grant.status });
  }

  async function deleteGrant(grantId) {
    await removeGrant(grantId);
    setGrants((current) => current.filter((grant) => grant.id !== grantId));
    if (editingId === grantId) resetForm();
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Master Grants</h2>
            <p className="text-sm text-gray-500 mt-1">Manage grant names used by Hibah Nasional and Hibah Internasional publication labels.</p>
          </div>
          <div className="relative lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search grant or provider"
              className="pl-9"
            />
          </div>
        </div>

        <div className="px-5 flex border-b border-gray-100 overflow-x-auto">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveType(tab.key);
                resetForm();
              }}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                activeType === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_24rem] gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Grant Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Provider</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredGrants.map((grant) => (
                <tr key={grant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-800">{grant.name}</td>
                  <td className="px-4 py-3 text-gray-600">{grant.provider}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      grant.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {grant.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => editGrant(grant)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-primary/5 hover:text-primary"
                        aria-label={`Edit ${grant.name}`}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteGrant(grant.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Delete ${grant.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredGrants.length === 0 && (
            <div className="p-10 text-center text-sm text-gray-400">No grants found.</div>
          )}
        </div>

        <form onSubmit={submitGrant} className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">{editingId ? 'Edit Grant' : 'Add Grant'}</h3>
            <p className="text-xs text-gray-500 mt-1">{TYPE_TABS.find((tab) => tab.key === activeType)?.label}</p>
          </div>

          <Input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Grant name"
            aria-label="Grant name"
            required
          />
          <Input
            value={form.provider}
            onChange={(event) => setForm((current) => ({ ...current, provider: event.target.value }))}
            placeholder="Provider"
            aria-label="Grant provider"
            required
          />
          <Select
            value={form.status}
            onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
            aria-label="Grant status"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>

          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="justify-center">
              <Plus size={16} />
              {editingId ? 'Update' : 'Add'}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Reset
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
