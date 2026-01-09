import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

let isInitialized = false;
let cachedBannerSrc: string | null = null;
let cachedImageWidth: number | null = null;
let cachedImageHeight: number | null = null;
let lightboxInstance: PhotoSwipeLightbox | null = null;

function cleanup() {
    if (lightboxInstance) {
        lightboxInstance.destroy();
        lightboxInstance = null;
    }
    isInitialized = false;
    cachedBannerSrc = null;
    cachedImageWidth = null;
    cachedImageHeight = null;
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
    
    const cacheImageData = () => {
        if (bannerImg.complete && bannerImg.naturalWidth > 0) {
            cachedBannerSrc = bannerImg.currentSrc || bannerImg.src;
            cachedImageWidth = bannerImg.naturalWidth;
            cachedImageHeight = bannerImg.naturalHeight;
        } else {
            bannerImg.addEventListener('load', () => {
                cachedBannerSrc = bannerImg.currentSrc || bannerImg.src;
                cachedImageWidth = bannerImg.naturalWidth;
                cachedImageHeight = bannerImg.naturalHeight;
            }, { once: true });
        }
    };
    
    cacheImageData();
    
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
        
        const bannerSrc = cachedBannerSrc || bannerImg.currentSrc || bannerImg.src;
        const width = cachedImageWidth || bannerImg.naturalWidth || 1920;
        const height = cachedImageHeight || bannerImg.naturalHeight || 1080;
        
        lightboxInstance.options.dataSource = [
            {
                src: bannerSrc,
                width: width,
                height: height,
                alt: 'Banner 原图'
            }
        ];
        
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

