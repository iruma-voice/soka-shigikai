import { createContext, useContext, useState, type ReactNode } from 'react';

export type SortOption = 'default' | 'current_desc' | 'total_desc' | 'current_asc' | 'faction_order';

interface SearchSortContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
}

const SearchSortContext = createContext<SearchSortContextType | undefined>(undefined);

export function SearchSortProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('current_desc');

  return (
    <SearchSortContext.Provider value={{ searchTerm, setSearchTerm, sortOption, setSortOption }}>
      {children}
    </SearchSortContext.Provider>
  );
}

export function useSearchSort() {
  const context = useContext(SearchSortContext);
  if (context === undefined) {
    throw new Error('useSearchSort must be used within a SearchSortProvider');
  }
  return context;
}
