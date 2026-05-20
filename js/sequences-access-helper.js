/**
 * Sequences Access Helper
 * 处理aptamer页面中的序列访问按钮功能
 */

class SequencesAccessHelper {
    constructor() {
        this.init();
    }

    init() {
        // 等待DOM加载完成后设置事件监听器
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupAptamerLayoutButtonHandler());
        } else {
            this.setupAptamerLayoutButtonHandler();
        }
    }

    // 设置aptamer布局中按钮的处理器
    setupAptamerLayoutButtonHandler() {
        document.addEventListener('click', (event) => {
            const btn = event.target.closest('.aptamer-sequences-btn');
            if (!btn) return;

            event.preventDefault();
            event.stopPropagation();

            // 从按钮的data-page-title属性或页面标题提取搜索查询
            const pageTitle = btn.getAttribute('data-page-title') || document.title;
            const searchQuery = this.extractSearchQueryFromTitle(pageTitle);
            
            if (searchQuery) {
                const sequencesUrl = `/sequences/?search=${encodeURIComponent(searchQuery)}`;
                window.open(sequencesUrl, '_blank');
            }
        });
    }

    // 从页面标题提取搜索查询
    extractSearchQueryFromTitle(title) {
        if (!title) return 'aptamer';
        
        let titleQuery = title
            .replace(/\s*-\s*Ribocentre\s*Aptamer.*$/i, '') // 移除站点后缀
            .replace(/\s*aptamer\s*/gi, ' ')
            .replace(/\s*binding\s*/gi, ' ')
            .replace(/\s*RNA\s*/gi, ' ')
            .replace(/\s*DNA\s*/gi, ' ')
            .replace(/\s*sequence\s*/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        const words = titleQuery.split(' ').filter(word => word.length > 2);
        if (words.length > 0) {
            return words.slice(0, 2).join(' ');
        }
        
        return 'aptamer';
    }
}

// 全局初始化
window.sequencesAccessHelper = new SequencesAccessHelper();

// 导出类以供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SequencesAccessHelper;
} 