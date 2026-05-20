// Dashboard Aptamer - 为Aptamer页面提供的Dashboard补丁

// ====== Aptamer页面标识 ======
// 为aptamer页面添加标识，便于CSS选择器识别
if (window.location.pathname.includes('Ribocentre-aptamer')) {
    document.addEventListener('DOMContentLoaded', function() {
        document.body.setAttribute('data-page', 'aptamer');
        console.log('Aptamer页面：已设置页面标识，使用通用智能tooltip');
    });
}

// ====== 原有代码继续 ======

// 在全局范围内保存当前饼图的类型标签，供其他模块或调试使用
// 之前此变量只在 createTypeChart 内部声明，若其他地方意外引用会导致
// "displayTypes is not defined" 的报错。这里提升为模块级变量，并在
// createTypeChart 中更新它。
let displayTypes = [];

// 扩展DataModule.loadData方法，处理aptamer特有的数据字段
const originalLoadData = DataModule.loadData;
DataModule.loadData = async function() {
    try {
        // 使用全局配置中的数据路径
        const dataPath = window.DASHBOARD_CONFIG?.dataPath || './apidata/sequences_cleaned.json';
        const response = await fetch(dataPath);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseData = await response.json();
        
        // 处理 sequences_cleaned.json 的特殊结构
        // 数据可能存储在 Sheet1 字段下
        let processedData = [];
        if (responseData.Sheet1 && Array.isArray(responseData.Sheet1)) {
            // 如果数据在 Sheet1 键下
            processedData = responseData.Sheet1;
            console.log('从 Sheet1 字段读取数据');
        } else if (Array.isArray(responseData)) {
            // 如果直接是数组
            processedData = responseData;
            console.log('直接从响应中读取数组数据');
        } else {
            // 尝试其他可能的数据格式
            const possibleArrayField = Object.keys(responseData).find(
                key => Array.isArray(responseData[key]) && responseData[key].length > 0
            );
            
            if (possibleArrayField) {
                processedData = responseData[possibleArrayField];
                console.log(`从 ${possibleArrayField} 字段读取数据`);
            } else {
                console.warn('未找到有效的数据数组，使用空数组');
                processedData = [];
            }
        }
        
        // 确保数据中的字段兼容性，处理类型和大小写差异
        processedData = processedData.map(item => {
            // 确保基本字段存在
            const processedItem = { ...item };
            
            // 处理 year 和 Year 字段
            if (!processedItem.year && processedItem.Year) {
                processedItem.year = processedItem.Year;
            }
            
            // 处理 ligand 和 Ligand 字段
            if (!processedItem.ligand && processedItem.Ligand) {
                processedItem.ligand = processedItem.Ligand;
            }
            
            // 处理 category 和 Category 字段
            if (!processedItem.category && processedItem.Category) {
                processedItem.category = processedItem.Category;
            }
            
            // 处理 sequence 和 Sequence 字段
            if (!processedItem.sequence && processedItem.Sequence) {
                processedItem.sequence = processedItem.Sequence;
            }
            
            // 处理 length 和 Length 字段
            if (!processedItem.length && processedItem.Length) {
                processedItem.length = processedItem.Length;
            } else if (!processedItem.length && processedItem.sequence) {
                // 如果没有length字段但有sequence字段，计算序列长度
                processedItem.length = processedItem.sequence.length;
            }
            
            // 处理 gc_content 字段
            if (!processedItem.gc_content && processedItem['GC Content']) {
                processedItem.gc_content = processedItem['GC Content'];
            } else if (!processedItem.gc_content && processedItem.sequence) {
                // 如果没有gc_content字段但有sequence字段，计算GC含量
                const sequence = processedItem.sequence.toUpperCase();
                const gcCount = (sequence.match(/[GC]/g) || []).length;
                processedItem.gc_content = sequence.length > 0 ? gcCount / sequence.length : 0;
            }
            
            // 处理 affinity 字段
            if (!processedItem.affinity && processedItem.Affinity) {
                processedItem.affinity = processedItem.Affinity;
            }
            
            // 处理 type 字段
            if (!processedItem.type && processedItem.Type) {
                processedItem.type = processedItem.Type;
            }
            
            // 处理 description 字段
            if (!processedItem.description && processedItem['Ligand Description']) {
                processedItem.description = processedItem['Ligand Description'];
            }
            
            return processedItem;
        });
        
        originalData = processedData;
        filteredData = [...processedData];
        
        console.log('数据加载成功，共', processedData.length, '条记录');
        
        this.updateStatistics();
        ChartModule.createAllCharts();
        UIModule.updateDataSummary();
        FilterModule.updateFilterTags();
        TableModule.updateDataTable();
    } catch (error) {
        console.error('数据加载失败:', error);
        // 显示错误信息给用户
        this.showLoadingError(error.message);
    }
};

// 覆写TableModule.updateDataTable方法，适配aptamer表格结构
TableModule.updateDataTable = function() {
    const tableBody = document.getElementById('tableBody');
    const tableInfo = document.getElementById('tableInfo');

    if (!tableBody || !tableInfo) {
        console.warn('表格元素缺失，无法更新数据表');
        return;
    }

    tableInfo.textContent = `Showing ${filteredData.length} records (out of ${originalData.length} total)`;
    tableBody.innerHTML = '';

    // 辅助函数：序列着色
    const colorizeSequence = (seq) => {
        const colorMap = { 'A': '#d9534f', 'T': '#f0ad4e', 'U': '#f0ad4e', 'C': '#5bc0de', 'G': '#5cb85c' };
        return (seq || '').split('').map(ch => `<span style="color:${colorMap[ch.toUpperCase()] || '#333'}">${ch}</span>`).join('');
    };

    // 辅助函数：添加tooltip - 使用clientX/clientY坐标，简化计算逻辑
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
        
        cell.addEventListener('mouseleave', () => {
            hideAmirTooltip();
        });
    };

    filteredData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.style.whiteSpace = 'nowrap';

        // 1. 序号
        const indexCell = document.createElement('td');
        indexCell.textContent = index + 1;
        row.appendChild(indexCell);

        // 2. Sequence Name - 使用 Named 字段，构造到sequence界面的链接
        const seqNameCell = document.createElement('td');
        let seqNameHTML = item['Named'] || '';
        if (seqNameHTML) {
            // 构造到sequences页面的链接，使用Named作为搜索查询
            const searchQuery = encodeURIComponent(seqNameHTML);
            seqNameHTML = `<a href="/sequences/?search=${searchQuery}" target="_blank">${seqNameHTML}</a>`;
        }
        seqNameCell.innerHTML = seqNameHTML;
        row.appendChild(seqNameCell);

        // 3. Aptamer Name - 使用 Linker name(page name) 字段，使用Linker的链接
        const aptamerNameCell = document.createElement('td');
        let aptamerNameHTML = item['Linker name(page name)'] || '';
        
        // 特殊处理：根据sequence name确定正确的aptamer name
        const seqName = item['Named'] || '';
        if (seqName && aptamerNameHTML) {
            // 检查是否是合并的aptamer（包含逗号）
            if (aptamerNameHTML.includes(',')) {
                // 从sequence name中提取对应的aptamer部分
                if (seqName.includes('CB-42')) {
                    aptamerNameHTML = 'Cibacron Blue 3GA_CB-42 aptamer';
                } else if (seqName.includes('B4-25')) {
                    aptamerNameHTML = 'Reactive Blue 4_B4-25 aptamer';
                } else if (seqName.includes('Ribostamycin')) {
                    aptamerNameHTML = 'Ribostamycin aptamer';
                } else if (seqName.includes('Paromomycin')) {
                    aptamerNameHTML = 'Paromomycin aptamer';
                }
                // 可以在这里添加更多特殊情况的处理
            }
        }
        
        // 如果有链接且aptamer名称不为空，创建超链接
        if (item.Linker && item.Linker.trim() !== '' && item.Linker !== 'null' && aptamerNameHTML) {
            // 确保链接以斜杠开头
            let linkerUrl = item.Linker;
            if (!linkerUrl.startsWith('/') ) {
                linkerUrl = '/' + linkerUrl;
            }
            aptamerNameHTML = `<a href="${linkerUrl}" target="_blank">${aptamerNameHTML}</a>`;
        }
        aptamerNameCell.innerHTML = aptamerNameHTML;
        row.appendChild(aptamerNameCell);

        // 4. Year - 使用Year字段
        const yearCell = document.createElement('td');
        let yearHTML = `${item.Year || ''}`;
        if (item['Link to PubMed Entry'] && item['Link to PubMed Entry'].trim() !== '' && item['Link to PubMed Entry'] !== 'null') {
            yearHTML = `<a href="${item['Link to PubMed Entry']}" target="_blank">${item.Year || ''}</a>`;
        }
        yearCell.innerHTML = yearHTML;
        row.appendChild(yearCell);

        // 5. Category - 使用Category字段
        const categoryCell = document.createElement('td');
        categoryCell.textContent = item.Category || '';
        row.appendChild(categoryCell);

        // 6. Sequence (5'-3') - 使用Sequence字段
        const seqCell = document.createElement('td');
        const sequence = item.Sequence || '';
        const seqShort = sequence.substring(0, 10) + (sequence.length > 10 ? '...' : '');
        seqCell.textContent = seqShort;
        row.appendChild(seqCell);
        addTooltip(seqCell, colorizeSequence(sequence));

        // 7. Description - 使用Ligand Description字段
        const descCell = document.createElement('td');
        const descFull = item['Ligand Description'] || '';
        const descShort = descFull.length > 20 ? descFull.substring(0, 20) + '...' : descFull;
        descCell.textContent = descShort;
        row.appendChild(descCell);
        addTooltip(descCell, descFull);

        tableBody.appendChild(row);
    });
};

// 添加创建类型饼图的方法
ChartModule.createTypeChart = function() {
    // 获取所有可能的类型（基于原始数据）
    const allTypeCounts = {};
    originalData.forEach(d => {
        // 使用type或Type字段，优先使用小写的type字段
        const type = d.type || d.Type || 'Unknown';
        allTypeCounts[type] = (allTypeCounts[type] || 0) + 1;
    });
    const allTypes = Object.keys(allTypeCounts).sort();
    
    console.log("创建类型图 - 交互顺序:", nodeInteractionOrder.join(" > "));
    
    // 确定数据源 - A节点使用原始数据，B/C节点使用上级节点数据
    let dataForVisualization = [];
    
    if (nodeInteractionOrder.length === 0) {
        // 没有任何交互，使用原始数据
        dataForVisualization = [...originalData];
        console.log("类型图表无交互，使用原始数据:", dataForVisualization.length);
    } else {
        // 根据当前节点在交互序列中的位置确定数据来源
        const myIndex = nodeInteractionOrder.indexOf('typeChart');
        
        if (myIndex === -1) {
            // 如果不在交互序列中，使用最后一个交互节点的数据
            const lastNodeId = nodeInteractionOrder[nodeInteractionOrder.length - 1];
            dataForVisualization = [...nodeFilteredData[lastNodeId]];
            console.log(`类型图表不在交互序列中，使用最后节点${lastNodeId}数据:`, dataForVisualization.length);
        } else if (myIndex === 0) {
            // 如果是A节点，必须使用原始数据，严禁下探
            dataForVisualization = [...originalData];
            console.log("类型图表是A节点，使用原始数据(禁止下探):", dataForVisualization.length);
        } else {
            // 如果是B节点或C节点，使用上级节点的数据进行可视化
            const parentNodeId = nodeInteractionOrder[myIndex - 1];
            dataForVisualization = [...nodeFilteredData[parentNodeId]];
            console.log(`类型图表是${myIndex === 1 ? 'B' : 'C'}节点，使用上级节点${parentNodeId}数据:`, dataForVisualization.length);
        }
    }
    
    // 计算可视化数据的类型分布
    const visualizationTypeCounts = {};
    dataForVisualization.forEach(d => {
        const type = d.type || d.Type || 'Unknown';
        visualizationTypeCounts[type] = (visualizationTypeCounts[type] || 0) + 1;
    });
    
    // 检查是否有类型筛选
    const hasTypeFilter = activeFilters.types && activeFilters.types.size > 0;
    const hasAnyFilter = nodeInteractionOrder.length > 0;
    
    // 创建饼图数据 - 基于可视化数据源的类型分布
    const pieData = allTypes.map(type => {
        const value = visualizationTypeCounts[type] || 0;
        return {
            type: type,
            count: value,
            isFiltered: hasTypeFilter && activeFilters.types.has(type)
        };
    });
    
    // 如果可视化数据源为空，显示提示
    if (dataForVisualization.length === 0) {
        console.warn('可视化数据源为空，显示空状态');
        Plotly.newPlot('typeChart', [], {
            ...chartLayoutBase,
            margin: { l: 20, r: 20, t: 20, b: 20 },
            annotations: [{
                text: '筛选中... 请尝试其他筛选条件',
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
    
    // 只显示有数据的类型
    // 更新全局 displayTypes 以避免外部引用时报错
    displayTypes = pieData.filter(d => d.count > 0).map(d => d.type);
    const displayValues = pieData.filter(d => d.count > 0).map(d => d.count);
    const isFiltered = pieData.filter(d => d.count > 0).map(d => d.isFiltered);
    
    // 如果筛选后没有数据，显示错误
    if (displayTypes.length === 0) {
        console.warn('筛选后没有类型数据，显示空状态');
        Plotly.newPlot('typeChart', [], {
            ...chartLayoutBase,
            margin: { l: 20, r: 20, t: 20, b: 20 },
            annotations: [{
                text: '没有匹配的类型数据',
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
    
    // 为每种类型添加简短描述 - 根据实际数据更新
    const typeDescriptions = {
        'Small molecules': 'Aptamers that bind to small molecular targets like drugs, metabolites, and synthetic compounds',
        'Proteins': 'Aptamers that bind to protein targets including enzymes, antibodies, and growth factors',
        'Cells': 'Aptamers that bind to whole cells or cell surface markers',
        'Others': 'Aptamers with specialized or uncommon target types',
        'Nucleic acids': 'Aptamers that bind to DNA, RNA, or other nucleic acid structures',
        'Unknown': 'Aptamers with unspecified target type'
    };
    
    const baseColors = displayTypes.map((type, i) => morandiColors[i % morandiColors.length]);

    const trace = {
        labels: displayTypes,
        values: displayValues,
        type: 'pie',
        hole: 0.4,
        pull: displayTypes.map((type, i) =>
            isFiltered[i] ? highlightConfig.pie.selectedOffset : 0
        ),
        marker: {
            colors: displayTypes.map((type, i) => {
                // 如果该类型被选中，使用高亮效果（白色填充 + 原色边框）
                if (isFiltered[i]) {
                    return '#fff';
                }
                // 正常颜色
                return baseColors[i];
            }),
            line: {
                color: displayTypes.map((type, i) => {
                    if (isFiltered[i]) {
                        return baseColors[i];
                    }
                    return 'white';
                }),
                width: displayTypes.map((type, i) => {
                    if (isFiltered[i]) {
                        return highlightConfig.pie.borderWidth;
                    }
                    return 1;
                })
            }
        },
        textinfo: 'percent',
        textfont: {
            size: 11,
            color: displayTypes.map((type, i) => isFiltered[i] ? baseColors[i] : 'white')
        },
        hovertemplate: '<b>%{label}</b><br>Count: %{value}<br>Percentage: %{percent}<br><i>Click for multi-select filter</i><extra></extra>',
        hoverlabel: { 
            bgcolor: 'white', 
            bordercolor: morandiHighlight,
            align: 'left'  // 强制左对齐
        },
        opacity: displayTypes.map((type, i) => {
            if (hasTypeFilter && !isFiltered[i]) {
                return 0.6; // 未选中的区间半透明
            }
            return 1.0; // 选中的区间完全不透明
        })
    };
    
    const layout = {
        ...chartLayoutBase,
        margin: { l: 20, r: 120, t: 20, b: 20 }, // 增加右侧边距，为图例留出空间
        showlegend: true, // 显示图例
        legend: {
            orientation: 'v',
            x: 1.05,
            y: 0.5,
            xanchor: 'left',
            yanchor: 'middle',
            bgcolor: 'rgba(255,255,255,0.8)',
            bordercolor: '#E2E8F0',
            borderwidth: 1,
            font: { size: 12 }
        },
        title: hasAnyFilter ? {
            font: { size: 14, color: '#520049' }
        } : null
    };
    
    Plotly.newPlot('typeChart', [trace], layout, chartConfig);
    
    document.getElementById('typeChart').on('plotly_click', function(data) {
        const type = data.points[0].label;
        FilterModule.toggleTypeFilter(type);
    });
};

// 覆写ChartModule.createAllCharts方法，添加类型饼图
const originalCreateAllCharts = ChartModule.createAllCharts;
ChartModule.createAllCharts = function() {
    try {
        console.log("开始创建所有图表...");
        this.createYearChart();
        this.createCategoryChart();
        this.createTypeChart(); // 添加类型饼图
        console.log("所有图表创建完成");
    } catch (error) {
        console.error("创建图表时发生错误:", error);
    }
};

// 扩展FilterModule.calculateSpecificNodeData方法，支持类型筛选
const originalCalculateSpecificNodeData = FilterModule.calculateSpecificNodeData;
FilterModule.calculateSpecificNodeData = function(nodeId) {
    console.log(`计算节点 ${nodeId} 的最新数据`);
    
    // 根据节点类型和筛选条件计算数据
    if (nodeId === 'yearChart' && activeFilters.years.size > 0) {
        // 年份筛选 - 直接从原始数据筛选
        nodeFilteredData[nodeId] = originalData.filter(d => 
            activeFilters.years.has(d.year || d.Year)
        );
        console.log(`更新 ${nodeId} 节点数据: ${nodeFilteredData[nodeId].length} 条记录`);
    } else if (nodeId === 'ligandChart' && activeFilters.categories.size > 0) {
        // 类别筛选 - 直接从原始数据筛选
        nodeFilteredData[nodeId] = originalData.filter(d => 
            activeFilters.categories.has(d.category || d.Category)
        );
        console.log(`更新 ${nodeId} 节点数据: ${nodeFilteredData[nodeId].length} 条记录`);
    } else if (nodeId === 'typeChart' && activeFilters.types && activeFilters.types.size > 0) {
        // 类型筛选 - 直接从原始数据筛选
        nodeFilteredData[nodeId] = originalData.filter(d => {
            const itemType = d.type || d.Type || 'Unknown';
            return activeFilters.types.has(itemType);
        });
        console.log(`更新 ${nodeId} 节点数据: ${nodeFilteredData[nodeId].length} 条记录`);
    } else if (nodeId === 'scatterChart' && activeFilters.scatterSelection) {
        // 散点图区域筛选 - 直接从原始数据筛选
        const sel = activeFilters.scatterSelection;
        nodeFilteredData[nodeId] = originalData.filter(d => 
            d.length >= sel.xrange[0] && d.length <= sel.xrange[1] &&
            d.gc_content >= sel.yrange[0] && d.gc_content <= sel.yrange[1]
        );
        
        // 如果筛选后没有数据，给出警告并使用原始数据
        if (nodeFilteredData[nodeId].length === 0) {
            console.warn(`散点图筛选后没有数据，使用原始数据`);
            nodeFilteredData[nodeId] = [...originalData];
        }
        
        console.log(`更新 ${nodeId} 节点数据: ${nodeFilteredData[nodeId].length} 条记录`);
    } else {
        // 如果该节点没有应用筛选条件，使用原始数据
        nodeFilteredData[nodeId] = [...originalData];
    }
};

// ====== 修复：覆写calculateNodeData，补全typeChart分支 ======
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
    // 只有一个节点(A节点)
    if (nodeInteractionOrder.length === 1) {
        const firstNodeId = nodeInteractionOrder[0];
        const firstNodeData = nodeFilteredData[firstNodeId];
        // 非交互节点使用A节点的筛选结果
        for (const nodeId in nodeFilteredData) {
            if (nodeId !== firstNodeId && !nodeFrozenState[nodeId]) {
                nodeFilteredData[nodeId] = [...firstNodeData];
            }
        }
        return;
    }
    // 多节点交互情况
    nodeInteractionOrder.forEach((interactedNodeId, index) => {
        if (index === 0) return; // 跳过A节点
        const parentNodeId = nodeInteractionOrder[index - 1];
        const parentNodeData = nodeFilteredData[parentNodeId];
        if (interactedNodeId === 'yearChart' && activeFilters.years.size > 0) {
            nodeFilteredData[interactedNodeId] = parentNodeData.filter(d => (d.year || d.Year) && activeFilters.years.has(d.year || d.Year));
        } else if (interactedNodeId === 'ligandChart' && activeFilters.categories.size > 0) {
            nodeFilteredData[interactedNodeId] = parentNodeData.filter(d => (d.category || d.Category) && activeFilters.categories.has(d.category || d.Category));
        } else if (interactedNodeId === 'typeChart' && activeFilters.types && activeFilters.types.size > 0) {
            nodeFilteredData[interactedNodeId] = parentNodeData.filter(d => {
                const itemType = d.type || d.Type || 'Unknown';
                return activeFilters.types.has(itemType);
            });
        } else if (interactedNodeId === 'scatterChart' && activeFilters.scatterSelection) {
            const sel = activeFilters.scatterSelection;
            nodeFilteredData[interactedNodeId] = parentNodeData.filter(d =>
                d.length >= sel.xrange[0] && d.length <= sel.xrange[1] &&
                d.gc_content >= sel.yrange[0] && d.gc_content <= sel.yrange[1]
            );
        } else {
            nodeFilteredData[interactedNodeId] = [...parentNodeData];
        }
    });
    // 剩余未交互节点使用最后一个交互节点的数据
    if (nodeInteractionOrder.length > 0) {
        const lastNodeId = nodeInteractionOrder[nodeInteractionOrder.length - 1];
        const lastNodeData = nodeFilteredData[lastNodeId];
        for (const nodeId in nodeFilteredData) {
            if (!nodeInteractionOrder.includes(nodeId) && !nodeFrozenState[nodeId]) {
                nodeFilteredData[nodeId] = [...lastNodeData];
            }
        }
    }
    // 控制台输出
    console.log("节点数据计算完成，交互顺序:", nodeInteractionOrder.join(" > "));
};

// 覆写FilterModule.updateNodeStateIndicators方法，解决可能缺失DOM节点的问题并支持类型图
const originalUpdateNodeStateIndicators = FilterModule.updateNodeStateIndicators;
FilterModule.updateNodeStateIndicators = function() {
    try {
        // 年份图状态
        const yearChartHeader = document.querySelector('#yearChart')?.closest('.chart-wrapper')?.querySelector('.chart-header');
        if (yearChartHeader) {
            const yearStateIndicator = yearChartHeader.querySelector('.node-state-indicator') || document.createElement('div');
            yearStateIndicator.className = 'node-state-indicator';
            yearStateIndicator.textContent = '';
            
            // 类别饼图状态
            const ligandChartHeader = document.querySelector('#ligandChart')?.closest('.chart-wrapper')?.querySelector('.chart-header');
            if (ligandChartHeader) {
                const ligandStateIndicator = ligandChartHeader.querySelector('.node-state-indicator') || document.createElement('div');
                ligandStateIndicator.className = 'node-state-indicator';
                ligandStateIndicator.textContent = '';
                
                // 类型饼图状态
                const typeChartHeader = document.querySelector('#typeChart')?.closest('.chart-wrapper')?.querySelector('.chart-header');
                if (typeChartHeader) {
                    const typeStateIndicator = typeChartHeader.querySelector('.node-state-indicator') || document.createElement('div');
                    typeStateIndicator.className = 'node-state-indicator';
                    typeStateIndicator.textContent = '';
                
                    // 根据交互顺序设置节点状态 - 这里采用正向顺序
                    nodeInteractionOrder.forEach((nodeId, index) => {
                        // 节点层级使用字母A/B/C表示，按照交互顺序顺序分配
                        // 第一个交互的是A节点，第二个是B节点，第三个是C节点
                        const stateText = index === 0 ? 'Node A' : (index === 1 ? 'Node B' : 'Node C');
                        
                        if (nodeId === 'yearChart') {
                            yearStateIndicator.textContent = stateText;
                            yearStateIndicator.style.backgroundColor = '#520049';
                            
                            // 添加状态指示器到图表标题
                            if (!yearChartHeader.querySelector('.node-state-indicator')) {
                                yearChartHeader.appendChild(yearStateIndicator);
                            }
                        } else if (nodeId === 'ligandChart') {
                            ligandStateIndicator.textContent = stateText;
                            ligandStateIndicator.style.backgroundColor = '#520049';
                            
                            // 添加状态指示器到图表标题
                            if (!ligandChartHeader.querySelector('.node-state-indicator')) {
                                ligandChartHeader.appendChild(ligandStateIndicator);
                            }
                        } else if (nodeId === 'typeChart') {
                            typeStateIndicator.textContent = stateText;
                            typeStateIndicator.style.backgroundColor = '#520049';
                            
                            // 添加状态指示器到图表标题
                            if (!typeChartHeader.querySelector('.node-state-indicator')) {
                                typeChartHeader.appendChild(typeStateIndicator);
                            }
                        }
                    });
                }
            }
        }
        
        // 在控制台显示当前节点层级和交互顺序
        console.log("当前节点层级:", 
            nodeInteractionOrder.map((nodeId, index) => {
                const levelName = index === 0 ? 'A' : (index === 1 ? 'B' : 'C');
                return `${levelName}=${nodeId}`;
            }).join(', ')
        );
    } catch (error) {
        console.error("更新节点状态指示器时发生错误:", error);
    }
};

// 添加类型筛选功能
FilterModule.toggleTypeFilter = function(type) {
    console.log('切换类型筛选:', type);
    
    // 确保types集合存在
    if (!activeFilters.types) {
        activeFilters.types = new Set();
    }
    
    if (activeFilters.types.has(type)) {
        activeFilters.types.delete(type);
    } else {
        activeFilters.types.add(type);
    }
    
    // 注册节点交互
    this.registerNodeInteraction('typeChart');
};

// 覆写FilterModule.updateFilterTags方法，支持类型筛选标签
const originalUpdateFilterTags = FilterModule.updateFilterTags;
FilterModule.updateFilterTags = function() {
    const tagsContainer = document.getElementById('filterTags');
    if (!tagsContainer) return;

    tagsContainer.innerHTML = '';

    // 颜色映射
    const allYears = [...new Set(originalData.map(d => d.year))].sort();
    const yearColorMap = {};
    allYears.forEach((year, i) => {
        yearColorMap[year] = morandiColors[i % morandiColors.length];
    });

    const allCategories = [...new Set(originalData.map(d => d.category))];
    const categoryColorMap = {};
    allCategories.forEach((cat, i) => {
        if (categoryPaletteMap && categoryPaletteMap[cat]) {
            categoryColorMap[cat] = categoryPaletteMap[cat];
        } else {
            categoryColorMap[cat] = morandiColors[i % morandiColors.length];
        }
    });

    const typeColorMap = {};
    if (typeof displayTypes !== 'undefined') {
        displayTypes.forEach((type, i) => {
            typeColorMap[type] = morandiColors[i % morandiColors.length];
        });
    }

    // Year tags
    activeFilters.years.forEach(year => {
        const tag = createFilterTag(`Year: ${year}`, () => this.toggleYearFilter(year), yearColorMap[year], 'yearChart');
        tagsContainer.appendChild(tag);
    });

    // Category tags
    activeFilters.categories.forEach(category => {
        const tag = createFilterTag(`Category: ${category}`, () => this.toggleCategoryFilter(category), categoryColorMap[category], 'ligandChart');
        tagsContainer.appendChild(tag);
    });

    // Type tags
    if (activeFilters.types) {
        activeFilters.types.forEach(type => {
            const tag = createFilterTag(`Type: ${type}`, () => this.toggleTypeFilter(type), typeColorMap[type], 'typeChart');
            tagsContainer.appendChild(tag);
        });
    }

    // Scatter plot filter tag
    if (activeFilters.scatterSelection) {
        const sel = activeFilters.scatterSelection;
        const text = `Range: ${sel.xrange[0].toFixed(0)}-${sel.xrange[1].toFixed(0)}bp, ${sel.yrange[0].toFixed(1)}-${sel.yrange[1].toFixed(1)}%`;
        const tag = createFilterTag(text, () => this.clearScatterSelection(), morandiHighlight, 'scatterChart');
        tagsContainer.appendChild(tag);
    }
    
    // 显示/隐藏筛选控制区域
    const hasActiveFilters = activeFilters.years.size > 0 || 
                           activeFilters.categories.size > 0 || 
                           (activeFilters.types && activeFilters.types.size > 0) || 
                           activeFilters.scatterSelection;
    
    const filterSection = document.querySelector('.filter-controls');
    if (filterSection) {
        filterSection.style.display = hasActiveFilters ? 'block' : 'none';
    }
    
    // 设置当前筛选条件计数和节点状态
    const activeFilterCount = (activeFilters.years.size > 0 ? 1 : 0) + 
                             (activeFilters.categories.size > 0 ? 1 : 0) + 
                             ((activeFilters.types && activeFilters.types.size > 0) ? 1 : 0) + 
                             (activeFilters.scatterSelection ? 1 : 0);
    
    const resetBtn = document.getElementById('resetAllFilters');
    if (resetBtn) {
        resetBtn.textContent = `Reset All (${activeFilterCount})`;
        resetBtn.disabled = !hasActiveFilters;
        resetBtn.style.opacity = hasActiveFilters ? '1' : '0.5';
    }
    
    // 更新节点状态指示器
    this.updateNodeStateIndicators();
};

// 修改DataModule.updateStatistics方法，适配aptamer特有的统计数据
DataModule.updateStatistics = function() {
    // 确保数据已加载
    if (!originalData || originalData.length === 0) {
        console.warn('原始数据未加载或为空');
        return;
    }
    
    if (!filteredData) {
        console.warn('筛选数据未初始化');
        return;
    }
    
    const ligands = [...new Set(filteredData.map(d => d.ligand || d.Ligand).filter(Boolean))];
    const years = filteredData.length > 0 ? 
        [...new Set(filteredData.map(d => d.year || d.Year).filter(Boolean))] : [];
    const categories = [...new Set(filteredData.map(d => d.category || d.Category).filter(Boolean))];
    
    // 安全地更新统计数据，检查元素是否存在
    const totalAptamersEl = document.getElementById('totalAptamers');
    const uniqueLigandsEl = document.getElementById('uniqueLigands');
    const yearSpanEl = document.getElementById('yearSpan');
    const categoryCountEl = document.getElementById('categoryCount');
    
    if (totalAptamersEl) {
        totalAptamersEl.textContent = filteredData.length;
    }
    
    if (uniqueLigandsEl) {
        uniqueLigandsEl.textContent = ligands.length;
    }
    
    if (yearSpanEl && years.length > 0) {
        const numericYears = years.map(y => parseInt(y)).filter(y => !isNaN(y));
        if (numericYears.length > 0) {
            const yearSpan = Math.max(...numericYears) - Math.min(...numericYears);
            yearSpanEl.textContent = yearSpan + '年';
        } else {
            yearSpanEl.textContent = '0年';
        }
    }
    
    if (categoryCountEl) {
        categoryCountEl.textContent = categories.length;
    }
};

console.log('Dashboard Aptamer 模块加载完成'); 