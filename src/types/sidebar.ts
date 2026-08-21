export type SidebarItem = {
    label:string;
    href: string;
    icon: React.ElementType;
};

export type SidebarSectionProps = {
    title: string;
    items: SidebarItem[];
    pathname:string;
};