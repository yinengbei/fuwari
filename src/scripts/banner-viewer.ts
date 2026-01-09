import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

let isInitialized = false;
let lightboxInstance: PhotoSwipeLightbox | null = null;
let clickHandler: (() => void) | null = null;
let viewBannerBtn: HTMLElement | null = null;

function cleanup() {
    if (viewBannerBtn && clickHandler) {
        viewBannerBtn.removeEventListener('click', clickHandler);
        clickHandler = null;
    }
    if (lightboxInstance) {
        lightboxInstance.destroy();
        lightboxInstance = null;
    }
    isInitialized = false;
    viewBannerBtn = null;
}

function initBannerPhotoSwipe() {
    const currentViewBannerBtn = document.getElementById('view-banner-btn');
    const bannerWrapper = document.getElementById('banner-wrapper');
    
    if (!currentViewBannerBtn || !bannerWrapper) {
        cleanup();
        return;
    }
    
    if (isInitialized && viewBannerBtn === currentViewBannerBtn) return;
    
    cleanup();
    
    const bannerImg = bannerWrapper.querySelector('img') as HTMLImageElement;
    if (!bannerImg) return;
    
    lightboxInstance = new PhotoSwipeLightbox({
        dataSource: [],
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
    
    lightboxInstance.addFilter('domItemData', (itemData, element) => {
        if (element instanceof HTMLImageElement) {
            itemData.src = element.currentSrc || element.src;
            itemData.w = element.naturalWidth || window.innerWidth;
            itemData.h = element.naturalHeight || window.innerHeight;
            itemData.msrc = element.currentSrc || element.src;
        }
        return itemData;
    });
    
    lightboxInstance.init();
    
    clickHandler = () => {
        if (!lightboxInstance) return;
        
        const currentBannerWrapper = document.getElementById('banner-wrapper');
        if (!currentBannerWrapper) return;
        
        const currentBannerImg = currentBannerWrapper.querySelector('img') as HTMLImageElement;
        if (!currentBannerImg) return;
        
        const bannerSrc = currentBannerImg.currentSrc || currentBannerImg.src;
        if (!bannerSrc) return;
        
        const width = currentBannerImg.naturalWidth;
        const height = currentBannerImg.naturalHeight;
        
        if (width === 0 || height === 0) return;
        
        try {
            lightboxInstance.options.dataSource = [
                {
                    src: bannerSrc,
                    w: width,
                    h: height,
                    msrc: bannerSrc,
                }
            ];
            
            lightboxInstance.loadAndOpen(0);
        } catch (error) {
            console.error('Failed to open PhotoSwipe:', error);
        }
    };
    
    currentViewBannerBtn.addEventListener('click', clickHandler, { passive: true });
    viewBannerBtn = currentViewBannerBtn;
    isInitialized = true;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBannerPhotoSwipe);
} else {
    initBannerPhotoSwipe();
}

document.addEventListener('swup:contentReplaced', () => {
    cleanup();
    initBannerPhotoSwipe();
});

