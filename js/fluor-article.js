// fluor-article.js - 动态填充 fluorescent article 表格与参考文献
(async function(){
  try {
    const base = window.DASHBOARD_CONFIG?.baseurl || '';
    const articleResp = await fetch(`${base}/apidata/fluorescence_article.json`);
    const refsResp = await fetch(`${base}/apidata/fluorescence_reference.json`);
    if(!articleResp.ok) throw new Error('article json load failed');
    if(!refsResp.ok) throw new Error('reference json load failed');
    const articleData = await articleResp.json();
    const refsData = await refsResp.json();

    // 将分子式转换为HTML，把数字转换为下标
    function formatChemicalFormula(formula) {
      // 先处理数字下标
      let formatted = formula.replace(/([A-Z][a-z]*)(\d+)/g, '$1<sub>$2</sub>');
      // 再处理正电荷上标
      formatted = formatted.replace(/([A-Z][a-z]*)(\+)/g, '$1<sup>$2</sup>');
      return formatted;
    }
    

    // 移除Molar mass后的g/mol单位
    function formatMolarMass(mass) {
      return mass.replace(/\s*g\/mol\s*$/i, '');
    }

    // 填充表格
    const tbody = document.querySelector('#fluorPairsTable tbody');
    if(tbody){
      articleData.forEach(row=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${row["Fluorescent molecule"]}</td>
          <td>${row["UPAC"]}</td>
          <td class="chemical-formula">${formatChemicalFormula(row["Molecular Formula"])}</td>
          <td>${formatMolarMass(row["Molar mass"])}</td>
          <td>${row["CAS"]}</td>
          <td>${row["Excitation (nm)"]}</td>
          <td>${row["Emission (nm)"]}</td>
          <td>${row["Aptamer"]}</td>
          <td>${row["Fluorogenic mechanisms"]}</td>`;
        tbody.appendChild(tr);
      });
    }

    // 填充参考文献 - 使用Theophylline-aptamer_back1.md中的格式
    const refList = document.getElementById('referenceList');
    if(refList){
      // 首先，移除ol标签自动编号，通过CSS控制显示
      refList.style.listStyleType = 'none';
      refList.style.paddingLeft = '0';
      
      refList.innerHTML = ''; // 清空原有内容
      
      refsData.forEach((ref, index) => {
        // 创建锚点链接
        const refId = `ref${index + 1}`;
        const anchor = document.createElement('a');
        anchor.id = refId;
        refList.appendChild(anchor);
        
        // 创建完整引用文本的元素
        const li = document.createElement('li');
        
        // 标题部分
        const titleHtml = `<font><strong>[${index + 1}] ${ref.title}</strong></font><br />`;
        
        // 作者部分
        const authorsText = ref.authors.join(', ');
        
        // 出版物信息
        const pubInfo = `${ref.journal}, ${ref.volume}(${ref.issue}), ${ref.pages}. (${ref.year})`;
        
        // 链接部分
        const linkHtml = `<a href="${ref.url}" target="_blank" style="color:#520049">${pubInfo}</a>`;
        
        // 组装完整HTML
        li.innerHTML = titleHtml + authorsText + '<br />' + linkHtml + '<br />';
        
        refList.appendChild(li);
      });
    }

    // 直接为页面上的长单词添加内联样式
    // function emphasizeWordsDirectly() {
    //   console.log('开始强调单词前三字母 - 直接样式');
      
    //   // 忽略的小词列表
    //   const ignoreWords = new Set([
    //     'and', 'the', 'for', 'with', 'this', 'that', 'from', 'into', 'onto', 
    //     'upon', 'about', 'RNA', 'DNA', 'GFP', 'NMR', 'are', 'not', 'has', 'its'
    //   ]);
      
    //   // 遍历正文段落
    //   const paragraphs = document.querySelectorAll('.fluor-body-section p');
    //   console.log(`找到 ${paragraphs.length} 个段落`);
      
    //   // 遍历每个段落
    //   Array.from(paragraphs).forEach((para, idx) => {
    //     // 如果已经处理过，则跳过
    //     if (para.getAttribute('data-processed') === 'true') return;
        
    //     console.log(`处理段落 ${idx+1}`);
        
    //     // 获取所有文本节点
    //     const textNodes = [];
    //     function getTextNodes(node) {
    //       if (node.nodeType === 3) { // 文本节点
    //         textNodes.push(node);
    //       } else if (node.nodeType === 1 && 
    //                 !['SCRIPT', 'STYLE', 'SPAN', 'SUP', 'SUB', 'A'].includes(node.nodeName)) {
    //         Array.from(node.childNodes).forEach(getTextNodes);
    //       }
    //     }
    //     getTextNodes(para);
        
    //     // 处理每个文本节点
    //     textNodes.forEach(textNode => {
    //       const text = textNode.nodeValue;
    //       if (!text.trim()) return; // 跳过空文本
          
    //       // 用正则找出所有单词
    //       const parts = [];
    //       let lastIndex = 0;
          
    //       // 匹配3个以上字母的单词
    //       const regex = /\b([A-Za-z]{3,})\b/g;
    //       let match;
          
    //       while ((match = regex.exec(text)) !== null) {
    //         const word = match[1];
    //         const startIndex = match.index;
            
    //         // 忽略特定短词和已处理词
    //         if (ignoreWords.has(word.toLowerCase())) continue;
            
    //         // 添加前面的文本
    //         if (startIndex > lastIndex) {
    //           parts.push(document.createTextNode(text.substring(lastIndex, startIndex)));
    //         }
            
    //         // 创建强调的前3个字母
    //         const prefixSpan = document.createElement('span');
    //         prefixSpan.style.fontWeight = '600';
    //         prefixSpan.style.color = '#520049';
    //         prefixSpan.style.display = 'inline';
    //         prefixSpan.textContent = word.substring(0, 3);
            
    //         // 添加剩余字母
    //         const rest = document.createTextNode(word.substring(3));
            
    //         // 添加到parts
    //         parts.push(prefixSpan);
    //         parts.push(rest);
            
    //         lastIndex = startIndex + word.length;
    //       }
          
    //       // 添加剩余文本
    //       if (lastIndex < text.length) {
    //         parts.push(document.createTextNode(text.substring(lastIndex)));
    //       }
          
    //       // 如果做了任何替换
    //       if (parts.length > 0) {
    //         const fragment = document.createDocumentFragment();
    //         parts.forEach(part => fragment.appendChild(part));
    //         textNode.parentNode.replaceChild(fragment, textNode);
    //       }
    //     });
        
    //     // 标记为已处理
    //     para.setAttribute('data-processed', 'true');
    //   });
    // }
    
    // 将h4替换为带箭头的小标题
    function applyHeaderStyles() {
      console.log('执行标题样式函数');
      const headings = document.querySelectorAll('.fluor-body-section h4');
      console.log(`找到 ${headings.length} 个h4标题`);
      
      Array.from(headings).forEach((heading, index) => {
        // 如果已经处理过，则跳过
        if (heading.getAttribute('data-processed') === 'true') return;
        
        console.log(`处理第 ${index+1} 个标题: ${heading.textContent}`);
        
        // 创建带箭头的标题
        const blowheader = document.createElement('div');
        blowheader.className = 'blowheader_box';
        blowheader.innerHTML = `${heading.textContent}`;
        blowheader.style.background = 'linear-gradient(135deg, #520049, rgba(82, 0, 73, 0.8))';
        blowheader.style.color = 'white';
        blowheader.style.padding = '12px 20px';
        blowheader.style.margin = '30px 0 20px';
        blowheader.style.borderRadius = '8px';
        blowheader.style.fontSize = '18px';
        blowheader.style.fontWeight = '600';
        blowheader.style.position = 'relative';
        blowheader.style.boxShadow = '0 4px 15px rgba(82, 0, 73, 0.2)';
        blowheader.style.letterSpacing = '0.5px';
        
        // 插入新标题
        heading.parentNode.insertBefore(blowheader, heading);
        heading.style.display = 'none'; // 隐藏原标题但不删除
        heading.setAttribute('data-processed', 'true');
      });
    }
    
    // 使用MutationObserver监控DOM变化，确保样式应用到新添加的内容
    function setupStyleObserver() {
      const targetNode = document.querySelector('.fluor-body-section');
      if (!targetNode) {
        console.log('找不到目标区域，延迟重试');
        setTimeout(setupStyleObserver, 500);
        return;
      }
      
      console.log('设置MutationObserver');
      
      // 创建观察器配置
      const config = { childList: true, subtree: true };
      
      // 回调函数处理DOM变化
      const callback = function(mutationsList, observer) {
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            console.log('检测到DOM变化，重新应用样式');
            applyHeaderStyles();
            emphasizeWordsDirectly();
          }
        }
      };
      
      // 创建观察器并开始观察
      const observer = new MutationObserver(callback);
      observer.observe(targetNode, config);
      
      // 立即应用一次样式
      applyHeaderStyles();
      emphasizeWordsDirectly();
    }
    
    // 确保DOM加载完成后再应用样式
    console.log('fluor-article.js 执行中');
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupStyleObserver);
    } else {
      // DOM已加载，直接设置
      setupStyleObserver();
    }
    
    // 再次确保样式被应用
    window.addEventListener('load', function() {
              console.log('Page fully loaded, applying final styles');
      setTimeout(() => {
        applyHeaderStyles();
        emphasizeWordsDirectly();
      }, 1000);
    });
    
  }catch(err){
    console.error('[fluor-article] load error:',err);
  }
})(); 