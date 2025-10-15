import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import GridShape from "../../components/common/GridShape";

interface GitHubProfile {
  name: string;
  avatar_url: string;
  bio: string;
  html_url: string;
  blog: string;
  location: string;
  public_repos: number;
  followers: number;
}

export default function DeveloperInfo() {
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGitHubProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://api.github.com/users/en-arnob");
        
        if (!response.ok) {
          throw new Error("Failed to fetch GitHub profile");
        }
        
        const data = await response.json();
        setProfile(data);
        setLoading(false);
      } catch (err) {
        setError("Could not load GitHub profile. Using fallback data.");
        setLoading(false);
        // Fallback data in case the API call fails
        setProfile({
          name: "Khalid Utsob",
          avatar_url: "/images/user/user-01.png",
          bio: "Full-stack developer and system designer",
          html_url: "https://github.com/en-arnob",
          blog: "https://khalid-arnob.web.app/",
          location: "Bangladesh",
          public_repos: 0,
          followers: 0
        });
      }
    };

    fetchGitHubProfile();
  }, []);

  return (
    <div>
      <PageMeta
        title="Developer Information - EIMS Portal"
        description="Developer information page for EIMS Portal"
      />
      <PageBreadcrumb pageTitle="Developer Information" />
      <div className="relative min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <GridShape />
        <div className="mx-auto w-full max-w-[800px] text-center">
          <h3 className="mb-8 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            About the Developer
          </h3>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
            </div>
          ) : (
            <div className="mb-10">
              <div className="p-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
                <img 
                  src={profile?.avatar_url || "/images/user/user-01.png"} 
                  alt="Khalid Utsob" 
                  className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-brand-100 dark:border-brand-900"
                />
                <h4 className="text-xl font-medium text-gray-800 dark:text-white mb-2">{profile?.name || "Khalid Utsob"}</h4>
                <p className="text-md text-brand-500 dark:text-brand-400 font-medium mb-3">System Designer & Full-Stack Engineer</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 max-w-lg mx-auto">
                  I handled the entire frontend development of this project, transforming client demands into a clean, responsive, and user-friendly interface. I integrated APIs seamlessly to ensure smooth data flow between the frontend and backend, providing a dynamic and interactive user experience. By focusing on UI/UX design and collaborating closely with stakeholders, I delivered an intuitive and accessible application across all devices.
                </p>
                
                {error && <p className="text-xs text-amber-500 mb-4">{error}</p>}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{profile?.public_repos || "--"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Repositories</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{profile?.followers || "--"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Followers</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">Full-Stack</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Developer</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">System</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Architecture</p>
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <a 
                    href={profile?.html_url || "https://github.com/en-arnob"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-brand-500 dark:text-gray-300 dark:hover:text-brand-400 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                    </svg>
                  </a>
                  {profile?.blog && (
                    <a 
                      href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-brand-500 dark:text-gray-300 dark:hover:text-brand-400 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855-.143.268-.276.56-.395.872.705.157 1.472.257 2.282.287V1.077zM4.249 3.539c.142-.384.304-.744.481-1.078a6.7 6.7 0 0 1 .597-.933A7.01 7.01 0 0 0 3.051 3.05c.362.184.763.349 1.198.49zM3.509 7.5c.036-1.07.188-2.087.436-3.008a9.124 9.124 0 0 1-1.565-.667A6.964 6.964 0 0 0 1.018 7.5h2.49zm1.4-2.741a12.344 12.344 0 0 0-.4 2.741H7.5V5.091c-.91-.03-1.783-.145-2.591-.332zM8.5 5.09V7.5h2.99a12.342 12.342 0 0 0-.399-2.741c-.808.187-1.681.301-2.591.332zM4.51 8.5c.035.987.176 1.914.399 2.741A13.612 13.612 0 0 1 7.5 10.91V8.5H4.51zm3.99 0v2.409c.91.03 1.783.145 2.591.332.223-.827.364-1.754.4-2.741H8.5zm-3.282 3.696c.12.312.252.604.395.872.552 1.035 1.218 1.65 1.887 1.855V11.91c-.81.03-1.577.13-2.282.287zm.11 2.276a6.696 6.696 0 0 1-.598-.933 8.853 8.853 0 0 1-.481-1.079 8.38 8.38 0 0 0-1.198.49 7.01 7.01 0 0 0 2.276 1.522zm-1.383-2.964A13.36 13.36 0 0 1 3.508 8.5h-2.49a6.963 6.963 0 0 0 1.362 3.675c.47-.258.995-.482 1.565-.667zm6.728 2.964a7.009 7.009 0 0 0 2.275-1.521 8.376 8.376 0 0 0-1.197-.49 8.853 8.853 0 0 1-.481 1.078 6.688 6.688 0 0 1-.597.933zM8.5 11.909v3.014c.67-.204 1.335-.82 1.887-1.855.143-.268.276-.56.395-.872A12.63 12.63 0 0 0 8.5 11.91zm3.555-.401c.57.185 1.095.409 1.565.667A6.963 6.963 0 0 0 14.982 8.5h-2.49a13.36 13.36 0 0 1-.437 3.008zM14.982 7.5a6.963 6.963 0 0 0-1.362-3.675c-.47.258-.995.482-1.565.667.248.92.4 1.938.437 3.008h2.49zM11.27 2.461c.177.334.339.694.482 1.078a8.368 8.368 0 0 0 1.196-.49 7.01 7.01 0 0 0-2.275-1.52c.218.283.418.597.597.932zm-.488 1.343a7.765 7.765 0 0 0-.395-.872C9.835 1.897 9.17 1.282 8.5 1.077V4.09c.81-.03 1.577-.13 2.282-.287z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
            <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Project Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Project Name:</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Crop Track - Cold Storage Management Software</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Version:</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">1.0.0</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Frontend:</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">React, TypeScript, Tailwind CSS</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Backend:</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Django, PostgreSQL</p>
              </div>
             
            </div>
          </div>

          <div className="text-center">
            <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Contact Developer</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Have questions or feedback about the application? Feel free to reach out to me directly.  
            </p>
            <a 
              href="mailto:en.arnob@gmail.com" 
              className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-500 dark:hover:bg-brand-400"
            >
              Contact Me
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}