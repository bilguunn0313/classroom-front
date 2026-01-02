// // components/Header.tsx
// "use client";

// import { Menu, X, LogOut, User, Settings } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { useUserContext } from "../lib/userProvider";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// const Header = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const router = useRouter();
//   const { user, logout, isAuthenticated } = useUserContext();

//   const getInitials = (name: string) => {
//     return name
//       .split(" ")
//       .map((n) => n[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   const handleLogout = () => {
//     logout();
//     setIsMenuOpen(false);
//   };

//   return (
//     <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white">
//       {/* NAV BAR */}
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between h-16">
//           {/* Logo - LEFT */}
//           <div className="text-xl sm:text-2xl font-bold">
//             <img
//               src="/cosmo-logo.png"
//               alt="Logo"
//               className="w-[120px] cursor-pointer"
//               onClick={() => router.push(`/course`)}
//             />
//           </div>

//           {/* Desktop Navigation - RIGHT */}
//           <nav className="hidden lg:flex items-center gap-6">
//             <a
//               href="/courses"
//               className="hover:text-blue-200 transition-colors"
//             >
//               Бүх сургалт
//             </a>
//             <a
//               href="/free-videos"
//               className="hover:text-blue-200 transition-colors"
//             >
//               Үнэгүй видеонууд
//             </a>

//             {isAuthenticated ? (
//               // User Menu
//               <DropdownMenu>
//                 <DropdownMenuTrigger className="focus:outline-none">
//                   <div className="flex items-center gap-2 cursor-pointer">
//                     <Avatar className="h-9 w-9 border-2 border-white">
//                       <AvatarImage src={user?.avatar} />
//                       <AvatarFallback className="bg-blue-500 text-white">
//                         {user?.name ? getInitials(user.name) : "U"}
//                       </AvatarFallback>
//                     </Avatar>
//                     <span className="text-sm font-medium hidden xl:block">
//                       {user?.name}
//                     </span>
//                   </div>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end" className="w-56">
//                   <DropdownMenuLabel>
//                     <div className="flex flex-col">
//                       <span className="font-medium">{user?.name}</span>
//                       <span className="text-xs text-gray-500">
//                         {user?.email}
//                       </span>
//                     </div>
//                   </DropdownMenuLabel>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem onClick={() => router.push("/profile")}>
//                     <User className="mr-2 h-4 w-4" />
//                     <span>Profile</span>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => router.push("/settings")}>
//                     <Settings className="mr-2 h-4 w-4" />
//                     <span>Settings</span>
//                   </DropdownMenuItem>
//                   {user?.role === "admin" && (
//                     <DropdownMenuItem
//                       onClick={() => router.push("/admin/dashboard")}
//                     >
//                       <Settings className="mr-2 h-4 w-4" />
//                       <span>Admin Dashboard</span>
//                     </DropdownMenuItem>
//                   )}

//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem
//                     onClick={handleLogout}
//                     className="text-red-600"
//                   >
//                     <LogOut className="mr-2 h-4 w-4" />
//                     <span>Logout</span>
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             ) : (
//               // Login Button
//               <button
//                 onClick={() => router.push("/login")}
//                 className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
//               >
//                 Нэвтрэх | Бүртгүүлэх
//               </button>
//             )}
//           </nav>

//           {/* Mobile Menu Button */}
//           <button
//             className="lg:hidden"
//             onClick={() => setIsMenuOpen(!isMenuOpen)}
//           >
//             {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
//           </button>
//         </div>
//       </div>

//       {/* HERO SECTION */}
//       <div className="container mx-auto px-4 py-12 sm:py-16 md:py-24 text-center">
//         <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
//           Онлайн сургалтууд руу тавтай морил!
//         </h1>
//         <p className="text-sm sm:text-base md:text-lg opacity-90 max-w-2xl mx-auto">
//           Та хүссэн үедээ, хүссэн газраасаа суралцаж, өөрийгөө хөгжүүлээрэй.
//         </p>
//       </div>

//       {/* MOBILE NAVIGATION */}
//       {isMenuOpen && (
//         <div className="lg:hidden border-t border-blue-500/40">
//           <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
//             <a
//               href="/courses"
//               className="hover:text-blue-200 transition-colors py-2"
//             >
//               Бүх сургалт
//             </a>
//             <a
//               href="/free-videos"
//               className="hover:text-blue-200 transition-colors py-2"
//             >
//               Үнэгүй видеонууд
//             </a>

//             {isAuthenticated ? (
//               <>
//                 <div className="border-t border-blue-500/40 pt-3 mt-2">
//                   <div className="flex items-center gap-3 mb-3">
//                     <Avatar className="h-10 w-10 border-2 border-white">
//                       <AvatarImage src={user?.avatar} />
//                       <AvatarFallback className="bg-blue-500 text-white">
//                         {user?.name ? getInitials(user.name) : "U"}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div className="flex flex-col">
//                       <span className="font-medium">{user?.name}</span>
//                       <span className="text-xs opacity-80">{user?.email}</span>
//                     </div>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => router.push("/profile")}
//                   className="flex items-center gap-2 hover:text-blue-200 transition-colors py-2"
//                 >
//                   <User size={18} />
//                   <span>Profile</span>
//                 </button>
//                 <button
//                   onClick={() => router.push("/settings")}
//                   className="flex items-center gap-2 hover:text-blue-200 transition-colors py-2"
//                 >
//                   <Settings size={18} />
//                   <span>Settings</span>
//                 </button>
//                 {user?.role === "admin" && (
//                   <button
//                     onClick={() =>
//                       router.push(
//                         user.role === "admin"
//                           ? "/admin/dashboard"
//                           : "/teacher/dashboard"
//                       )
//                     }
//                     className="flex items-center gap-2 hover:text-blue-200 transition-colors py-2"
//                   >
//                     <Settings size={18} />
//                     <span>Dashboard</span>
//                   </button>
//                 )}
//                 <button
//                   onClick={handleLogout}
//                   className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors mt-2"
//                 >
//                   <LogOut size={18} />
//                   <span>Logout</span>
//                 </button>
//               </>
//             ) : (
//               <button
//                 onClick={() => router.push("/login")}
//                 className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 transition-colors w-full"
//               >
//                 Нэвтрэх | Бүртгүүлэх
//               </button>
//             )}
//           </nav>
//         </div>
//       )}
//     </header>
//   );
// };

// export default Header;

"use client";

import { Menu, X, LogOut, User, Settings, ChevronDown } from "lucide-react";
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

  // Use custom hook for subjects
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
    router.push(`/subjects/${subjectId}/courses`);
    setShowSubjectsDropdown(false);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white">
      {/* NAV BAR */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - LEFT */}
          <div className="text-xl sm:text-2xl font-bold">
            <img
              src="/cosmo-logo.png"
              alt="Logo"
              className="w-[120px] cursor-pointer"
              onClick={() => router.push(`/courses`)}
            />
          </div>

          {/* Desktop Navigation - RIGHT */}
          <nav className="hidden lg:flex items-center gap-6">
            <a
              href="/courses"
              className="hover:text-blue-200 transition-colors"
            >
              Бүх сургалт
            </a>

            {/* Subjects Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <div className="flex items-center gap-1 hover:text-blue-200 transition-colors cursor-pointer">
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
                      className="cursor-pointer"
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
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/courses")}
                  className="text-blue-600 font-medium"
                >
                  View all courses →
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <a
              href="/free-videos"
              className="hover:text-blue-200 transition-colors"
            >
              Үнэгүй видеонууд
            </a>

            {isAuthenticated ? (
              // User Menu
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <div className="flex items-center gap-2 cursor-pointer">
                    <Avatar className="h-9 w-9 border-2 border-white">
                      <AvatarImage src={user?.avatar_url} />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {user?.name ? getInitials(user.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden xl:block">
                      {user?.name}
                    </span>
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
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
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
                className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
              >
                Нэвтрэх | Бүртгүүлэх
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-24 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
          Онлайн сургалтууд руу тавтай морил!
        </h1>
        <p className="text-sm sm:text-base md:text-lg opacity-90 max-w-2xl mx-auto">
          Та хүссэн үедээ, хүссэн газраасаа суралцаж, өөрийгөө хөгжүүлээрэй.
        </p>
      </div>

      {/* MOBILE NAVIGATION */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-blue-500/40">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            <a
              href="/courses"
              className="hover:text-blue-200 transition-colors py-2"
            >
              Бүх сургалт
            </a>

            {/* Mobile Subjects Accordion */}
            <div>
              <button
                onClick={() => setShowSubjectsDropdown(!showSubjectsDropdown)}
                className="flex items-center justify-between w-full hover:text-blue-200 transition-colors py-2"
              >
                <span>Сэдвүүд</span>
                <ChevronDown
                  size={18}
                  className={`transition-transform ${
                    showSubjectsDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showSubjectsDropdown && (
                <div className="ml-4 mt-2 space-y-2 max-h-64 overflow-y-auto">
                  {subjectsLoading ? (
                    <div className="text-sm text-gray-300 py-2">
                      Loading subjects...
                    </div>
                  ) : subjects.length === 0 ? (
                    <div className="text-sm text-gray-300 py-2">
                      No subjects available
                    </div>
                  ) : (
                    subjects.map((subject) => (
                      <button
                        key={subject.id}
                        onClick={() => handleSubjectClick(subject.id)}
                        className="block w-full text-left py-2 px-3 rounded hover:bg-blue-500/30 transition-colors"
                      >
                        <div className="font-medium text-sm">
                          {subject.title}
                        </div>
                        {subject.description && (
                          <div className="text-xs opacity-80 line-clamp-1 mt-0.5">
                            {subject.description}
                          </div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <a
              href="/free-videos"
              className="hover:text-blue-200 transition-colors py-2"
            >
              Үнэгүй видеонууд
            </a>

            {isAuthenticated ? (
              <>
                <div className="border-t border-blue-500/40 pt-3 mt-2">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10 border-2 border-white">
                      <AvatarImage src={user?.avatar_url} />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {user?.name ? getInitials(user.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{user?.name}</span>
                      <span className="text-xs opacity-80">{user?.email}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/profile")}
                  className="flex items-center gap-2 hover:text-blue-200 transition-colors py-2"
                >
                  <User size={18} />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => router.push("/settings")}
                  className="flex items-center gap-2 hover:text-blue-200 transition-colors py-2"
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </button>
                {user?.role === "admin" && (
                  <button
                    onClick={() => router.push("/admin/dashboard")}
                    className="flex items-center gap-2 hover:text-blue-200 transition-colors py-2"
                  >
                    <Settings size={18} />
                    <span>Dashboard</span>
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors mt-2"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 transition-colors w-full"
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
