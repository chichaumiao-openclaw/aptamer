// dashboard-fluor.js - 针对荧光页面(fluorescence.html)的 Dashboard 补丁脚本
// 仅在该页面中引入，以避免影响首页(index.html) 的默认行为
// 主要功能：
// 1. 在数据加载阶段，把每条记录的 mechanisms 字段映射为 category，复用原有类别图逻辑
// 2. 重写 TableModule.updateDataTable，使其列顺序与荧光页面一致
// 3. 其他页面继续使用原版 dashboard-main.js，不受影响

(function () {
    if (typeof DataModule === 'undefined') {
        console.error('DataModule 未定义，dashboard-riboaptamer.js 无法应用补丁');
        return;
    }

    // --- 重写 DataModule.loadData ---
    const originalLoadData = DataModule.loadData;
    DataModule.loadData = async function () {
        try {
            const dataPath = window.DASHBOARD_CONFIG?.dataPath || './apidata/riboaptamer_merged.json';
            console.log('Loading data:', dataPath);
            
            const response = await fetch(dataPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Data loaded successfully, processing...');

            // 将 Category 字段映射到 category (小写)，复用原有类别(饼图)逻辑
            data.forEach(d => {
                if (d.Category !== undefined && d.Category !== null) {
                    d.category = d.Category;
                }
                
                // 确保year字段是数字类型
                if (d.Year) {
                    d.year = parseInt(d.Year, 10);
                }
                
                // 确保ligand字段存在
                if (d.Ligand) {
                    d.ligand = d.Ligand;
                }
            });

            // 保存到全局数据
            originalData = data;
            filteredData = [...data];

            console.log('Riboaptamer data loaded successfully, total', data.length, 'records');

            // 初始化各模块
            this.updateStatistics();
            ChartModule.createAllCharts();
            UIModule.updateDataSummary();
            FilterModule.updateFilterTags();
            TableModule.updateDataTable();
        } catch (error) {
            console.error('Fluorescence data loading failed:', error);
            this.showLoadingError(error.message);
        }
    };

    // --- 重写 TableModule.updateDataTable ---
    if (typeof TableModule !== 'undefined') {
        TableModule.updateDataTable = function () {
            const tableBody = document.getElementById('tableBody');
            const tableInfo = document.getElementById('tableInfo');

            if (!tableBody || !tableInfo) {
                console.warn('表格元素缺失，无法更新数据表');
                return;
            }

            tableInfo.textContent = `Showing ${filteredData.length} records (out of ${originalData.length} total)`;
            tableBody.innerHTML = '';

            // 辅助函数
            const colorizeSequence = (seq) => {
                if (!seq) return '';
                const colorMap = { 'A': '#d9534f', 'T': '#f0ad4e', 'U': '#f0ad4e', 'C': '#5bc0de', 'G': '#5cb85c' };
                return seq.split('').map(ch => `<span style="color:${colorMap[ch.toUpperCase()] || '#333'}">${ch}</span>`).join('');
            };

            const addTooltip = (cell, htmlContent) => {
                if (!htmlContent) return;
                cell.addEventListener('mouseenter', (e) => {
                    showAmirTooltip(htmlContent, e.pageX, e.pageY);
                });
                cell.addEventListener('mousemove', (e) => {
                    showAmirTooltip(htmlContent, e.pageX, e.pageY);
                });
                cell.addEventListener('mouseleave', hideAmirTooltip);
            };

            filteredData.forEach((item, index) => {
                try {
                    const row = document.createElement('tr');
                    
                    // 准备显示数据 - 适配riboaptamer_merged.json的字段名
                    const name = item.Named || item["Article name"] || '';
                    const ligand = item.Ligand || '';
                    const category = item.Category || '';
                    const sequence = item.Sequence || '';
                    const year = item.Year || '';
                    const affinity = item.Affinity || '';
                    const pdb = item.PDB || '';
                    
                    // 链接处理
                    let nameHTML = name;
                    if (item.Linker && item.Linker.trim() !== '') {
                        nameHTML = `<a href="${item.Linker}" target="_blank">${name}</a>`;
                    }
                    
                    // 序列显示处理
                    const seqShort = sequence.length > 15 ? sequence.substring(0, 15) + '...' : sequence;
                    const seqFullColored = colorizeSequence(sequence);
                    
                    // 年份链接处理
                    let yearHTML = year;
                    if (item["Link to PubMed Entry"] && item["Link to PubMed Entry"].trim() !== '') {
                        yearHTML = `<a href="${item["Link to PubMed Entry"]}" target="_blank">${year}</a>`;
                    }

                    // 构建表格行
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${nameHTML}</td>
                        <td>${ligand}</td>
                        <td>${category}</td>
                        <td>${seqShort}</td>
                        <td>${yearHTML}</td>
                        <td>${affinity}</td>
                        <td>${pdb || ''}</td>
                    `;
                    tableBody.appendChild(row);

                    // 添加鼠标悬停提示
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 5) {
                        addTooltip(cells[4], seqFullColored); // 为序列添加彩色提示
                    }
                    
                    // 如果有描述信息，添加到ligand提示
                    if (item["Ligand Description"] && cells.length >= 3) {
                        addTooltip(cells[2], item["Ligand Description"]);
                    }
                } catch (error) {
                    console.error('处理数据行时出错:', error, item);
                }
            });
        };
    }

    const originalUpdateStatistics = DataModule.updateStatistics;
    DataModule.updateStatistics = function() {
        // 复用原函数逻辑，但修正 GC 显示为百分比
        if (!originalData || originalData.length === 0) {
            return;
        }

        if (!filteredData) {
            return;
        }

        const ligands = [...new Set(filteredData.map(d => d.ligand))];
        const years = filteredData.length > 0 ? [...new Set(filteredData.map(d => d.year))] : [];

        const totalAptamersEl = document.getElementById('totalAptamers');
        const uniqueLigandsEl = document.getElementById('uniqueLigands');
        const yearSpanEl = document.getElementById('yearSpan');
        const avgGCEl = document.getElementById('avgGC');

        if (totalAptamersEl) totalAptamersEl.textContent = filteredData.length;
        if (uniqueLigandsEl) uniqueLigandsEl.textContent = ligands.length;
        if (yearSpanEl) {
            if (years.length > 0) {
                const yearSpan = Math.max(...years) - Math.min(...years);
                yearSpanEl.textContent = yearSpan + '年';
            } else {
                yearSpanEl.textContent = '0年';
            }
        }

        if (avgGCEl) {
            if (filteredData.length > 0) {
                const validGCData = filteredData.filter(d => d.gc_content !== undefined && d.gc_content !== null && !isNaN(d.gc_content));
                if (validGCData.length > 0) {
                    const avgGC = validGCData.reduce((sum, d) => sum + d.gc_content, 0) / validGCData.length * 100;
                    avgGCEl.textContent = avgGC.toFixed(1) + '%';
                } else {
                    avgGCEl.textContent = '0%';
                }
            } else {
                avgGCEl.textContent = '0%';
            }
        }
    };

    // --- 覆写 ChartModule.createAllCharts：仅生成年份和类别图 ---
    ChartModule.createAllCharts = function () {
        try {
            console.log("[Aptamer] 创建年份及类别图表...");
            this.createYearChart();
            this.createCategoryChart(); // 使用我们自定义的createCategoryChart函数
            console.log("[Aptamer] 图表创建完成");
        } catch (error) {
            console.error("[Aptamer] 创建图表时发生错误:", error);
        }
    };

    // --- 覆写 FilterModule.updateNodeStateIndicators：忽略散点图 ---
    if (typeof FilterModule !== 'undefined') {
        FilterModule.updateNodeStateIndicators = function () {
            try {
                // 安全地获取元素
                const yearChartEl = document.querySelector('#yearChart');
                const ligandChartEl = document.querySelector('#ligandChart');
                
                if (!yearChartEl || !ligandChartEl) {
                    console.warn('图表元素不存在，无法更新节点状态指示器');
                    return;
                }
                
                // 安全地获取父元素
                const yearChartWrapper = yearChartEl.closest('.chart-wrapper');
                const ligandChartWrapper = ligandChartEl.closest('.chart-wrapper');
                
                if (!yearChartWrapper || !ligandChartWrapper) {
                    console.warn('图表包装元素不存在，无法更新节点状态指示器');
                    return;
                }
                
                const yearChartHeader = yearChartWrapper.querySelector('.chart-header');
                const ligandChartHeader = ligandChartWrapper.querySelector('.chart-header');
                
                if (!yearChartHeader || !ligandChartHeader) {
                    console.warn('图表标题元素不存在，无法更新节点状态指示器');
                    return;
                }
                
                // 移除所有现有的指示器
                document.querySelectorAll('.node-state-indicator').forEach(el => el.remove());
                
                // 如果有交互，则更新状态指示器
                if (nodeInteractionOrder.length > 0) {
                    nodeInteractionOrder.forEach((nodeId, idx) => {
                        const indicator = document.createElement('span');
                        indicator.className = 'node-state-indicator';
                        indicator.textContent = `Level ${idx + 1}`;
                        
                        if (nodeId === 'yearChart' && yearChartHeader) {
                            yearChartHeader.appendChild(indicator);
                        } else if (nodeId === 'ligandChart' && ligandChartHeader) {
                            ligandChartHeader.appendChild(indicator);
                        }
                    });
                }
            } catch (error) {
                console.error('更新节点状态指示器时出错:', error);
            }
        };
    }

    console.log('dashboard-riboaptamer.js 补丁已应用');
})(); 