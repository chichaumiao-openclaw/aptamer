// Dashboard Configuration - 仪表板配置文件

// ====== 全局变量 ======
let originalData = [];
let filteredData = [];

// 冻结数据和节点层级管理
let nodeInteractionOrder = []; // 用户交互顺序，保存图表ID: ['yearChart', 'ligandChart', 'scatterChart']
let nodeFilteredData = {  // 每个节点的筛选后数据
    yearChart: [],       // A节点(柱状图)的筛选后数据
    ligandChart: [],     // B节点(饼图)的筛选后数据
    typeChart: [],       // 类型饼图的筛选后数据
    scatterChart: []     // C节点(散点图)的筛选后数据
};
let nodeFrozenState = {  // 每个节点的冻结状态
    yearChart: false,    // A节点是否冻结
    ligandChart: false,  // B节点是否冻结
    typeChart: false,    // 类型饼图是否冻结
    scatterChart: false  // C节点是否冻结
};

// 指定不触发自定义tooltip的元素选择器
const ignoreTooltipElements = [
    '#ligandChart', 
    '#ligandChart .plotly', 
    '#ligandChart .plotly .pie',
    '#ligandChart .plotly .hoverlayer'
];

// 筛选条件
let activeFilters = {
    years: new Set(),
    categories: new Set(),
    types: new Set(),
    scatterSelection: null
};

// ====== 颜色配置 ======
// 替换为更明亮的莫兰迪色系
const morandiColors = [
    '#AEE1D6', // 明亮青绿
    '#F6D6AD', // 明亮米杏
    '#F7B7A3', // 明亮珊瑚
    '#B5C7ED', // 明亮蓝紫
    '#E7B7E8', // 明亮粉紫
    '#B7E7E1', // 明亮青蓝
    '#E8D7B7', // 明亮米黄
    '#F7E6AD', // 明亮柠檬
];

const morandiHighlight = '#7D807F'; // 柔和深灰，作为高亮边框
const morandiDim = 'rgba(180,180,180,0.3)'; // 非高亮部分叠加的半透明灰

// 选中状态样式配置
const highlightConfig = {
    bar: {
        defaultWidth: 0.8,
        selectedWidth: 0.72,
        borderWidth: 3
    },
    pie: {
        selectedOffset: 0.05,
        borderWidth: 3,
        scale: 1.05,
        shadow: '0px 0px 8px rgba(0,0,0,0.4)',
        animationDuration: 300
    }
};

// 参考aptamer-legend.js的高亮效果：
// 选中元素背景变为白色，并以内置的原始颜色作为内边框
function applyHighlightStyle(elements, baseColor) {
    elements.forEach(el => {
        el.classList.add('highlighted');
        el.style.setProperty('--highlight-border', baseColor);
        el.style.setProperty('--highlight-bg', '#fff');
    });
}

function removeHighlightStyle(elements) {
    elements.forEach(el => {
        el.classList.remove('highlighted');
        el.style.removeProperty('--highlight-border');
        el.style.removeProperty('--highlight-bg');
    });
}

// 对饼图扇形应用动画和阴影高亮效果 - 使用Plotly 3.x兼容的方法
function applyPieHighlight(chartId, selectedFlags) {
    const gd = document.getElementById(chartId);
    if (!gd || !selectedFlags) return;

    try {
        // 获取当前图表数据
        const currentData = gd.data && gd.data[0];
        if (!currentData) {
            console.warn('饼图数据未找到');
            return;
        }

        // 构建高亮样式的更新数据
        const updateData = {
            // 根据选中状态构建pull数组，使选中的扇形向外移动
            pull: selectedFlags.map(flag =>
                flag ? highlightConfig.pie.selectedOffset : 0
            ),
            // 构建边框宽度数组
            'marker.line.width': selectedFlags.map(flag =>
                flag ? highlightConfig.pie.borderWidth : 1
            ),
            // 构建透明度数组，非选中的扇形稍微暗一点
            opacity: selectedFlags.map(flag => flag ? 1.0 : 0.8)
        };

        // 使用Plotly.restyle来更新图表样式，这是Plotly 3.x推荐的方法
        Plotly.restyle(gd, updateData, 0).then(() => {
            console.log('饼图高亮效果已应用');
        }).catch(error => {
            console.warn('饼图高亮效果应用失败:', error);
        });

    } catch (error) {
        console.error('饼图高亮效果处理出错:', error);
    }
}

// 导出以便其他脚本调用
window.applyPieHighlight = applyPieHighlight;

// ====== 图表配置 ======
const chartConfig = {
    responsive: true,
    displayModeBar: false,
    // 提升悬停性能的配置
    interaction: {
        intersect: false,
        mode: 'nearest'
    }
};

const chartLayoutBase = {
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: {
        family: 'Helvetica Neue, Helvetica, Arial, sans-serif',
        size: 12,
        color: '#555'
    },
    // 全局悬停配置
    hovermode: 'closest',
    hoverdistance: 50
};

// ====== 工具函数 ======
// 获取年份颜色
function getYearColor(year, yearRange) {
    const minYear = Math.min(...yearRange);
    const maxYear = Math.max(...yearRange);
    const ratio = (year - minYear) / (maxYear - minYear);
    
    if (ratio <= 0.2) return morandiColors[0];
    if (ratio <= 0.4) return morandiColors[1];
    if (ratio <= 0.6) return morandiColors[2];
    if (ratio <= 0.8) return morandiColors[3];
    return morandiColors[4];
}

// AMIR风格提示框 - 智能定位版本
function showAmirTooltip(content, clientX, clientY, event) {
    // 检查事件源是否应该被忽略
    if (event && event.target) {
        const target = event.target;
        
        // 检查目标元素或其任何祖先元素是否在忽略列表中
        if (ignoreTooltipElements.some(selector => {
            // 检查元素是否匹配选择器
            if (target.matches && target.matches(selector)) {
                return true;
            }
            
            // 检查元素的祖先是否匹配选择器
            const closestMatch = target.closest && target.closest(selector);
            return closestMatch != null;
        })) {
            // 如果元素应该被忽略，直接返回
            return;
        }
    }
    
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
        
        // Debug模式：显示箭头位置信息
        if (window.location.search.includes('debug=tooltip')) {
            console.log('Tooltip Debug - clientX:', clientX, 'clientY:', clientY, 'tooltipSize:', tooltipRect.width + 'x' + tooltipRect.height);
            console.log('Arrow Debug - position:', arrowPosition, 'left:', finalArrowLeft + 'px');
        }
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    tooltip.style.opacity = '1';
}

function hideAmirTooltip() {
    const tooltip = document.getElementById('amirTooltip');
    tooltip.style.opacity = '0';
}


// 获取节点层级标签（A/B/C...）
function getNodeLevel(nodeId) {
    const index = nodeInteractionOrder.indexOf(nodeId);
    const labels = ['A', 'B', 'C', 'D'];
    return index >= 0 ? labels[index] : '';
}

// 创建筛选标签，使用图例风格展示颜色
function createFilterTag(text, onRemove, color, nodeId) {
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    if (color) {
        tag.style.setProperty('--legend-border', color);
    }
    const levelLabel = getNodeLevel(nodeId);
    tag.innerHTML = `
        <span class="legend-color" style="background:${color || '#e0e0e0'}"></span>
        <span class="filter-tag-text">${text}</span>
        ${levelLabel ? `<span class="filter-tag-level">${levelLabel}</span>` : ''}
        <button class="filter-tag-remove" type="button">×</button>
    `;

    tag.querySelector('.filter-tag-remove').addEventListener('click', onRemove);
    return tag;
}

// 导出数据 - 注意：导出比表格显示多一列PubMed Link
async function exportData() {
    // 检查是否有数据可导出
    if (!filteredData || filteredData.length === 0) {
        alert("暂无数据可导出。");
        return;
    }
    
    // 创建CSV内容 - 在原有基础上追加“Affinity (Kd)”与“mmCIF”两列（不在表格展示，仅导出）
    const csvRows = [];
    
    // 标题行 - 增加 Affinity 与 mmCIF
    const headers = [
        'No.',
        'Sequence Name', 
        'Aptamer Name',
        'Discovery Year',
        'PubMed Link',
        'Category',
        'Sequence (5\'-3\')',
        'Description',
        'Affinity (Kd)',
        'mmCIF'
    ];
    csvRows.push(headers.map(h => `"${h}"`).join(','));
    
    // 预取 mmCIF 索引（slug -> { annotated[], zip })
    let mmcifMap = {};
    try {
        const baseUrl = (window.DASHBOARD_CONFIG && window.DASHBOARD_CONFIG.baseurl) || '';
        const siteOrigin = (window.DASHBOARD_CONFIG && window.DASHBOARD_CONFIG.siteUrl) || window.location.origin;
        const idxRes = await fetch(`${siteOrigin}${baseUrl}/apidata/colored_structures/index.json`);
        if (idxRes.ok) {
            const idx = await idxRes.json();
            (idx.items || []).forEach(it => {
                if (it && it.slug) {
                    mmcifMap[it.slug] = {
                        annotated: it.annotated_cif_list || (it.annotated_cif ? [it.annotated_cif] : []),
                        zip: it.zip || null
                    };
                }
            });
        }
    } catch (e) {
        console.warn('mmCIF index not available, skipping mmCIF column', e);
    }
    
    // 数据行 - 严格按照TableModule.updateDataTable()的逻辑处理
    // 注意：除了PubMed Link列（仅在导出中包含），其他所有列都与表格显示保持一致
    filteredData.forEach((item, index) => {
        // 1. No. - 行号
        const no = index + 1;
        
        // 2. Sequence Name - 使用Named字段，去除HTML标签
        const sequenceName = (item['Named'] || 'N/A').toString().replace(/<[^>]*>/g, '');
        
        // 3. Aptamer Name - 处理合并的aptamer名称
        let aptamerName = item['Linker name(page name)'] || 'N/A';
        const seqName = item['Named'] || '';
        if (seqName && aptamerName !== 'N/A' && aptamerName.includes(',')) {
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
        aptamerName = aptamerName.toString().replace(/<[^>]*>/g, '');
        
        // 4. Discovery Year - 使用Year字段
        const year = (item['Year'] || 'N/A').toString().replace(/<[^>]*>/g, '');
        
        // 5. PubMed Link - 使用Link to PubMed Entry字段
        // 注意：此列仅在导出中包含，网页表格中不显示（保持界面简洁）
        const pubmedLink = (item['Link to PubMed Entry'] || 'N/A').toString().replace(/<[^>]*>/g, '');
        
        // 6. Category - 使用Category字段
        const category = (item['Category'] || 'N/A').toString().replace(/<[^>]*>/g, '');
        
        // 7. Sequence (5'-3') - 使用完整序列
        const sequence = (item['Sequence'] || 'N/A').toString().replace(/<[^>]*>/g, '');
        
        // 8. Description - 使用完整描述
        const description = (item['Ligand Description'] || 'N/A').toString().replace(/<[^>]*>/g, '');
        
        // 9. Affinity (Kd)
        const affinity = (item['Affinity'] || item.Affinity || 'N/A').toString().replace(/<[^>]*>/g, '');

        // 10. mmCIF（优先 zip，其次首个 annotated）
        let mmcif = 'N/A';
        try {
            const linker = (item['Linker'] || '').toString();
            if (linker) {
                const parts = linker.split('/');
                const last = parts[parts.length - 1] || '';
                const slug = last.replace(/\.html?$/i, '');
                const info = mmcifMap[slug];
                if (info) {
                    const owner = (window.DASHBOARD_CONFIG && window.DASHBOARD_CONFIG.repoOwner) || '';
                    const repo = (window.DASHBOARD_CONFIG && window.DASHBOARD_CONFIG.repoName) || '';
                    const tag = (window.DASHBOARD_CONFIG && window.DASHBOARD_CONFIG.releaseTag) || '';
                    if (info.zip && owner && repo && tag) {
                        mmcif = `https://github.com/${owner}/${repo}/releases/download/${tag}/${slug}.mmcif.zip`;
                    } else if (info.annotated && info.annotated.length) {
                        const siteUrl = (window.DASHBOARD_CONFIG && window.DASHBOARD_CONFIG.siteUrl) || window.location.origin;
                        const baseUrl = (window.DASHBOARD_CONFIG && window.DASHBOARD_CONFIG.baseurl) || '';
                        mmcif = `${siteUrl}${baseUrl}/apidata/colored_structures/${info.annotated[0]}`;
                    }
                }
            }
        } catch {}

        // 构建行数据（追加两列）
        const rowData = [no, sequenceName, aptamerName, year, pubmedLink, category, sequence, description, affinity, mmcif];
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
    link.setAttribute("download", `dashboard_export_${filteredData.length}_rows.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`✅ 已导出主页数据 ${filteredData.length} 条记录，包含 ${headers.length} 个字段（导出专用列：PubMed Link / Affinity (Kd) / mmCIF）`);
}

// 重置所有筛选
function resetAllFilters() {
    // 重置所有筛选条件
    activeFilters = {
        years: new Set(),
        categories: new Set(),
        types: new Set(),
        scatterSelection: null
    };
    
    // 重置节点交互顺序和冻结状态
    nodeInteractionOrder = [];
    nodeFrozenState.yearChart = false;
    nodeFrozenState.ligandChart = false;
    nodeFrozenState.typeChart = false;
    nodeFrozenState.scatterChart = false;
    
    // 重置各节点数据
    nodeFilteredData.yearChart = [];
    nodeFilteredData.ligandChart = [];
    nodeFilteredData.typeChart = [];
    nodeFilteredData.scatterChart = [];
    
    // 重置筛选后数据
    filteredData = [...originalData];
    
    // 更新UI
    applyFilters();
}

console.log('Dashboard configuration loaded - 智能tooltip定位已启用'); 
