const SearchUtils = {
  async fetchData(paths) {
    for (const path of paths) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          const text = await response.text();
          return JSON.parse(text);
        }
      } catch (e) {
        console.warn('Failed to load search data from', path, e);
      }
    }
    throw new Error('All search data paths failed');
  },

    /* === 新增：统一的数值标签清洗函数 === */
    sanitizeMeta(str = '') {
      return String(str)
        .replace(/Length\s*:\s*\d+/gi, '')
        .replace(/GC\s*:\s*[\d.]+/gi, '')
        .replace(/Year\s*:\s*\d+/gi, '')
        .replace(/Kd\s*:\s*[~<>]?\s*[\d.]+\s*[pnuµμumM]+/gi, '')
        .replace(/\s*,\s*,*/g, ' ')
        .trim();
    },
    processResults(data, query) {
      const queryLower = query.toLowerCase();
      const terms = queryLower.split(/\s+/).filter(t => t.length > 0);
      const results = [];
      data.forEach(item => {
        const titleLower    = (item.title    || '').toLowerCase();
        const categoryLower = (item.category || '').toLowerCase();
        const tagsLower     = this.sanitizeMeta(item.tags).toLowerCase();
        const contentLower  = this.sanitizeMeta(item.content).toLowerCase();      let matched = false;
      if (titleLower.includes(queryLower) ||
          categoryLower.includes(queryLower) ||
          tagsLower.includes(queryLower) ||
          contentLower.includes(queryLower)) {
        matched = true;
      } else {
        for (const term of terms) {
          if (titleLower.includes(term) ||
              categoryLower.includes(term) ||
              tagsLower.includes(term) ||
              contentLower.includes(term)) {
            matched = true;
            break;
          }
        }
      }
      if (matched) {
        item.relevanceScore = this.calculateRelevanceScore(item, query);
        results.push(item);
      }
    });
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return results;
  },

  calculateRelevanceScore(item, query) {
    let score = 0;
    const terms     = query.toLowerCase().split(/\s+/).filter(Boolean);
    const fullQuery = query.toLowerCase();

    const title    = (item.title    || '').toLowerCase();
    const category = (item.category || '').toLowerCase();
    const tags     = this.sanitizeMeta(item.tags).toLowerCase();
    const content  = this.sanitizeMeta(item.content).toLowerCase();
    // const content = (item.content || '').toLowerCase();
    if (title.includes(fullQuery)) score += 200;
    if (content.includes(fullQuery)) score += 100;
    if (category.includes(fullQuery)) score += 80;
    if (tags.includes(fullQuery)) score += 90;
    terms.forEach(term => {
      if (title === term) score += 100;
      else if (title.startsWith(term)) score += 80;
      else if (title.includes(term)) score += 60;
      if (category.includes(term)) score += 30;
      if (tags.includes(term)) score += 40;
      if (content.includes(term)) score += Math.min((content.match(new RegExp(term,'gi'))||[]).length*3,30);
    });
    return score;
  },

  highlightKeywords(text, query) {
    if (!text) return '';
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
    let result = text;
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      result = result.replace(regex, '<span class="keyword-highlight">$1</span>');
    });
    return result;
  },

  getContentPreview(content, query, before = 200) {
    if (!content) return '';
    const queryLower = query.toLowerCase();
    const pos = content.toLowerCase().indexOf(queryLower);
    if (pos !== -1) {
      const start = Math.max(0, pos - before);
      const end = Math.min(content.length, pos + before);
      let preview = content.substring(start, end);
      if (start > 0) preview = '...' + preview;
      if (end < content.length) preview = preview + '...';
      return this.highlightKeywords(preview, query);
    }
    return this.highlightKeywords(content.substring(0, before) + '...', query);
  }
};

// ===== Extension: integrate sequences_cleaned.json =====
(function () {
  if (SearchUtils.__seqExt) return;          // 防止重复执行
  SearchUtils.__seqExt = true;

  /* 把 sequences_cleaned.json 的一条记录转换成与 search.json 相同的数据结构 */
  SearchUtils.transformSequenceRecord = function (r) {
    if (!r) return {};
    /* 把类似 "Kd: 4.8 nM / 14 μM ..." 转成 nM 数值，便于高级筛选 */
    const kd = (() => {
      const m = String(r.Affinity || '').match(/Kd\s*[:\s]*[~<>]?\s*([\d\.]+)\s*([pnuµμmM]+)?/i);
      if (!m) return NaN;
      const v = parseFloat(m[1]);
      const u = (m[2] || '').toLowerCase();
      if (u.startsWith('pm')) return v / 1e3;
      if (u.startsWith('nm')) return v;
      if (u.includes('µ') || u.startsWith('um') || u.includes('u')) return v * 1e3;
      if (u.startsWith('mm')) return v * 1e6;
      return v;
    })();

    const len = Number(r.Length) || undefined;
    // const gc  = r['GC Content'] !== undefined ? parseFloat(r['GC Content']) * 100 : undefined;
    const gc = r['GC Content'] !== undefined
           ? Number((parseFloat(r['GC Content']) * 100).toFixed(2))  // 50.57
           : undefined;
    const yr  = r.Year ? String(r.Year) : '';

    // 组装标准标签，包括 Type, Category, Length, GC Content, Year 等
    const standardTags = [
      r.Type ? `Type:${r.Type}` : '',
      r.Category ? `Category:${r.Category}` : '',
      len !== undefined ? `Length:${len}` : '',
      gc !== undefined ? `GC:${gc}` : '',
      yr ? `Year:${yr}` : ''
    ].filter(Boolean).join(', ');

    const basicTags = [
      // r.Type ? `Type:${r.Type}` : '',
      // r.Category ? `Category:${r.Category}` : ''
    ].filter(Boolean).join(', ');

    // 优先使用 'Linker name(page name)' 作为title，这样搜索完整aptamer名称时能匹配到
    const linkerName = r['Linker name(page name)'] || '';
    const primaryTitle = linkerName || r.Named || r.ID || 'Unnamed Sequence';

    // 构建content，确保包含Linker name以便搜索
    const contentParts = [
      r.Sequence ? `Sequence: ${r.Sequence}` : '',
      r.Ligand ? `Ligand: ${r.Ligand}` : '', 
      r.Affinity ? `Affinity: ${r.Affinity}` : ''
    ];
    
    // 如果Linker name与title不同，也添加到content中确保可搜索
    if (linkerName && linkerName !== r.Named && linkerName !== r.ID) {
      contentParts.unshift(`Name: ${linkerName}`);
    }
    
    // 如果有Named字段且与Linker name不同，也添加到content中
    if (r.Named && r.Named !== linkerName) {
      contentParts.push(`Variant: ${r.Named}`);
    }

    return {
      title  : primaryTitle,
      category: `sequence${r.Type ? ' - ' + r.Type : ''}`,
      tags   : basicTags,
      meta_tags: standardTags,  // 完整标签，供高级搜索使用
      url    : `/sequences/?id=${encodeURIComponent(r.ID)}`,
      date   : yr ? `${yr}-01-01` : '',
      content: contentParts.filter(Boolean).join(' | '),
      /* 高级搜索筛选字段 */
      sequence_length: len,
      gc_content     : gc,
      kd_value       : kd,
      is_sequence    : true,
      id             : r.ID,
      /* 附加字段 */
      target_type    : r.Type || '',
      target         : r.Ligand || r.Target || '',
      pub_year       : yr ? parseInt(yr) : undefined,
      linker_name    : linkerName,  // 保存原始的Linker name字段供参考
      named          : r.Named || ''  // 添加Named字段供搜索结果显示使用
    };
  };

  /* 重写 fetchData：聚合 search.json + sequences_cleaned.json */
  const origFetch = SearchUtils.fetchData.bind(SearchUtils);
  SearchUtils.fetchData = async function (paths = []) {
    const result = [];

    const push = (arr) => Array.isArray(arr) && result.push(...arr);

    /* 1. 先拉取传入的 search.json */
    try { push(await origFetch(paths)); } catch (e) { console.warn(e); }

    /* 2. 再尝试加载 sequences_cleaned.json */
    for (const p of ['/apidata/sequences_cleaned.json',
                     './apidata/sequences_cleaned.json',
                     'apidata/sequences_cleaned.json']) {
      try {
        const res = await fetch(p);
        if (res.ok) {
          const json = await res.json();
          if (json && Array.isArray(json.Sheet1)) {
            push(json.Sheet1.map(SearchUtils.transformSequenceRecord));
            break;                                  // 第一处成功即可
          }
        }
      } catch (e) { console.warn('load seq json fail', p); }
    }

    if (!result.length) throw new Error('All search data paths failed');
    return result;
  };

})();