import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#343a40] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="text-[#adb5bd] text-sm">
            &copy; {currentYear} Yixu Huang. All rights reserved.
          </div>

          {/* Made with love */}
          <div className="flex items-center gap-2 text-[#adb5bd] text-sm">
            <span>Made with</span>
            <Heart size={16} className="text-red-400 fill-red-400" />
            <span>and lots of coffee</span>
          </div>

          {/* Quick links */}
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/RunRiotComeOn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#adb5bd] text-sm hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="#contact"
              className="text-[#adb5bd] text-sm hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
