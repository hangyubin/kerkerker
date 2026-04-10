"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Home, Film, Tv, Clock, Video, Github, Calendar, History, Palette } from "lucide-react";
import { HistoryPopup } from "./HistoryPopup";
import { getCurrentTheme, setTheme, themes, ThemeName } from "@/lib/theme";

interface NavbarProps {
  scrolled: boolean;
  onSearchOpen: () => void;
}

export function Navbar({ scrolled, onSearchOpen }: NavbarProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(getCurrentTheme());
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  // 防止移动端菜单打开时页面滚动
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // 处理主题切换
  const handleThemeChange = (theme: ThemeName) => {
    setTheme(theme);
    setCurrentTheme(theme);
    setIsThemeMenuOpen(false);
  };



  const navItems = [
    { href: "/", label: "首页", icon: Home },
    { href: "/browse/movies", label: "电影", icon: Film },
    { href: "/browse/tv", label: "电视剧", icon: Tv },
    { href: "/calendar", label: "追剧日历", icon: Calendar },
    { href: "/browse/latest", label: "最新", icon: Clock },
    { href: "/history", label: "历史记录", icon: History, mobileOnly: true },
    {
      label: "短剧",
      icon: Video,
      children: [
        { href: "/shorts", label: "短剧" },
        { href: "/dailymotion", label: "短剧Motion" },
      ],
    },
    {
      href: "https://github.com/unilei/kerkerker",
      label: "Github",
      icon: Github,
      external: true,
    },
  ];

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[var(--theme-background)]/80 backdrop-blur-md border-b border-[var(--theme-border)] shadow-lg shadow-black/80`}
      >
        <div className="px-4 md:px-12 py-3 md:py-4 flex items-center justify-between">
          {/* 左侧：汉堡菜单（移动端）+ Logo */}
          <div className="flex items-center space-x-2 md:space-x-8">
            {/* 汉堡菜单按钮 - 仅移动端 */}
            <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 hover:bg-black/10 rounded-lg transition-colors"
                  aria-label="菜单"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6 text-[var(--theme-text)]" />
                  ) : (
                    <Menu className="w-6 h-6 text-[var(--theme-text)]" />
                  )}
                </button>

            {/* Logo */}
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-1"
            >
              <Image 
                src="/logo.png" 
                alt="光影流年" 
                width={32} 
                height={32} 
                className="w-8 h-8 md:w-10 md:h-10"
              />
              <span className="text-[var(--theme-primary)] text-xl md:text-2xl lg:text-3xl font-bold tracking-tight hover:text-[var(--theme-primary)]/80 transition-colors">
                光影流年
              </span>
            </Link>

            {/* 导航链接 - 桌面端 */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.filter(item => !('mobileOnly' in item && item.mobileOnly)).map((item) =>
                item.children ? (
                  <div
                    key={item.label}
                    className="relative group"
                    onMouseEnter={() => setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button className="text-[var(--theme-textSecondary)] hover:text-[var(--theme-text)] transition-colors text-sm font-medium flex items-center gap-1 py-2">
                      {item.label}
                      <svg
                        className={`w-3 h-3 transition-transform duration-200 ${
                          openDropdown === item.label ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {/* 下拉菜单 - 使用 pt-2 创建无缝hover区域 */}
                    {openDropdown === item.label && (
                      <div className="absolute top-full left-0 pt-1">
                        <div className="py-2 bg-[var(--theme-surface)] rounded-lg shadow-2xl border border-[var(--theme-border)] min-w-[140px] overflow-hidden">
                          {/* 顶部主题装饰线 */}
                          <div className="absolute top-1 left-0 right-0 h-0.5 bg-[var(--theme-primary)]" />
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block px-4 py-2.5 text-sm text-[var(--theme-textSecondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-primary)]/20 transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href!}
                    target={item.external ? "_blank" : undefined}
                    className="text-[var(--theme-textSecondary)] hover:text-[var(--theme-text)] transition-colors text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>
          </div>

          {/* 右侧功能区 */}
          <div className="flex items-center space-x-1 md:space-x-2">
            {/* 主题切换按钮 */}
            <div className="relative group">
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="p-2 hover:bg-black/10 rounded-full transition-colors"
                aria-label="主题"
              >
                <Palette className="w-5 h-5 md:w-6 md:h-6 text-[var(--theme-text)]" />
              </button>
              
              {/* 主题菜单 */}
              {isThemeMenuOpen && (
                <div className="absolute top-full right-0 mt-2 py-2 bg-[var(--theme-surface)] rounded-lg shadow-2xl border border-[var(--theme-border)] min-w-[160px] overflow-hidden z-50">
                  {/* 顶部装饰线 - 主题颜色 */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-blue-600" />
                  {Object.entries(themes).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => handleThemeChange(key as ThemeName)}
                      className={`w-full px-4 py-2.5 text-sm text-left transition-colors flex items-center gap-2 ${
                        currentTheme === key ? "text-[var(--theme-text)] bg-[var(--theme-primary)]/20" : "text-[var(--theme-textSecondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-primary)]/10"
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.primary }} />
                      <span>{theme.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 搜索按钮 */}
            <button
              onClick={onSearchOpen}
              className="p-2 hover:bg-black/10 rounded-full transition-colors"
              aria-label="搜索"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-[var(--theme-text)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* 历史记录弹出 */}
            <HistoryPopup />
          </div>
        </div>
      </nav>

      {/* 移动端侧边栏菜单 */}
      <div
        className={`md:hidden fixed inset-0 z-[60] transition-opacity duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* 背景遮罩 */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* 侧边栏内容 */}
        <div
          className={`absolute top-0 left-0 h-full w-[280px] bg-gradient-to-b from-[var(--theme-background)] to-[var(--theme-background)] shadow-2xl transform transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* 侧边栏头部 */}
          <div className="p-6 border-b border-[var(--theme-border)]">
            <div className="flex items-center gap-2">
              <img className="w-10 h-10" src="/logo.png" alt="logo" />
              <h2 className="text-[var(--theme-primary)] text-2xl font-bold tracking-tight">
                光影流年
              </h2>
            </div>
          </div>

          {/* 导航菜单 */}
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              if (item.children) {
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center space-x-3 px-4 py-3 text-[var(--theme-textSecondary)]">
                      <Icon className="w-5 h-5 text-[var(--theme-textSecondary)]" />
                      <span className="text-base font-medium text-[var(--theme-textSecondary)]">
                        {item.label}
                      </span>
                    </div>
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 pl-12 rounded-lg text-[var(--theme-textSecondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-primary)]/10 transition-all duration-200"
                      >
                        <span className="text-sm font-medium">
                          {child.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  target={item.external ? "_blank" : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-[var(--theme-textSecondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-primary)]/10 transition-all duration-200 group"
                >
                  <Icon className="w-5 h-5 text-[var(--theme-textSecondary)] group-hover:text-[var(--theme-primary)] transition-colors" />
                  <span className="text-base font-medium text-[var(--theme-textSecondary)] group-hover:text-[var(--theme-text)]">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* 侧边栏底部 */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[var(--theme-border)]">
            <p className="text-xs text-[var(--theme-textSecondary)] text-center">
              © 2026 光影流年 · 这就是个壳儿
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
