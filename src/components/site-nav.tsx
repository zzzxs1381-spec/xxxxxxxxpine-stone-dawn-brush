import { Link } from "@tanstack/react-router";
import { XsHeader, XsTabs } from "@/components/xs-chrome";

export function SiteNav() {
  return <XsHeader />;
}

export function SiteFooter() {
  return (
    <>
      <footer className="mx-auto hidden max-w-6xl gap-3 px-4 py-8 text-xs text-subtle md:flex md:items-center md:justify-between">
        <p>Xservis — доступ есть. Сайт не является системным VPN.</p>
        <div className="flex gap-4">
          <Link to="/privacy" className="hover:text-fg">
            Приватность
          </Link>
          <Link to="/support" className="hover:text-fg">
            Канал
          </Link>
          <Link to="/monitor" className="hover:text-fg">
            Монитор
          </Link>
        </div>
      </footer>
      <div className="h-20" />
      <XsTabs />
    </>
  );
}
