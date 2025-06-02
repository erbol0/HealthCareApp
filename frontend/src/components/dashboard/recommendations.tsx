"use client";

import { getRecommendations } from "@/actions";
import { Medication, Symptom, User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import {
  ClipboardList,
  LoaderIcon,
  XCircle,
  AlertCircle,
  Activity,
  Pill,
  Heart,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  symptoms: Symptom[];
  medications: Medication[];
  user: User;
}

interface RecommendationSection {
  title: string;
  icon: JSX.Element;
  content: string[];
}

const Recommendations = ({ symptoms, medications, user }: Props) => {
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { mutate } = useMutation({
    mutationKey: ["get-tips"],
    mutationFn: async () => {
      setIsLoading(true);
      const res = await getRecommendations({ symptoms, medications, user });
      localStorage.setItem("cura_health_recommendations", res);
      setRecommendations(res);
      setIsLoading(false);
      return res;
    },
    onError: (error) => {
      setIsLoading(false);
      setError("Error getting health tips");
    },
    onSuccess: () => {
      setError(null);
      setIsLoading(false);
    },
  });

  useEffect(() => {
    const storedTips = localStorage.getItem("cura_health_recommendations");
    if (storedTips) {
      setRecommendations(storedTips);
    } else {
      mutate();
    }
  }, [mutate]);

  const parseRecommendations = (markdown: string): RecommendationSection[] => {
    const sections: RecommendationSection[] = [];
    const lines = markdown.split("\n");
    let currentSection: RecommendationSection | null = null;

    lines.forEach((line) => {
      if (line.startsWith("##")) {
        if (currentSection) sections.push(currentSection);
        currentSection = {
          title: line.replace("##", "").trim(),
          icon: getIconForSection(line),
          content: [],
        };
      } else if (line.startsWith("-") && currentSection) {
        currentSection.content.push(line.replace("-", "").trim());
      }
    });

    if (currentSection) sections.push(currentSection);
    return sections;
  };

  const getIconForSection = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("medication")) return <Pill className="w-5 h-5" />;
    if (t.includes("exercise")) return <Activity className="w-5 h-5" />;
    if (t.includes("health")) return <Heart className="w-5 h-5" />;
    return <Shield className="w-5 h-5" />;
  };

  return (
    <div className="flex flex-col w-full p-6 rounded-xl border border-border/80 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
        <div className="p-2 rounded-lg bg-primary/10">
          <ClipboardList className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold bg-gradient-to-r from-primary/80 to-secondary/80 bg-clip-text text-transparent">
          Personal Health Recommendations
        </h3>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center w-full py-16">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-secondary opacity-30 blur-sm animate-pulse" />
            <LoaderIcon className="w-10 h-10 animate-spin text-primary relative" />
          </div>
          <p className="text-sm text-muted-foreground font-medium mt-4">
            Analyzing your health data...
          </p>
        </div>
      ) : (
        <div className="flex flex-col w-full gap-6">
          {recommendations ? (
            parseRecommendations(recommendations).map((section, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-lg border border-border/50 bg-white/50 p-6 transition-all hover:shadow-md hover:scale-[1.02]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {section.icon}
                    </div>
                    <h4 className="text-lg font-semibold text-primary/80">
                      {section.title}
                    </h4>
                  </div>

                  <ul className="space-y-2">
                    {section.content.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-muted-foreground"
                      >
                        <AlertCircle className="w-4 h-4 mt-1 text-primary/60" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-3 rounded-full bg-destructive/10 mb-3">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-sm text-muted-foreground font-medium text-center">
                {error || "No recommendations available at the moment"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
