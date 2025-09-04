export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Project Catalog",
  description: "",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Projects",
      href: "/projects",
    },
    {
      label: "Supervisor",
      href: "/supervisor-dashboard",
    },
    {
      label: "Admin",
      href: "/admin-dashboard",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Projects",
      href: "/projects",
    },
    {
      label: "Saved Projects",
      href: "/saved-projects",
    },
    {
      label: "Notifications",
      href: "/notifications",
    },
    {
      label: "Supervisor Dashboard",
      href: "/supervisor-dashboard",
    },
    {
      label: "Admin Dashboard",
      href: "/admin-dashboard",
    },
  ],
  links: {
    github: "https://github.com/hein-min-thant/project-catalog",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
