import React, { useEffect, useRef } from 'react';
import { useResponsiveLayout } from '../services/deviceDetection';

declare global {
  interface Window {
    PartnersCoupang?: any;
  }
}

const CoupangCarouselAd: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // 디바이스 정보 가져오기
  const { deviceInfo, isMobile, isTablet, isDesktop } = useResponsiveLayout();

  // 디바이스별 광고 설정
  const getAdConfig = () => {
    if (isMobile) {
      return {
        width: 320,
        height: 100,
        template: 'carousel',
        containerClass: 'max-w-[320px]',
        iframeStyle: { width: '320px', height: '100px' }
      };
    } else if (isTablet) {
      return {
        width: 468,
        height: 60,
        template: 'carousel',
        containerClass: 'max-w-[468px]',
        iframeStyle: { width: '468px', height: '60px' }
      };
    } else {
      return {
        width: 510,
        height: 105,
        template: 'carousel',
        containerClass: 'max-w-[510px]',
        iframeStyle: { width: '510px', height: '105px' }
      };
    }
  };

  const adConfig = getAdConfig();

  // 광고 스크립트를 포함한 전체 HTML 문서 (동적 크기)
  const getAdHtml = () => `
    <!DOCTYPE html>
    <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            margin: 0; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            font-family: system-ui, -apple-system, sans-serif;
            min-height: ${adConfig.height}px;
            width: 100%;
            overflow: hidden;
          }
          #ad-container {
            width: ${adConfig.width}px;
            height: ${adConfig.height}px;
            display: flex;
            justify-content: center;
            align-items: center;
            max-width: 100%;
          }
          @media (max-width: 480px) {
            #ad-container {
              width: 100%;
              max-width: ${adConfig.width}px;
            }
          }
        </style>
      </head>
      <body>
        <div id="ad-container"></div>
        
        <script>
          let retryAttempts = 0;
          const maxRetries = 3;
          
          function loadCoupangAd() {
            try {
              // 쿠팡 스크립트 동적 로드
              const script = document.createElement('script');
              script.src = 'https://ads-partners.coupang.com/g.js';
              
              script.onload = function() {
                // 스크립트 로드 성공 후 쿠팡 광고 초기화
                setTimeout(() => {
                  try {
                    if (window.PartnersCoupang && window.PartnersCoupang.G) {
                      new window.PartnersCoupang.G({
                        "id": 860463,
                        "trackingCode": "AF4903034",
                        "subId": null,
                        "template": "${adConfig.template}",
                        "width": "${adConfig.width}",
                        "height": "${adConfig.height}"
                      });
                    } else if (retryAttempts < maxRetries) {
                      retryAttempts++;
                      setTimeout(loadCoupangAd, 2000);
                    }
                  } catch (error) {
                    if (retryAttempts < maxRetries) {
                      retryAttempts++;
                      setTimeout(loadCoupangAd, 2000);
                    }
                  }
                }, 500);
              };
              
              script.onerror = function() {
                if (retryAttempts < maxRetries) {
                  retryAttempts++;
                  setTimeout(loadCoupangAd, 2000);
                }
              };
              
              document.head.appendChild(script);
            } catch (error) {
              // 오류 발생 시 조용히 실패
              console.error('쿠팡 광고 로딩 오류:', error);
            }
          }
          
          // DOM이 준비되면 광고 로딩 시작
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadCoupangAd);
          } else {
            loadCoupangAd();
          }
        </script>
      </body>
    </html>
  `;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.srcdoc = getAdHtml();
    }
  }, [deviceInfo.deviceType]); // 디바이스 타입이 변경될 때마다 광고 재로드

  // 디바이스별 텍스트 크기 설정
  const getTextSize = () => {
    if (isMobile) return 'text-xs';
    if (isTablet) return 'text-sm';
    return 'text-sm';
  };

  // 디바이스별 여백 설정
  const getMarginTop = () => {
    if (isMobile) return 'mt-4';
    if (isTablet) return 'mt-6';
    return 'mt-8';
  };

  return (
    <div className={`w-full ${adConfig.containerClass} mx-auto flex flex-col items-center ${getMarginTop()}`}>
      <iframe
        ref={iframeRef}
        title="Coupang Partners Ad"
        width={adConfig.width}
        height={adConfig.height}
        style={{ 
          border: 'none', 
          overflow: 'hidden',
          ...adConfig.iframeStyle,
          maxWidth: '100%'
        }}
        scrolling="no"
        sandbox="allow-scripts allow-same-origin allow-popups"
      ></iframe>
      
      <p className={`mt-2 ${getTextSize()} text-slate-500 italic text-center px-2`}>
        이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
      </p>
    </div>
  );
};

export default CoupangCarouselAd;
