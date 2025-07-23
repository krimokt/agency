"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Avatar from "@/components/ui/avatar/Avatar";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { cn } from "@/lib/utils";
import { useState, useMemo, useCallback, memo } from "react";

// Simple fallback components for missing dependencies
const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const Tooltip = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const TooltipTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => <>{children}</>;
const TooltipContent = ({ children, className }: { children: React.ReactNode; className?: string }) => null;

const AvatarImage = memo(({ src, alt }: { src: string; alt: string }) => (
  <img 
    src={src} 
    alt={alt} 
    className="w-full h-full object-cover" 
    loading="lazy"
    decoding="async"
  />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = memo(({ children }: { children: React.ReactNode }) => (
  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 font-medium">
    {children}
  </div>
));
AvatarFallback.displayName = "AvatarFallback";

const Input = memo(({ placeholder, value, onChange, className }: {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={cn(
      "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
      className
    )}
  />
));
Input.displayName = "Input";

const DropdownMenu = ({ children }: { children: React.ReactNode }) => (
  <div className="relative inline-block text-left">{children}</div>
);
const DropdownMenuTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => <>{children}</>;
const DropdownMenuContent = memo(({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10", className)}>
    {children}
  </div>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuCheckboxItem = memo(({ 
  children, 
  checked, 
  onCheckedChange 
}: { 
  children: React.ReactNode; 
  checked: boolean; 
  onCheckedChange: () => void; 
}) => (
  <div 
    className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
    onClick={onCheckedChange}
  >
    <input type="checkbox" checked={checked} onChange={onCheckedChange} className="mr-2" />
    {children}
  </div>
));
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

// Memoized contributor avatar component for better performance
const ContributorAvatar = memo(({ contributor, index }: { contributor: any; index: number }) => (
  <div className="group relative" style={{ willChange: 'transform' }}>
    <Avatar className="h-8 w-8 ring-2 ring-white hover:z-10 border border-gray-200 transition-transform duration-200 hover:scale-105">
      <AvatarImage src={contributor.avatar} alt={contributor.name} />
      <AvatarFallback>{contributor.name[0]}</AvatarFallback>
    </Avatar>
    <div 
      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-20 transition-opacity duration-200"
      style={{ willChange: 'opacity, transform' }}
    >
      <div className="font-semibold">{contributor.name}</div>
      <div className="text-gray-300">{contributor.email}</div>
      <div className="italic">{contributor.role}</div>
    </div>
  </div>
));
ContributorAvatar.displayName = "ContributorAvatar";

// Memoized table row component
const ProjectRow = memo(({ project, visibleColumns }: { project: any; visibleColumns: string[] }) => (
  <TableRow 
    className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
    style={{ contain: 'layout style paint' }}
  >
    {visibleColumns.includes("Project") && (
      <TableCell className="font-medium whitespace-nowrap py-4">{project.title}</TableCell>
    )}
    {visibleColumns.includes("Repository") && (
      <TableCell className="whitespace-nowrap py-4">
        <a
          href={project.repo}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline hover:text-blue-700 transition-colors duration-150"
        >
          {project.repo.replace("https://", "")}
        </a>
      </TableCell>
    )}
    {visibleColumns.includes("Team") && <TableCell className="whitespace-nowrap py-4">{project.team}</TableCell>}
    {visibleColumns.includes("Tech") && <TableCell className="whitespace-nowrap py-4">{project.tech}</TableCell>}
    {visibleColumns.includes("Created At") && <TableCell className="whitespace-nowrap py-4">{project.createdAt}</TableCell>}
    {visibleColumns.includes("Contributors") && (
      <TableCell className="min-w-[120px] py-4">
        <div className="flex -space-x-2" style={{ willChange: 'transform' }}>
          {project.contributors.map((contributor: any, idx: number) => (
            <ContributorAvatar key={`${project.id}-${idx}`} contributor={contributor} index={idx} />
          ))}
        </div>
      </TableCell>
    )}
    {visibleColumns.includes("Status") && (
      <TableCell className="whitespace-nowrap py-4">
        <Badge
          className={cn(
            "whitespace-nowrap px-3 py-1 transition-colors duration-150",
            project.status === "Active" && "bg-green-500 text-white",
            project.status === "Inactive" && "bg-gray-400 text-white",
            project.status === "In Progress" && "bg-yellow-500 text-white",
          )}
        >
          {project.status}
        </Badge>
      </TableCell>
    )}
  </TableRow>
));
ProjectRow.displayName = "ProjectRow";

type Contributor = {
  name: string;
  email: string;
  avatar: string;
  role: string;
};

type Project = {
  id: string;
  title: string;
  repo: string;
  status: "Active" | "Inactive" | "In Progress";
  team: string;
  tech: string;
  createdAt: string;
  contributors: Contributor[];
};

const data: Project[] = [
  {
    id: "1",
    title: "ShadCN Clone",
    repo: "https://github.com/ruixenui/ruixen-buttons",
    status: "Active",
    team: "UI Guild",
    tech: "Next.js",
    createdAt: "2024-06-01",
    contributors: [
      {
        name: "Srinath G",
        email: "srinath@example.com",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
        role: "UI Lead",
      },
      {
        name: "Kavya M",
        email: "kavya@example.com",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face",
        role: "Designer",
      },
    ],
  },
  {
    id: "2",
    title: "RUIXEN Components",
    repo: "https://github.com/ruixenui/ruixen-buttons",
    status: "In Progress",
    team: "Component Devs",
    tech: "React",
    createdAt: "2024-05-22",
    contributors: [
      {
        name: "Arjun R",
        email: "arjun@example.com",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
        role: "Developer",
      },
      {
        name: "Divya S",
        email: "divya@example.com",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
        role: "QA",
      },
      {
        name: "Nikhil V",
        email: "nikhil@example.com",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face",
        role: "UX",
      },
    ],
  },
  {
    id: "3",
    title: "CV Jobs Platform",
    repo: "https://github.com/ruixenui/ruixen-buttons",
    status: "Active",
    team: "CV Core",
    tech: "Spring Boot",
    createdAt: "2024-06-05",
    contributors: [
      {
        name: "Manoj T",
        email: "manoj@example.com",
        avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=32&h=32&fit=crop&crop=face",
        role: "Backend Lead",
      },
    ],
  },
  {
    id: "4",
    title: "Ruixen UI Docs",
    repo: "https://github.com/ruixenui/ruixen-buttons",
    status: "Active",
    team: "Tech Writers",
    tech: "Markdown + Docusaurus",
    createdAt: "2024-04-19",
    contributors: [
      {
        name: "Sneha R",
        email: "sneha@example.com",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face",
        role: "Documentation",
      },
      {
        name: "Vinay K",
        email: "vinay@example.com",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=32&h=32&fit=crop&crop=face",
        role: "Maintainer",
      },
    ],
  },
  {
    id: "5",
    title: "Job Portal Analytics",
    repo: "https://github.com/ruixenui/ruixen-buttons",
    status: "Active",
    team: "Data Squad",
    tech: "Python",
    createdAt: "2024-03-30",
    contributors: [
      {
        name: "Aarav N",
        email: "aarav@example.com",
        avatar: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=32&h=32&fit=crop&crop=face",
        role: "Data Engineer",
      },
    ],
  },
  {
    id: "6",
    title: "Real-time Chat",
    repo: "https://github.com/ruixenui/ruixen-buttons",
    status: "Active",
    team: "Infra",
    tech: "Socket.io",
    createdAt: "2024-06-03",
    contributors: [
      {
        name: "Neha L",
        email: "neha@example.com",
        avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=32&h=32&fit=crop&crop=face",
        role: "DevOps",
      },
      {
        name: "Raghav I",
        email: "raghav@example.com",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=32&h=32&fit=crop&crop=face",
        role: "NodeJS Engineer",
      },
    ],
  },
  {
    id: "7",
    title: "RUX Theme Builder",
    repo: "https://github.com/ruixenui/ruixen-buttons",
    status: "Active",
    team: "Design Systems",
    tech: "Tailwind CSS",
    createdAt: "2024-05-10",
    contributors: [
      {
        name: "Ishita D",
        email: "ishita@example.com",
        avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=32&h=32&fit=crop&crop=face",
        role: "Design Engineer",
      },
    ],
  },
  {
    id: "8",
    title: "Admin Dashboard",
    repo: "https://github.com/ruixenui/ruixen-buttons",
    status: "Active",
    team: "Dashboard Core",
    tech: "Remix",
    createdAt: "2024-05-28",
    contributors: [
      {
        name: "Rahul B",
        email: "rahul@example.com",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=32&h=32&fit=crop&crop=face",
        role: "Fullstack",
      },
    ],
  },
  {
    id: "9",
    title: "OpenCV Blog Engine",
    repo: "https://github.com/ruixenui/ruixen-buttons",
    status: "Active",
    team: "Platform",
    tech: "Node.js",
    createdAt: "2024-01-18",
    contributors: [
      {
        name: "Sanya A",
        email: "sanya@example.com",
        avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=32&h=32&fit=crop&crop=face",
        role: "API Developer",
      },
      {
        name: "Harshit V",
        email: "harshit@example.com",
        avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=32&h=32&fit=crop&crop=face",
        role: "Platform Architect",
      },
    ],
  },
  {
    id: "10",
    title: "Dark Mode Toggle Package",
    repo: "https://github.com/ruixenui/ruixen-buttons",
    status: "Active",
    team: "Component Devs",
    tech: "TypeScript",
    createdAt: "2024-06-02",
    contributors: [
      {
        name: "Meera C",
        email: "meera@example.com",
        avatar: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=32&h=32&fit=crop&crop=face",
        role: "Package Maintainer",
      },
    ],
  },
];

const allColumns = [
  "Project",
  "Repository",
  "Team",
  "Tech",
  "Created At",
  "Contributors",
  "Status",
] as const;

function ContributorsTable() {
  const [visibleColumns, setVisibleColumns] = useState<string[]>([...allColumns]);
  const [statusFilter, setStatusFilter] = useState("");
  const [techFilter, setTechFilter] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Memoize filtered data to avoid unnecessary recalculations
  const filteredData = useMemo(() => {
    return data.filter((project) => {
      const matchesStatus = !statusFilter || project.status === statusFilter;
      const matchesTech = !techFilter || project.tech.toLowerCase().includes(techFilter.toLowerCase());
      return matchesStatus && matchesTech;
    });
  }, [statusFilter, techFilter]);

  // Memoize column toggle function
  const toggleColumn = useCallback((col: string) => {
    setVisibleColumns((prev) =>
      prev.includes(col)
        ? prev.filter((c) => c !== col)
        : [...prev, col]
    );
  }, []);

  // Memoize dropdown toggle
  const toggleDropdown = useCallback(() => {
    setDropdownOpen(prev => !prev);
  }, []);

  // Memoize filter handlers with debouncing effect
  const handleTechFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTechFilter(e.target.value);
  }, []);

  const handleStatusFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusFilter(e.target.value);
  }, []);

  // Memoize column items for dropdown
  const columnItems = useMemo(() => {
    return allColumns.map((col) => (
      <DropdownMenuCheckboxItem
        key={col}
        checked={visibleColumns.includes(col)}
        onCheckedChange={() => toggleColumn(col)}
      >
        {col}
      </DropdownMenuCheckboxItem>
    ));
  }, [visibleColumns, toggleColumn]);

  return (
    <div className="container mx-auto my-10 space-y-6 p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
        <div className="flex gap-3 flex-wrap">
          <Input
            placeholder="Filter by technology..."
            value={techFilter}
            onChange={handleTechFilterChange}
            className="w-48"
          />
          <Input
            placeholder="Filter by status..."
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="w-48"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleDropdown}
            >
              Columns
            </Button>
          </DropdownMenuTrigger>
          {dropdownOpen && (
            <DropdownMenuContent className="w-48">
              {columnItems}
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              {visibleColumns.includes("Project") && (
                <th className="h-14 px-4 text-left align-middle font-semibold text-gray-700 w-[180px] bg-gray-50 border-b border-gray-200">
                  Project
                </th>
              )}
              {visibleColumns.includes("Repository") && (
                <th className="h-14 px-4 text-left align-middle font-semibold text-gray-700 w-[220px] bg-gray-50 border-b border-gray-200">
                  Repository
                </th>
              )}
              {visibleColumns.includes("Team") && (
                <th className="h-14 px-4 text-left align-middle font-semibold text-gray-700 w-[150px] bg-gray-50 border-b border-gray-200">
                  Team
                </th>
              )}
              {visibleColumns.includes("Tech") && (
                <th className="h-14 px-4 text-left align-middle font-semibold text-gray-700 w-[150px] bg-gray-50 border-b border-gray-200">
                  Tech
                </th>
              )}
              {visibleColumns.includes("Created At") && (
                <th className="h-14 px-4 text-left align-middle font-semibold text-gray-700 w-[120px] bg-gray-50 border-b border-gray-200">
                  Created At
                </th>
              )}
              {visibleColumns.includes("Contributors") && (
                <th className="h-14 px-4 text-left align-middle font-semibold text-gray-700 w-[150px] bg-gray-50 border-b border-gray-200">
                  Contributors
                </th>
              )}
              {visibleColumns.includes("Status") && (
                <th className="h-14 px-4 text-left align-middle font-semibold text-gray-700 w-[100px] bg-gray-50 border-b border-gray-200">
                  Status
                </th>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length ? (
              filteredData.map((project) => (
                <ProjectRow 
                  key={project.id}
                  project={project}
                  visibleColumns={visibleColumns}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="text-center py-8">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default memo(ContributorsTable); 