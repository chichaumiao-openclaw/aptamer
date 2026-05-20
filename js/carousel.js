/**
 * carousel.js - 轮播图模块
 * 从homepage-main.js中提取的独立轮播图功能
 */

// 轮播图模块
const CarouselModule = {
    currentSlideIndex: 0,
    slides: null,
    dots: null,
    totalSlides: 0,
    intervalId: null,

    init() {
        console.log('轮播图初始化...');
        
        // 获取DOM元素
        this.slides = document.querySelectorAll('.carousel-slide');
        this.dots = document.querySelectorAll('.carousel-dot');
        this.totalSlides = this.slides.length;
        
        if (this.totalSlides === 0) {
            console.error('没有找到轮播图幻灯片！');
            return;
        }
        
        console.log(`找到${this.totalSlides}张幻灯片`);
        
        // 设置初始状态
        this.showSlide(0);
        
        // 启动自动轮播
        this.startAutoSlide();
        
        // 添加鼠标悬停暂停自动轮播
        const carousel = document.querySelector('.carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', () => this.stopAutoSlide());
            carousel.addEventListener('mouseleave', () => this.startAutoSlide());
        }
    },

    // 显示指定索引的幻灯片
    showSlide(index) {
        // 更新索引
        this.currentSlideIndex = index;
        
        // 移动幻灯片容器
        const slidesContainer = document.getElementById('carouselSlides');
        if (slidesContainer) {
            slidesContainer.style.transform = `translateX(-${index * 100}%)`;
        }
        
        // 更新指示点状态
        this.dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    },

    // 切换到下一张幻灯片
    nextSlide() {
        const nextIndex = (this.currentSlideIndex + 1) % this.totalSlides;
        this.showSlide(nextIndex);
    },

    // 切换到上一张幻灯片
    prevSlide() {
        const prevIndex = (this.currentSlideIndex - 1 + this.totalSlides) % this.totalSlides;
        this.showSlide(prevIndex);
    },

    // 切换到指定索引的幻灯片（从1开始）
    currentSlide(index) {
        this.showSlide(index - 1);
    },

    // 开始自动轮播
    startAutoSlide() {
        this.stopAutoSlide(); // 先停止现有的
        this.intervalId = setInterval(() => this.nextSlide(), 5000);
    },

    // 停止自动轮播
    stopAutoSlide() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
};

// 导出全局函数，供HTML调用
window.nextSlide = () => CarouselModule.nextSlide();
window.prevSlide = () => CarouselModule.prevSlide();
window.currentSlide = (index) => CarouselModule.currentSlide(index);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, initializing carousel...');
    CarouselModule.init();
}); 