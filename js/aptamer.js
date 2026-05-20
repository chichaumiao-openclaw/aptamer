// Aptamer页面专用JavaScript

// 全局变量
let pieChartData = null;
let tableListsData = null;
let tablesData = null;

// 初始化函数
document.addEventListener('DOMContentLoaded', function() {
    console.log('Aptamer page loading...');
    loadData();
    initializeEventListeners();
});

// 加载数据
async function loadData() {
    try {
        // 加载表格列表数据 - 先加载这个以确保统计面板可以显示
        const tableResponse = await fetch('/apidata/aptamer-table-lists.json');
        tableListsData = await tableResponse.json();
        
        // 渲染表格列表 - 确保统计面板首先被渲染
        renderTableLists();
        
        // 加载饼图数据 - 如果饼图元素不存在，这部分可以失败但不会影响统计面板
        try {
            const pieResponse = await fetch('/apidata/aptamer-pie-chart.json');
            pieChartData = await pieResponse.json();
            renderPieChart();
        } catch (pieError) {
            console.log('Pie chart could not be rendered, but this will not affect other functionality');
        }
        
        // // 加载表格数据（旧版功能，仅在文件存在时才加载）
        // try {
        //     const tablesResponse = await fetch('/apidata/aptamer-tables-data.json');
        //     if (tablesResponse.ok) {
        //         tablesData = await tablesResponse.json();
        //         renderTables();
        //     } else {
        //         console.log('Legacy tables data file not found, skipping legacy table rendering');
        //     }
        // } catch (tableErr) {
        //     console.log('Legacy tables data load skipped:', tableErr.message);
        // }
        
        console.log('Aptamer data loaded successfully');
    } catch (error) {
        console.error('Failed to load aptamer data:', error);
    }
}

// 渲染饼图
function renderPieChart() {
    if (!pieChartData) return;
    
    const pieChartElement = document.getElementById('pie-chart');
    if (!pieChartElement) {
        console.log('Pie chart element not found, skipping chart rendering');
        return;
    }
    
    const data = [{
        values: pieChartData.pieChart.values,
        labels: pieChartData.pieChart.labels,
        type: 'pie',
        marker: {
            colors: pieChartData.pieChart.colors
        }
    }];
    
    const layout = {
        // 可以在这里添加布局配置
    };
    
    Plotly.newPlot('pie-chart', data, layout);
}

// 渲染表格列表 - DEPRECATED: Now using dynamic table generator
function renderTableLists() {
    // This function is deprecated as tables are now generated dynamically
    // via aptamer-table-generator.js. Keeping for backward compatibility.
    console.log('Legacy table rendering function called - now using dynamic generation');
    return;
}

// 渲染单个表格
function renderTable(containerId, tableClass, data) {
    const container = document.getElementById('statsContent');
    if (!container) return;
    
    // 创建表格标题
    const titleElement = document.createElement('font');
    titleElement.textContent = data.title;
    
    // 创建表格
    const table = document.createElement('table');
    table.className = tableClass;
    table.border = '1';
    
    // 创建表格行
    data.rows.forEach(rowData => {
        const row = document.createElement('tr');
        row.className = rowData.class;
        
        rowData.cells.forEach(cellData => {
            const cell = document.createElement('td');
            const link = document.createElement('a');
            link.href = cellData.url;
            link.target = '_blank';
            link.innerHTML = cellData.name;
            link.onclick = handleCellClick;
            
            cell.appendChild(link);
            row.appendChild(cell);
        });
        
        table.appendChild(row);
    });
    
    // 添加到容器
    if (containerId === 'with3DStructure') {
        container.appendChild(titleElement);
        container.appendChild(table);
        container.appendChild(document.createElement('br'));
    } else {
        const secondTitle = document.createElement('font');
        secondTitle.textContent = data.title;
        container.appendChild(secondTitle);
        container.appendChild(table);
    }
}

// 处理单元格点击事件
function handleCellClick(event) {
    // 这里可以添加点击处理逻辑
    console.log('Cell clicked:', event.target.textContent);
}

// 统计面板切换功能
function toggleStats() {
    const content = document.getElementById('statsContent');
    const icon = document.getElementById('toggleIcon');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '-';
    } else {
        content.style.display = 'none';
        icon.textContent = '+';
    }
}

// 初始化事件监听器
function initializeEventListeners() {
    // 搜索功能
    const searchBox = document.getElementById('searchBox');
    if (searchBox) {
        searchBox.addEventListener('input', handleSearch);
    }
    
    // 按钮点击事件
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('button')) {
            handleButtonClick(event);
        }
    });
}

// 处理搜索
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    console.log('Searching for:', searchTerm);
    
    // 这里可以添加搜索逻辑
    // 例如过滤表格内容或高亮匹配项
}

// 处理按钮点击
function handleButtonClick(event) {
    // 移除其他按钮的点击状态
    document.querySelectorAll('.button').forEach(btn => {
        btn.classList.remove('clicked');
    });
    
    // 添加点击状态到当前按钮
    event.target.classList.add('clicked');
    
    console.log('Button clicked:', event.target.textContent);
}

// DataTables初始化函数（如果需要）
function initializeDataTables() {
    // 这里可以初始化DataTables
    if (typeof $ !== 'undefined' && $.fn.DataTable) {
        $('.table-style1').DataTable({
            // DataTables配置选项
            responsive: true,
            pageLength: 25,
            dom: 'Bfrtip',
            buttons: [
                'copy', 'csv', 'excel', 'pdf', 'print'
            ]
        });
    }
}

// 渲染表格数据
function renderTables() {
    if (!tablesData) return;
    
    // 渲染小分子表格
    renderTableData('cfttable-body', tablesData.smallMolecules);
    
    // 渲染蛋白质表格
    renderTableData('eletable-body', tablesData.proteins);
    
    // 渲染氨基酸表格
    renderTableData('amintable-body', tablesData.aminoAcids);
    
    // 渲染糖类表格
    renderTableData('sugtable-body', tablesData.sugars);
}

// 渲染单个表格的数据
function renderTableData(tbodyId, data) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    data.forEach(item => {
        const row = document.createElement('tr');
        
        // Category
        const categoryCell = document.createElement('td');
        categoryCell.textContent = item.category;
        categoryCell.setAttribute('name', 'td0');
        row.appendChild(categoryCell);
        
        // Name (with link)
        const nameCell = document.createElement('td');
        nameCell.setAttribute('name', 'td1');
        const nameLink = document.createElement('a');
        nameLink.href = `{{ site.url }}{{ site.baseurl }}${item.nameUrl}`;
        nameLink.target = '_blank';
        nameLink.style.color = '#520049';
        nameLink.innerHTML = `<b>${item.name}</b>`;
        nameCell.appendChild(nameLink);
        row.appendChild(nameCell);
        
        // Ligand
        const ligandCell = document.createElement('td');
        ligandCell.setAttribute('name', 'td2');
        ligandCell.innerHTML = item.ligand;
        row.appendChild(ligandCell);
        
        // Description
        const descCell = document.createElement('td');
        descCell.setAttribute('name', 'td3');
        descCell.textContent = item.description;
        row.appendChild(descCell);
        
        // Discovery (with link)
        const discoveryCell = document.createElement('td');
        discoveryCell.setAttribute('name', 'td4');
        const discoveryLink = document.createElement('a');
        discoveryLink.href = item.discoveryUrl;
        discoveryLink.target = '_blank';
        discoveryLink.style.color = '#520049';
        discoveryLink.innerHTML = `<b>${item.discovery}</b>`;
        discoveryCell.appendChild(discoveryLink);
        row.appendChild(discoveryCell);
        
        // PDB
        const pdbCell = document.createElement('td');
        pdbCell.setAttribute('name', 'td5');
        if (item.pdb === 'NA') {
            pdbCell.textContent = 'NA';
        } else if (Array.isArray(item.pdb)) {
            item.pdb.forEach((pdbItem, index) => {
                if (index > 0) pdbCell.appendChild(document.createElement('br'));
                const pdbLink = document.createElement('a');
                pdbLink.href = pdbItem.url;
                pdbLink.target = '_blank';
                pdbLink.style.color = '#520049';
                pdbLink.innerHTML = `<b>${pdbItem.id}</b>`;
                pdbCell.appendChild(pdbLink);
                if (pdbItem.note) {
                    pdbCell.appendChild(document.createTextNode(pdbItem.note));
                }
            });
        } else {
            const pdbLink = document.createElement('a');
            pdbLink.href = item.pdb.url;
            pdbLink.target = '_blank';
            pdbLink.style.color = '#520049';
            pdbLink.innerHTML = `<b>${item.pdb.id}</b>`;
            pdbCell.appendChild(pdbLink);
        }
        row.appendChild(pdbCell);
        
        tbody.appendChild(row);
    });
}

// 导出函数供外部使用
window.AptamerModule = {
    toggleStats,
    handleCellClick,
    handleSearch,
    handleButtonClick,
    initializeDataTables,
    renderTables,
    renderTableData
}; 