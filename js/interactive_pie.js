// 初始化饼图
function initPieChart(data) {
    const pieData = [{
        values: data.map(item => item.count),
        labels: data.map(item => item.type),
        type: 'pie',
        marker: {
            colors: data.map(item => item.color)
        },
        textinfo: 'label+percent',
        hoverinfo: 'label+percent',
        hole: 0.4
    }];

    const layout = {
        title: '核糖开关结构分布',
        showlegend: true,
        legend: {
            orientation: 'h',
            y: -0.1
        },
        font: {
            family: 'Arial, sans-serif',
            size: 14
        }
    };

    Plotly.newPlot('pieChart', pieData, layout);

    // 添加点击事件监听
    document.getElementById('pieChart').on('plotly_click', function(data) {
        const clickedLabel = data.points[0].label;
        filterTable(clickedLabel);
    });
}

// 过滤表格数据
function filterTable(type) {
    const table = document.getElementById('dataTable');
    const rows = table.getElementsByTagName('tr');

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const typeCell = row.getElementsByTagName('td')[0];
        
        if (type === '全部' || typeCell.textContent.trim() === type) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    }
}

// 处理数据并初始化
function processData() {
    const table = document.getElementById('dataTable');
    const rows = table.getElementsByTagName('tr');
    const typeCount = {};
    const colors = {
        'Hammerhead': '#1f77b4',
        'HDV': '#ff7f0e',
        'Twister': '#2ca02c',
        'Twister-sister': '#d62728',
        'Varkud': '#9467bd',
        'GlmS': '#8c564b',
        '其他': '#7f7f7f'
    };

    // 统计每种类型的数量
    for (let i = 1; i < rows.length; i++) {
        const type = rows[i].getElementsByTagName('td')[0].textContent.trim();
        typeCount[type] = (typeCount[type] || 0) + 1;
    }

    // 转换为饼图数据格式
    const pieData = Object.entries(typeCount).map(([type, count]) => ({
        type: type,
        count: count,
        color: colors[type] || colors['其他']
    }));

    // 初始化饼图
    initPieChart(pieData);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    processData();
}); 