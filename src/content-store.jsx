import { createContext, useContext, useEffect, useState } from "react";

export const API_URL = import.meta.env.VITE_API_URL || "/api";

export const resolveContentAssetUrl = (url) => {
  if (!url) return null;
  if (/^(https?:|data:|\/)/.test(url)) return url;
  const normalized = url.replace(/\\/g, "/").replace(/^(\.\/)?(src\/)?/, "");
  if (normalized.startsWith("media/")) {
    return `/${normalized}`;
  }
  return url;
};

export const defaultContent = {
  profile: {
    name: "Vusani Earl Mulaudzi",
    shortName: "V. EARL",
    email: "matakanyevusi@outlook.com",
    location: "Johannesburg, South Africa",
    resumeUrl: "",
  },
  home: {
    heroMediaUrl: "media/screen.png",
    heroMediaPoster: "",
    shopflowImage: "",
    auraImage: "",
    constructImage: "",
    blogOneImage: "",
    blogTwoImage: "",
    blogThreeImage: "",
  },
  social: {
    github: "",
    linkedin: "https://www.linkedin.com/in/vusani-mulaudzi-b5a104317/",
    instagram: "https://www.instagram.com/sir.earl__/",
    readcv: "",
    rss: "",
  },
  projects: [
    {
      slug: "clothing-store",
      title: "La Earl Ettofe",
      year: "2026",
      category: "E-commerce",
      image: "media/laearl.png",
      summary: "A high-performance retail orchestration layer designed for rapid scaling.",
      tags: "React, D3.js, Node.js",
      caseStudyUrl: "",
    },
    {
      slug: "digital-design-studio",
      title: "I Byte Cookies Studios",
      year: "2026",
      category: "Design Agency",
      image: "media/ibyte.png",
      summary: "Web app designed to promote and host customers for all digital product needs.",
      tags: "Node.js, React, PostgreSQL",
      caseStudyUrl: "",
    },
    {
      slug: "student-preparation-platform",
      title: "student preparation platform",
      year: "2026",
      category: "Web-app",
      image: "media/growlink.jpe",
      summary: "A digital platform designed to help students find various opportunities such as jobs and funding.",
      tags: "React, Node.js, PostgreSQL",
      caseStudyUrl: "",
      body: "I co-developed this application for a client in order to help bridge the gap between students and opportunities.\n\nMore details will be released closer to the release date.",
    },
    {
      slug: "student-accommodation",
      title: "Fulo Student Living",
      year: "2026",
      category: "Student Accommodation",
      image: "media/fulostud.jpeg",
      summary: "A platform meant to promote student accommodation along with streamlining day-to-day operations for landlords and students.",
      tags: "React, Node.js, PostgreSQL",
      caseStudyUrl: "",
      body: "I designed and developed this platform from the ground up for an accommodation company located in Thohoyandou, Limpopo for mainly Univen students.\n\nMore details closer to release date.",
    },
  ],
  partners: [
    { name: "Growlink", description: "Student opportunity platform bridging the gap between students and careers.", image: "", websiteUrl: "", caseStudyUrl: "" },
    { name: "Fulo Student Living", description: "Student accommodation platform in Thohoyandou, Limpopo.", image: "", websiteUrl: "", caseStudyUrl: "" },
  ],
  posts: [],
  inquiries: [],
};

const ContentContext = createContext(null);

const cloneDefaultContent = () => JSON.parse(JSON.stringify(defaultContent));

const mergeContentDefaults = (storedContent) => {
  const defaults = cloneDefaultContent();

  const merge = (base, override) => {
    if (Array.isArray(base)) {
      return Array.isArray(override) && override.length > 0 ? override : base;
    }
    if (typeof base !== "object" || base === null) {
      return override === undefined || override === null ? base : override;
    }

    return Object.keys(base).reduce((merged, key) => {
      const overrideValue = override?.[key];
      if (overrideValue === undefined || overrideValue === null || (typeof overrideValue === "string" && overrideValue.trim() === "")) {
        merged[key] = base[key];
      } else {
        merged[key] = merge(base[key], overrideValue);
      }
      return merged;
    }, {});
  };

  return merge(defaults, storedContent || {});
};

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState(cloneDefaultContent);
  const [isLoading, setIsLoading] = useState(true);

  // Content is hardcoded — no database needed
  useEffect(() => { setIsLoading(false); }, []);

  const resetContent = () => setContent(cloneDefaultContent());

  return (
    <ContentContext.Provider value={{ content, setContent, resetContent, isLoading }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) throw new Error("useContent must be used within ContentProvider");
  return context;
};