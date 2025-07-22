
document.getElementById('hideUnchanged').addEventListener('change', function() {
    const table = document.querySelector('.list');
    const rows = table.querySelectorAll('tr[data-change="false"]');
    
    if (this.checked) {
        // Hide rows with data-change="false"
        rows.forEach(row => {
            row.style.display = 'none';
        });
    } else {
        // Show all rows
        rows.forEach(row => {
            row.style.display = '';
        });
    }
});


// Helper functions for localStorage
function saveFilterState(key, value) {
    try {
        localStorage.setItem(`tableFilter_${key}`, JSON.stringify(value));
    } catch (e) {
        console.warn('Could not save filter state to localStorage:', e);
    }
}

function loadFilterState(key, defaultValue) {
    try {
        const stored = localStorage.getItem(`tableFilter_${key}`);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
        console.warn('Could not load filter state from localStorage:', e);
        return defaultValue;
    }
}

// Initialize filters and event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Set up filter inputs
    const filterInputs = [
        { id: 'filter-identity', key: 'identity' },
        { id: 'filter-card', key: 'card' },
        { id: 'filter-type', key: 'type' },
        { id: 'filter-context', key: 'context' },
        { id: 'filter-wg', key: 'wg' },
        { id: 'filter-status', key: 'status' }
    ];

    // Add event listeners for text filters
    filterInputs.forEach(filter => {
        const input = document.getElementById(filter.id);
        if (input) {
            // Load and restore saved value from localStorage
            const savedValue = loadFilterState(filter.key, '');
            input.value = savedValue;
            
            // Add event listener
            input.addEventListener('input', function() {
                saveFilterState(filter.key, this.value);
                applyFilters();
            });
        }
    });

    // Add event listener for checkbox
    const hideUnchangedCheckbox = document.getElementById('hideUnchanged');
    if (hideUnchangedCheckbox) {
        // Load and restore saved checkbox state
        const savedChecked = loadFilterState('hideUnchanged', false);
        hideUnchangedCheckbox.checked = savedChecked;
        
        hideUnchangedCheckbox.addEventListener('change', function() {
            saveFilterState('hideUnchanged', this.checked);
            applyFilters();
        });
    }

    // Apply initial filters
    applyFilters();
});

function applyFilters() {
    const dataRows = document.querySelectorAll('.data-row');
    
    // Load current filter values from localStorage
    const filterValues = {
        identity: loadFilterState('identity', ''),
        card: loadFilterState('card', ''),
        type: loadFilterState('type', ''),
        context: loadFilterState('context', ''),
        wg: loadFilterState('wg', ''),
        status: loadFilterState('status', ''),
        hideUnchanged: loadFilterState('hideUnchanged', false)
    };
    
    dataRows.forEach(row => {
        let shouldShow = true;
        const cells = row.querySelectorAll('td');
        
        // Check text filters for each column
        const filters = [
            { value: filterValues.identity, cellIndex: 0 },
            { value: filterValues.card, cellIndex: 1 },
            { value: filterValues.type, cellIndex: 2 },
            { value: filterValues.context, cellIndex: 3 },
            { value: filterValues.wg, cellIndex: 4 },
            { value: filterValues.status, cellIndex: 5 }
        ];

        filters.forEach(filter => {
            if (filter.value && cells[filter.cellIndex]) {
                const cellText = cells[filter.cellIndex].textContent.toLowerCase();
                const filterText = filter.value.toLowerCase();
                if (!cellText.includes(filterText)) {
                    shouldShow = false;
                }
            }
        });

        // Check "Hide Unchanged" filter
        if (filterValues.hideUnchanged && row.getAttribute('data-change') !== 'true') {
            shouldShow = false;
        }

        // Apply visibility
        if (shouldShow) {
            row.classList.remove('hidden-row');
        } else {
            row.classList.add('hidden-row');
        }
    });
}

// Function to clear all filters
function clearAllFilters() {
    const filterInputs = document.querySelectorAll('.filter-input');
    filterInputs.forEach(input => {
        input.value = '';
    });
    
    const hideUnchangedCheckbox = document.getElementById('hideUnchanged');
    if (hideUnchangedCheckbox) {
        hideUnchangedCheckbox.checked = false;
    }

    // Clear localStorage for all filter keys
    const filterKeys = ['identity', 'card', 'type', 'context', 'wg', 'status', 'hideUnchanged'];
    filterKeys.forEach(key => {
        try {
            localStorage.removeItem(`tableFilter_${key}`);
        } catch (e) {
            console.warn('Could not clear filter from localStorage:', e);
        }
    });

    applyFilters();
}

// Optional: Function to export filter settings
function exportFilterSettings() {
    const filterKeys = ['identity', 'card', 'type', 'context', 'wg', 'status', 'hideUnchanged'];
    const settings = {};
    
    filterKeys.forEach(key => {
        settings[key] = loadFilterState(key, key === 'hideUnchanged' ? false : '');
    });
    
    return JSON.stringify(settings, null, 2);
}

// Optional: Function to import filter settings
function importFilterSettings(settingsJson) {
    try {
        const settings = JSON.parse(settingsJson);
        
        Object.keys(settings).forEach(key => {
            saveFilterState(key, settings[key]);
        });
        
        // Refresh the page or reload filter inputs
        location.reload();
    } catch (e) {
        console.error('Could not import filter settings:', e);
        alert('Invalid settings format');
    }
}
