import { useState, useEffect } from 'react';

// 디바이스 타입 정의
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// 브레이크포인트 정의
const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// 디바이스 감지 인터페이스
export interface DeviceInfo {
  deviceType: DeviceType;
  screenSize: ScreenSize;
  isTouchDevice: boolean;
  isPortrait: boolean;
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

// 사용자 에이전트로 디바이스 타입 감지
export const detectDeviceFromUserAgent = (): DeviceType => {
  if (typeof window === 'undefined') return 'desktop';
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);
  
  if (isMobile && !isTablet) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
};

// 터치 디바이스 감지
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  );
};

// 화면 크기로 디바이스 타입 결정
export const getDeviceTypeFromWidth = (width: number): DeviceType => {
  if (width < BREAKPOINTS.md) return 'mobile';
  if (width < BREAKPOINTS.xl) return 'tablet';
  return 'desktop';
};

// 화면 크기 카테고리 결정
export const getScreenSize = (width: number): ScreenSize => {
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
};

// 디바이스 정보 생성
export const createDeviceInfo = (width: number, height: number): DeviceInfo => {
  const screenSize = getScreenSize(width);
  const deviceTypeFromWidth = getDeviceTypeFromWidth(width);
  const deviceTypeFromUA = detectDeviceFromUserAgent();
  const isTouch = isTouchDevice();
  
  // 사용자 에이전트와 화면 크기를 조합해서 최종 디바이스 타입 결정
  let deviceType: DeviceType = deviceTypeFromWidth;
  if (isTouch && deviceTypeFromUA === 'mobile' && width < BREAKPOINTS.lg) {
    deviceType = 'mobile';
  } else if (isTouch && deviceTypeFromUA === 'tablet') {
    deviceType = 'tablet';
  }
  
  return {
    deviceType,
    screenSize,
    isTouchDevice: isTouch,
    isPortrait: height > width,
    width,
    height,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
  };
};

// 디바이스 감지 React 훅
export const useDeviceDetection = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return createDeviceInfo(1024, 768); // 기본값
    }
    return createDeviceInfo(window.innerWidth, window.innerHeight);
  });

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(createDeviceInfo(window.innerWidth, window.innerHeight));
    };

    // 초기 설정
    handleResize();

    // 리사이즈 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return deviceInfo;
};

// 특정 브레이크포인트 체크 훅
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    
    listener();
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
};

// 레이아웃 설정 인터페이스
export interface LayoutConfig {
  containerPadding: string;
  cardPadding: string;
  fontSize: string;
  buttonSize: string;
  iconSize: string;
  spacing: string;
  gridCols: string;
  maxWidth: string;
}

// 디바이스별 레이아웃 설정
export const getLayoutConfig = (deviceInfo: DeviceInfo): LayoutConfig => {
  if (deviceInfo.isMobile) {
    return {
      containerPadding: 'p-3',
      cardPadding: 'p-4',
      fontSize: 'text-base',
      buttonSize: 'py-3 px-4',
      iconSize: 'h-5 w-5',
      spacing: 'space-y-3',
      gridCols: 'grid-cols-1',
      maxWidth: 'max-w-md',
    };
  } else if (deviceInfo.isTablet) {
    return {
      containerPadding: 'p-6',
      cardPadding: 'p-6',
      fontSize: 'text-lg',
      buttonSize: 'py-4 px-6',
      iconSize: 'h-6 w-6',
      spacing: 'space-y-4',
      gridCols: 'grid-cols-1 md:grid-cols-2',
      maxWidth: 'max-w-2xl',
    };
  } else {
    return {
      containerPadding: 'p-6 lg:p-8',
      cardPadding: 'p-6 lg:p-8',
      fontSize: 'text-lg',
      buttonSize: 'py-4 px-6',
      iconSize: 'h-6 w-6',
      spacing: 'space-y-5',
      gridCols: 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3',
      maxWidth: 'max-w-5xl',
    };
  }
};

// 레이아웃 설정 훅
export const useResponsiveLayout = () => {
  const deviceInfo = useDeviceDetection();
  const layoutConfig = getLayoutConfig(deviceInfo);
  
  return {
    deviceInfo,
    layoutConfig,
    // 편의 함수들
    isMobile: deviceInfo.isMobile,
    isTablet: deviceInfo.isTablet,
    isDesktop: deviceInfo.isDesktop,
    isTouchDevice: deviceInfo.isTouchDevice,
  };
}; 