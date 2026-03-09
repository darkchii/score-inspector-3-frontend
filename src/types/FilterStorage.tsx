const STORAGE_KEY = "score_filter_presets";

class FilterStorage {
    loadAll() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
        } catch {
            return []
        }
    }

    saveAll(presets: any) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    }
}

export default FilterStorage;