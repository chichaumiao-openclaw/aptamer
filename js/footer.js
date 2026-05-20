/**
 * 页脚模块 JS - 从homepage-main.js中提取
 * 实现引用复制等功能
 */

// 页脚模块
const FooterModule = {
    /**
     * 复制引用文本到剪贴板
     * @param {string} citationText - 要复制的引用文本
     */
    copyCitation(citationText) {
        // 如果没有提供引用文本，使用默认文本
        const citation = citationText || 'Zhichao Miao, Lin Huang. Ribocentre-aptamer: a database of aptamers.';
        
        // 使用navigator.clipboard API复制文本
        navigator.clipboard.writeText(citation).then(() => {
            // 获取复制按钮
            const btn = document.querySelector('.copy-citation-btn');
            if (!btn) return;
            
            // 保存原始按钮文本
            const originalText = btn.innerHTML;
            
            // 显示复制成功提示
            btn.innerHTML = '<i class="fas fa-check"></i> Copied';
            btn.style.background = '#28a745';
            
            // Restore original button text after 2 seconds
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
            }, 2000);
        }).catch((err) => {
            // Error handling for copy failure
            console.error('Copy failed:', err);
            alert('Copy failed, please copy the citation manually');
        });
    },
    
    /**
     * 初始化页脚模块
     */
    init() {
        // 为所有复制引用按钮添加点击事件
        const copyButtons = document.querySelectorAll('.copy-citation-btn');
        
        copyButtons.forEach(button => {
            button.addEventListener('click', () => {
                // 获取自定义引用文本，如果没有则使用默认文本
                const citationText = button.getAttribute('data-citation');
                this.copyCitation(citationText);
            });
        });
        
        // 导出全局复制引用功能，兼容现有代码
        window.copyCitation = (text) => this.copyCitation(text);
    }
};

// 当DOM加载完成后初始化模块
document.addEventListener('DOMContentLoaded', function() {
    FooterModule.init();
});

// 导出模块供其他JS使用
window.FooterModule = FooterModule; 