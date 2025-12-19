const Footer = () => {
  return (
    <footer className="bg-blue-900 text-white py-8 pt-5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-4">Мэдээлэл</h3>
            <ul className="space-y-2 text-sm sm:text-base text-blue-200">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Холбоо барих
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Утас: 9930-1979
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-base sm:text-lg mb-4">Холбоосууд</h3>
            <ul className="space-y-2 text-sm sm:text-base text-blue-200">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Багшаар нэвтрэх
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Байгууллагаар нэвтрэх
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Үйлчилгээний нөхцөл
                </a>
              </li>
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-bold text-base sm:text-lg mb-4">
              Бидэнтэй нэгдээрэй
            </h3>
            <p className="text-sm sm:text-base text-blue-200 mb-3">
              Хямдрал, шинээр нээгдсэн сургалтын талаар мэдээлэл авах
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Имэйл хаяг"
                className="flex-1 px-3 py-2 rounded text-gray-800 text-sm sm:text-base"
              />
              <button className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                →
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-800 pt-6 text-center text-xs sm:text-sm text-blue-300">
          <p>
            Онлайн видео сургалтын платформ - Бүх эрх хуулиар хамгаалагдсан ©
            2025
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
