import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BookOpen, GraduationCap, Mail, Search, UserRound } from 'lucide-react';
import { Input } from '../components/ui/FormField';
import { getLecturers } from '../services/dataService';

const KEYWORDS = [
  'Blockchain technology',
  'Information system',
  'Enterprise architecture',
  'Adoption technology',
  'Embedded systems',
];

function getInitials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [lecturers, setLecturers] = useState([]);
  useEffect(() => { getLecturers().then((items) => setLecturers(items.map((item, index) => ({ ...item, keywords: KEYWORDS.slice(index % 3, (index % 3) + 3) })))); }, []);

  const filteredLecturers = lecturers.filter((lecturer) => {
    const haystack = `${lecturer.name} ${lecturer.nidn} ${lecturer.email} ${lecturer.department} ${lecturer.keywords.join(' ')}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Explore Lecturers</h2>
            <p className="text-sm text-gray-500 mt-1">Browse lecturer profiles, scores, and publication records.</p>
          </div>
          <div className="relative md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search lecturer or keyword"
              className="pl-9"
            />
          </div>
        </div>
        <div className="px-5 py-3 text-xs text-gray-500">
          Total Lecturers: {filteredLecturers.length}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredLecturers.map((lecturer) => (
          <Link
            key={lecturer.id}
            to={`/explore/${lecturer.id}`}
            className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
          >
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-lg bg-primary text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                {getInitials(lecturer.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-primary truncate">{lecturer.name}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-500">
                      <p className="flex items-center gap-2">
                        <GraduationCap size={15} />
                        {lecturer.department}
                      </p>
                      <p className="flex items-center gap-2">
                        <UserRound size={15} />
                        NIDN: {lecturer.nidn}
                      </p>
                      <p className="flex items-center gap-2 truncate">
                        <Mail size={15} />
                        {lecturer.email}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1">
                    {lecturer.status}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {lecturer.keywords.map((keyword) => (
                    <span key={keyword} className="rounded-full bg-primary/5 text-primary px-2.5 py-1 text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Score</p>
                    <p className="font-semibold text-gray-800">{lecturer.score.toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">3Yr Score</p>
                    <p className="font-semibold text-gray-800">{lecturer.score3yr}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Papers</p>
                    <p className="font-semibold text-gray-800 inline-flex items-center gap-1">
                      <BookOpen size={14} />
                      {lecturer.publicationCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredLecturers.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-10 text-center text-gray-400 text-sm shadow-sm">
          No lecturers match your search.
        </div>
      )}
    </div>
  );
}
