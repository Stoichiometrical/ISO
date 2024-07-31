"use client"
import { cn } from "../../utils/cn";
import { Separator } from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import {API_3,API_4, getProjectName, setCookie, setProjectName} from "@/lib/utils";

import {useState} from "react";
import {navigateToProject, navigateToReports} from "@/lib/server-actions";



export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-4 w-full justify-center ",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const Project = ({
  className,
  title,
  header,
}) => {


  const handleOpen = () => {
    // Assuming setProjectName is available in your context or props
    setProjectName(title);
    navigateToReports(); // Add the route you want to navigate to
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the project "${title}"?`)) {
      try {
        const response = await fetch(`http://localhost:5003/projects/name/${title}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          alert('Project deleted successfully.');
          // Optionally, you can refresh the list of projects or navigate to another page
        } else {
          const errorData = await response.json();
          alert(`Failed to delete project: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while deleting the project.');
      }
    }
  };

  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 bg-white light:bg-black border-white/[0.2] border light:border-transparent justify-between flex flex-col space-y-4 w-[250px]",
        className
      )}
    >
      {header}
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        <div className="font-sans font-bold text-gray-500 light:text-neutral-200 mb-2 mt-2 break-all">
          {title}
        </div>
        <hr className="bg-gray-700 border border-gray-500 my-2" />
        <div className="flex items-center justify-center bg-yellow-200">
          <div
            onClick={handleOpen}
            className="p-2 font-bold cursor-pointer text-center text-xl text-gray-500 light:text-white"
          >
            Open
          </div>
          <div
            onClick={handleDelete}
            className="p-2 font-bold cursor-pointer text-center text-xl text-gray-500 light:text-white"
          >
            Delete
          </div>
        </div>
      </div>
    </div>
  );
};




export const Report = ({
  className,
  title,
  description,
  header,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  const projectName = getProjectName(); // Function to get the current project name
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpen = () => {
    setCookie(title);
    navigateToProject();
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the report "${title}"?`);
    if (!confirmDelete) {
      return; // If user cancels, do nothing
    }

    try {
      setIsDeleting(true); // Set loading state

      const response = await fetch(`${API_4}/projects/name/${projectName}/reports/${title}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Report deleted successfully');
        // You can add additional logic here, like updating the UI
      } else {
        console.error('Failed to delete report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
    } finally {
      setIsDeleting(false); // Reset loading state
    }
  };

  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 bg-white light:bg-black border-white/[0.2] border light:border-transparent justify-between flex flex-col space-y-4",
        className,
      )}
    >
      {header}
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        <div className="font-sans font-bold text-gray-500 light:text-neutral-200 mb-2 mt-2">
          {title}
        </div>
        <div className="font-sans font-normal text-black text-xs light:text-neutral-300">
          {description}
        </div>
        <hr className="bg-gray-700 border border-gray-500 my-2" />
        <div className="flex items-center justify-center bg-yellow-200">
          <div
            onClick={handleOpen}
            className="p-2 font-bold cursor-pointer text-center text-xl text-gray-500 light:text-white"
          >
            Open
          </div>
          <div
            onClick={handleDelete}
            className={`p-2 font-bold cursor-pointer text-center text-xl text-gray-500 light:text-white ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </div>
        </div>
      </div>
    </div>
  );
};


export const BentoGridItem = ({
  className,
  title,
  description,
  header,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 bg-white light:bg-black border-white/[0.2]  border light:border-transparent justify-between flex flex-col space-y-4",
        className,
      )}
    >
      {header}
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        <div className="font-sans font-bold text-gray-500  light:text-neutral-200 mb-2 mt-2">
          {title}
        </div>
        <div className="font-sans font-normal text-black text-xs light:text-neutral-300">
          {description}
        </div>
        <hr className="bg-gray-700 border border-gray-500 my-2" />
        <div className="flex items-center justify-center bg-yellow-200">
          <Link
            href="/reports"
            className="p-2 font-bold cursor-pointer text-center text-xl text-gray-500 light:text-white"
          >
            Open
          </Link>
        </div>
      </div>
    </div>
  );
};





