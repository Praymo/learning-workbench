import Link from "next/link";

const links = [
  { href: "/", label: "首页" },
  { href: "/practice", label: "练习" },
  { href: "/submissions/new", label: "批改答卷" },
  { href: "/wrong-questions", label: "错题复查" },
  { href: "/topics", label: "专题总结" },
  { href: "/mastery", label: "掌握档案" }
];

export function AppNav() {
  return (
    <header className="topbar">
      <Link className="brand" href="/"><span className="brand-mark">∑</span><span>学习工作台</span></Link>
      <nav className="nav">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>{link.label}</Link>
        ))}
      </nav>
      <Link className="nav-maintenance" href="/maintenance">维护</Link>
      <Link className="nav-cta" href="/practice">开始练习</Link>
    </header>
  );
}
