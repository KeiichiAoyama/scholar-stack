import { useEffect, useState } from 'react';
import { Building2, IdCard, Mail, ShieldCheck, UserRound } from 'lucide-react';
import FormField, { Input, Select } from '../components/ui/FormField';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/profileService';

const ADMIN_PROFILE = {
  name: 'Admin UMN',
  email: 'admin@umn.ac.id',
  role: 'Admin',
  employeeId: 'ADM-UMN-001',
  unit: 'Research and Community Service',
  affiliation: 'Universitas Multimedia Nusantara',
  accessLevel: 'Institution Administrator',
  phone: '021-5422-0808',
};

function getInitials(name) {
  return (name || '')
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function ProfileHero({ profile, role }) {
  return (
    <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-primary px-6 py-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-2xl font-bold text-white border-4 border-white/20">
            {getInitials(profile.name) || '--'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white/70 text-sm">{role === 'Admin' ? 'Administrator Profile' : 'Lecturer Profile'}</p>
            <h2 className="text-2xl font-semibold mt-1 truncate">{profile.name || 'Loading profile...'}</h2>
            <p className="text-white/75 text-sm mt-1">{profile.affiliation}</p>
          </div>
          <span className="self-start md:self-center rounded-full bg-white/10 border border-white/20 px-3 py-1 text-sm font-medium">
            {role}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-gray-100">
        <div className="px-5 py-4 flex items-center gap-3">
          <IdCard size={18} className="text-primary" />
          <div>
            <p className="text-xs text-gray-500">{role === 'Admin' ? 'Employee ID' : 'NIDN'}</p>
            <p className="text-sm font-semibold text-gray-800">{profile.nidn || profile.employeeId}</p>
          </div>
        </div>
        <div className="px-5 py-4 flex items-center gap-3">
          <Building2 size={18} className="text-primary" />
          <div>
            <p className="text-xs text-gray-500">{role === 'Admin' ? 'Unit' : 'Department'}</p>
            <p className="text-sm font-semibold text-gray-800">{profile.departmentUnit || profile.unit}</p>
          </div>
        </div>
        <div className="px-5 py-4 flex items-center gap-3">
          <ShieldCheck size={18} className="text-primary" />
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <p className="text-sm font-semibold text-gray-800">{profile.status || profile.accessLevel}</p>
          </div>
        </div>
        <div className="px-5 py-4 flex items-center gap-3">
          <Mail size={18} className="text-primary" />
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm font-semibold text-gray-800 truncate">{profile.email || 'erick.fernando@student.umn.ac.id'}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [lecturerProfile, setLecturerProfile] = useState({});
  const [adminProfile, setAdminProfile] = useState(ADMIN_PROFILE);
  const activeProfile = isAdmin ? adminProfile : lecturerProfile;
  useEffect(() => {
    if (!isAdmin && user?.id) getProfile(user.id).then(setLecturerProfile);
  }, [isAdmin, user?.id]);

  function handleLecturerChange(event) {
    setLecturerProfile((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  }

  function handleAdminChange(event) {
    setAdminProfile((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isAdmin) setLecturerProfile(await updateProfile(user.id, lecturerProfile));
  }

  if (isAdmin) {
    return (
      <div className="space-y-5 max-w-7xl">
        <ProfileHero profile={activeProfile} role="Admin" />

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <UserRound size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-gray-800">Account Information</h2>
          </div>
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <FormField label="Name" required>
              <Input name="name" value={adminProfile.name} onChange={handleAdminChange} />
            </FormField>
            <FormField label="Email" required>
              <Input type="email" name="email" value={adminProfile.email} onChange={handleAdminChange} />
            </FormField>
            <FormField label="Employee ID">
              <Input name="employeeId" value={adminProfile.employeeId} onChange={handleAdminChange} />
            </FormField>
            <FormField label="Unit">
              <Input name="unit" value={adminProfile.unit} onChange={handleAdminChange} />
            </FormField>
            <FormField label="Affiliation">
              <Input name="affiliation" value={adminProfile.affiliation} onChange={handleAdminChange} />
            </FormField>
            <FormField label="Access Level">
              <Select name="accessLevel" value={adminProfile.accessLevel} onChange={handleAdminChange}>
                <option value="Institution Administrator">Institution Administrator</option>
                <option value="Verifier">Verifier</option>
                <option value="Read Only">Read Only</option>
              </Select>
            </FormField>
            <FormField label="Phone">
              <Input name="phone" value={adminProfile.phone} onChange={handleAdminChange} />
            </FormField>
          </div>
          <div className="px-6 py-4 border-t border-gray-100">
            <Button type="submit" variant="primary">Update Profile</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl">
      <ProfileHero profile={activeProfile} role="Lecturer" />

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Profile Information</h2>
        </div>
        <div className="px-6 py-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Lecturer Identity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <FormField label="Status">
            <Select name="status" value={lecturerProfile.status || ''} onChange={handleLecturerChange}>
              <option value="Lecturer">Lecturer</option>
              <option value="Admin">Admin</option>
            </Select>
          </FormField>
          <FormField label="NIDN / NIDK / NUP / NIP">
            <Input name="nidn" value={lecturerProfile.nidn || ''} onChange={handleLecturerChange} />
          </FormField>
          <FormField label="Name" required>
            <Input name="name" value={lecturerProfile.name || ''} onChange={handleLecturerChange} />
          </FormField>
          <FormField label="Email">
            <Input type="email" name="email" value={lecturerProfile.email || ''} onChange={handleLecturerChange} />
          </FormField>
          <FormField label="Affiliation">
            <Input name="affiliation" value={lecturerProfile.affiliation || ''} onChange={handleLecturerChange} />
          </FormField>
          <FormField label="Department / Unit">
            <Input name="departmentUnit" value={lecturerProfile.departmentUnit || ''} onChange={handleLecturerChange} />
          </FormField>
          <FormField label="Google Scholar ID">
            <Input name="googleScholarId" value={lecturerProfile.googleScholarId || ''} onChange={handleLecturerChange} />
          </FormField>
          <FormField label="Scopus ID">
            <Input name="scopusId" value={lecturerProfile.scopusId || ''} onChange={handleLecturerChange} />
          </FormField>
          <FormField label="Scopus API Key">
            <Input name="scopusApiKey" value={lecturerProfile.scopusApiKey || ''} onChange={handleLecturerChange} />
          </FormField>
          <FormField label="Scopus Inst Token">
            <Input name="scopusInstToken" value={lecturerProfile.scopusInstToken || ''} onChange={handleLecturerChange} />
          </FormField>
          <FormField label="SINTA ID">
            <Input name="sintaId" value={lecturerProfile.sintaId || ''} onChange={handleLecturerChange} />
          </FormField>
          <FormField label="SINTA Username">
            <Input name="sintaUsername" value={lecturerProfile.sintaUsername || ''} onChange={handleLecturerChange} />
          </FormField>
          <FormField label="SINTA Password">
            <Input type="password" name="sintaPassword" value={lecturerProfile.sintaPassword || ''} onChange={handleLecturerChange} />
          </FormField>
          <FormField label="Academic Grade">
            <Select name="academicGrade" value={lecturerProfile.academicGrade} onChange={handleLecturerChange}>
              <option value="Asisten Ahli">Asisten Ahli</option>
              <option value="Lektor">Lektor</option>
              <option value="Lektor Kepala">Lektor Kepala</option>
              <option value="Profesor">Profesor</option>
            </Select>
          </FormField>
          <FormField label="Last Education Degree">
            <Select name="lastEducationDegree" value={lecturerProfile.lastEducationDegree} onChange={handleLecturerChange}>
              <option value="S1">S1</option>
              <option value="S2">S2</option>
              <option value="S3">S3</option>
            </Select>
          </FormField>
          </div>

          <h3 className="text-sm font-semibold text-gray-700 mt-8 mb-4">PDDIKTI Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <FormField label="NIK">
            <Input name="nik" value={lecturerProfile.nik} onChange={handleLecturerChange} />
          </FormField>
          <FormField label="Jenis Kelamin (Gender)">
            <Select name="gender" value={lecturerProfile.gender} onChange={handleLecturerChange}>
              <option value="Male">Male (Laki-laki)</option>
              <option value="Female">Female (Perempuan)</option>
            </Select>
          </FormField>
          <FormField label="Tempat Lahir (Place of Birth)">
            <Input name="placeOfBirth" value={lecturerProfile.placeOfBirth} onChange={handleLecturerChange} />
          </FormField>
          <FormField label="Tanggal Lahir (Date of Birth)">
            <Input type="date" name="dateOfBirth" value={lecturerProfile.dateOfBirth} onChange={handleLecturerChange} />
          </FormField>
          <FormField label="Handphone">
            <Input type="tel" name="handphone" value={lecturerProfile.handphone} onChange={handleLecturerChange} />
          </FormField>
          <FormField label="Agama (Religion)">
            <Select name="religion" value={lecturerProfile.religion} onChange={handleLecturerChange}>
              <option value="Islam">Islam</option>
              <option value="Kristen">Kristen</option>
              <option value="Katolik">Katolik</option>
              <option value="Hindu">Hindu</option>
              <option value="Budha">Budha</option>
              <option value="Konghucu">Konghucu</option>
            </Select>
          </FormField>
          <FormField label="Ikatan Kerja (Employment Type)">
            <Select name="employmentType" value={lecturerProfile.employmentType} onChange={handleLecturerChange}>
              <option value="Dosen Tetap">Dosen Tetap</option>
              <option value="Dosen Tidak Tetap">Dosen Tidak Tetap</option>
              <option value="Dosen Kontrak">Dosen Kontrak</option>
            </Select>
          </FormField>
          <FormField label="Status Pegawai (Employee Status)">
            <Select name="employeeStatus" value={lecturerProfile.employeeStatus} onChange={handleLecturerChange}>
              <option value="NON ASN">NON ASN</option>
              <option value="ASN">ASN</option>
            </Select>
          </FormField>
          <FormField label="Pangkat">
            <Input name="pangkat" value={lecturerProfile.pangkat} onChange={handleLecturerChange} />
          </FormField>
          <FormField label="Golongan">
            <Input name="golongan" value={lecturerProfile.golongan} onChange={handleLecturerChange} />
          </FormField>
          <FormField label="Jabatan Fungsional">
            <Input name="jabatanFungsional" value={lecturerProfile.jabatanFungsional} onChange={handleLecturerChange} />
          </FormField>
          <FormField label="Prodi">
            <Input name="prodi" value={lecturerProfile.prodi} onChange={handleLecturerChange} />
          </FormField>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100">
          <Button type="submit" variant="primary">Update Profile</Button>
        </div>
      </form>
    </div>
  );
}
