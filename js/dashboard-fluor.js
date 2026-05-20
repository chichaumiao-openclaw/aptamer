// dashboard-fluor.js - 针对荧光页面(fluorescence.html)的 Dashboard 补丁脚本
// 仅在该页面中引入，以避免影响首页(index.html) 的默认行为
// 主要功能：
// 1. 在数据加载阶段，把每条记录的 mechanisms 字段映射为 category，复用原有类别图逻辑
// 2. 重写 TableModule.updateDataTable，使其列顺序与荧光页面一致
// 3. 其他页面继续使用原版 dashboard-main.js，不受影响

(function () {
    if (typeof DataModule === 'undefined') {
        console.error('DataModule 未定义，dashboard-fluor.js 无法应用补丁');
        return;
    }

    // 预先声明机制颜色映射，保持图表与筛选标签颜色一致
    let mechanismColorMap = {};

    // --- 重写 DataModule.loadData ---
    const originalLoadData = DataModule.loadData;
    DataModule.loadData = async function () {
        try {
            const dataPath = window.DASHBOARD_CONFIG?.dataPath || './apidata/fluorescence_data.json';
            const response = await fetch(dataPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // 将 mechanisms 字段映射到 category，复用原有类别(饼图)逻辑
            data.forEach(d => {
                if (d.mechanisms !== undefined && d.mechanisms !== null) {
                    d.category = d.mechanisms;
                }
            });

            // 基于完整数据生成机制颜色映射，保持颜色稳定
            const allMechanisms = [...new Set(data.map(d => d.category || 'Unknown'))].sort();
            mechanismColorMap = {};
            allMechanisms.forEach((mech, i) => {
                mechanismColorMap[mech] = morandiColors[i % morandiColors.length];
            });
            // 将映射应用于全局类别配色表，供图表和筛选标签使用
            if (typeof categoryPaletteMap !== 'undefined') {
                categoryPaletteMap = { ...categoryPaletteMap, ...mechanismColorMap };
            } else {
                categoryPaletteMap = { ...mechanismColorMap };
            }

            // 保存到全局数据
            originalData = data;
            filteredData = [...data];

            console.log('Fluorescence data loaded successfully, total', data.length, 'records');

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
    // 强制覆盖默认的表格渲染逻辑，确保荧光页面使用9列而不是7列（移除Description列）
    if (typeof TableModule !== 'undefined') {
        const originalUpdateDataTable = TableModule.updateDataTable;
        TableModule.updateDataTable = function () {
            console.log('[Fluorescence] 使用自定义的表格渲染逻辑（8列，PubMed Link仅在导出时包含）');
            
            const tableBody = document.getElementById('tableBody');
            const tableInfo = document.getElementById('tableInfo');

            if (!tableBody || !tableInfo) {
                console.warn('表格元素缺失，无法更新数据表');
                return;
            }

            // 检查表格列数，确保是8列（移除了PubMed Link列）
            const headerCells = document.querySelectorAll('#dataTable thead th');
            console.log(`[Fluorescence] 表格标题列数: ${headerCells.length}`);
            if (headerCells.length !== 8) {
                console.warn(`[Fluorescence] 警告：表格标题列数不是8列，而是${headerCells.length}列`);
            }

            tableInfo.textContent = `Showing ${filteredData.length} records (out of ${originalData.length} total)`;
            tableBody.innerHTML = '';

            // 辅助函数
            const safe = (v) => (v !== undefined && v !== null && String(v).trim() !== '' ? v : 'NA');

            const colorizeSequence = (seq) => {
                if (!seq) return 'NA';
                const colorMap = { 'A': '#d9534f', 'T': '#f0ad4e', 'U': '#f0ad4e', 'C': '#5bc0de', 'G': '#5cb85c' };
                return seq.split('').map(ch => `<span style="color:${colorMap[ch.toUpperCase()] || '#333'}">${ch}</span>`).join('');
            };

            const addTooltip = (cell, htmlContent) => {
                if (!htmlContent) return;
                cell.style.cursor = 'pointer';
                
                cell.addEventListener('mouseenter', (e) => {
                    showAmirTooltip(htmlContent, e.clientX, e.clientY);
                });
                cell.addEventListener('mousemove', (e) => {
                    // 实时跟随鼠标移动
                    showAmirTooltip(htmlContent, e.clientX, e.clientY);
                });
                cell.addEventListener('mouseleave', hideAmirTooltip);
            };

            filteredData.forEach((item, index) => {
                const row = document.createElement('tr');
                row.style.whiteSpace = 'nowrap';

                // Aptamer name 列
                let nameHTML = safe(item.name);
                if (item.more_info && item.more_info.trim() !== '') {
                    nameHTML = `<a href="${item.more_info}" target="_blank">${safe(item.name)}</a>`;
                }

                // Ligand
                const ligandRaw = item.ligand ?? '';
                const ligandShort = ligandRaw ? ligandRaw.split(',')[0].trim() : 'NA';
                const ligandFull = ligandRaw || 'NA';

                // Year - 显示为PubMed链接
                const yearVal = safe(item.year);
                const pubmedLink = safe(item.pubmed_link);
                let yearHTML = yearVal;
                
                if (yearVal !== 'N/A' && yearVal !== 'NA' && pubmedLink !== 'N/A' && pubmedLink !== 'NA') {
                    yearHTML = `<a href="${pubmedLink}" target="_blank" style="color: #520049; text-decoration: none;">${yearVal}</a>`;
                }

                // 注意：PubMed Link列在导出时单独处理，表格显示中不包含（保持界面简洁）

                // Mechanisms
                const mechHTML = safe(item.mechanisms);

                // Sequence
                const seqRaw = item.sequence ?? '';
                const seqShort = seqRaw ? seqRaw.substring(0, 10) + '...' : 'NA';
                const seqFullColored = colorizeSequence(seqRaw);

                // Citation
                const citationRaw = item.citation ?? '';
                const citationParts = citationRaw.split(',');
                let citationShort = citationRaw;
                if (citationParts.length >= 2) {
                    citationShort = citationParts[0] + ',' + citationParts[1];
                }
                if (citationShort === '') citationShort = 'NA';

                // Structures
                const structRaw = item.structures ?? '';
                const structShort = structRaw ? structRaw.split(',')[0].trim() : 'NA';
                const structFull = structRaw || 'NA';

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${nameHTML}</td>
                    <td>${ligandShort}</td>
                    <td>${yearHTML}</td>
                    <td>${mechHTML}</td>
                    <td>${seqShort}</td>
                    <td>${citationShort}</td>
                    <td>${structShort}</td>
                `;
                tableBody.appendChild(row);

                const cells = row.querySelectorAll('td');
                // 依次添加 tooltip（与荧光表格显示保持一致 - 8列）
                addTooltip(cells[2], ligandFull); // ligand
                addTooltip(cells[5], seqFullColored); // sequence
                addTooltip(cells[6], citationRaw || 'NA'); // citation full
                addTooltip(cells[7], structFull); // structures full
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

    // --- 重写 createCategoryChart：使用图例替代饼图文字 ---
    ChartModule.createCategoryChart = function () {
        console.log("[Fluor] 创建机制分布图表...");
        
        // 获取所有可能的机制类别（基于原始数据）
        const allCategoryCounts = {};
        originalData.forEach(d => {
            allCategoryCounts[d.category] = (allCategoryCounts[d.category] || 0) + 1;
        });
        const allCategories = Object.keys(allCategoryCounts).sort();
        
        // 确定数据源 - A节点使用原始数据，B/C节点使用上级节点数据
        let dataForVisualization = [];
        
        if (nodeInteractionOrder.length === 0) {
            // 没有任何交互，使用原始数据
            dataForVisualization = [...originalData];
            console.log("机制图表无交互，使用原始数据:", dataForVisualization.length);
        } else {
            // 根据当前节点在交互序列中的位置确定数据来源
            const myIndex = nodeInteractionOrder.indexOf('ligandChart');
            
            if (myIndex === -1) {
                // 如果不在交互序列中，使用最后一个交互节点的数据
                const lastNodeId = nodeInteractionOrder[nodeInteractionOrder.length - 1];
                dataForVisualization = [...nodeFilteredData[lastNodeId]];
                console.log(`机制图表不在交互序列中，使用最后节点${lastNodeId}数据:`, dataForVisualization.length);
            } else if (myIndex === 0) {
                // 如果是A节点，必须使用原始数据，严禁下探
                dataForVisualization = [...originalData];
                console.log("机制图表是A节点，使用原始数据(禁止下探):", dataForVisualization.length);
            } else {
                // 如果是B节点或C节点，使用上级节点的数据进行可视化
                const parentNodeId = nodeInteractionOrder[myIndex - 1];
                dataForVisualization = [...nodeFilteredData[parentNodeId]];
                console.log(`机制图表是${myIndex === 1 ? 'B' : 'C'}节点，使用上级节点${parentNodeId}数据:`, dataForVisualization.length);
            }
        }
        
        // 计算可视化数据的机制分布
        const visualizationCategoryCounts = {};
        dataForVisualization.forEach(d => {
            visualizationCategoryCounts[d.category] = (visualizationCategoryCounts[d.category] || 0) + 1;
        });
        
        // 检查是否有机制筛选
        const hasCategoryFilter = activeFilters.categories.size > 0;
        const hasAnyFilter = nodeInteractionOrder.length > 0;
        
        // 创建饼图数据 - 基于可视化数据源的机制分布
        const pieData = allCategories.map(category => {
            const value = visualizationCategoryCounts[category] || 0;
            return {
                category: category,
                count: value,
                isFiltered: hasCategoryFilter && activeFilters.categories.has(category)
            };
        });
        
        // 如果可视化数据源为空，显示提示
        if (dataForVisualization.length === 0) {
            console.warn('Visualization data source is empty, showing empty state');
            Plotly.newPlot('ligandChart', [], {
                ...chartLayoutBase,
                margin: { l: 20, r: 20, t: 20, b: 20 },
                annotations: [{
                    text: 'Filtering... Please try other filter criteria',
                    xref: 'paper',
                    yref: 'paper',
                    x: 0.5,
                    y: 0.5,
                    xanchor: 'center',
                    yanchor: 'middle',
                    showarrow: false,
                    font: { size: 16, color: '#520049' }
                }]
            }, chartConfig);
            return;
        }
        
        // 只显示有数据的机制
        const displayCategories = pieData.filter(d => d.count > 0).map(d => d.category);
        const displayValues = pieData.filter(d => d.count > 0).map(d => d.count);
        const isFiltered = pieData.filter(d => d.count > 0).map(d => d.isFiltered);
        
        // 如果筛选后没有数据，显示错误
        if (displayCategories.length === 0) {
            console.warn('No mechanism data after filtering, showing empty state');
            Plotly.newPlot('ligandChart', [], {
                ...chartLayoutBase,
                margin: { l: 20, r: 20, t: 20, b: 20 },
                annotations: [{
                    text: 'No matching mechanism data',
                    xref: 'paper',
                    yref: 'paper',
                    x: 0.5,
                    y: 0.5,
                    xanchor: 'center',
                    yanchor: 'middle',
                    showarrow: false,
                    font: { size: 16, color: '#520049' }
                }]
            }, chartConfig);
            return;
        }
        
        const baseColors = displayCategories.map((category, i) => {
            if (mechanismColorMap && mechanismColorMap[category]) {
                return mechanismColorMap[category];
            }
            return morandiColors[i % morandiColors.length];
        });

        const trace = {
            labels: displayCategories,
            values: displayValues,
            type: 'pie',
            hole: 0.4,
            pull: displayCategories.map((category, i) =>
                isFiltered[i] ? highlightConfig.pie.selectedOffset : 0
            ),
            marker: {
                colors: displayCategories.map((category, i) => {
                    // 如果该机制被选中，使用高亮效果（白色填充 + 原色边框）
                    if (isFiltered[i]) {
                        return '#fff';
                    }
                    return baseColors[i];
                }),
                line: {
                    color: displayCategories.map((category, i) => {
                        if (isFiltered[i]) {
                            return baseColors[i];
                        }
                        return 'white';
                    }),
                    width: displayCategories.map((category, i) => {
                        if (isFiltered[i]) {
                            return highlightConfig.pie.borderWidth;
                        }
                        return 1;
                    })
                }
            },
            textinfo: 'none',
            hoverinfo: 'label+value+percent',
            hovertemplate: '<b>%{label}</b><br>Count: %{value}<br>Percentage: %{percent}<br><i>Click to filter</i><extra></extra>',
            hoverlabel: {
                bgcolor: 'white',
                bordercolor: morandiHighlight,
                font: { size: 12, color: '#333' },
                align: 'left'
            },
            opacity: displayCategories.map((category, i) => {
                if (hasCategoryFilter && !isFiltered[i]) {
                    return 0.6; // 未选中的区间半透明
                }
                return 1.0; // 选中的区间完全不透明
            })
        };
        
        const layout = {
            ...chartLayoutBase,
            margin: { l: 20, r: 120, t: 20, b: 20 },
            showlegend: true,
            legend: {
                orientation: 'v',
                x: 1.02,
                y: 0.5,
                xanchor: 'left',
                yanchor: 'middle',
                bgcolor: 'rgba(255,255,255,0.8)',
                bordercolor: 'rgba(0,0,0,0.1)',
                borderwidth: 1,
                font: {
                    size: 10,
                    color: '#333'
                }
            },
            hovermode: 'closest',
            title: hasAnyFilter ? {
                font: { size: 14, color: '#520049' }
            } : null
        };
        
        // 为饼图使用专用配置，确保使用Plotly原生tooltip
        const pieChartConfig = {
            ...chartConfig,
            displayModeBar: false,
            responsive: true,
            // 禁用自定义tooltip
            modeBarButtonsToRemove: ['toImage', 'sendDataToCloud'],
            // 使用原生悬停
            interaction: {
                mode: 'hover',
                intersect: true
            }
        };
        
        Plotly.newPlot('ligandChart', [trace], layout, pieChartConfig);

        document.getElementById('ligandChart').on('plotly_click', function(data) {
            const category = data.points[0].label;
            FilterModule.toggleCategoryFilter(category);
        });
    };

    // --- 覆写 ChartModule.createAllCharts：仅生成年份和类别图 ---
    ChartModule.createAllCharts = function () {
        try {
            console.log("[Fluor] 创建年份及类别图表，无散点图...");
            this.createYearChart();
            this.createCategoryChart();
            console.log("[Fluor] 图表创建完成");
        } catch (error) {
            console.error("[Fluor] 创建图表时发生错误:", error);
        }
    };

    // --- 覆写 FilterModule.updateNodeStateIndicators：忽略散点图 ---
    if (typeof FilterModule !== 'undefined') {
        const originalUpdateNodeStateIndicators = FilterModule.updateNodeStateIndicators;
        FilterModule.updateNodeStateIndicators = function () {
            // 年份图状态
            const yearChartEl = document.querySelector('#yearChart');
            const ligandChartEl = document.querySelector('#ligandChart');
            if (!yearChartEl || !ligandChartEl) {
                return; // 元素缺失时直接返回
            }
            const yearChartHeader = yearChartEl.closest('.chart-wrapper').querySelector('.chart-header');
            const ligandChartHeader = ligandChartEl.closest('.chart-wrapper').querySelector('.chart-header');

            const yearStateIndicator = yearChartHeader.querySelector('.node-state-indicator') || document.createElement('div');
            yearStateIndicator.className = 'node-state-indicator';
            const ligandStateIndicator = ligandChartHeader.querySelector('.node-state-indicator') || document.createElement('div');
            ligandStateIndicator.className = 'node-state-indicator';

            // 清除状态
            yearStateIndicator.textContent = '';
            ligandStateIndicator.textContent = '';

            // 根据交互顺序填充状态（仅 A/B 两层）
            nodeInteractionOrder.forEach((nodeId, index) => {
                const stateText = index === 0 ? 'Node A' : 'Node B';
                if (nodeId === 'yearChart') {
                    yearStateIndicator.textContent = stateText;
                    yearStateIndicator.style.backgroundColor = '#520049';
                } else if (nodeId === 'ligandChart') {
                    ligandStateIndicator.textContent = stateText;
                    ligandStateIndicator.style.backgroundColor = '#520049';
                }
            });

            // 附加到 DOM
            if (!yearChartHeader.querySelector('.node-state-indicator')) {
                yearChartHeader.appendChild(yearStateIndicator);
            }
            if (!ligandChartHeader.querySelector('.node-state-indicator')) {
                ligandChartHeader.appendChild(ligandStateIndicator);
            }
        };

        // 覆写筛选条件切换方法，增加自动重置检测
        const originalToggleYearFilter = FilterModule.toggleYearFilter;
        FilterModule.toggleYearFilter = function(year) {
            console.log('[Fluorescence] 切换年份筛选:', year);
            
            if (activeFilters.years.has(year)) {
                activeFilters.years.delete(year);
            } else {
                activeFilters.years.add(year);
            }
            
            // 检查是否所有筛选条件都为空，如果是则自动重置
            if (this.shouldAutoReset()) {
                console.log('[Fluorescence] 检测到所有筛选条件已清空，自动重置节点状态');
                resetAllFilters();
                return;
            }
            
            // 注册节点交互
            this.registerNodeInteraction('yearChart');
        };
        
        const originalToggleCategoryFilter = FilterModule.toggleCategoryFilter;
        FilterModule.toggleCategoryFilter = function(category) {
            console.log('[Fluorescence] 切换机制筛选:', category);
            
            if (activeFilters.categories.has(category)) {
                activeFilters.categories.delete(category);
            } else {
                activeFilters.categories.add(category);
            }
            
            // 检查是否所有筛选条件都为空，如果是则自动重置
            if (this.shouldAutoReset()) {
                console.log('[Fluorescence] 检测到所有筛选条件已清空，自动重置节点状态');
                resetAllFilters();
                return;
            }
            
            // 注册节点交互
            this.registerNodeInteraction('ligandChart');
        };
        
        // 覆写筛选标签更新逻辑以显示节点等级
        const originalUpdateFilterTags = FilterModule.updateFilterTags;
        FilterModule.updateFilterTags = function () {
            const tagsContainer = document.getElementById('filterTags');
            if (!tagsContainer) return;
            tagsContainer.innerHTML = '';

            // 年份颜色映射
            const allYears = [...new Set(originalData.map(d => d.year))].sort();
            const yearColorMap = {};
            allYears.forEach((year, i) => {
                yearColorMap[year] = morandiColors[i % morandiColors.length];
            });

            // 机制颜色映射
            const categoryColorMap = { ...mechanismColorMap };
            const allCategories = [...new Set(originalData.map(d => d.category))];
            allCategories.forEach((cat, i) => {
                if (!categoryColorMap[cat]) {
                    categoryColorMap[cat] = morandiColors[i % morandiColors.length];
                }
            });

            // 年份标签
            activeFilters.years.forEach(year => {
                const tag = createFilterTag(`Year: ${year}`, () => this.toggleYearFilter(year), yearColorMap[year], 'yearChart');
                tagsContainer.appendChild(tag);
            });

            // 机制标签
            activeFilters.categories.forEach(category => {
                const tag = createFilterTag(`Mechanism: ${category}`, () => this.toggleCategoryFilter(category), categoryColorMap[category], 'ligandChart');
                tagsContainer.appendChild(tag);
            });

            const hasActiveFilters = activeFilters.years.size > 0 || activeFilters.categories.size > 0;
            const filterSection = document.querySelector('.filter-controls');
            if (filterSection) filterSection.style.display = hasActiveFilters ? 'block' : 'none';

            const resetBtn = document.getElementById('resetAllFilters');
            if (resetBtn) {
                const count = (activeFilters.years.size > 0 ? 1 : 0) + (activeFilters.categories.size > 0 ? 1 : 0);
                resetBtn.textContent = `Reset All (${count})`;
                resetBtn.disabled = !hasActiveFilters;
                resetBtn.style.opacity = hasActiveFilters ? '1' : '0.5';
            }

            this.updateNodeStateIndicators();
        };
    }

    // --- 覆写导出功能：确保fluorescence页面导出与表格显示一致 ---
    window.exportData = function() {
        // 获取当前的filteredData - 从全局作用域或者尝试多种方式获取
        let currentData = null;
        if (typeof filteredData !== 'undefined' && filteredData && filteredData.length > 0) {
            currentData = filteredData;
        } else if (typeof originalData !== 'undefined' && originalData && originalData.length > 0) {
            currentData = originalData;
        } else if (typeof window.filteredData !== 'undefined' && window.filteredData && window.filteredData.length > 0) {
            currentData = window.filteredData;
        } else if (typeof window.originalData !== 'undefined' && window.originalData && window.originalData.length > 0) {
            currentData = window.originalData;
        }
        
        // 检查是否有数据可导出
        if (!currentData || currentData.length === 0) {
            alert("暂无数据可导出。请检查数据是否已加载。");
            console.error('Export failed: No data available');
            return;
        }
        
        console.log(`准备导出 ${currentData.length} 条荧光数据`);
        
        // 创建CSV内容 - 严格按照fluorescence表格显示的列来导出
        const csvRows = [];
        
        // 标题行 - 导出专用（比表格显示多一列PubMed Link）
        const headers = [
            'No.',
            'Aptamer name',
            'Ligand',
            'Year',
            'PubMed Link',
            'Mechanisms',
            'Sequence (5\'-3\')',
            'Citation',
            'Relevant 3D structures'
        ];
        csvRows.push(headers.map(h => `"${h}"`).join(','));
        
        // 数据行 - 严格按照fluorescence表格逻辑处理
        currentData.forEach((item, index) => {
            // Debug: 检查每个item的内容
            if (index === 0) {
                console.log('第一条记录的字段:', Object.keys(item));
                console.log('第一条记录的内容:', item);
            }
            
            // 1. No. - 行号
            const no = index + 1;
            
            // 2. Aptamer name - 去除HTML标签
            const aptamerName = (item.name || 'N/A').toString().replace(/<[^>]*>/g, '');
            
            // 3. Ligand - 取第一个逗号前的部分
            const ligandRaw = item.ligand || '';
            const ligand = ligandRaw ? ligandRaw.split(',')[0].trim() : 'N/A';
            
            // 4. Year - 去除HTML标签
            const year = (item.year || 'N/A').toString().replace(/<[^>]*>/g, '');
            
            // 5. PubMed Link - 提取PubMed链接（仅在导出中包含，网页表格中不显示）
            const pubmedLink = (item.pubmed_link || 'N/A').toString().replace(/<[^>]*>/g, '');
            
            // 6. Mechanisms
            const mechanisms = (item.mechanisms || 'N/A').toString().replace(/<[^>]*>/g, '');
            
            // 7. Sequence (5'-3') - 使用完整序列
            const sequence = (item.sequence || 'N/A').toString().replace(/<[^>]*>/g, '');
            
            // 8. Citation - 使用完整引用
            const citation = (item.citation || 'N/A').toString().replace(/<[^>]*>/g, '');
            
            // 9. Relevant 3D structures - 使用完整结构信息
            const structures = (item.structures || 'N/A').toString().replace(/<[^>]*>/g, '');
            
            // 构建行数据
            const rowData = [no, aptamerName, ligand, year, pubmedLink, mechanisms, sequence, citation, structures];
            const csvRow = rowData.map(val => {
                const strVal = String(val).replace(/"/g, '""'); // 转义双引号
                return `"${strVal}"`;
            }).join(',');
            
            csvRows.push(csvRow);
        });
        
        // 创建CSV内容
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        
        // 创建下载链接
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `fluorescence_export_${currentData.length}_rows.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`✅ 已导出荧光页面数据 ${currentData.length} 条记录，包含 ${headers.length} 个字段（表格显示8列，导出增加PubMed Link列）`);
    };

    // --- 确保覆盖在页面完全加载后生效 ---
    // 延迟执行，确保所有模块都已加载
    setTimeout(() => {
        console.log('[Fluorescence] 延迟检查和强制应用表格覆盖');
        
        // 检查当前表格渲染函数是否被正确覆盖
        if (typeof TableModule !== 'undefined' && typeof TableModule.updateDataTable === 'function') {
            console.log('[Fluorescence] TableModule.updateDataTable 函数存在，强制更新表格');
            
            // 如果数据已加载，立即更新表格
            if (typeof filteredData !== 'undefined' && filteredData && filteredData.length > 0) {
                console.log('[Fluorescence] 数据已加载，立即应用荧光表格渲染（8列，PubMed Link仅在导出时包含）');
                TableModule.updateDataTable();
            }
        } else {
            console.warn('[Fluorescence] TableModule.updateDataTable 函数不存在或未被正确覆盖');
        }
    }, 1000); // 延迟1秒执行

    console.log('dashboard-fluor.js 补丁已应用');
})(); 