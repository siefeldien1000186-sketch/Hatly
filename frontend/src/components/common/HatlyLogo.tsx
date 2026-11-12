import React from 'react';

interface HatlyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
  textColor?: string;
}

export const HatlyLogo: React.FC<HatlyLogoProps> = ({
  className = '',
  size = 'md',
  withText = true,
  textColor = 'text-[#151515]',
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-lg', sub: 'text-[9px]' },
    md: { icon: 'w-10 h-10', text: 'text-2xl', sub: 'text-[11px]' },
    lg: { icon: 'w-14 h-14', text: 'text-3xl', sub: 'text-xs' },
    xl: { icon: 'w-20 h-20', text: 'text-4xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Real Hatly Brand Icon (Delivery Courier & Customer forming the "H" with Package) */}
      <div className={`relative ${currentSize.icon} flex-shrink-0 drop-shadow-sm`}>
        <img
          src="/hatly-app-icon.png"
          alt="Hatly Logo"
          className="w-full h-full object-contain rounded-2xl shadow-sm transition-transform duration-200 hover:scale-105"
        />
      </div>

      {withText && (
        <div className="flex flex-col text-start select-none">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-black tracking-tight ${textColor} ${currentSize.text}`}>
              هاتلي
            </span>
            <span className="text-[10px] font-extrabold uppercase bg-[#E70209] text-white px-1.5 py-0.5 rounded tracking-wider shadow-sm">
              HATLY
            </span>
          </div>
          <span className={`text-gray-500 font-bold mt-1 ${currentSize.sub}`}>
            اطلب هاتلي، هيجيلك وقتي
          </span>
        </div>
      )}
    </div>
  );
};

export default HatlyLogo;
