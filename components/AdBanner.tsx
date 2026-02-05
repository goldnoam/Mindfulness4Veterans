
import React, { useEffect } from 'react';

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  style?: React.CSSProperties;
}

const AdBanner: React.FC<AdBannerProps> = ({ slot = 'default-slot', format = 'auto', style }) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className="w-full flex justify-center my-8 overflow-hidden" style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '250px', ...style }}
        data-ad-client="ca-pub-0274741291001288"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdBanner;
