/**
 * search.js - 搜索功能模块
 * 从homepage-main.js中提取的独立搜索功能
 */

// 搜索模块
const SearchModule = {
    mainSearchInput: null,
    searchResultsOverlay: null,
    searchResults: null,
    searchResultsList: null,
    searchResultsCount: null,
    currentPage: 1,
    resultsPerPage: 1000, // 显示所有结果，设置足够大的数值
    allSearchResults: [],
    searchTimeout: null,
    isSearchActive: false,
    heroOriginalHeight: null,
    overviewOriginalHeight: null,

    init() {
        console.log('搜索模块初始化...');
        
        // 获取DOM元素
        this.mainSearchInput = document.getElementById('mainSearch');
        this.searchResultsOverlay = document.getElementById('searchResultsOverlay');
        this.searchResults = document.getElementById('searchResults');
        this.searchResultsList = document.getElementById('searchResultsList');
        this.searchResultsCount = document.getElementById('searchResultsCount');
        
        // 检查页面类型，如果在index页面并且已有homepageSearchModule处理搜索
        const isIndexPage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
        const homepageModuleActive = typeof homepageSearchModule !== 'undefined' && homepageSearchModule.mainSearchInput;
        
        // 在某些页面上，我们希望保留search.js的功能而不是homepage-main.js的搜索
        const isFluorescencePage = window.location.pathname.includes('fluorescence');
        
        if (isIndexPage && !isFluorescencePage && homepageModuleActive) {
            console.log('SearchModule: 在index页面检测到homepageSearchModule，跳过初始化');
            return;
        }
        
        if (!this.mainSearchInput) {
            console.error('搜索输入框未找到！');
            return;
        }
        
        if (!this.searchResultsOverlay || !this.searchResults || !this.searchResultsList || !this.searchResultsCount) {
            console.warn('搜索结果容器未找到，尝试创建...');
            this.setupSearchContainer();
        }
        
        // 绑定事件
        this.bindEvents();
        this.bindWindowEvents();
        
        console.log('搜索模块初始化完成');
    },

    // 创建搜索结果容器（如果页面中不存在）
    setupSearchContainer() {
        // 创建覆盖层
        if (!this.searchResultsOverlay) {
            this.searchResultsOverlay = document.createElement('div');
            this.searchResultsOverlay.id = 'searchResultsOverlay';
            this.searchResultsOverlay.className = 'search-results-overlay';
            document.body.appendChild(this.searchResultsOverlay);
        }
        
        // 创建结果容器
        if (!this.searchResults) {
            this.searchResults = document.createElement('div');
            this.searchResults.id = 'searchResults';
            this.searchResults.className = 'search-results-container';
            this.searchResultsOverlay.appendChild(this.searchResults);
            
            // 创建头部
            const header = document.createElement('div');
            header.className = 'search-results-header';
            
            this.searchResultsCount = document.createElement('span');
            this.searchResultsCount.id = 'searchResultsCount';
            this.searchResultsCount.className = 'search-results-count';
            this.searchResultsCount.textContent = 'Found 0 results';
            header.appendChild(this.searchResultsCount);
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-search-btn';
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
            closeBtn.onclick = () => this.closeSearchResults();
            header.appendChild(closeBtn);
            
            this.searchResults.appendChild(header);
            
            // 创建结果列表
            this.searchResultsList = document.createElement('div');
            this.searchResultsList.id = 'searchResultsList';
            this.searchResultsList.className = 'search-results-list';
            this.searchResults.appendChild(this.searchResultsList);
        }
    },

    // 绑定搜索相关事件
    bindEvents() {
        // 输入框事件
        if (this.mainSearchInput) {
            this.mainSearchInput.addEventListener('input', () => {
                this.handleSearchInput();
            });
            
            this.mainSearchInput.addEventListener('focus', () => {
                this.handleSearchFocus();
            });
            
            this.mainSearchInput.addEventListener('keyup', (event) => {
                if (event.key === 'Enter' && this.mainSearchInput.value.trim() !== '') {
                    this.clearSearchTimeout();
                    this.performSearch();
                }
            });
        }
        
        // 关闭按钮
        document.addEventListener('click', (event) => {
            if (this.searchResultsOverlay && 
                this.searchResultsOverlay.classList.contains('show') && 
                !this.searchResults.contains(event.target) && 
                !this.mainSearchInput.contains(event.target)) {
                this.closeSearchResults();
            }
        });
    },

    // 绑定窗口事件
    bindWindowEvents() {
        // ESC键关闭搜索结果
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.searchResultsOverlay && 
                this.searchResultsOverlay.classList.contains('show')) {
                this.closeSearchResults();
            }
        });
        
        // 窗口大小改变时重新计算高度
        window.addEventListener('resize', () => {
            if (this.isSearchActive) {
                this.restoreHeroHeight();
                setTimeout(() => this.fixHeroHeight(), 50);
            }
        });
    },

    // 处理搜索输入
    handleSearchInput() {
        const query = this.mainSearchInput.value.trim();
        const config = window.SEARCH_CONFIG || {
            disableHeroHeightFix: false,
            searchDelay: 300,
            minSearchLength: 2
        };

        // 清除之前的搜索延时
        this.clearSearchTimeout();

        // 如果查询为空，立即隐藏结果
        if (query.length === 0) {
            this.closeSearchResults();
            return;
        }

        // 如果查询长度小于配置的最小长度，不进行搜索
        if (query.length < config.minSearchLength) {
            return;
        }

        // 确保Hero Section高度已固定（如果启用）
        if (!config.disableHeroHeightFix && !this.isSearchActive) {
            this.isSearchActive = true;
            this.fixHeroHeight();
        }

        // 延迟执行搜索
        this.searchTimeout = setTimeout(() => {
            this.performSearch();
        }, config.searchDelay);
    },

    // 处理搜索框获得焦点
    handleSearchFocus() {
        const config = window.SEARCH_CONFIG || { disableHeroHeightFix: false };
        
        // 立即固定高度，不管是否已经激活
        if (!config.disableHeroHeightFix) {
            this.isSearchActive = true;
            this.fixHeroHeight();
        }

        // 移除自动搜索逻辑，让用户主动输入或按回车键来触发搜索
        // 这样用户点击搜索框编辑内容时不会立即显示搜索结果
    },

    // 清除搜索延时
    clearSearchTimeout() {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = null;
        }
    },

    // 固定Hero Section高度
    fixHeroHeight() {
        const heroSection = document.querySelector('.hero-section');
        const overviewContainer = document.querySelector('.overview-container');
        
        if (heroSection && !heroSection.classList.contains('search-active')) {
            // 保存原始高度
            this.heroOriginalHeight = heroSection.getBoundingClientRect().height;
            
            // 强制禁用transition并固定高度
            heroSection.style.transition = 'none';
            heroSection.style.height = this.heroOriginalHeight + 'px';
            heroSection.style.minHeight = this.heroOriginalHeight + 'px';
            heroSection.style.maxHeight = this.heroOriginalHeight + 'px';
            heroSection.style.setProperty('--hero-fixed-height', this.heroOriginalHeight + 'px');
            heroSection.classList.add('search-active');
            
            console.log('Hero height fixed at:', this.heroOriginalHeight + 'px');
        }
        
        if (overviewContainer && !overviewContainer.classList.contains('search-active')) {
            this.overviewOriginalHeight = overviewContainer.getBoundingClientRect().height;
            
            // 强制禁用transition并固定高度
            overviewContainer.style.transition = 'none';
            overviewContainer.style.height = this.overviewOriginalHeight + 'px';
            overviewContainer.style.minHeight = this.overviewOriginalHeight + 'px';
            overviewContainer.style.maxHeight = this.overviewOriginalHeight + 'px';
            overviewContainer.style.setProperty('--overview-fixed-height', this.overviewOriginalHeight + 'px');
            overviewContainer.classList.add('search-active');
            
            console.log('Overview height fixed at:', this.overviewOriginalHeight + 'px');
        }
    },

    // 恢复Hero Section高度
    restoreHeroHeight() {
        const heroSection = document.querySelector('.hero-section');
        const overviewContainer = document.querySelector('.overview-container');
        
        if (heroSection && heroSection.classList.contains('search-active')) {
            heroSection.classList.remove('search-active');
            heroSection.style.removeProperty('height');
            heroSection.style.removeProperty('min-height');
            heroSection.style.removeProperty('max-height');
            heroSection.style.removeProperty('transition');
            heroSection.style.removeProperty('--hero-fixed-height');
            
            console.log('Hero height restored');
        }
        
        if (overviewContainer && overviewContainer.classList.contains('search-active')) {
            overviewContainer.classList.remove('search-active');
            overviewContainer.style.removeProperty('height');
            overviewContainer.style.removeProperty('min-height');
            overviewContainer.style.removeProperty('max-height');
            overviewContainer.style.removeProperty('transition');
            overviewContainer.style.removeProperty('--overview-fixed-height');
            
            console.log('Overview height restored');
        }
    },

    // 执行搜索
    async performSearch() {
        const query = this.mainSearchInput.value.trim();
        if (!query) {
            this.closeSearchResults();
            return;
        }

        // 显示加载状态
        this.searchResultsList.innerHTML = '<div style="padding: 15px; text-align: center; color: #666;">Searching...</div>';
        this.showSearchResults();

        const searchPaths = ['./search.json', '/search.json', 'search.json'];
        this.currentPage = 1;

        try {
            const data = await SearchUtils.fetchData(searchPaths);
            this.processSearchResults(data, query);
        } catch (e) {
            console.error('Failed to load search data', e);
            this.searchResultsList.innerHTML = '<div style="padding: 20px; text-align: center; color: #4d5156;">Unable to load search data, please try again later.</div>';
        }
    },

    // 处理搜索结果
    processSearchResults(data, query) {
        const startTime = Date.now();
        this.allSearchResults = SearchUtils.processResults(data, query);
        this.renderResults(Date.now() - startTime);
    },

    // 计算相关性得分
    calculateRelevanceScore(item, query) {
        return SearchUtils.calculateRelevanceScore(item, query);
    },

    // 渲染搜索结果
    renderResults(searchTime) {
        if (this.allSearchResults.length === 0) {
            this.searchResultsCount.textContent = 'Found 0 results';
            this.searchResultsList.innerHTML = '<div style="padding: 20px; text-align: center; color: #4d5156; font-size: 16px;">No relevant results found, please try other keywords.</div>';
            return;
        }

        // 分页处理
        const startIndex = (this.currentPage - 1) * this.resultsPerPage;
        const endIndex = Math.min(startIndex + this.resultsPerPage, this.allSearchResults.length);
        const currentResults = this.allSearchResults.slice(startIndex, endIndex);

        // Update result count 更新结果计数
        this.searchResultsCount.textContent = `Found ${this.allSearchResults.length} results (in ${searchTime} ms)`;

        // 构建结果HTML
        let html = '';
        const query = this.mainSearchInput.value.trim();

        currentResults.forEach((item, idx) => {
            const highlightedTitle = this.highlightKeywords(item.title || 'Untitled', query);
            
            html += `<div class="result-item-list search-result-item result-page" data-url="${item.url || '#'}">
                <div class="result-header">
                    <span class="result-index">${startIndex + idx + 1}</span>
                    <h3 class="result-title"><a href="${item.url || '#'}" target="_blank">${highlightedTitle}</a></h3>
                </div>
                <div class="result-description">${this.getContentPreview(item.content || '', query)}</div>
            </div>`;
        });

        // 更新DOM
        this.searchResultsList.innerHTML = html;

        // 添加点击事件
        this.searchResultsList.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', function(e) {
                const url = this.getAttribute('data-url');
                if (url && url !== '#') window.open(url, '_blank');
            });
        });
    },

    // 关键词高亮
    highlightKeywords(text, query) {
        return SearchUtils.highlightKeywords(text, query);
    },

    // 获取内容预览
    getContentPreview(content, query) {
        return SearchUtils.getContentPreview(content, query, 120);
    },

    // 显示搜索结果
    showSearchResults() {
        if (this.searchResultsOverlay) {
            this.searchResultsOverlay.style.display = 'block';
            setTimeout(() => {
                this.searchResultsOverlay.classList.add('show');
            }, 10);
        }
    },

    // 关闭搜索结果
    closeSearchResults() {
        if (this.searchResultsOverlay) {
            this.searchResultsOverlay.classList.remove('show');
            setTimeout(() => {
                this.searchResultsOverlay.style.display = 'none';
            }, 300);
        }
        
        // 恢复Hero Section高度
        this.restoreHeroHeight();
        this.isSearchActive = false;
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, initializing search module...');
    SearchModule.init();
}); 