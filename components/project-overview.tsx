import NextLink from "next/link";
export const ProjectOverview = () => {
  return (
    <div className="flex flex-col items-center justify-end">
      {/* ChatLima title moved to navbar */}
    </div>
  );
};

const Link = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) => {
  return (
    <NextLink
      target="_blank"
      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-75"
      href={href}
    >
      {children}
    </NextLink>
  );
};
