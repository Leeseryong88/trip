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
          /* iframe 내부의 여백 제거 및 중앙 정렬 */
          body { margin: 0; display: flex; justify-content: center; align-items: center; }
        </style>
      </head>
      <body>
        <!-- Coupang Partners 스크립트 -->
        <script src="https://ads-partners.coupang.com/g.js"></script>
        <script>
          new PartnersCoupang.G({
            "id": 860463,
            "trackingCode": "AF4903034",
            "subId": null,
            "template": "carousel",
            "width": "510",
            "height": "105"
          });
        </script>
      </body>
    </html>
  `;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      // iframe의 srcdoc을 설정하여 HTML 콘텐츠를 로드합니다.
      // 이렇게 하면 스크립트가 격리된 환경에서 안전하게 실행됩니다.
      iframe.srcdoc = adHtml;
    }
  }, [adHtml]); // adHtml은 변경되지 않지만, 의존성 배열에 명시합니다.

  return (
    <div className="w-full max-w-[510px] mx-auto flex flex-col items-center mt-8">
      <iframe
        ref={iframeRef}
        title="Coupang Partners Ad"
        width="510" // 광고 스크립트에서 지정한 너비와 일치시킵니다.
        height="105" // 광고 스크립트에서 지정한 높이와 일치시킵니다.
        style={{ border: 'none', overflow: 'hidden' }}
        scrolling="no"
        // 샌드박스를 설정하여 보안을 강화하고, 팝업은 허용합니다.
        sandbox="allow-scripts allow-same-origin allow-popups"
      ></iframe>
      <p className="mt-2 text-xs text-slate-500 italic">
        이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
      </p>
    </div>
  );
};

export default CoupangCarouselAd;
