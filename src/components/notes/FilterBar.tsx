'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { SubjectCategory } from '@/types';
import { Search, Filter, ArrowUpDown, LayoutGrid, List } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedSubject: string;
  setSelectedSubject: (s: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  subjects: SubjectCategory[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedSubject,
  setSelectedSubject,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  subjects,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-[#E5DDD2] p-5 shadow-soft space-y-4">
      {/* Search and Main Controls row */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 max-w-xl">
          <Input
            placeholder="Search by topic, course code, keyword or tag (e.g. pointers, calculus)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4 text-[#7A756D]" />}
          />
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#7A756D] absolute left-3 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#FAF7F2] border border-[#D5C9BA] text-[#2D2A26] text-xs font-medium rounded-lg pl-8 pr-8 py-2.5 focus:outline-none focus:border-[#2D2A26] focus:ring-1 focus:ring-[#2D2A26]/10 shadow-soft-xs appearance-none cursor-pointer"
            >
              <option value="newest">Newest Uploads</option>
              <option value="oldest">Oldest Lecture Date</option>
              <option value="stars">Most Starred</option>
              <option value="popular">Most Viewed</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-[#FAF7F2] p-1 rounded-lg border border-[#E5DDD2]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-white text-[#2D2A26] shadow-soft-xs border border-[#D5C9BA]' : 'text-[#7A756D] hover:text-[#2D2A26]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white text-[#2D2A26] shadow-soft-xs border border-[#D5C9BA]' : 'text-[#7A756D] hover:text-[#2D2A26]'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Subject Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-[#E5DDD2] pt-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#7A756D] flex items-center gap-1.5 shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5" /> Subjects:
        </span>
        <button
          onClick={() => setSelectedSubject('All')}
          className={`text-xs px-3.5 py-1.5 rounded-lg border font-medium transition-all shrink-0 ${
            selectedSubject === 'All'
              ? 'bg-[#2D2A26] text-[#FAF7F2] border-[#2D2A26] shadow-soft-xs'
              : 'bg-white text-[#5A554E] border-[#E5DDD2] hover:bg-[#FAF7F2] hover:text-[#2D2A26]'
          }`}
        >
          All Subjects
        </button>

        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => setSelectedSubject(subject)}
            className={`text-xs px-3.5 py-1.5 rounded-lg border font-medium transition-all shrink-0 ${
              selectedSubject === subject
                ? 'bg-[#F4EFEA] text-[#2D2A26] border-[#D5C9BA] shadow-soft-xs font-semibold'
                : 'bg-white text-[#5A554E] border-[#E5DDD2] hover:bg-[#FAF7F2] hover:text-[#2D2A26]'
            }`}
          >
            {subject}
          </button>
        ))}
      </div>
    </div>
  );
};
