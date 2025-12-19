import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white">
      {/* NAV BAR */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - LEFT */}
          <div className="text-xl sm:text-2xl font-bold">
            <img
              src="/cosmo-logo.png"
              alt=""
              className="w-[120px] cursor-pointer"
              onClick={() => router.push(`/course`)}
            />
          </div>

          {/* Desktop Navigation - RIGHT */}
          <nav className="hidden lg:flex items-center gap-6">
            <a href="#" className="hover:text-blue-200 transition-colors">
              Бүх сургалт
            </a>
            <a href="#" className="hover:text-blue-200 transition-colors">
              Үнэгүй видеонууд
            </a>
            <button className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 transition-colors">
              Нэвтрэх | Бүртгүүлэх
            </button>
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
      <div className="border-1 gray-600"></div>
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
            <a href="#" className="hover:text-blue-200 transition-colors">
              Бүх сургалт
            </a>
            <a href="#" className="hover:text-blue-200 transition-colors">
              Үнэгүй видеонууд
            </a>
            <button className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 transition-colors w-full">
              Нэвтрэх | Бүртгүүлэх
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
