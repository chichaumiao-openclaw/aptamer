/**
 * applications.js - 为Applications页面表格设计的专用JS
 */

class ApplicationTableManager {
    constructor() {
        this.baseUrl = window.location.origin;
        this.dataPath = '/apidata/applications/';
        this.tableConfigs = [
            { 
                sectionId: 'section1-table', 
                jsonFile: 'section_1.json',
                title: 'Diagnosis of infectious diseases and pathogens'
            },
            { 
                sectionId: 'section2-table', 
                jsonFile: 'section_2.json',
                title: 'Cancer Recognition and Molecular Imaging'
            },
            { 
                sectionId: 'section3-table', 
                jsonFile: 'section_3.json',
                title: 'Clinical sample detection'
            },
            { 
                sectionId: 'section4-table', 
                jsonFile: 'section_4.json',
                title: 'Aptamers as inhibitor'
            },
            { 
                sectionId: 'section5-table', 
                jsonFile: 'section_5.json',
                title: 'Targeted drug delivery'
            },
            { 
                sectionId: 'section6-table', 
                jsonFile: 'section_6.json',
                title: 'Biosensing and monitoring'
            },
            { 
                sectionId: 'section7-table', 
                jsonFile: 'section_7.json',
                title: 'Research Tools'
            }
        ];
    }

    async init() {
        console.log('Applications表格管理器初始化...');
        // 初始化tooltip
        this.initTooltip();
        
        try {
            for (const config of this.tableConfigs) {
                await this.loadTableData(config);
            }
        } catch (error) {
            console.error('表格初始化失败:', error);
        }
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

            // 添加aptamer风格的tooltip样式
            const style = document.createElement('style');
            style.textContent = `
                /* CSS变量定义 */
                :root {
                    --primary-color: #520049;
                }
                
                /* Aptamer风格tooltip样式 - 完全迁移 */
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
                
                .data-table-section .table a {
                    color: #520049 !important;
                    text-decoration: none !important;
                    font-weight: 600;
                    transition: all 0.2s ease;
                }
                
                .data-table-section .table a:hover {
                    color: #7a0070 !important;
                    text-decoration: underline !important;
                    background-color: rgba(82, 0, 73, 0.1);
                    padding: 2px 4px;
                    border-radius: 3px;
                }
                
                .data-table-section .table a:visited {
                    color: #520049 !important;
                }
                
                .data-table-section .table a:active {
                    color: #520049 !important;
                    background-color: rgba(82, 0, 73, 0.2);
                }

                /* Publication页面表格样式 */
                .table-style {
                    width: 100%;
                    margin: 20px 0;
                    background: #fff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .table-style th {
                    background: var(--primary-color);
                    color: #fff;
                    padding: 12px;
                    text-align: left;
                    font-weight: 600;
                }
                
                .table-style td {
                    padding: 12px;
                    border-bottom: 1px solid #e8e8e8;
                }
                
                .table-style tbody tr:nth-child(even) {
                    background: rgba(245,245,245,0.5);
                }
                
                .table-style tbody tr:hover {
                    background: rgba(82,0,73,0.05);
                }
            `;
            document.head.appendChild(style);
        }
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
        
        // 计算最佳位置，让小箭头对准鼠标
        // 小箭头在tooltip底部中央，所以tooltip应该在鼠标上方，水平居中
        let left = clientX - (tooltipRect.width / 2); // 水平居中对准鼠标
        let top = clientY - tooltipRect.height - 15;  // 在鼠标上方，留出箭头空间
        let arrowPosition = 'bottom'; // 箭头默认在底部
        
        // 如果tooltip会超出右边界，调整左侧位置
        if (left + tooltipRect.width > viewportWidth) {
            left = viewportWidth - tooltipRect.width - 10;
        }
        
        // 如果tooltip会超出左边界，调整左侧位置
        if (left < 10) {
            left = 10;
        }
        
        // 如果tooltip会超出上边界，放到鼠标下方
        if (top < 10) {
            top = clientY + 15;
            arrowPosition = 'top'; // 箭头在顶部
        }
        
        // 如果tooltip会超出下边界，强制放到上方
        if (top + tooltipRect.height > viewportHeight && clientY > tooltipRect.height + 30) {
            top = clientY - tooltipRect.height - 15;
            arrowPosition = 'bottom';
        }
        
        // 设置箭头位置
        const arrow = tooltip.querySelector('.tooltip-arrow');
        if (arrow) {
            if (arrowPosition === 'bottom') {
                arrow.style.top = 'auto';
                arrow.style.bottom = '-5px';
                arrow.style.borderTop = '5px solid rgba(0, 0, 0, 0.9)';
                arrow.style.borderBottom = 'none';
            } else {
                arrow.style.bottom = 'auto';
                arrow.style.top = '-5px';
                arrow.style.borderBottom = '5px solid rgba(0, 0, 0, 0.9)';
                arrow.style.borderTop = 'none';
            }
            // 箭头水平位置对准鼠标
            const arrowLeft = clientX - left - 5; // 5px是箭头宽度的一半
            const finalArrowLeft = Math.max(5, Math.min(arrowLeft, tooltipRect.width - 15));
            arrow.style.left = finalArrowLeft + 'px';
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

    async loadTableData(config) {
        try {
            const response = await fetch(`${this.baseUrl}${this.dataPath}${config.jsonFile}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.renderTable(config, data);
        } catch (error) {
            console.error(`Failed to load ${config.jsonFile}:`, error);
        }
    }

    renderTable(config, data) {
        const container = document.getElementById(config.sectionId);
        if (!container) {
            console.warn(`找不到容器: ${config.sectionId}`);
            return;
        }

        // 获取所有字段（除了Linker）
        const excludeFields = ['Linker'];
        const allFields = data.length > 0 ? Object.keys(data[0]).filter(key => !excludeFields.includes(key)) : [];

        // 创建表格HTML - 使用与publication页面相同的table-style类
        const html = `
            <div class="data-table-section">
                <div style="display: flex; overflow: auto;">
                    <table style="flex: 1;" class="table table-striped table-hover table-style">
                        <thead>
                            <tr>
                                ${allFields.map(field => `<th>${this.formatHeaderName(field)}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map(item => this.createTableRow(item, allFields)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        container.innerHTML = html;

        // 添加事件监听器
        this.addEventListeners(container);
    }

    formatHeaderName(field) {
        // 格式化表头名称
        const headerMap = {
            'new Linker name': 'Name',
            'New Linker name': 'Name',
            'Section': 'Section',
            'Target': 'Target',
            'Sequence': 'Sequence (5\'-3\')',
            'Length': 'Length',
            'GC content': 'GC Content',
            'Affinity': 'Affinity',
            'References': 'PMID',
            'Biomarkers': 'Biomarkers',
            'Cancer Type': 'Cancer Type',
            'Clinical sample': 'Clinical Sample',
            'Disease indication': 'Disease Indication',
            'Name': 'Name',
            'Disease': 'Disease',
            'Clinical Status': 'Clinical Status',
            'Conjugated drug': 'Conjugated Drug',
            'Fields': 'Fields',
            'Aptamer Name': 'Aptamer Name',
            'Method': 'Method',
            'Tool Function': 'Tool Function'
        };
        return headerMap[field] || field;
    }

    createTableRow(item, fields) {
        return `<tr>${fields.map(field => `<td>${this.formatCellData(item, field)}</td>`).join('')}</tr>`;
    }

    // 序列染色函数 - 完全迁移自aptamer dashboard
    colorizeSequence(seq) {
        if (!seq) return '';

        // HTML 转义，避免注入
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };

        // 核苷酸颜色映射
        const colorMap = {
            'A': '#d9534f', // 红色
            'T': '#f0ad4e', // 橙色
            'U': '#f0ad4e',
            'C': '#5bc0de', // 蓝色
            'G': '#5cb85c'  // 绿色
        };

        // 对单一序列进行颜色包裹
        const wrapSequence = (sequence) => {
            return sequence.split('').map(ch => {
                const color = colorMap[ch.toUpperCase()] || '#ffffff';
                return `<span style="color:${color}">${ch}</span>`;
            }).join('');
        };

        // 处理文本，染色 5'-xxx-3' 之间的碱基序列
        let escaped = escapeHtml(seq);

        const regex = /(5[\'′]-)([A-Za-z]+)(-3[\'′])/g;
        escaped = escaped.replace(regex, (match, prefix, sequence, suffix) => {
            return `${prefix}${wrapSequence(sequence)}${suffix}`;
        });

        // 保留换行
        escaped = escaped.replace(/\n/g, '<br/>');

        return escaped;
    }

    formatCellData(item, field) {
        let value = item[field];

        // 若值为空、null、undefined 或字符串 'null'，统一显示为 "NA"
        const isValueEmpty = (
            value === null ||
            value === undefined ||
            (typeof value === 'string' && value.trim() === '') ||
            value === 'null'
        );

        if (isValueEmpty) {
            return 'NA';
        }

        // 处理特殊字段
        switch (field) {
            case 'new Linker name':
            case 'New Linker name':
                // 将linker链接赋值给name
                if (item.Linker && item.Linker.trim() !== '' && item.Linker !== 'null') {
                    return `<a href="${item.Linker}" target="_blank">${value}</a>`;
                }
                return value;
                
            case 'References':
                if (!isValueEmpty) {
                    const pubmedId = this.extractPubMedIdFromUrl(value);
                    if (pubmedId) {
                        const pubmedUrl = `https://pubmed.ncbi.nlm.nih.gov/${pubmedId}/`;
                        return `<a href="${pubmedUrl}" target="_blank">${pubmedId}</a>`;
                    }
                    return value;
                }
                return 'NA';
                
            case 'Sequence':
                if (value.length > 10) {
                    const shortValue = value.substring(0, 10) + '...';
                    return `<span class="truncated-text" data-full-text="${this.escapeHtml(value)}" data-is-sequence="true">${shortValue}</span>`;
                }
                return value;
                
            case 'GC content':
                if (typeof value === 'number') {
                    return (value * 100).toFixed(1) + '%';
                }
                return value;
                
            default:
                // 处理长文本
                if (typeof value === 'string' && value.length > 10) {
                    const shortValue = value.substring(0, 10) + '...';
                    return `<span class="truncated-text" data-full-text="${this.escapeHtml(value)}">${shortValue}</span>`;
                }
                return value;
        }
    }

    extractYearFromUrl(url) {
        // 从URL中提取年份
        const yearMatch = url.match(/(\d{4})/);
        return yearMatch ? yearMatch[1] : null;
    }

    extractPubMedIdFromUrl(url) {
        if (!url) return '';
        
        // 从PubMed URL中提取ID
        // 支持格式：https://pubmed.ncbi.nlm.nih.gov/12345678/
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
        // 为截断文本添加aptamer风格的tooltip事件
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
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('Applications page loaded, initializing table...');
    const tableManager = new ApplicationTableManager();
    tableManager.init();
}); 