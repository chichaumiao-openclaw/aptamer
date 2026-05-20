// dashboard-structures.js - 针对结构页面(structure.html)的 Dashboard 补丁脚本
// 仅在该页面中引入，以避免影响其它页面的默认行为
// 主要功能：
// 1. 在数据加载阶段，把每条记录的 "Structure Determination" 字段映射为 year 图表
// 2. 把 "Phase Determination" 字段映射为 category，复用原有类别图逻辑
// 3. 重写 TableModule.updateDataTable，使其列顺序与结构页面一致
// 4. 其他页面继续使用原版 dashboard-main.js，不受影响

(function () {
    if (typeof DataModule === 'undefined') {
        console.error('DataModule 未定义，dashboard-structures.js 无法应用补丁');
        return;
    }

    // 全局存储相位确定策略的颜色映射，确保标签与饼图颜色一致
    let phaseColorMap = {};

    // --- 重写 DataModule.loadData ---
    const originalLoadData = DataModule.loadData;
    DataModule.loadData = async function () {
        try {
            const dataPath = window.DASHBOARD_CONFIG?.dataPath || './apidata/structures_merged.json';
            const response = await fetch(dataPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // 处理结构数据的字段映射
            data.forEach(d => {
                // 映射必要字段
                d.name = d.Name;
                d.ligand = d.Ligand;
                
                // 处理NDB字段，可能是字符串、对象或成对字段
                if (d.NDB && typeof d.NDB === 'object') {
                    d.ndb = d.NDB.id;
                    d.ndbUrl = d.NDB.url;
                } else if (d.NDB && typeof d.NDB === 'string') {
                    // 2) NDB 为字符串，可能形如 "ID1,ID2: url" 或 "ID1 ID2 : url"
                    const parts = d.NDB.split(':');
                    if (parts.length >= 2) {
                        d.ndb = parts[0].trim();
                        d.ndbUrl = parts.slice(1).join(':').trim();
                    } else {
                        d.ndb = d.NDB.trim();
                        const firstId = d.ndb.split(/[ ,]+/)[0];
                        if (firstId && firstId !== 'NA') {
                            d.ndbUrl = `https://www.rcsb.org/structure/${firstId}`;
                        }
                    }
                } else if (d['NDB_text']) {
                    // 3) 分离字段形式 NDB_text / NDB_url
                    d.ndb = d['NDB_text'];
                    d.ndbUrl = d['NDB_url'];
                }
                
                d.resolution = d['Resolution(Å)'];
                
                // 确保站内链接字段存在
                if (d.AptamerLinker) {
                    d.internal_url = d.AptamerLinker;
                }
                if (!d.internal_url) {
                    // 如果没有提供内部链接，创建一个基于Name的默认链接
                    const slugName = d.Name.toLowerCase()
                        .replace(/[\s-]+/g, '-')
                        .replace(/[^\w-]/g, '');
                    d.internal_url = `/aptamers/${slugName}`;
                }

                // ---- 处理 PubMed 映射，方便后续快速链接 ----
                d.pubmedMap = {};
                for (let i = 1; i <= 4; i++) {
                    // 3.1 字符串形式，如 "2022: https://pubmed..."
                    const combined = d[`Pubmed${i}`];
                    if (combined && typeof combined === 'string') {
                        const [yearPart, urlPart] = combined.split(':');
                        if (urlPart) {
                            const yrDigits = (yearPart.match(/\d{4}/) || [])[0];
                            if (yrDigits) d.pubmedMap[yrDigits] = urlPart.trim();
                        }
                    }

                    // 3.2 分离字段形式 Pubmed1_text / Pubmed1_url
                    const textField = d[`Pubmed${i}_text`];
                    const urlField = d[`Pubmed${i}_url`];
                    if (textField && urlField) {
                        const yrDigits = (textField.toString().match(/\d{4}/) || [])[0];
                        if (yrDigits) d.pubmedMap[yrDigits] = urlField;
                    }
                }
            });

            // 保存到全局数据
            originalData = data;
            filteredData = [...data];

            // 预生成相位确定策略的颜色映射，保持标签与图表颜色一致
            const allPhases = [...new Set(data.map(d => d['Phase Determination'] || 'Unknown'))].sort();
            phaseColorMap = {};
            allPhases.forEach((phase, i) => {
                phaseColorMap[phase] = morandiColors[i % morandiColors.length];
            });

            console.log('Structure data loaded successfully, total', data.length, 'records');

            // 初始化各模块
            this.updateStatistics();
            ChartModule.createAllCharts();
            UIModule.updateDataSummary();
            FilterModule.updateFilterTags();
            TableModule.updateDataTable();
        } catch (error) {
            console.error('Structure data loading failed:', error);
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

            // 辅助函数：tooltip - 使用clientX/clientY坐标，支持智能定位
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
                row.style.whiteSpace = 'normal';

                // 第一列：序号
                const indexCell = document.createElement('td');
                indexCell.textContent = index + 1;
                row.appendChild(indexCell);
                
                // Name 列 - 使用 Name 字段，加上站内链接
                const nameCell = document.createElement('td');
                const nameLink = document.createElement('a');
                const nameFull = item.Name || '';
                const nameDisplay = nameFull.length > 25 ? nameFull.substring(0, 25) + '...' : nameFull;
                nameLink.href = item.internal_url || '#';
                nameLink.style.color = '#520049';
                nameLink.style.textDecoration = 'none';
                nameLink.style.borderBottom = '1px dashed #520049';
                nameLink.style.transition = 'all 0.2s ease';
                nameLink.onmouseover = function() { this.style.color = '#880074'; };
                nameLink.onmouseout = function() { this.style.color = '#520049'; };
                nameLink.textContent = nameDisplay;
                nameCell.appendChild(nameLink);
                row.appendChild(nameCell);

                // Ligand 列 - 截取前20个字符
                const ligandCell = document.createElement('td');
                const ligandFull = item.Ligand || '';
                ligandCell.textContent = ligandFull.length > 20 ? ligandFull.substring(0, 20) + '...' : ligandFull;
                row.appendChild(ligandCell);
                
                // Structure determination 列
                const structCell = document.createElement('td');
                structCell.textContent = item['Structure Determination'] || '';
                row.appendChild(structCell);

                // NDB 列 - 带链接，截取前15个字符
                const ndbCell = document.createElement('td');
                let ndbFull = '';
                
                if (item.ndb) {
                    ndbFull = item.ndb;
                    const ndbDisplayText = ndbFull.length > 15 ? ndbFull.substring(0, 15) + '...' : ndbFull;
                    if (item.ndbUrl) {
                        const ndbLink = document.createElement('a');
                        ndbLink.href = item.ndbUrl;
                        ndbLink.textContent = ndbDisplayText;
                        ndbLink.style.color = '#520049';
                        ndbLink.style.textDecoration = 'none';
                        ndbLink.style.borderBottom = '1px dashed #520049';
                        ndbLink.target = '_blank';
                        ndbCell.appendChild(ndbLink);
                    } else {
                        ndbCell.textContent = ndbDisplayText;
                    }
                }
                row.appendChild(ndbCell);

                // Phase determination 列 - 截取前25个字符
                const phaseCell = document.createElement('td');
                const phaseFull = item['Phase Determination'] || '';
                phaseCell.textContent = phaseFull.length > 25 ? phaseFull.substring(0, 25) + '...' : phaseFull;
                row.appendChild(phaseCell);

                // Resolution 列（支持多值，每个值tooltip显示对应NDB）
                const resolutionCell = document.createElement('td');
                const resStr = (item['Resolution(Å)'] || '').toString();
                if (resStr) {
                    const trimmed = resStr.trim();
                    if (trimmed.toUpperCase() === 'NA') {
                        // 直接显示NA，不做拆分，也不绑定tooltip
                        resolutionCell.textContent = trimmed;
                    } else {
                        const resParts = trimmed.split(/[ ,]+/).map(s => s.trim()).filter(s => s);
                        const ndbParts = (item.ndb || '').split(/[ ,]+/).map(s => s.trim()).filter(s => s);
                        resParts.forEach((resVal, rIdx) => {
                            const span = document.createElement('span');
                            span.textContent = resVal;
                            if (ndbParts[rIdx] && resVal.toUpperCase() !== 'NA') {
                                addTooltip(span, `NDB ID: ${ndbParts[rIdx]}`);
                            }
                            resolutionCell.appendChild(span);
                            if (rIdx < resParts.length - 1) {
                                resolutionCell.appendChild(document.createTextNode(', '));
                            }
                        });
                    }
                }
                row.appendChild(resolutionCell);

                // Year 列 - 显示为PubMed链接
                const yearCell = document.createElement('td');
                const yearStr = (item.Year || '').toString();
                if (yearStr) {
                    const yearParts = yearStr.split(',').map(s => s.trim()).filter(s => s);
                    const pubmedMap = item.pubmedMap || {};
                    
                    yearParts.forEach((yr, idx) => {
                        if (pubmedMap[yr]) {
                            // 如果该年份有对应的PubMed链接，创建链接
                            const yearLink = document.createElement('a');
                            yearLink.href = pubmedMap[yr];
                            yearLink.target = '_blank';
                            yearLink.textContent = yr;
                            yearLink.style.color = '#520049';
                            yearLink.style.textDecoration = 'none';
                            yearCell.appendChild(yearLink);
                        } else {
                            // 没有链接就显示普通文本
                            yearCell.appendChild(document.createTextNode(yr));
                        }
                        
                        if (idx < yearParts.length - 1) {
                            yearCell.appendChild(document.createTextNode(', '));
                        }
                    });
                }
                row.appendChild(yearCell);
                
                // 注意：PubMed Link列在导出时单独处理，表格显示中不包含（保持界面简洁）
                
                tableBody.appendChild(row);

                // 添加 tooltip
                addTooltip(ligandCell, ligandFull);
                if (nameFull.length > 25) {
                    addTooltip(nameCell, nameFull);
                }
                if (ndbFull && ndbFull.length > 15) {
                    addTooltip(ndbCell, ndbFull);
                }
                if (phaseFull && phaseFull.length > 25) {
                    addTooltip(phaseCell, phaseFull);
                }
            });
        };
    }

    // --- 重写统计数据更新功能 ---
    const originalUpdateStatistics = DataModule.updateStatistics;
    DataModule.updateStatistics = function() {
        if (!originalData || originalData.length === 0) {
            return;
        }

        if (!filteredData) {
            return;
        }

        const ligands = [...new Set(filteredData.map(d => d.ligand))];
        const structures = [...new Set(filteredData.map(d => d['Structure Determination']).filter(s => s))];

        const totalAptamersEl = document.getElementById('totalAptamers');
        const uniqueLigandsEl = document.getElementById('uniqueLigands');
        const yearSpanEl = document.getElementById('yearSpan');
        const avgGCEl = document.getElementById('avgGC');

        if (totalAptamersEl) totalAptamersEl.textContent = filteredData.length;
        if (uniqueLigandsEl) uniqueLigandsEl.textContent = ligands.length;
        if (yearSpanEl) {
            yearSpanEl.textContent = structures.length + ' methods';
        }
        if (avgGCEl) {
            // 统计有分辨率数据的结构数量
            const validResData = filteredData.filter(d => 
                d['Resolution(Å)'] && d['Resolution(Å)'] !== 'NA' && d['Resolution(Å)'] !== ''
            );
            avgGCEl.textContent = validResData.length + ' with resolution';
        }
    };

    // --- 覆写 ChartModule：重写两个图表创建函数 ---
    
    // 重写年份图表为结构确定方法图表
    ChartModule.createYearChart = function () {
        console.log("[Structure] 创建结构确定方法图表...");
        
        // 获取所有可能的结构确定方法（基于原始数据）
        const allMethodCounts = {};
        originalData.forEach(d => {
            const method = d['Structure Determination'] || 'Unknown';
            allMethodCounts[method] = (allMethodCounts[method] || 0) + 1;
        });
        const allMethods = Object.keys(allMethodCounts).sort();
        
        // 确定数据源
        let dataForVisualization = [];
        if (nodeInteractionOrder.length === 0) {
            dataForVisualization = [...originalData];
        } else {
            const myIndex = nodeInteractionOrder.indexOf('yearChart');
            if (myIndex === -1) {
                const lastNodeId = nodeInteractionOrder[nodeInteractionOrder.length - 1];
                dataForVisualization = [...nodeFilteredData[lastNodeId]];
            } else if (myIndex === 0) {
                dataForVisualization = [...originalData];
            } else {
                const parentNodeId = nodeInteractionOrder[myIndex - 1];
                dataForVisualization = [...nodeFilteredData[parentNodeId]];
            }
        }
        
        // 计算可视化数据的方法分布
        let visualizationMethodCounts = {};
        dataForVisualization.forEach(d => {
            const method = d['Structure Determination'] || 'Unknown';
            visualizationMethodCounts[method] = (visualizationMethodCounts[method] || 0) + 1;
        });
        
        // 检查当前是否有筛选
        const hasMethodFilter = activeFilters.years.size > 0;
        const hasAnyFilter = nodeInteractionOrder.length > 0;
        
        // 创建柱状图
        const baseColors = allMethods.map((method, i) => morandiColors[i % morandiColors.length]);
        const trace = {
            x: allMethods,
            y: allMethods.map(method => visualizationMethodCounts[method] || 0),
            type: 'bar',
            width: allMethods.map(method =>
                hasMethodFilter && activeFilters.years.has(method)
                    ? highlightConfig.bar.selectedWidth
                    : highlightConfig.bar.defaultWidth
            ),
            marker: {
                color: allMethods.map((method, i) => {
                    if (hasMethodFilter && activeFilters.years.has(method)) {
                        return '#fff';
                    }
                    if (hasAnyFilter && (!visualizationMethodCounts[method] || visualizationMethodCounts[method] === 0)) {
                        return morandiDim;
                    }
                    return baseColors[i];
                }),
                opacity: 1.0,
                line: {
                    width: allMethods.map(method => {
                        if (hasMethodFilter && activeFilters.years.has(method)) {
                            return highlightConfig.bar.borderWidth;
                        }
                        return 1;
                    }),
                    color: allMethods.map((method, i) => {
                        if (hasMethodFilter && activeFilters.years.has(method)) {
                            return baseColors[i];
                        }
                        return 'white';
                    })
                }
            },
            hovertemplate: '<b>Method: %{x}</b><br>' + 
                          'Count: %{y}<br>' +
                          'Click for multi-select filter<extra></extra>',
            hoverlabel: { bgcolor: 'white', bordercolor: morandiHighlight }
        };
        
        const layout = {
            ...chartLayoutBase,
            margin: { l: 60, r: 20, t: 30, b: 80 },
            xaxis: {
                title: 'Structure Determination Method',
                titlefont: { size: 12, color: '#555' },
                tickfont: { size: 10, color: '#555' },
                gridcolor: 'rgba(0,0,0,0.1)',
                showgrid: true,
                tickangle: -45
            },
            yaxis: {
                title: 'Count',
                titlefont: { size: 12, color: '#555' },
                tickfont: { size: 10, color: '#555' },
                gridcolor: 'rgba(0,0,0,0.1)',
                showgrid: true
            }
        };
        
        Plotly.newPlot('yearChart', [trace], layout, chartConfig);
        
        document.getElementById('yearChart').on('plotly_click', function(data) {
            const method = data.points[0].x;
            FilterModule.toggleYearFilter(method);
        });
    };
    
    // 重写类别图表为相位确定策略图表
    ChartModule.createCategoryChart = function () {
        console.log("[Structure] 创建相位确定策略图表...");
        
        // 获取所有可能的相位确定策略（基于原始数据）
        const allPhaseCounts = {};
        originalData.forEach(d => {
            const phase = d['Phase Determination'] || 'Unknown';
            allPhaseCounts[phase] = (allPhaseCounts[phase] || 0) + 1;
        });
        const allPhases = Object.keys(allPhaseCounts).sort();
        
        // 确定数据源
        let dataForVisualization = [];
        if (nodeInteractionOrder.length === 0) {
            dataForVisualization = [...originalData];
        } else {
            const myIndex = nodeInteractionOrder.indexOf('ligandChart');
            if (myIndex === -1) {
                const lastNodeId = nodeInteractionOrder[nodeInteractionOrder.length - 1];
                dataForVisualization = [...nodeFilteredData[lastNodeId]];
            } else if (myIndex === 0) {
                dataForVisualization = [...originalData];
            } else {
                const parentNodeId = nodeInteractionOrder[myIndex - 1];
                dataForVisualization = [...nodeFilteredData[parentNodeId]];
            }
        }
        
        // 计算可视化数据的相位分布
        const visualizationPhaseCounts = {};
        dataForVisualization.forEach(d => {
            const phase = d['Phase Determination'] || 'Unknown';
            visualizationPhaseCounts[phase] = (visualizationPhaseCounts[phase] || 0) + 1;
        });
        
        // 检查是否有相位筛选
        const hasPhaseFilter = activeFilters.categories.size > 0;
        const hasAnyFilter = nodeInteractionOrder.length > 0;
        
        // 创建饼图数据
        const pieData = allPhases.map(phase => {
            const value = visualizationPhaseCounts[phase] || 0;
            return {
                phase: phase,
                count: value,
                isFiltered: hasPhaseFilter && activeFilters.categories.has(phase)
            };
        });
        
        // 只显示有数据的相位
        const displayPhases = pieData.filter(d => d.count > 0).map(d => d.phase);
        const displayValues = pieData.filter(d => d.count > 0).map(d => d.count);
        const isFiltered = pieData.filter(d => d.count > 0).map(d => d.isFiltered);
        
        if (displayPhases.length === 0) {
            Plotly.newPlot('ligandChart', [], {
                ...chartLayoutBase,
                margin: { l: 20, r: 20, t: 20, b: 20 },
                annotations: [{
                    text: 'No phase determination data',
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
        
        const trace = {
            labels: displayPhases,
            values: displayValues,
            type: 'pie',
            hole: 0.4,
            pull: displayPhases.map((phase, i) =>
                isFiltered[i] ? highlightConfig.pie.selectedOffset : 0
            ),
            marker: {
                colors: displayPhases.map((phase, i) => {
                    if (isFiltered[i]) {
                        return '#fff';
                    }
                    return phaseColorMap[phase];
                }),
                line: {
                    color: displayPhases.map((phase, i) => {
                        if (isFiltered[i]) {
                            return phaseColorMap[phase];
                        }
                        return 'white';
                    }),
                    width: displayPhases.map((phase, i) => {
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
            }
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
            // 使用原生Plotly悬停模式
            hovermode: 'closest'
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
            const phase = data.points[0].label;
            FilterModule.toggleCategoryFilter(phase);
        });
    };

    // --- 覆写 ChartModule.createAllCharts：仅生成两个图表 ---
    ChartModule.createAllCharts = function () {
        try {
            console.log("[Structure] 创建结构确定方法及相位确定策略图表...");
            this.createYearChart();
            this.createCategoryChart();
            console.log("[Structure] 图表创建完成");
        } catch (error) {
            console.error("[Structure] 创建图表时发生错误:", error);
        }
    };

    // --- 覆写 FilterModule.updateNodeStateIndicators：只处理两个图表 ---
    if (typeof FilterModule !== 'undefined') {
        const originalUpdateNodeStateIndicators = FilterModule.updateNodeStateIndicators;
        FilterModule.updateNodeStateIndicators = function () {
            const yearChartEl = document.querySelector('#yearChart');
            const ligandChartEl = document.querySelector('#ligandChart');
            if (!yearChartEl || !ligandChartEl) {
                return;
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
    }

    // --- 覆写FilterModule.calculateSpecificNodeData：处理结构数据的特殊字段 ---
    const originalCalculateSpecificNodeData = FilterModule.calculateSpecificNodeData;
    FilterModule.calculateSpecificNodeData = function(nodeId) {
        console.log(`[Structure] 计算节点 ${nodeId} 的最新数据`);
        
        // 根据节点类型和筛选条件计算数据
        if (nodeId === 'yearChart' && activeFilters.years.size > 0) {
            // 结构确定方法筛选 - 基于 Structure Determination 字段
            nodeFilteredData[nodeId] = originalData.filter(d => 
                activeFilters.years.has(d['Structure Determination'])
            );
            console.log(`更新 ${nodeId} 节点数据: ${nodeFilteredData[nodeId].length} 条记录`);
        } else if (nodeId === 'ligandChart' && activeFilters.categories.size > 0) {
            // 相位确定策略筛选 - 基于 Phase Determination 字段
            nodeFilteredData[nodeId] = originalData.filter(d => 
                activeFilters.categories.has(d['Phase Determination'])
            );
            console.log(`更新 ${nodeId} 节点数据: ${nodeFilteredData[nodeId].length} 条记录`);
        } else {
            // 如果该节点没有应用筛选条件，使用原始数据
            nodeFilteredData[nodeId] = [...originalData];
        }
    };

    // --- 覆写FilterModule.calculateNodeData：处理结构数据的层级筛选 ---
    const originalCalculateNodeData = FilterModule.calculateNodeData;
    FilterModule.calculateNodeData = function() {
        // 首先保存当前冻结节点的数据
        const frozenNodesData = {};
        for (const nodeId in nodeFrozenState) {
            if (nodeFrozenState[nodeId]) {
                frozenNodesData[nodeId] = [...nodeFilteredData[nodeId]];
            }
        }
        
        // 重置未冻结节点的数据
        for (const nodeId in nodeFilteredData) {
            if (!nodeFrozenState[nodeId]) {
                nodeFilteredData[nodeId] = [];
            }
        }
        
        // 如果没有交互，所有节点使用原始数据
        if (nodeInteractionOrder.length === 0) {
            for (const nodeId in nodeFilteredData) {
                nodeFilteredData[nodeId] = [...originalData];
            }
            return;
        }
        
        // 恢复冻结节点的数据
        for (const nodeId in frozenNodesData) {
            nodeFilteredData[nodeId] = [...frozenNodesData[nodeId]];
        }
        
        // 如果交互序列中只有一个节点(A节点)
        if (nodeInteractionOrder.length === 1) {
            const firstNodeId = nodeInteractionOrder[0];
            const firstNodeData = nodeFilteredData[firstNodeId];
            console.log(`[Structure] 只有A节点(${firstNodeId})，数据量: ${firstNodeData.length}`);
            
            // 非交互节点使用A节点的筛选结果
            for (const nodeId in nodeFilteredData) {
                if (nodeId !== firstNodeId && !nodeFrozenState[nodeId]) {
                    nodeFilteredData[nodeId] = [...firstNodeData];
                    console.log(`[Structure] 节点${nodeId}使用A节点数据: ${nodeFilteredData[nodeId].length}`);
                }
            }
            return;
        }
        
        // 处理多节点交互情况
        nodeInteractionOrder.forEach((interactedNodeId, index) => {
            if (index === 0) return; // 跳过A节点，A节点已经计算过了
            
            // 根据层级关系决定使用哪个上级节点的数据
            const parentNodeId = nodeInteractionOrder[index - 1];
            const parentNodeData = nodeFilteredData[parentNodeId];
            
            // 根据当前节点的筛选条件过滤上级节点数据
            if (interactedNodeId === 'yearChart' && activeFilters.years.size > 0) {
                // 基于上级节点数据进行结构确定方法筛选
                nodeFilteredData[interactedNodeId] = parentNodeData.filter(d => 
                    activeFilters.years.has(d['Structure Determination'])
                );
            } else if (interactedNodeId === 'ligandChart' && activeFilters.categories.size > 0) {
                // 基于上级节点数据进行相位确定策略筛选
                nodeFilteredData[interactedNodeId] = parentNodeData.filter(d => 
                    activeFilters.categories.has(d['Phase Determination'])
                );
            } else {
                // 如果没有应用筛选条件，使用上级节点数据
                nodeFilteredData[interactedNodeId] = [...parentNodeData];
            }
            
            console.log(`[Structure] ${String.fromCharCode(65 + index)}节点(${interactedNodeId})筛选后数据: ${nodeFilteredData[interactedNodeId].length}`);
        });
        
        // 剩余未交互节点使用最后一个交互节点的数据
        if (nodeInteractionOrder.length > 0) {
            const lastNodeId = nodeInteractionOrder[nodeInteractionOrder.length - 1];
            const lastNodeData = nodeFilteredData[lastNodeId];
            
            for (const nodeId in nodeFilteredData) {
                if (!nodeInteractionOrder.includes(nodeId) && !nodeFrozenState[nodeId]) {
                    nodeFilteredData[nodeId] = [...lastNodeData];
                    console.log(`[Structure] 未交互节点${nodeId}使用${lastNodeId}数据: ${nodeFilteredData[nodeId].length}`);
                }
            }
        }
        
        console.log("[Structure] 节点数据计算完成，交互顺序:", nodeInteractionOrder.join(" > "));
    };

    // --- 覆写FilterModule.applyFilters：处理结构数据的全局筛选 ---
    const originalApplyFilters = FilterModule.applyFilters;
    FilterModule.applyFilters = function() {
        console.log('[Structure] 应用筛选器 - 当前交互顺序:', nodeInteractionOrder.join(" > "));
        console.log('[Structure] 筛选条件 - 方法:', Array.from(activeFilters.years), '相位:', Array.from(activeFilters.categories));
        
        // 首先，基于所有筛选条件过滤原始数据
        const dataWithAllFilters = originalData.filter(d => {
            // 结构确定方法筛选
            if (activeFilters.years.size > 0 && !activeFilters.years.has(d['Structure Determination'])) {
                return false;
            }
            
            // 相位确定策略筛选
            if (activeFilters.categories.size > 0 && !activeFilters.categories.has(d['Phase Determination'])) {
                return false;
            }
            
            return true;
        });
        
        // 如果筛选后数据为空，但有筛选条件，给出警告
        if (dataWithAllFilters.length === 0 && 
            (activeFilters.years.size > 0 || activeFilters.categories.size > 0)) {
            console.warn('[Structure] 应用所有筛选条件后没有匹配数据');
        }
        
        // 根据节点层级计算每个节点的数据
        this.calculateNodeData();
        
        // 更新全局筛选后数据(用于表格和统计)
        filteredData = dataWithAllFilters.length > 0 ? dataWithAllFilters : [...originalData];
        
        console.log(`[Structure] 筛选后数据: ${filteredData.length}/${originalData.length} 条`);
        
        // 检查筛选后是否有数据
        if (filteredData.length === 0 && (activeFilters.years.size > 0 || activeFilters.categories.size > 0)) {
            console.warn('[Structure] 筛选后没有数据！');
            this.showNoDataWarning();
        } else {
            this.hideNoDataWarning();
        }
        
        // 更新所有图表和统计
        DataModule.updateStatistics();
        ChartModule.createAllCharts();
        UIModule.updateDataSummary();
        this.updateFilterTags();
        TableModule.updateDataTable();
    };

    // --- 仅限结构页面：覆写筛选条件切换方法，增加自动重置检测 ---
    if (typeof FilterModule !== 'undefined') {
        const originalToggleYearFilter = FilterModule.toggleYearFilter;
        FilterModule.toggleYearFilter = function(method) {
            console.log('[Structure] 切换结构确定方法筛选:', method);
            
            if (activeFilters.years.has(method)) {
                activeFilters.years.delete(method);
            } else {
                activeFilters.years.add(method);
            }
            
            // 检查是否所有筛选条件都为空，如果是则自动重置
            if (this.shouldAutoReset()) {
                console.log('[Structure] 检测到所有筛选条件已清空，自动重置节点状态');
                resetAllFilters();
                return;
            }
            
            // 注册节点交互
            this.registerNodeInteraction('yearChart');
        };
        
        const originalToggleCategoryFilter = FilterModule.toggleCategoryFilter;
        FilterModule.toggleCategoryFilter = function(phase) {
            console.log('[Structure] 切换相位确定策略筛选:', phase);
            
            if (activeFilters.categories.has(phase)) {
                activeFilters.categories.delete(phase);
            } else {
                activeFilters.categories.add(phase);
            }
            
            // 检查是否所有筛选条件都为空，如果是则自动重置
            if (this.shouldAutoReset()) {
                console.log('[Structure] 检测到所有筛选条件已清空，自动重置节点状态');
                resetAllFilters();
                return;
            }
            
            // 注册节点交互
            this.registerNodeInteraction('ligandChart');
        };
        
        // 重写 FilterModule.updateFilterTags，使年份标签显示为 "Methods:"
        const originalUpdateFilterTags = FilterModule.updateFilterTags;
        FilterModule.updateFilterTags = function() {
            const tagsContainer = document.getElementById('filterTags');
            if (!tagsContainer) {
                console.warn('filterTags 容器缺失');
                return;
            }
            tagsContainer.innerHTML = '';

            // 颜色映射
            // 使用结构确定方法和相位确定策略字段计算颜色映射，
            // 与图表中使用的颜色保持一致
            const allMethods = [...new Set(
                originalData.map(d => d['Structure Determination'] || 'Unknown')
            )].sort();
            const methodColorMap = {};
            allMethods.forEach((m, i) => {
                methodColorMap[m] = morandiColors[i % morandiColors.length];
            });

            // 将年份筛选标签前缀改为 Methods
            activeFilters.years.forEach(year => {
                const tag = createFilterTag(`Methods: ${year}`, () => this.toggleYearFilter(year), methodColorMap[year], 'yearChart');
                tagsContainer.appendChild(tag);
            });

            // 类别筛选标签使用预生成的相位颜色映射
            activeFilters.categories.forEach(category => {
                const tag = createFilterTag(`Category: ${category}`, () => this.toggleCategoryFilter(category), phaseColorMap[category], 'ligandChart');
                tagsContainer.appendChild(tag);
            });

            // 散点图筛选标签
            if (activeFilters.scatterSelection) {
                const sel = activeFilters.scatterSelection;
                const text = `Range: ${sel.xrange[0].toFixed(0)}-${sel.xrange[1].toFixed(0)}bp, ${sel.yrange[0].toFixed(1)}-${sel.yrange[1].toFixed(1)}%`;
                const tag = createFilterTag(text, () => this.clearScatterSelection(), morandiHighlight, 'scatterChart');
                tagsContainer.appendChild(tag);
            }

            // 显示/隐藏筛选控制区域，与原逻辑保持一致
            const hasActiveFilters = activeFilters.years.size > 0 || 
                                   activeFilters.categories.size > 0 || 
                                   activeFilters.scatterSelection;
            const filterSection = document.querySelector('.filter-controls');
            if (filterSection) {
                filterSection.style.display = hasActiveFilters ? 'block' : 'none';
            }

            // 更新 Reset 按钮状态
            const activeFilterCount = (activeFilters.years.size > 0 ? 1 : 0) + 
                                     (activeFilters.categories.size > 0 ? 1 : 0) + 
                                     (activeFilters.scatterSelection ? 1 : 0);
            const resetBtn = document.getElementById('resetAllFilters');
            if (resetBtn) {
                resetBtn.textContent = `Reset All (${activeFilterCount})`;
                resetBtn.disabled = !hasActiveFilters;
                resetBtn.style.opacity = hasActiveFilters ? '1' : '0.5';
            }

            // 保留节点状态指示器逻辑
            if (typeof this.updateNodeStateIndicators === 'function') {
                this.updateNodeStateIndicators();
            }
        };
    }

    // --- 覆写导出功能：确保structure页面导出与表格显示一致 ---
    if (typeof exportData !== 'undefined') {
        window.exportData = function() {
            // 检查是否有数据可导出
            if (!filteredData || filteredData.length === 0) {
                alert("暂无数据可导出。");
                return;
            }
            
            // 创建CSV内容 - 严格按照structure表格显示的列来导出
            const csvRows = [];
            
            // 标题行 - 导出专用（比表格显示多一列PubMed Link）
            const headers = [
                'No.',
                'Name',
                'Ligand',
                'Structure determination',
                'NDB',
                'Phase determination',
                'Resolution (Å)',
                'Year',
                'PubMed Link'
            ];
            csvRows.push(headers.map(h => `"${h}"`).join(','));
            
            // 数据行 - 严格按照structure表格逻辑处理
            filteredData.forEach((item, index) => {
                // 1. No. - 行号
                const no = index + 1;
                
                // 2. Name - 去除HTML标签
                const name = (item.Name || 'N/A').toString().replace(/<[^>]*>/g, '');
                
                // 3. Ligand - 去除HTML标签
                const ligand = (item.Ligand || 'N/A').toString().replace(/<[^>]*>/g, '');
                
                // 4. Structure determination
                const structureDetermination = (item['Structure Determination'] || 'N/A').toString().replace(/<[^>]*>/g, '');
                
                // 5. NDB - 去除HTML标签
                const ndb = (item.ndb || 'N/A').toString().replace(/<[^>]*>/g, '');
                
                // 6. Phase determination - 去除HTML标签
                const phaseDetermination = (item['Phase Determination'] || 'N/A').toString().replace(/<[^>]*>/g, '');
                
                // 7. Resolution (Å) - 去除HTML标签
                const resolution = (item['Resolution(Å)'] || 'N/A').toString().replace(/<[^>]*>/g, '');
                
                // 8. Year - 去除HTML标签
                const year = (item.Year || 'N/A').toString().replace(/<[^>]*>/g, '');
                
                // 9. PubMed Link - 提取PubMed链接（仅在导出中包含，网页表格中不显示）
                let pubmedLink = 'N/A';
                if (item.Year) {
                    const yearStr = item.Year.toString();
                    const yearParts = yearStr.split(',').map(s => s.trim()).filter(s => s);
                    const pubmedLinks = [];
                    
                    yearParts.forEach(yr => {
                        const yrDigits = (yr.match(/\d{4}/) || [])[0];
                        if (yrDigits && item.pubmedMap && item.pubmedMap[yrDigits]) {
                            pubmedLinks.push(item.pubmedMap[yrDigits]);
                        }
                    });
                    
                    if (pubmedLinks.length > 0) {
                        pubmedLink = pubmedLinks.join(', ');
                    }
                }
                
                // 构建行数据
                const rowData = [no, name, ligand, structureDetermination, ndb, phaseDetermination, resolution, year, pubmedLink];
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
            link.setAttribute("download", `structure_export_${filteredData.length}_rows.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log(`✅ 已导出结构页面数据 ${filteredData.length} 条记录，包含 ${headers.length} 个字段（表格显示8列，导出增加PubMed Link列）`);
        };
    }

    console.log('dashboard-structures.js 补丁已应用');
})();
