import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Wallet as WalletIcon, ExternalLink, Copy, Check, Coins, TrendingUp, Gift } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/stores/userStore';
import { useToast } from '@/hooks/use-toast';

export default function Wallet() {
  const { isAuthenticated, wallet, setWallet, disconnectWallet } = useUserStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleConnect = async (walletType: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Cần đăng nhập',
        description: 'Vui lòng đăng nhập trước khi kết nối ví',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);
    // Simulate wallet connection
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockAddress = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
    const mockBalance = Math.floor(Math.random() * 1000) + 100;

    setWallet({
      address: mockAddress,
      balance: mockBalance,
      connected: true,
    });

    setIsConnecting(false);
    toast({
      title: 'Kết nối thành công! ✨',
      description: `${walletType} đã được kết nối`,
    });
  };

  const handleCopyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Đã sao chép',
        description: 'Địa chỉ ví đã được sao chép vào clipboard',
      });
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast({
      title: 'Đã ngắt kết nối',
      description: 'Ví đã được ngắt kết nối thành công',
    });
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-angel-gold/20 flex items-center justify-center">
              <WalletIcon className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Kết nối Ví Blockchain</h1>
            <p className="text-muted-foreground mb-6">
              Đăng nhập để kết nối ví và nhận Camly Coin
            </p>
            <Link to="/login">
              <Button variant="divine" size="lg">
                Đăng nhập ngay
              </Button>
            </Link>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-angel-gold/20 flex items-center justify-center glow-soft">
              <WalletIcon className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-gradient-divine">Ví Blockchain</span>
            </h1>
            <p className="text-muted-foreground">
              Kết nối ví để nhận và quản lý Camly Coin
            </p>
          </motion.div>

          {wallet.connected ? (
            <>
              {/* Connected Wallet Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-angel-gold/30 shadow-divine mb-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-angel-gold/20 flex items-center justify-center">
                      <WalletIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">MetaMask</p>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                        Đã kết nối
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleDisconnect}>
                    Ngắt kết nối
                  </Button>
                </div>

                <div className="p-4 bg-muted/30 rounded-xl mb-6">
                  <p className="text-xs text-muted-foreground mb-1">Địa chỉ ví</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm flex-1 truncate">{wallet.address}</p>
                    <Button variant="ghost" size="icon" onClick={handleCopyAddress}>
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Balance */}
                <div className="text-center py-6 bg-gradient-to-r from-angel-gold/10 via-angel-pink/10 to-angel-blue/10 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-2">Số dư Camly Coin</p>
                  <div className="flex items-center justify-center gap-2">
                    <Coins className="w-8 h-8 text-primary" />
                    <span className="text-4xl font-bold text-gradient-divine">{wallet.balance}</span>
                    <span className="text-xl text-muted-foreground">CAMLY</span>
                  </div>
                </div>
              </motion.div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-5 bg-white/70 rounded-2xl border border-angel-gold/20 shadow-soft"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-muted-foreground">Đang tăng</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">+12.5%</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-5 bg-white/70 rounded-2xl border border-angel-gold/20 shadow-soft"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Thưởng chờ</span>
                  </div>
                  <p className="text-2xl font-bold">25 CAMLY</p>
                </motion.div>
              </div>

              {/* Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 bg-angel-blue/30 rounded-xl text-center"
              >
                <p className="text-sm text-accent-foreground">
                  💡 Tích lũy Light Points khi chat với ANGEL AI để nhận thêm Camly Coin
                </p>
              </motion.div>
            </>
          ) : (
            <>
              {/* Connect Wallet Options */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <Button
                  variant="holy"
                  size="xl"
                  className="w-full justify-start"
                  onClick={() => handleConnect('MetaMask')}
                  disabled={isConnecting}
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                    alt="MetaMask"
                    className="w-8 h-8"
                  />
                  <div className="text-left flex-1">
                    <p className="font-semibold">MetaMask</p>
                    <p className="text-xs text-muted-foreground">Kết nối ví MetaMask</p>
                  </div>
                </Button>

                <Button
                  variant="holy"
                  size="xl"
                  className="w-full justify-start"
                  onClick={() => handleConnect('Smart Wallet')}
                  disabled={isConnecting}
                >
                  <div className="w-8 h-8 rounded-full bg-angel-gold/20 flex items-center justify-center">
                    <WalletIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold">Smart Wallet</p>
                    <p className="text-xs text-muted-foreground">Tạo ví thông minh mới</p>
                  </div>
                </Button>
              </motion.div>

              {isConnecting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 text-center"
                >
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 rounded-full shadow-divine">
                    <motion.div
                      className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <span className="text-sm">Đang kết nối ví...</span>
                  </div>
                </motion.div>
              )}

              {/* Info Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-10 p-6 bg-white/60 rounded-2xl border border-angel-gold/10"
              >
                <h3 className="font-semibold mb-3">Camly Coin là gì?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Camly Coin (CAMLY) là đồng tiền của yêu thương trong FUN Ecosystem. 
                  Bạn có thể tích lũy CAMLY bằng cách tương tác với ANGEL AI và lan tỏa năng lượng tích cực.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Chat với ANGEL AI để nhận Light Points
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Đổi Light Points thành Camly Coin
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Sử dụng trong FUN Ecosystem
                  </li>
                </ul>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
