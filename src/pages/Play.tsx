import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Maximize, Minimize, LogOut, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function Play() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else if (containerRef.current) {
      await containerRef.current.requestFullscreen?.();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-celestial flex flex-col">
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-angel-gold/20 bg-background/70 backdrop-blur-xl">
        <h1 className="flex items-center gap-2 text-base font-semibold text-gradient-divine">
          <Gamepad2 className="w-5 h-5 text-primary" />
          Angel Game
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="holy" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
            </span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 p-2 sm:p-4">
        <div
          ref={containerRef}
          className="relative w-full h-[calc(100vh-5.5rem)] rounded-2xl overflow-hidden border border-angel-gold/20 shadow-divine bg-background"
        >
          <iframe
            src="/game/index.html"
            title="Angel AI Unity WebGL Game"
            className="w-full h-full border-0"
            allow="fullscreen; autoplay; gamepad; xr-spatial-tracking"
          />
        </div>
      </main>
    </div>
  );
}
