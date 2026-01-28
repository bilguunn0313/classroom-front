"use client";

import {
  Menu,
  X,
  LogOut,
  User,
  Settings,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUserContext } from "../lib/userProvider";
import { useSubjects } from "@/hooks/useSubjects";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSubjectsDropdown, setShowSubjectsDropdown] = useState(false);
  const router = useRouter();
  const { user, logout, isAuthenticated } = useUserContext();

  const { subjects, loading: subjectsLoading } = useSubjects();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const handleSubjectClick = (subjectId: number) => {
    router.push(`/subjects/${subjectId}`);
    setShowSubjectsDropdown(false);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-linear-to-r from-blue-600 via-blue-700 to-blue-800 shadow-md border-b border-blue-900">
      {/* NAV BAR */}
      <div className="container mx-auto px-4 ">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo - LEFT */}
          <div className="text-xl sm:text-2xl font-bold cursor-pointer">
            <img
              src="/cosmo-logo.png"
              alt="Logo"
              className="w-[140px] cursor-pointer"
              onClick={() => router.push(`/course`)}
            />
          </div>

          {/* Desktop Navigation - RIGHT */}
          <nav className="hidden lg:flex items-center gap-8 ">
            {/* Subjects Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <div className="flex items-center gap-1 text-white hover:text-blue-200 transition-colors cursor-pointer font-medium ">
                  <BookOpen size={18} />
                  <span>Сэдвүүд</span>
                  <ChevronDown size={16} />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-64 max-h-96 overflow-y-auto"
              >
                <DropdownMenuLabel>Сургалтын сэдвүүд</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    router.push("/subjects");
                    setShowSubjectsDropdown(false);
                  }}
                  className="cursor-pointer bg-blue-50 hover:bg-blue-100 font-semibold text-blue-700"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>Бүх сэдвүүд үзэх</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {subjectsLoading ? (
                  <div className="px-2 py-3 text-sm text-gray-500">
                    Loading subjects...
                  </div>
                ) : subjects.length === 0 ? (
                  <div className="px-2 py-3 text-sm text-gray-500">
                    No subjects available
                  </div>
                ) : (
                  subjects.map((subject) => (
                    <DropdownMenuItem
                      key={subject.id}
                      onClick={() => handleSubjectClick(subject.id)}
                      className="cursor-pointer border-b border-gray-100 last:border-0 hover:bg-blue-50"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{subject.title}</span>
                        {subject.description && (
                          <span className="text-xs text-gray-500 line-clamp-1">
                            {subject.description}
                          </span>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthenticated ? (
              // User Menu
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <Avatar className="h-10 w-10 border-2 border-white ring-2 ring-blue-400/50">
                      <AvatarImage src={user?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-semibold">
                        {user?.name ? getInitials(user.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-white hidden xl:block">
                      {user?.name}
                    </span>
                    <ChevronDown
                      size={16}
                      className="text-white hidden xl:block"
                    />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{user?.name}</span>
                      <span className="text-xs text-gray-500">
                        {user?.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => router.push("/my-courses")}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>Миний сургалтууд</span>
                  </DropdownMenuItem>
                  {user?.role === "admin" && (
                    <DropdownMenuItem
                      onClick={() => router.push("/admin/dashboard")}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Login Button
              <button
                onClick={() => router.push("/login")}
                className="bg-white text-blue-700 px-6 py-2.5 rounded-lg font-medium hover:bg-blue-50 transition-all shadow-md hover:shadow-lg"
              >
                Нэвтрэх |
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-blue-500/50 transition-colors text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* HERO SECTION */}
      {/* <div className="container mx-auto px-4 py-12 sm:py-16 md:py-24 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
          Онлайн сургалтууд руу тавтай морил!
        </h1>
        <p className="text-sm sm:text-base md:text-lg opacity-90 max-w-2xl mx-auto">
          Та хүссэн үедээ, хүссэн газраасаа суралцаж, өөрийгөө хөгжүүлээрэй.
        </p>
      </div> */}

      {/* MOBILE NAVIGATION */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-blue-500/40 bg-blue-700">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {/* Mobile Subjects Accordion */}
            <div className="bg-blue-600 rounded-lg p-3">
              <button
                onClick={() => setShowSubjectsDropdown(!showSubjectsDropdown)}
                className="flex items-center justify-between w-full text-white hover:text-blue-200 transition-colors font-medium"
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={18} />
                  <span>Сэдвүүд</span>
                </div>
                <ChevronDown
                  size={18}
                  className={`transition-transform ${
                    showSubjectsDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showSubjectsDropdown && (
                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      router.push("/subjects");
                      setShowSubjectsDropdown(false);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left py-3 px-3 rounded-lg bg-white text-blue-700 hover:bg-blue-50 transition-colors font-semibold border-2 border-white mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen size={18} />
                      <span>Бүх сэдвүүд үзэх</span>
                    </div>
                  </button>
                  {subjectsLoading ? (
                    <div className="text-sm text-blue-200 py-2">
                      Loading subjects...
                    </div>
                  ) : subjects.length === 0 ? (
                    <div className="text-sm text-blue-200 py-2">
                      No subjects available
                    </div>
                  ) : (
                    subjects.map((subject) => (
                      <button
                        key={subject.id}
                        onClick={() => handleSubjectClick(subject.id)}
                        className="block w-full text-left py-2 px-3 rounded-lg hover:bg-blue-500/50 transition-colors border border-blue-400/50"
                      >
                        <div className="font-medium text-sm text-white">
                          {subject.title}
                        </div>
                        {subject.description && (
                          <div className="text-xs text-blue-200 line-clamp-1 mt-0.5">
                            {subject.description}
                          </div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <>
                <div className="bg-blue-600 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12 border-2 border-white">
                      <AvatarImage src={user?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-500 text-white">
                        {user?.name ? getInitials(user.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">
                        {user?.name}
                      </span>
                      <span className="text-xs text-blue-200">
                        {user?.email}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => router.push("/my-courses")}
                      className="flex items-center gap-3 text-white hover:bg-blue-500/50 transition-colors py-2 px-3 rounded-lg w-full"
                    >
                      <BookOpen size={18} />
                      <span>Миний сургалтууд</span>
                    </button>
                    {user?.role === "admin" && (
                      <button
                        onClick={() => router.push("/admin/dashboard")}
                        className="flex items-center gap-3 text-white hover:bg-blue-500/50 transition-colors py-2 px-3 rounded-lg w-full"
                      >
                        <Settings size={18} />
                        <span>Dashboard</span>
                      </button>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-lg hover:bg-red-600 transition-colors font-medium w-full"
                >
                  <LogOut size={18} />
                  <span>Гарах</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="bg-white text-blue-700 px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors font-medium w-full"
              >
                Нэвтрэх | Бүртгүүлэх
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
