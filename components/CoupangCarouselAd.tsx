import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    PartnersCoupang?: any;
  }
}

const CoupangCarouselAd: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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
              // 스크립트 로딩 타임아웃 설정
              const timeoutId = setTimeout(() => {
                if (retryAttempts < maxRetries) {
                  retryAttempts++;
                  loadCoupangAd();
                }
              }, 5000);
              
              // 쿠팡 스크립트 동적 로드
              const script = document.createElement('script');
              script.src = 'https://ads-partners.coupang.com/g.js';
              script.onload = function() {
                clearTimeout(timeoutId);
                if (window.PartnersCoupang && window.PartnersCoupang.G) {
                  try {
                    new window.PartnersCoupang.G({
                      "id": 860463,
                      "trackingCode": "AF4903034",
                      "subId": null,
                      "template": "carousel",
                      "width": "510",
                      "height": "105"
                    });
                    
                    // 성공 시 부모에게 알림
                    setTimeout(() => {
                      parent.postMessage({type: 'coupang-loaded'}, '*');
                    }, 1000);
                  } catch (error) {
                    if (retryAttempts < maxRetries) {
                      retryAttempts++;
                      setTimeout(loadCoupangAd, 2000);
                    }
                  }
                } else {
                  if (retryAttempts < maxRetries) {
                    retryAttempts++;
                    setTimeout(loadCoupangAd, 2000);
                  }
                }
              };
              
              script.onerror = function() {
                clearTimeout(timeoutId);
                if (retryAttempts < maxRetries) {
                  retryAttempts++;
                  setTimeout(loadCoupangAd, 2000);
                }
              };
              
              document.head.appendChild(script);
            } catch (error) {
              // 오류 발생 시 조용히 실패
            }
          }
          
          // 페이지 로드 시 광고 로딩 시작
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadCoupangAd);
          } else {
            loadCoupangAd();
          }
        </script>
      </body>
    </html>
  `;

  const handleIframeMessage = (event: MessageEvent) => {
    if (event.data?.type === 'coupang-loaded') {
      setIsVisible(true);
    }
  };

  useEffect(() => {
    // 메시지 이벤트 리스너 등록
    window.addEventListener('message', handleIframeMessage);
    
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.srcdoc = adHtml;
    }
    
    return () => {
      window.removeEventListener('message', handleIframeMessage);
    };
  }, []);

  // 배너가 성공적으로 로드된 경우에만 표시
  if (!isVisible) {
    return null;
  }

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
