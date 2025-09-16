import { Link, useLocation } from "react-router-dom";

interface NavItem {
  name: string;
  path: string;
}

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems: NavItem[] = [
    { name: "Home", path: "/" },
      { name: "Register", path: "/register" },
    { name: "Gateway", path: "/gateway" },
  ];

  return (
    <nav className="w-full border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-glow-hover">
            PayZy
          </Link>

          {/*this is how you define the navigation links within this */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${
                  location.pathname === item.path
                    ? "text-primary"
                    : "text-foreground hover:text-primary"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-glow-hover p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden mt-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block nav-link ${
                location.pathname === item.path
                  ? "text-primary"
                  : "text-foreground hover:text-primary"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;