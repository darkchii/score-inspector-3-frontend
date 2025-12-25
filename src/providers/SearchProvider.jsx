import { Fade, Paper, ThemeProvider, useTheme } from '@mui/material';
import searchStyles from '../styles/search.module.less';
import React, { createContext, useContext, useEffect, useState } from "react";
import DebouncedTextField from '../components/DebouncedTextField';

const SearchContext = createContext();

export function SearchProvider({ children }) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const openSearch = () => {
        setIsSearchOpen(true);
    }

    const closeSearch = () => {
        setIsSearchOpen(false);
    }

    const search = async (query) => {
        //for a test, simulate a search delay
        setIsSearching(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsSearching(false);
    }

    //when pressing escape key, close the search modal
    useEffect(() => {
        const handleKeyDown = (event) => {
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
                <SearchModal working={isSearching} open={isSearchOpen} onClose={closeSearch} onSearch={search} />
                {children}
            </React.Fragment>
        </SearchContext.Provider>
    )
}

function SearchModal({ open = false, working = false, onClose = () => { }, onSearch = (query) => { } }) {
    return (
        <Fade in={open} unmountOnExit>
            <div className={searchStyles['search-modal']}>
                <div className={searchStyles['search-modal__backdrop']} onClick={onClose} />
                <div className={searchStyles['search-modal__content']}>
                    <Paper elevation={3}>
                        <DebouncedTextField
                            size='large'
                            label="Search..."
                            variant="outlined"
                            onDebouncedChange={(value) => onSearch(value)}
                            autoFocus
                            fullWidth
                            disabled={working}
                        />
                    </Paper>
                </div>
            </div>
        </Fade>
    )
}

export function useSearch() {
    return useContext(SearchContext);
}