/**
 * sequences.js - 为Sequences页面表格设计的专用JS
 */

class SequenceTableManager {
    constructor() {
        this.baseUrl = window.location.origin;
        this.dataPath = '/apidata/sequences_cleaned.json';
        this.table = null;
        this.rawData = [];
        this.targetId = new URLSearchParams(window.location.search).get('id');
    }

    async init() {
        console.log('Sequences表格管理器初始化...');
        // 初始化tooltip
        this.initTooltip();
        
        try {
            await this.loadTableData();
            // 绑定按钮事件
            this.bindButtonEvents();
        } catch (error) {
            console.error('表格初始化失败:', error);
        }
    }

    bindButtonEvents() {
        // 绑定导出按钮事件
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportSelected());
        }

        // 绑定全选按钮事件
        const selectAllBtn = document.getElementById('selectAllBtn');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => this.selectAll());
        }

        // 绑定取消全选按钮事件
        const deselectAllBtn = document.getElementById('deselectAllBtn');
        if (deselectAllBtn) {
            deselectAllBtn.addEventListener('click', () => this.deselectAll());
        }

        // 绑定搜索框事件
        const searchBox = document.getElementById('searchBox');
        if (searchBox) {
            searchBox.addEventListener('keyup', (e) => this.searchSequences(e.target.value));
        }
    }

    // 全选功能
    selectAll() {
        if (this.table) {
            jQuery('#sequences-datatable tbody tr:visible input.row-select').prop('checked', true);
        }
    }

    // 取消全选功能
    deselectAll() {
        if (this.table) {
            jQuery('#sequences-datatable tbody tr input.row-select').prop('checked', false);
        }
    }

    // 导出选中行
    exportSelected() {
        const jQuery = window.jQuery;
        if (!jQuery) return;
        
        const selected = [];
        let rows = [];
        
        if (this.table && typeof this.table.rows === 'function') {
            // DataTable 模式
            this.table.rows().every(function(){
                const node = this.node();
                if(jQuery(node).find('input.row-select').prop('checked')){
                    selected.push(this.data());
                }
            });
            rows = selected.length ? selected : this.table.rows().data().toArray();
        } else {
            // 简单表格模式
            jQuery('#sequences-datatable tbody tr').each(function() {
                if (jQuery(this).find('input.row-select').prop('checked')) {
                    const rowData = [];
                    jQuery(this).find('td').each(function() {
                        rowData.push(jQuery(this).html());
                    });
                    selected.push(rowData);
                }
            });
            
            if (selected.length === 0) {
                // 如果没有选中任何行，导出所有可见行
                jQuery('#sequences-datatable tbody tr').each(function() {
                    const rowData = [];
                    jQuery(this).find('td').each(function() {
                        rowData.push(jQuery(this).html());
                    });
                    rows.push(rowData);
                });
            } else {
                rows = selected;
            }
        }
        
        // 获取表头
        const headers = [];
        jQuery('#sequences-datatable thead th').each(function() {
            // 跳过复选框列
            if (jQuery(this).text() !== 'Select') {
                headers.push(jQuery(this).text());
            }
        });
        
        const csv = [headers.join(',')];
        
        rows.forEach(r => {
            // 跳过第一个复选框列
            const exportRow = r.slice(1);
            const cleanedRow = exportRow.map(cell => {
                // 清理HTML标签和处理双引号
                const cleaned = cell.toString().replace(/<[^>]+>/g, '');
                return `"${cleaned.replace(/"/g, '""')}"`;
            });
            csv.push(cleanedRow.join(','));
        });
        
        const csvContent = 'data:text/csv;charset=utf-8,' + csv.join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', 'sequences.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    initTooltip() {
        // 创建aptamer风格的tooltip元素
        if (!document.getElementById('amirTooltip')) {
            const tooltip = document.createElement('div');
            tooltip.id = 'amirTooltip';
            tooltip.className = 'amir-tooltip';
            tooltip.innerHTML = `
                <div class="tooltip-content"></div>
                <div class="tooltip-arrow"></div>
            `;
            document.body.appendChild(tooltip);
        }

        // 添加aptamer风格的tooltip样式和表格样式
        const style = document.createElement('style');
        style.textContent = `
            /* CSS变量定义 */
            :root {
                --primary-color: #520049;
            }
            
            /* Aptamer风格tooltip样式 */
            .amir-tooltip {
                position: fixed;
                z-index: 999999;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 10px 15px;
                border-radius: 8px;
                font-size: 12px;
                line-height: 1.4;
                max-width: 300px;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                word-wrap: break-word;
                white-space: normal;
            }

            .amir-tooltip .tooltip-content {
                word-wrap: break-word;
            }

            .amir-tooltip .tooltip-arrow {
                position: absolute;
                width: 0;
                height: 0;
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                transition: none;
            }

            /* 默认箭头在底部 */
            .amir-tooltip .tooltip-arrow {
                bottom: -5px;
                left: 50%;
                transform: translateX(-50%);
                border-top: 5px solid rgba(0, 0, 0, 0.9);
                border-bottom: none;
            }
            
            .truncated-text {
                max-width: 200px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                cursor: pointer;
            }
            
            /* 匹配application.md中的表格样式 */
            .table-style1 {
                width: 100%;
                margin: 0;
                background: #fff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .table-style1 th {
                background: var(--primary-color);
                color: #fff;
                padding: 12px;
                text-align: left;
                font-weight: 600;
                border: none;
            }
            
            .table-style1 td {
                padding: 12px;
                border-bottom: 1px solid #e8e8e8;
            }
            
            .table-style1 tbody tr:nth-child(even) {
                background: rgba(245,245,245,0.5);
            }
            
            .table-style1 tbody tr:hover {
                background: rgba(82,0,73,0.05);
            }
            
            .data-table-section .table a {
                color: #520049 !important;
                text-decoration: none !important;
                font-weight: 600;
                transition: all 0.2s ease;
                padding: 2px 4px;
                border-radius: 3px;
            }
            
            .data-table-section .table a:hover {
                color: #7a0070 !important;
                text-decoration: underline !important;
                background-color: rgba(82, 0, 73, 0.1);
            }
            
            .data-table-section .table a:visited {
                color: #520049 !important;
            }
            
            .data-table-section .table a:active {
                color: #520049 !important;
                background-color: rgba(82, 0, 73, 0.2);
            }

            .loading {
                text-align: center;
                padding: 20px;
                font-size: 16px;
                color: #520049;
            }

            /* 复选框样式 */
            .row-select {
                cursor: pointer;
                width: 16px;
                height: 16px;
            }
        `;
        document.head.appendChild(style);
    }

    showAmirTooltip(content, clientX, clientY) {
        const tooltip = document.getElementById('amirTooltip');
        if (!tooltip) return;
        
        const tooltipContent = tooltip.querySelector('.tooltip-content');
        if (!tooltipContent) return;
        
        tooltipContent.innerHTML = content;
        
        // 确保tooltip可见以计算尺寸
        tooltip.style.opacity = '0';
        tooltip.style.display = 'block';
        tooltip.style.position = 'fixed';
        tooltip.style.transform = 'none';
        
        // 获取tooltip尺寸
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // 计算最佳位置
        let left = clientX - (tooltipRect.width / 2);
        let top = clientY - tooltipRect.height - 15;
        let arrowPosition = 'bottom';
        
        // 边界检查
        if (left + tooltipRect.width > viewportWidth) {
            left = viewportWidth - tooltipRect.width - 10;
        }
        
        if (left < 10) {
            left = 10;
        }
        
        if (top < 10) {
            top = clientY + 15;
            arrowPosition = 'top';
        }
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        tooltip.style.opacity = '1';
    }

    hideAmirTooltip() {
        const tooltip = document.getElementById('amirTooltip');
        if (tooltip) {
            tooltip.style.opacity = '0';
        }
    }

    async loadTableData() {
        try {
            const response = await fetch(`${this.baseUrl}${this.dataPath}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonData = await response.json();
            
            // 获取Sheet1的数据并保存
            this.rawData = jsonData.Sheet1 || [];
            if (this.targetId) {                      // 仅显示单条
                this.rawData = this.rawData.filter(r => String(r.ID) === String(this.targetId));
              }
            this.renderTable(this.rawData);
        } catch (error) {
            console.error(`Failed to load sequences data:`, error);
            const container = document.getElementById('sequences-table');
            if (container) {
                container.innerHTML = '<div class="loading">Failed to load sequences data.</div>';
            }
        }
    }

    renderTable(data) {
        const container = document.getElementById('sequences-table');
        if (!container) {
            console.warn(`找不到容器: sequences-table`);
            return;
        }

        if (!data || data.length === 0) {
            container.innerHTML = '<div class="loading">No sequences data available.</div>';
            return;
        }

        // 定义要显示的字段（仅显示重要字段，与dashboard保持一致）
        const displayFields = [
            'ID',
            'Linker name(page name)', // Aptamer Name
            'Type',
            'Category', 
            'Named', // Sequence Name
            'Article name',
            'Ligand',
            'Ligand Description',
            'Sequence',
            'Length',
            'GC Content',
            'Affinity',
            'Year',
            'Link to PubMed Entry'
        ];
        const allFields = displayFields.filter(field => data[0].hasOwnProperty(field));
        
        // 构建表格数据
        const tableData = data.map(item => {
            const row = {};
            // 添加复选框列
            row['Select'] = '<input type="checkbox" class="row-select">';
            
            // 添加其他列
            allFields.forEach(field => {
                row[field] = this.formatCellData(item, field);
            });
            
            return row;
        });

        // 创建表格HTML - 调整表格样式以匹配application.md
        const html = `
            <div class="data-table-section">
                <div style="display: flex; overflow: auto;">
                    <table id="sequences-datatable" style="flex: 1; width: 100%;" class="table-style1">
                        <thead>
                            <tr>
                                <th>Select</th>
                                ${allFields.map(field => `<th>${this.formatHeaderName(field)}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${tableData.map(row => `
                                <tr>
                                    <td>${row.Select}</td>
                                    ${allFields.map(field => `<td>${row[field]}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        container.innerHTML = html;

        // 初始化DataTable
        this.initDataTable();

        // 添加事件监听器
        this.addEventListeners(container);
    }

    initDataTable() {
        // 使用jQuery的noConflict()避免冲突
        const jQuery = window.jQuery;
        if (!jQuery || !jQuery.fn.DataTable) {
            console.error("jQuery or DataTables not loaded correctly!");
            return;
        }
        
        try {
            // 初始化DataTable
            this.table = jQuery('#sequences-datatable').DataTable({
                // 删除导出按钮，使用默认 dom 布局（l-长度选择器 f-搜索框 r-处理信息 t-表格 i-信息 p-分页），
                // 由于页面自带自定义搜索框，这里选择 "lrtip" 隐藏内置搜索框(f)。
                dom: 'lrtip',
                pageLength: 25,
                lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
                scrollX: true,
                searching: true,
                columnDefs: [
                    { orderable: false, targets: 0 } // 禁止第一列（复选框）排序
                ]
            });
            
            // 绑定自定义搜索框事件
            jQuery('#searchBox').on('keyup', (e) => {
                this.table.search(e.target.value).draw();
            });
        } catch (error) {
            console.error("DataTables初始化失败:", error);
        }
    }

    formatHeaderName(field) {
        // 格式化表头名称（与dashboard保持一致）
        const headerMap = {
            'ID': 'ID',
            'Linker name(page name)': 'Aptamer Name',
            'Type': 'Type',
            'Category': 'Category',
            'Named': 'Sequence Name',
            'Article name': 'Article Name',
            'Ligand': 'Ligand',
            'Ligand Description': 'Description',
            'Sequence': 'Sequence (5\'-3\')',
            'Length': 'Length',
            'GC Content': 'GC Content',
            'Affinity': 'Affinity',
            'Year': 'Year',
            'Link to PubMed Entry': 'PubMed Link'
        };
        return headerMap[field] || field;
    }

    formatCellData(item, field) {
        let value = item[field];
        
        // 处理特殊字段
        switch (field) {
            case 'Named':
                // 如果有Linker链接，将名称设为链接
                if (item.Linker && item.Linker.trim() !== '' && item.Linker !== 'null') {
                    return `<a href="${item.Linker}" target="_blank">${value || ''}</a>`;
                }
                return value || '';
                
            case 'Linker name(page name)':
                // 处理aptamer名称，根据sequence name确定正确的aptamer name
                let aptamerName = value || 'N/A';
                const seqName = item['Named'] || '';
                if (seqName && aptamerName !== 'N/A' && aptamerName.includes(',')) {
                    // 检查是否是合并的aptamer（包含逗号）
                    if (seqName.includes('CB-42')) {
                        aptamerName = 'Cibacron Blue 3GA_CB-42 aptamer';
                    } else if (seqName.includes('B4-25')) {
                        aptamerName = 'Reactive Blue 4_B4-25 aptamer';
                    } else if (seqName.includes('Ribostamycin')) {
                        aptamerName = 'Ribostamycin aptamer';
                    } else if (seqName.includes('Paromomycin')) {
                        aptamerName = 'Paromomycin aptamer';
                    }
                }
                
                // 如果有Linker链接，将aptamer名称设为链接
                if (item.Linker && item.Linker.trim() !== '' && item.Linker !== 'null') {
                    const linkerUrl = item.Linker.startsWith('/') ? item.Linker : '/' + item.Linker;
                    return `<a href="${linkerUrl}" target="_blank">${aptamerName}</a>`;
                }
                return aptamerName;
                
            case 'Link to PubMed Entry':
                if (value && value.trim() !== '') {
                    const pubmedId = this.extractPubMedIdFromUrl(value);
                    return `<a href="${value}" target="_blank">${pubmedId || 'Link'}</a>`;
                }
                return '';
                
            case 'Sequence':
                // 将序列限制在20个字符，超出的完全隐藏
                if (value && value.length > 20) {
                    const shortValue = value.substring(0, 20) + '...';
                    return `<span class="truncated-text" data-full-text="${this.escapeHtml(value)}" data-is-sequence="true">${shortValue}</span>`;
                }
                return value || '';
                
            case 'GC Content':
                if (typeof value === 'number') {
                    return (value * 100).toFixed(1) + '%';
                }
                return value || '';
                
            case 'CAS':
                // 将CAS编号限制在20个字符，超出的完全隐藏
                if (typeof value === 'string' && value.length > 20) {
                    const shortValue = value.substring(0, 20) + '...';
                    return `<span class="truncated-text" data-full-text="${this.escapeHtml(value)}">${shortValue}</span>`;
                }
                return value || '';
                
            case 'Ligand Description':
                // 处理长文本
                if (typeof value === 'string' && value.length > 50) {
                    const shortValue = value.substring(0, 50) + '...';
                    return `<span class="truncated-text" data-full-text="${this.escapeHtml(value)}">${shortValue}</span>`;
                }
                return value || '';
                
            default:
                // 处理其他长文本
                if (typeof value === 'string' && value.length > 30) {
                    const shortValue = value.substring(0, 30) + '...';
                    return `<span class="truncated-text" data-full-text="${this.escapeHtml(value)}">${shortValue}</span>`;
                }
                return value || '';
        }
    }

    extractPubMedIdFromUrl(url) {
        if (!url) return '';
        
        // 从PubMed URL中提取ID
        const pubmedMatch = url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/);
        if (pubmedMatch) {
            return pubmedMatch[1];
        }
        
        // 如果不是PubMed链接，尝试提取任何数字作为ID
        const idMatch = url.match(/(\d+)/);
        return idMatch ? idMatch[1] : '';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    addEventListeners(container) {
        // 为截断文本添加tooltip事件
        const truncatedTexts = container.querySelectorAll('.truncated-text');
        truncatedTexts.forEach(element => {
            element.style.cursor = 'pointer';
            
            element.addEventListener('mouseenter', (e) => {
                const fullText = e.target.getAttribute('data-full-text');
                const isSequence = e.target.getAttribute('data-is-sequence') === 'true';
                
                // 如果是序列，使用染色逻辑；否则使用原始文本
                const htmlContent = isSequence ? this.colorizeSequence(fullText) : fullText;
                this.showAmirTooltip(htmlContent, e.clientX, e.clientY);
            });

            element.addEventListener('mousemove', (e) => {
                const fullText = e.target.getAttribute('data-full-text');
                const isSequence = e.target.getAttribute('data-is-sequence') === 'true';
                
                // 如果是序列，使用染色逻辑；否则使用原始文本
                const htmlContent = isSequence ? this.colorizeSequence(fullText) : fullText;
                this.showAmirTooltip(htmlContent, e.clientX, e.clientY);
            });

            element.addEventListener('mouseleave', () => {
                this.hideAmirTooltip();
            });
        });
    }

    // 序列染色函数
    colorizeSequence(seq) {
        const colorMap = { 'A': '#d9534f', 'T': '#f0ad4e', 'U': '#f0ad4e', 'C': '#5bc0de', 'G': '#5cb85c' };
        return (seq || '').split('').map(ch => `<span style="color:${colorMap[ch.toUpperCase()] || '#333'}">${ch}</span>`).join('');
    }

    // 搜索功能
    searchSequences(keyword) {
        if (this.table) {
            this.table.search(keyword).draw();
        }
    }
}

// 页面加载完成后初始化
jQuery(document).ready(function($) {
    console.log('Sequences page loaded, initializing table...');
    window.sequenceManager = new SequenceTableManager();
    window.sequenceManager.init();
}); 