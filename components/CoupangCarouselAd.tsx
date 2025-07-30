import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    PartnersCoupang?: any;
  }
}

const CoupangCarouselAd: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 광고 스크립트를 포함한 전체 HTML 문서
  const adHtml = `
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
            min-height: 105px;
          }
          #ad-container {
            width: 510px;
            height: 105px;
            display: flex;
            justify-content: center;
            align-items: center;
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
                        "template": "carousel",
                        "width": "510",
                        "height": "105"
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
      iframe.srcdoc = adHtml;
    }
  }, []);

  return (
    <div className="w-full max-w-[510px] mx-auto flex flex-col items-center mt-8">
      <iframe
        ref={iframeRef}
        title="Coupang Partners Ad"
        width="510"
        height="105"
        style={{ border: 'none', overflow: 'hidden' }}
        scrolling="no"
        sandbox="allow-scripts allow-same-origin allow-popups"
      ></iframe>
      
      <p className="mt-2 text-xs text-slate-500 italic">
        이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
      </p>
    </div>
  );
};

export default CoupangCarouselAd;
