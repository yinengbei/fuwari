import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

let isInitialized = false;
let lightboxInstance: PhotoSwipeLightbox | null = null;

function cleanup() {
    if (lightboxInstance) {
        lightboxInstance.destroy();
        lightboxInstance = null;
    }
    isInitialized = false;
}

function initBannerPhotoSwipe() {
    const viewBannerBtn = document.getElementById('view-banner-btn');
    const bannerWrapper = document.getElementById('banner-wrapper');
    
    if (!viewBannerBtn || !bannerWrapper) {
        cleanup();
        return;
    }
    
    if (isInitialized) return;
    
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
    
    lightboxInstance.init();
    
    const handleClick = () => {
        if (!lightboxInstance) return;
        
        const currentBannerImg = bannerWrapper.querySelector('img') as HTMLImageElement;
        if (!currentBannerImg) return;
        
        lightboxInstance.options.dataSource = [currentBannerImg];
        
        lightboxInstance.loadAndOpen(0);
    };
    
    viewBannerBtn.addEventListener('click', handleClick, { passive: true });
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

