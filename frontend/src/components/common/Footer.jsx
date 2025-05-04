import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-[var(--primary)] text-[var(--secondary)] p-4">
      <div className="container mx-auto text-center">
        <div className="space-x-4">
          <Link to="/privacy" className="hover:underline">Privacy</Link>
          <Link to="/terms" className="hover:underline">Terms</Link>
          <Link to="/contact" className="hover:underline">Contact</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;