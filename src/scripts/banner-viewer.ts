import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

let isInitialized = false;
// 缓存当前页面显示的 banner 图片 URL，确保点击时显示的是同一张图片
let cachedBannerUrl: string | null = null;

async function fetchRedirectedUrl(url: string): Promise<string | null> {
    try {
        // 使用 HEAD 请求跟随 302 重定向，获取最终的图片 URL
        const response = await fetch(url, {
            method: 'HEAD',
            redirect: 'follow'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // 从响应的 URL 获取重定向后的最终地址
        return response.url;
    } catch (error) {
        console.error('获取重定向 URL 失败:', error);
        return null;
    }
}

async function getBannerImageUrl(): Promise<string | null> {
    // 如果已有缓存，直接返回缓存的 URL（确保是同一张图片）
    if (cachedBannerUrl) {
        return cachedBannerUrl;
    }
    
    // 首先尝试从页面上显示的 banner 图片获取 URL
    const bannerWrapper = document.getElementById('banner-wrapper');
    if (bannerWrapper) {
        const bannerImg = bannerWrapper.querySelector('img');
        if (bannerImg) {
            const imgSrc = bannerImg.currentSrc || bannerImg.src;
            
            // 如果 src 是 /api/random，需要获取重定向后的实际 URL
            if (imgSrc.includes('/api/random') || imgSrc.endsWith('/api/random')) {
                const redirectedUrl = await fetchRedirectedUrl('/api/random');
                if (redirectedUrl) {
                    // 缓存结果，确保后续使用同一张图片
                    cachedBannerUrl = redirectedUrl;
                    return redirectedUrl;
                }
            }
            
            // 如果已经是完整的图片 URL，直接返回并缓存
            cachedBannerUrl = imgSrc;
            return imgSrc;
        }
    }
    
    // 如果找不到图片元素，回退到直接请求 API
    const redirectedUrl = await fetchRedirectedUrl('/api/random');
    if (redirectedUrl) {
        cachedBannerUrl = redirectedUrl;
        return redirectedUrl;
    }
    
    return null;
}

// 在页面加载时，如果 banner 图片使用 /api/random，预先获取并缓存 URL
function preloadBannerUrl() {
    const bannerWrapper = document.getElementById('banner-wrapper');
    if (bannerWrapper) {
        const bannerImg = bannerWrapper.querySelector('img');
        if (bannerImg) {
            const imgSrc = bannerImg.currentSrc || bannerImg.src;
            // 如果 src 是 /api/random，预先获取重定向后的 URL 并缓存
            if (imgSrc.includes('/api/random') || imgSrc.endsWith('/api/random')) {
                fetchRedirectedUrl('/api/random').then(url => {
                    if (url) {
                        cachedBannerUrl = url;
                    }
                });
            } else {
                // 如果已经是完整 URL，直接缓存
                cachedBannerUrl = imgSrc;
            }
        }
    }
}

function initBannerPhotoSwipe() {
    const viewBannerBtn = document.getElementById('view-banner-btn');
    
    if (!viewBannerBtn) {
        isInitialized = false;
        return;
    }
    
    if (isInitialized) return;
    
    const handleClick = async () => {
        // 获取页面上显示的 banner 图片的实际 URL
        const bannerSrc = await getBannerImageUrl();
        
        if (!bannerSrc) {
            console.error('无法获取 Banner 图片 URL');
            return;
        }
        
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
                    bgOpacity: 0.8,
                    showHideAnimationType: 'zoom',
                    initialZoomLevel: 'fit',
                    secondaryZoomLevel: 1.5,
                    maxZoomLevel: 4,
                    spacing: 0.1,
                    allowPanToNext: true,
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
    document.addEventListener('DOMContentLoaded', () => {
        initBannerPhotoSwipe();
        // 延迟预加载，确保图片元素已渲染
        setTimeout(preloadBannerUrl, 100);
    });
} else {
    initBannerPhotoSwipe();
    // 延迟预加载，确保图片元素已渲染
    setTimeout(preloadBannerUrl, 100);
}

document.addEventListener('swup:contentReplaced', () => {
    // 清除缓存，因为新页面可能显示不同的图片
    cachedBannerUrl = null;
    isInitialized = false;
    initBannerPhotoSwipe();
    // 延迟预加载新页面的 banner URL
    setTimeout(preloadBannerUrl, 100);
});

