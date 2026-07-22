import { useEffect, useState } from "react";
import { getData } from "../services/apiClient";

interface ProjectCode {
  xtype: string;
  xcode: string;
  /** Bangla name of the unit, added to the API after these screens shipped. */
  xdesc?: string;
}

export type ProjectOption = {
  /** What the reports send as `xproj`. Never the description. */
  code: string;
  /** What the user reads: the description, falling back to the code. */
  label: string;
};

/** The synthetic "no filter" entry — not a project the API knows about. */
export const ALL_PROJECTS: ProjectOption = { code: "All", label: "All" };

/**
 * The project list behind every report filter.
 *
 * A dozen screens were each running this fetch and mapping the result
 * themselves, so a change as small as showing a name instead of a code meant
 * editing all of them. They now share one source.
 */
export function useProjectOptions() {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const data = await getData<ProjectCode[]>(
          "/masterdata/common-codes/list/",
          { xtype: "Project" },
        );

        const seen = new Set<string>();
        const options: ProjectOption[] = [];
        for (const project of data || []) {
          if (!project.xcode || seen.has(project.xcode)) continue;
          seen.add(project.xcode);
          options.push({
            code: project.xcode,
            label: project.xdesc?.trim() || project.xcode,
          });
        }

        if (!cancelled) setProjects(options);
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProjects();
    return () => {
      cancelled = true;
    };
  }, []);

  return { projects, loading };
}

/** Convenience for the filters that offer an unfiltered "All" choice. */
export function useProjectOptionsWithAll() {
  const { projects, loading } = useProjectOptions();
  return { projects: [ALL_PROJECTS, ...projects], loading };
}
