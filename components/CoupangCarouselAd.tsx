import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    PartnersCoupang?: any;
  }
}

const CoupangCarouselAd: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

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
          .loading {
            color: #64748b;
            font-size: 14px;
            text-align: center;
          }
          .error {
            color: #ef4444;
            font-size: 12px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div id="ad-container">
          <div class="loading">쿠팡 상품 로딩 중...</div>
        </div>
        
        <script>
          let retryAttempts = 0;
          const maxRetries = 3;
          
          function loadCoupangAd() {
            try {
              // 스크립트 로딩 타임아웃 설정
              const timeoutId = setTimeout(() => {
                if (retryAttempts < maxRetries) {
                  retryAttempts++;
                  console.log('쿠팡 광고 로딩 재시도:', retryAttempts);
                  loadCoupangAd();
                } else {
                  document.getElementById('ad-container').innerHTML = '<div class="error">상품 정보를 불러올 수 없습니다.</div>';
                  parent.postMessage({type: 'coupang-error'}, '*');
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
                    
                    // 성공 메시지 전송
                    setTimeout(() => {
                      parent.postMessage({type: 'coupang-loaded'}, '*');
                    }, 1000);
                  } catch (error) {
                    console.error('쿠팡 광고 초기화 오류:', error);
                    if (retryAttempts < maxRetries) {
                      retryAttempts++;
                      setTimeout(loadCoupangAd, 2000);
                    }
                  }
                } else {
                  console.error('PartnersCoupang 객체를 찾을 수 없습니다.');
                  if (retryAttempts < maxRetries) {
                    retryAttempts++;
                    setTimeout(loadCoupangAd, 2000);
                  }
                }
              };
              
              script.onerror = function() {
                clearTimeout(timeoutId);
                console.error('쿠팡 스크립트 로딩 실패');
                if (retryAttempts < maxRetries) {
                  retryAttempts++;
                  setTimeout(loadCoupangAd, 2000);
                } else {
                  document.getElementById('ad-container').innerHTML = '<div class="error">상품 정보를 불러올 수 없습니다.</div>';
                  parent.postMessage({type: 'coupang-error'}, '*');
                }
              };
              
              document.head.appendChild(script);
            } catch (error) {
              console.error('쿠팡 광고 로딩 중 오류:', error);
              parent.postMessage({type: 'coupang-error'}, '*');
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
      setIsLoading(false);
      setIsError(false);
    } else if (event.data?.type === 'coupang-error') {
      setIsLoading(false);
      setIsError(true);
    }
  };

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setIsLoading(true);
      setIsError(false);
      setRetryCount(prev => prev + 1);
      
      // iframe 재로드
      const iframe = iframeRef.current;
      if (iframe) {
        iframe.srcdoc = adHtml;
      }
    }
  };

  useEffect(() => {
    // 메시지 이벤트 리스너 등록
    window.addEventListener('message', handleIframeMessage);
    
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.srcdoc = adHtml;
      
      // 10초 후에도 로딩 중이면 오류로 처리
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          setIsError(true);
        }
      }, 10000);
      
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('message', handleIframeMessage);
      };
    }
    
    return () => {
      window.removeEventListener('message', handleIframeMessage);
    };
  }, [retryCount]);

  return (
    <div className="w-full max-w-[510px] mx-auto flex flex-col items-center mt-8">
      <div className="relative">
        <iframe
          ref={iframeRef}
          title="Coupang Partners Ad"
          width="510"
          height="105"
          style={{ border: 'none', overflow: 'hidden' }}
          scrolling="no"
          sandbox="allow-scripts allow-same-origin allow-popups"
        ></iframe>
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 border border-gray-200 rounded">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
              <span className="text-sm text-gray-600">쿠팡 상품 로딩 중...</span>
            </div>
          </div>
        )}
        
        {isError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 border border-gray-200 rounded">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">상품을 불러올 수 없습니다.</p>
              {retryCount < maxRetries && (
                <button
                  onClick={handleRetry}
                  className="px-3 py-1 text-xs bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200 transition-colors"
                >
                  다시 시도 ({retryCount + 1}/{maxRetries})
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      <p className="mt-2 text-xs text-slate-500 italic">
        이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
      </p>
    </div>
  );
};

export default CoupangCarouselAd;
