import { useEffect, useState } from 'react';
import { gsap } from 'gsap';

const CurtainReveal = ({ onComplete }: { onComplete: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        setIsVisible(false);
        onComplete();
      }
    });

    // 初始延迟
    tl.to({}, { duration: 0.5 });

    // 左右画布同时向两边拉开，带有轻微的旋转效果
    tl.to('.canvas-left', {
      xPercent: -105,
      rotateY: -15,
      duration: 1.4,
      ease: 'power4.inOut'
    });

    tl.to('.canvas-right', {
      xPercent: 105,
      rotateY: 15,
      duration: 1.4,
      ease: 'power4.inOut'
    }, '<');

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden" style={{ perspective: '1500px' }}>
      {/* 左侧画布 */}
      <div
        className="canvas-left absolute top-0 left-0 w-1/2 h-full"
        style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
      >
        <div className="absolute inset-0 bg-[#f7f5f2]">
          {/* 细腻磨砂质感 */}
          <div className="absolute inset-0 opacity-[0.12]"
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
               }}
          />

          {/* 涂料不均匀质感 */}
          <div className="absolute inset-0 opacity-[0.08]"
               style={{
                 background: `
                   radial-gradient(ellipse at 20% 30%, rgba(0,0,0,0.03) 0%, transparent 50%),
                   radial-gradient(ellipse at 80% 70%, rgba(0,0,0,0.02) 0%, transparent 40%),
                   radial-gradient(ellipse at 40% 80%, rgba(0,0,0,0.025) 0%, transparent 45%),
                   radial-gradient(ellipse at 70% 20%, rgba(0,0,0,0.02) 0%, transparent 35%)
                 `
               }}
          />

          {/* 边缘微妙阴影 */}
          <div className="absolute inset-0"
               style={{
                 boxShadow: 'inset -30px 0 50px -20px rgba(0,0,0,0.06)'
               }}
          />
        </div>
      </div>

      {/* 右侧画布 */}
      <div
        className="canvas-right absolute top-0 right-0 w-1/2 h-full"
        style={{ transformOrigin: 'right center', transformStyle: 'preserve-3d' }}
      >
        <div className="absolute inset-0 bg-[#f7f5f2]">
          {/* 细腻磨砂质感 */}
          <div className="absolute inset-0 opacity-[0.12]"
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
               }}
          />

          {/* 涂料不均匀质感 */}
          <div className="absolute inset-0 opacity-[0.08]"
               style={{
                 background: `
                   radial-gradient(ellipse at 80% 30%, rgba(0,0,0,0.03) 0%, transparent 50%),
                   radial-gradient(ellipse at 20% 70%, rgba(0,0,0,0.02) 0%, transparent 40%),
                   radial-gradient(ellipse at 60% 80%, rgba(0,0,0,0.025) 0%, transparent 45%),
                   radial-gradient(ellipse at 30% 20%, rgba(0,0,0,0.02) 0%, transparent 35%)
                 `
               }}
          />

          {/* 边缘微妙阴影 */}
          <div className="absolute inset-0"
               style={{
                 boxShadow: 'inset 30px 0 50px -20px rgba(0,0,0,0.06)'
               }}
          />
        </div>
      </div>

    </div>
  );
};

export default CurtainReveal;
