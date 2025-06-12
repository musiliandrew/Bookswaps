import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import quantIQLogo from '../../assets/icons/QuantIq.png'

const Footer = () => {
  return (
    <footer className="bg-[var(--secondary)] text-[var(--text)] py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Social Media Links */}
        <div className="mb-4 md:mb-0">
          <h3 className="text-xl font-['Lora'] text-[var(--primary)] mb-2">Connect With Us</h3>
          <div className="flex space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:text-[var(--accent)] transition-colors">
              <FaFacebookF size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:text-[var(--accent)] transition-colors">
              <FaTwitter size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:text-[var(--accent)] transition-colors">
              <FaInstagram size={20} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:text-[var(--accent)] transition-colors">
              <FaLinkedinIn size={20} />
            </a>
          </div>
        </div>

        {/* Developer Branding and Copyright */}
        <div className="text-center md:text-right">
        <p className="text-lg font-['Lora'] text-[var(--primary)] mb-2">Developed by</p>
        <a
            href="https://quantiq.ai"
            target="_blank"
            rel="noopener noreferrer"
            title="Visit the main QuantIQ Platform"
            className="flex items-center justify-center md:justify-end group"
        >
            <img
            src={quantIQLogo}
            alt="QuantIQ Logo"
            className="w-8 h-8 mr-2 transition-transform duration-300 group-hover:scale-110"
            />
            <span className="text-lg font-bold font-['Lora'] bg-gradient-to-r from-[#00e6e6] to-[#00ccff] bg-clip-text text-transparent group-hover:underline">
            QuantIQ Dev
            </span>
        </a>
        <p className="text-sm text-[var(--text)] mt-2">© 2025 BookSwaps</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;