import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

// 初始化 PhotoSwipe
function initBannerPhotoSwipe() {
    const viewBannerBtn = document.getElementById('view-banner-btn');
    const bannerWrapper = document.getElementById('banner-wrapper');
    
    if (!viewBannerBtn || !bannerWrapper) return;
    
    // 移除旧的事件监听器（如果有的话）
    const newBtn = viewBannerBtn.cloneNode(true) as HTMLButtonElement;
    viewBannerBtn.parentNode?.replaceChild(newBtn, viewBannerBtn);
    
    // 获取 banner 图片的 src
    const bannerImg = bannerWrapper.querySelector('img');
    if (!bannerImg) return;
    
    const bannerSrc = bannerImg.src;
    
    newBtn.addEventListener('click', () => {
        // 创建临时的图片元素来获取原始尺寸
        const tempImg = new Image();
        
        tempImg.onerror = () => {
            console.error('无法加载图片');
        };
        
        tempImg.onload = () => {
            try {
                const lightbox = new PhotoSwipeLightbox({
                    dataSource: [
                        {
                            src: bannerSrc,
                            width: tempImg.naturalWidth || 1920,
                            height: tempImg.naturalHeight || 1080,
                            alt: 'Banner 原图'
                        }
                    ],
                    pswpModule: () => import('photoswipe'),
                    bgOpacity: 0.95,
                    showHideAnimationType: 'zoom',
                    initialZoomLevel: 'fit',
                    secondaryZoomLevel: 1.5,
                    maxZoomLevel: 4,
                    spacing: 0.1,
                    allowPanToNext: false,
                    closeOnVerticalDrag: true,
                    pinchToClose: true,
                    clickToCloseNonZoomable: true,
                });
                
                lightbox.init();
                lightbox.loadAndOpen(0);
            } catch (error) {
                console.error('PhotoSwipe 初始化失败:', error);
            }
        };
        
        tempImg.src = bannerSrc;
    });
}

// 页面加载时初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBannerPhotoSwipe);
} else {
    initBannerPhotoSwipe();
}

// 支持 Swup 页面切换
document.addEventListener('swup:contentReplaced', initBannerPhotoSwipe);

