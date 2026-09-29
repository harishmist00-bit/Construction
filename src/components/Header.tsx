import { Link, useLocation } from "react-router-dom";

const pages = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Projects", path: "/projects" },
    { name: "Services", path: "/services" },
    { name: "Experience", path: "/experience" },
    { name: "Contact", path: "/contact" }
];

export default function Header() {

    const location = useLocation();

    const currentIndex = pages.findIndex(
        page => page.path === location.pathname
    );

    return (
        <header className="site-header">

            <Link to="/" className="logo">
                <img src="/logo.png" alt="Ryah" />
            </Link>

            <nav className="main-nav">
                {pages.map((page) => (
                    <Link
                        key={page.path}
                        to={page.path}
                        className={
                            location.pathname === page.path
                                ? "active"
                                : ""
                        }
                    >
                        {page.name}
                    </Link>
                ))}
            </nav>

            <div className="header-right">
                <a
                    href="tel:+919342077629"
                    className="enquire-button"
                >
                    <span>
                        GET ENQUIRY <i className="fa-solid fa-phone"></i>
                    </span>
                </a>
            </div>

        </header>
    );
}