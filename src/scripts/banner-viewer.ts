import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

let isInitialized = false;

function initBannerPhotoSwipe() {
    const viewBannerBtn = document.getElementById('view-banner-btn');
    const bannerWrapper = document.getElementById('banner-wrapper');
    
    if (!viewBannerBtn || !bannerWrapper) {
        isInitialized = false;
        return;
    }
    
    if (isInitialized) return;
    
    const bannerImg = bannerWrapper.querySelector('img');
    if (!bannerImg) return;
    
    const handleClick = () => {
        const bannerSrc = bannerImg.src;
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
    };
    
    viewBannerBtn.addEventListener('click', handleClick);
    isInitialized = true;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBannerPhotoSwipe);
} else {
    initBannerPhotoSwipe();
}

document.addEventListener('swup:contentReplaced', () => {
    isInitialized = false;
    initBannerPhotoSwipe();
});

