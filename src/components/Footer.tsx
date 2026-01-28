import { Facebook, Mail, MapPin, GraduationCap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap size={24} />
              </div>
              <h3 className="font-bold text-xl">Cosmo Training</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Онлайн сургалтын платформ. Хүссэн газраасаа, хүссэн цагтаа
              суралцаарай.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-blue-300">
              Холбоо барих
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-slate-300">
                <Mail
                  size={18}
                  className="flex-shrink-0 mt-0.5 text-blue-400"
                />
                <span>training@cosmo.mn</span>
              </li>

              <li className="flex items-start gap-3 text-sm text-slate-300">
                <a href="https://www.google.com/maps/place/Cosmo+Trade+LLC+office/@47.8975082,106.8569896,18.25z/data=!4m14!1m7!3m6!1s0x5d96932b7743aa4f:0x7eb07d8c6b75e385!2sCosmo+Trade+LLC+office!8m2!3d47.897692!4d106.858296!16s%2Fg%2F11gsbbv6wj!3m5!1s0x5d96932b7743aa4f:0x7eb07d8c6b75e385!8m2!3d47.897692!4d106.858296!16s%2Fg%2F11gsbbv6wj!5m1!1e1?entry=ttu&g_ep=EgoyMDI2MDExMy4wIKXMDSoASAFQAw%3D%3D">
                  <MapPin
                    size={18}
                    className="flex-shrink-0 mt-0.5 text-blue-400 mb-2"
                  />
                  <span>
                    {" "}
                    Хан-Уул дүүрэг, 3-р хороо, Үйлдвэрийн Баруун Бүс - 100/5,
                    Ажилчны гудамж, 17070
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-blue-300">
              Сошиал хаягууд
            </h3>
            <div className="space-y-3">
              <a
                href="https://www.facebook.com/CosmoEzegtei"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-slate-300 hover:text-white transition-all group"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                  <Facebook size={20} />
                </div>
                <span>Космо Трейд ХХК</span>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=100063487153522"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-slate-300 hover:text-white transition-all group"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                  <Facebook size={20} />
                </div>
                <span>Kangaroo Mongolia</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">© 2026 Cosmo Training.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
