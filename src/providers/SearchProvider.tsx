import { Collapse, Fade, Grid, Modal, Paper, ThemeProvider, useTheme } from '@mui/material';
import searchStyles from '../styles/search.module.less';
import React, { createContext, useContext, useEffect, useState } from "react";
import DebouncedTextField from '../components/DebouncedTextField';
import { useApi } from './ApiProvider';
import PlayerCard from '../components/PlayerCard';
import { SearchContextValue } from './ContextTypes';

const SearchContext = createContext<SearchContextValue>({} as SearchContextValue);

export function SearchProvider({ children }: { children: React.ReactNode }) {
    const { getUserSearch } = useApi();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [query, setQuery] = useState('');

    const [searchResults, setSearchResults] = useState([]);

    const openSearch = () => {
        setIsSearchOpen(true);
    }

    const closeSearch = () => {
        setIsSearchOpen(false);
    }

    const search = async (query: string) => {
        if (isSearching) {
            return;
        }

        if (!query || query.length < 2) {
            setSearchResults([]);
            return;
        }

        setQuery(query);

        setIsSearching(true);
        try {
            const results = await getUserSearch(query);
            setSearchResults(results);
        } catch (error) {
            console.error("Error during search:", error);
        } finally {
            setIsSearching(false);
        }
    }

    //when pressing escape key, close the search modal
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeSearch();
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        }
    }, []);

    return (
        <SearchContext.Provider value={{ openSearch, closeSearch, isSearchOpen }}>
            <React.Fragment>
                <SearchModal query={query} working={isSearching} open={isSearchOpen} results={searchResults} onClose={closeSearch} onSearch={search} />
                {children}
            </React.Fragment>
        </SearchContext.Provider>
    )
}

function SearchModal({ query = '', open = false, working = false, results = [], onClose = () => { }, onSearch = (query: string) => { } }: { query: string, open: boolean, working: boolean, results: any[], onClose: () => void, onSearch: (query: string) => void }) {
    return (
        <Modal open={open} onClose={onClose} closeAfterTransition disableEnforceFocus disableRestoreFocus>
            <div className={searchStyles['search-modal']}>
                <div className={searchStyles['search-modal__backdrop']} onClick={onClose} />
                <div className={searchStyles['search-modal__content']}>
                    <Paper elevation={3} sx={{ padding: 2, width: '100%' }}>
                        <DebouncedTextField
                            size='large'
                            label="Search..."
                            variant="outlined"
                            onDebouncedChange={(value) => onSearch(value)}
                            fullWidth
                            autoFocus
                            disabled={working}
                            defaultValue={query}
                        />
                        {
                            working ?
                                <div className={searchStyles['search-modal__loading']}>
                                    Searching...
                                </div>
                                :
                                <div className={searchStyles['search-modal__results']}>
                                    {
                                        results.length === 0 ?
                                            <div className={searchStyles['search-modal__no-results']}>
                                                No results
                                            </div>
                                            :
                                            <Collapse in={results.length > 0}>
                                                <Grid container spacing={2}>
                                                    {results.map((result, index) => (
                                                        <Grid size={{ xs: 12, md: 4 }} key={index}>
                                                            <PlayerCard data={result} onClick={() => onClose()} />
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </Collapse>
                                    }
                                </div>
                        }
                    </Paper>
                </div>
            </div>
        </Modal>
    )
}

export function useSearch() {
    return useContext(SearchContext);
}