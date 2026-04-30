import { useState } from 'react';
import { Edit, Search, UserPlus, X } from 'lucide-react';
import Button from '../components/ui/Button';
import FormField, { Input, Select } from '../components/ui/FormField';
import { mockUsers } from '../data/mock';

const ROLE_COLORS = { Lecturer: 'bg-blue-100 text-blue-700', Admin: 'bg-red-100 text-red-700' };
const STATUS_COLORS = { Active: 'bg-green-100 text-green-700', Inactive: 'bg-gray-100 text-gray-500' };

const EMPTY_USER = {
  name: '',
  nidn: '',
  email: '',
  role: 'Lecturer',
  status: 'Active',
  affiliation: 'Universitas Multimedia Nusantara',
  departmentUnit: '',
  phone: '',
  academicGrade: 'Lektor',
};

function UserProfileModal({ mode, form, onChange, onClose, onSubmit }) {
  const title = mode === 'add' ? 'Add User' : 'Edit User';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-lg border border-gray-200 shadow-xl">
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">Manage the account using the same structure as User Profile.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 inline-flex items-center justify-center"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <FormField label="Name" required>
              <Input name="name" value={form.name} onChange={onChange} />
            </FormField>
            <FormField label="Email" required>
              <Input type="email" name="email" value={form.email} onChange={onChange} />
            </FormField>
            <FormField label="Role">
              <Select name="role" value={form.role} onChange={onChange}>
                <option value="Lecturer">Lecturer</option>
                <option value="Admin">Admin</option>
              </Select>
            </FormField>
            <FormField label="Status">
              <Select name="status" value={form.status} onChange={onChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </FormField>
            <FormField label="NIDN / Employee ID">
              <Input name="nidn" value={form.nidn} onChange={onChange} />
            </FormField>
            <FormField label="Phone">
              <Input name="phone" value={form.phone} onChange={onChange} />
            </FormField>
          </div>

          <h3 className="text-sm font-semibold text-gray-700 mt-8 mb-4">Profile Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <FormField label="Affiliation">
              <Input name="affiliation" value={form.affiliation} onChange={onChange} />
            </FormField>
            <FormField label="Department / Unit">
              <Input name="departmentUnit" value={form.departmentUnit} onChange={onChange} />
            </FormField>
            <FormField label="Academic Grade">
              <Select name="academicGrade" value={form.academicGrade} onChange={onChange}>
                <option value="Asisten Ahli">Asisten Ahli</option>
                <option value="Lektor">Lektor</option>
                <option value="Lektor Kepala">Lektor Kepala</option>
                <option value="Profesor">Profesor</option>
                <option value="Institution Administrator">Institution Administrator</option>
              </Select>
            </FormField>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{mode === 'add' ? 'Add User' : 'Update User'}</Button>
        </div>
      </form>
    </div>
  );
}

export default function UserManagementPage() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState(mockUsers);
  const [modalMode, setModalMode] = useState(null);
  const [form, setForm] = useState(EMPTY_USER);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.nidn.includes(query)
  );

  function openAddModal() {
    setForm(EMPTY_USER);
    setModalMode('add');
  }

  function openEditModal(user) {
    setForm({
      ...EMPTY_USER,
      affiliation: user.role === 'Admin' ? 'Universitas Multimedia Nusantara' : 'Universitas Multimedia Nusantara Jakarta',
      departmentUnit: user.role === 'Admin' ? 'Research and Community Service' : 'Sistem Informasi',
      phone: user.role === 'Admin' ? '021-5422-0808' : '085266296098',
      academicGrade: user.role === 'Admin' ? 'Institution Administrator' : 'Lektor',
      ...user,
    });
    setModalMode('edit');
  }

  function handleFormChange(event) {
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (modalMode === 'add') {
      setUsers((previous) => [{ ...form, id: Date.now() }, ...previous]);
    } else {
      setUsers((previous) => previous.map((user) => (user.id === form.id ? form : user)));
    }
    setModalMode(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or NIDN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <Button variant="primary" size="sm" onClick={openAddModal}>
          <UserPlus size={15} />
          Add User
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-10">No.</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">NIDN</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Role</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">No users found.</td>
              </tr>
            ) : (
              filtered.map((u, i) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{u.nidn}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[u.status]}`}>{u.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(u)}>
                      <Edit size={14} />
                      Edit
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400">Showing {filtered.length} of {users.length} users</p>

      {modalMode && (
        <UserProfileModal
          mode={modalMode}
          form={form}
          onChange={handleFormChange}
          onClose={() => setModalMode(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
