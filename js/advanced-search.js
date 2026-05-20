/**
 * Advanced Search Page Functionality Module
 * Uses the same data source as homepage search
 */

class AdvancedSearchModule {
    constructor() {
        this.searchData = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.itemsPerPageList = 5;
        this.itemsPerPageTable = 20;
        this.itemsPerPage = this.itemsPerPageList; // 默认list
        this.searchTimeout = null;
        this.currentFilters = {};
        this.currentSearchType = 'all';
        this.currentView = 'list';
        this.masonryLoaded = false;
        this.masonryPage = 1;
        this.masonryPageSize = 30;
        this.masonryData = [];
        
        // Performance optimizations
        this.searchCache = new Map();
        this.debounceDelay = 300;
        
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.setupFilters();
            console.log('Advanced Search Module initialized');
        } catch (error) {
            console.error('Failed to initialize advanced search:', error);
        }
    }

    async loadData() {
        try {
            // Use the same search.json file as homepage search
            const potentialPaths = [
                `${window.location.origin}${window.DASHBOARD_CONFIG?.baseurl || ''}/search.json`,
                './search.json',
                '../search.json',
                '/search.json',
                'search.json'
            ].filter(Boolean);

            let response = null;
            let successfulPath = null;

            // Try each path until one works
            for (const path of potentialPaths) {
                try {
                    console.log(`Attempting to load data from: ${path}`);
                    response = await fetch(path);
                    if (response.ok) {
                        successfulPath = path;
                        break;
                    }
                } catch (error) {
                    console.warn(`Failed to load from ${path}:`, error.message);
                    continue;
                }
            }

            if (!response || !response.ok) {
                throw new Error(`Failed to load data from any path. Last status: ${response?.status}`);
            }

            const text = await response.text();
            
            // Try to parse JSON, handling possible Jekyll template issues
            try {
                this.searchData = JSON.parse(text);
            } catch (e) {
                // Try to clean the text if it has template markers
                const jsonStart = text.indexOf('[');
                if (jsonStart !== -1) {
                    const cleanedText = text.substring(jsonStart);
                    this.searchData = JSON.parse(cleanedText);
                } else {
                    throw e;
                }
            }
            
            console.log(`Successfully loaded ${this.searchData.length} records from: ${successfulPath}`);
            
            // Enhance page-type data, parse tags field
            this.searchData = this.searchData.map(item => {
                // Mark as page type result
                item.result_type = 'page';
                
                // Parse tags field, extract structured data
                if (item.tags) {
                    const tagMap = this.parseTagsToMap(item.tags);
                    item.structured_tags = tagMap;
                    
                    // Extract common filter fields from tags
                    item.target_type = tagMap['Type'] || '';
                    item.sequence_length = tagMap['Length'] ? parseInt(tagMap['Length']) : undefined;
                    
                    // 为页面类型数据创建 basicTags，排除数字类标签避免搜索干扰
                    const originalTags = item.tags;
                    if (typeof originalTags === 'string') {
                        const tagList = originalTags.split(/[\n,]+/).map(tag => tag.trim()).filter(Boolean);
                        const basicTagList = tagList.filter(tag => {
                            return !tag.match(/^(Length|GC|Year):/i);
                        });
                        item.tags = basicTagList.join(', ');
                        item.meta_tags = originalTags;
                    }
                    // GC content handling (could be multiple values)
                    if (item.meta_tags || originalTags) {
                        const tagsToSearch = item.meta_tags || originalTags;
                        const gcMatches = tagsToSearch.match(/GC\s*:\s*([\d\.]+)/gi);
                        if (gcMatches && gcMatches.length) {
                            const gcValues = gcMatches.map(m => parseFloat(m.split(':')[1])).filter(v => !isNaN(v));
                            if (gcValues.length) {
                                const minGc = Math.min(...gcValues);
                                const maxGc = Math.max(...gcValues);
                                const gcVal = Number(minGc.toFixed(2));
                                item.gc_content = gcVal; // 用最小值做筛选参考
                                item.gc_content_range = minGc === maxGc ? `${gcVal}` : `${minGc.toFixed(2)}-${maxGc.toFixed(2)}`;
                            }
                        }
                    }
                    // Length handling (could be multiple values)
                    if (item.meta_tags || originalTags) {
                        const tagsToSearch = item.meta_tags || originalTags;
                        const lenMatches = tagsToSearch.match(/Length\s*:\s*(\d+)/gi);
                        if (lenMatches && lenMatches.length) {
                            const lenValues = lenMatches.map(m => parseInt(m.split(':')[1])).filter(v => !isNaN(v));
                            if (lenValues.length) {
                                const minLen = Math.min(...lenValues);
                                const maxLen = Math.max(...lenValues);
                                item.sequence_length = minLen; // 用最小值做筛选参考
                                item.sequence_length_range = minLen === maxLen ? `${minLen}` : `${minLen}-${maxLen}`;
                            }
                        }
                    }
                    item.pub_year = tagMap['Year'] ? parseInt(tagMap['Year']) : undefined;
                    item.category_value = tagMap['Category'] || '';

                    // 记录页面是否包含多个 aptamer (根据 Named: 标签计数)
                    const namedMatches = (item.meta_tags || originalTags).match(/Named\s*:/gi);
                    if (namedMatches && namedMatches.length) {
                        item.aptamer_count = namedMatches.length;
                    }
                }
                
                return item;
            });
            
            // Also load sequences_cleaned.json data and merge into searchData
            try {
                const seqRes = await fetch('/apidata/sequences_cleaned.json');
                if (seqRes.ok) {
                    const seqJson = await seqRes.json();
                    if (seqJson && Array.isArray(seqJson.Sheet1) && typeof SearchUtils.transformSequenceRecord === 'function') {
                        const sequenceData = seqJson.Sheet1.map(r => {
                            // Convert to search record format
                            const record = SearchUtils.transformSequenceRecord(r);
                            
                            // Mark as sequence type result
                            record.result_type = 'sequence';
                            
                            // Always ensure sequence results point to /sequences/ page
                            if (record.id) {
                                record.url = `/sequences/?id=${encodeURIComponent(record.id)}`;
                            }
                            
                            // Parse tags field, extract structured data
                            if (record.meta_tags) {
                                record.structured_tags = this.parseTagsToMap(record.meta_tags);
                            } else if (record.tags) {
                                record.structured_tags = this.parseTagsToMap(record.tags);
                            }
                            
                            // Extract and convert Affinity data to standardized kd_value in nM
                            if (r.Affinity) {
                                record.kd_value = this.parseAffinityToNanomolar(r.Affinity);
                                record.affinity_raw = r.Affinity; // Keep original for display
                            }
                            
                            return record;
                        });
                        
                        this.searchData.push(...sequenceData);
                        console.log(`Added ${sequenceData.length} sequence records to search data`);
                    }
                }
            } catch (e) { 
                console.warn('Failed to load sequences data for advanced search:', e); 
            }
        } catch (error) {
            console.error('Error loading search data:', error);
            console.log('Using mock data as fallback');
            // Use mock data as fallback
            this.searchData = this.generateMockData();
        }
    }

    generateMockData() {
        // Generate mock data based on aptamer research
        const mockData = [];
        const aptamerTypes = [
            'ATP binding aptamer',
            'Thrombin aptamer',
            'PDGF aptamer', 
            'Lysozyme aptamer',
            'Cocaine aptamer',
            'Immunoglobulin E aptamer',
            'Vascular Endothelial Growth Factor(VEGF)',
            'Protein kinase C aptamer',
            'Human α-thrombin aptamer',
            'Adenosine aptamer'
        ];
        
        const targets = ['ATP', 'Thrombin', 'PDGF', 'Lysozyme', 'Cocaine', 'IgE', 'VEGF', 'PKC', 'α-thrombin', 'Adenosine'];
        const categories = ['aptamer', 'structure', 'application', 'selex', 'fluorescence'];

        for (let i = 0; i < 100; i++) {
            const randomIndex = i % aptamerTypes.length;
            const randomName = aptamerTypes[randomIndex];
            const randomTarget = targets[randomIndex];
            
            mockData.push({
                title: `${randomName} ${Math.floor(i/10) + 1}`,
                content: `This is a comprehensive study of ${randomName} including structural analysis, binding affinity measurements, and potential therapeutic applications. The aptamer shows high specificity for ${randomTarget} with excellent binding characteristics.`,
                category: categories[Math.floor(Math.random() * categories.length)],
                tags: `${randomTarget}, aptamer, binding, structural analysis`,
                url: `/aptamer/${randomName.toLowerCase().replace(/\s+/g, '-')}-${i+1}/`,
                date: `${2000 + Math.floor(Math.random() * 24)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
                // Additional metadata for aptamers
                target: randomTarget,
                sequence_length: 20 + Math.floor(Math.random() * 80),
                gc_content: 30 + Math.floor(Math.random() * 40),
                kd_value: (Math.random() * 1000).toFixed(2),
                selection_rounds: Math.floor(Math.random() * 15) + 5,
                structure_type: Math.random() > 0.5 ? 'DNA' : 'RNA'
            });
        }
        return mockData;
    }

    setupEventListeners() {
        // Main search input
        const searchInput = document.getElementById('mainSearchInput');
        const clearBtn = document.getElementById('clearSearch');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                clearBtn.classList.toggle('visible', value.length > 0);
                
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.performSearch(value);
                }, 300);
            });

            searchInput.addEventListener('focus', (e) => {
                this.showSuggestions();
            });

        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                clearBtn.classList.remove('visible');
                this.clearSearch();
            });
        }

        // Search type buttons
        document.querySelectorAll('.search-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.search-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentSearchType = btn.dataset.type;
                this.performSearch(searchInput.value);
            });
        });

        // Example tag click
        document.querySelectorAll('.example-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const example = tag.dataset.example;
                searchInput.value = example;
                clearBtn.classList.add('visible');
                this.performSearch(example);
            });
        });

        // Filter controls
        this.setupFilterControls();

        // Result controls
        this.setupResultControls();

        // Floating buttons
        this.setupFloatingButtons();

        const searchCard = document.querySelector('.search-card');
        const filterCard = document.querySelector('.filter-card');
        const resultsList = document.getElementById('resultsList');
    }

    setupFilterControls() {
        const toggleBtn = document.getElementById('toggleFilters');
        const filtersContent = document.getElementById('filtersContent');
        const resetBtn = document.getElementById('resetFilters');
        const applyBtn = document.getElementById('applyFilters');
        const searchInput = document.getElementById('mainSearchInput');
        const searchCard = document.querySelector('.search-card');
        const filterCard = document.querySelector('.filter-card');
        const resultsCard = document.querySelector('.results-card');
        const filterHeader = document.querySelector('.filter-card .filter-header');

        let lastScrollTop = 0;
        let isScrolling = false;
        let scrollTimeout;
        let isSliding = false;

        function updateStickyState() {
            const isFilterOpen = !filtersContent.classList.contains('collapsed');
            
            // Focus状态检查已移除，不再添加sticky类
            if (false) {
                searchCard.classList.add('sticky');
                if (isFilterOpen) {
                    filterCard.classList.add('sticky');
                    resultsCard.classList.add('sticky');
                }
            } else {
                searchCard.classList.remove('sticky');
                filterCard.classList.remove('sticky');
                resultsCard.classList.remove('sticky');
            }
        }

        function handleScroll() {
            if (!isScrolling) {
                isScrolling = true;
                requestAnimationFrame(() => {
                    const st = window.pageYOffset || document.documentElement.scrollTop;
                    const searchCardRect = searchCard.getBoundingClientRect();
                    const filterCardRect = filterCard.getBoundingClientRect();
                    
                    // 以前的 slide-left 动画已移除，避免刷新后上滑出现侧滑效果
                    
                    // 当回到顶部时
                    if (st < lastScrollTop && st < 100) {
                        searchCard.classList.remove('sticky');
                        filterCard.classList.remove('sticky');
                        resultsCard.classList.remove('sticky');
                    }
                    // 正常滚动时的吸顶效果
                    else if (st > lastScrollTop && searchCardRect.top < 0) {
                        searchCard.classList.add('sticky');
                        if (!filtersContent.classList.contains('collapsed')) {
                            filterCard.classList.add('sticky');
                            resultsCard.classList.add('sticky');
                        }
                    }
                    
                    lastScrollTop = st <= 0 ? 0 : st;
                    isScrolling = false;
                });
            }
        }

        if (toggleBtn && filtersContent) {
            toggleBtn.addEventListener('click', () => {
                // 添加水润效果
                filterCard.classList.add('water-ripple');
                setTimeout(() => {
                    filterCard.classList.remove('water-ripple');
                }, 1200);

                filtersContent.classList.toggle('collapsed');
                const icon = toggleBtn.querySelector('i');
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
                
                updateStickyState();
            });
        }

        if (searchInput && searchCard) {
            searchInput.addEventListener('focus', () => {
                searchCard.classList.add('focused');
                searchCard.classList.add('water-ripple');
                setTimeout(() => {
                    searchCard.classList.remove('water-ripple');
                }, 1200);
                updateStickyState();
            });

            searchInput.addEventListener('blur', () => {
                searchCard.classList.remove('focused');
                updateStickyState();
            });
        }

        // 监听滚动事件（passive，提高性能）
        window.addEventListener('scroll', handleScroll, { passive: true });

        // 其他事件监听器保持不变
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }

        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }
    }

    setupResultControls() {
        // Sort selection
        const sortSelect = document.getElementById('sortBy');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.sortResults(sortSelect.value);
            });
        }

        // View switch
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentView = btn.dataset.view;
                this.renderResults();
            });
        });

        // Export button
        const exportBtn = document.getElementById('exportResults');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportResults();
            });
        }

        // Save JSON button
        const saveBtn = document.getElementById('saveResults');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveResultsJSON();
            });
        }
    }

    setupFloatingButtons() {
        const backToTop = document.getElementById('backToTop');
        const saveSearch = document.getElementById('saveSearch');
        const shareSearch = document.getElementById('shareSearch');

        if (backToTop) {
            backToTop.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });

            // Show/hide back to top button
            window.addEventListener('scroll', () => {
                backToTop.style.display = window.scrollY > 300 ? 'flex' : 'none';
            });
        }

        if (saveSearch) {
            saveSearch.addEventListener('click', () => {
                this.saveCurrentSearch();
            });
        }

        if (shareSearch) {
            shareSearch.addEventListener('click', () => {
                this.shareCurrentSearch();
            });
        }
    }

    async performSearch(query) {
        if (!query) {
            this.showPlaceholder();
            return;
        }

        this.showLoadingState();

        // Reduced simulated search delay for better UX
        await new Promise(resolve => setTimeout(resolve, 100));

        const startTime = performance.now();

        // Use shared utility to process results for consistency
        let results = SearchUtils.processResults(this.searchData, query);

        // Apply search type filter
        if (this.currentSearchType !== 'all') {
            results = this.filterByType(results, this.currentSearchType);
        }

        // Apply other filter conditions
        results = this.applyCurrentFilters(results);

        const endTime = performance.now();
        const searchTime = ((endTime - startTime) / 1000).toFixed(3);

        this.filteredData = results;
        this.currentPage = 1;
        
        this.showResults(results, searchTime);
    }

    filterByType(data, type) {
        switch (type) {
            case 'aptamer':
                return data.filter(item => 
                    (item.category && item.category.includes('aptamer')) ||
                    (item.title && item.title.toLowerCase().includes('aptamer')) ||
                    (item.tags && item.tags.toLowerCase().includes('aptamer'))
                );
            case 'structure':
                return data.filter(item => 
                    (item.category && item.category.includes('structure')) ||
                    (item.content && item.content.toLowerCase().includes('structure')) ||
                    (item.tags && item.tags.toLowerCase().includes('structure'))
                );
            case 'selex':
                return data.filter(item => 
                    (item.category && item.category.includes('selex')) ||
                    (item.content && item.content.toLowerCase().includes('selex')) ||
                    (item.tags && item.tags.toLowerCase().includes('selex'))
                );
            case 'application':
                return data.filter(item => 
                    (item.category && item.category.includes('application')) ||
                    (item.content && item.content.toLowerCase().includes('application')) ||
                    (item.tags && item.tags.toLowerCase().includes('therapeutic'))
                );
            case 'fluorescence':
                return data.filter(item => 
                    (item.category && item.category.includes('fluorescence')) ||
                    (item.content && item.content.toLowerCase().includes('fluorescence')) ||
                    (item.tags && item.tags.toLowerCase().includes('fluorescence'))
                );
            default:
                return data;
        }
    }

    applyCurrentFilters(data) {
        let filtered = [...data];

        // Year filter - now uses both date field and Year tag
        const yearFrom = document.getElementById('yearFrom')?.value;
        const yearTo = document.getElementById('yearTo')?.value;
        if (yearFrom || yearTo) {
            filtered = filtered.filter(item => {
                // First check extracted pub_year field
                let year = item.pub_year;
                
                // If not available, try to get from date field
                if (!year && item.date) {
                    year = parseInt(item.date.split('-')[0]);
                }
                
                return (!yearFrom || (year && year >= parseInt(yearFrom))) && 
                       (!yearTo || (year && year <= parseInt(yearTo)));
            });
        }

        // Sequence length filter
        const lengthFrom = document.getElementById('lengthFrom')?.value;
        const lengthTo = document.getElementById('lengthTo')?.value;
        if (lengthFrom || lengthTo) {
            filtered = filtered.filter(item => {
                const length = item.sequence_length || 0;
                return (!lengthFrom || length >= parseInt(lengthFrom)) && 
                       (!lengthTo || length <= parseInt(lengthTo));
            });
        }

        // GC content filter
        const gcFrom = document.getElementById('gcFrom')?.value;
        const gcTo = document.getElementById('gcTo')?.value;
        if (gcFrom || gcTo) {
            filtered = filtered.filter(item => {
                const gc = item.gc_content || 0;
                return (!gcFrom || gc >= parseFloat(gcFrom)) && 
                       (!gcTo || gc <= parseFloat(gcTo));
            });
        }

        // Target type filter - uses Type tag
        const targetType = document.getElementById('targetType')?.value;
        if (targetType) {
            filtered = filtered.filter(item => {
                // First check if there are structured tags with Type
                if (item.structured_tags && item.structured_tags['Type']) {
                    return item.structured_tags['Type'].toLowerCase().includes(targetType.toLowerCase());
        }

                // Then check target_type field
                if (item.target_type) {
                    return item.target_type.toLowerCase().includes(targetType.toLowerCase());
                }
                
                // Compatible with old logic - check tags field
                return (item.tags && item.tags.toLowerCase().includes(targetType.toLowerCase()));
            });
        }

        // Affinity filter (using kd_value in nM)
        const affinityRange = document.getElementById('affinityRange')?.value;
        if (affinityRange) {
            filtered = filtered.filter(item => {
                // Get kd value in nM (already converted during data loading)
                const kd = item.kd_value;
                if (kd === null || kd === undefined || isNaN(kd)) {
                    return false; // Filter out items without valid affinity data
                }
                
                switch (affinityRange) {
                    case 'pM': return kd < 1;           // pM range: < 1 nM
                    case 'nM': return kd >= 1 && kd < 1000;  // nM range: 1-999 nM
                    case 'μM': return kd >= 1000 && kd < 1000000; // μM range: 1000-999999 nM (1-999 μM)
                    case 'mM': return kd >= 1000000;    // mM range: >= 1000000 nM (>= 1 mM)
                    default: return true;
                }
            });
        }

        // Result type filter
        const resultType = document.getElementById('resultType')?.value;
        if (resultType) {
            filtered = filtered.filter(item => {
                if (resultType === 'sequence') {
                    return item.result_type === 'sequence';
                } else if (resultType === 'page') {
                    return item.result_type === 'page';
                }
                return true; // 'all' or unknown type
            });
        }

        return filtered;
    }

    sortResults(sortBy) {
        if (!this.filteredData.length) return;

        this.filteredData.sort((a, b) => {
            switch (sortBy) {
                case 'year':
                    const yearA = a.date ? parseInt(a.date.split('-')[0]) : 0;
                    const yearB = b.date ? parseInt(b.date.split('-')[0]) : 0;
                    return yearB - yearA;
                case 'length':
                    return (b.sequence_length || 0) - (a.sequence_length || 0);
                case 'gc-content':
                    return (b.gc_content || 0) - (a.gc_content || 0);
                case 'affinity':
                    const kdA = a.kd_value ? parseFloat(a.kd_value) : Infinity;
                    const kdB = b.kd_value ? parseFloat(b.kd_value) : Infinity;
                    return kdA - kdB;
                case 'relevance':
                default:
                    return 0; // Keep original order
            }
        });

        this.renderResults();
    }

    showResults(results, searchTime) {
        const resultsHeader = document.getElementById('resultsHeader');
        const resultsCount = document.getElementById('resultsCount');
        const searchTimeSpan = document.getElementById('searchTime');

        // Hide placeholder and loading state
        this.hideLoadingState();
        this.hidePlaceholder();

        // Show results header
        if (resultsHeader) {
            resultsHeader.style.display = 'flex';
        }

        if (resultsCount) {
            resultsCount.textContent = `Found ${results.length} results`;
        }

        if (searchTimeSpan) {
            searchTimeSpan.textContent = `in ${searchTime} seconds`;
        }

        this.renderResults();
        this.setupPagination();
    }

    renderResults() {
        const resultsList = document.getElementById('resultsList');
        if (!resultsList) return;

        let start, end, pageData;
        switch (this.currentView) {
            case 'table':
                this.itemsPerPage = this.itemsPerPageTable;
                start = (this.currentPage - 1) * this.itemsPerPage;
                end = start + this.itemsPerPage;
                pageData = this.filteredData.slice(start, end);
                this.renderTableView(resultsList, pageData);
                this.setupPagination();
                break;
            case 'list':
            default:
                this.itemsPerPage = this.itemsPerPageList;
                start = (this.currentPage - 1) * this.itemsPerPage;
                end = start + this.itemsPerPage;
                pageData = this.filteredData.slice(start, end);
                this.renderListView(resultsList, pageData);
                this.setupPagination();
                break;
        }
    }

    renderListView(container, data) {
        const currentQuery = document.getElementById('mainSearchInput')?.value || '';
        
        const html = data.map(item => {
            // Determine result type icon
            let typeIcon = 'fa-file-alt';
            let typeLabel = 'Page';
            
            if (item.result_type === 'sequence') {
                typeIcon = 'fa-dna';
                typeLabel = 'Sequence';
        }

            // Display tags - show Target type and multi-aptamer flag
            const tags = [];
            if (item.structured_tags) {
                // Only show Type tag, skip sequence-type category labels
                if (item.structured_tags['Type']) {
                    tags.push(`<span class="tag tag-type">Target: ${item.structured_tags['Type']}</span>`);
                }
            } else if (item.tags && item.tags.includes('Type:')) {
                // Extract Type from tags string if it exists
                const typeMatch = item.tags.match(/Type:([^,]+)/i);
                if (typeMatch && typeMatch[1]) {
                    tags.push(`<span class="tag tag-type">Target: ${typeMatch[1].trim()}</span>`);
                }
            }
            
            // If multiple aptamers in the page,添加可点击的序列访问按钮
            if (item.result_type === 'page' && item.aptamer_count && item.aptamer_count > 1) {
                const searchQuery = this.generateSequenceSearchQuery(item);
                tags.push(`<button class="tag tag-sequences-btn" data-search-query="${searchQuery}" title="View all ${item.aptamer_count} sequences from this page">
                    <i class="fas fa-dna"></i> ${item.aptamer_count} Sequences
                </button>`);
            }
            
            // Meta information
            const metaItems = [];
            
            // Year information
            let yearInfo = item.pub_year || (item.date ? item.date.split('-')[0] : 'Unknown');
            metaItems.push(`<span class="meta-item"><i class="fas fa-calendar"></i> Year: ${yearInfo}</span>`);
        
            // Length info (support range)
            if (item.sequence_length_range) {
                metaItems.push(`<span class="meta-item"><i class="fas fa-ruler"></i> Length: ${item.sequence_length_range} bp</span>`);
            } else if (item.sequence_length) {
                metaItems.push(`<span class="meta-item"><i class="fas fa-ruler"></i> Length: ${item.sequence_length} bp</span>`);
            }
            
            // GC content (support range)
            if (item.gc_content_range) {
                metaItems.push(`<span class="meta-item"><i class="fas fa-percentage"></i> GC: ${item.gc_content_range}%</span>`);
            } else if (item.gc_content !== undefined) {
                metaItems.push(`<span class="meta-item"><i class="fas fa-percentage"></i> GC: ${item.gc_content}%</span>`);
        }
        
            // Result type indicator
            metaItems.push(`<span class="meta-item result-type"><i class="fas ${typeIcon}"></i> ${typeLabel}</span>`);

            // Generate content preview with highlighted search terms
            let contentPreview = '';

            if (item.content) {
                // For sequence items, handle sequence content specially
                if (item.result_type === 'sequence' && item.content.includes('Sequence:')) {
                    const seqMatch = item.content.match(/Sequence:\s*([ACGTU\s]+)/i);
                    if (seqMatch && seqMatch[1]) {
                        const sequence = seqMatch[1].trim();
                        const maxVisibleLength = 40;
                        let displaySequence = '';
        
                        // Check if we're searching for a sequence pattern
                        const isSearchingSequence = currentQuery && /[ACGTU]{2,}/i.test(currentQuery);
                        
                        // If searching for a specific sequence, highlight matches and show context
                        if (isSearchingSequence) {
                            // Create a case-insensitive regex for the query
                            const queryRegex = new RegExp(currentQuery.replace(/[ACGTU]+/ig, match => 
                                match.split('').join('[\\s]*')), 'ig');
                            
                            // Try to find matches in the sequence
                            let match;
                            const matches = [];
                            while ((match = queryRegex.exec(sequence)) !== null) {
                                matches.push({
                                    index: match.index,
                                    length: match[0].length,
                                    text: match[0]
                                });
                            }
                            
                            if (matches.length > 0) {
                                // Show context around first match
                                const firstMatch = matches[0];
                                const contextBefore = 10;
                                const contextAfter = 10;
                                
                                const startIndex = Math.max(0, firstMatch.index - contextBefore);
                                const endIndex = Math.min(sequence.length, firstMatch.index + firstMatch.length + contextAfter);
        
                                // Build display sequence with highlighted match
                                let beforeMatch = sequence.substring(startIndex, firstMatch.index);
                                let matchText = sequence.substring(firstMatch.index, firstMatch.index + firstMatch.length);
                                let afterMatch = sequence.substring(firstMatch.index + firstMatch.length, endIndex);
                                
                                displaySequence = `${startIndex > 0 ? '...' : ''}${beforeMatch}<span class="sequence-match">${matchText}</span>${afterMatch}${endIndex < sequence.length ? '...' : ''}`;
                                
                                contentPreview = `
                                    <div class="sequence-content">
                                        <div class="sequence-info-row">
                                            <strong>Sequence Match:</strong> 
                                            <span class="sequence-text">${displaySequence}</span>
                                            <button class="btn-toggle-sequence" data-full="${sequence}">Show full</button>
                                        </div>
                                    </div>
                                `;
                            } else {
                                // No matches found, show truncated sequence
                                if (sequence.length > maxVisibleLength) {
                                    contentPreview = `
                                        <div class="sequence-content">
                                            <div class="sequence-info-row">
                                                <strong>Sequence:</strong> 
                                                <span class="sequence-text">${sequence.substring(0, maxVisibleLength)}...</span>
                                                <button class="btn-toggle-sequence" data-full="${sequence}">Show more</button>
                                            </div>
                                        </div>
                                    `;
                                } else {
                                    contentPreview = `
                                        <div class="sequence-content">
                                            <div class="sequence-info-row">
                                                <strong>Sequence:</strong> 
                                                <span class="sequence-text">${sequence}</span>
                                            </div>
                                        </div>
                                    `;
                                }
                            }
                        } else {
                            // Regular display pattern for non-sequence searches
                            if (sequence.length > maxVisibleLength) {
                                contentPreview = `
                                    <div class="sequence-content">
                                        <div class="sequence-info-row">
                                            <strong>Sequence:</strong> 
                                            <span class="sequence-text">${sequence.substring(0, maxVisibleLength)}...</span>
                                            <button class="btn-toggle-sequence" data-full="${sequence}">Show more</button>
                                        </div>
                                    </div>
                                `;
                            } else {
                                contentPreview = `
                                    <div class="sequence-content">
                                        <div class="sequence-info-row">
                                            <strong>Sequence:</strong> 
                                            <span class="sequence-text">${sequence}</span>
                                        </div>
                                    </div>
                                `;
                            }
                        }
                        
                        // Add other important content like Named, Ligand and Affinity
                        const additionalInfo = [];
                        
                        // Add sequence name if available
                        if (item.named && item.named.trim()) {
                            additionalInfo.push(`<strong>Sequence Name:</strong> ${SearchUtils.highlightKeywords(item.named.trim(), currentQuery)}`);
                        }
                        
                        // Add ligand info
                        if (item.content.includes('Ligand:')) {
                            const ligandMatch = item.content.match(/Ligand:\s*([^|]+)/i);
                            if (ligandMatch && ligandMatch[1]) {
                                additionalInfo.push(`<strong>Ligand:</strong> ${SearchUtils.highlightKeywords(ligandMatch[1].trim(), currentQuery)}`);
                            }
                        }
                        
                        // Display sequence name and ligand in the same row if both exist
                        if (additionalInfo.length >= 2) {
                            contentPreview += `<div class="sequence-info-row">${additionalInfo.slice(0, 2).join(' | ')}</div>`;
                            // Add remaining info in separate rows
                            for (let i = 2; i < additionalInfo.length; i++) {
                                contentPreview += `<div class="sequence-info-row">${additionalInfo[i]}</div>`;
                            }
                        } else if (additionalInfo.length === 1) {
                            contentPreview += `<div class="sequence-info-row">${additionalInfo[0]}</div>`;
                        }
                        
                        // Add affinity in a separate row
                        if (item.content.includes('Affinity:')) {
                            const affinityMatch = item.content.match(/Affinity:\s*([^|]+)/i);
                            if (affinityMatch && affinityMatch[1]) {
                                contentPreview += `<div class="sequence-info-row"><strong>Affinity:</strong> ${SearchUtils.highlightKeywords(affinityMatch[1].trim(), currentQuery)}</div>`;
                            }
                        }
        }
                } else {
                    // For regular page content, show a preview with highlighted search terms
                    contentPreview = SearchUtils.getContentPreview(item.content, currentQuery, 150);
                }
            }

            return `
                <div class="result-item-list ${item.result_type === 'sequence' ? 'result-sequence' : 'result-page'}">
                <div class="result-header">
                    <h3 class="result-title">
                            <a href="${item.url}" target="_blank">${SearchUtils.highlightKeywords(item.title || 'Unknown Title', currentQuery)}</a>
                    </h3>
                    <div class="result-tags">
                            ${tags.join('')}
                    </div>
                </div>
                <div class="result-meta">
                        ${metaItems.join('')}
                </div>
                    <div class="result-description">${contentPreview || 'No description available'}</div>
            </div>
            `;
        }).join('');

        container.innerHTML = html;
        
        // Add event listeners for sequence toggle buttons using event delegation
        this.setupSequenceToggleHandlers(container);
        
        // Add event listeners for sequences access buttons
        this.setupSequencesAccessHandlers(container);
        
        // Add global click handler to prevent unwanted scrolling
        this.setupGlobalClickHandler(container);
    }

    renderTableView(container, data) {
        const html = `
            <div class="table-responsive">
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Year</th>
                            <th>Length</th>
                            <th>GC%</th>
                            <th>Result Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(item => {
                            // Result type style
                            const typeClass = item.result_type === 'sequence' ? 'sequence-row' : 'page-row';
                            const typeLabel = item.result_type === 'sequence' ? 'Sequence' : 'Page';
                            
                            // Extract type and category info
                            let typeInfo = '';
                            if (item.structured_tags && item.structured_tags['Type']) {
                                typeInfo = item.structured_tags['Type'];
                            } else if (item.target_type) {
                                typeInfo = item.target_type;
                            }
                            
                            let categoryInfo = '';
                            if (item.structured_tags && item.structured_tags['Category']) {
                                categoryInfo = item.structured_tags['Category'];
                            } else if (item.category_value) {
                                categoryInfo = item.category_value;
                            } else if (item.category) {
                                categoryInfo = item.category;
                            }

                            const lenDisplay = item.sequence_length_range || item.sequence_length || '-';
                            const gcDisplay = item.gc_content_range || (item.gc_content !== undefined ? item.gc_content : '-');

                            // Multi-aptamer badge - 改为可点击按钮
                            let multiBadge = '';
                            if (item.result_type === 'page' && item.aptamer_count && item.aptamer_count > 1) {
                                const searchQuery = this.generateSequenceSearchQuery(item);
                                multiBadge = `<button class="multi-aptamer-btn" data-search-query="${searchQuery}" title="View all ${item.aptamer_count} sequences from this page">
                                    <i class="fas fa-dna"></i> ${item.aptamer_count}×
                                </button>`;
                            }

                            return `
                            <tr class="${typeClass}">
                                <td class="table-name">
                                    <a href="${item.url}" target="_blank" class="data-table-link">
                                        ${this.truncateText(item.title || 'Unknown', 40)}
                                    </a>
                                    ${multiBadge}
                                </td>
                                <td>${typeInfo || 'Unknown'}</td>
                                <td>
                                    ${categoryInfo ? `<span class="table-tag">${categoryInfo}</span>` : 'Unknown'}
                                </td>
                                <td>${item.pub_year || (item.date ? item.date.split('-')[0] : 'Unknown')}</td>
                                <td>${lenDisplay}</td>
                                <td>${gcDisplay}</td>
                                <td><span class="result-type-badge ${item.result_type}">${typeLabel}</span></td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
        
        // Add event listeners for sequences access buttons in table view
        this.setupSequencesAccessHandlers(container);
        
        // Add global click handler to prevent unwanted scrolling
        this.setupGlobalClickHandler(container);
    }

    setupPagination() {
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        const paginationContainer = document.getElementById('paginationContainer');
        const pageNumbers = document.getElementById('pageNumbers');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');

        if (totalPages <= 1) {
            if (paginationContainer) {
                paginationContainer.style.display = 'none';
            }
            return;
        }

        if (paginationContainer) {
            paginationContainer.style.display = 'flex';
        }

        // Update button states
        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
            prevBtn.onclick = () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderResults();
                    this.setupPagination();
                }
            };
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= totalPages;
            nextBtn.onclick = () => {
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.renderResults();
                    this.setupPagination();
                }
            };
        }

        // Generate page numbers
        if (pageNumbers) {
            const pageHtml = [];
            const startPage = Math.max(1, this.currentPage - 2);
            const endPage = Math.min(totalPages, this.currentPage + 2);

            if (startPage > 1) {
                pageHtml.push(`<span class="page-number" onclick="advancedSearch.goToPage(1)">1</span>`);
                if (startPage > 2) {
                    pageHtml.push(`<span class="page-ellipsis">...</span>`);
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                const activeClass = i === this.currentPage ? 'active' : '';
                pageHtml.push(`<span class="page-number ${activeClass}" onclick="advancedSearch.goToPage(${i})">${i}</span>`);
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    pageHtml.push(`<span class="page-ellipsis">...</span>`);
                }
                pageHtml.push(`<span class="page-number" onclick="advancedSearch.goToPage(${totalPages})">${totalPages}</span>`);
            }

            pageNumbers.innerHTML = pageHtml.join('');
        }
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderResults();
        this.setupPagination();
    }

    showPlaceholder() {
        document.getElementById('searchPlaceholder')?.style.setProperty('display', 'block');
        document.getElementById('resultsHeader')?.style.setProperty('display', 'none');
        document.getElementById('paginationContainer')?.style.setProperty('display', 'none');
        document.getElementById('resultsList').innerHTML = '';
    }

    hidePlaceholder() {
        document.getElementById('searchPlaceholder')?.style.setProperty('display', 'none');
    }

    showLoadingState() {
        document.getElementById('loadingState')?.style.setProperty('display', 'block');
        this.hidePlaceholder();
    }

    hideLoadingState() {
        document.getElementById('loadingState')?.style.setProperty('display', 'none');
    }

    clearSearch() {
        this.filteredData = [];
        this.currentPage = 1;
        this.showPlaceholder();
    }

    resetFilters() {
        // Reset all filter inputs
        document.getElementById('yearFrom').value = '';
        document.getElementById('yearTo').value = '';
        document.getElementById('lengthFrom').value = '';
        document.getElementById('lengthTo').value = '';
        document.getElementById('gcFrom').value = '';
        document.getElementById('gcTo').value = '';
        document.getElementById('targetType').value = '';
        document.getElementById('affinityRange').value = '';
        document.getElementById('resultType').value = '';

        // Re-execute search
        const searchInput = document.getElementById('mainSearchInput');
        if (searchInput && searchInput.value) {
            this.performSearch(searchInput.value);
        }
    }

    applyFilters() {
        const searchInput = document.getElementById('mainSearchInput');
        if (searchInput && searchInput.value) {
            this.performSearch(searchInput.value);
        }
    }

    viewDetails(title) {
        // Find the item and open its URL
        const item = this.filteredData.find(item => item.title === title);
        if (item && item.url) {
            window.open(item.url, '_blank');
        } else {
            alert(`View details for ${title} - feature to be implemented`);
        }
    }

    saveCurrentSearch() {
        // Save current search state
        const searchState = {
            query: document.getElementById('mainSearchInput').value,
            type: this.currentSearchType,
            filters: this.getCurrentFilters(),
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('savedSearch', JSON.stringify(searchState));
        alert('Search saved successfully!');
    }

    shareCurrentSearch() {
        // Share current search
        const searchParams = new URLSearchParams();
        const query = document.getElementById('mainSearchInput').value;
        
        if (query) searchParams.set('q', query);
        if (this.currentSearchType !== 'all') searchParams.set('type', this.currentSearchType);
        
        const filters = this.getCurrentFilters();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) searchParams.set(key, value);
        });

        const shareUrl = `${window.location.origin}${window.location.pathname}?${searchParams.toString()}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Ribocentre-Aptamer Search Results',
                url: shareUrl
            });
        } else {
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert('Search link copied to clipboard!');
            });
        }
    }

    getCurrentFilters() {
        return {
            yearFrom: document.getElementById('yearFrom')?.value,
            yearTo: document.getElementById('yearTo')?.value,
            lengthFrom: document.getElementById('lengthFrom')?.value,
            lengthTo: document.getElementById('lengthTo')?.value,
            gcFrom: document.getElementById('gcFrom')?.value,
            gcTo: document.getElementById('gcTo')?.value,
            targetType: document.getElementById('targetType')?.value,
            affinityRange: document.getElementById('affinityRange')?.value
        };
    }

    exportResults() {
        if (!this.filteredData.length) {
            alert('No data to export');
            return;
        }

        // Create CSV content
        const headers = ['Title', 'Target', 'Category', 'Date', 'Length', 'GC Content', 'Tags', 'URL'];
        const csvContent = [
            headers.join(','),
            ...this.filteredData.map(item => [
                `"${(item.title || '').replace(/"/g, '""')}"`,
                `"${(item.target || '').replace(/"/g, '""')}"`,
                `"${(item.category || '').replace(/"/g, '""')}"`,
                item.date || '',
                item.sequence_length || '',
                item.gc_content || '',
                `"${(item.tags || '').replace(/"/g, '""')}"`,
                item.url || ''
            ].join(','))
        ].join('\n');

        // 下载文件
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `aptamer_search_results_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    saveResultsJSON() {
        if (!this.filteredData.length) {
            alert('No data to save');
            return;
        }

        const jsonStr = JSON.stringify(this.filteredData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `aptamer_search_results_${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    showSuggestions() {
        const suggestions = document.getElementById('searchSuggestions');
        const searchInput = document.getElementById('mainSearchInput');
        
        if (!suggestions || !searchInput) return;

        const query = searchInput.value.trim().toLowerCase();
        if (query.length < 2) {
            suggestions.style.display = 'none';
            return;
        }

        // 使用统一的搜索逻辑获取建议列表
        const suggestionsList = SearchUtils.processResults(this.searchData, query)
            .slice(0, 5)
            .map(item => ({
                title: item.title,
                category: item.category,
                url: item.url
            }));

        if (suggestionsList.length > 0) {
            const html = suggestionsList.map(item => `
                <div class="suggestion-item" data-url="${item.url}">
                    <div class="suggestion-title">${this.highlightKeywords(item.title, query)}</div>
                    ${item.category ? `<div class="suggestion-category">${item.category}</div>` : ''}
                </div>
            `).join('');

            suggestions.innerHTML = html;
            suggestions.style.display = 'block';

            // 添加点击事件
            suggestions.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', () => {
                    const url = item.getAttribute('data-url');
                    if (url) {
                        window.open(url, '_blank');
                    }
                });
            });
        } else {
            suggestions.style.display = 'none';
        }
    }

    hideSuggestions() {
        const suggestions = document.getElementById('searchSuggestions');
        if (suggestions && suggestions.style.display !== 'none') {
            suggestions.style.display = 'none';
            // 防止任何可能的滚动行为
            suggestions.scrollTop = 0;
        }
    }

    highlightKeywords(text, query) {
        return SearchUtils.highlightKeywords(text, query);
    }

    setupFilters() {
        // Set initial state of filters
        const filtersContent = document.getElementById('filtersContent');
        if (filtersContent) {
            filtersContent.classList.add('collapsed');
        }
    }

    // Helper method to truncate text
    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }

    // Generate search query for accessing sequences from a page
    generateSequenceSearchQuery(item) {
        // 尝试从页面信息生成合适的搜索查询
        // 优先使用更具体的标识符
        
        // 1. 如果页面有明确的配体信息，使用配体名称
        if (item.structured_tags && item.structured_tags['Ligand']) {
            return item.structured_tags['Ligand'];
        }
        
        // 2. 从content中提取配体信息
        if (item.content && item.content.includes('Ligand:')) {
            const ligandMatch = item.content.match(/Ligand:\s*([^|,]+)/i);
            if (ligandMatch && ligandMatch[1]) {
                return ligandMatch[1].trim();
            }
        }
        
        // 3. 从标题中提取关键词（去除常见的aptamer、binding等词汇）
        if (item.title) {
            let titleQuery = item.title
                .replace(/\s*aptamer\s*/gi, ' ')
                .replace(/\s*binding\s*/gi, ' ')
                .replace(/\s*RNA\s*/gi, ' ')
                .replace(/\s*DNA\s*/gi, ' ')
                .replace(/\s*sequence\s*/gi, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            
            // 取前1-2个重要词汇
            const words = titleQuery.split(' ').filter(word => word.length > 2);
            if (words.length > 0) {
                return words.slice(0, 2).join(' ');
            }
        }
        
        // 4. fallback - 使用页面类别信息
        if (item.structured_tags && item.structured_tags['Type']) {
            return item.structured_tags['Type'];
        }
        
        // 5. 最后fallback - 使用部分标题
        return item.title ? item.title.split(' ').slice(0, 2).join(' ') : 'aptamer';
    }

    // Setup sequences access button handlers using event delegation
    setupSequencesAccessHandlers(container) {
        // Remove any existing listener first
        if (this.sequencesAccessHandler) {
            container.removeEventListener('click', this.sequencesAccessHandler);
        }
        
        // Create bound handler
        this.sequencesAccessHandler = (event) => {
            // 检查是否点击了任一类型的序列访问按钮
            const sequencesBtn = event.target.closest('.tag-sequences-btn');
            const multiAptamerBtn = event.target.closest('.multi-aptamer-btn');
            
            if (!sequencesBtn && !multiAptamerBtn) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            
            const btn = sequencesBtn || multiAptamerBtn;
            const searchQuery = btn.getAttribute('data-search-query');
            
            if (searchQuery) {
                // 构建sequences页面的URL，带上搜索参数
                const sequencesUrl = `/sequences/?search=${encodeURIComponent(searchQuery)}`;
                
                // 在新窗口中打开
                window.open(sequencesUrl, '_blank');
            }
        };
        
        // Add event listener with delegation
        container.addEventListener('click', this.sequencesAccessHandler);
    }

    // Setup sequence toggle handlers using event delegation
    setupSequenceToggleHandlers(container) {
        // Remove any existing listener first
        container.removeEventListener('click', this.sequenceToggleHandler);
        
        // Create bound handler
        this.sequenceToggleHandler = (event) => {
            if (!event.target.classList.contains('btn-toggle-sequence')) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            
            const btn = event.target;
            const sequenceContent = btn.closest('.sequence-content');
            const isShowingMore = btn.textContent.includes('Show more') || btn.textContent.includes('Show full');
            
            if (isShowingMore) {
                // Show full sequence
                const fullSequence = btn.getAttribute('data-full');
                if (!fullSequence) return;
                
                const isMatchView = btn.closest('.sequence-matched') !== null;
                
                sequenceContent.innerHTML = `
                    <div class="sequence-info-row">
                        <strong>Sequence:</strong> 
                        <span class="sequence-text">${fullSequence}</span>
                        <button class="btn-toggle-sequence" data-full="${fullSequence}" data-mode="${isMatchView ? 'match' : 'truncate'}">Show less</button>
                    </div>
                `;
            } else {
                // Show truncated sequence
                const fullSequence = btn.getAttribute('data-full');
                if (!fullSequence) return;
                
                const maxVisible = 40;
                const truncatedSequence = fullSequence.substring(0, maxVisible);
                
                sequenceContent.innerHTML = `
                    <div class="sequence-info-row">
                        <strong>Sequence:</strong> 
                        <span class="sequence-text">${truncatedSequence}...</span>
                        <button class="btn-toggle-sequence" data-full="${fullSequence}">Show more</button>
                    </div>
                `;
            }
        };
        
        // Add event listener with delegation
        container.addEventListener('click', this.sequenceToggleHandler);
    }

    // Setup global click handler to debug and prevent unwanted scrolling
    setupGlobalClickHandler(container) {
        // Remove any existing listener first
        container.removeEventListener('click', this.globalClickHandler);
        
        // Create bound handler
        this.globalClickHandler = (event) => {
            console.log('Click detected on:', event.target, 'Tag:', event.target.tagName, 'Classes:', event.target.classList);
            
            // Check for problematic elements that might cause scrolling
            const target = event.target;
            
            // If it's a link with href="#" or empty href, prevent default
            if (target.tagName === 'A') {
                const href = target.getAttribute('href');
                if (!href || href === '#' || href === 'javascript:void(0)') {
                    console.log('Preventing default for problematic link:', href);
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }
            }
            
            // Check for buttons without proper type
            if (target.tagName === 'BUTTON' && !target.getAttribute('type')) {
                console.log('Button without type attribute detected');
                // Don't prevent default for buttons, just log
            }
            
            // Check for elements with onclick handlers
            if (target.onclick || target.getAttribute('onclick')) {
                console.log('Element with onclick detected:', target.onclick || target.getAttribute('onclick'));
            }
        };
        
        // Add event listener with delegation
        container.addEventListener('click', this.globalClickHandler);
    }

    // 生成缓存键
    generateCacheKey(query, filters, searchType) {
        const filterString = JSON.stringify(filters);
        return `${query}_${searchType}_${btoa(filterString)}`;
    }

    // 缓存搜索结果
    cacheSearchResults(cacheKey, results, searchTime) {
        // 限制缓存大小，只保留最近的20个搜索结果
        if (this.searchCache.size >= 20) {
            const firstKey = this.searchCache.keys().next().value;
            this.searchCache.delete(firstKey);
        }
        
        this.searchCache.set(cacheKey, {
            results: [...results], // 创建副本避免引用问题
            searchTime,
            timestamp: Date.now()
        });
    }

    // 更新结果信息
    updateResultsInfo(resultCount, searchTime) {
        const resultsCount = document.getElementById('resultsCount');
        const searchTimeSpan = document.getElementById('searchTime');
        
        if (resultsCount) {
            resultsCount.textContent = resultCount;
        }
        
        if (searchTimeSpan) {
            searchTimeSpan.textContent = `in ${searchTime} seconds`;
        }
    }

    // 解析 tags 字符串为结构化的 Map
    parseTagsToMap(tagsStr) {
        if (!tagsStr) return {};
        
        const tagMap = {};
        
        // 1. 尝试解析 YAML 风格的数组标签 (例如 _posts/RNA-dependent-RNA-polymerase-aptamer.md 中的格式)
        // - Category:Mammalian
        // - GC:41.25
        if (tagsStr.includes('Category:') || tagsStr.includes('Type:')) {
            const tagLines = tagsStr.split(/\n|,/).filter(line => line.trim());
            
            tagLines.forEach(line => {
                // 移除前导的 "- " (如果存在)
                const cleanLine = line.replace(/^\s*-\s*/, '').trim();
                
                // 处理形如 "Key:Value" 的标签
                const colonMatch = cleanLine.match(/^([^:]+):\s*(.+)$/);
                if (colonMatch) {
                    const [, key, value] = colonMatch;
                    const keyTrimmed = key.trim();
                    
                    if (tagMap[keyTrimmed] === undefined) {
                        tagMap[keyTrimmed] = value.trim();
                    }
                    // 如果已经存在此键，保留现有值，不覆盖
                } else if (cleanLine) {
                    // 没有冒号的普通标签
                    tagMap[cleanLine] = true;
                }
            });
            
            return tagMap;
        }
        
        // 2. 处理常规的逗号分隔标签字符串
        const tagItems = tagsStr.split(/,\s*/g);
        
        tagItems.forEach(tag => {
            // 处理形如 "Category:Mammalian" 的标签
            const colonMatch = tag.match(/^([^:]+):\s*(.+)$/);
            if (colonMatch) {
                const [, key, value] = colonMatch;
                tagMap[key.trim()] = value.trim();
                return;
            }
            
            // 处理没有冒号的普通标签
            tagMap[tag.trim()] = true;
        });
        
        return tagMap;
    }
    
    /**
     * Parse affinity string and convert to nanomolar (nM) for standardized comparison
     * @param {string} affinityStr - Raw affinity string from data
     * @returns {number|null} - Affinity value in nM, or null if cannot be parsed
     */
    parseAffinityToNanomolar(affinityStr) {
        if (!affinityStr || typeof affinityStr !== 'string') {
            return null;
        }
        
        // Clean up the string and extract numeric values with units
        const cleanStr = affinityStr.replace(/[~≤≥<>]/g, '').trim();
        
        // Handle biphasic binding - use the lower (stronger) affinity value
        if (cleanStr.includes('biphasic') || cleanStr.includes('exhibits')) {
            // Extract all Kd values from biphasic binding descriptions
            const kdMatches = cleanStr.match(/(\d+\.?\d*)\s*±?\s*\d*\.?\d*\s*(pM|nM|μM|µM|mM)/gi);
            if (kdMatches && kdMatches.length > 0) {
                // Use the first (typically lower/stronger) value
                const firstMatch = kdMatches[0];
                return this.convertToNanomolar(firstMatch);
            }
        }
        
        // Handle ranges like "62-68 µM" - use the lower value
        const rangeMatch = cleanStr.match(/(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)\s*(pM|nM|μM|µM|mM)/i);
        if (rangeMatch) {
            const [, lowerValue, , unit] = rangeMatch;
            return this.convertValueWithUnit(parseFloat(lowerValue), unit);
        }
        
        // Handle single values with error margins like "4.8 nM" or "49±6 pM"
        const singleMatch = cleanStr.match(/(\d+\.?\d*)\s*±?\s*\d*\.?\d*\s*(pM|nM|μM|µM|mM)/i);
        if (singleMatch) {
            const [, value, unit] = singleMatch;
            return this.convertValueWithUnit(parseFloat(value), unit);
        }
        
        // Handle Kd: prefix patterns
        const kdMatch = cleanStr.match(/Kd\s*[:=]\s*[~≤≥<>]*\s*(\d+\.?\d*)\s*±?\s*\d*\.?\d*\s*(pM|nM|μM|µM|mM)/i);
        if (kdMatch) {
            const [, value, unit] = kdMatch;
            return this.convertValueWithUnit(parseFloat(value), unit);
        }
        
        return null;
    }
    
    /**
     * Convert a value with unit to nanomolar (nM)
     * @param {number} value - Numeric value
     * @param {string} unit - Unit (pM, nM, μM, µM, mM)
     * @returns {number} - Value converted to nM
     */
    convertValueWithUnit(value, unit) {
        if (isNaN(value)) return null;
        
        const unitLower = unit.toLowerCase().replace('µ', 'μ'); // Normalize micro symbol
        
        switch (unitLower) {
            case 'pm':
                return value / 1000; // pM to nM: divide by 1000
            case 'nm':
                return value; // nM stays nM
            case 'μm':
            case 'um':
                return value * 1000; // μM to nM: multiply by 1000
            case 'mm':
                return value * 1000000; // mM to nM: multiply by 1,000,000
            default:
                console.warn(`Unknown affinity unit: ${unit}`);
                return value; // Default to assuming nM
        }
    }
    
    /**
     * Helper method to convert affinity string directly to nM
     * @param {string} affinityStr - Affinity string like "4.8 nM"
     * @returns {number|null} - Value in nM or null
     */
    convertToNanomolar(affinityStr) {
        const match = affinityStr.match(/(\d+\.?\d*)\s*±?\s*\d*\.?\d*\s*(pM|nM|μM|µM|mM)/i);
        if (match) {
            const [, value, unit] = match;
            return this.convertValueWithUnit(parseFloat(value), unit);
        }
        return null;
    }
}

// Initialize search module
let advancedSearch;
document.addEventListener('DOMContentLoaded', () => {
    advancedSearch = new AdvancedSearchModule();
});

// Add result styles
const resultStyles = `
<style>
/* Search results styles */
.result-item-list {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    border-left: 4px solid #520049;
}

.result-item-list:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    flex-wrap: wrap;
    gap: 10px;
}

.result-title {
    margin: 0;
    font-size: 18px;
    color: #333;
}

.result-title a {
    color: #520049;
    text-decoration: none;
    transition: color 0.3s ease;
}

.result-title a:hover {
    color: #3d0037;
    text-decoration: underline;
}

.result-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.tag {
    padding: 4px 12px;
    border-radius: 15px;
    font-size: 12px;
    font-weight: 500;
    color: white;
}

.tag-type {
    background: #17a2b8;
}

.tag-app {
    background: #28a745;
}

/* 序列访问按钮样式 */
.tag-sequences-btn {
    background: #28a745 !important;
    color: white !important;
    border: none !important;
    padding: 6px 12px !important;
    border-radius: 15px !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    transition: all 0.3s ease !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 4px !important;
    text-decoration: none !important;
    outline: none !important;
    box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2) !important;
}

.tag-sequences-btn:hover {
    background: #218838 !important;
    color: white !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3) !important;
}

.tag-sequences-btn:active {
    background: #1e7e34 !important;
    transform: translateY(0) !important;
    box-shadow: 0 2px 4px rgba(40, 167, 69, 0.4) !important;
}

.tag-sequences-btn i {
    font-size: 11px !important;
    margin-right: 2px !important;
}

.result-meta {
    display: flex;
    gap: 20px;
    margin-bottom: 15px;
    flex-wrap: wrap;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
    color: #666;
}

.meta-item i {
    color: #520049;
    width: 16px;
}

.result-description {
    color: #666;
    line-height: 1.6;
    margin: 0;
}

/* Grid view styles */
.results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.result-item-grid {
    height: 100%;
}

.grid-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.grid-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-header {
    background: linear-gradient(135deg, #520049, #3d0037);
    color: white;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.card-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    flex: 1;
}

.card-year {
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

.card-body {
    padding: 20px;
    flex: 1;
}

.card-meta {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.meta-label {
    font-weight: 500;
    color: #666;
    font-size: 14px;
}

.meta-value {
    color: #333;
    font-weight: 600;
    font-size: 14px;
}

.card-footer {
    padding: 20px;
    border-top: 1px solid #eee;
}

.btn-view-details {
    width: 100%;
    background: #520049;
    color: white;
    border: none;
    padding: 10px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn-view-details:hover {
    background: #3d0037;
    transform: translateY(-1px);
}

/* Table view styles */
.table-responsive {
    overflow-x: auto;
}

.results-table {
    width: 100%;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.results-table th {
    background: #520049;
    color: white;
    padding: 15px 12px;
    text-align: left;
    font-weight: 600;
    font-size: 14px;
}

.results-table td {
    padding: 15px 12px;
    border-bottom: 1px solid #eee;
    font-size: 14px;
}

.results-table tr:hover {
    background: #f8f9fa;
}

.table-name {
    font-weight: 600;
    color: #520049;
}

.table-tag {
    padding: 4px 8px;
    background: #e9ecef;
    border-radius: 12px;
    font-size: 12px;
    color: #495057;
}

.btn-small {
    background: #520049;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.3s ease;
}

.btn-small:hover {
    background: #3d0037;
}

/* No results styles */
.no-results {
    text-align: center;
    padding: 60px 20px;
    color: #666;
}

.no-results h3 {
    margin: 20px 0 10px;
    color: #333;
}

.no-results p {
    margin: 0;
    line-height: 1.6;
}

/* Responsive design */
@media (max-width: 768px) {
    .result-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .result-meta {
        flex-direction: column;
        gap: 10px;
    }

    .results-grid {
        grid-template-columns: 1fr;
    }

    .card-header {
        flex-direction: column;
        gap: 10px;
    }

    .results-table {
        font-size: 12px;
    }

    .results-table th,
    .results-table td {
        padding: 10px 8px;
    }
}

/* Dashboard数据表格链接样式 */
.data-table-link {
    color: #520049 !important;
    text-decoration: none !important;
    font-weight: 600;
    transition: all 0.2s ease;
}

.data-table-link:hover {
    color: #7a0070 !important;
    text-decoration: underline !important;
    background-color: rgba(82, 0, 73, 0.1);
    border-radius: 3px;
}

.data-table-link:visited {
    color: #520049 !important;
}

.data-table-link:active {
    color: #520049 !important;
    background-color: rgba(82, 0, 73, 0.2);
}

.table-name .data-table-link {
    color: #520049 !important;
    font-weight: 700 !important;
}

.table-name .data-table-link:hover {
    color: #7a0070 !important;
    text-shadow: 0 1px 2px rgba(82, 0, 73, 0.3);
}

/* Multi-aptamer badge */
.multi-aptamer-badge {
    display: inline-block;
    background: #28a745;
    color: #fff;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    margin-left: 4px;
    vertical-align: middle;
    cursor: default;
    line-height: 1;
}

/* 表格中的多aptamer按钮样式 */
.multi-aptamer-btn {
    display: inline-block !important;
    background: #28a745 !important;
    color: #fff !important;
    border: none !important;
    border-radius: 10px !important;
    font-size: 10px !important;
    font-weight: 700 !important;
    padding: 3px 8px !important;
    margin-left: 4px !important;
    vertical-align: middle !important;
    cursor: pointer !important;
    line-height: 1 !important;
    transition: all 0.3s ease !important;
    outline: none !important;
    text-decoration: none !important;
    box-shadow: 0 1px 3px rgba(40, 167, 69, 0.2) !important;
    white-space: nowrap !important;
}

.multi-aptamer-btn:hover {
    background: #218838 !important;
    color: #fff !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 2px 6px rgba(40, 167, 69, 0.3) !important;
}

.multi-aptamer-btn:active {
    background: #1e7e34 !important;
    transform: translateY(0) !important;
    box-shadow: 0 1px 3px rgba(40, 167, 69, 0.4) !important;
}

.multi-aptamer-btn i {
    font-size: 9px !important;
    margin-right: 2px !important;
}

/* Multi-aptamer badge tooltip */
.multi-aptamer-badge[data-tooltip] {
    position: relative;
}

.multi-aptamer-badge[data-tooltip]::after {
    content: attr(data-tooltip);
    position: absolute;
    top: -28px;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    background: rgba(0,0,0,0.8);
    color: #fff;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.1s;
    z-index: 9999;
}

.multi-aptamer-badge[data-tooltip]:hover::after {
    opacity: 1;
}

/* Sequence info row styling - 蓝色主题，与sequence结果类型一致 */
.sequence-info-row {
    margin: 4px 0;
    padding: 6px 12px;
    background: rgba(0, 102, 204, 0.05);
    border-radius: 6px;
    border-left: 3px solid #0066cc;
    font-size: 14px;
    line-height: 1.4;
    display: block; /* 改为block，避免flex布局导致的换行问题 */
    min-height: 20px;
}

.sequence-info-row strong {
    color: #0066cc;
    font-weight: 600;
    line-height: 1.4;
}

/* 调整sequence-text样式，确保与sequence-info-row对齐，使用蓝色主题 */
.sequence-text {
    font-family: 'Courier New', monospace !important;
    letter-spacing: 0.5px !important;
    background-color: rgba(0, 102, 204, 0.1) !important;
    padding: 4px 8px !important;
    border-radius: 3px !important;
    display: inline-block !important;
    margin: 0 4px 0 0 !important;
    max-width: calc(100% - 0px) !important;
    overflow-x: auto !important;
    white-space: normal !important;
    word-break: break-all !important;
    line-height: 1.4 !important;
    vertical-align: middle !important;
    border: 1px solid rgba(0, 102, 204, 0.2) !important;
    color: #333 !important;
}

/* 序列内容容器，确保与其他元素对齐 */
.sequence-content {
    margin-top: 6px !important;
    max-width: 100% !important;
    overflow-wrap: break-word !important;
    word-break: break-word !important;
    line-height: 1.4 !important;
}

/* 优化按钮样式，改为蓝色主题 */
.btn-toggle-sequence {
    background: #0066cc !important;
    color: white !important;
    border: none !important;
    padding: 3px 8px !important;
    border-radius: 3px !important;
    font-size: 11px !important;
    cursor: pointer !important;
    margin-left: 8px !important;
    transition: all 0.2s !important;
    vertical-align: middle !important;
    line-height: 1.2 !important;
}

.btn-toggle-sequence:hover {
    background: #0052a3 !important;
}

/* 确保sequence name和ligand的行内显示不会因为flex导致问题 */
.sequence-info-row .inline-info {
    display: inline;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 序列匹配高亮样式，改为蓝色主题 */
.sequence-match {
    background-color: #cce7ff !important;
    color: #0066cc !important;
    font-weight: bold !important;
    padding: 0 2px !important;
    border-radius: 2px !important;
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', resultStyles); 
