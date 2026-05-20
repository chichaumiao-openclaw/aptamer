// Aptamer Legend JS - 自动渲染颜色图例并实现交互高亮
(function(){
  // 1. 加载palette_map
  let paletteMap = {};
  const selectedCategories = new Set();
  function fetchPaletteMap(cb) {
    fetch('/apidata/palette_map_20250806_231255.json')
      .then(res => res.json())
      .then(data => { paletteMap = data; if(cb) cb(); });
  }

  // 2. 渲染legend
  function renderLegend() {
    const legendContainer = document.getElementById('aptamerLegend');
    if (!legendContainer) return;
    legendContainer.innerHTML = '';
    Object.entries(paletteMap).forEach(([cat, color]) => {
      const item = document.createElement('div');
      item.className = 'legend-item';
      item.setAttribute('data-category', cat);
      item.innerHTML = `<span class="legend-color" style="background:${color}"></span><span class="legend-label">${cat}</span>`;
      legendContainer.appendChild(item);
    });
    // 交互：hover legend高亮table
    legendContainer.querySelectorAll('.legend-item').forEach(item => {
      const cat = item.getAttribute('data-category');
      const color = paletteMap[cat] || '#fff';

      function applyHighlight() {
        document.querySelectorAll(`[data-category="${cat}"]`).forEach(cell => {
          cell.classList.add('highlighted');
          cell.style.setProperty('--highlight-border', color);
          cell.style.setProperty('--highlight-bg', '#fff');
        });
      }

      function removeHighlight() {
        document.querySelectorAll(`[data-category="${cat}"]`).forEach(cell => {
          cell.classList.remove('highlighted');
          cell.style.removeProperty('--highlight-bg');
          cell.style.removeProperty('--highlight-border');
        });
      }

      item.addEventListener('mouseenter', () => applyHighlight());
      item.addEventListener('mouseleave', () => {
        if (!selectedCategories.has(cat)) {
          removeHighlight();
        }
      });
      item.addEventListener('click', () => {
        if (selectedCategories.has(cat)) {
          selectedCategories.delete(cat);
          removeHighlight();
          item.classList.remove('active');
        } else {
          selectedCategories.add(cat);
          applyHighlight();
          item.classList.add('active');
        }
      });

      item.style.setProperty('--legend-border', color);
    });
  }

  // 3. 全局初始化函数
  window.initAptamerLegend = function() {
    fetchPaletteMap(renderLegend);
  };
})();
