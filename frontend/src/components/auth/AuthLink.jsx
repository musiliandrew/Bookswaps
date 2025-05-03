import { Link } from 'react-router-dom';

function AuthLink({ to, text }) {
  return (
    <p className="mt-2 text-sm">
      <Link to={to} className="text-[var(--primary)] hover:underline">
        {text}
      </Link>
    </p>
  );
}

export default AuthLink;