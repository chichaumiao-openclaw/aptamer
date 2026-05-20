/**
 * Aptamer Table Generator - 动态生成适配体表格
 * 支持有3D和无3D结构的适配体表格
 * @version 2.1.0
 * @author Ribocentre Team
 */

class AptamerTableGenerator {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            columnsPerRow: 9,
            enableHover: true,
            animationDuration: 300,
            tableType: 'no3d', // 'no3d' or '3d'
            ...options
        };
        
        this.data = null;
        this.config = null;
        this.isLoaded = false;
    }

    /**
     * 加载数据并初始化表格
     */
    async loadData(dataUrl = null, configUrl = null) {
        try {
            // 根据表格类型确定默认URL
            if (!dataUrl) {
                dataUrl = this.options.tableType === '3d' 
                    ? '/apidata/aptamer_3d_enhanced.json' 
                    : '/apidata/aptamer_no_3d_enhanced.json';
            }
            
            if (!configUrl) {
                configUrl = this.options.tableType === '3d' 
                    ? '/apidata/table_3d_config.json' 
                    : '/apidata/table_config.json';
            }

            // 加载数据和配置
            const [dataResponse, configResponse] = await Promise.all([
                fetch(dataUrl),
                fetch(configUrl)
            ]);

            if (!dataResponse.ok || !configResponse.ok) {
                throw new Error('Failed to load data files');
            }

            this.data = await dataResponse.json();
            this.config = await configResponse.json();
            
            this.isLoaded = true;
            this.generateTable();
            
            const tableTypeDesc = this.options.tableType === '3d' ? '有3D结构' : '无3D结构';
            console.log(`✅ ${tableTypeDesc} aptamer table data loaded successfully`);
            console.log(`📊 Total items: ${this.data.metadata.total_items}`);
            console.log(`🏷️ Categories: ${this.data.metadata.categories}`);
            
        } catch (error) {
            console.error('❌ Error loading aptamer table data:', error);
            this.showError('Failed to load aptamer data. Please check the data files.');
        }
    }

    /**
     * 生成完整表格
     */
    generateTable() {
        if (!this.isLoaded) {
            console.warn('Data not loaded yet. Call loadData() first.');
            return;
        }

        // 清空容器
        this.container.innerHTML = '';

        // 创建表格容器
        const tableContainer = this.createTableContainer();
        
        // TODO: 表格标题暂时注释掉
        // 创建表格标题
        // const title = this.createTitle();
        // tableContainer.appendChild(title);

        // TODO: 智能分类功能暂时注释掉
        // 创建分类说明
        // const legend = this.createCategoryLegend();
        // tableContainer.appendChild(legend);

        // 创建表格
        const table = this.createTable();
        tableContainer.appendChild(table);

        // TODO: 统计信息暂时注释掉
        // 创建统计信息
        // const stats = this.createStatistics();
        // tableContainer.appendChild(stats);

        this.container.appendChild(tableContainer);

        // 初始化交互功能
        this.initializeInteractions();
    }

    /**
     * 创建表格容器
     */
    createTableContainer() {
        const container = document.createElement('div');
        container.className = 'aptamer-table-container';
        
        // 根据表格类型生成不同的样式ID
        const styleId = `aptamer-table-styles-${this.options.tableType}`;
        
        // 避免重复添加样式
        if (!document.getElementById(styleId)) {
            container.innerHTML = `
                <style id="${styleId}">
                    .aptamer-table-container {
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        overflow-x: auto;
                        max-width: 100%;
                    }
                    
                    .aptamer-table-title {
                        font-size: 1.5rem;
                        font-weight: bold;
                        color: #2c3e50;
                        margin-bottom: 15px;
                        text-align: center;
                    }
                    
                    .aptamer-table {
                        width: 100%;
                        max-width: 100%;
                        border-collapse: separate;
                        border-spacing: 2px;
                        margin: 20px 0;
                        table-layout: auto;
                        box-sizing: border-box;
                    }
                    
                    .aptamer-cell {
                        padding: ${this.config.styling.cell_padding};
                        text-align: center;
                        border-radius: ${this.config.styling.border_radius};
                        cursor: pointer;
                        transition: ${this.config.styling.transition};
                        font-size: 12px;
                        font-weight: 500;
                        color: #882464;
                        // text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
                        position: relative;
                        min-height: 40px;
                        vertical-align: middle;
                        word-wrap: break-word;
                        word-break: break-word;
                        white-space: normal;
                        line-height: 1.3;
                        max-width: 150px;
                        overflow-wrap: break-word;
                        hyphens: auto;
                    }
                    
                    .aptamer-cell:hover {
                        transform: scale(1.05);
                        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                        z-index: 10;
                    }
                    
                    .aptamer-cell a {
                        color: inherit;
                        text-decoration: none;
                        display: block;
                        width: 100%;
                        height: 100%;
                    }
                    
                    .category-legend {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 10px;
                        margin: 15px 0;
                        justify-content: center;
                    }
                    
                    .legend-item {
                        display: flex;
                        align-items: center;
                        padding: 5px 10px;
                        background: white;
                        border-radius: 15px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        font-size: 12px;
                    }
                    
                    .legend-color {
                        width: 16px;
                        height: 16px;
                        border-radius: 50%;
                        margin-right: 8px;
                    }
                    
                    .table-statistics {
                        text-align: center;
                        margin-top: 15px;
                        padding: 10px;
                        background: white;
                        border-radius: 5px;
                        font-size: 14px;
                        color: #666;
                    }
                    
                    @media (max-width: 768px) {
                        .aptamer-cell {
                            font-size: 10px;
                            padding: 4px;
                            max-width: 120px;
                        }
                        .aptamer-table-container {
                            padding: 10px;
                            overflow-x: auto;
                        }
                        .aptamer-table {
                            min-width: 800px;
                        }
                    }
                    
                    @media (max-width: 1024px) {
                        .aptamer-cell {
                            font-size: 11px;
                            max-width: 140px;
                        }
                    }
                </style>
            `;
        }
        
        return container;
    }

    /**
     * 创建标题
     */
    createTitle() {
        const title = document.createElement('h3');
        title.className = 'aptamer-table-title';
        
        // 根据表格类型设置标题
        if (this.config && this.config.title) {
            title.textContent = this.config.title;
        } else {
            title.textContent = this.options.tableType === '3d' 
                ? 'RNA Aptamers with 3D Structure' 
                : 'RNA Aptamers without 3D Structure';
        }
        
        return title;
    }

    /**
     * 创建分类图例
     */
    createCategoryLegend() {
        const legend = document.createElement('div');
        legend.className = 'category-legend';

        for (const [categoryName, categoryInfo] of Object.entries(this.data.category_config)) {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            
            const colorBox = document.createElement('div');
            colorBox.className = 'legend-color';
            colorBox.style.backgroundColor = categoryInfo.primary_color;
            
            const label = document.createElement('span');
            label.textContent = `${categoryName} (${categoryInfo.description})`;
            
            legendItem.appendChild(colorBox);
            legendItem.appendChild(label);
            legend.appendChild(legendItem);
        }

        return legend;
    }

    /**
     * 创建主表格
     */
    createTable() {
        const table = document.createElement('table');
        table.className = 'aptamer-table';

        // 按category分组数据
        const groupedData = this.groupDataByCategory();
        
        let currentRow = null;
        let cellsInCurrentRow = 0;

        for (const [category, items] of Object.entries(groupedData)) {
            for (const item of items) {
                // 检查是否需要新行
                if (cellsInCurrentRow === 0 || cellsInCurrentRow >= this.options.columnsPerRow) {
                    currentRow = table.insertRow();
                    cellsInCurrentRow = 0;
                }

                // 创建单元格
                const cell = currentRow.insertCell();
                this.setupCell(cell, item);
                cellsInCurrentRow++;
            }
        }

        // 填充最后一行的空单元格
        if (currentRow && cellsInCurrentRow < this.options.columnsPerRow) {
            for (let i = cellsInCurrentRow; i < this.options.columnsPerRow; i++) {
                const emptyCell = currentRow.insertCell();
                emptyCell.style.border = 'none';
                emptyCell.style.background = 'transparent';
            }
        }

        return table;
    }

    /**
     * 按分类分组数据
     */
    groupDataByCategory() {
        const grouped = {};
        const categoryOrder = Object.keys(this.data.category_config);

        // 初始化分组
        categoryOrder.forEach(category => {
            grouped[category] = [];
        });

        // 分组数据
        this.data.data.forEach(item => {
            if (grouped[item.category]) {
                grouped[item.category].push(item);
            }
        });

        return grouped;
    }

    /**
     * 设置单元格
     */
    setupCell(cell, item) {
        cell.className = 'aptamer-cell';
        cell.style.backgroundColor = item.background_color;
        cell.setAttribute('data-category', item.category);
        cell.setAttribute('data-name', item.name);
        cell.setAttribute('data-link', item.link);
        cell.setAttribute('data-table-type', this.options.tableType);

        // 创建链接
        const link = document.createElement('a');
        link.href = item.link;
        link.target = '_blank';
        link.textContent = item.name;
        link.title = `${item.name} (${item.category})`;

        cell.appendChild(link);
    }



    /**
     * 创建统计信息
     */
    createStatistics() {
        const stats = document.createElement('div');
        stats.className = 'table-statistics';
        
        const categoryStats = {};
        this.data.data.forEach(item => {
            categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
        });

        const statsText = Object.entries(categoryStats)
            .map(([category, count]) => `${category}: ${count}`)
            .join(' • ');

        const tableTypeDesc = this.options.tableType === '3d' ? '有3D结构' : '无3D结构';
        stats.innerHTML = `
            <strong>Total: ${this.data.metadata.total_items} ${tableTypeDesc}适配体</strong><br>
            ${statsText}
        `;

        return stats;
    }

    /**
     * 初始化交互功能
     */
    initializeInteractions() {
        // 点击单元格打开链接。避免与单元格内的<a>标签重复触发
        this.container.addEventListener('click', (e) => {
            const cell = e.target.closest('.aptamer-cell');
            // 如果点击发生在<a>标签内，则交由默认行为处理
            if (cell && !e.target.closest('a')) {
                const link = cell.getAttribute('data-link');
                if (link) {
                    window.open(link, '_blank');
                }
            }
        });

        const tableTypeDesc = this.options.tableType === '3d' ? '有3D结构' : '无3D结构';
        console.log(`🎯 ${tableTypeDesc}表格交互功能已初始化`);
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        this.container.innerHTML = `
            <div style="
                background: #f8d7da;
                color: #721c24;
                padding: 15px;
                border: 1px solid #f5c6cb;
                border-radius: 4px;
                margin: 20px 0;
                text-align: center;
            ">
                <strong>Error:</strong> ${message}
            </div>
        `;
    }

    /**
     * 获取分类统计
     */
    getCategoryStats() {
        if (!this.isLoaded) return null;

        const stats = {};
        this.data.data.forEach(item => {
            stats[item.category] = (stats[item.category] || 0) + 1;
        });

        return {
            total: this.data.metadata.total_items,
            categories: stats,
            categoryCount: Object.keys(stats).length,
            tableType: this.options.tableType
        };
    }

    /**
     * 更新表格（用于动态添加数据）
     */
    updateData(newData) {
        this.data = newData;
        this.generateTable();
    }
}

/**
 * 多表格管理器
 * 用于管理有3D和无3D结构的多个表格
 */
class MultiAptamerTableManager {
    constructor() {
        this.tables = {};
    }

    /**
     * 创建表格
     */
    createTable(containerId, tableType, options = {}) {
        const generator = new AptamerTableGenerator(containerId, {
            tableType: tableType,
            ...options
        });
        
        this.tables[tableType] = generator;
        return generator;
    }

    /**
     * 加载所有表格
     */
    async loadAllTables() {
        const promises = [];
        
        for (const [tableType, generator] of Object.entries(this.tables)) {
            promises.push(generator.loadData());
        }
        
        try {
            await Promise.all(promises);
            console.log('🎉 All aptamer tables loaded successfully');
        } catch (error) {
            console.error('❌ Some tables failed to load:', error);
        }
    }

    /**
     * 获取所有统计信息
     */
    getAllStats() {
        const allStats = {};
        
        for (const [tableType, generator] of Object.entries(this.tables)) {
            allStats[tableType] = generator.getCategoryStats();
        }
        
        return allStats;
    }

    /**
     * 验证所有表格
     */
    validateAllTables() {
        for (const [tableType, generator] of Object.entries(this.tables)) {
            if (!generator.isLoaded) {
                console.warn(`⚠️ ${tableType} 表格尚未加载`);
            }
        }
        
        console.log('✅ 表格验证完成');
    }
}

// 导出类以供使用
window.AptamerTableGenerator = AptamerTableGenerator;
window.MultiAptamerTableManager = MultiAptamerTableManager; 